/**
 * Multi-locus punnett engine.
 *
 * Handles what most public morph calculators do not:
 *   - true allelic complexes (Mojave x Lesser must give a BEL, never a
 *     "Mojave Lesser"), including named combination phenotypes
 *   - non-viable homozygous forms, removed from the live clutch and reported
 *     separately rather than silently inflating the odds of everything else
 *   - the distinction between the genotype result (what the animal *is*) and
 *     the visual result (what a buyer can actually see), which is where
 *     "66% possible het" comes from
 *   - polygenic and locality traits, which are not Mendelian and must not be
 *     run through a punnett square at all
 */

import { GENES_BY_ID, LOCI_BY_ID, WILD, comboName } from '../data/genes.js';

const MAX_LOCI = 10;

export class GeneticsError extends Error {}

/* ------------------------------------------------------------------ *
 * Parent construction
 * ------------------------------------------------------------------ */

/**
 * @param {{geneId:string, zygosity:'het'|'homo'}[]} traits
 * @returns {{genotype: Map<string,[string,string]>, lineTraits: object[]}}
 */
export function buildParent(traits, label = 'Parent') {
  const byLocus = new Map();
  const lineTraits = [];

  for (const t of traits) {
    const gene = GENES_BY_ID[t.geneId];
    if (!gene) throw new GeneticsError(`${label}: unknown gene "${t.geneId}".`);

    if (gene.inheritance === 'polygenic' || gene.inheritance === 'locality') {
      lineTraits.push(gene);
      continue;
    }
    if (!byLocus.has(gene.locus)) byLocus.set(gene.locus, []);
    byLocus.get(gene.locus).push({ gene, zygosity: t.zygosity });
  }

  const genotype = new Map();
  for (const [locusId, entries] of byLocus) {
    const locusName = LOCI_BY_ID[locusId]?.name || entries[0].gene.name;

    if (entries.length === 1) {
      const { gene, zygosity } = entries[0];
      genotype.set(locusId, zygosity === 'homo' ? [gene.id, gene.id] : [gene.id, WILD]);
    } else if (entries.length === 2) {
      if (entries.some((e) => e.zygosity === 'homo')) {
        throw new GeneticsError(
          `${label}: cannot be homozygous for ${entries.find((e) => e.zygosity === 'homo').gene.name} ` +
            `and also carry ${entries.find((e) => e.zygosity !== 'homo').gene.name}. ` +
            `Both are alleles of the ${locusName} — an animal has only two slots there.`
        );
      }
      genotype.set(locusId, [entries[0].gene.id, entries[1].gene.id]);
    } else {
      throw new GeneticsError(
        `${label}: ${entries.length} alleles selected at the ${locusName}. An animal can carry at most two.`
      );
    }
  }

  if (genotype.size > MAX_LOCI) {
    throw new GeneticsError(`${label}: ${genotype.size} loci selected; the calculator is capped at ${MAX_LOCI}.`);
  }
  return { genotype, lineTraits, traits };
}

/* ------------------------------------------------------------------ *
 * Phenotype resolution for a single locus
 * ------------------------------------------------------------------ */

function sortPair(pair) {
  return pair[0] <= pair[1] ? [pair[0], pair[1]] : [pair[1], pair[0]];
}

/**
 * @returns {{visible: string|null, het: string|null, viable: boolean,
 *            hetGeneId: string|null, warning: string|null, genes: string[]}}
 */
export function resolveLocus(locusId, pair) {
  const [a, b] = sortPair(pair);
  const blank = { visible: null, het: null, viable: true, hetGeneId: null, warning: null, genes: [], order: 5 };

  if (a === WILD && b === WILD) return blank;

  // One wild-type allele: single-copy expression.
  if (a === WILD || b === WILD) {
    const id = a === WILD ? b : a;
    const gene = GENES_BY_ID[id];
    if (!gene) return blank;
    if (gene.inheritance === 'recessive') {
      return { ...blank, het: gene.name, hetGeneId: gene.id, genes: [gene.id] };
    }
    return {
      ...blank,
      visible: gene.name,
      genes: [gene.id],
      order: 2,
      warning: gene.lethality === 'wobble' ? `${gene.name} carries a neurological wobble.` : null
    };
  }

  // Two non-wild alleles at the same locus.
  const named = comboName(locusId, a, b);
  const geneA = GENES_BY_ID[a];
  const geneB = GENES_BY_ID[b];

  if (named === 'Non-viable') {
    return {
      visible: 'Non-viable',
      het: null,
      viable: false,
      hetGeneId: null,
      genes: [a, b],
      warning: `${geneA?.name || a} homozygous form is not viable.`
    };
  }

  if (a === b) {
    const gene = geneA;
    if (!gene) return blank;
    if (gene.lethality === 'super-lethal') {
      return {
        visible: 'Non-viable',
        het: null,
        viable: false,
        hetGeneId: null,
        genes: [a, b],
        warning: `The homozygous ${gene.name} form is not viable.`
      };
    }
    let label;
    let order;
    if (gene.inheritance === 'incdom') {
      label = named || gene.superName || `Super ${gene.name}`;
      order = 1;
    } else if (gene.inheritance === 'dominant') {
      label = named || `${gene.name} (homozygous)`;
      order = 2;
    } else {
      label = named || gene.name; // recessive visual
      order = 3;
    }
    return {
      visible: label,
      het: null,
      viable: true,
      hetGeneId: null,
      genes: [a, b],
      order,
      warning: gene.lethality === 'super-defect' ? gene.lethalityNote : null
    };
  }

  // Compound heterozygote — two different alleles of one locus.
  const label =
    named ||
    (geneA?.inheritance === 'recessive' && geneB?.inheritance === 'recessive'
      ? `${geneA.name} / ${geneB.name}`
      : `Super ${geneA?.name || a} / ${geneB?.name || b}`);

  const warn = [geneA, geneB]
    .filter((x) => x && x.lethality === 'wobble')
    .map((x) => `${x.name} carries a neurological wobble.`)
    .join(' ');

  return {
    visible: label,
    het: null,
    viable: true,
    hetGeneId: null,
    genes: [a, b],
    order: geneA?.inheritance === 'recessive' && geneB?.inheritance === 'recessive' ? 3 : 1,
    warning: warn || null
  };
}

/* ------------------------------------------------------------------ *
 * The cross
 * ------------------------------------------------------------------ */

/** All offspring allele pairs for one locus, with probabilities. */
function locusOutcomes(pairA, pairB) {
  const tally = new Map();
  for (const x of pairA) {
    for (const y of pairB) {
      const key = sortPair([x, y]).join('|');
      tally.set(key, (tally.get(key) || 0) + 0.25);
    }
  }
  return [...tally].map(([key, p]) => ({ pair: key.split('|'), p }));
}

function roundP(n) {
  return Math.round(n * 1e10) / 1e10;
}

/**
 * @param {ReturnType<typeof buildParent>} parentA
 * @param {ReturnType<typeof buildParent>} parentB
 * @param {{clutchSize?: number}} [opts]
 */
export function cross(parentA, parentB, opts = {}) {
  const clutchSize = Math.max(1, Math.min(60, opts.clutchSize || 6));
  const loci = [...new Set([...parentA.genotype.keys(), ...parentB.genotype.keys()])];

  if (loci.length > MAX_LOCI) {
    throw new GeneticsError(`${loci.length} loci in this pairing; the calculator is capped at ${MAX_LOCI}.`);
  }

  // Cartesian product across loci.
  let combos = [{ p: 1, genotype: {} }];
  for (const locusId of loci) {
    const pa = parentA.genotype.get(locusId) || [WILD, WILD];
    const pb = parentB.genotype.get(locusId) || [WILD, WILD];
    const outs = locusOutcomes(pa, pb);
    const next = [];
    for (const base of combos) {
      for (const o of outs) {
        next.push({ p: base.p * o.p, genotype: { ...base.genotype, [locusId]: o.pair } });
      }
    }
    combos = next;
  }

  // Resolve each genotype to a phenotype.
  const resolved = combos.map((c) => {
    const visible = [];
    const hets = [];
    const warnings = new Set();
    let viable = true;

    for (const locusId of loci) {
      const r = resolveLocus(locusId, c.genotype[locusId]);
      if (!r.viable) viable = false;
      if (r.visible && r.visible !== 'Non-viable') visible.push({ name: r.visible, order: r.order });
      if (r.het) hets.push({ name: r.het, geneId: r.hetGeneId });
      if (r.warning) warnings.add(r.warning);
    }

    // Conventional read order: super forms, then single-copy dominants and
    // co-dominants, then recessive visuals last. Alphabetical within a tier so
    // the same genotype always renders the same string.
    visible.sort((x, y) => x.order - y.order || x.name.localeCompare(y.name));
    const visibleName = visible.length ? visible.map((v) => v.name).join(' ') : 'Wild-type';
    return {
      p: c.p,
      genotype: c.genotype,
      viable,
      visible,
      visibleName,
      hets,
      warnings: [...warnings]
    };
  });

  // Merge identical genotype-level results.
  const merged = new Map();
  for (const r of resolved) {
    const key = r.viable
      ? r.visibleName + '||' + r.hets.map((h) => h.geneId).sort().join(',')
      : '__nonviable__';
    if (!merged.has(key)) merged.set(key, { ...r, p: 0 });
    merged.get(key).p += r.p;
  }

  const all = [...merged.values()].map((r) => ({ ...r, p: roundP(r.p) }));
  const nonViable = all.filter((r) => !r.viable).reduce((s, r) => s + r.p, 0);
  const live = all.filter((r) => r.viable);
  const liveMass = live.reduce((s, r) => s + r.p, 0) || 1;

  // Genotype view — exact, normalised against viable offspring only.
  const genotypeView = live
    .map((r) => ({
      label: describeGenotypeResult(r),
      visibleName: r.visibleName,
      hets: r.hets,
      probability: roundP(r.p / liveMass),
      rawProbability: r.p,
      warnings: r.warnings,
      genotype: r.genotype,
      expected: roundP((r.p / liveMass) * clutchSize),
      atLeastOne: roundP(1 - Math.pow(1 - r.p / liveMass, clutchSize))
    }))
    .sort((a, b) => b.probability - a.probability || a.label.localeCompare(b.label));

  // Visual view — collapse to what is actually distinguishable by eye, and
  // express hidden recessives as conditional "possible het" percentages.
  const visualMap = new Map();
  for (const r of live) {
    if (!visualMap.has(r.visibleName)) {
      visualMap.set(r.visibleName, { visibleName: r.visibleName, p: 0, hetMass: new Map(), warnings: new Set() });
    }
    const v = visualMap.get(r.visibleName);
    v.p += r.p;
    r.warnings.forEach((w) => v.warnings.add(w));
    for (const h of r.hets) {
      v.hetMass.set(h.geneId, (v.hetMass.get(h.geneId) || 0) + r.p);
    }
  }

  const visualView = [...visualMap.values()]
    .map((v) => {
      const probability = roundP(v.p / liveMass);
      const possibleHets = [...v.hetMass]
        .map(([geneId, mass]) => ({
          geneId,
          name: GENES_BY_ID[geneId]?.name || geneId,
          chance: roundP(mass / v.p)
        }))
        .sort((a, b) => b.chance - a.chance);
      return {
        visibleName: v.visibleName,
        probability,
        expected: roundP(probability * clutchSize),
        atLeastOne: roundP(1 - Math.pow(1 - probability, clutchSize)),
        possibleHets,
        warnings: [...v.warnings]
      };
    })
    .sort((a, b) => b.probability - a.probability || a.visibleName.localeCompare(b.visibleName));

  return {
    clutchSize,
    lociCount: loci.length,
    outcomeCount: genotypeView.length,
    genotypeView,
    visualView,
    nonViable: roundP(nonViable),
    lineNotes: lineNotes(parentA, parentB),
    warnings: collectPairingWarnings(parentA, parentB, nonViable)
  };
}

function describeGenotypeResult(r) {
  const hets = r.hets.map((h) => h.name);
  if (!hets.length) return r.visibleName;
  return `${r.visibleName} — het ${hets.join(', het ')}`;
}

/* ------------------------------------------------------------------ *
 * Non-Mendelian traits and pairing advisories
 * ------------------------------------------------------------------ */

function lineNotes(a, b) {
  const notes = [];
  const aIds = new Set(a.lineTraits.map((g) => g.id));
  const bIds = new Set(b.lineTraits.map((g) => g.id));
  const shared = [...aIds].filter((id) => bIds.has(id));
  const only = [...new Set([...aIds, ...bIds])].filter((id) => !shared.includes(id));

  for (const id of shared) {
    const g = GENES_BY_ID[id];
    notes.push({
      kind: 'pure',
      text: `Both parents carry ${g.name}. Offspring are pure ${g.name} and inherit the line intact.`
    });
  }
  for (const id of only) {
    const g = GENES_BY_ID[id];
    notes.push({
      kind: g.inheritance === 'locality' ? 'crossed' : 'intermediate',
      text:
        g.inheritance === 'locality'
          ? `Only one parent is ${g.name}. Offspring are a crossed locality and must be represented as such — never sold as pure ${g.name}.`
          : `${g.name} is polygenic. Offspring will express an intermediate, variable degree of it; it does not follow punnett odds.`
    });
  }
  return notes;
}

function collectPairingWarnings(a, b, nonViable) {
  const out = [];
  if (nonViable > 0) {
    out.push({
      level: 'critical',
      text: `${(nonViable * 100).toFixed(1)}% of fertilised eggs in this pairing carry a genotype that is not viable. Those embryos typically fail late in incubation. Odds shown below are normalised against surviving offspring only.`
    });
  }
  const all = [...a.traits, ...b.traits].map((t) => GENES_BY_ID[t.geneId]).filter(Boolean);
  const wobble = [...new Set(all.filter((g) => g.lethality === 'wobble').map((g) => g.name))];
  if (wobble.length) {
    out.push({
      level: 'critical',
      text: `This pairing involves ${wobble.join(' and ')}. Every animal carrying these genes has a neurological syndrome. VScale Exotics does not breed, purchase or place them, and this result is shown for reference only.`
    });
  }
  const defect = [...new Set(all.filter((g) => g.lethality === 'super-defect').map((g) => g.name))];
  if (defect.length) {
    out.push({
      level: 'caution',
      text: `${defect.join(' and ')} homozygous forms carry an elevated rate of vertebral kinking and duckbill. Screen hatchlings carefully before placing them.`
    });
  }
  const inbreedRisk = a.traits.length + b.traits.length >= 10;
  if (inbreedRisk) {
    out.push({
      level: 'note',
      text: 'High gene-count pairings compound recessive load. Confirm the two animals are not closely related before proceeding.'
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Helpers for the UI
 * ------------------------------------------------------------------ */

export function describeParent(parent) {
  if (!parent.traits.length) return 'Normal';
  const visual = [];
  const het = [];
  for (const t of parent.traits) {
    const g = GENES_BY_ID[t.geneId];
    if (!g) continue;
    if (g.inheritance === 'recessive' && t.zygosity === 'het') het.push(g.name);
    else if (g.inheritance === 'incdom' && t.zygosity === 'homo') visual.push(g.superName || `Super ${g.name}`);
    else visual.push(g.name);
  }
  const parts = [];
  if (visual.length) parts.push(visual.join(' '));
  if (het.length) parts.push(`het ${het.join(', het ')}`);
  return parts.join(' — ') || 'Normal';
}

export function formatPercent(p, digits = 1) {
  const v = p * 100;
  if (v > 0 && v < 0.05) return '<0.1%';
  if (v > 99.95 && v < 100) return '>99.9%';
  return `${v.toFixed(digits).replace(/\.0$/, '')}%`;
}

export function asFraction(p) {
  if (p <= 0) return '0';
  const denom = Math.round(1 / p);
  if (Math.abs(1 / denom - p) < 1e-6 && denom <= 4096) return `1 in ${denom}`;
  return `~1 in ${Math.round(1 / p)}`;
}
