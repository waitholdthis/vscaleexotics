/** Feeding & Growth Planner. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon, svg as svgEl } from '../core/dom.js';
import { fieldSelect, fieldNumber, toolPanel, noticeFor, methodology, statBlock } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { feedingPlan, growthProjection } from '../engine/husbandry.js';
import { weightBoth, weight } from '../core/format.js';

initShell();

const params = new URLSearchParams(location.search);
const qSpecies = params.get('species');
const qWeight = Number(params.get('weight'));

const state = {
  species: SPECIES_BY_ID[qSpecies] ? qSpecies : 'ball-python',
  weight: Number.isFinite(qWeight) && qWeight > 0 && qWeight < 100000 ? qWeight : 800
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
            state.weight = Math.round((SPECIES_BY_ID[v].maturityWeight || 1000) * 0.5);
            update();
          }
        }),
        fieldNumber({
          label: 'Current weight', suffix: 'grams',
          value: state.weight, min: 5, max: 60000, step: 5,
          hint: `Weigh before feeding, not after. Adult for this species is around ${sp.maturityWeight} g.`,
          onChange: (n) => { state.weight = n; update(false); }
        })
      )
    ),
    h(
      'div',
      { class: 'notice notice--caution' },
      icon('alert', 'notice__icon'),
      h('span', {}, h('strong', { text: 'Width governs, not weight. ' }),
        'Prey should not exceed the widest point of the animal\'s body. The calculation below picks the item closest to a correct mass — check it against the animal before offering.')
    )
  );
}

function renderOutput() {
  const p = feedingPlan(state.species, state.weight);
  if (!p) { render(output, h('p', { text: 'Select a species.' })); return; }

  render(
    output,
    h(
      'div',
      { class: 'panel' },
      h('p', { class: 'eyebrow eyebrow--muted', text: `${p.species.common} · ${p.stage.label}` }),
      h('p', { style: { 'font-family': 'var(--font-display)', 'font-size': 'var(--t-2xl)', 'letter-spacing': '-.03em', margin: '.75rem 0 .5rem' }, text: p.primary.label }),
      h('p', { class: 'text-muted', text: `Every ${p.interval} days · ${p.primary.grams} g` }),
      h('p', { class: 'stat__note', style: { 'margin-top': '.75rem' },
        text: `Calculated target ${p.targetGrams} g, which is ${p.targetPercent}% of body mass for this species and stage.` })
    ),

    statBlock([
      [weightBoth(state.weight), 'Current weight', p.stage.label],
      [`${p.interval}d`, 'Interval', `${p.perMonth} feeds a month`],
      [String(p.annualPrey), 'Items a year', `${(p.annualPreyMass / 1000).toFixed(1)} kg of prey`],
      [`${p.targetPercent}%`, 'Of body mass', 'Per meal']
    ]),

    p.alternates.length
      ? h(
          'div',
          { style: { 'margin-top': '1.5rem' } },
          h('p', { class: 'field__label', style: { 'margin-bottom': '.5rem' }, text: 'Acceptable alternatives' }),
          h('div', { class: 'cluster cluster--tight' }, ...p.alternates.map((a) => h('span', { class: 'gene-chip', text: `${a.label} — ${a.grams} g` })))
        )
      : null,

    ...p.warnings.map((w) => h('div', { style: { 'margin-top': '1rem' } }, noticeFor(w.level, w.text))),

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.25rem' }, text: 'Projected growth' }),
    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: 'At this plan, on a logistic curve toward adult mass. A slower line than this is rarely a problem; a faster one usually means you are power-feeding, which shortens lifespan measurably.' }),
    growthChart(state.species, state.weight),

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.25rem' }, text: 'Rules that matter' }),
    h(
      'div',
      { class: 'stack stack--sm' },
      ...p.rules.map((r) => h('div', { class: 'notice' }, icon('check', 'notice__icon'), h('span', { text: r })))
    ),

    methodology('How prey size is calculated', [
      'Target prey mass is a species-appropriate share of body mass, adjusted for life stage. It is not a single percentage: heavy-bodied species take proportionally smaller meals than their mass suggests, and slow-metabolism arboreals such as emerald tree boas take considerably less again. A flat ten percent rule oversizes prey for a reticulated python by a factor of two.',
      'Neonates take proportionally more and adults proportionally less, following the falling metabolic demand of a growing animal. The result is capped at a sixth of body mass regardless of what the arithmetic produces, because no correctly sized meal is ever larger than that.',
      'The interval scales with life stage and species metabolism in the same way. Hognose feed considerably more often than the interval alone suggests they should, which is why they are so prone to obesity in captivity.',
      'The growth curve is logistic: growth rate falls as the animal approaches adult mass rather than continuing linearly. It assumes consistent feeding and correct temperatures, and it will overstate growth for any animal going through a seasonal fast.'
    ])
  );
}

function growthChart(species, current) {
  const months = 36;
  const data = growthProjection(species, current, months);
  const sp = SPECIES_BY_ID[species];
  const W = 640, H = 220, PAD = { l: 52, r: 16, t: 14, b: 26 };
  const maxG = Math.max(...data.map((d) => d.grams), sp.maturityWeight) * 1.08;

  const x = (m) => PAD.l + (m / months) * (W - PAD.l - PAD.r);
  const y = (g) => H - PAD.b - (g / maxG) * (H - PAD.t - PAD.b);
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(d.month).toFixed(1)} ${y(d.grams).toFixed(1)}`).join(' ');

  return h(
    'div',
    { class: 'chart' },
    svgEl(
      'svg',
      { viewBox: `0 0 ${W} ${H}`, role: 'img',
        'aria-label': `Projected growth from ${weight(current)} to ${weight(data[data.length - 1].grams)} over ${months} months.` },
      svgEl('defs', {}, svgEl('linearGradient', { id: 'gFill', x1: '0', y1: '0', x2: '0', y2: '1' },
        svgEl('stop', { offset: '0%', 'stop-color': '#c6a15b', 'stop-opacity': '.25' }),
        svgEl('stop', { offset: '100%', 'stop-color': '#c6a15b', 'stop-opacity': '0' }))),
      svgEl('g', { class: 'chart__grid' },
        ...[0, 0.25, 0.5, 0.75, 1].map((f) => svgEl('line', { x1: PAD.l, x2: W - PAD.r, y1: y(maxG * f), y2: y(maxG * f) }))),
      svgEl('g', { class: 'chart__axis' },
        ...[0.25, 0.5, 0.75, 1].map((f) => svgEl('text', { x: PAD.l - 8, y: y(maxG * f) + 3, 'text-anchor': 'end' }, String(Math.round(maxG * f)))),
        ...[0, 12, 24, 36].map((m) => svgEl('text', { x: x(m), y: H - 8, 'text-anchor': m === 0 ? 'start' : m === 36 ? 'end' : 'middle' }, `${m}mo`))),
      svgEl('line', { x1: PAD.l, x2: W - PAD.r, y1: y(sp.maturityWeight), y2: y(sp.maturityWeight), stroke: '#7fe3a0', 'stroke-width': '1', 'stroke-dasharray': '4 4', opacity: '.6' }),
      svgEl('text', { x: W - PAD.r, y: y(sp.maturityWeight) - 5, 'text-anchor': 'end', fill: '#7fe3a0', 'font-size': '9', 'font-family': 'monospace' }, 'adult mass'),
      svgEl('path', { class: 'chart__area', fill: 'url(#gFill)', d: `${path} L${x(months)} ${y(0)} L${x(0)} ${y(0)} Z` }),
      svgEl('path', { class: 'chart__line', d: path })
    ),
    h(
      'div',
      { class: 'scroll-x', style: { 'margin-top': '1.5rem' } },
      h('table', { class: 'table table--compact' },
        h('thead', {}, h('tr', {}, h('th', { text: 'Month' }), ...[6, 12, 18, 24, 36].map((m) => h('th', { class: 'num', text: String(m) })))),
        h('tbody', {}, h('tr', {},
          h('td', { text: 'Projected' }),
          ...[6, 12, 18, 24, 36].map((m) => h('td', { class: 'num', text: weight(data[m].grams) }))
        ))
      )
    )
  );
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

update();
