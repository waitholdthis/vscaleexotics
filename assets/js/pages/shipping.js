/** Ship Window — safe despatch assessment. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldSelect, fieldDate, fieldCheck, toolPanel, methodology, statBlock } from '../ui/controls.js';
import { assess, US_STATES, CARRIER_RULES, LAG_TERMS } from '../engine/shipping.js';
import { date } from '../core/format.js';

initShell();

const state = {
  state: 'NY',
  date: new Date().toISOString().slice(0, 10),
  hold: false
};

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');

function renderControls() {
  render(
    controls,
    toolPanel(
      'Destination',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldSelect({
          label: 'State',
          options: US_STATES.map(([code, name]) => [code, name]),
          value: state.state,
          onChange: (v) => { state.state = v; update(false); }
        }),
        fieldDate({
          label: 'Intended despatch date',
          value: state.date,
          hint: `We despatch ${CARRIER_RULES.shipDayLabel} only, cut-off ${CARRIER_RULES.cutoff}.`,
          onChange: (v) => { state.date = v; update(false); }
        }),
        fieldCheck({
          label: 'Hold at FedEx facility for collection',
          checked: state.hold,
          hint: 'Widens the acceptable temperature band and removes the doorstep risk. We recommend it for every shipment outside the mildest months.',
          onChange: (v) => { state.hold = v; update(false); }
        })
      )
    ),
    h(
      'div',
      { class: 'notice notice--note' },
      icon('truck', 'notice__icon'),
      h('span', {}, h('strong', { text: CARRIER_RULES.service + '. ' }), CARRIER_RULES.note)
    ),
    h('a', { class: 'btn btn--block', href: '/legal/shipping-policy.html' }, 'Full shipping policy')
  );
}

function renderOutput() {
  let r;
  try {
    r = assess({ state: state.state, date: state.date, holdForPickup: state.hold });
  } catch (err) {
    render(output, h('div', { class: 'notice notice--critical' }, icon('alert', 'notice__icon'), h('span', { text: err.message })));
    return;
  }

  const MARK = { clear: 'check', conditional: 'alert', 'no-ship': 'close', prohibited: 'close', unsupported: 'info' };

  render(
    output,
    h(
      'div',
      { class: `verdict verdict--${r.verdict}` },
      h('span', { class: 'verdict__mark' }, icon(MARK[r.verdict] || 'info')),
      h('div', {}, h('h3', { text: r.headline }), h('p', { text: r.detail }))
    ),

    r.region
      ? statBlock([
          [r.region.name, 'Climate region', ''],
          [`${r.destNormals[0]}–${r.destNormals[1]}°F`, 'Destination normals', 'This month'],
          [`${r.originNormals[0]}–${r.originNormals[1]}°F`, 'Origin normals', 'Chatham County, NC'],
          [`${(state.hold ? CARRIER_RULES.holdRange : CARRIER_RULES.safeRange).join('–')}°F`, 'Permitted band', state.hold ? 'With facility hold' : 'Doorstep delivery']
        ])
      : null,

    r.checks.length
      ? h(
          'section',
          { style: { 'margin-top': '2.5rem' } },
          h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1.25rem' }, text: 'Checks' }),
          h('div', { class: 'checks' }, ...r.checks.map((c) =>
            h('div', { class: `check-row check-row--${c.status}` },
              icon(c.status === 'pass' ? 'check' : c.status === 'warn' ? 'alert' : 'close', 'check-row__icon'),
              h('div', {}, h('p', { class: 'check-row__label', text: c.label }), h('p', { class: 'check-row__detail', text: c.detail }))
            )
          ))
        )
      : null,

    r.accessories.length
      ? h(
          'section',
          { style: { 'margin-top': '2.5rem' } },
          h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1.25rem' }, text: 'Required for this window' }),
          h('div', { class: 'specs' }, ...r.accessories.map((a) =>
            h('div', { class: 'spec' }, h('span', { class: 'spec__k', text: a.item }), h('span', { class: 'spec__v', text: a.reason }))
          ))
        )
      : null,

    r.nextDates.length
      ? h(
          'section',
          { style: { 'margin-top': '2.5rem' } },
          h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: 'Next viable despatch dates' }),
          h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-bottom': '1.25rem' },
            text: 'Valid despatch days whose seasonal normals fall inside, or close to, the permitted band.' }),
          h('div', { class: 'cluster' }, ...r.nextDates.map((d) =>
            h('span', { class: `badge badge--${d.verdict === 'clear' ? 'available' : 'reserved'}` },
              h('span', { class: 'badge__dot', 'aria-hidden': 'true' }), date(d.date))
          ))
        )
      : null,

    h(
      'section',
      { style: { 'margin-top': '3rem' } },
      h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1.25rem' }, text: 'Live arrival guarantee' }),
      h('div', { class: 'accordion' }, ...LAG_TERMS.map((t) =>
        h('details', {},
          h('summary', { text: t.title }),
          h('div', { class: 'accordion__body' }, h('p', { class: 'text-dim', text: t.body }))
        )
      ))
    ),

    methodology('Why normals and not a forecast', [
      'A seven-day forecast cannot answer "is the second week of March a sane time to move this animal", and that is the question people actually need answered when they are deciding whether to buy. So this runs against regional climatological normals, which are stable and available for any date.',
      'Both ends of the journey are evaluated. The binding constraint is whichever is worse — a mild destination does not help if the animal is sitting on a sorting belt in Memphis at four degrees, and the origin here is Chatham County, North Carolina.',
      'Holding at a FedEx facility rather than delivering to a doorstep widens the acceptable band at both ends, because the animal is never left outside. It is the single most effective thing a buyer can do to reduce risk, and we recommend it for anything outside the mildest months.',
      'This tool plans. It does not decide. Every despatch is checked against the actual forecast on the morning it goes out, and if that forecast is marginal the animal stays here at no cost until it is not.'
    ])
  );
}

function update(rebuild = true) {
  if (rebuild) renderControls();
  renderOutput();
}

update();
