/**
 * Market valuation model.
 *
 * Multiplying every gene multiplier together overstates badly once you get
 * past three genes — the market does not pay linearly for stacking. This model
 * applies a decaying exponent to each successive multiplier, which reproduces
 * observed pricing far more closely: the headline gene carries most of the
 * value and each additional gene contributes progressively less.
 *
 * Output is an estimate with a confidence band, not an appraisal.
 */

import { GENES_BY_ID } from '../data/genes.js';
import { SPECIES_BY_ID } from '../data/species.js';

/** How much of a recessive's visual value a single hidden copy carries. */
const HET_RETENTION = 0.32;

/** Value added by a super form over the single-copy form. */
const SUPER_UPLIFT = 1.22;

/** Exponent applied to the nth-largest multiplier (index 0 = largest). */
function decay(index) {
  return Math.max(0.45, Math.pow(0.82, index));
}

/**
 * @param {{geneId:string, zygosity:'het'|'homo'}} trait
 * @returns {{multiplier:number, label:string, kind:string}|null}
 */
export function traitMultiplier(trait) {
  const gene = GENES_BY_ID[trait.geneId];
  if (!gene) return null;
  const base = gene.mult || 1;

  switch (gene.inheritance) {
    case 'recessive':
      return trait.zygosity === 'homo'
        ? { multiplier: base, label: gene.name, kind: 'visual recessive' }
        : { multiplier: 1 + (base - 1) * HET_RETENTION, label: `het ${gene.name}`, kind: 'heterozygous' };
    case 'incdom':
      return trait.zygosity === 'homo'
        ? { multiplier: base * SUPER_UPLIFT, label: gene.superName || `Super ${gene.name}`, kind: 'super form' }
        : { multiplier: base, label: gene.name, kind: 'co-dominant' };
    case 'dominant':
      return { multiplier: base, label: gene.name, kind: 'dominant' };
    case 'locality':
      return { multiplier: base, label: gene.name, kind: 'locality' };
    case 'polygenic':
      return { multiplier: base, label: gene.name, kind: 'line-bred' };
    default:
      return { multiplier: base, label: gene.name, kind: 'other' };
  }
}

export function sexFactor(speciesId, sex) {
  // Females carry a premium in every species we handle — they are the
  // production bottleneck and mature to a larger, more valuable animal.
  if (sex === 'female') return 1.28;
  if (sex === 'male') return 0.92;
  return 1;
}

export function maturityFactor(speciesId, weightGrams) {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp || !weightGrams) return 1;
  const mature = sp.maturityWeight || sp.adultWeight[0];
  const ratio = Math.min(1, weightGrams / mature);
  // Established, well-started animals carry a premium over fresh hatchlings;
  // the curve flattens once the animal is clearly out of danger.
  return 0.86 + 0.34 * Math.sqrt(ratio);
}

export const QUALITY_GRADES = [
  { id: 'exceptional', label: 'Exceptional expression', factor: 1.45, note: 'Top few percent of the clutch — the animal you keep photographs of.' },
  { id: 'strong', label: 'Strong expression', factor: 1.15, note: 'Clearly above average for the combination.' },
  { id: 'typical', label: 'Typical expression', factor: 1.0, note: 'Represents the combination accurately.' },
  { id: 'modest', label: 'Modest expression', factor: 0.82, note: 'Genetically correct but visually understated.' }
];

/**
 * @param {object} input
 * @param {string} input.species
 * @param {{geneId:string,zygosity:string}[]} input.traits
 * @param {'male'|'female'|'unsexed'} [input.sex]
 * @param {number} [input.weight] grams
 * @param {string} [input.quality]
 * @param {boolean} [input.proven] proven breeder
 */
export function valuate(input) {
  const sp = SPECIES_BY_ID[input.species];
  if (!sp) throw new Error(`Unknown species "${input.species}".`);

  const base = sp.basePrice;
  const contributions = (input.traits || [])
    .map(traitMultiplier)
    .filter(Boolean)
    .sort((a, b) => b.multiplier - a.multiplier);

  let geneFactor = 1;
  const breakdown = contributions.map((c, i) => {
    const applied = Math.pow(c.multiplier, decay(i));
    geneFactor *= applied;
    return { ...c, applied, position: i + 1 };
  });

  const sf = sexFactor(input.species, input.sex);
  const mf = maturityFactor(input.species, input.weight);
  const quality = QUALITY_GRADES.find((q) => q.id === (input.quality || 'typical')) || QUALITY_GRADES[2];
  const provenFactor = input.proven ? 1.35 : 1;

  const point = base * geneFactor * sf * mf * quality.factor * provenFactor;

  // Band widens with genetic complexity — thin markets are less predictable.
  const spread = Math.min(0.42, 0.16 + contributions.length * 0.035);

  return {
    species: sp,
    base,
    geneFactor: round(geneFactor, 3),
    sexFactor: sf,
    maturityFactor: round(mf, 3),
    qualityFactor: quality.factor,
    provenFactor,
    breakdown,
    low: roundPrice(point * (1 - spread)),
    point: roundPrice(point),
    high: roundPrice(point * (1 + spread)),
    spread,
    confidence: contributions.length <= 2 ? 'high' : contributions.length <= 4 ? 'moderate' : 'indicative',
    liquidity: liquidityFor(contributions, sp)
  };
}

function liquidityFor(contributions, sp) {
  const topRarity = Math.max(0, ...contributions.map((c) => GENES_BY_ID[c.label] ? 0 : 0));
  void topRarity;
  const n = contributions.length;
  if (sp.difficulty >= 4 && n >= 3) {
    return { level: 'thin', note: 'A small pool of qualified buyers. Expect a longer time to sale and a wider negotiating range.' };
  }
  if (n >= 5) {
    return { level: 'specialist', note: 'Highly specific combination. Value is real but realising it depends on finding the one buyer who wants exactly this.' };
  }
  if (n <= 1) {
    return { level: 'deep', note: 'Broad, liquid demand. Straightforward to place at the estimated figure.' };
  }
  return { level: 'healthy', note: 'Well-established demand for this combination.' };
}

function round(n, d) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function roundPrice(n) {
  if (n >= 10000) return Math.round(n / 500) * 500;
  if (n >= 2000) return Math.round(n / 100) * 100;
  if (n >= 500) return Math.round(n / 50) * 50;
  return Math.round(n / 10) * 10;
}

/** Rarity score 1–10 for an animal, driven by its scarcest gene plus stack depth. */
export function rarityScore(traits) {
  if (!traits || !traits.length) return 2;
  const rarities = traits
    .map((t) => {
      const g = GENES_BY_ID[t.geneId];
      if (!g) return 0;
      return t.zygosity === 'homo' && g.inheritance !== 'recessive' ? g.rarity + 1 : g.rarity;
    })
    .sort((a, b) => b - a);
  const top = rarities[0] || 0;
  const depth = Math.min(2.5, (rarities.length - 1) * 0.6);
  return Math.max(1, Math.min(10, Math.round((top + depth) * 10) / 10));
}
