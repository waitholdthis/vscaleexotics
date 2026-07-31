/**
 * Gene Lab — interactive multi-locus punnett.
 */

import { initShell, toast } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, fieldRange, toolPanel, noticeFor, methodology } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID, LOCI_BY_ID, genesForSpecies } from '../data/genes.js';
import { INVENTORY, INVENTORY_BY_ID } from '../data/inventory.js';
import { buildParent, cross, describeParent, formatPercent, asFraction, GeneticsError } from '../engine/genetics.js';
import { valuate } from '../engine/valuation.js';
import { money } from '../core/format.js';

initShell();

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const state = {
  species: 'ball-python',
  clutch: 6,
  view: 'visual',
  parents: [[], []] // arrays of {geneId, zygosity}
};

/** Preload a parent from ?sire=<animal id> / ?dam=<animal id>. */
(function preload() {
  const p = new URLSearchParams(location.search);
  for (const [key, slot] of [['sire', 0], ['dam', 1]]) {
    const id = p.get(key);
    if (!id || !Object.prototype.hasOwnProperty.call(INVENTORY_BY_ID, id)) continue;
    const a = INVENTORY_BY_ID[id];
    state.species = a.species;
    state.parents[slot] = a.traits
      .filter((t) => {
        const g = GENES_BY_ID[t.geneId];
        return g && g.inheritance !== 'polygenic' && g.inheritance !== 'locality';
      })
      .map((t) => ({ ...t }));
  }
})();

const controlsHost = $('[data-tool-controls]');
const outputHost = $('[data-tool-output]');

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */

function renderControls() {
  render(
    controlsHost,
    toolPanel(
      'Setup',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldSelect({
          label: 'Species',
          options: SPECIES.map((s) => [s.id, s.common]),
          value: state.species,
          onChange: (v) => {
            state.species = v;
            state.parents = [[], []];
            update();
          }
        }),
        fieldRange({
          label: 'Clutch / litter size',
          value: state.clutch,
          min: 1, max: 40,
          format: (n) => `${n} eggs`,
          onChange: (n) => { state.clutch = n; update(false); }
        })
      )
    ),
    parentPanel(0, 'Sire'),
    parentPanel(1, 'Dam'),
    loadPanel(),
    h(
      'button',
      { class: 'btn btn--ghost btn--block', type: 'button', on: { click: () => { state.parents = [[], []]; update(); } } },
      'Reset both parents'
    )
  );
}

function parentPanel(slot, label) {
  const traits = state.parents[slot];
  let parentDesc = '—';
  try {
    parentDesc = describeParent(buildParent(traits, label));
  } catch { parentDesc = 'Invalid combination'; }

  return h(
    'div',
    { class: 'parent-panel' },
    h(
      'div',
      { class: 'parent-panel__head' },
      h('span', { class: 'parent-panel__title', text: label }),
      traits.length
        ? h('button', { class: 'btn btn--sm btn--ghost', type: 'button', on: { click: () => { state.parents[slot] = []; update(); } } }, 'Clear')
        : null
    ),
    h(
      'div',
      { class: 'parent-panel__body' },
      h('p', { class: 'parent-panel__pheno', text: parentDesc }),
      traits.length
        ? h('div', { class: 'trait-list' }, ...traits.map((t, i) => traitRow(slot, t, i)))
        : h('p', { class: 'field__hint', text: 'Wild-type. Add genes below.' }),
      geneSearch(slot)
    )
  );
}

function traitRow(slot, trait, index) {
  const gene = GENES_BY_ID[trait.geneId];
  if (!gene) return null;

  const isRec = gene.inheritance === 'recessive';
  const hetLabel = isRec ? 'het' : '1 copy';
  const homoLabel = isRec ? 'visual' : 'super';

  const seg = h(
    'div',
    { class: 'segmented', role: 'group', 'aria-label': `${gene.name} zygosity` },
    h('button', {
      type: 'button', text: hetLabel,
      'aria-pressed': String(trait.zygosity === 'het'),
      on: { click: () => { trait.zygosity = 'het'; update(); } }
    }),
    h('button', {
      type: 'button', text: homoLabel,
      'aria-pressed': String(trait.zygosity === 'homo'),
      on: { click: () => { trait.zygosity = 'homo'; update(); } }
    })
  );

  return h(
    'div',
    { class: 'trait-row' },
    h('span', { class: 'trait-row__name', text: gene.name, title: gene.effect || '' }),
    seg,
    h(
      'button',
      {
        class: 'icon-btn', type: 'button', style: { width: '1.75rem', height: '1.75rem' },
        'aria-label': `Remove ${gene.name}`,
        on: { click: () => { state.parents[slot].splice(index, 1); update(); } }
      },
      icon('close')
    )
  );
}

function geneSearch(slot) {
  const results = h('div', { class: 'gene-search-results' });
  const input = h('input', {
    class: 'input',
    type: 'search',
    placeholder: 'Add a gene…',
    'aria-label': `Add a gene to parent ${slot + 1}`,
    autocomplete: 'off',
    on: {
      input: (e) => draw(e.target.value),
      focus: (e) => draw(e.target.value)
    }
  });

  function draw(q) {
    const query = q.trim().toLowerCase();
    const taken = new Set(state.parents[slot].map((t) => t.geneId));
    const pool = genesForSpecies(state.species)
      .filter((g) => g.inheritance !== 'polygenic' && g.inheritance !== 'locality')
      .filter((g) => !taken.has(g.id))
      .filter((g) => !query || g.name.toLowerCase().includes(query) || (g.aliases || []).some((a) => a.toLowerCase().includes(query)))
      .slice(0, 40);

    render(
      results,
      ...pool.map((g) =>
        h(
          'button',
          {
            class: 'gene-option', type: 'button',
            on: {
              click: () => {
                state.parents[slot].push({ geneId: g.id, zygosity: g.inheritance === 'recessive' ? 'het' : 'het' });
                update();
              }
            }
          },
          h('span', { text: g.name }),
          h('span', { class: 'gene-option__meta', text: g.inheritance === 'incdom' ? 'co-dom' : g.inheritance })
        )
      )
    );
  }

  return h('div', { class: 'field' }, input, results);
}

function loadPanel() {
  const available = INVENTORY.filter((a) => a.species === state.species);
  if (!available.length) return null;
  return toolPanel(
    'Load from the collection',
    h('p', { class: 'field__hint', style: { 'margin-bottom': '.75rem' }, text: 'Drop one of our animals into either slot to see what it produces against yours.' }),
    h(
      'div',
      { class: 'stack stack--sm' },
      ...[0, 1].map((slot) =>
        fieldSelect({
          label: slot === 0 ? 'Load as sire' : 'Load as dam',
          options: [['', '—'], ...available.map((a) => [a.id, `${a.sku} · ${a.title}`])],
          value: '',
          onChange: (id) => {
            if (!id || !INVENTORY_BY_ID[id]) return;
            const a = INVENTORY_BY_ID[id];
            state.parents[slot] = a.traits
              .filter((t) => {
                const g = GENES_BY_ID[t.geneId];
                return g && g.inheritance !== 'polygenic' && g.inheritance !== 'locality';
              })
              .map((t) => ({ ...t }));
            update();
            toast(`${a.title} loaded as ${slot === 0 ? 'sire' : 'dam'}.`, 'success');
          }
        })
      )
    )
  );
}

/* ------------------------------------------------------------------ *
 * Output
 * ------------------------------------------------------------------ */

function renderOutput() {
  let sire, dam, result;
  try {
    sire = buildParent(state.parents[0], 'Sire');
    dam = buildParent(state.parents[1], 'Dam');
    result = cross(sire, dam, { clutchSize: state.clutch });
  } catch (err) {
    render(
      outputHost,
      h(
        'div',
        { class: 'notice notice--critical' },
        icon('alert', 'notice__icon'),
        h('span', { text: err instanceof GeneticsError ? err.message : 'Could not calculate that pairing.' })
      )
    );
    return;
  }

  if (!state.parents[0].length && !state.parents[1].length) {
    render(
      outputHost,
      h(
        'div',
        { class: 'empty' },
        h('p', { class: 'empty__title', text: 'Build a pairing' }),
        h('p', { text: 'Add genes to the sire and dam on the left, or load one of our animals into a slot.' }),
        h(
          'div',
          { class: 'cluster', style: { 'justify-content': 'center', 'margin-top': '1rem' } },
          h('button', { class: 'btn btn--sm', type: 'button', on: { click: () => preset('clown') } }, 'Try het Clown × het Clown'),
          h('button', { class: 'btn btn--sm', type: 'button', on: { click: () => preset('bel') } }, 'Try Mojave × Lesser'),
          h('button', { class: 'btn btn--sm', type: 'button', on: { click: () => preset('spider') } }, 'Try Spider × Spider')
        )
      ),
      methodologyBlock()
    );
    return;
  }

  const rows = state.view === 'visual' ? result.visualView : result.genotypeView;

  render(
    outputHost,
    // Summary
    h(
      'div',
      { class: 'panel', style: { 'margin-bottom': '2rem' } },
      h(
        'div',
        { class: 'cluster cluster--between', style: { 'align-items': 'flex-start' } },
        h(
          'div',
          {},
          h('p', { class: 'eyebrow eyebrow--muted', text: 'Pairing' }),
          h('p', { style: { 'font-family': 'var(--font-display)', 'font-size': 'var(--t-lg)', 'margin-top': '.5rem', 'line-height': '1.2' },
            text: `${describeParent(sire)}  ×  ${describeParent(dam)}` })
        )
      ),
      h(
        'div',
        { class: 'stat-row' },
        stat(String(result.outcomeCount), 'Distinct outcomes'),
        stat(String(result.lociCount), 'Loci in play'),
        stat(String(state.clutch), 'Clutch size'),
        stat(result.nonViable > 0 ? formatPercent(result.nonViable) : '—', 'Non-viable')
      )
    ),

    // Warnings
    ...result.warnings.map((w) => h('div', { style: { 'margin-bottom': '1rem' } }, noticeFor(w.level, w.text))),
    ...result.lineNotes.map((n) => h('div', { style: { 'margin-bottom': '1rem' } }, noticeFor('note', n.text))),

    // View toggle
    h(
      'div',
      { class: 'cluster cluster--between', style: { 'margin': '2rem 0 1rem' } },
      h('h2', { style: { 'font-size': 'var(--t-lg)' }, text: state.view === 'visual' ? 'What you will see' : 'What the animals are' }),
      h(
        'div',
        { class: 'segmented', role: 'group', 'aria-label': 'Result view' },
        h('button', { type: 'button', text: 'Visual', 'aria-pressed': String(state.view === 'visual'), on: { click: () => { state.view = 'visual'; update(false); } } }),
        h('button', { type: 'button', text: 'Genotype', 'aria-pressed': String(state.view === 'genotype'), on: { click: () => { state.view = 'genotype'; update(false); } } })
      )
    ),

    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: state.view === 'visual'
        ? 'Grouped by what is actually distinguishable by eye. Hidden recessives are expressed as the conditional probability that an animal in that group carries one — this is where "66% possible het" comes from.'
        : 'Every distinct genotype, including hets you cannot see. Percentages are normalised against viable offspring only.' }),

    h('div', {}, ...rows.map((r) => outcomeRow(r, result))),

    valueSection(result),
    methodologyBlock()
  );
}

function outcomeRow(r, result) {
  const name = r.visibleName || r.label;
  const p = r.probability;
  return h(
    'div',
    { class: 'outcome' },
    h(
      'div',
      {},
      h('p', { class: 'outcome__name', text: name }),
      r.possibleHets && r.possibleHets.length
        ? h('p', { class: 'outcome__hets', text: r.possibleHets.map((x) => `${formatPercent(x.chance, 0)} possible het ${x.name}`).join(' · ') })
        : r.hets && r.hets.length
          ? h('p', { class: 'outcome__hets', text: `het ${r.hets.map((x) => x.name).join(', het ')}` })
          : null,
      h('p', { class: 'outcome__expect', text: `${asFraction(p)} · expect ${r.expected.toFixed(1)} in ${result.clutchSize} · ${formatPercent(r.atLeastOne, 0)} chance of at least one` })
    ),
    h('p', { class: 'outcome__p num', text: formatPercent(p) }),
    h('span', { class: 'pbar outcome__bar' }, h('span', { class: 'pbar__fill', style: { '--p': `${(p * 100).toFixed(2)}%` } }))
  );
}

function valueSection(result) {
  const sp = SPECIES_BY_ID[state.species];
  if (!sp) return null;

  // Estimate the clutch's indicative value from the visual outcomes.
  let total = 0;
  const lines = [];
  for (const v of result.visualView) {
    const traits = reconstructTraits(v);
    let est;
    try {
      est = valuate({ species: state.species, traits, sex: 'unsexed', weight: sp.maturityWeight * 0.12 });
    } catch { continue; }
    const count = v.probability * result.clutchSize;
    total += est.point * count;
    if (lines.length < 8) lines.push({ name: v.visibleName, count, unit: est.point });
  }

  if (!lines.length) return null;

  return h(
    'section',
    { style: { 'margin-top': '3rem' } },
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'Indicative clutch value' }),
    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: 'Expected value across the whole clutch at hatchling weight, unsexed. Treat this as an order-of-magnitude figure — actual realisation depends on expression quality, sex ratio and how patient you are.' }),
    h(
      'div',
      { class: 'scroll-x' },
      h(
        'table',
        { class: 'table' },
        h('thead', {}, h('tr', {},
          h('th', { text: 'Outcome' }),
          h('th', { class: 'num', text: 'Expected' }),
          h('th', { class: 'num', text: 'Est. each' }),
          h('th', { class: 'num', text: 'Subtotal' })
        )),
        h('tbody', {}, ...lines.map((l) =>
          h('tr', {},
            h('td', { text: l.name }),
            h('td', { class: 'num', text: l.count.toFixed(1) }),
            h('td', { class: 'num', text: money(l.unit) }),
            h('td', { class: 'num', text: money(l.unit * l.count) })
          )
        )),
        h('tfoot', {}, h('tr', {},
          h('th', { text: 'Clutch total' }), h('td', {}), h('td', {}),
          h('td', { class: 'num', style: { color: 'var(--brass)', 'font-weight': '600' }, text: money(total) })
        ))
      )
    ),
    h('p', { style: { 'margin-top': '1rem' } },
      h('a', { class: 'arrow-link', href: '/tools/valuation.html' }, 'Open the Valuation Index', icon('arrow')))
  );
}

/** Best-effort reverse of a visual phenotype label into traits, for valuation. */
function reconstructTraits(v) {
  const pool = genesForSpecies(state.species);
  const traits = [];
  const name = v.visibleName;
  for (const g of pool) {
    const superName = g.superName || `Super ${g.name}`;
    if (name.includes(superName)) traits.push({ geneId: g.id, zygosity: 'homo' });
    else if (new RegExp(`\\b${escapeRe(g.name)}\\b`).test(name)) {
      traits.push({ geneId: g.id, zygosity: g.inheritance === 'recessive' ? 'homo' : 'het' });
    }
  }
  for (const ph of v.possibleHets || []) {
    if (ph.chance >= 0.66 && !traits.some((t) => t.geneId === ph.geneId)) {
      traits.push({ geneId: ph.geneId, zygosity: 'het' });
    }
  }
  return traits;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function stat(v, k) {
  return h('div', { class: 'stat' }, h('span', { class: 'stat__v num', text: v }), h('span', { class: 'stat__k', text: k }));
}

function methodologyBlock() {
  const loci = [...new Set(genesForSpecies(state.species).map((g) => g.locus))]
    .map((id) => LOCI_BY_ID[id])
    .filter((l) => l && l.note);

  return h(
    'div',
    {},
    methodology('How this calculator works', [
      'Each gene is assigned to a locus. For every locus present in either parent, the two parental alleles are combined into the four equally likely offspring pairs, and those per-locus distributions are multiplied across loci. Aggregation happens on the resulting phenotype, not on the gene list, which is why allelic pairings collapse into their named combination forms.',
      'Genotypes that are not viable — Spider by Spider, Jaguar by Jaguar — are removed from the live clutch and reported separately. The remaining probabilities are then renormalised against surviving offspring, because that is what you will actually count in the incubator.',
      'The visual view groups outcomes by what is distinguishable by eye, then computes, for each hidden recessive, the probability that an animal in that group carries it. For a het by het pairing this yields 66.7% among the non-visual animals — the familiar "66% possible het", derived rather than hard-coded.',
      'Polygenic and locality traits are excluded from the punnett entirely and reported as line notes, because they do not segregate in Mendelian ratios and presenting them as if they did would be misleading.'
    ]),
    loci.length
      ? h(
          'details',
          { class: 'panel', style: { 'margin-top': '1rem' } },
          h('summary', { style: { cursor: 'pointer', 'font-family': 'var(--font-display)', 'font-size': 'var(--t-md)' }, text: `Allelic complexes in ${SPECIES_BY_ID[state.species].common}s` }),
          h('div', { class: 'specs', style: { 'margin-top': '1.25rem' } },
            ...loci.map((l) => h('div', { class: 'spec' },
              h('span', { class: 'spec__k', text: l.name }),
              h('span', { class: 'spec__v', text: l.note })
            ))
          )
        )
      : null
  );
}

function preset(kind) {
  state.species = 'ball-python';
  if (kind === 'clown') {
    state.parents = [[{ geneId: 'clown', zygosity: 'het' }], [{ geneId: 'clown', zygosity: 'het' }]];
  } else if (kind === 'bel') {
    state.parents = [[{ geneId: 'mojave', zygosity: 'het' }], [{ geneId: 'lesser', zygosity: 'het' }]];
  } else {
    state.parents = [[{ geneId: 'spider', zygosity: 'het' }], [{ geneId: 'spider', zygosity: 'het' }]];
  }
  update();
}

/* ------------------------------------------------------------------ */

function update(rebuildControls = true) {
  if (rebuildControls) renderControls();
  renderOutput();
}

update();
