/** Husbandry Architect — enclosure specification and build list. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, fieldNumber, toolPanel, methodology, statBlock } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { enclosureSpec } from '../engine/husbandry.js';
import { dimensions, tempRange, weightBoth, lengthRange } from '../core/format.js';

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
          hint: `Functionally adult at around ${sp.maturityWeight} g. Adult length ${lengthRange(sp.adultLength)}.`,
          onChange: (n) => { state.weight = n; update(false); }
        })
      )
    ),
    h(
      'div',
      { class: 'notice notice--note' },
      icon('info', 'notice__icon'),
      h('span', {}, h('strong', { text: 'Buy for now, plan for adult. ' }),
        'A neonate in an adult-sized enclosure will often refuse food for months. Both figures are given below so you can budget for the second enclosure rather than discover it.')
    ),
    h('button', { class: 'btn btn--block', type: 'button', on: { click: () => window.print() } }, icon('download'), 'Print specification')
  );
}

function renderOutput() {
  const e = enclosureSpec(state.species, state.weight);
  if (!e) { render(output, h('p', { text: 'Select a species.' })); return; }
  const sp = e.species;

  const groups = {};
  for (const item of e.checklist) (groups[item.group] ||= []).push(item);

  render(
    output,
    h(
      'div',
      { class: 'panel' },
      h('p', { class: 'eyebrow eyebrow--muted', text: `${sp.common} · ${e.stage.label}` }),
      h('p', { style: { 'font-family': 'var(--font-display)', 'font-size': 'var(--t-2xl)', 'letter-spacing': '-.03em', margin: '.75rem 0 .5rem' },
        text: dimensions(e.dimensions) }),
      h('p', { class: 'text-muted', text: `${e.footprintSqFt} sq ft floor · ${e.orientation} orientation` }),
      h('p', { class: 'stat__note', style: { 'margin-top': '.75rem' }, text: `At adult size: ${dimensions(e.adultDimensions)}` })
    ),

    statBlock([
      [tempRange(e.thermal.warmSide), 'Warm side', 'Surface temperature'],
      [tempRange(e.thermal.coolSide), 'Cool side', 'Ambient'],
      [`${e.humidity.standard[0]}–${e.humidity.standard[1]}%`, 'Humidity', `${e.humidity.shed[0]}–${e.humidity.shed[1]}% in shed`],
      [String(e.hides), 'Hides', e.hides ? 'One per thermal zone' : 'Perches instead']
    ]),

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.25rem' }, text: 'Specification' }),
    h(
      'div',
      { class: 'specs' },
      row('Life stage', `${e.stage.label} — ${weightBoth(state.weight)}`),
      row('Enclosure now', dimensions(e.dimensions)),
      row('Enclosure at adult', dimensions(e.adultDimensions)),
      row('Orientation', e.orientation === 'vertical' ? 'Vertical — height matters more than floor area' : e.orientation === 'mixed' ? 'Mixed — this species will use all the height you give it' : 'Horizontal — floor area is the governing dimension'),
      row('Thermal gradient', e.thermal.gradient),
      row('Substrate', e.substrate.join(' · ')),
      row('Lighting', e.lighting),
      row('Water', e.water),
      row('Lifespan', `${sp.lifespan[0]}–${sp.lifespan[1]} years — this is a long commitment`)
    ),

    h('div', { class: 'notice notice--caution', style: { 'margin-top': '1.5rem' } }, icon('alert', 'notice__icon'), h('span', { text: e.notes })),

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.25rem' }, text: 'Build list' }),
    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: 'Items marked essential are not suggestions. An enclosure missing any of them is not ready for an animal.' }),
    ...Object.entries(groups).map(([group, items]) =>
      h(
        'section',
        { style: { 'margin-bottom': '2rem' } },
        h('p', { class: 'eyebrow eyebrow--muted', style: { 'margin-bottom': '.75rem' }, text: group }),
        h(
          'div',
          {},
          ...items.map((it) =>
            h(
              'label',
              { class: 'check', style: { 'margin-bottom': '.35rem' } },
              h('input', { type: 'checkbox' }),
              h('span', { text: it.item }),
              it.critical ? h('span', { class: 'check__count', style: { color: 'var(--brass)' }, text: 'essential' }) : null
            )
          )
        )
      )
    ),

    methodology('How the dimensions are derived', [
      'Each species carries a minimum adult footprint drawn from its natural behaviour rather than from a length-times-width rule of thumb — those rules systematically undersize arboreal species and oversize fossorial ones.',
      'That minimum is then scaled by life stage. Neonates and juveniles get proportionally smaller space, because under-furnished volume is the most common cause of chronic feeding refusal we see in young animals, and it is almost always misdiagnosed as something else.',
      'Arboreal species are the exception: their specification is driven by height and perch placement throughout, and the floor area is close to irrelevant. Perch diameter should match the animal\'s body girth — too thin and the animal cannot rest properly, too thick and it will not use it.',
      'Every temperature given is a surface or ambient figure to be verified with a probe and an infrared gun, not a thermostat display. The thermostat tells you what it thinks it is doing.'
    ])
  );
}

function row(k, v) {
  return h('div', { class: 'spec' }, h('span', { class: 'spec__k', text: k }), h('span', { class: 'spec__v', text: v }));
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

update();
