/** Valuation Index. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, fieldNumber, toolPanel, methodology, statBlock } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID, genesForSpecies } from '../data/genes.js';
import { valuate, QUALITY_GRADES, rarityScore } from '../engine/valuation.js';
import { money } from '../core/format.js';

initShell();

const state = {
  species: 'ball-python',
  traits: [],
  sex: 'female',
  weight: 800,
  quality: 'typical',
  proven: false
};

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');

function renderControls() {
  const sp = SPECIES_BY_ID[state.species];

  render(
    controls,
    toolPanel(
      'The animal',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldSelect({
          label: 'Species',
          options: SPECIES.map((s) => [s.id, s.common]),
          value: state.species,
          onChange: (v) => {
            state.species = v;
            state.traits = [];
            state.weight = Math.round((SPECIES_BY_ID[v].maturityWeight || 1000) * 0.6);
            update();
          }
        }),
        fieldSelect({
          label: 'Sex',
          options: [['female', 'Female'], ['male', 'Male'], ['unsexed', 'Unsexed / hatchling']],
          value: state.sex,
          onChange: (v) => { state.sex = v; update(); }
        }),
        fieldNumber({
          label: 'Weight', suffix: 'grams',
          value: state.weight, min: 5, max: 60000, step: 5,
          hint: `Adult for this species is around ${sp.maturityWeight} g.`,
          onChange: (n) => { state.weight = n; update(false); }
        }),
        fieldSelect({
          label: 'Expression quality',
          options: QUALITY_GRADES.map((q) => [q.id, q.label]),
          value: state.quality,
          hint: QUALITY_GRADES.find((q) => q.id === state.quality)?.note,
          onChange: (v) => { state.quality = v; update(); }
        }),
        h(
          'label',
          { class: 'check' },
          h('input', { type: 'checkbox', checked: state.proven ? '' : null, on: { change: (e) => { state.proven = e.target.checked; update(false); } } }),
          h('span', { text: 'Proven breeder' })
        )
      )
    ),
    toolPanel(
      'Genetics',
      state.traits.length
        ? h('div', { class: 'trait-list', style: { 'margin-bottom': '.75rem' } }, ...state.traits.map(traitRow))
        : h('p', { class: 'field__hint', style: { 'margin-bottom': '.75rem' }, text: 'Wild-type. Add genes below.' }),
      geneSearch()
    )
  );
}

function traitRow(trait, index) {
  const gene = GENES_BY_ID[trait.geneId];
  if (!gene) return null;
  const isRec = gene.inheritance === 'recessive';
  const mendelian = gene.inheritance !== 'polygenic' && gene.inheritance !== 'locality';

  return h(
    'div',
    { class: 'trait-row' },
    h('span', { class: 'trait-row__name', text: gene.name }),
    mendelian
      ? h(
          'div',
          { class: 'segmented', role: 'group', 'aria-label': `${gene.name} zygosity` },
          h('button', { type: 'button', text: isRec ? 'het' : '1', 'aria-pressed': String(trait.zygosity === 'het'), on: { click: () => { trait.zygosity = 'het'; update(); } } }),
          h('button', { type: 'button', text: isRec ? 'visual' : 'super', 'aria-pressed': String(trait.zygosity === 'homo'), on: { click: () => { trait.zygosity = 'homo'; update(); } } })
        )
      : null,
    h(
      'button',
      { class: 'icon-btn', type: 'button', style: { width: '1.75rem', height: '1.75rem' }, 'aria-label': `Remove ${gene.name}`,
        on: { click: () => { state.traits.splice(index, 1); update(); } } },
      icon('close')
    )
  );
}

function geneSearch() {
  const results = h('div', { class: 'gene-search-results' });
  const input = h('input', {
    class: 'input', type: 'search', placeholder: 'Add a gene…', 'aria-label': 'Add a gene', autocomplete: 'off',
    on: { input: (e) => draw(e.target.value), focus: (e) => draw(e.target.value) }
  });

  function draw(q) {
    const query = q.trim().toLowerCase();
    const taken = new Set(state.traits.map((t) => t.geneId));
    const pool = genesForSpecies(state.species)
      .filter((g) => !taken.has(g.id))
      .filter((g) => !query || g.name.toLowerCase().includes(query))
      .slice(0, 40);
    render(
      results,
      ...pool.map((g) =>
        h('button', { class: 'gene-option', type: 'button',
          on: { click: () => { state.traits.push({ geneId: g.id, zygosity: 'het' }); update(); } } },
          h('span', { text: g.name }),
          h('span', { class: 'gene-option__meta', text: `×${g.mult || 1}` })
        )
      )
    );
  }

  return h('div', { class: 'field' }, input, results);
}

function renderOutput() {
  let v;
  try {
    v = valuate({ species: state.species, traits: state.traits, sex: state.sex, weight: state.weight, quality: state.quality, proven: state.proven });
  } catch (err) {
    render(output, h('div', { class: 'notice notice--critical' }, icon('alert', 'notice__icon'), h('span', { text: err.message })));
    return;
  }

  const CONFIDENCE_NOTE = {
    high: 'Few genes, deep comparable data. This figure should be close.',
    moderate: 'Enough complexity that comparables thin out. Treat the band, not the midpoint, as the answer.',
    indicative: 'Highly specific combination with few or no direct comparables. This is an order-of-magnitude estimate.'
  };

  render(
    output,
    h(
      'div',
      { class: 'panel', style: { 'text-align': 'center' } },
      h('p', { class: 'eyebrow eyebrow--muted', text: 'Estimated market value' }),
      h('p', { style: { 'font-family': 'var(--font-display)', 'font-size': 'var(--t-3xl)', 'letter-spacing': '-.035em', 'line-height': '1', margin: '1rem 0' }, class: 'num', text: money(v.point) }),
      h('p', { class: 'text-muted', text: `Range ${money(v.low)} – ${money(v.high)}` }),
      h('p', { class: 'stat__note', style: { 'margin-top': '.75rem' }, text: `Confidence: ${v.confidence} · ${CONFIDENCE_NOTE[v.confidence]}` })
    ),

    statBlock([
      [money(v.base), 'Species base', 'Wild-type, adult, average'],
      [`×${v.geneFactor}`, 'Genetics', `${v.breakdown.length} trait${v.breakdown.length === 1 ? '' : 's'}`],
      [`×${v.sexFactor}`, 'Sex', state.sex],
      [`×${v.maturityFactor}`, 'Maturity', 'Established weight'],
      [`×${v.qualityFactor}`, 'Expression', state.quality],
      [`${rarityScore(state.traits)}/10`, 'Rarity index', '']
    ]),

    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '1.5rem' } },
      icon('info', 'notice__icon'),
      h('span', {}, h('strong', { text: `Liquidity: ${v.liquidity.level}. ` }), v.liquidity.note)
    ),

    v.breakdown.length
      ? h(
          'section',
          { style: { 'margin-top': '3rem' } },
          h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'How the genetics were weighted' }),
          h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
            text: 'Genes are ranked by raw multiplier, then each successive one is raised to a decaying exponent. The headline gene carries almost its full value; the fifth contributes a fraction of its nominal figure. This is what stops a six-gene animal being valued at a number nobody would pay.' }),
          h(
            'div',
            { class: 'scroll-x' },
            h(
              'table',
              { class: 'table' },
              h('thead', {}, h('tr', {},
                h('th', { text: '#' }), h('th', { text: 'Trait' }), h('th', { text: 'Form' }),
                h('th', { class: 'num', text: 'Raw' }), h('th', { class: 'num', text: 'Applied' })
              )),
              h('tbody', {}, ...v.breakdown.map((b) =>
                h('tr', {},
                  h('td', { class: 'num', text: String(b.position) }),
                  h('td', { text: b.label }),
                  h('td', { class: 'text-muted', text: b.kind }),
                  h('td', { class: 'num', text: `×${b.multiplier.toFixed(2)}` }),
                  h('td', { class: 'num', style: { color: 'var(--brass)' }, text: `×${b.applied.toFixed(2)}` })
                )
              ))
            )
          )
        )
      : null,

    methodology('How this model works, and where it fails', [
      'Value starts from a species base — the figure a wild-type adult of that species commands — and is scaled by genetics, sex, maturity and expression quality. Females carry a premium in every species we handle because they are the production bottleneck.',
      'The genetic component is the part most estimators get wrong. Multiplying every gene multiplier together implies the market pays multiplicatively for stacking, which it does not: a Pastel Enchi is not worth the product of a Pastel and an Enchi. This model sorts multipliers descending and raises each to a decaying exponent, so the dominant gene carries most of the value.',
      'It fails hardest on genuinely novel combinations with no comparables, on animals whose value is aesthetic rather than genetic — a high-white Piebald is priced on its expression, not its genotype — and on anything where a single buyer sets the market. The confidence rating flags the first case; the quality control handles the second; nothing handles the third.',
      'This is an estimator, not an appraisal, and it has no knowledge of what anyone has actually paid. Use it to sanity-check a figure, not to justify one.'
    ])
  );
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

state.weight = Math.round((SPECIES_BY_ID[state.species].maturityWeight || 1000) * 0.6);
update();
