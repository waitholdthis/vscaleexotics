/**
 * Display formatting.
 *
 * Buyers are international, so weight, length and currency all switch on a
 * stored preference. Currency conversion uses a fixed indicative table and is
 * labelled as such in the UI — quoting a live rate we cannot honour at
 * settlement would be worse than quoting none.
 */

import { prefs } from './store.js';

/** Indicative only. Reviewed periodically; every quote settles in USD. */
export const FX = {
  USD: { rate: 1, symbol: '$', locale: 'en-US' },
  EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
  GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
  CAD: { rate: 1.37, symbol: 'CA$', locale: 'en-CA' },
  AUD: { rate: 1.52, symbol: 'A$', locale: 'en-AU' },
  JPY: { rate: 157, symbol: '¥', locale: 'ja-JP' },
  AED: { rate: 3.67, symbol: 'AED', locale: 'en-AE' }
};

export const FX_REVIEWED = '2026-07-01';

export function money(usd, opts = {}) {
  if (usd == null) return 'Price on application';
  const code = opts.currency || prefs.get('currency') || 'USD';
  const fx = FX[code] || FX.USD;
  const value = usd * fx.rate;
  try {
    return new Intl.NumberFormat(fx.locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'JPY' ? 0 : value >= 1000 ? 0 : 2,
      minimumFractionDigits: 0
    }).format(value);
  } catch {
    return `${fx.symbol}${Math.round(value).toLocaleString('en-US')}`;
  }
}

export function weight(grams, opts = {}) {
  if (grams == null) return '—';
  const system = opts.units || prefs.get('units') || 'imperial';
  if (system === 'metric') {
    return grams >= 1000 ? `${(grams / 1000).toFixed(2).replace(/\.?0+$/, '')} kg` : `${Math.round(grams)} g`;
  }
  const oz = grams / 28.3495;
  if (oz < 16) return `${oz.toFixed(1)} oz`;
  const lb = oz / 16;
  return `${lb.toFixed(lb < 10 ? 1 : 0)} lb`;
}

/** Always shows both — husbandry gets people in trouble when they convert badly. */
export function weightBoth(grams) {
  if (grams == null) return '—';
  const g = grams >= 1000 ? `${(grams / 1000).toFixed(2).replace(/\.?0+$/, '')} kg` : `${Math.round(grams)} g`;
  const oz = grams / 28.3495;
  const imp = oz < 16 ? `${oz.toFixed(1)} oz` : `${(oz / 16).toFixed(1)} lb`;
  return `${g} · ${imp}`;
}

export function length(inches, opts = {}) {
  if (inches == null) return '—';
  const system = opts.units || prefs.get('units') || 'imperial';
  if (system === 'metric') {
    const cm = inches * 2.54;
    return cm >= 100 ? `${(cm / 100).toFixed(2).replace(/\.?0+$/, '')} m` : `${Math.round(cm)} cm`;
  }
  if (inches >= 24) {
    const ft = Math.floor(inches / 12);
    const rem = Math.round(inches % 12);
    return rem ? `${ft}′ ${rem}″` : `${ft}′`;
  }
  return `${Math.round(inches)}″`;
}

export function lengthRange(range, opts) {
  return `${length(range[0], opts)} – ${length(range[1], opts)}`;
}

export function temp(f, opts = {}) {
  const system = opts.units || prefs.get('units') || 'imperial';
  return system === 'metric' ? `${Math.round(((f - 32) * 5) / 9)}°C` : `${f}°F`;
}

export function tempRange(range, opts) {
  const system = (opts && opts.units) || prefs.get('units') || 'imperial';
  if (system === 'metric') {
    return `${Math.round(((range[0] - 32) * 5) / 9)}–${Math.round(((range[1] - 32) * 5) / 9)}°C`;
  }
  return `${range[0]}–${range[1]}°F`;
}

export function dimensions(d, opts = {}) {
  const system = opts.units || prefs.get('units') || 'imperial';
  if (system === 'metric') {
    const c = (n) => Math.round(n * 2.54);
    return `${c(d.length)} × ${c(d.width)} × ${c(d.height)} cm`;
  }
  return `${d.length}″ × ${d.width}″ × ${d.height}″`;
}

/* ------------------------------------------------------------------ */

export function date(iso, opts = {}) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: opts.long ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function ageFrom(iso, now = new Date()) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '—';
  let months = (now.getUTCFullYear() - d.getUTCFullYear()) * 12 + (now.getUTCMonth() - d.getUTCMonth());
  if (now.getUTCDate() < d.getUTCDate()) months -= 1;
  if (months < 1) {
    const days = Math.max(0, Math.round((now - d) / 86400000));
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yr ${m} mo` : `${y} years`;
}

export function daysBetween(a, b) {
  const d1 = new Date(`${a}T12:00:00Z`).getTime();
  const d2 = new Date(`${b}T12:00:00Z`).getTime();
  return Math.round((d2 - d1) / 86400000);
}

export function percent(p, digits = 1) {
  const v = p * 100;
  if (v > 0 && v < 0.05) return '<0.1%';
  return `${v.toFixed(digits).replace(/\.0$/, '')}%`;
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function titleCase(s) {
  return String(s).replace(/\b\w/g, (c) => c.toUpperCase());
}

export const sexSymbol = (sex) => (sex === 'male' ? '♂' : sex === 'female' ? '♀' : '—');
