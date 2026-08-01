/**
 * Prefix root-relative browser URLs for a GitHub Pages project site.
 *
 * The production source intentionally targets the domain root. GitHub project
 * Pages serves the same files below /<repository>/, so the deployment workflow
 * runs this against its disposable artifact rather than changing source files.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const target = resolve(process.argv[2] || '');
const prefixArg = process.argv[3] || '';
const prefix = `/${prefixArg.replace(/^\/+|\/+$/g, '')}/`;
const allowed = new Set(['.html', '.js', '.webmanifest']);

if (!process.argv[2] || !prefixArg || prefix === '//') {
  console.error('Usage: node tools/pages-prefix.mjs <artifact-directory> <path-prefix>');
  process.exit(1);
}

let changed = 0;
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    if (statSync(file).isDirectory()) {
      walk(file);
      continue;
    }
    if (!allowed.has(extname(file))) continue;

    const before = readFileSync(file, 'utf8');
    // Match quoted root-relative URLs, but leave protocol-relative URLs alone.
    const after = before.replace(/(["'])\/(?!\/)/g, `$1${prefix}`);
    if (after !== before) {
      writeFileSync(file, after, 'utf8');
      changed++;
    }
  }
}

walk(target);
console.log(`prefixed ${changed} file(s) with ${prefix}`);
