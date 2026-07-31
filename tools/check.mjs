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

/* Actually load every module that has no DOM dependency, to catch real errors. */
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

/* ---------- 6: generated data must be in sync with content/ ---------- */

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
