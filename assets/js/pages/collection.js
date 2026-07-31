/**
 * Collection browser — faceted filtering with URL state.
 *
 * Filter state lives in the query string so a filtered view is linkable and
 * survives a reload. Everything read back out of the URL is validated against
 * the known facet values before use; nothing from `location.search` reaches
 * the DOM as anything but a matched, known-good value.
 */

import { initShell } from '../ui/shell.js';
import { h, $, $$, render, icon, on } from '../core/dom.js';
import { INVENTORY, STATUS_LABEL, TIER_LABEL } from '../data/inventory.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { animalCard } from '../ui/animal-card.js';
import { mountScaleCanvases } from '../ui/scales.js';
import { rarityScore } from '../engine/valuation.js';
import { prefs } from '../core/store.js';

initShell();

/* ------------------------------------------------------------------ *
 * Facets
 * ------------------------------------------------------------------ */

const speciesInPlay = SPECIES.filter((s) => INVENTORY.some((a) => a.species === s.id));

const genesInPlay = [...new Set(INVENTORY.flatMap((a) => a.traits.map((t) => t.geneId)))]
  .map((id) => GENES_BY_ID[id])
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

const PRICE_BANDS = [
  { id: 'under-2k', label: 'Under $2,000', test: (a) => a.price != null && a.price < 2000 },
  { id: '2k-5k', label: '$2,000 – $5,000', test: (a) => a.price != null && a.price >= 2000 && a.price < 5000 },
  { id: '5k-10k', label: '$5,000 – $10,000', test: (a) => a.price != null && a.price >= 5000 && a.price < 10000 },
  { id: 'over-10k', label: '$10,000 and above', test: (a) => a.price != null && a.price >= 10000 },
  { id: 'poa', label: 'Price on application', test: (a) => a.price == null }
];

const FACETS = [
  {
    key: 'species', title: 'Species',
    options: speciesInPlay.map((s) => ({ id: s.id, label: s.common })),
    match: (a, v) => a.species === v
  },
  {
    key: 'status', title: 'Availability',
    options: ['available', 'reserved', 'hold', 'sold'].map((id) => ({ id, label: STATUS_LABEL[id] })),
    match: (a, v) => a.status === v
  },
  {
    key: 'tier', title: 'Tier',
    options: ['flagship', 'collector', 'foundation'].map((id) => ({ id, label: TIER_LABEL[id] })),
    match: (a, v) => a.tier === v
  },
  {
    key: 'sex', title: 'Sex',
    options: [{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }],
    match: (a, v) => a.sex === v
  },
  {
    key: 'price', title: 'Price',
    options: PRICE_BANDS.map((b) => ({ id: b.id, label: b.label })),
    match: (a, v) => PRICE_BANDS.find((b) => b.id === v)?.test(a) ?? false
  },
  {
    key: 'gene', title: 'Genetics',
    options: genesInPlay.map((g) => ({ id: g.id, label: g.name })),
    match: (a, v) => a.traits.some((t) => t.geneId === v)
  }
];

const FACET_BY_KEY = Object.fromEntries(FACETS.map((f) => [f.key, f]));
const VALID_SORTS = new Set(['featured', 'price-desc', 'price-asc', 'rarity', 'newest', 'weight', 'name']);

/* ------------------------------------------------------------------ *
 * State from URL — validated, never trusted
 * ------------------------------------------------------------------ */

function readState() {
  const params = new URLSearchParams(location.search);
  const selected = {};
  for (const facet of FACETS) {
    const raw = params.getAll(facet.key).flatMap((v) => v.split(','));
    const known = new Set(facet.options.map((o) => o.id));
    const valid = raw.filter((v) => known.has(v));
    if (valid.length) selected[facet.key] = new Set(valid);
  }
  const sortRaw = params.get('sort');
  const q = (params.get('q') || '').slice(0, 80);
  return {
    selected,
    sort: VALID_SORTS.has(sortRaw) ? sortRaw : 'featured',
    q
  };
}

let state = readState();
let layout = prefs.get('layout') || 'grid';

function writeState(replace = false) {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(state.selected)) {
    if (values.size) params.set(key, [...values].join(','));
  }
  if (state.sort !== 'featured') params.set('sort', state.sort);
  if (state.q) params.set('q', state.q);
  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
}

/* ------------------------------------------------------------------ *
 * Filtering
 * ------------------------------------------------------------------ */

function matchesQuery(animal, q) {
  if (!q) return true;
  const sp = SPECIES_BY_ID[animal.species];
  const hay = [
    animal.title, animal.sku, animal.sex, sp?.common, sp?.scientific,
    ...animal.traits.map((t) => GENES_BY_ID[t.geneId]?.name || '')
  ].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((term) => hay.includes(term));
}

function applyFilters(list) {
  return list.filter((a) => {
    if (!matchesQuery(a, state.q)) return false;
    for (const [key, values] of Object.entries(state.selected)) {
      if (!values.size) continue;
      const facet = FACET_BY_KEY[key];
      // Values within one facet are OR'd; separate facets are AND'd.
      if (![...values].some((v) => facet.match(a, v))) return false;
    }
    return true;
  });
}

/** Count for a facet option, holding the other facets fixed. */
function optionCount(facetKey, optionId) {
  const others = { ...state.selected };
  delete others[facetKey];
  const facet = FACET_BY_KEY[facetKey];
  return INVENTORY.filter((a) => {
    if (!matchesQuery(a, state.q)) return false;
    for (const [key, values] of Object.entries(others)) {
      if (!values.size) continue;
      if (![...values].some((v) => FACET_BY_KEY[key].match(a, v))) return false;
    }
    return facet.match(a, optionId);
  }).length;
}

const SORTERS = {
  featured: (a, b) =>
    Number(!!b.featured) - Number(!!a.featured) ||
    statusRank(a) - statusRank(b) ||
    (b.price || 0) - (a.price || 0),
  'price-desc': (a, b) => (b.price ?? Infinity) - (a.price ?? Infinity),
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  rarity: (a, b) => rarityScore(b.traits) - rarityScore(a.traits),
  newest: (a, b) => b.hatched.localeCompare(a.hatched),
  weight: (a, b) => b.weight - a.weight,
  name: (a, b) => a.title.localeCompare(b.title)
};

const statusRank = (a) => ({ available: 0, reserved: 1, hold: 2, sold: 3 })[a.status] ?? 4;

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */

const filtersHost = $('[data-filters]');
const resultsHost = $('[data-results]');
const countHost = $('[data-result-count]');
const activeHost = $('[data-active-filters]');

function renderFilters() {
  render(
    filtersHost,
    ...FACETS.map((facet) =>
      h(
        'div',
        { class: 'filter-group' },
        h('p', { class: 'filter-group__title', text: facet.title }),
        h(
          'div',
          { class: 'filter-group__options' },
          ...facet.options.map((opt) => {
            const count = optionCount(facet.key, opt.id);
            const checked = state.selected[facet.key]?.has(opt.id) || false;
            const input = h('input', {
              type: 'checkbox',
              checked: checked ? '' : null,
              disabled: count === 0 && !checked ? '' : null,
              on: {
                change: (e) => {
                  const set = state.selected[facet.key] || new Set();
                  e.target.checked ? set.add(opt.id) : set.delete(opt.id);
                  if (set.size) state.selected[facet.key] = set;
                  else delete state.selected[facet.key];
                  writeState();
                  update();
                }
              }
            });
            return h(
              'label',
              { class: 'check' },
              input,
              h('span', { text: opt.label }),
              h('span', { class: 'check__count', text: String(count) })
            );
          })
        )
      )
    )
  );
}

function renderActive() {
  const pills = [];
  for (const [key, values] of Object.entries(state.selected)) {
    const facet = FACET_BY_KEY[key];
    for (const v of values) {
      const opt = facet.options.find((o) => o.id === v);
      if (!opt) continue;
      pills.push(
        h(
          'span',
          { class: 'filter-pill' },
          h('span', { text: `${facet.title}: ${opt.label}` }),
          h(
            'button',
            {
              type: 'button',
              'aria-label': `Remove filter ${opt.label}`,
              on: {
                click: () => {
                  state.selected[key].delete(v);
                  if (!state.selected[key].size) delete state.selected[key];
                  writeState();
                  update();
                }
              }
            },
            icon('close')
          )
        )
      );
    }
  }
  if (state.q) {
    pills.push(
      h(
        'span',
        { class: 'filter-pill' },
        h('span', { text: `Search: ${state.q}` }),
        h('button', { type: 'button', 'aria-label': 'Clear search', on: { click: () => { state.q = ''; writeState(); update(); } } }, icon('close'))
      )
    );
  }
  render(activeHost, ...pills);
}

function renderResults(list) {
  if (!list.length) {
    render(
      resultsHost,
      h(
        'div',
        { class: 'empty' },
        h('p', { class: 'empty__title', text: 'Nothing matches those filters' }),
        h('p', { text: 'Loosen a facet, or tell us what you are looking for and we will source it.' }),
        h('a', { class: 'btn btn--primary', href: '/concierge.html', text: 'Private enquiry' })
      )
    );
    return;
  }
  const wrap = h('div', { class: layout === 'list' ? 'results--list' : 'grid grid--3' });
  for (const a of list) wrap.appendChild(animalCard(a, { layout }));
  render(resultsHost, wrap);
  mountScaleCanvases(resultsHost);
}

function update() {
  const list = applyFilters(INVENTORY).sort(SORTERS[state.sort] || SORTERS.featured);
  const available = list.filter((a) => a.status === 'available').length;

  render(
    countHost,
    h('strong', { class: 'num', text: String(list.length) }),
    ` animal${list.length === 1 ? '' : 's'}`,
    list.length ? ` · ${available} available now` : ''
  );

  renderFilters();
  renderActive();
  renderResults(list);
}

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */

const sortSelect = $('[data-sort]');
if (sortSelect) {
  sortSelect.value = state.sort;
  on(sortSelect, 'change', () => {
    if (!VALID_SORTS.has(sortSelect.value)) return;
    state.sort = sortSelect.value;
    writeState();
    update();
  });
}

$$('[data-layout]').forEach((btn) =>
  on(btn, 'click', () => {
    layout = btn.dataset.layout === 'list' ? 'list' : 'grid';
    prefs.set('layout', layout);
    $$('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    update();
  })
);
$$('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layout === layout)));

const clearBtn = $('[data-clear-filters]');
if (clearBtn) {
  on(clearBtn, 'click', () => {
    state = { selected: {}, sort: state.sort, q: '' };
    writeState();
    update();
  });
}

on(window, 'popstate', () => {
  state = readState();
  if (sortSelect) sortSelect.value = state.sort;
  update();
});

update();
