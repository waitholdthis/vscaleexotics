/**
 * Form control builders shared by the tool pages.
 */

import { h, icon } from '../core/dom.js';

let uid = 0;
const nextId = (p) => `${p}-${++uid}`;

export function fieldSelect({ label, hint, options, value, onChange, id }) {
  const fid = id || nextId('sel');
  const select = h(
    'select',
    { class: 'select', id: fid, on: { change: (e) => onChange(e.target.value) } },
    ...options.map(([v, t]) => h('option', { value: v, text: t, selected: String(v) === String(value) ? '' : null }))
  );
  return h(
    'div',
    { class: 'field' },
    h('label', { class: 'field__label', for: fid, text: label }),
    select,
    hint ? h('p', { class: 'field__hint', text: hint }) : null
  );
}

export function fieldNumber({ label, hint, value, min, max, step, suffix, onChange, id }) {
  const fid = id || nextId('num');
  const input = h('input', {
    class: 'input',
    id: fid,
    type: 'number',
    value: String(value),
    min: min != null ? String(min) : null,
    max: max != null ? String(max) : null,
    step: step != null ? String(step) : null,
    inputmode: 'decimal',
    on: {
      input: (e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n, e.target);
      }
    }
  });
  return h(
    'div',
    { class: 'field' },
    h('label', { class: 'field__label', for: fid }, label, suffix ? h('span', { class: 'text-muted', text: ` (${suffix})` }) : null),
    input,
    hint ? h('p', { class: 'field__hint', text: hint }) : null
  );
}

export function fieldDate({ label, hint, value, onChange, id, min, max }) {
  const fid = id || nextId('date');
  const input = h('input', {
    class: 'input',
    id: fid,
    type: 'date',
    value: value || '',
    min: min || null,
    max: max || null,
    on: { change: (e) => onChange(e.target.value) }
  });
  return h(
    'div',
    { class: 'field' },
    h('label', { class: 'field__label', for: fid, text: label }),
    input,
    hint ? h('p', { class: 'field__hint', text: hint }) : null
  );
}

export function fieldRange({ label, value, min, max, step, format, onChange, id }) {
  const fid = id || nextId('rng');
  const out = h('span', { class: 'mono text-brass', text: format ? format(value) : String(value) });
  const input = h('input', {
    class: 'range',
    id: fid,
    type: 'range',
    value: String(value),
    min: String(min),
    max: String(max),
    step: String(step || 1),
    on: {
      input: (e) => {
        const n = Number(e.target.value);
        out.textContent = format ? format(n) : String(n);
        onChange(n);
      }
    }
  });
  return h(
    'div',
    { class: 'field' },
    h('div', { class: 'cluster cluster--between' }, h('label', { class: 'field__label', for: fid, text: label }), out),
    input
  );
}

export function fieldCheck({ label, checked, onChange, hint, id }) {
  const fid = id || nextId('chk');
  return h(
    'div',
    { class: 'field' },
    h(
      'label',
      { class: 'check', for: fid },
      h('input', { type: 'checkbox', id: fid, checked: checked ? '' : null, on: { change: (e) => onChange(e.target.checked) } }),
      h('span', { text: label })
    ),
    hint ? h('p', { class: 'field__hint', text: hint }) : null
  );
}

export function toolPanel(title, ...children) {
  return h(
    'div',
    { class: 'panel' },
    h('p', { class: 'eyebrow', style: { 'margin-bottom': '1.25rem' }, text: title }),
    ...children.filter(Boolean)
  );
}

export function noticeFor(level, text) {
  const map = { critical: 'alert', caution: 'alert', note: 'info', clear: 'check', pass: 'check' };
  return h('div', { class: `notice notice--${level}` }, icon(map[level] || 'info', 'notice__icon'), h('span', { text }));
}

export function emptyState(title, body, action) {
  return h(
    'div',
    { class: 'empty' },
    h('p', { class: 'empty__title', text: title }),
    h('p', { text: body }),
    action || null
  );
}

/** Standard "how this works" disclosure used at the foot of each tool. */
export function methodology(title, paragraphs) {
  return h(
    'details',
    { class: 'panel', style: { 'margin-top': '2rem' } },
    h('summary', { style: { cursor: 'pointer', 'font-family': 'var(--font-display)', 'font-size': 'var(--t-md)' }, text: title }),
    h('div', { class: 'prose', style: { 'margin-top': '1.25rem' } }, ...paragraphs.map((p) => h('p', { text: p })))
  );
}

export function statBlock(items) {
  return h(
    'div',
    { class: 'stat-row' },
    ...items.map(([v, k, note]) =>
      h(
        'div',
        { class: 'stat' },
        h('span', { class: 'stat__v num', text: v }),
        h('span', { class: 'stat__k', text: k }),
        note ? h('span', { class: 'stat__note', text: note }) : null
      )
    )
  );
}
