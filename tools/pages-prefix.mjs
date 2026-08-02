/**
 * Prefix root-relative browser URLs for a GitHub Pages project site.
 *
 * The production source intentionally targets the domain root. GitHub project
 * Pages serves the same files below /<repository>/, so the deployment workflow
 * runs this against its disposable artifact rather than changing source files.
 *
 * WHAT GETS REWRITTEN, AND WHY IT IS NOT ONE REGEX
 *
 *  - HTML/JS/webmanifest: any quoted root-relative URL. Template literals count
 *    — `/animal.html?id=${id}` is just as much a link as '/animal.html', and
 *    missing them silently 404s every generated link on the deployed site.
 *
 *  - CSS: only url(). A blanket quoted-slash rewrite would corrupt the inline
 *    SVG data URIs (…'/%3E%3C/svg%3E…) and the breadcrumb's content: '/'.
 *
 * A residual scan runs afterwards and fails the build if any root-relative
 * asset reference survived, because the failure mode otherwise is a deployed
 * site that looks fine until you click something.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join, extname, relative } from 'node:path';

const target = resolve(process.argv[2] || '');
const prefixArg = process.argv[3] || '';
const prefix = `/${prefixArg.replace(/^\/+|\/+$/g, '')}/`;
const MARKUP = new Set(['.html', '.js', '.webmanifest']);
const STYLES = new Set(['.css']);

if (!process.argv[2] || !prefixArg || prefix === '//') {
  console.error('Usage: node tools/pages-prefix.mjs <artifact-directory> <path-prefix>');
  process.exit(1);
}

/** Quoted root-relative URL. Backticks included: template literals are URLs too. */
const QUOTED = /(["'`])\/(?!\/)/g;
/** url(/x), url('/x'), url("/x") — but never url(#id) or url(data:…). */
const CSS_URL = /url\(\s*(['"]?)\/(?!\/)/g;

let changed = 0;
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    if (statSync(file).isDirectory()) {
      walk(file);
      continue;
    }
    const ext = extname(file);
    if (!MARKUP.has(ext) && !STYLES.has(ext)) continue;
    files.push(file);

    const before = readFileSync(file, 'utf8');
    const after = MARKUP.has(ext)
      ? before.replace(QUOTED, `$1${prefix}`)
      : before.replace(CSS_URL, `url($1${prefix}`);
    if (after !== before) {
      writeFileSync(file, after, 'utf8');
      changed++;
    }
  }
}

walk(target);
console.log(`prefixed ${changed} file(s) with ${prefix}`);

/* ---- Residual scan: anything root-relative that still points at the site ---- */

const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RESIDUAL = new RegExp(
  // A quote or url( followed by a root-relative path into the site, where what
  // follows is not already the prefix.
  `(?:["'\`]|url\\(\\s*['"]?)\\/(?!\\/)(?!${escaped.slice(1)})(?:assets\\/|tools\\/|[a-z0-9-]+\\.html)`,
  'g'
);

const missed = [];
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(RESIDUAL)) {
    const line = src.slice(0, m.index).split('\n').length;
    missed.push(`${relative(target, file).replace(/\\/g, '/')}:${line}  ${m[0]}`);
  }
}

if (missed.length) {
  console.error(`\n${missed.length} root-relative reference(s) survived prefixing:`);
  for (const m of missed.slice(0, 25)) console.error(`  ${m}`);
  if (missed.length > 25) console.error(`  …and ${missed.length - 25} more`);
  process.exit(1);
}

console.log(`residual scan clean across ${files.length} file(s)`);
