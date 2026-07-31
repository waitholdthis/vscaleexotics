/** Legality Check. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, toolPanel, methodology } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { check, STATES, COUNTRIES, LEVEL_META, LAST_REVIEWED, DISCLAIMER } from '../engine/legality.js';
import { US_STATES } from '../engine/shipping.js';
import { date } from '../core/format.js';

initShell();

const params = new URLSearchParams(location.search);
const qSpecies = params.get('species');

const state = {
  scope: 'US',
  usState: 'NC',
  country: 'GB',
  species: SPECIES_BY_ID[qSpecies] ? qSpecies : 'any'
};

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');

function renderControls() {
  render(
    controls,
    toolPanel(
      'Where and what',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldSelect({
          label: 'Jurisdiction',
          options: [['US', 'United States'], ['INT', 'International']],
          value: state.scope,
          onChange: (v) => { state.scope = v; update(); }
        }),
        state.scope === 'US'
          ? fieldSelect({
              label: 'State',
              options: US_STATES.filter(([c]) => STATES[c]).map(([c, n]) => [c, n]),
              value: state.usState,
              onChange: (v) => { state.usState = v; update(false); }
            })
          : fieldSelect({
              label: 'Country',
              options: COUNTRIES.map((c) => [c.code, c.name]),
              value: state.country,
              onChange: (v) => { state.country = v; update(false); }
            }),
        fieldSelect({
          label: 'Species',
          options: [['any', 'Any species we place'], ...SPECIES.map((s) => [s.id, s.common])],
          value: state.species,
          onChange: (v) => { state.species = v; update(false); }
        })
      )
    ),
    h(
      'div',
      { class: 'notice notice--caution' },
      icon('alert', 'notice__icon'),
      h('span', {}, h('strong', { text: 'Not legal advice. ' }), DISCLAIMER)
    ),
    h('p', { class: 'field__hint', text: `Last reviewed ${date(LAST_REVIEWED, { long: true })}.` })
  );
}

function renderOutput() {
  const q = state.scope === 'US'
    ? { state: state.usState, species: state.species === 'any' ? undefined : state.species }
    : { country: state.country, species: state.species === 'any' ? undefined : state.species };

  const r = check(q);
  const meta = LEVEL_META[r.level] || LEVEL_META.open;
  const MARK = { clear: 'check', caution: 'alert', warn: 'alert', critical: 'close' };

  render(
    output,
    h(
      'div',
      { class: `verdict verdict--${r.level}` },
      h('span', { class: 'verdict__mark' }, icon(MARK[meta.tone] || 'info')),
      h(
        'div',
        {},
        h('h3', { text: `${r.jurisdiction ? r.jurisdiction.name : 'Unknown jurisdiction'} — ${meta.label}` }),
        h('p', { text: r.jurisdiction ? r.jurisdiction.note : 'No record on file.' }),
        r.jurisdiction && r.jurisdiction.home
          ? h('p', { class: 'stat__note', style: { 'margin-top': '.75rem', color: 'var(--brass)' }, text: 'This is our home state.' })
          : null,
        !r.shippable
          ? h('p', { style: { 'margin-top': '.75rem', color: 'var(--oxblood)', 'font-weight': '600' }, text: 'We cannot ship to this destination.' })
          : null
      )
    ),

    r.speciesOverlay
      ? h(
          'div',
          { class: 'notice notice--critical', style: { 'margin-top': '1.5rem' } },
          icon('alert', 'notice__icon'),
          h('span', {}, h('strong', { text: `${SPECIES_BY_ID[state.species].common} specifically: ` }), r.speciesOverlay.note)
        )
      : null,

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.25rem' }, text: 'Federal position' }),
    h(
      'div',
      { class: 'accordion' },
      ...r.federal.map((f) =>
        h(
          'details',
          { open: f.level === 'permit' || f.level === 'prohibited' ? '' : null },
          h('summary', {}, f.title),
          h(
            'div',
            { class: 'accordion__body' },
            h('p', { class: 'text-dim', text: f.body }),
            f.action ? h('p', { style: { 'margin-top': '1rem', color: 'var(--brass)', 'font-size': 'var(--t-sm)' }, text: f.action }) : null,
            f.applies && f.applies.length
              ? h('div', { class: 'cluster cluster--tight', style: { 'margin-top': '1rem' } },
                  ...f.applies.map((id) => h('span', { class: 'gene-chip', text: SPECIES_BY_ID[id]?.common || id })))
              : null
          )
        )
      )
    ),

    state.scope === 'US' ? stateOverview() : countryOverview(),

    methodology('How to use this, and its limits', [
      'Reptile law in the United States operates at three levels simultaneously. Federal law governs importation and, in a contested way, interstate transport. State law governs possession. Municipal ordinance governs whether your particular city permits it — and that is the layer that catches people out, because it is rarely searchable and frequently more restrictive than the state.',
      'This tool covers the first two properly. It does not comprehensively cover the third, and no tool honestly can. Several major cities prohibit constrictors outright in states where they are entirely unrestricted, New York City being the obvious example.',
      'The Lacey Act position on reticulated pythons deserves particular attention. The 2015 injurious listing bans importation absolutely. Whether it also bans transport between states was litigated, and in 2017 the D.C. Circuit held that it does not. We ship domestically on that basis. It is a court holding rather than a statutory amendment, and you should treat the position as live rather than settled.',
      'Every record carries the review date shown in the sidebar. Confirm with your state wildlife agency and your local authority before ordering — we will ask you to attest that you have done so, and we will decline the sale if the answer is that you cannot legally keep the animal.'
    ])
  );
}

function stateOverview() {
  const grouped = {};
  for (const [code, rec] of Object.entries(STATES)) (grouped[rec.level] ||= []).push(code);
  const order = ['open', 'notify', 'permit', 'restricted', 'prohibited'];

  return h(
    'section',
    { style: { 'margin-top': '3rem' } },
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'All fifty states at a glance' }),
    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: 'For the species we place. Species-specific rules can override the general position — check yours above.' }),
    ...order.filter((lvl) => grouped[lvl]).map((lvl) =>
      h(
        'div',
        { style: { 'margin-bottom': '1.5rem' } },
        h('p', { class: 'eyebrow eyebrow--muted', style: { 'margin-bottom': '.6rem' }, text: `${LEVEL_META[lvl].label} — ${grouped[lvl].length}` }),
        h('div', { class: 'cluster cluster--tight' }, ...grouped[lvl].sort().map((code) =>
          h('button', {
            class: `gene-chip${code === state.usState ? ' gene-chip--recessive' : ''}`,
            type: 'button',
            text: code,
            title: US_STATES.find(([c]) => c === code)?.[1] || code,
            on: { click: () => { state.usState = code; state.scope = 'US'; update(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
          })
        ))
      )
    )
  );
}

function countryOverview() {
  return h(
    'section',
    { style: { 'margin-top': '3rem' } },
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'Destinations we serve' }),
    h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
      text: 'We handle the CITES export permit. You are responsible for the import permit, and nothing despatches until we have seen it.' }),
    h('div', { class: 'specs' }, ...COUNTRIES.map((c) =>
      h('div', { class: 'spec' },
        h('span', { class: 'spec__k' },
          h('button', { class: 'link', type: 'button', text: c.name, style: { background: 'none', border: '0', padding: '0', cursor: 'pointer' },
            on: { click: () => { state.country = c.code; state.scope = 'INT'; update(); window.scrollTo({ top: 0, behavior: 'smooth' }); } } })),
        h('span', { class: 'spec__v' },
          h('span', { class: `badge badge--${c.ships ? 'available' : 'sold'}`, style: { 'margin-right': '.5rem' }, text: c.ships ? 'We ship' : 'Cannot ship' }),
          h('span', { text: c.note }))
      )
    ))
  );
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

update();
