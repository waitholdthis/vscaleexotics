/** Morph Codex — searchable gene reference. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, toolPanel } from '../ui/controls.js';
import { GENES, GENES_BY_ID, LOCI_BY_ID } from '../data/genes.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { INVENTORY } from '../data/inventory.js';

initShell();

const INHERITANCE_LABEL = {
  recessive: 'Recessive',
  incdom: 'Co-dominant',
  dominant: 'Dominant',
  polygenic: 'Polygenic',
  locality: 'Locality'
};

const state = { species: 'all', inheritance: 'all', q: '', sort: 'name' };

const params = new URLSearchParams(location.search);
const targetGene = params.get('gene');
if (targetGene && GENES_BY_ID[targetGene]) {
  state.q = GENES_BY_ID[targetGene].name;
  state.species = GENES_BY_ID[targetGene].species;
}

const controls = $('[data-codex-controls]');
const results = $('[data-codex-results]');

/* ---------- how many animals carry each gene ---------- */
const carriedBy = {};
for (const a of INVENTORY) for (const t of a.traits) carriedBy[t.geneId] = (carriedBy[t.geneId] || 0) + 1;

function renderControls() {
  const searchInput = h('input', {
    class: 'input',
    type: 'search',
    value: state.q,
    placeholder: 'Search genes…',
    'aria-label': 'Search genes',
    on: { input: (e) => { state.q = e.target.value.slice(0, 60); renderResults(); } }
  });

  render(
    controls,
    toolPanel(
      'Filter',
      h(
        'div',
        { class: 'stack stack--sm' },
        h('div', { class: 'field' }, h('label', { class: 'field__label', text: 'Search' }), searchInput),
        fieldSelect({
          label: 'Species',
          options: [['all', 'All species'], ...SPECIES.map((s) => [s.id, s.common])],
          value: state.species,
          onChange: (v) => { state.species = v; renderResults(); }
        }),
        fieldSelect({
          label: 'Inheritance',
          options: [['all', 'All modes'], ...Object.entries(INHERITANCE_LABEL).map(([k, v]) => [k, v])],
          value: state.inheritance,
          onChange: (v) => { state.inheritance = v; renderResults(); }
        }),
        fieldSelect({
          label: 'Sort',
          options: [['name', 'Name, A–Z'], ['rarity', 'Rarity, high to low'], ['year', 'Year proven'], ['locus', 'Locus']],
          value: state.sort,
          onChange: (v) => { state.sort = v; renderResults(); }
        })
      )
    ),
    h(
      'div',
      { class: 'notice notice--note' },
      icon('info', 'notice__icon'),
      h('span', {}, h('strong', { text: 'Locus matters. ' }), 'Two genes sharing a locus cannot be inherited independently, and pairing them produces a named combination rather than a stack. Those relationships are listed on each card.')
    )
  );
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  let list = GENES.filter((g) => {
    if (state.species !== 'all' && g.species !== state.species) return false;
    if (state.inheritance !== 'all' && g.inheritance !== state.inheritance) return false;
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      (g.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
      (g.effect || '').toLowerCase().includes(q) ||
      (g.originator || '').toLowerCase().includes(q)
    );
  });

  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    rarity: (a, b) => (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name),
    year: (a, b) => (b.year || 0) - (a.year || 0) || a.name.localeCompare(b.name),
    locus: (a, b) => a.locus.localeCompare(b.locus) || a.name.localeCompare(b.name)
  };
  return list.sort(sorters[state.sort] || sorters.name);
}

function allelicSiblings(gene) {
  return GENES.filter((g) => g.locus === gene.locus && g.id !== gene.id);
}

function geneCard(g) {
  const sp = SPECIES_BY_ID[g.species];
  const siblings = allelicSiblings(g);
  const locus = LOCI_BY_ID[g.locus];
  const held = carriedBy[g.id] || 0;

  return h(
    'article',
    { class: `codex-card${g.id === targetGene ? ' is-target' : ''}`, id: `gene-${g.id}` },
    h(
      'div',
      { class: 'codex-card__head' },
      h('h3', { class: 'codex-card__name', text: g.name }),
      h('span', { class: `inherit-tag inherit-tag--${g.inheritance}`, text: INHERITANCE_LABEL[g.inheritance] })
    ),
    h('p', { class: 'card__meta', text: sp ? sp.common : '' }),
    h('p', { class: 'codex-card__effect', text: g.effect || '' }),

    g.superName && g.inheritance === 'incdom'
      ? h('p', { class: 'field__hint' }, h('strong', { text: 'Super form: ' }), g.superName)
      : null,

    siblings.length
      ? h(
          'p',
          { class: 'field__hint' },
          h('strong', { text: 'Allelic with: ' }),
          siblings.map((s) => s.name).join(', ')
        )
      : null,

    locus && locus.note ? h('p', { class: 'field__hint', style: { color: 'var(--brass)' }, text: locus.note }) : null,

    g.lethalityNote
      ? h('div', { class: 'notice notice--critical', style: { padding: '.6rem .75rem', 'font-size': 'var(--t-xs)' } },
          icon('alert', 'notice__icon'), h('span', { text: g.lethalityNote }))
      : null,

    h(
      'div',
      { class: 'codex-card__foot' },
      h('span', { text: `Rarity ${g.rarity || '—'}/10` }),
      g.year ? h('span', { text: String(g.year) }) : null,
      held ? h('a', { class: 'link', href: `/collection.html?gene=${encodeURIComponent(g.id)}`, text: `${held} held` }) : null
    ),
    g.originator ? h('p', { class: 'field__hint', text: `Proven by ${g.originator}` }) : null
  );
}

function renderResults() {
  const list = filtered();
  render(
    results,
    h(
      'p',
      { class: 'results-count', style: { 'margin-bottom': '1.5rem' } },
      h('strong', { class: 'num', text: String(list.length) }),
      ` gene${list.length === 1 ? '' : 's'}`
    ),
    list.length
      ? h('div', { class: 'codex-grid' }, ...list.map(geneCard))
      : h('div', { class: 'empty' },
          h('p', { class: 'empty__title', text: 'No genes match' }),
          h('p', { text: 'Try a different species or clear the search.' }))
  );

  if (targetGene) {
    const el = document.getElementById(`gene-${targetGene}`);
    if (el) el.scrollIntoView({ block: 'center', behavior: 'auto' });
  }
}

renderControls();
renderResults();
