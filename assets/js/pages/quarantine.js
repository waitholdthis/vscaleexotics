/** Quarantine Protocol — dated, checkable, persisted locally. */

import { initShell, toast } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { fieldDate, toolPanel, methodology, statBlock } from '../ui/controls.js';
import { QUARANTINE_PROTOCOL } from '../engine/husbandry.js';
import { date } from '../core/format.js';

initShell();

const KEY = 'vscale:quarantine';

/** Persisted progress. Validated on read — it is user-writable storage. */
function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const valid = new Set(QUARANTINE_PROTOCOL.map((_, i) => i));
    const done = Array.isArray(raw.done) ? raw.done.filter((n) => Number.isInteger(n) && valid.has(n)) : [];
    const start = typeof raw.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.start) ? raw.start : null;
    return { done: new Set(done), start };
  } catch {
    return { done: new Set(), start: null };
  }
}

function saveProgress() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ done: [...state.done], start: state.start }));
  } catch { /* storage unavailable — the checklist still works for this session */ }
}

const stored = loadProgress();
const state = {
  start: stored.start || new Date().toISOString().slice(0, 10),
  done: stored.done
};

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function renderControls() {
  const total = QUARANTINE_PROTOCOL.length;
  const done = state.done.size;
  const pct = Math.round((done / total) * 100);

  render(
    controls,
    toolPanel(
      'Intake',
      h(
        'div',
        { class: 'stack stack--sm' },
        fieldDate({
          label: 'Arrival date',
          value: state.start,
          hint: 'Day zero is the day the box is opened.',
          onChange: (v) => { if (v) { state.start = v; saveProgress(); update(); } }
        }),
        h(
          'div',
          {},
          h('div', { class: 'cluster cluster--between', style: { 'margin-bottom': '.5rem' } },
            h('span', { class: 'field__label', text: 'Progress' }),
            h('span', { class: 'mono text-brass', text: `${done} / ${total}` })),
          h('span', { class: 'pbar', style: { height: '6px' } }, h('span', { class: 'pbar__fill pbar--jade', style: { '--p': `${pct}%` } }))
        ),
        h('p', { class: 'field__hint', text: 'Saved in this browser only. Nothing is transmitted anywhere, and clearing your browser data will clear it.' })
      )
    ),
    h(
      'button',
      { class: 'btn btn--block btn--ghost', type: 'button',
        on: { click: () => { state.done.clear(); saveProgress(); update(); toast('Checklist reset.', 'info'); } } },
      'Reset checklist'
    ),
    h('button', { class: 'btn btn--block', type: 'button', on: { click: () => window.print() } }, icon('download'), 'Print protocol'),
    h(
      'div',
      { class: 'notice notice--critical' },
      icon('alert', 'notice__icon'),
      h('span', {}, h('strong', { text: 'A positive mite result restarts the clock. ' }),
        'Not from where you found it — from day zero. This is the single rule people break and then wonder why the whole collection is infested six weeks later.')
    )
  );
}

function renderOutput() {
  const endDate = addDays(state.start, 90);
  const daysIn = Math.max(0, Math.round((Date.now() - new Date(`${state.start}T12:00:00Z`)) / 86400000));
  const grouped = {};
  for (const [i, step] of QUARANTINE_PROTOCOL.entries()) (grouped[step.phase] ||= []).push({ step, i });

  render(
    output,
    statBlock([
      [date(state.start), 'Day zero', 'Intake'],
      [`${Math.min(daysIn, 90)} / 90`, 'Days elapsed', daysIn >= 90 ? 'Complete' : 'In quarantine'],
      [date(endDate), 'Release date', 'If clear throughout'],
      [`${state.done.size} / ${QUARANTINE_PROTOCOL.length}`, 'Steps done', '']
    ]),

    ...Object.entries(grouped).map(([phase, items]) =>
      h(
        'section',
        { style: { 'margin-top': '2.5rem' } },
        h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1rem' }, text: phase }),
        h('div', {}, ...items.map(({ step, i }) => protocolItem(step, i)))
      )
    ),

    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '2.5rem' } },
      icon('info', 'notice__icon'),
      h('span', {}, h('strong', { text: 'Handle quarantined animals last. ' }),
        'Every day, without exception, and wash between. For a month after release as well. Cross-contamination happens on hands and hooks far more often than it happens through the air.')
    ),

    methodology('Why ninety days', [
      'Snake mites complete a full life cycle in roughly two to three weeks at typical enclosure temperatures. That figure is where the common thirty-day and sixty-day quarantines come from, and it is the wrong figure to build on.',
      'Eggs deposited in a substrate crack, a hide seam or an enclosure joint can remain viable and dormant considerably longer than the active life cycle suggests, and they hatch when conditions turn favourable rather than on a schedule. Ninety days covers several full cycles including that dormancy window.',
      'The other reason is behavioural. Cryptosporidium, nidovirus and inclusion body disease do not announce themselves in week two. A ninety-day window with weight tracking throughout gives you a trend line, and a trend line is what actually catches a problem before it reaches the rest of your collection.',
      'A positive finding at any point restarts the entire protocol from day zero. This is not excessive caution — an animal that tests positive at day seventy-five has been shedding into your airspace for seventy-five days, and the only sound response is to assume nothing about the remainder.'
    ])
  );
}

function protocolItem(step, index) {
  const when = addDays(state.start, step.day);
  const checked = state.done.has(index);
  const overdue = !checked && new Date(`${when}T12:00:00Z`) < Date.now();

  return h(
    'label',
    { class: 'protocol-item' },
    h('span', { class: 'protocol-item__day', text: `Day ${step.day}` }),
    h('input', {
      type: 'checkbox',
      checked: checked ? '' : null,
      'aria-label': step.task,
      on: {
        change: (e) => {
          e.target.checked ? state.done.add(index) : state.done.delete(index);
          saveProgress();
          renderControls();
        }
      }
    }),
    h(
      'span',
      {},
      h('span', { class: 'protocol-item__task', text: step.task }),
      h(
        'span',
        { class: 'protocol-item__phase', style: { display: 'block', 'margin-top': '.25rem' } },
        `${date(when)}${step.critical ? ' · essential' : ''}${overdue ? ' · overdue' : ''}`
      )
    )
  );
}

function update() {
  renderControls();
  renderOutput();
}

update();
