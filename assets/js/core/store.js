/**
 * Client-side state: the Vault (saved animals), the compare tray, and display
 * preferences.
 *
 * Everything is validated on read. localStorage is user-writable, shared with
 * anything else on the origin, and survives across sessions — treating what
 * comes out of it as trusted is a real bug class, so every record is checked
 * against a shape before it is used, and anything unrecognised is dropped
 * rather than repaired.
 *
 * No personal data is stored. Ids and preference enums only.
 */

const NS = 'vscale';
const VERSION = 1;

const ID_RE = /^[a-z0-9-]{3,40}$/;
const MAX_VAULT = 200;
const MAX_COMPARE = 4;

/* ------------------------------------------------------------------ *
 * Storage with graceful degradation
 * ------------------------------------------------------------------ */

let memoryFallback = new Map();
let storageOk = null;

function canUseStorage() {
  if (storageOk !== null) return storageOk;
  try {
    const k = `${NS}:probe`;
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    storageOk = true;
  } catch {
    // Private mode, disabled storage, or quota exhausted. The site must work
    // regardless — the Vault simply becomes session-scoped.
    storageOk = false;
  }
  return storageOk;
}

function readRaw(key) {
  const k = `${NS}:${key}`;
  try {
    return canUseStorage() ? localStorage.getItem(k) : memoryFallback.get(k) ?? null;
  } catch {
    return null;
  }
}

function writeRaw(key, value) {
  const k = `${NS}:${key}`;
  try {
    if (canUseStorage()) localStorage.setItem(k, value);
    else memoryFallback.set(k, value);
    return true;
  } catch {
    // Quota — fall back to memory for the rest of the session rather than
    // throwing inside a click handler.
    storageOk = false;
    memoryFallback.set(k, value);
    return false;
  }
}

function readJSON(key, fallback) {
  const raw = readRaw(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.v !== VERSION) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function writeJSON(key, data) {
  return writeRaw(key, JSON.stringify({ ...data, v: VERSION }));
}

/* ------------------------------------------------------------------ *
 * Pub/sub
 * ------------------------------------------------------------------ */

const listeners = new Map();

export function subscribe(channel, fn) {
  if (!listeners.has(channel)) listeners.set(channel, new Set());
  listeners.get(channel).add(fn);
  return () => listeners.get(channel).delete(fn);
}

function emit(channel, payload) {
  const set = listeners.get(channel);
  if (set) for (const fn of set) { try { fn(payload); } catch (e) { console.warn(e); } }
}

// Keep tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(`${NS}:`)) return;
    const channel = e.key.slice(NS.length + 1);
    if (channel === 'vault') emit('vault', vault.list());
    if (channel === 'compare') emit('compare', compare.list());
    if (channel === 'prefs') emit('prefs', prefs.all());
  });
}

/* ------------------------------------------------------------------ *
 * Vault — saved animals
 * ------------------------------------------------------------------ */

function sanitiseIds(arr, max) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    if (typeof item !== 'string' || !ID_RE.test(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

export const vault = {
  list() {
    return sanitiseIds(readJSON('vault', {}).ids, MAX_VAULT);
  },
  has(id) {
    return this.list().includes(id);
  },
  add(id) {
    if (!ID_RE.test(id)) return this.list();
    const ids = this.list();
    if (!ids.includes(id)) ids.unshift(id);
    const next = ids.slice(0, MAX_VAULT);
    writeJSON('vault', { ids: next });
    emit('vault', next);
    return next;
  },
  remove(id) {
    const next = this.list().filter((x) => x !== id);
    writeJSON('vault', { ids: next });
    emit('vault', next);
    return next;
  },
  toggle(id) {
    return this.has(id) ? (this.remove(id), false) : (this.add(id), true);
  },
  clear() {
    writeJSON('vault', { ids: [] });
    emit('vault', []);
  }
};

/* ------------------------------------------------------------------ *
 * Compare tray
 * ------------------------------------------------------------------ */

export const compare = {
  list() {
    return sanitiseIds(readJSON('compare', {}).ids, MAX_COMPARE);
  },
  has(id) {
    return this.list().includes(id);
  },
  isFull() {
    return this.list().length >= MAX_COMPARE;
  },
  add(id) {
    if (!ID_RE.test(id)) return { ok: false, reason: 'invalid' };
    const ids = this.list();
    if (ids.includes(id)) return { ok: true, ids };
    if (ids.length >= MAX_COMPARE) return { ok: false, reason: 'full', ids };
    const next = [...ids, id];
    writeJSON('compare', { ids: next });
    emit('compare', next);
    return { ok: true, ids: next };
  },
  remove(id) {
    const next = this.list().filter((x) => x !== id);
    writeJSON('compare', { ids: next });
    emit('compare', next);
    return next;
  },
  toggle(id) {
    return this.has(id) ? (this.remove(id), { ok: true, added: false }) : { ...this.add(id), added: true };
  },
  clear() {
    writeJSON('compare', { ids: [] });
    emit('compare', []);
  },
  max: MAX_COMPARE
};

/* ------------------------------------------------------------------ *
 * Preferences
 * ------------------------------------------------------------------ */

const PREF_SCHEMA = {
  units: { values: ['metric', 'imperial'], default: 'imperial' },
  currency: { values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'AED'], default: 'USD' },
  density: { values: ['comfortable', 'compact'], default: 'comfortable' },
  layout: { values: ['grid', 'list'], default: 'grid' }
};

export const prefs = {
  all() {
    const stored = readJSON('prefs', {});
    const out = {};
    for (const [key, spec] of Object.entries(PREF_SCHEMA)) {
      const v = stored[key];
      out[key] = spec.values.includes(v) ? v : spec.default;
    }
    return out;
  },
  get(key) {
    return this.all()[key];
  },
  set(key, value) {
    const spec = PREF_SCHEMA[key];
    if (!spec || !spec.values.includes(value)) return this.all();
    const next = { ...this.all(), [key]: value };
    writeJSON('prefs', next);
    emit('prefs', next);
    return next;
  }
};

/* ------------------------------------------------------------------ *
 * Recently viewed
 * ------------------------------------------------------------------ */

export const recent = {
  list() {
    return sanitiseIds(readJSON('recent', {}).ids, 12);
  },
  push(id) {
    if (!ID_RE.test(id)) return;
    const next = [id, ...this.list().filter((x) => x !== id)].slice(0, 12);
    writeJSON('recent', { ids: next });
    emit('recent', next);
  }
};

export const storageAvailable = () => canUseStorage();
