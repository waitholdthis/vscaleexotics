/**
 * Generates sitemap.xml from the canonical site structure plus every animal
 * record, so a new animal is discoverable without anyone remembering to add it.
 */

import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const { allPages, SITE } = await import(pathToFileURL(join(ROOT, 'assets/js/core/sitemap.js')).href);
const { INVENTORY } = await import(pathToFileURL(join(ROOT, 'assets/js/data/inventory.js')).href);
const { GENES } = await import(pathToFileURL(join(ROOT, 'assets/js/data/genes.js')).href);

const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const urls = [];

for (const page of allPages()) {
  urls.push({
    loc: `${SITE.origin}${page.href === '/' ? '/' : page.href}`,
    priority: page.priority ?? 0.6,
    changefreq: page.priority >= 0.9 ? 'weekly' : 'monthly'
  });
}

// Animal records — the highest-value long-tail pages on the site.
for (const a of INVENTORY) {
  urls.push({
    loc: `${SITE.origin}/animal.html?id=${encodeURIComponent(a.id)}`,
    priority: a.status === 'available' ? 0.8 : 0.4,
    changefreq: 'weekly'
  });
}

// Gene reference deep links.
for (const g of GENES) {
  urls.push({
    loc: `${SITE.origin}/tools/codex.html?gene=${encodeURIComponent(g.id)}`,
    priority: 0.4,
    changefreq: 'yearly'
  });
}

const seen = new Set();
const unique = urls.filter((u) => (seen.has(u.loc) ? false : (seen.add(u.loc), true)));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`wrote sitemap.xml with ${unique.length} URLs`);
