/**
 * Incubation and gestation timeline.
 *
 * Duration is temperature-dependent in oviparous species — the relationship is
 * close enough to linear across the narrow band anyone should actually be
 * incubating in that a reference point plus a per-degree coefficient models it
 * well. Live-bearing species are handled on a separate path entirely, because
 * gestation is not something you can tune with a thermostat.
 */

export const REPRO = {
  'ball-python': { mode: 'oviparous', refTemp: 88.5, refDays: 56, perDegree: -2.4, clutch: [4, 10], humidity: [95, 100], substrate: 'Vermiculite or perlite at 1:1 by weight with water' },
  'reticulated-python': { mode: 'oviparous', refTemp: 88.0, refDays: 85, perDegree: -3.1, clutch: [15, 45], humidity: [95, 100], substrate: 'Perlite, 1:1 by weight' },
  'green-tree-python': { mode: 'oviparous', refTemp: 88.0, refDays: 50, perDegree: -2.0, clutch: [12, 25], humidity: [98, 100], substrate: 'Perlite, suspended-egg method preferred' },
  'carpet-python': { mode: 'oviparous', refTemp: 89.0, refDays: 52, perDegree: -2.1, clutch: [10, 25], humidity: [95, 100], substrate: 'Vermiculite, 1:1 by weight' },
  'blood-python': { mode: 'oviparous', refTemp: 87.5, refDays: 68, perDegree: -2.6, clutch: [12, 30], humidity: [95, 100], substrate: 'Vermiculite, 1:1 by weight' },
  'woma-python': { mode: 'oviparous', refTemp: 89.0, refDays: 62, perDegree: -2.3, clutch: [5, 15], humidity: [90, 98], substrate: 'Vermiculite, slightly drier than for rainforest species' },
  'western-hognose': { mode: 'oviparous', refTemp: 83.0, refDays: 55, perDegree: -2.2, clutch: [6, 18], humidity: [90, 95], substrate: 'Vermiculite, 1:1 by weight' },
  'boa-constrictor': { mode: 'viviparous', gestation: [105, 120], litter: [10, 30], note: 'Gestation is measured from ovulation, which is visible as a pronounced mid-body swelling lasting 12–24 hours. Miss it and the whole timeline becomes guesswork.' },
  'brazilian-rainbow-boa': { mode: 'viviparous', gestation: [140, 160], litter: [8, 20], note: 'Post-ovulation shed occurs roughly 20 days after ovulation and is the most reliable second marker.' },
  'emerald-tree-boa': { mode: 'viviparous', gestation: [190, 240], litter: [6, 14], note: 'One of the longest gestations of any boid. Females should not be bred in consecutive years.' }
};

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

function fmt(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
}

export class IncubationError extends Error {}

/**
 * @param {{species:string, startDate:string, temp?:number, clutchSize?:number}} opts
 *   startDate = lay date for oviparous species, ovulation date for live-bearers.
 */
export function plan(opts) {
  const repro = REPRO[opts.species];
  if (!repro) throw new IncubationError('No reproductive data on file for that species.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.startDate || '')) throw new IncubationError('Enter a valid date.');

  return repro.mode === 'oviparous' ? oviparous(opts, repro) : viviparous(opts, repro);
}

function oviparous(opts, repro) {
  const temp = Number.isFinite(opts.temp) ? opts.temp : repro.refTemp;
  if (temp < 82 || temp > 93) {
    throw new IncubationError(
      `${temp}°F is outside the viable band. Incubate between 84 and 92°F — below 84 produces prolonged incubation and weak hatchlings, above 92 produces neurological defects and kinking.`
    );
  }

  const days = repro.refDays + (temp - repro.refTemp) * repro.perDegree;
  const spread = Math.max(3, days * 0.055);

  const events = [
    { day: 0, label: 'Eggs laid', detail: 'Set the eggs in the orientation they were laid in and mark the top of each. Do not rotate them at any point.', kind: 'milestone' },
    { day: 1, label: 'Set to incubator', detail: `Substrate: ${repro.substrate}. Target ${temp}°F, ${repro.humidity[0]}–${repro.humidity[1]}% RH.`, kind: 'action' },
    { day: 7, label: 'First candling', detail: 'Vascularisation should be clearly visible. Infertile slugs will be obvious and can be removed — but leave anything ambiguous in place.', kind: 'check' },
    { day: 21, label: 'Second candling', detail: 'Embryos clearly developed. Mark any egg showing dimpling or discolouration and monitor it daily.', kind: 'check' },
    { day: Math.round(days * 0.5), label: 'Midpoint', detail: 'Verify incubator calibration against an independent probe. A 1°F drift over the second half will shift the hatch by three days.', kind: 'check' },
    { day: Math.round(days - 10), label: 'Pre-pip dimpling', detail: 'Eggs begin to dimple as the embryo absorbs the remaining fluid. This is expected and is not dehydration.', kind: 'check' },
    { day: Math.round(days - spread), label: 'Pip window opens', detail: 'First slits typically appear now. Do not intervene.', kind: 'milestone' },
    { day: Math.round(days), label: 'Expected hatch', detail: 'The central estimate at this temperature.', kind: 'primary' },
    { day: Math.round(days + spread), label: 'Pip window closes', detail: 'If an egg has not pipped by now and its clutchmates hatched more than 48 hours ago, cutting may be justified — a single careful slit at the top, no further.', kind: 'milestone' },
    { day: Math.round(days + 3), label: 'Out of egg', detail: 'Neonates may remain in the shell up to 48 hours after pipping, absorbing yolk. Leave them.', kind: 'action' },
    { day: Math.round(days + 14), label: 'First shed', detail: 'Neonates shed roughly a week to ten days after emerging. No food is offered before this.', kind: 'action' },
    { day: Math.round(days + 21), label: 'First feed', detail: 'Offer after the post-natal shed completes. Expect refusals; this is normal and not a cause for concern for several weeks.', kind: 'action' }
  ];

  const clutch = opts.clutchSize || Math.round((repro.clutch[0] + repro.clutch[1]) / 2);

  return {
    mode: 'oviparous',
    temp,
    days: Math.round(days),
    spread: Math.round(spread),
    startDate: opts.startDate,
    hatchDate: addDays(opts.startDate, days),
    hatchEarly: addDays(opts.startDate, days - spread),
    hatchLate: addDays(opts.startDate, days + spread),
    clutchRange: repro.clutch,
    clutchSize: clutch,
    humidity: repro.humidity,
    substrate: repro.substrate,
    timeline: events
      .sort((a, b) => a.day - b.day)
      .map((e) => ({ ...e, date: addDays(opts.startDate, e.day), dateLabel: fmt(addDays(opts.startDate, e.day)) })),
    tempComparison: [84, 86, 88, 90, 92].map((t) => {
      const d = repro.refDays + (t - repro.refTemp) * repro.perDegree;
      return { temp: t, days: Math.round(d), date: addDays(opts.startDate, d), current: Math.abs(t - temp) < 0.5 };
    }),
    warnings: tempWarnings(temp)
  };
}

function tempWarnings(temp) {
  const out = [];
  if (temp >= 91) {
    out.push({ level: 'critical', text: 'Above 90°F the incidence of kinking, duckbill and neurological defect rises sharply. Bring the incubator down.' });
  } else if (temp >= 90) {
    out.push({ level: 'caution', text: 'At 90°F you are at the top of the acceptable band with no margin for a thermostat fault. A secondary cut-off is essential.' });
  }
  if (temp <= 85) {
    out.push({ level: 'caution', text: 'Below 86°F incubation is prolonged and hatchlings are frequently smaller and slower to establish.' });
  }
  return out;
}

function viviparous(opts, repro) {
  const [lo, hi] = repro.gestation;
  const mid = (lo + hi) / 2;
  const events = [
    { day: 0, label: 'Ovulation', detail: 'A pronounced mid-body swelling lasting 12–24 hours. This is the only reliable start point for the timeline.', kind: 'milestone' },
    { day: 20, label: 'Post-ovulation shed', detail: 'Confirms the ovulation date. If this does not occur within roughly three weeks, re-examine your assumption about the start point.', kind: 'check' },
    { day: Math.round(mid * 0.4), label: 'Visible development', detail: 'Posterior swelling becomes obvious. Feeding typically slows or stops from here — do not force it.', kind: 'check' },
    { day: Math.round(mid * 0.7), label: 'Reduce handling', detail: 'Handling should stop entirely other than for essential welfare checks.', kind: 'action' },
    { day: lo, label: 'Birth window opens', detail: 'Provide a secure, humid birthing area and leave the female undisturbed.', kind: 'milestone' },
    { day: Math.round(mid), label: 'Expected birth', detail: 'Central estimate.', kind: 'primary' },
    { day: hi, label: 'Birth window closes', detail: 'Beyond this point without a birth, seek veterinary assessment for retained or non-viable young.', kind: 'milestone' },
    { day: Math.round(mid + 10), label: 'Neonate first shed', detail: 'Live-born neonates typically shed within 7–14 days of birth.', kind: 'action' },
    { day: Math.round(mid + 18), label: 'First feed', detail: 'Offer after the post-natal shed.', kind: 'action' }
  ];

  return {
    mode: 'viviparous',
    startDate: opts.startDate,
    days: Math.round(mid),
    spread: Math.round((hi - lo) / 2),
    hatchDate: addDays(opts.startDate, mid),
    hatchEarly: addDays(opts.startDate, lo),
    hatchLate: addDays(opts.startDate, hi),
    clutchRange: repro.litter,
    clutchSize: opts.clutchSize || Math.round((repro.litter[0] + repro.litter[1]) / 2),
    note: repro.note,
    timeline: events
      .sort((a, b) => a.day - b.day)
      .map((e) => ({ ...e, date: addDays(opts.startDate, e.day), dateLabel: fmt(addDays(opts.startDate, e.day)) })),
    tempComparison: [],
    warnings: [{ level: 'note', text: repro.note }]
  };
}
