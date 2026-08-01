/**
 * Stamps sw.js with a cache version derived from the assets it precaches.
 *
 * WHY THIS EXISTS
 *
 * The service worker serves CSS and JS cache-first. That is the right strategy
 * for static assets — but only if the cache name changes when the assets do.
 * With a hardcoded `VERSION = 'v1'` it never did, which meant a returning
 * visitor kept the stylesheet they first downloaded and never saw another
 * change. It cost real debugging time when a footer restyle appeared to have
 * no effect; the CSS had shipped, the browser was just refusing to look at it.
 *
 * Hashing the actual asset contents means any change to CSS or JS produces a
 * new cache name, `activate` deletes the previous caches, and the update
 * propagates on the next load. No change means no churn.
 *
 * Runs as part of `npm run build`.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SW = join(ROOT, 'sw.js');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/* Everything the worker may hand back from cache. */
const tracked = [
  ...walk(join(ROOT, 'assets', 'css')),
  ...walk(join(ROOT, 'assets', 'js'))
].filter((f) => ['.css', '.js'].includes(extname(f)));

const hash = createHash('sha256');
for (const f of tracked) {
  hash.update(f.replace(ROOT, '').replace(/\\/g, '/'));
  hash.update(readFileSync(f));
}
const version = hash.digest('hex').slice(0, 12);

const src = readFileSync(SW, 'utf8');
const next = src.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);

if (next === src && !src.includes(`'${version}'`)) {
  console.error('stamp-sw: could not find the VERSION declaration in sw.js');
  process.exit(1);
}

if (next !== src) {
  writeFileSync(SW, next, 'utf8');
  console.log(`sw.js cache version -> ${version}  (${tracked.length} assets hashed)`);
} else {
  console.log(`sw.js cache version unchanged (${version})`);
}
