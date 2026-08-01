/**
 * Pre-flight checks. No dependencies — reads the tree and validates it.
 *
 *  1. Every .js file parses as a module.
 *  2. Every relative import resolves to a file that exists.
 *  3. Every local href/src in the HTML resolves to a file that exists.
 *  4. Every page declares the meta we require (title, description, canonical,
 *     CSP, viewport) and wires up the shell hosts.
 *  5. No inline event handlers or inline <script> bodies, which would break
 *     under the CSP we ship.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const jsFiles = files.filter((f) => extname(f) === '.js' || extname(f) === '.mjs');
const htmlFiles = files.filter((f) => extname(f) === '.html');

const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');

/* ---------- 1 & 2: modules parse, imports resolve ---------- */

for (const file of jsFiles) {
  const src = readFileSync(file, 'utf8');

  const importRe = /(?:^|\n)\s*(?:import|export)[\s\S]{0,400}?from\s+['"]([^'"]+)['"]/g;
  const dynRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const re of [importRe, dynRe]) {
    let m;
    while ((m = re.exec(src))) {
      const spec = m[1];
      if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
      const base = spec.startsWith('/') ? ROOT : dirname(file);
      const target = resolve(base, spec.startsWith('/') ? `.${spec}` : spec);
      if (!existsSync(target)) {
        problems.push(`${rel(file)} → unresolved import "${spec}"`);
      }
    }
  }
}

/**
 * Parse every file. This used to be claimed but not done: only the modules
 * under data/ and engine/ were ever loaded, so a syntax error anywhere else —
 * including in the build tools themselves — got through. `--check` compiles
 * without evaluating, which is the only way to cover files that need a DOM or
 * that start a server on import.
 */
for (const file of jsFiles) {
  const { status, stderr } = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (status !== 0) {
    const line = (stderr || '').split('\n').find((l) => /Error/.test(l)) || 'syntax error';
    problems.push(`${rel(file)} → does not parse: ${line.trim()}`);
  }
}

/* Then load every module that has no DOM dependency, to catch real errors. */
const domFree = jsFiles.filter((f) => /\/(data|engine)\//.test(rel(f)));
for (const file of domFree) {
  try {
    await import(pathToFileURL(file).href);
  } catch (err) {
    problems.push(`${rel(file)} → failed to load: ${err.message}`);
  }
}

/* ---------- 3, 4, 5: HTML ---------- */

const REQUIRED_META = [
  { re: /<title>[^<]{10,}<\/title>/i, label: '<title>' },
  { re: /<meta\s+name="description"\s+content="[^"]{50,}"/i, label: 'meta description (50+ chars)' },
  { re: /<link\s+rel="canonical"/i, label: 'canonical link' },
  { re: /<meta\s+http-equiv="Content-Security-Policy"/i, label: 'CSP meta' },
  { re: /<meta\s+name="viewport"/i, label: 'viewport' },
  { re: /id="site-header-host"/, label: 'header host' },
  { re: /id="site-footer-host"/, label: 'footer host' },
  { re: /class="skip-link"/, label: 'skip link' },
  { re: /<body[^>]+data-page="/, label: 'body[data-page]' },
  { re: /<html lang="en">/, label: 'html lang' }
];

/**
 * The admin panel is a third-party application mounted on this origin, not a
 * page of the site. It has no shell, no canonical and a deliberately looser
 * CSP, so the page-shell requirements do not apply — but the inline-script and
 * broken-link checks below still do.
 */
const isAdmin = (f) => rel(f).startsWith('admin/');

for (const file of htmlFiles) {
  const src = readFileSync(file, 'utf8');
  const r = rel(file);

  if (!isAdmin(file)) {
    for (const { re, label } of REQUIRED_META) {
      if (!re.test(src)) problems.push(`${r} → missing ${label}`);
    }
  }

  // Inline handlers and inline script bodies break under our CSP.
  const onAttr = src.match(/\s on[a-z]+\s*=\s*"/gi);
  if (onAttr) problems.push(`${r} → ${onAttr.length} inline event handler attribute(s); CSP forbids these`);

  // Inline style ATTRIBUTES are governed by style-src, which has no
  // unsafe-inline — so browsers drop them silently, with no console error most
  // people would notice. Sixty of them shipped once and left several pages
  // rendering left-aligned and condensed. Use a class.
  for (const [, decl] of src.matchAll(/\sstyle="([^"]*)"/gi)) {
    problems.push(`${r} → inline style="${decl}" is dropped by our CSP; use a class`);
  }

  const inlineScript = [...src.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const [, attrs, body] of inlineScript) {
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) {
      try { JSON.parse(body); } catch (e) { problems.push(`${r} → invalid JSON-LD: ${e.message}`); }
      continue;
    }
    if (body.trim()) problems.push(`${r} → inline <script> body; CSP forbids these`);
  }

  // Local link/src targets must exist.
  const refs = [...src.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]);
  for (const ref of new Set(refs)) {
    if (ref === '/') continue;
    const target = join(ROOT, ref);
    if (!existsSync(target)) problems.push(`${r} → broken local reference "${ref}"`);
  }

  // Every module script should be type=module. The CMS bundle is a classic
  // script and legitimately is not.
  if (!isAdmin(file)) {
    const scripts = [...src.matchAll(/<script([^>]*\bsrc="[^"]+"[^>]*)>/gi)];
    for (const [, attrs] of scripts) {
      if (!/type\s*=\s*["']module["']/i.test(attrs)) warnings.push(`${r} → script without type="module"`);
    }
  }
}

/* ---------- 6: the CSP must be identical in all six places it lives ---------- */

/**
 * The policy is hand-copied into five server configs and every page's meta tag.
 * Nothing made them agree, and they had already drifted (one host was sending a
 * Cross-Origin-Embedder-Policy the other four were not). A policy that differs
 * by host is a policy nobody can reason about, so it gets compared here.
 *
 * Meta and header are not expected to be identical: a meta-delivered CSP is
 * required to ignore these directives, so they are stripped before comparing.
 */
const META_INVALID = /^(frame-ancestors|report-uri|report-to|sandbox)\b/;
const normCsp = (s) =>
  s.replace(/\s+/g, ' ').trim().replace(/;$/, '').split(';').map((d) => d.trim()).filter(Boolean).join('; ');
const metaEquivalent = (headerCsp) =>
  normCsp(headerCsp).split('; ').filter((d) => !META_INVALID.test(d)).join('; ');

/** @returns {[site: string, admin: string]} in source order. */
function extractCsp(file, re, transform = (m) => m[1]) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  const found = [...src.matchAll(re)].map((m) => normCsp(transform(m)));
  if (found.length !== 2) {
    problems.push(`${file} → expected 2 CSP declarations (site + /admin/), found ${found.length}`);
    return null;
  }
  return found;
}

const sources = {
  '_headers': extractCsp('_headers', /^\s*Content-Security-Policy:\s*(.+)$/gm),
  'nginx.conf': extractCsp('nginx.conf', /add_header Content-Security-Policy\s+"([^"]+)"/g),
  '.htaccess': extractCsp('.htaccess', /Header always set Content-Security-Policy\s+"([^"]+)"/g),
  'vercel.json': (() => {
    const cfg = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    const found = cfg.headers
      .flatMap((b) => b.headers.filter((kv) => kv.key === 'Content-Security-Policy'))
      .map((kv) => normCsp(kv.value));
    if (found.length !== 2) problems.push(`vercel.json → expected 2 CSP declarations, found ${found.length}`);
    return found.length === 2 ? found : null;
  })(),
  'tools/serve.mjs': extractCsp(
    'tools/serve.mjs',
    /const (?:ADMIN_)?CSP = \[([\s\S]*?)\]\.join/g,
    // Rebuild the array literal from its string entries rather than eval'ing it.
    (m) => [...m[1].matchAll(/(['"])((?:(?!\1).)*)\1/g)].map((s) => s[2]).join('; ')
  )
};

const canonical = sources['_headers'];
if (canonical) {
  for (const [name, got] of Object.entries(sources)) {
    if (!got) continue;
    for (const [i, label] of [[0, 'site'], [1, '/admin/']]) {
      if (got[i] === canonical[i]) continue;
      const a = new Set(canonical[i].split('; '));
      const b = new Set(got[i].split('; '));
      const missing = [...a].filter((d) => !b.has(d));
      const extra = [...b].filter((d) => !a.has(d));
      problems.push(
        `${name} → ${label} CSP differs from _headers` +
          (missing.length ? `; missing [${missing.join(', ')}]` : '') +
          (extra.length ? `; unexpected [${extra.join(', ')}]` : '')
      );
    }
  }

  const expectSite = metaEquivalent(canonical[0]);
  const expectAdmin = metaEquivalent(canonical[1]);
  for (const file of htmlFiles) {
    const m = readFileSync(file, 'utf8').match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    if (!m) continue; // absence is already reported by REQUIRED_META
    const want = isAdmin(file) ? expectAdmin : expectSite;
    const got = normCsp(m[1]);
    if (got !== want) {
      const a = new Set(want.split('; '));
      const b = new Set(got.split('; '));
      const missing = [...a].filter((d) => !b.has(d));
      const extra = [...b].filter((d) => !a.has(d));
      problems.push(
        `${rel(file)} → meta CSP does not match the header policy` +
          (missing.length ? `; missing [${missing.join(', ')}]` : '') +
          (extra.length ? `; unexpected [${extra.join(', ')}]` : '')
      );
    }
  }
}

/* ---------- 7: no JS path that CSP would silently discard ---------- */

/**
 * The mirror of the inline-style check above, for code rather than markup.
 *
 * `h({ style: {…} })` works under a style-src without 'unsafe-inline' only
 * because it calls setProperty() per declaration; CSP does not police the CSSOM
 * setters. Assigning a declaration STRING — setAttribute('style', …) or
 * .cssText — is parsed as an inline style and dropped, silently, across every
 * call site at once. innerHTML and friends are here for the same reason the
 * site has no innerHTML path at all: the guarantee is only worth having if
 * something enforces it.
 */
const FORBIDDEN_SINKS = [
  [/\.cssText\b/, "assigning .cssText is parsed as an inline style and dropped by our CSP; use el.style.setProperty()"],
  [/setAttribute\(\s*['"]style['"]/, "setAttribute('style', …) is dropped by our CSP; use el.style.setProperty()"],
  [/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML\(/, 'HTML sink; build nodes with h() from core/dom.js'],
  [/\bdocument\.write\b/, 'document.write is blocked and unsafe; build nodes with h()'],
  [/\beval\(|new Function\(/, "eval/Function are blocked by script-src without 'unsafe-eval'"]
];

// Comments legitimately name these sinks when explaining why they are absent.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

for (const file of jsFiles.filter((f) => rel(f).startsWith('assets/js/'))) {
  const src = stripComments(readFileSync(file, 'utf8'));
  for (const [re, why] of FORBIDDEN_SINKS) {
    if (re.test(src)) problems.push(`${rel(file)} → ${why}`);
  }
}

/* ---------- 8: generated data must be in sync with content/ ---------- */

if (existsSync(join(ROOT, 'content'))) {
  const generated = ['species.js', 'genes.js', 'inventory.js', 'journal.js', 'site.js']
    .map((f) => join(ROOT, 'assets', 'js', 'data', f));

  const missing = generated.filter((f) => !existsSync(f));
  if (missing.length) {
    problems.push(`generated data missing: ${missing.map(rel).join(', ')} — run: node tools/build-data.mjs`);
  } else {
    // Rebuild into a scratch copy and compare. Anything other than an exact
    // match means someone hand-edited a generated file, or edited content/
    // without rebuilding — either way the live site would not match the CMS.
    const before = generated.map((f) => readFileSync(f, 'utf8'));
    const { status, stderr } = spawnSync(process.execPath, [join(ROOT, 'tools', 'build-data.mjs')], {
      cwd: ROOT,
      encoding: 'utf8'
    });

    if (status !== 0) {
      problems.push(`content/ failed validation — run \`node tools/build-data.mjs\` to see why`);
      if (stderr) problems.push(...stderr.trim().split('\n').filter((l) => l.trim().startsWith('✗')).map((l) => `  ${l.trim()}`));
    } else {
      const after = generated.map((f) => readFileSync(f, 'utf8'));
      const stale = generated.filter((_, i) => before[i] !== after[i]);
      if (stale.length) {
        // Put the freshly built version back — check should not silently
        // mutate the tree, but it also should not leave it half-rebuilt.
        problems.push(
          `generated data is out of sync with content/: ${stale.map(rel).join(', ')}. ` +
            `Run \`node tools/build-data.mjs\` and commit the result.`
        );
      }
    }
  }
}

/* ---------- report ---------- */

console.log(`checked ${jsFiles.length} modules, ${htmlFiles.length} pages\n`);
if (warnings.length) {
  console.log('WARNINGS');
  warnings.forEach((w) => console.log('  ~ ' + w));
  console.log('');
}
if (problems.length) {
  console.log('PROBLEMS');
  problems.forEach((p) => console.log('  ✗ ' + p));
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('all checks passed');
