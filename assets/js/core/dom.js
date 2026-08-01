/**
 * DOM helpers.
 *
 * `h()` is the only element factory used across the site and it has no path to
 * innerHTML. Every string becomes a text node. That makes DOM-based XSS
 * structurally impossible here rather than merely unlikely — which matters
 * because several views render values that originate in localStorage or a
 * query string.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Attributes that must never be set from data, whatever the caller passes. */
const FORBIDDEN_ATTR = /^(on|srcdoc$|xlink:href$)/i;

/** URL schemes permitted on href/src. */
function safeUrl(value) {
  const v = String(value).trim();
  if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(v)) return v;
  if (/^[\w./-]+$/.test(v)) return v; // bare relative path
  return '#';
}

/**
 * h('div', { class: 'x' }, 'text', childEl)
 * h('a', { href, 'aria-label': '…' }, …)
 * Props: `class`, `dataset`, `style` (object of custom props), event handlers
 * via `on: { click: fn }`, everything else via setAttribute.
 */
export function h(tag, props = null, ...children) {
  const el = document.createElement(tag);
  applyProps(el, props);
  append(el, children);
  return el;
}

export function svg(tag, props = null, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  applyProps(el, props, true);
  append(el, children);
  return el;
}

function applyProps(el, props, isSvg = false) {
  if (!props) return;
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;

    if (key === 'on' && typeof value === 'object') {
      for (const [evt, fn] of Object.entries(value)) el.addEventListener(evt, fn);
      continue;
    }
    if (key === 'dataset' && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) if (v != null) el.dataset[k] = String(v);
      continue;
    }
    if (key === 'style' && typeof value === 'object') {
      // Custom properties only — no arbitrary declaration strings, which keeps
      // this compatible with a style-src that forbids unsafe-inline.
      for (const [k, v] of Object.entries(value)) el.style.setProperty(k, String(v));
      continue;
    }
    if (key === 'class') { el.setAttribute('class', String(value)); continue; }
    if (key === 'text') { el.textContent = String(value); continue; }
    if (FORBIDDEN_ATTR.test(key)) continue;

    const v = key === 'href' || key === 'src' ? safeUrl(value) : String(value === true ? '' : value);
    if (isSvg && key === 'href') el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', v);
    else el.setAttribute(key, v);
  }
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === true) continue;
    el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function frag(...children) {
  const f = document.createDocumentFragment();
  append(f, children);
  return f;
}

/** Replace an element's children without ever touching innerHTML. */
export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function render(el, ...children) {
  clear(el);
  append(el, children);
  return el;
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

export function on(target, type, handler, opts) {
  target.addEventListener(type, handler, opts);
  return () => target.removeEventListener(type, handler, opts);
}

export function delegate(root, selector, type, handler) {
  return on(root, type, (e) => {
    const match = e.target.closest(selector);
    if (match && root.contains(match)) handler(e, match);
  });
}

/* ------------------------------------------------------------------ *
 * Icons — a fixed set, defined as path data. Nothing here is ever built
 * from a variable, so there is no injection surface.
 * ------------------------------------------------------------------ */

const ICONS = {
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  arrowUp: 'M12 19V5m-7 7 7-7 7 7',
  close: 'M18 6 6 18M6 6l12 12',
  menu: 'M3 6h18M3 12h18M3 18h18',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  layers: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5',
  dna: 'M4 3c0 6 16 6 16 12M20 3c0 6-16 6-16 12M5 8h14M6 12h12M5 16h14',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  scale: 'M12 3v18M5 7l7-4 7 4M3 13l2-6 2 6a3 3 0 0 1-4 0Zm14 0 2-6 2 6a3 3 0 0 1-4 0Z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  thermometer: 'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z',
  home: 'M3 9.5 12 3l9 6.5V21H3z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  // Multi-path glyphs are declared as an array.
  instagram: [
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
    'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
    'M17.5 6.5h.01'
  ]
};

export function icon(name, cls = '') {
  const d = ICONS[name];
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', '1.5');
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  if (cls) el.setAttribute('class', cls);
  for (const segment of Array.isArray(d) ? d : d ? [d] : []) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', segment);
    el.appendChild(p);
  }
  return el;
}

export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(ICONS, name);

/* ------------------------------------------------------------------ *
 * Focus management
 * ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function trapFocus(container) {
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
