/**
 * Runtime smoke test.
 *
 * Static checks cannot catch an import that resolves to a file which does not
 * export that name, or a page module that throws on load. This provides a DOM
 * shim just rich enough to execute every page module, then loads each one and
 * reports anything that throws.
 *
 * It is not a browser and it does not prove the site looks right — it proves
 * the modules wire together and run.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');
const problems = [];

/* ================================================================== *
 * 1. Import / export agreement
 * ================================================================== */

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (extname(full) === '.js') out.push(full);
  }
  return out;
}

const jsFiles = walk(join(ROOT, 'assets', 'js'));

/** Collect the names a module exports, by parsing its source. */
function exportsOf(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] || as[0]).trim());
    }
  }
  if (/export\s+default/.test(src)) names.add('default');
  return names;
}

const exportMap = new Map();
for (const f of jsFiles) exportMap.set(f, exportsOf(readFileSync(f, 'utf8')));

for (const file of jsFiles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const spec = m[2];
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
    const target = resolve(spec.startsWith('/') ? ROOT : dirname(file), spec.startsWith('/') ? `.${spec}` : spec);
    const available = exportMap.get(target);
    if (!available) continue;
    for (const part of m[1].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const name = t.split(/\s+as\s+/)[0].trim();
      if (!available.has(name)) {
        problems.push(`${rel(file)} imports "${name}" from ${spec}, which does not export it`);
      }
    }
  }
}

/* ================================================================== *
 * 2. DOM shim
 * ================================================================== */

const listeners = new Map();

/**
 * Elements must satisfy `instanceof Node`, because dom.js uses that check to
 * decide whether to append a child directly or coerce it to a text node.
 * Without it every nested element silently becomes "[object Object]" text and
 * the shim reports far less rendering than actually happened.
 */
class ShimNode {}
globalThis.Node = ShimNode;

function makeClassList(el) {
  const set = new Set();
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle: (c, force) => (force === undefined ? (set.has(c) ? set.delete(c) : set.add(c)) : force ? set.add(c) : set.delete(c)),
    contains: (c) => set.has(c),
    get value() { return [...set].join(' '); }
  };
}

function createElement(tag, ns) {
  const attrs = new Map();
  const el = {
    tagName: String(tag).toUpperCase(),
    namespaceURI: ns || 'http://www.w3.org/1999/xhtml',
    childNodes: [],
    parentNode: null,
    dataset: {},
    style: { setProperty() {}, removeProperty() {}, getPropertyValue: () => '' },
    hidden: false,
    value: '',
    checked: false,
    offsetParent: {},
    _text: '',

    get children() { return el.childNodes.filter((c) => c.tagName); },
    get firstChild() { return el.childNodes[0] || null; },
    get textContent() { return el._text || el.childNodes.map((c) => c.textContent ?? '').join(''); },
    set textContent(v) { el._text = String(v); el.childNodes = []; },

    appendChild(child) {
      if (child && child._isFragment) {
        for (const c of [...child.childNodes]) el.appendChild(c);
        return child;
      }
      child.parentNode = el;
      el.childNodes.push(child);
      return child;
    },
    removeChild(child) {
      const i = el.childNodes.indexOf(child);
      if (i >= 0) el.childNodes.splice(i, 1);
      return child;
    },
    remove() { el.parentNode?.removeChild(el); },
    replaceWith(node) {
      const p = el.parentNode;
      if (!p) return;
      const i = p.childNodes.indexOf(el);
      if (i >= 0) p.childNodes.splice(i, 1, node);
      node.parentNode = p;
      // A page that swaps a placeholder out is the interesting case, not a
      // failure to render. Remember where it went so the hook can be checked.
      el._replacedBy = node;
    },
    prepend(node) { el.childNodes.unshift(node); node.parentNode = el; },
    insertBefore(node) { return el.appendChild(node); },
    setAttribute(k, v) { attrs.set(k, String(v)); if (k.startsWith('data-')) el.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = String(v); },
    setAttributeNS(_, k, v) { attrs.set(k, String(v)); },
    getAttribute(k) { return attrs.has(k) ? attrs.get(k) : null; },
    hasAttribute: (k) => attrs.has(k),
    removeAttribute(k) { attrs.delete(k); },
    addEventListener(type, fn) {
      const key = `${el.tagName}:${type}`;
      if (!listeners.has(key)) listeners.set(key, []);
      listeners.get(key).push(fn);
    },
    removeEventListener() {},
    dispatchEvent() { return true; },
    querySelector: (sel) => queryAll(el, sel)[0] || null,
    querySelectorAll: (sel) => queryAll(el, sel),
    closest: () => null,
    contains: () => false,
    focus() {},
    scrollIntoView() {},
    // Media. hero-video.js calls play() and expects a promise back.
    play: () => Promise.resolve(),
    pause() { el.paused = true; },
    load() {},
    paused: true,
    getBoundingClientRect: () => ({ width: 1200, height: 700, top: 0, left: 0, right: 1200, bottom: 700 }),
    // Canvas
    getContext: () =>
      tag === 'canvas'
        ? {
            fillRect() {}, clearRect() {}, beginPath() {}, ellipse() {}, arc() {}, fill() {}, stroke() {},
            moveTo() {}, lineTo() {}, closePath() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
            drawImage() {}, putImageData() {}, createImageData: () => ({ data: [] }),
            createLinearGradient: () => ({ addColorStop() {} }),
            createRadialGradient: () => ({ addColorStop() {} }),
            set fillStyle(v) {}, get fillStyle() { return ''; },
            set strokeStyle(v) {}, get strokeStyle() { return ''; },
            set globalCompositeOperation(v) {}, get globalCompositeOperation() { return ''; },
            set font(v) {}, set lineWidth(v) {}
          }
        : null,
    width: 0,
    height: 0
  };
  el.classList = makeClassList(el);
  Object.setPrototypeOf(el, ShimNode.prototype);
  return el;
}

function createTextNode(t) {
  const n = { nodeType: 3, textContent: String(t), tagName: null, parentNode: null, childNodes: [] };
  Object.setPrototypeOf(n, ShimNode.prototype);
  return n;
}

/* ------------------------------------------------------------------ *
 * Selector matching
 *
 * querySelectorAll used to return [] unconditionally, which silently
 * disabled every render loop that iterates over elements — a page whose
 * whole output came from one of those loops passed while rendering nothing.
 *
 * The app's entire selector surface is `#id`, `.class`, `tag`, `[attr]`,
 * `[attr=value]` and tag+attribute compounds like `canvas[data-scale-canvas]`,
 * with no combinators anywhere, so a small matcher covers all of it.
 * ------------------------------------------------------------------ */

const SIMPLE = /#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:\s*=\s*["']?([^\]"']*)["']?)?\]/g;

const camel = (attr) => attr.replace(/^data-/, '').replace(/-(\w)/g, (_, c) => c.toUpperCase());

/** dataset and attributes are separate stores in this shim; data-* can be in either. */
function attrValue(el, name) {
  if (name.startsWith('data-')) {
    const key = camel(name);
    if (el.dataset && el.dataset[key] !== undefined) return el.dataset[key];
  }
  return el.getAttribute ? el.getAttribute(name) : null;
}

function hasClass(el, cls) {
  if (el.classList?.contains(cls)) return true;
  return String(el.getAttribute?.('class') || '').split(/\s+/).includes(cls);
}

function matchesSelector(el, sel) {
  if (!el || !el.tagName) return false;
  let rest = String(sel).trim();
  const type = /^([a-zA-Z][\w-]*)/.exec(rest);
  if (type) {
    if (el.tagName.toLowerCase() !== type[1].toLowerCase()) return false;
    rest = rest.slice(type[1].length);
  }
  SIMPLE.lastIndex = 0;
  let m;
  let sawSimple = false;
  while ((m = SIMPLE.exec(rest))) {
    sawSimple = true;
    const [, id, cls, attr, value] = m;
    if (id !== undefined) {
      if (attrValue(el, 'id') !== id) return false;
    } else if (cls !== undefined) {
      if (!hasClass(el, cls)) return false;
    } else {
      const have = attrValue(el, attr);
      if (have === null || have === undefined) return false;
      if (value !== undefined && String(have) !== value) return false;
    }
  }
  return sawSimple || Boolean(type);
}

function queryAll(root, sel, out = []) {
  for (const child of root.childNodes || []) {
    if (!child.tagName) continue;
    if (matchesSelector(child, sel)) out.push(child);
    queryAll(child, sel, out);
  }
  return out;
}

/** Make `el` genuinely satisfy `sel`, so the tree walk can find it. */
function applySelector(el, sel) {
  let rest = String(sel).trim();
  const type = /^([a-zA-Z][\w-]*)/.exec(rest);
  if (type) rest = rest.slice(type[1].length);
  SIMPLE.lastIndex = 0;
  let m;
  while ((m = SIMPLE.exec(rest))) {
    const [, id, cls, attr, value] = m;
    if (id !== undefined) el.setAttribute('id', id);
    else if (cls !== undefined) el.classList.add(cls);
    else el.setAttribute(attr, value ?? '');
  }
}

/** The tag a selector demands, so a `canvas[…]` hook mounts as a canvas. */
const selectorTag = (sel) => /^([a-zA-Z][\w-]*)/.exec(String(sel).trim())?.[1] || 'div';

function makeDocument(bodyPage) {
  const head = createElement('head');
  const body = createElement('body');
  body.dataset.page = bodyPage;

  const documentElement = createElement('html');
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  const doc = {
    head, body,
    documentElement,
    createElement,
    createElementNS: (ns, tag) => createElement(tag, ns),
    createTextNode,
    createDocumentFragment: () => {
      const f = createElement('fragment');
      f._isFragment = true;
      return f;
    },
    getElementById: (id) => queryAll(documentElement, `#${id}`)[0] || null,
    querySelector: (sel) => queryAll(documentElement, sel)[0] || null,
    querySelectorAll: (sel) => queryAll(documentElement, sel),
    addEventListener() {},
    removeEventListener() {},
    hidden: false,
    activeElement: null,
    // Mount an element that really matches `sel`, rather than memoising the
    // string, so the page finds it by any selector it actually satisfies.
    _register: (sel, el) => { applySelector(el, sel); body.appendChild(el); return el; }
  };
  return doc;
}

/* ================================================================== *
 * 3. Load each page module
 * ================================================================== */

/**
 * Elements to mount before a page module loads, standing in for the markup it
 * expects to find. A hook is either a selector string, or an object:
 *
 *   { sel, dataset, expect }
 *
 * `dataset` seeds the values the page reads off the element. `expect` is a
 * selector the hook must satisfy *after* the page has run — either on the
 * element it was replaced by, or on something rendered inside it. Use it where
 * a node count proves nothing, as with a generated portrait: a canvas is a
 * leaf, so "did it render" is a question about the canvas, not about children.
 */
const PAGE_HOOKS = {
  'home.js': ['.hero', '[data-marquee]', '[data-featured-grid]', '[data-tools-grid]', '[data-demo-outcomes]', '[data-species-grid]', '[data-journal-list]'],
  'collection.js': ['[data-filters]', '[data-results]', '[data-result-count]', '[data-active-filters]', '[data-sort]', '[data-clear-filters]'],
  'animal.js': ['[data-animal-root]'],
  'tools.js': ['[data-tools-grid]', '[data-tools-detail]'],
  'gene-lab.js': ['[data-tool-controls]', '[data-tool-output]'],
  'codex.js': ['[data-codex-controls]', '[data-codex-results]'],
  'valuation.js': ['[data-tool-controls]', '[data-tool-output]'],
  'clutch.js': ['[data-tool-controls]', '[data-tool-output]'],
  'husbandry.js': ['[data-tool-controls]', '[data-tool-output]'],
  'feeding.js': ['[data-tool-controls]', '[data-tool-output]'],
  'snake-care.js': ['[data-tool-controls]', '[data-tool-output]'],
  'shipping.js': ['[data-tool-controls]', '[data-tool-output]'],
  'legality.js': ['[data-tool-controls]', '[data-tool-output]'],
  'quarantine.js': ['[data-tool-controls]', '[data-tool-output]'],
  'concierge.js': ['[data-concierge-form]', '[data-concierge-aside]'],
  'journal.js': ['[data-journal-full]'],
  'vault.js': ['[data-vault-root]'],
  'compare.js': ['[data-compare-root]'],
  // The placeholder is replaced by a generated portrait, and mountScaleCanvases
  // paints it synchronously here (the shim window has no IntersectionObserver,
  // so scales.js takes its paint-everything-now branch).
  'provenance.js': [
    { sel: '[data-feature-canvas]', dataset: { featureCanvas: 'vs-bp-0158' }, expect: 'canvas[data-painted="true"]' }
  ],
  // The founder cards carry photographs as of 6614e4a. They are the whole
  // point of the page, and until now nothing here ran at all.
  'sulawesi-retics.js': [
    { sel: '[data-film]', dataset: { film: 'sulawesi' }, expect: 'video' },
    { sel: '[data-sulawesi-founder]', dataset: { sulawesiFounder: 'male' }, expect: 'img[src]' },
    { sel: '[data-sulawesi-founder]', dataset: { sulawesiFounder: 'female' }, expect: 'img[src]' },
    { sel: '[data-sulawesi-video]', dataset: { sulawesiVideo: 'male' }, expect: '.founder-film-placeholder' },
    { sel: '[data-sulawesi-video]', dataset: { sulawesiVideo: 'female' }, expect: '.founder-film-placeholder' }
  ],
  'acquire.js': ['[data-acquire-payment]', '[data-acquire-faq]'],
  'doc.js': [{ sel: '[data-doc]', dataset: { doc: 'privacy' } }],
  'basic.js': []
};

/**
 * Query strings that force each page down its *populated* path rather than its
 * empty state. Without these the smoke test proves only that the modules load,
 * not that the interesting rendering code runs.
 */
const PAGE_QUERY = {
  'animal.js': '?id=vs-bp-0141',
  'codex.js': '?gene=clown',
  'gene-lab.js': '?sire=vs-bp-0141&dam=vs-bp-0163',
  'husbandry.js': '?species=reticulated-python&weight=3400',
  'feeding.js': '?species=emerald-tree-boa&weight=1420',
  'legality.js': '?species=reticulated-python',
  'concierge.js': '?animal=vs-bp-0158',
  'collection.js': '?species=ball-python&status=available&sort=price-desc'
};

/** Pre-seed client state so the Vault and comparison render populated. */
const SEED = {
  'vscale:vault': JSON.stringify({ v: 1, ids: ['vs-bp-0141', 'vs-gt-0019', 'vs-rt-0044'] }),
  'vscale:compare': JSON.stringify({ v: 1, ids: ['vs-bp-0141', 'vs-bp-0163'] }),
  'vscale:recent': JSON.stringify({ v: 1, ids: ['vs-bp-0170'] })
};

const store = new Map();

const normalizeHook = (hook) => (typeof hook === 'string' ? { sel: hook } : hook);

function installGlobals(page, hooks) {
  const doc = makeDocument(page);
  const mounted = [];
  for (const hook of hooks) {
    const spec = normalizeHook(hook);
    const el = createElement(selectorTag(spec.sel));
    doc._register(spec.sel, el);
    // After _register, so an explicit value wins over the bare data-* the
    // selector itself implies.
    if (spec.dataset) Object.assign(el.dataset, spec.dataset);
    mounted.push({ spec, el });
  }
  doc._register('#site-header-host', createElement('div'));
  doc._register('#site-footer-host', createElement('div'));

  globalThis.document = doc;
  globalThis.window = {
    location: { search: PAGE_QUERY[`${page}.js`] || '', pathname: '/', hostname: 'localhost', protocol: 'http:', href: 'http://localhost/' },
    scrollY: 0, innerWidth: 1440, innerHeight: 900,
    addEventListener() {}, removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    requestAnimationFrame: (fn) => { fn(0); return 1; },
    cancelAnimationFrame() {},
    scrollTo() {},
    print() {},
    history: { pushState() {}, replaceState() {} },
    localStorage: undefined,
    getComputedStyle: () => ({ getPropertyValue: () => '' })
  };
  globalThis.location = globalThis.window.location;
  globalThis.history = globalThis.window.history;
  // Node exposes navigator as a getter-only global; redefine rather than assign.
  Object.defineProperty(globalThis, 'navigator', {
    value: { serviceWorker: undefined, clipboard: { writeText: async () => {} } },
    configurable: true,
    writable: true
  });
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
  globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.setInterval = () => 0;
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  globalThis.fetch = async () => { throw new Error('offline in smoke test'); };
  globalThis.FormData = class { constructor() {} get() { return ''; } entries() { return []; } };
  globalThis.URLSearchParams = URLSearchParams;
  return mounted;
}

function countNodes(el) {
  let n = 1;
  for (const c of el.childNodes || []) n += countNodes(c);
  return n;
}

/** Follow replaceWith, so a swapped-out placeholder is judged on its successor. */
function resolveReplacement(el) {
  let node = el;
  while (node._replacedBy) node = node._replacedBy;
  return node;
}

const pagesDir = join(ROOT, 'assets', 'js', 'pages');
const pageFiles = readdirSync(pagesDir).filter((f) => f.endsWith('.js'));

for (const file of pageFiles) {
  const hooks = PAGE_HOOKS[file];
  if (hooks === undefined) {
    problems.push(`tools/smoke.mjs has no hook definition for pages/${file} — add one`);
    continue;
  }
  store.clear();
  for (const [k, v] of Object.entries(SEED)) store.set(k, v);
  const mounted = installGlobals(basename(file, '.js'), hooks);
  try {
    // Cache-bust so each page gets a fresh module graph against fresh globals.
    await import(`${pathToFileURL(join(pagesDir, file)).href}?t=${Date.now()}${Math.random()}`);
    // Count what was actually rendered. A page that silently fell through to
    // its empty state would otherwise report as a pass.
    for (const { spec, el } of mounted) {
      if (!spec.expect) continue;
      const node = resolveReplacement(el);
      const ok = matchesSelector(node, spec.expect) || queryAll(node, spec.expect).length > 0;
      if (!ok) {
        problems.push(`pages/${file}: ${spec.sel} produced nothing matching "${spec.expect}"`);
      }
    }
    const checks = mounted.filter(({ spec }) => spec.expect).length;
    const counted = mounted.filter(({ spec }) => !spec.expect);
    const total = counted
      .map(({ el }) => countNodes(resolveReplacement(el)))
      .reduce((a, b) => a + b, 0);
    if (counted.length && total < 6) {
      problems.push(`pages/${file} rendered only ${total} nodes — likely fell through to an empty state`);
    }
    // Say which of the two it was verified by, so a page checked only by
    // assertion no longer reports a bare "0 nodes" and reads as unrendered.
    const detail = [
      counted.length ? `${total} nodes` : null,
      checks ? `${checks} check${checks === 1 ? '' : 's'}` : null
    ].filter(Boolean).join(', ') || 'shell only';
    process.stdout.write(`  ok  pages/${file}`.padEnd(32) + detail.padStart(13) + '\n');
  } catch (err) {
    problems.push(`pages/${file} threw on load: ${err.message}`);
    process.stdout.write(`  ✗   pages/${file}\n`);
  }
}

/* ================================================================== */

console.log(`\nchecked ${jsFiles.length} modules, ${pageFiles.length} page entry points\n`);
if (problems.length) {
  console.log('PROBLEMS');
  for (const p of problems) console.log('  ✗ ' + p);
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('smoke test passed');
