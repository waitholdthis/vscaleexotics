/** Side-by-side comparison. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { INVENTORY_BY_ID, STATUS_LABEL, TIER_LABEL } from '../data/inventory.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { compare, subscribe } from '../core/store.js';
import { makeAnimalCanvas, mountScaleCanvases } from '../ui/scales.js';
import { geneChips } from '../ui/animal-card.js';
import { money, weightBoth, ageFrom, date, sexSymbol, dimensions, tempRange, lengthRange } from '../core/format.js';
import { rarityScore } from '../engine/valuation.js';
import { enclosureSpec, feedingPlan } from '../engine/husbandry.js';

initShell();

const host = $('[data-compare-root]');

const ROWS = [
  { k: 'Portrait', v: (a, sp) => makeAnimalCanvas(a, sp, GENES_BY_ID, { width: 360, height: 270, detail: 'card' }) },
  { k: 'SKU', v: (a) => a.sku },
  { k: 'Species', v: (a, sp) => sp.common },
  { k: 'Scientific', v: (a, sp) => h('em', { text: sp.scientific }) },
  { k: 'Status', v: (a) => h('span', { class: `badge badge--${a.status}` }, h('span', { class: 'badge__dot', 'aria-hidden': 'true' }), STATUS_LABEL[a.status]) },
  { k: 'Tier', v: (a) => TIER_LABEL[a.tier] || '—' },
  { k: 'Price', v: (a) => (a.price ? money(a.price) : 'On application') },
  { k: 'Sex', v: (a) => `${sexSymbol(a.sex)} ${a.sex}` },
  { k: 'Hatched', v: (a) => `${date(a.hatched)} · ${ageFrom(a.hatched)}` },
  { k: 'Weight', v: (a) => weightBoth(a.weight) },
  { k: 'Genetics', v: (a) => geneChips(a.traits, { link: true }) },
  { k: 'Rarity index', v: (a) => `${rarityScore(a.traits)} / 10` },
  { k: 'Generation', v: (a) => a.lineage?.generation || '—' },
  { k: 'Enclosure now', v: (a) => dimensions(enclosureSpec(a.species, a.weight).dimensions) },
  { k: 'Enclosure adult', v: (a) => dimensions(enclosureSpec(a.species, a.weight).adultDimensions) },
  { k: 'Warm side', v: (a, sp) => tempRange(sp.care.warmSide) },
  { k: 'Humidity', v: (a, sp) => `${sp.care.humidity[0]}–${sp.care.humidity[1]}%` },
  { k: 'Feeding', v: (a) => { const f = feedingPlan(a.species, a.weight); return f ? `${f.primary.label}, every ${f.interval}d` : '—'; } },
  { k: 'Adult length', v: (a, sp) => lengthRange(sp.adultLength) },
  { k: 'Lifespan', v: (a, sp) => `${sp.lifespan[0]}–${sp.lifespan[1]} years` },
  { k: 'Difficulty', v: (a, sp) => `${sp.difficulty} / 5` },
  { k: 'CITES', v: (a, sp) => sp.cites },
  {
    k: '', v: (a) =>
      h(
        'div',
        { class: 'stack stack--sm' },
        h('a', { class: 'btn btn--sm btn--primary btn--block', href: `/animal.html?id=${encodeURIComponent(a.id)}`, text: 'Full record' }),
        h('button', { class: 'btn btn--sm btn--ghost btn--block', type: 'button', on: { click: () => compare.remove(a.id) } }, 'Remove')
      )
  }
];

function paint() {
  const animals = compare.list().map((id) => INVENTORY_BY_ID[id]).filter(Boolean);

  if (!animals.length) {
    render(
      host,
      h(
        'div',
        { class: 'empty' },
        h('p', { class: 'empty__title', text: 'Nothing to compare yet' }),
        h('p', { text: `Add up to ${compare.max} animals from the collection using the layers icon on any card.` }),
        h('a', { class: 'btn btn--primary', href: '/collection.html', text: 'Browse the collection' })
      )
    );
    return;
  }

  const table = h(
    'table',
    { class: 'table compare-table' },
    h('tbody', {}, ...ROWS.map((row) =>
      h(
        'tr',
        {},
        h('th', { scope: 'row', text: row.k }),
        ...animals.map((a) => {
          const sp = SPECIES_BY_ID[a.species];
          const value = row.v(a, sp);
          return h('td', {}, value instanceof Node ? value : String(value));
        })
      )
    ))
  );

  render(
    host,
    h('p', { class: 'results-count', style: { 'margin-bottom': '1.5rem' } },
      h('strong', { class: 'num', text: String(animals.length) }), ` of ${compare.max} slots used`),
    h('div', { class: 'scroll-x' }, table),
    h(
      'div',
      { class: 'cluster', style: { 'margin-top': '2rem' } },
      h('a', { class: 'btn btn--primary', href: '/concierge.html', text: 'Enquire about these' }),
      h('button', { class: 'btn btn--ghost', type: 'button', on: { click: () => compare.clear() } }, icon('close'), 'Clear comparison')
    )
  );

  mountScaleCanvases(host);
}

paint();
subscribe('compare', paint);
