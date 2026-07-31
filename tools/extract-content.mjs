/**
 * One-time extractor: current JS data modules → content/ JSON.
 *
 * This exists to seed the CMS from the data that already exists, losslessly.
 * After the first run, `content/` is the source of truth and this script should
 * never be run again — running it would overwrite editor changes with whatever
 * happens to be in the generated modules.
 *
 * It refuses to run if content/ already exists, unless --force is passed.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const FORCE = process.argv.includes('--force');

if (existsSync(CONTENT) && !FORCE) {
  console.error('content/ already exists. This is a one-time seeding script.');
  console.error('Editing content should happen through the CMS, not by re-running this.');
  console.error('Pass --force only if you are certain you want to overwrite it.');
  process.exit(1);
}

const load = async (p) => import(pathToFileURL(join(ROOT, 'assets/js/data', p)).href);
const { SPECIES } = await load('species.js');
const { GENES, LOCI } = await load('genes.js');
const { INVENTORY } = await load('inventory.js');
const { JOURNAL } = await load('journal.js');
const { SITE } = await import(pathToFileURL(join(ROOT, 'assets/js/core/sitemap.js')).href);

function write(relPath, data) {
  const full = join(CONTENT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

if (FORCE && existsSync(CONTENT)) rmSync(CONTENT, { recursive: true, force: true });

/* ------------------------------------------------------------------ *
 * Species — flatten `care` and `palette` so the CMS form is readable.
 * ------------------------------------------------------------------ */

for (const [i, s] of SPECIES.entries()) {
  write(`species/${s.id}.json`, {
    order: i,
    id: s.id,
    common: s.common,
    scientific: s.scientific,
    family: s.family,
    origin: s.origin,
    biome: s.biome,
    adultLengthMin: s.adultLength[0],
    adultLengthMax: s.adultLength[1],
    adultWeightMin: s.adultWeight[0],
    adultWeightMax: s.adultWeight[1],
    maturityWeight: s.maturityWeight,
    lifespanMin: s.lifespan[0],
    lifespanMax: s.lifespan[1],
    difficulty: s.difficulty,
    temperament: s.temperament,
    venomous: !!s.venomous,
    venomNote: s.venomNote || '',
    cites: s.cites,
    basePrice: s.basePrice,
    blurb: s.blurb,
    pattern: s.pattern,
    palette: s.palette,
    care: {
      enclosureLength: s.care.enclosureMin[0],
      enclosureWidth: s.care.enclosureMin[1],
      enclosureHeight: s.care.enclosureMin[2],
      warmSideMin: s.care.warmSide[0],
      warmSideMax: s.care.warmSide[1],
      coolSideMin: s.care.coolSide[0],
      coolSideMax: s.care.coolSide[1],
      ambientMin: s.care.ambient[0],
      ambientMax: s.care.ambient[1],
      humidityMin: s.care.humidity[0],
      humidityMax: s.care.humidity[1],
      humiditySpikeMin: s.care.humiditySpike[0],
      humiditySpikeMax: s.care.humiditySpike[1],
      substrate: s.care.substrate,
      lighting: s.care.lighting,
      water: s.care.water,
      hides: s.care.hides,
      feedingAdult: s.care.feedingAdult,
      notes: s.care.notes
    }
  });
}

/* ------------------------------------------------------------------ *
 * Loci — `combos` is a map keyed by "alleleA|alleleB", which no form UI
 * handles well. Stored as a list of {alleles: [...], name} instead.
 * ------------------------------------------------------------------ */

for (const [i, l] of LOCI.entries()) {
  write(`loci/${l.id}.json`, {
    order: i,
    id: l.id,
    species: l.species,
    name: l.name,
    note: l.note || '',
    combos: Object.entries(l.combos || {}).map(([key, name]) => ({
      alleles: key.split('|'),
      name
    }))
  });
}

/* ------------------------------------------------------------------ *
 * Genes
 * ------------------------------------------------------------------ */

for (const [i, g] of GENES.entries()) {
  write(`genes/${g.id}.json`, {
    order: i,
    id: g.id,
    name: g.name,
    aliases: g.aliases || [],
    species: g.species,
    locus: g.locus,
    inheritance: g.inheritance,
    superName: g.superName || '',
    rarity: g.rarity ?? 1,
    mult: g.mult ?? 1,
    year: g.year ?? null,
    originator: g.originator || '',
    effect: g.effect || '',
    lethality: g.lethality || '',
    lethalityNote: g.lethalityNote || '',
    restricted: !!g.restricted
  });
}

/* ------------------------------------------------------------------ *
 * Inventory — weight series becomes objects rather than tuples so the
 * CMS can render labelled fields.
 * ------------------------------------------------------------------ */

for (const [i, a] of INVENTORY.entries()) {
  write(`inventory/${a.id}.json`, {
    order: i,
    id: a.id,
    sku: a.sku,
    species: a.species,
    quality: a.quality || 'typical',
    title: a.title,
    traits: (a.traits || []).map((t) => ({ geneId: t.geneId, zygosity: t.zygosity })),
    sex: a.sex,
    hatched: a.hatched,
    weight: a.weight,
    price: a.price ?? null,
    status: a.status,
    tier: a.tier,
    featured: !!a.featured,
    lineage: {
      sire: a.lineage?.sire || '',
      dam: a.lineage?.dam || '',
      generation: a.lineage?.generation || '',
      dwarfPercent: a.lineage?.dwarfPercent ?? null
    },
    weights: (a.weights || []).map(([date, grams]) => ({ date, grams })),
    feeding: {
      prey: a.feeding.prey,
      size: a.feeding.size,
      interval: a.feeding.interval,
      lastFed: a.feeding.lastFed,
      consecutive: a.feeding.consecutive,
      refusals: a.feeding.refusals
    },
    story: a.story,
    provenance: a.provenance,
    notes: a.notes || ''
  });
}

/* ------------------------------------------------------------------ *
 * Journal
 * ------------------------------------------------------------------ */

for (const [i, j] of JOURNAL.entries()) {
  write(`journal/${j.id}.json`, {
    order: i,
    id: j.id,
    title: j.title,
    date: j.date,
    tag: j.tag,
    readMinutes: j.readMinutes,
    excerpt: j.excerpt
  });
}

/* ------------------------------------------------------------------ *
 * Site settings
 * ------------------------------------------------------------------ */

write('settings/site.json', {
  name: SITE.name,
  tagline: SITE.tagline,
  legalName: SITE.legalName,
  origin: SITE.origin,
  locality: SITE.locality,
  region: SITE.region,
  regionCode: SITE.regionCode,
  country: SITE.country,
  founded: SITE.founded,
  email: SITE.email,
  phone: SITE.phone,
  hours: SITE.hours
});

console.log(
  `seeded content/: ${SPECIES.length} species, ${LOCI.length} loci, ${GENES.length} genes, ` +
  `${INVENTORY.length} animals, ${JOURNAL.length} journal entries, 1 settings file`
);
