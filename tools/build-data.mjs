/**
 * content/ → assets/js/data/*.js
 *
 * The CMS writes JSON into content/. The site runs on ES modules with no fetch
 * and no async data loading, which is what keeps every engine synchronous and
 * the runtime dependency-free. This compiles one into the other.
 *
 * The generated modules are committed so the repository is always servable as
 * a plain static site, and `tools/check.mjs` fails if they drift out of sync
 * with content/.
 *
 * Run: node tools/build-data.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'assets', 'js', 'data');

const errors = [];
const warnings = [];

if (!existsSync(CONTENT)) {
  console.error('content/ does not exist. Run: node tools/extract-content.mjs');
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Load
 * ------------------------------------------------------------------ */

function readDir(name) {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return { __file: `${name}/${f}`, ...JSON.parse(readFileSync(join(dir, f), 'utf8')) };
      } catch (e) {
        errors.push(`${name}/${f}: invalid JSON — ${e.message}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || String(a.id).localeCompare(String(b.id)));
}

const species = readDir('species');
const loci = readDir('loci');
const genes = readDir('genes');
const inventory = readDir('inventory');
const journal = readDir('journal');

let site = {};
try {
  site = JSON.parse(readFileSync(join(CONTENT, 'settings', 'site.json'), 'utf8'));
} catch (e) {
  errors.push(`settings/site.json: ${e.message}`);
}

/* ------------------------------------------------------------------ *
 * Validate — a CMS lets people type anything, so referential integrity
 * is checked here rather than discovered as a broken page in production.
 * ------------------------------------------------------------------ */

const speciesIds = new Set(species.map((s) => s.id));
const locusIds = new Set(loci.map((l) => l.id));
const geneIds = new Set(genes.map((g) => g.id));
const INHERITANCE = new Set(['recessive', 'incdom', 'dominant', 'polygenic', 'locality']);
const STATUS = new Set(['available', 'reserved', 'hold', 'sold']);
const TIER = new Set(['flagship', 'collector', 'foundation']);
const SEX = new Set(['male', 'female', 'unsexed']);
const QUALITY = new Set(['exceptional', 'strong', 'typical', 'modest']);
const ID_RE = /^[a-z0-9-]{2,40}$/;

for (const s of species) {
  if (!ID_RE.test(s.id || '')) errors.push(`${s.__file}: id "${s.id}" must be lowercase letters, digits and hyphens`);
  if (!s.maturityWeight) errors.push(`${s.__file}: maturityWeight is required — life-stage and prey sizing depend on it`);
}

// Every gene's locus must exist, either as a declared locus or implicitly as
// its own single-gene locus. Only declared loci can carry combination names.
const declaredLocusGenes = new Set();
for (const g of genes) {
  if (!ID_RE.test(g.id || '')) errors.push(`${g.__file}: id "${g.id}" is not a valid identifier`);
  if (!speciesIds.has(g.species)) errors.push(`${g.__file}: unknown species "${g.species}"`);
  if (!INHERITANCE.has(g.inheritance)) errors.push(`${g.__file}: inheritance "${g.inheritance}" is not one of ${[...INHERITANCE].join(', ')}`);
  if (!g.locus) errors.push(`${g.__file}: locus is required`);
  if (locusIds.has(g.locus)) declaredLocusGenes.add(g.id);
  if (g.inheritance === 'incdom' && !g.superName) {
    warnings.push(`${g.__file}: co-dominant gene has no superName; the engine will fall back to "Super ${g.name}"`);
  }
}

for (const l of loci) {
  if (!speciesIds.has(l.species)) errors.push(`${l.__file}: unknown species "${l.species}"`);
  for (const c of l.combos || []) {
    if (!Array.isArray(c.alleles) || c.alleles.length !== 2) {
      errors.push(`${l.__file}: combo "${c.name}" must list exactly two alleles`);
      continue;
    }
    for (const a of c.alleles) {
      if (!geneIds.has(a)) errors.push(`${l.__file}: combo "${c.name}" references unknown gene "${a}"`);
      else {
        const g = genes.find((x) => x.id === a);
        if (g && g.locus !== l.id) {
          errors.push(`${l.__file}: combo "${c.name}" references "${a}", which belongs to locus "${g.locus}" — alleles in a combo must share the locus`);
        }
      }
    }
  }
}

const seenSku = new Map();
for (const a of inventory) {
  if (!ID_RE.test(a.id || '')) errors.push(`${a.__file}: id "${a.id}" is not a valid identifier`);
  if (!speciesIds.has(a.species)) errors.push(`${a.__file}: unknown species "${a.species}"`);
  if (!STATUS.has(a.status)) errors.push(`${a.__file}: status "${a.status}" is not one of ${[...STATUS].join(', ')}`);
  if (!TIER.has(a.tier)) errors.push(`${a.__file}: tier "${a.tier}" is not one of ${[...TIER].join(', ')}`);
  if (!SEX.has(a.sex)) errors.push(`${a.__file}: sex "${a.sex}" is not one of ${[...SEX].join(', ')}`);
  if (a.quality && !QUALITY.has(a.quality)) errors.push(`${a.__file}: quality "${a.quality}" is not recognised`);
  if (!a.weight || a.weight <= 0) errors.push(`${a.__file}: weight must be a positive number of grams`);

  if (seenSku.has(a.sku)) errors.push(`${a.__file}: SKU "${a.sku}" already used by ${seenSku.get(a.sku)}`);
  else seenSku.set(a.sku, a.__file);

  for (const t of a.traits || []) {
    const g = genes.find((x) => x.id === t.geneId);
    if (!g) { errors.push(`${a.__file}: unknown gene "${t.geneId}"`); continue; }
    if (g.species !== a.species) {
      errors.push(`${a.__file}: gene "${t.geneId}" belongs to ${g.species}, but this animal is ${a.species}`);
    }
    if (!['het', 'homo'].includes(t.zygosity)) {
      errors.push(`${a.__file}: gene "${t.geneId}" has invalid zygosity "${t.zygosity}"`);
    }
  }

  // Two alleles of one locus is the maximum an animal can carry.
  const perLocus = {};
  for (const t of a.traits || []) {
    const g = genes.find((x) => x.id === t.geneId);
    if (!g) continue;
    perLocus[g.locus] = (perLocus[g.locus] || 0) + (t.zygosity === 'homo' ? 2 : 1);
  }
  for (const [locus, count] of Object.entries(perLocus)) {
    if (count > 2) {
      errors.push(`${a.__file}: carries ${count} alleles at locus "${locus}" — an animal has only two slots there`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.hatched || '')) errors.push(`${a.__file}: hatched must be YYYY-MM-DD`);
  for (const w of a.weights || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.date || '')) errors.push(`${a.__file}: weight entry has invalid date "${w.date}"`);
  }
}

if (errors.length) {
  console.error(`\n${errors.length} content error(s):\n`);
  for (const e of errors) console.error('  ✗ ' + e);
  console.error('\nNothing was written. Fix the content and run again.\n');
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Serialise to readable JS
 * ------------------------------------------------------------------ */

function js(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return quote(value);

  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const allScalar = value.every((v) => typeof v !== 'object' || v === null);
    if (allScalar) {
      const inline = `[${value.map((v) => js(v)).join(', ')}]`;
      if (inline.length + pad.length <= 96) return inline;
    }
    return `[\n${value.map((v) => padIn + js(v, indent + 1)).join(',\n')}\n${pad}]`;
  }

  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  if (!entries.length) return '{}';
  const inline = `{ ${entries.map(([k, v]) => `${key(k)}: ${js(v)}`).join(', ')} }`;
  if (inline.length + pad.length <= 96 && !entries.some(([, v]) => typeof v === 'object' && v !== null)) {
    return inline;
  }
  return `{\n${entries.map(([k, v]) => `${padIn}${key(k)}: ${js(v, indent + 1)}`).join(',\n')}\n${pad}}`;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (k) => (IDENT.test(k) ? k : quote(k));

function quote(s) {
  // Single quotes to match the house style; escape only what must be escaped.
  const body = String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `'${body}'`;
}

const BANNER = (source) => `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Compiled from ${source} by tools/build-data.mjs.
 * Edit the content through the CMS at /admin/, or edit the JSON directly, then
 * run \`node tools/build-data.mjs\`. Hand edits here are overwritten and
 * tools/check.mjs will fail while this file is out of sync with content/.
 */
`;

/* ------------------------------------------------------------------ *
 * Emit
 * ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true });

/* ---- species.js ---- */

const speciesOut = species.map((s) => ({
  id: s.id,
  common: s.common,
  scientific: s.scientific,
  family: s.family,
  origin: s.origin,
  biome: s.biome,
  adultLength: [s.adultLengthMin, s.adultLengthMax],
  adultWeight: [s.adultWeightMin, s.adultWeightMax],
  maturityWeight: s.maturityWeight,
  lifespan: [s.lifespanMin, s.lifespanMax],
  difficulty: s.difficulty,
  temperament: s.temperament,
  venomous: !!s.venomous,
  ...(s.venomNote ? { venomNote: s.venomNote } : {}),
  cites: s.cites,
  lacey: false,
  basePrice: s.basePrice,
  blurb: s.blurb,
  care: {
    enclosureMin: [s.care.enclosureLength, s.care.enclosureWidth, s.care.enclosureHeight],
    warmSide: [s.care.warmSideMin, s.care.warmSideMax],
    coolSide: [s.care.coolSideMin, s.care.coolSideMax],
    ambient: [s.care.ambientMin, s.care.ambientMax],
    humidity: [s.care.humidityMin, s.care.humidityMax],
    humiditySpike: [s.care.humiditySpikeMin, s.care.humiditySpikeMax],
    substrate: s.care.substrate,
    lighting: s.care.lighting,
    water: s.care.water,
    hides: s.care.hides,
    feedingAdult: s.care.feedingAdult,
    notes: s.care.notes
  },
  palette: s.palette,
  pattern: s.pattern
}));

writeFileSync(
  join(OUT, 'species.js'),
  `${BANNER('content/species/*.json')}
/**
 * Husbandry figures are a starting specification, not veterinary advice.
 * Temperatures are Fahrenheit, lengths inches, weights grams.
 */

export const SPECIES = ${js(speciesOut, 0)};

export const SPECIES_BY_ID = Object.freeze(
  Object.fromEntries(SPECIES.map((s) => [s.id, s]))
);

export function getSpecies(id) {
  return SPECIES_BY_ID[id] || null;
}
`,
  'utf8'
);

/* ---- genes.js ---- */

const lociOut = loci.map((l) => ({
  id: l.id,
  species: l.species,
  name: l.name,
  ...(l.note ? { note: l.note } : {}),
  combos: Object.fromEntries(
    (l.combos || [])
      .map((c) => [[...c.alleles].sort().join('|'), c.name])
      .sort((a, b) => a[0].localeCompare(b[0]))
  )
}));

const genesOut = genes.map((g) => ({
  id: g.id,
  name: g.name,
  species: g.species,
  locus: g.locus,
  inheritance: g.inheritance,
  ...(g.aliases && g.aliases.length ? { aliases: g.aliases } : {}),
  ...(g.superName ? { superName: g.superName } : {}),
  rarity: g.rarity,
  mult: g.mult,
  ...(g.year ? { year: g.year } : {}),
  ...(g.originator ? { originator: g.originator } : {}),
  ...(g.effect ? { effect: g.effect } : {}),
  ...(g.lethality ? { lethality: g.lethality } : {}),
  ...(g.lethalityNote ? { lethalityNote: g.lethalityNote } : {}),
  ...(g.restricted ? { restricted: true } : {})
}));

writeFileSync(
  join(OUT, 'genes.js'),
  `${BANNER('content/genes/*.json and content/loci/*.json')}
/**
 * The model is locus-based rather than gene-based. Several of the most valuable
 * traits are *alleles of the same locus*, so they cannot be inherited
 * independently and their pairings produce named combination phenotypes.
 *
 *   inheritance:
 *     'recessive'  — one copy invisible ("het"), two copies visual
 *     'incdom'     — one copy visual, two copies a distinct "super" form
 *     'dominant'   — one copy visual, two copies visually identical
 *     'polygenic'  — line-bred, not Mendelian
 *     'locality'   — geographic line, tracked for provenance not inheritance
 *
 *   lethality:
 *     'super-lethal'  — homozygous form is not viable
 *     'super-defect'  — homozygous form is viable but carries known defects
 *     'wobble'        — heterozygous form carries a neurological syndrome
 */

export const WILD = '+';

export const LOCI = ${js(lociOut, 0)};

export const LOCI_BY_ID = Object.freeze(Object.fromEntries(LOCI.map((l) => [l.id, l])));

export const GENES = ${js(genesOut, 0)};

export const GENES_BY_ID = Object.freeze(Object.fromEntries(GENES.map((x) => [x.id, x])));

export function genesForSpecies(speciesId) {
  return GENES.filter((x) => x.species === speciesId);
}

export function getGene(id) {
  return GENES_BY_ID[id] || null;
}

/** Alleles are Mendelian only when the inheritance mode says so. */
export function isMendelian(gene) {
  return gene && (gene.inheritance === 'recessive' || gene.inheritance === 'incdom' || gene.inheritance === 'dominant');
}

/** Look up a named combination for two alleles sharing a locus. */
export function comboName(locusId, alleleA, alleleB) {
  const locus = LOCI_BY_ID[locusId];
  if (!locus || !locus.combos) return null;
  const key = [alleleA, alleleB].sort().join('|');
  return locus.combos[key] || null;
}
`,
  'utf8'
);

/* ---- inventory.js ---- */

const inventoryOut = inventory.map((a) => ({
  id: a.id,
  sku: a.sku,
  species: a.species,
  ...(a.quality && a.quality !== 'typical' ? { quality: a.quality } : {}),
  title: a.title,
  traits: (a.traits || []).map((t) => ({ geneId: t.geneId, zygosity: t.zygosity })),
  sex: a.sex,
  hatched: a.hatched,
  weight: a.weight,
  price: a.price ?? null,
  status: a.status,
  tier: a.tier,
  ...(a.featured ? { featured: true } : {}),
  lineage: {
    sire: a.lineage.sire,
    dam: a.lineage.dam,
    generation: a.lineage.generation,
    ...(a.lineage.dwarfPercent != null ? { dwarfPercent: a.lineage.dwarfPercent } : {})
  },
  weights: (a.weights || []).map((w) => [w.date, w.grams]),
  // Only emitted when photographs exist; their absence is what makes the
  // renderer fall back to a portrait generated from the animal's genetics.
  ...(Array.isArray(a.images) && a.images.length
    ? { images: a.images.map((i) => (typeof i === 'string' ? i : i.src)).filter(Boolean) }
    : {}),
  feeding: a.feeding,
  story: a.story,
  provenance: a.provenance,
  ...(a.notes ? { notes: a.notes } : {})
}));

writeFileSync(
  join(OUT, 'inventory.js'),
  `${BANNER('content/inventory/*.json')}
/**
 * \`traits\` is the genetic truth for each animal. It drives the title, the
 * valuation model, the procedural portrait and the gene-lab "load this animal"
 * action, so a listing cannot drift from its genetics.
 *
 * Prices are USD. \`price: null\` means Price On Application.
 */

/** @typedef {'available'|'reserved'|'hold'|'sold'} Status */

export const INVENTORY = ${js(inventoryOut, 0)};

export const INVENTORY_BY_ID = Object.freeze(Object.fromEntries(INVENTORY.map((a) => [a.id, a])));

export const STATUS_LABEL = Object.freeze({
  available: 'Available',
  reserved: 'Reserved',
  hold: 'Breeding Hold',
  sold: 'Sold'
});

export const TIER_LABEL = Object.freeze({
  flagship: 'Flagship',
  collector: 'Collector',
  foundation: 'Foundation'
});

export function getAnimal(id) {
  return INVENTORY_BY_ID[id] || null;
}

export function availableAnimals() {
  return INVENTORY.filter((a) => a.status === 'available');
}
`,
  'utf8'
);

/* ---- journal.js ---- */

const journalOut = journal.map((j) => ({
  id: j.id,
  title: j.title,
  date: j.date,
  tag: j.tag,
  readMinutes: j.readMinutes,
  excerpt: j.excerpt
}));

writeFileSync(
  join(OUT, 'journal.js'),
  `${BANNER('content/journal/*.json')}
export const JOURNAL = ${js(journalOut, 0)};

export const JOURNAL_BY_ID = Object.freeze(Object.fromEntries(JOURNAL.map((j) => [j.id, j])));
`,
  'utf8'
);

/* ---- site.js ---- */

writeFileSync(
  join(OUT, 'site.js'),
  `${BANNER('content/settings/site.json')}
export const SITE = ${js(site, 0)};
`,
  'utf8'
);

/* ------------------------------------------------------------------ */

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  ~ ' + w);
}

console.log(
  `\nbuilt assets/js/data/ from content/: ` +
  `${species.length} species, ${loci.length} loci, ${genes.length} genes, ` +
  `${inventory.length} animals, ${journal.length} journal entries`
);
