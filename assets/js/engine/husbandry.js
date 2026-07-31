/**
 * Enclosure specification and feeding schedule derivation.
 *
 * Everything here is computed from the animal's actual mass and the species
 * record rather than read off a generic care sheet, because the two variables
 * that matter most — prey size and enclosure footprint — are functions of the
 * individual animal, not the species.
 */

import { SPECIES_BY_ID } from '../data/species.js';

/* ------------------------------------------------------------------ *
 * Life stage
 * ------------------------------------------------------------------ */

export function lifeStage(speciesId, weightGrams) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp) return null;
  // Measured against the weight at which the species is functionally mature,
  // not against mean adult mass. Using the mean badly misclassifies giants —
  // a 3.4kg reticulated python is a sub-adult, not a neonate, and prescribing
  // it neonate feeding ratios would be dangerous.
  const mature = sp.maturityWeight || sp.adultWeight[0];
  const r = weightGrams / mature;
  if (r < 0.06) return { id: 'neonate', label: 'Neonate', ratio: r };
  if (r < 0.25) return { id: 'juvenile', label: 'Juvenile', ratio: r };
  if (r < 0.7) return { id: 'subadult', label: 'Sub-adult', ratio: r };
  if (r < 1.35) return { id: 'adult', label: 'Adult', ratio: r };
  return { id: 'large-adult', label: 'Large adult', ratio: r };
}

/* ------------------------------------------------------------------ *
 * Enclosure
 * ------------------------------------------------------------------ */

/** Rodent-eating terrestrial species scale footprint to length; arboreals to height. */
const ARBOREAL = new Set(['green-tree-python', 'emerald-tree-boa']);
const SEMI_ARBOREAL = new Set(['carpet-python', 'brazilian-rainbow-boa']);

export function enclosureSpec(speciesId, weightGrams) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp) return null;
  const stage = lifeStage(speciesId, weightGrams);
  const [minL, minW, minH] = sp.care.enclosureMin;

  // Scale the minimum by how far through growth the animal is. Neonates of
  // most species do badly in adult-sized space; arboreals are the exception
  // and are sized on perch height rather than floor area throughout.
  const scale = stage.id === 'neonate' ? 0.4 : stage.id === 'juvenile' ? 0.6 : stage.id === 'subadult' ? 0.8 : 1;
  const round6 = (n) => Math.max(12, Math.round((n * scale) / 6) * 6);

  const L = round6(minL);
  const W = round6(minW);
  const H = ARBOREAL.has(speciesId) ? Math.max(24, round6(minH)) : round6(minH);

  const footprint = ((L * W) / 144).toFixed(1);
  const orientation = ARBOREAL.has(speciesId) ? 'vertical' : SEMI_ARBOREAL.has(speciesId) ? 'mixed' : 'horizontal';

  return {
    species: sp,
    stage,
    dimensions: { length: L, width: W, height: H },
    adultDimensions: { length: minL, width: minW, height: minH },
    footprintSqFt: footprint,
    orientation,
    thermal: {
      warmSide: sp.care.warmSide,
      coolSide: sp.care.coolSide,
      ambient: sp.care.ambient,
      gradient: `${sp.care.coolSide[0]}–${sp.care.warmSide[1]}°F end to end`
    },
    humidity: { standard: sp.care.humidity, shed: sp.care.humiditySpike },
    substrate: sp.care.substrate,
    lighting: sp.care.lighting,
    water: sp.care.water,
    hides: sp.care.hides,
    checklist: buildChecklist(sp, speciesId, stage, { L, W, H }),
    notes: sp.care.notes
  };
}

function buildChecklist(sp, speciesId, stage, dims) {
  const arboreal = ARBOREAL.has(speciesId);
  const semi = SEMI_ARBOREAL.has(speciesId);
  const items = [
    { group: 'Enclosure', item: `Sealed PVC or glass enclosure, ${dims.L}" × ${dims.W}" × ${dims.H}"`, critical: true },
    { group: 'Enclosure', item: 'Lockable front-opening doors with a positive latch', critical: true },
    { group: 'Heat', item: 'Radiant heat panel or deep heat projector sized to the enclosure', critical: true },
    { group: 'Heat', item: 'Proportional thermostat with probe — never an on/off dimmer', critical: true },
    { group: 'Heat', item: 'Independent secondary thermostat as an over-temperature cut-off', critical: true },
    { group: 'Monitoring', item: 'Digital thermometer and hygrometer at both ends of the gradient', critical: true },
    { group: 'Monitoring', item: 'Infrared temperature gun for surface readings', critical: false },
    { group: 'Substrate', item: `${sp.care.substrate[0]} at 2–4" depth`, critical: true },
    { group: 'Furniture', item: sp.care.lighting, critical: false },
    { group: 'Water', item: sp.care.water, critical: true }
  ];

  if (arboreal) {
    items.push(
      { group: 'Furniture', item: 'Horizontal perches at multiple heights, diameter matched to body girth', critical: true },
      { group: 'Furniture', item: 'Dense foliage cover at the upper third for security', critical: true },
      { group: 'Water', item: 'Misting system or manual misting on a fixed daily cycle', critical: true }
    );
  } else {
    items.push({ group: 'Furniture', item: `${sp.care.hides} identical tight-fitting hides, one per thermal zone`, critical: sp.care.hides > 0 });
  }
  if (semi) items.push({ group: 'Furniture', item: 'Substantial branch work — this species will use every inch of height offered', critical: false });
  if (sp.care.humiditySpike[0] >= 80) items.push({ group: 'Water', item: 'Dedicated humid hide with damp sphagnum, maintained year-round', critical: true });
  if (stage.id === 'neonate' || stage.id === 'juvenile') {
    items.push({ group: 'Enclosure', item: 'Clutter the space heavily — an under-furnished enclosure is the usual cause of feeding refusal at this stage', critical: true });
  }
  items.push(
    { group: 'Quarantine', item: 'Separate room or dedicated airflow for the first 90 days', critical: true },
    { group: 'Quarantine', item: 'Paper substrate during quarantine so waste and mites are visible', critical: true }
  );
  return items;
}

/* ------------------------------------------------------------------ *
 * Feeding
 * ------------------------------------------------------------------ */

export const PREY_ITEMS = [
  { id: 'pinky', label: 'Mouse — pinky', grams: 2 },
  { id: 'fuzzy', label: 'Mouse — fuzzy', grams: 4 },
  { id: 'hopper', label: 'Mouse — hopper', grams: 9 },
  { id: 'adult-mouse', label: 'Mouse — adult', grams: 22 },
  { id: 'jumbo-mouse', label: 'Mouse — jumbo', grams: 30 },
  { id: 'rat-pup', label: 'Rat — pup', grams: 35 },
  { id: 'rat-weaned', label: 'Rat — weaned', grams: 55 },
  { id: 'rat-small', label: 'Rat — small', grams: 90 },
  { id: 'rat-medium', label: 'Rat — medium', grams: 160 },
  { id: 'rat-large', label: 'Rat — large', grams: 250 },
  { id: 'rat-xl', label: 'Rat — extra large', grams: 380 },
  { id: 'rabbit-small', label: 'Rabbit — small', grams: 600 },
  { id: 'rabbit-medium', label: 'Rabbit — medium', grams: 1100 }
];

/**
 * Target prey mass as a share of body mass. Heavier-bodied and slower-metabolism
 * species take proportionally smaller meals; neonates take proportionally larger.
 */
function targetRatio(speciesId, stage) {
  const sp = SPECIES_BY_ID[speciesId];
  const slow = speciesId === 'emerald-tree-boa' || speciesId === 'green-tree-python';
  // Heavy-bodied species take proportionally smaller meals than their mass
  // suggests — a flat percentage badly oversizes prey for the giants.
  const heavy = sp && sp.maturityWeight >= 5000;
  const base = slow ? 0.06 : heavy ? 0.075 : 0.11;
  const byStage = { neonate: 1.3, juvenile: 1.15, subadult: 1.0, adult: 0.85, 'large-adult': 0.7 };
  // Hard ceiling: no correctly sized meal is ever a sixth of the animal.
  return Math.min(0.16, base * (byStage[stage.id] || 1));
}

function baseInterval(speciesId, stage) {
  const sp = SPECIES_BY_ID[speciesId];
  const slow = speciesId === 'emerald-tree-boa';
  const arb = speciesId === 'green-tree-python';
  const map = { neonate: 5, juvenile: 7, subadult: 10, adult: 14, 'large-adult': 18 };
  let days = map[stage.id] || 14;
  if (slow) days = Math.round(days * 1.8);
  else if (arb) days = Math.round(days * 1.45);
  else if (sp && sp.adultWeight[1] > 15000) days = Math.round(days * 1.15);
  else if (speciesId === 'western-hognose') days = Math.max(5, Math.round(days * 0.7));
  return days;
}

export function feedingPlan(speciesId, weightGrams) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp || !weightGrams) return null;
  const stage = lifeStage(speciesId, weightGrams);
  const ratio = targetRatio(speciesId, stage);
  const targetGrams = weightGrams * ratio;

  const ranked = PREY_ITEMS.map((p) => ({ ...p, delta: Math.abs(p.grams - targetGrams) })).sort((a, b) => a.delta - b.delta);
  const primary = ranked[0];
  const alternates = ranked.slice(1, 3).sort((a, b) => a.grams - b.grams);
  const interval = baseInterval(speciesId, stage);

  return {
    species: sp,
    stage,
    weightGrams,
    targetGrams: Math.round(targetGrams),
    targetPercent: (ratio * 100).toFixed(1),
    primary,
    alternates,
    interval,
    perMonth: (30 / interval).toFixed(1),
    annualPrey: Math.round(365 / interval),
    annualPreyMass: Math.round((365 / interval) * primary.grams),
    rules: feedingRules(speciesId, stage),
    warnings: feedingWarnings(speciesId, stage, primary, targetGrams)
  };
}

function feedingRules(speciesId, stage) {
  const rules = [
    'Prey width should not exceed the widest point of the animal\'s body. Width governs, not weight — weight is only a guide to which item to reach for.',
    'Frozen-thawed only. Thaw in the refrigerator overnight, then bring to 100–105°F surface temperature before offering.',
    'Do not handle for 48 hours after a feed — 96 hours for arboreal species and anything over three kilograms.',
    'Log every offering, including refusals. A feeding record is the single most useful diagnostic you will ever have.'
  ];
  if (speciesId === 'ball-python') {
    rules.push('Seasonal refusal from mature males between November and March is normal and requires no intervention beyond weight monitoring.');
  }
  if (speciesId === 'emerald-tree-boa' || speciesId === 'green-tree-python') {
    rules.push('Regurgitation is the defining hazard for this species. Err smaller and longer between meals than you think is necessary.');
  }
  if (speciesId === 'western-hognose') {
    rules.push('This species will eat well past its needs. Obesity, not undernourishment, is the common welfare failure here.');
  }
  if (stage.id === 'neonate') {
    rules.push('Offer in a small, dark, tightly enclosed space. Neonate refusal is almost always a security problem rather than an appetite one.');
  }
  return rules;
}

function feedingWarnings(speciesId, stage, primary, target) {
  const out = [];
  const drift = (primary.grams - target) / target;
  if (drift > 0.35) {
    out.push({
      level: 'caution',
      text: `The closest standard prey item is ${Math.round(drift * 100)}% heavier than the calculated target. Consider two smaller items or extending the interval rather than oversizing a single meal.`
    });
  }
  if (stage.id === 'large-adult') {
    out.push({
      level: 'caution',
      text: 'This animal is above the expected adult mass for the species. Review body condition against a visual scale and consider extending the interval before adjusting prey size.'
    });
  }
  return out;
}

/** Projected growth to a target mass at the given plan. */
export function growthProjection(speciesId, currentGrams, months = 24) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp) return [];
  const adult = (sp.adultWeight[0] + sp.adultWeight[1]) / 2;
  const out = [];
  let w = currentGrams;
  for (let m = 0; m <= months; m++) {
    out.push({ month: m, grams: Math.round(w) });
    // Logistic approach to adult mass — growth rate falls as the animal fills out.
    const headroom = Math.max(0, 1 - w / (adult * 1.05));
    const rate = 0.16 * headroom + 0.005;
    w = w * (1 + rate);
  }
  return out;
}

export const QUARANTINE_PROTOCOL = [
  { day: 0, phase: 'Intake', task: 'Unbox in the quarantine room. Photograph the animal before it leaves the container.', critical: true },
  { day: 0, phase: 'Intake', task: 'Weigh and record. This figure is the baseline every later decision is measured against.', critical: true },
  { day: 0, phase: 'Intake', task: 'Full external examination — eye caps, mouth, vent, ventral scales, any retained shed.', critical: true },
  { day: 0, phase: 'Intake', task: 'Check for mites: wipe with a white cloth, inspect the water bowl for drowned specimens the following morning.', critical: true },
  { day: 1, phase: 'Settling', task: 'No handling. Lights low. Leave the animal entirely alone.', critical: true },
  { day: 5, phase: 'Settling', task: 'First feeding attempt. Do not be concerned by a refusal at this point.', critical: false },
  { day: 7, phase: 'Observation', task: 'Weigh. Compare against intake. Inspect the enclosure for abnormal waste.', critical: true },
  { day: 14, phase: 'Observation', task: 'Second weight check. Two consecutive established feeds is the target by now.', critical: false },
  { day: 21, phase: 'Observation', task: 'Faecal sample to a reptile veterinarian for parasitology if the animal is imported or of unknown origin.', critical: false },
  { day: 30, phase: 'Mid-quarantine', task: 'Full re-examination. Mite check repeated. Weight trend reviewed.', critical: true },
  { day: 45, phase: 'Mid-quarantine', task: 'First shed cycle should have completed. Inspect for retained eye caps and tail tip.', critical: false },
  { day: 60, phase: 'Late', task: 'Weight and condition review. Feeding should be entirely routine by this point.', critical: true },
  { day: 75, phase: 'Late', task: 'Final mite inspection. Any positive result restarts the clock at day zero.', critical: true },
  { day: 90, phase: 'Release', task: 'Clear. Move to the main collection — always handled last in the daily routine for a further month.', critical: true }
];
