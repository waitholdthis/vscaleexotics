/**
 * Homepage.
 */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { INVENTORY } from '../data/inventory.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { JOURNAL } from '../data/journal.js';
import { TOOLS } from '../core/sitemap.js';
import { animalCard } from '../ui/animal-card.js';
import { makeAnimalCanvas, mountScaleCanvases } from '../ui/scales.js';
import { initHero } from '../ui/hero.js';
import { date, lengthRange, money } from '../core/format.js';
import { buildParent, cross, formatPercent } from '../engine/genetics.js';

initShell();

/* ---------- Hero ---------- */

const heroAnimals = INVENTORY.filter((a) => a.featured && a.status !== 'sold');
initHero($('.hero'), heroAnimals.length ? heroAnimals : INVENTORY.slice(0, 4));

/* ---------- Marquee ---------- */

const MARQUEE = [
  'Captive bred, four generations minimum',
  'Genetics documented to the locus',
  'Live arrival guaranteed',
  'FedEx Priority Overnight only',
  'CITES export handled in house',
  'Seventeen years of unbroken records',
  'No Spider-complex animals, ever',
  'Worldwide placement'
];
const track = $('[data-marquee]');
if (track) {
  // Duplicated once so the -50% translate loops seamlessly.
  const items = [...MARQUEE, ...MARQUEE].map((t) => h('span', { class: 'marquee__item', text: t }));
  render(track, ...items);
}

/* ---------- Flagship grid ---------- */

const featuredGrid = $('[data-featured-grid]');
if (featuredGrid) {
  const picks = INVENTORY.filter((a) => a.featured).slice(0, 6);
  render(featuredGrid, ...picks.map((a) => animalCard(a)));
}

/* ---------- Feature canvas ---------- */

for (const el of document.querySelectorAll('[data-feature-canvas]')) {
  const animal = INVENTORY.find((a) => a.id === el.dataset.featureCanvas);
  if (!animal) continue;
  const sp = SPECIES_BY_ID[animal.species];
  const canvas = makeAnimalCanvas(animal, sp, GENES_BY_ID, { width: 900, height: 720, detail: 'card' });
  el.replaceWith(canvas);
}

/* ---------- Tools grid ---------- */

const toolsGrid = $('[data-tools-grid]');
if (toolsGrid) {
  render(
    toolsGrid,
    ...TOOLS.map((t) =>
      h(
        'a',
        { class: 'tool-card', href: t.href },
        h('span', { class: 'tool-card__icon' }, icon(t.icon || 'arrow')),
        h('h3', { text: t.label }),
        h('p', { text: t.blurb || '' })
      )
    )
  );
}

/* ---------- Gene Lab demo ---------- */

const demo = $('[data-demo-outcomes]');
if (demo) {
  try {
    const sire = buildParent(
      [{ geneId: 'pastel', zygosity: 'het' }, { geneId: 'mojave', zygosity: 'het' }, { geneId: 'clown', zygosity: 'het' }],
      'Sire'
    );
    const dam = buildParent([{ geneId: 'enchi', zygosity: 'het' }, { geneId: 'clown', zygosity: 'het' }], 'Dam');
    const result = cross(sire, dam, { clutchSize: 8 });

    render(
      demo,
      ...result.visualView.slice(0, 6).map((o) =>
        h(
          'div',
          { class: 'outcome' },
          h(
            'div',
            {},
            h('p', { class: 'outcome__name', text: o.visibleName }),
            o.possibleHets.length
              ? h('p', {
                  class: 'outcome__hets',
                  text: o.possibleHets.map((x) => `${formatPercent(x.chance, 0)} possible het ${x.name}`).join(' · ')
                })
              : null
          ),
          h('p', { class: 'outcome__p num', text: formatPercent(o.probability) }),
          h('span', { class: 'pbar outcome__bar' }, h('span', { class: 'pbar__fill', style: { '--p': `${(o.probability * 100).toFixed(2)}%` } }))
        )
      ),
      h('p', {
        class: 'stat__note',
        style: { 'margin-top': '.75rem' },
        text: `+ ${result.visualView.length - 6} further outcomes`
      })
    );
  } catch (err) {
    // A demo failing must never break the page.
    render(demo, h('p', { class: 'text-muted', text: 'Open the Gene Lab to run this pairing.' }));
    console.warn(err);
  }
}

/* ---------- Species grid ---------- */

const speciesGrid = $('[data-species-grid]');
if (speciesGrid) {
  const counts = {};
  for (const a of INVENTORY) if (a.status === 'available') counts[a.species] = (counts[a.species] || 0) + 1;

  render(
    speciesGrid,
    ...SPECIES.map((sp) =>
      h(
        'a',
        { class: 'tool-card', href: `/collection.html?species=${encodeURIComponent(sp.id)}` },
        h('p', { class: 'card__meta', text: `${counts[sp.id] || 0} available` }),
        h('h3', { text: sp.common }),
        h('p', { style: { 'font-style': 'italic', color: 'var(--muted-2)', 'font-size': 'var(--t-xs)' }, text: sp.scientific }),
        h('p', { text: `${lengthRange(sp.adultLength)} · from ${money(sp.basePrice)}` }),
        h(
          'div',
          { class: 'cluster cluster--tight', style: { 'margin-top': 'auto', 'padding-top': '.5rem' } },
          h('span', { class: 'card__meta', text: 'Difficulty' }),
          ...Array.from({ length: 5 }, (_, i) =>
            h('span', {
              style: {
                width: '14px', height: '3px', 'border-radius': '1px',
                background: i < sp.difficulty ? 'var(--brass)' : 'var(--line)'
              }
            })
          )
        )
      )
    )
  );
}

/* ---------- Journal ---------- */

const journalList = $('[data-journal-list]');
if (journalList) {
  render(
    journalList,
    ...JOURNAL.slice(0, 4).map((j) =>
      h(
        'a',
        { class: 'article-row', href: `/journal.html#${encodeURIComponent(j.id)}` },
        h('p', { class: 'article-row__date', text: date(j.date) }),
        h(
          'div',
          {},
          h('h3', { class: 'article-row__title', text: j.title }),
          h('p', { class: 'article-row__excerpt', text: j.excerpt })
        ),
        h('p', { class: 'article-row__tag', text: j.tag })
      )
    )
  );
}

mountScaleCanvases();
