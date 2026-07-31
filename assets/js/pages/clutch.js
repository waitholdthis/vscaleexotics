/** Clutch Planner — incubation and gestation timelines. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, fieldDate, fieldRange, fieldNumber, toolPanel, noticeFor, methodology, statBlock } from '../ui/controls.js';
import { SPECIES, SPECIES_BY_ID } from '../data/species.js';
import { REPRO, plan, IncubationError } from '../engine/incubation.js';
import { date } from '../core/format.js';

initShell();

const today = new Date().toISOString().slice(0, 10);

const state = {
  species: 'ball-python',
  startDate: today,
  temp: REPRO['ball-python'].refTemp,
  clutchSize: 7
};

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');

const withRepro = SPECIES.filter((s) => REPRO[s.id]);

function renderControls() {
  const repro = REPRO[state.species];
  const oviparous = repro.mode === 'oviparous';

  render(
    controls,
    toolPanel(
      'The clutch',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldSelect({
          label: 'Species',
          options: withRepro.map((s) => [s.id, s.common]),
          value: state.species,
          onChange: (v) => {
            state.species = v;
            const r = REPRO[v];
            state.temp = r.mode === 'oviparous' ? r.refTemp : null;
            state.clutchSize = Math.round(((r.clutch || r.litter)[0] + (r.clutch || r.litter)[1]) / 2);
            update();
          }
        }),
        fieldDate({
          label: oviparous ? 'Lay date' : 'Ovulation date',
          value: state.startDate,
          hint: oviparous
            ? 'The day the eggs were laid.'
            : 'The mid-body swelling, not the post-ovulation shed. If you missed it, work back roughly twenty days from the shed.',
          onChange: (v) => { state.startDate = v; update(false); }
        }),
        oviparous
          ? fieldRange({
              label: 'Incubation temperature',
              value: state.temp, min: 82, max: 93, step: 0.5,
              format: (n) => `${n}°F`,
              onChange: (n) => { state.temp = n; update(false); }
            })
          : null,
        fieldNumber({
          label: oviparous ? 'Clutch size' : 'Litter size',
          value: state.clutchSize, min: 1, max: 60, step: 1,
          hint: `Typical for this species: ${(repro.clutch || repro.litter).join('–')}.`,
          onChange: (n) => { state.clutchSize = n; update(false); }
        })
      )
    ),
    oviparous
      ? h(
          'div',
          { class: 'notice notice--caution' },
          icon('alert', 'notice__icon'),
          h('span', {}, h('strong', { text: 'Run a secondary cut-off. ' }),
            'A single thermostat failure at these temperatures destroys an entire season in under four hours. An independent over-temperature cut-off is not optional.')
        )
      : null
  );
}

function renderOutput() {
  let p;
  try {
    p = plan({ species: state.species, startDate: state.startDate, temp: state.temp ?? undefined, clutchSize: state.clutchSize });
  } catch (err) {
    render(output, h('div', { class: 'notice notice--critical' }, icon('alert', 'notice__icon'),
      h('span', { text: err instanceof IncubationError ? err.message : 'Could not build that timeline.' })));
    return;
  }

  const sp = SPECIES_BY_ID[state.species];
  const daysToGo = Math.round((new Date(`${p.hatchDate}T12:00:00Z`) - new Date()) / 86400000);

  render(
    output,
    h(
      'div',
      { class: 'panel' },
      h('p', { class: 'eyebrow eyebrow--muted', text: p.mode === 'oviparous' ? 'Expected hatch' : 'Expected birth' }),
      h('p', { style: { 'font-family': 'var(--font-display)', 'font-size': 'var(--t-2xl)', 'letter-spacing': '-.03em', margin: '.75rem 0 .5rem' }, text: date(p.hatchDate, { long: true }) }),
      h('p', { class: 'text-muted', text: `Window ${date(p.hatchEarly)} – ${date(p.hatchLate)}` }),
      daysToGo > 0 ? h('p', { class: 'stat__note', style: { 'margin-top': '.5rem' }, text: `${daysToGo} days from today` }) : null
    ),

    statBlock([
      [`${p.days}d`, p.mode === 'oviparous' ? 'Incubation' : 'Gestation', `±${p.spread} days`],
      [p.mode === 'oviparous' ? `${p.temp}°F` : '—', 'Temperature', p.mode === 'oviparous' ? 'Setpoint' : 'Not applicable'],
      [String(p.clutchSize), p.mode === 'oviparous' ? 'Eggs' : 'Neonates', `typical ${p.clutchRange.join('–')}`],
      [p.mode === 'oviparous' ? `${p.humidity[0]}–${p.humidity[1]}%` : '—', 'Humidity', p.mode === 'oviparous' ? 'In the box' : '']
    ]),

    ...p.warnings.map((w) => h('div', { style: { 'margin-top': '1rem' } }, noticeFor(w.level, w.text))),

    h('h2', { style: { 'font-size': 'var(--t-lg)', margin: '3rem 0 1.5rem' }, text: 'Timeline' }),
    h(
      'div',
      { class: 'timeline' },
      ...p.timeline.map((e) =>
        h(
          'div',
          { class: `timeline__item${e.kind === 'primary' ? ' timeline__item--primary' : e.kind === 'milestone' ? ' timeline__item--milestone' : ''}` },
          h('p', { class: 'timeline__date', text: `${e.dateLabel}  ·  day ${e.day}` }),
          h('p', { class: 'timeline__label', text: e.label }),
          h('p', { class: 'timeline__detail', text: e.detail })
        )
      )
    ),

    p.tempComparison.length
      ? h(
          'section',
          { style: { 'margin-top': '3rem' } },
          h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'What a few degrees costs you' }),
          h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.5rem' },
            text: 'Duration against setpoint, holding everything else constant. Note that the fast end of this range is not the good end — above 90°F the incidence of kinking and neurological defect climbs sharply.' }),
          h(
            'div',
            { class: 'scroll-x' },
            h('table', { class: 'table' },
              h('thead', {}, h('tr', {}, h('th', { text: 'Setpoint' }), h('th', { class: 'num', text: 'Days' }), h('th', { text: 'Hatch date' }), h('th', { text: '' }))),
              h('tbody', {}, ...p.tempComparison.map((t) =>
                h('tr', {},
                  h('td', { class: 'num', text: `${t.temp}°F` }),
                  h('td', { class: 'num', text: String(t.days) }),
                  h('td', { text: date(t.date) }),
                  h('td', { class: 'text-muted', text: t.current ? 'your setpoint' : t.temp >= 91 ? 'defect risk' : t.temp <= 85 ? 'slow, weaker hatchlings' : '' })
                )
              ))
            )
          )
        )
      : null,

    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '2rem' } },
      icon('info', 'notice__icon'),
      h('span', {}, h('strong', { text: `${sp.common}: ` }), p.mode === 'oviparous' ? p.substrate : p.note)
    ),

    methodology('How the dates are derived', [
      'Incubation duration in oviparous reptiles is strongly temperature-dependent, and across the narrow band anyone should actually be incubating in the relationship is close enough to linear to model with a reference point and a per-degree coefficient. Each species has its own reference duration and slope.',
      'The pip window is set at roughly 5.5% of total duration either side of the central estimate, which matches observed spread across clutches. It widens with longer incubations, as it should.',
      'Live-bearing species are handled on an entirely separate path. Gestation is not temperature-tunable in any useful sense, so those timelines are expressed as a species-typical window measured from ovulation — which is why identifying ovulation correctly matters so much, and why the post-ovulation shed is included as a confirmation marker.',
      'None of this substitutes for candling. Use the dates to plan, and the eggs to decide.'
    ])
  );
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

update();
