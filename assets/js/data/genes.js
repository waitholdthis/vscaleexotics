/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Compiled from content/genes/*.json and content/loci/*.json by tools/build-data.mjs.
 * Edit the content through the CMS at /admin/, or edit the JSON directly, then
 * run `node tools/build-data.mjs`. Hand edits here are overwritten and
 * tools/check.mjs will fail while this file is out of sync with content/.
 */

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

export const LOCI = [
  {
    id: 'bp-bel',
    species: 'ball-python',
    name: 'Blue-Eyed Leucistic complex',
    note: 'Nine alleles at one locus. Any two of them together produce a leucistic or near-leucistic animal — this is why "Mojave x Lesser" makes a BEL and not a Mojave Lesser.',
    combos: {
      'butter|butter': 'Blue-Eyed Leucistic',
      'butter|lesser': 'Blue-Eyed Leucistic',
      'butter|mojave': 'Blue-Eyed Leucistic',
      'daddy|daddy': 'Super Daddy',
      'daddy|lesser': 'Blue-Eyed Leucistic',
      'daddy|mojave': 'Blue-Eyed Leucistic',
      'lesser|lesser': 'Blue-Eyed Leucistic',
      'lesser|mojave': 'Blue-Eyed Leucistic',
      'lesser|phantom': 'Phantom Lesser',
      'lesser|russo': 'Blue-Eyed Leucistic',
      'lesser|special': 'Super Special-type Leucistic',
      'mojave|mojave': 'Blue-Eyed Leucistic',
      'mojave|mystic': 'Mystic Mojave',
      'mojave|phantom': 'Sulfur',
      'mojave|russo': 'Blue-Eyed Leucistic',
      'mystic|mystic': 'Super Mystic',
      'mystic|phantom': 'Mystic Potion',
      'phantom|phantom': 'Super Phantom',
      'russo|russo': 'Blue-Eyed Leucistic',
      'special|special': 'Super Special'
    }
  },
  {
    id: 'bp-cinnamon',
    species: 'ball-python',
    name: 'Cinnamon / Black Pastel complex',
    note: 'Cinnamon and Black Pastel are allelic; their super forms are darkening and carry known kink risk.',
    combos: {
      'blackpastel|blackpastel': 'Super Black Pastel',
      'blackpastel|cinnamon': 'Super Cinnamon / Black Pastel',
      'cinnamon|cinnamon': 'Super Cinnamon'
    }
  },
  {
    id: 'bp-spider',
    species: 'ball-python',
    name: 'Spider / Champagne / Woma complex',
    note: 'All three alleles carry neurological "wobble" to varying degrees and no homozygous form has ever been produced viably. VScale does not breed or place animals from this locus.',
    combos: {
      'champagne|champagne': 'Non-viable',
      'champagne|hgw': 'Champagne Woma',
      'champagne|spider': 'Champagne Spider',
      'hgw|hgw': 'Non-viable',
      'hgw|spider': 'Woma Spider',
      'spider|spider': 'Non-viable'
    }
  },
  {
    id: 'bp-fire',
    species: 'ball-python',
    name: 'Fire / Vanilla complex',
    combos: {
      'fire|fire': 'Black-Eyed Leucistic',
      'fire|vanilla': 'Black-Eyed Leucistic',
      'vanilla|vanilla': 'Super Vanilla'
    }
  },
  {
    id: 'bp-yellowbelly',
    species: 'ball-python',
    name: 'Yellow Belly / Asphalt complex',
    combos: {
      'asphalt|asphalt': 'Super Asphalt',
      'asphalt|gravel': 'Freeway',
      'asphalt|specter': 'Motorway',
      'asphalt|yellowbelly': 'Ivory-type',
      'gravel|gravel': 'Super Gravel',
      'gravel|specter': 'Highway',
      'gravel|yellowbelly': 'Ivory-type',
      'specter|specter': 'Super Specter',
      'specter|yellowbelly': 'Ivory-type',
      'yellowbelly|yellowbelly': 'Ivory'
    }
  },
  {
    id: 'bp-albino',
    species: 'ball-python',
    name: 'Albino / Candy complex',
    note: 'Candy and Toffee are allelic to Albino; pairing them produces the Candino and Toffino combinations.',
    combos: {
      'albino|albino': 'Albino',
      'albino|candy': 'Candino',
      'albino|toffee': 'Toffino',
      'candy|candy': 'Candy',
      'candy|toffee': 'Candy Toffee',
      'toffee|toffee': 'Toffee'
    }
  },
  {
    id: 'bp-hypo',
    species: 'ball-python',
    name: 'Hypo / Ghost complex',
    combos: {
      'hypo|hypo': 'Hypo',
      'hypo|orangeghost': 'Ghost Combo',
      'orangeghost|orangeghost': 'Orange Ghost'
    }
  },
  {
    id: 'boa-albino',
    species: 'boa-constrictor',
    name: 'Albino complex',
    note: 'Kahl and Sharp albino strains are NOT compatible — pairing them yields all normal-looking double hets.',
    combos: { 'kahl|kahl': 'Kahl Albino', 'sharp|sharp': 'Sharp Albino' }
  },
  {
    id: 'retic-albino',
    species: 'reticulated-python',
    name: 'Albino complex',
    combos: {
      'lavenderalbino-r|lavenderalbino-r': 'Lavender Albino',
      'lavenderalbino-r|purplealbino': 'Purple/Lavender Albino',
      'lavenderalbino-r|whitealbino': 'Lavender/White Albino',
      'purplealbino|purplealbino': 'Purple Albino',
      'purplealbino|whitealbino': 'Purple/White Albino',
      'whitealbino|whitealbino': 'White Albino'
    }
  }
];

export const LOCI_BY_ID = Object.freeze(Object.fromEntries(LOCI.map((l) => [l.id, l])));

export const GENES = [
  {
    id: 'pastel',
    name: 'Pastel',
    species: 'ball-python',
    locus: 'pastel',
    inheritance: 'incdom',
    superName: 'Super Pastel',
    rarity: 1,
    mult: 1.15,
    year: 1997,
    originator: 'Graziani Reptiles',
    effect: 'Lightens ground colour, blushes the dorsal blotches and brightens the head. The workhorse of designer ball python breeding.'
  },
  {
    id: 'enchi',
    name: 'Enchi',
    species: 'ball-python',
    locus: 'enchi',
    inheritance: 'incdom',
    superName: 'Super Enchi',
    rarity: 2,
    mult: 1.3,
    year: 2002,
    originator: 'Lars Brandell',
    effect: 'Compresses and elongates the pattern, intensifies orange saturation along the flanks. Improves almost every combination it enters.'
  },
  {
    id: 'clown',
    name: 'Clown',
    species: 'ball-python',
    locus: 'clown',
    inheritance: 'recessive',
    rarity: 5,
    mult: 3.2,
    year: 1999,
    originator: 'Dave & Tracy Barker',
    effect: 'Reduces the pattern to a solid dorsal stripe with clean, washed flanks and a distinctive teardrop facial marking. One of the two most transformative recessives.'
  },
  {
    id: 'piebald',
    name: 'Piebald',
    species: 'ball-python',
    locus: 'piebald',
    inheritance: 'recessive',
    aliases: ['Pied'],
    rarity: 5,
    mult: 2.6,
    year: 1997,
    originator: 'Peter Kahl',
    effect: 'Randomly distributed unpigmented white regions against normally patterned areas. Every animal is unrepeatable; high-white expression commands a substantial premium.'
  },
  {
    id: 'albino',
    name: 'Albino',
    species: 'ball-python',
    locus: 'bp-albino',
    inheritance: 'recessive',
    aliases: ['T-negative Albino'],
    rarity: 3,
    mult: 2,
    year: 1992,
    originator: 'Bob Clark',
    effect: 'Complete absence of melanin. White ground with yellow blotching and pink-red eyes. The original ball python recessive.'
  },
  {
    id: 'candy',
    name: 'Candy',
    species: 'ball-python',
    locus: 'bp-albino',
    inheritance: 'recessive',
    rarity: 7,
    mult: 4.5,
    year: 2007,
    originator: 'NERD',
    effect: 'A T-positive albino allelic to Albino. Retains lavender and pink tones the classic Albino loses.'
  },
  {
    id: 'toffee',
    name: 'Toffee',
    species: 'ball-python',
    locus: 'bp-albino',
    inheritance: 'recessive',
    rarity: 7,
    mult: 4.2,
    year: 2008,
    originator: 'NERD',
    effect: 'Allelic T-positive line producing caramel and butterscotch tones with dark eyes.'
  },
  {
    id: 'lavenderalbino',
    name: 'Lavender Albino',
    species: 'ball-python',
    locus: 'lavenderalbino',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3.6,
    year: 2001,
    originator: 'Ralph Davis',
    effect: 'Albinism over a lavender-grey ground rather than white. Ruby eyes. Independent of the Albino locus.'
  },
  {
    id: 'desertghost',
    name: 'Desert Ghost',
    species: 'ball-python',
    locus: 'desertghost',
    inheritance: 'recessive',
    aliases: ['DG'],
    rarity: 6,
    mult: 3.8,
    year: 2005,
    originator: 'Ozzy Boids',
    effect: 'Progressively brightens with age into deep gold and copper, with reduced black. Adults are dramatically superior to hatchlings — this gene must be bought on the parents.'
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    species: 'ball-python',
    locus: 'monsoon',
    inheritance: 'recessive',
    rarity: 10,
    mult: 45,
    year: 2014,
    originator: 'Justin Kobylka',
    effect: 'Fractures the pattern into fine speckled static across the entire animal. Among the rarest and most valuable recessives in the species.'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    species: 'ball-python',
    locus: 'sunset',
    inheritance: 'recessive',
    rarity: 10,
    mult: 38,
    year: 2012,
    originator: 'Ozzy Boids',
    effect: 'Deep mahogany-red saturation with near-total pattern loss in adults. Fewer than a few hundred exist worldwide.'
  },
  {
    id: 'stranger',
    name: 'Stranger',
    species: 'ball-python',
    locus: 'stranger',
    inheritance: 'recessive',
    rarity: 10,
    mult: 42,
    year: 2016,
    originator: 'Private line',
    effect: 'Extreme pattern aberrancy with lavender wash. Only a handful of proven producers exist outside the originating collection.'
  },
  {
    id: 'geneticstripe',
    name: 'Genetic Stripe',
    species: 'ball-python',
    locus: 'geneticstripe',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.2,
    year: 1999,
    originator: 'NERD',
    effect: 'A clean, unbroken dorsal stripe running the full body length over a reduced flank pattern.'
  },
  {
    id: 'ultramel',
    name: 'Ultramel',
    species: 'ball-python',
    locus: 'ultramel',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3.4,
    year: 2013,
    originator: 'Outback Reptiles',
    effect: 'Intermediate melanin reduction — softer than Albino, with orange-caramel tones and dark red eyes.'
  },
  {
    id: 'hypo',
    name: 'Hypo',
    species: 'ball-python',
    locus: 'bp-hypo',
    inheritance: 'recessive',
    aliases: ['Ghost', 'Orange Ghost Hypo'],
    rarity: 3,
    mult: 1.8,
    year: 1994,
    originator: 'Multiple',
    effect: 'Reduced melanin producing a soft, hazed appearance. Combines exceptionally with almost every dominant gene.'
  },
  {
    id: 'orangeghost',
    name: 'Orange Ghost',
    species: 'ball-python',
    locus: 'bp-hypo',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.1,
    year: 1996,
    originator: 'Multiple',
    effect: 'Hypomelanistic line skewed strongly toward orange rather than grey.'
  },
  {
    id: 'axanthic',
    name: 'Axanthic (VPI)',
    species: 'ball-python',
    locus: 'axanthic-vpi',
    inheritance: 'recessive',
    rarity: 5,
    mult: 4.5,
    year: 1997,
    originator: 'VPI',
    effect: 'Removes red and yellow pigment entirely, producing a silver-to-charcoal greyscale animal. VPI, MJ, TSK and Jolliff lines are not compatible with one another.'
  },
  {
    id: 'mojave',
    name: 'Mojave',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Blue-Eyed Leucistic',
    rarity: 2,
    mult: 1.35,
    year: 2000,
    originator: 'The Snake Keeper',
    effect: 'Darkens and cleans the flanks with distinctive alien-head outlining. The most widely used BEL-complex allele.'
  },
  {
    id: 'lesser',
    name: 'Lesser',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Blue-Eyed Leucistic',
    rarity: 2,
    mult: 1.4,
    year: 2001,
    originator: 'Ralph Davis',
    effect: 'Lightens the ground to cream-tan with faded pattern edges and a clean head.'
  },
  {
    id: 'butter',
    name: 'Butter',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Blue-Eyed Leucistic',
    rarity: 2,
    mult: 1.35,
    year: 2001,
    originator: 'Reptile Industries',
    effect: 'Similar in effect to Lesser with a warmer, more golden cast.'
  },
  {
    id: 'russo',
    name: 'Russo',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Blue-Eyed Leucistic',
    rarity: 4,
    mult: 1.8,
    year: 2005,
    originator: 'Anthony Russo',
    effect: 'BEL-complex allele producing heavy flank clearing and a strongly reduced pattern.'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Super Phantom',
    rarity: 3,
    mult: 1.6,
    year: 2003,
    originator: 'Reptile Industries',
    effect: 'Muted, dusky expression with a smoky wash. Pairs with Mystic to produce Mystic Potion.'
  },
  {
    id: 'mystic',
    name: 'Mystic',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Super Mystic',
    rarity: 3,
    mult: 1.6,
    year: 2003,
    originator: 'NERD',
    effect: 'Purple-grey wash with softened pattern borders.'
  },
  {
    id: 'special',
    name: 'Special',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Super Special',
    rarity: 5,
    mult: 2.2,
    year: 2005,
    originator: 'Mike Wilbanks',
    effect: 'Rare BEL-complex allele; the super form is a strikingly clean white animal.'
  },
  {
    id: 'daddy',
    name: 'Daddy',
    species: 'ball-python',
    locus: 'bp-bel',
    inheritance: 'incdom',
    superName: 'Super Daddy',
    rarity: 5,
    mult: 2.3,
    year: 2008,
    originator: 'BHB Reptiles',
    effect: 'High-contrast BEL-complex allele with pronounced flank clearing.'
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon',
    species: 'ball-python',
    locus: 'bp-cinnamon',
    inheritance: 'incdom',
    superName: 'Super Cinnamon',
    rarity: 2,
    mult: 1.3,
    year: 2002,
    originator: 'Graziani Reptiles',
    effect: 'Rich mahogany-brown darkening with reduced pattern noise.',
    lethality: 'super-defect',
    lethalityNote: 'Super forms of this locus carry elevated incidence of vertebral kinking and duckbill.'
  },
  {
    id: 'blackpastel',
    name: 'Black Pastel',
    species: 'ball-python',
    locus: 'bp-cinnamon',
    inheritance: 'incdom',
    superName: 'Super Black Pastel',
    rarity: 2,
    mult: 1.3,
    year: 2002,
    originator: 'NERD',
    effect: 'Deep charcoal darkening; the foundation of most black-based designer projects.',
    lethality: 'super-defect',
    lethalityNote: 'Super forms of this locus carry elevated incidence of vertebral kinking and duckbill.'
  },
  {
    id: 'fire',
    name: 'Fire',
    species: 'ball-python',
    locus: 'bp-fire',
    inheritance: 'incdom',
    superName: 'Black-Eyed Leucistic',
    rarity: 2,
    mult: 1.25,
    year: 2003,
    originator: 'Rich Ihle',
    effect: 'Brightens overall tone and lifts contrast. Super form is a pure white animal with black eyes.'
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    species: 'ball-python',
    locus: 'bp-fire',
    inheritance: 'incdom',
    superName: 'Super Vanilla',
    rarity: 3,
    mult: 1.5,
    year: 2005,
    originator: 'BHB Reptiles',
    effect: 'Subtle brightening with a cream cast; allelic to Fire.'
  },
  {
    id: 'yellowbelly',
    name: 'Yellow Belly',
    species: 'ball-python',
    locus: 'bp-yellowbelly',
    inheritance: 'incdom',
    superName: 'Ivory',
    rarity: 1,
    mult: 1.2,
    year: 2002,
    originator: 'Amir Soleymani',
    effect: 'Subtle flank speckling and a distinctive belly pattern. Super form is the near-patternless Ivory.'
  },
  {
    id: 'asphalt',
    name: 'Asphalt',
    species: 'ball-python',
    locus: 'bp-yellowbelly',
    inheritance: 'incdom',
    superName: 'Super Asphalt',
    rarity: 3,
    mult: 1.6,
    year: 2007,
    originator: 'Ozzy Boids',
    effect: 'Strong grey darkening with tight banding; allelic to Yellow Belly.'
  },
  {
    id: 'gravel',
    name: 'Gravel',
    species: 'ball-python',
    locus: 'bp-yellowbelly',
    inheritance: 'incdom',
    superName: 'Super Gravel',
    rarity: 3,
    mult: 1.6,
    year: 2004,
    originator: 'Mike Wilbanks',
    effect: 'Speckled grey expression. With Specter produces the Highway combination.'
  },
  {
    id: 'specter',
    name: 'Specter',
    species: 'ball-python',
    locus: 'bp-yellowbelly',
    inheritance: 'incdom',
    superName: 'Super Specter',
    rarity: 4,
    mult: 1.9,
    year: 2008,
    originator: 'Ozzy Boids',
    effect: 'Pale, washed expression; forms Highway with Gravel and Motorway with Asphalt.'
  },
  {
    id: 'pinstripe',
    name: 'Pinstripe',
    species: 'ball-python',
    locus: 'pinstripe',
    inheritance: 'dominant',
    rarity: 2,
    mult: 1.3,
    year: 2001,
    originator: 'NERD',
    effect: 'Reduces the pattern to fine dorsal striping over a broad clean flank. Homozygous animals are visually identical to heterozygous.'
  },
  {
    id: 'leopard',
    name: 'Leopard',
    species: 'ball-python',
    locus: 'leopard',
    inheritance: 'incdom',
    superName: 'Super Leopard',
    rarity: 3,
    mult: 1.7,
    year: 2005,
    originator: 'Kevin McCurley',
    effect: 'Breaks the pattern into discrete spots with a heavily reduced dorsal. Super form approaches full pattern loss.'
  },
  {
    id: 'ghi',
    name: 'GHI',
    species: 'ball-python',
    locus: 'ghi',
    inheritance: 'incdom',
    superName: 'Super GHI',
    rarity: 4,
    mult: 2,
    year: 2007,
    originator: 'Gulf Coast Reptiles',
    effect: 'Dramatic darkening with a distinctive gold-green iridescence. One of the strongest single-gene visual impacts available.'
  },
  {
    id: 'confusion',
    name: 'Confusion',
    species: 'ball-python',
    locus: 'confusion',
    inheritance: 'incdom',
    superName: 'Super Confusion',
    rarity: 6,
    mult: 3,
    year: 2013,
    originator: 'Prehistoric Pets',
    effect: 'Pattern aberrancy that scrambles blotch boundaries. Extremely effective as a modifier in recessive combinations.'
  },
  {
    id: 'redstripe',
    name: 'Red Stripe',
    species: 'ball-python',
    locus: 'redstripe',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3.2,
    year: 2003,
    originator: 'Multiple',
    effect: 'Reduced pattern with a distinct red-orange dorsal stripe. Notoriously difficult to work with due to small clutch sizes.'
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    species: 'ball-python',
    locus: 'bamboo',
    inheritance: 'incdom',
    superName: 'Super Bamboo',
    rarity: 5,
    mult: 2.4,
    year: 2011,
    originator: 'Kinova',
    effect: 'Muted platinum-grey with a soft pattern break. Super form is a clean white-grey animal.'
  },
  {
    id: 'spider',
    name: 'Spider',
    species: 'ball-python',
    locus: 'bp-spider',
    inheritance: 'dominant',
    rarity: 1,
    mult: 1,
    year: 1999,
    originator: 'NERD',
    effect: 'Thin, web-like dorsal pattern with wide clean flanks.',
    lethality: 'wobble',
    lethalityNote: 'Every Spider carries a neurological syndrome ranging from mild head tilt to severe corkscrewing. No homozygous animal has ever been produced. VScale does not breed, buy or place animals from this locus.',
    restricted: true
  },
  {
    id: 'champagne',
    name: 'Champagne',
    species: 'ball-python',
    locus: 'bp-spider',
    inheritance: 'dominant',
    rarity: 3,
    mult: 1,
    year: 2005,
    originator: 'Amir Soleymani',
    effect: 'Near-patternless tan with a fine dorsal line.',
    lethality: 'wobble',
    lethalityNote: 'Allelic to Spider; carries wobble and a non-viable homozygous form.',
    restricted: true
  },
  {
    id: 'hgw',
    name: 'Hidden Gene Woma',
    species: 'ball-python',
    locus: 'bp-spider',
    inheritance: 'dominant',
    aliases: ['HGW'],
    rarity: 3,
    mult: 1,
    year: 2004,
    originator: 'NERD',
    effect: 'Reduced pattern with woma-like banding.',
    lethality: 'wobble',
    lethalityNote: 'Allelic to Spider; carries wobble and a non-viable homozygous form.',
    restricted: true
  },
  {
    id: 'kahl',
    name: 'Kahl Albino',
    species: 'boa-constrictor',
    locus: 'boa-albino',
    inheritance: 'recessive',
    rarity: 3,
    mult: 2.2,
    year: 1992,
    originator: 'Peter Kahl',
    effect: 'T-negative albinism producing white, orange and lavender banding with red eyes.'
  },
  {
    id: 'sharp',
    name: 'Sharp Albino',
    species: 'boa-constrictor',
    locus: 'boa-albino',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.4,
    year: 1993,
    originator: 'Doug Sharp',
    effect: 'A separate T-negative albino strain. Not compatible with Kahl — pairing the two produces normal-looking double hets.'
  },
  {
    id: 'boa-anery',
    name: 'Anerythristic',
    species: 'boa-constrictor',
    locus: 'boa-anery',
    inheritance: 'recessive',
    rarity: 3,
    mult: 1.9,
    year: 1990,
    originator: 'Multiple',
    effect: 'Removes red pigment, producing a black, silver and brown animal. Combines with Albino to make Snow.'
  },
  {
    id: 'boa-hypo',
    name: 'Hypo (Salmon)',
    species: 'boa-constrictor',
    locus: 'boa-hypo',
    inheritance: 'incdom',
    superName: 'Super Hypo',
    rarity: 2,
    mult: 1.5,
    year: 1988,
    originator: 'Rich Ihle',
    effect: 'Reduces melanin, intensifying salmon and orange tones. Super form approaches full pattern reduction.'
  },
  {
    id: 'img',
    name: 'IMG',
    species: 'boa-constrictor',
    locus: 'img',
    inheritance: 'incdom',
    superName: 'Super IMG',
    rarity: 5,
    mult: 3.4,
    year: 2004,
    originator: 'Multiple',
    effect: 'Increasing Melanin Gene. Heterozygous animals darken progressively with age; the super form is a striking pearl-lavender.'
  },
  {
    id: 'boa-motley',
    name: 'Motley',
    species: 'boa-constrictor',
    locus: 'boa-motley',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.1,
    year: 1998,
    originator: 'Multiple',
    effect: 'Connects the saddles into a continuous dorsal band with clean flanks.'
  },
  {
    id: 'boa-leopard',
    name: 'Leopard',
    species: 'boa-constrictor',
    locus: 'boa-leopard',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3.4,
    year: 2005,
    originator: 'Multiple',
    effect: 'Spotted pattern reduction with an unusual slate-blue cast in adults.'
  },
  {
    id: 'boa-jungle',
    name: 'Jungle',
    species: 'boa-constrictor',
    locus: 'boa-jungle',
    inheritance: 'incdom',
    superName: 'Super Jungle',
    rarity: 3,
    mult: 1.7,
    year: 1993,
    originator: 'Multiple',
    effect: 'Aberrant, high-contrast pattern with irregular saddles. No two animals are alike.'
  },
  {
    id: 'purplealbino',
    name: 'Purple Albino',
    species: 'reticulated-python',
    locus: 'retic-albino',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.3,
    year: 1997,
    originator: 'Bob Clark',
    effect: 'Albino strain retaining a violet cast in the ground colour.'
  },
  {
    id: 'lavenderalbino-r',
    name: 'Lavender Albino',
    species: 'reticulated-python',
    locus: 'retic-albino',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.6,
    year: 1999,
    originator: 'Multiple',
    effect: 'Allelic albino strain with a pale lavender ground and high-contrast yellow.'
  },
  {
    id: 'whitealbino',
    name: 'White Albino',
    species: 'reticulated-python',
    locus: 'retic-albino',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.7,
    year: 2000,
    originator: 'Multiple',
    effect: 'The cleanest albino strain, approaching pure white between the pattern elements.'
  },
  {
    id: 'anthrax',
    name: 'Anthrax',
    species: 'reticulated-python',
    locus: 'anthrax',
    inheritance: 'recessive',
    rarity: 8,
    mult: 3.5,
    year: 2010,
    originator: 'Prehistoric Pets',
    effect: 'Fractures the reticulation into fine black speckling over a clean ground. One of the defining modern retic recessives.'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    species: 'reticulated-python',
    locus: 'platinum',
    inheritance: 'incdom',
    superName: 'Titanium',
    rarity: 6,
    mult: 2.6,
    year: 2003,
    originator: 'Bob Clark',
    effect: 'Silvers the ground and reduces the reticulation. The super form, Titanium, is a nearly patternless silver-white animal.'
  },
  {
    id: 'tiger',
    name: 'Tiger',
    species: 'reticulated-python',
    locus: 'tiger',
    inheritance: 'incdom',
    superName: 'Super Tiger',
    rarity: 3,
    mult: 1.8,
    year: 2000,
    originator: 'Multiple',
    effect: 'Stretches the pattern into longitudinal striping. Super Tiger approaches a clean, near-patternless gold.'
  },
  {
    id: 'goldenchild',
    name: 'Golden Child',
    species: 'reticulated-python',
    locus: 'goldenchild',
    inheritance: 'incdom',
    superName: 'Super Golden Child',
    rarity: 5,
    mult: 2,
    year: 2005,
    originator: 'Multiple',
    effect: 'Intensifies gold saturation and cleans the flanks dramatically.'
  },
  {
    id: 'sunfire',
    name: 'Sunfire',
    species: 'reticulated-python',
    locus: 'sunfire',
    inheritance: 'incdom',
    superName: 'Super Sunfire',
    rarity: 4,
    mult: 2.2,
    year: 2006,
    originator: 'Multiple',
    effect: 'Adds strong orange fire and heightens iridescence across the whole animal.'
  },
  {
    id: 'motley-r',
    name: 'Motley',
    species: 'reticulated-python',
    locus: 'retic-motley',
    inheritance: 'incdom',
    superName: 'Super Motley',
    rarity: 4,
    mult: 2,
    year: 2004,
    originator: 'Multiple',
    effect: 'Aberrant pattern with connected dorsal elements.'
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    species: 'reticulated-python',
    locus: 'dwarf',
    inheritance: 'polygenic',
    rarity: 4,
    mult: 1.35,
    effect: 'Island locality size reduction. Percentage dwarf is tracked as a lineage figure rather than a Mendelian trait; higher percentages cap adult size lower.'
  },
  {
    id: 'superdwarf',
    name: 'Super Dwarf',
    species: 'reticulated-python',
    locus: 'dwarf',
    inheritance: 'polygenic',
    rarity: 6,
    mult: 1.8,
    effect: 'Kalatoa and Selayer locality lines. High-percentage super dwarf animals mature at six to eight feet, making the species genuinely keepable.'
  },
  {
    id: 'biak',
    name: 'Biak',
    species: 'green-tree-python',
    locus: 'gtp-locality',
    inheritance: 'locality',
    rarity: 3,
    mult: 1.4,
    effect: 'Island locality. Retains high yellow scattering into adulthood, larger and more assertive than mainland lines.'
  },
  {
    id: 'sorong',
    name: 'Sorong',
    species: 'green-tree-python',
    locus: 'gtp-locality',
    inheritance: 'locality',
    rarity: 4,
    mult: 1.8,
    effect: 'Mainland locality prized for the deep blue-green ground and heavy white dorsal markings.'
  },
  {
    id: 'aru',
    name: 'Aru',
    species: 'green-tree-python',
    locus: 'gtp-locality',
    inheritance: 'locality',
    rarity: 4,
    mult: 1.9,
    effect: 'Compact, deep-bodied animals with a striking blue-tinged green and clean dorsal line.'
  },
  {
    id: 'manokwari',
    name: 'Manokwari',
    species: 'green-tree-python',
    locus: 'gtp-locality',
    inheritance: 'locality',
    rarity: 5,
    mult: 2.2,
    effect: 'Heavy white and blue dorsal marking over dark green. Among the most sought-after localities.'
  },
  {
    id: 'cyclops',
    name: 'Cyclops',
    species: 'green-tree-python',
    locus: 'gtp-locality',
    inheritance: 'locality',
    rarity: 6,
    mult: 3.6,
    effect: 'Rare mountain locality with pronounced blue development and reduced yellow.'
  },
  {
    id: 'blueline',
    name: 'Blue Line',
    species: 'green-tree-python',
    locus: 'gtp-blue',
    inheritance: 'polygenic',
    rarity: 9,
    mult: 5.5,
    effect: 'Selectively intensified blue expression across generations. High-blue adults are the single most valuable serpents ever sold at auction.'
  },
  {
    id: 'gtp-highyellow',
    name: 'High Yellow',
    species: 'green-tree-python',
    locus: 'gtp-yellow',
    inheritance: 'polygenic',
    rarity: 5,
    mult: 2,
    effect: 'Line-bred retention of neonate yellow into the adult phase.'
  },
  {
    id: 'calico',
    name: 'Calico',
    species: 'green-tree-python',
    locus: 'calico',
    inheritance: 'recessive',
    rarity: 7,
    mult: 4,
    effect: 'Irregular patches of unpigmented white scales distributed across the body.'
  },
  {
    id: 'jaguar',
    name: 'Jaguar',
    species: 'carpet-python',
    locus: 'jaguar',
    inheritance: 'incdom',
    superName: 'Non-viable',
    rarity: 3,
    mult: 1.7,
    year: 1998,
    originator: 'Multiple',
    effect: 'Reduced, high-contrast pattern with a golden ground.',
    lethality: 'super-lethal',
    lethalityNote: 'The homozygous form is not viable. Jaguar also carries a variable neurological wobble.'
  },
  {
    id: 'zebra-c',
    name: 'Zebra',
    species: 'carpet-python',
    locus: 'zebra-c',
    inheritance: 'incdom',
    superName: 'Super Zebra',
    rarity: 5,
    mult: 3.4,
    effect: 'Longitudinal striping replacing the banded pattern.'
  },
  {
    id: 'caramel',
    name: 'Caramel',
    species: 'carpet-python',
    locus: 'caramel',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.4,
    effect: 'Replaces black pigment with warm caramel-brown; strongest expression at maturity.'
  },
  {
    id: 'carpet-albino',
    name: 'Albino',
    species: 'carpet-python',
    locus: 'carpet-albino',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.6,
    effect: 'Full melanin absence over the banded carpet pattern.'
  },
  {
    id: 'carpet-axanthic',
    name: 'Axanthic',
    species: 'carpet-python',
    locus: 'carpet-axanthic',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3,
    effect: 'Silver-and-charcoal greyscale expression with no yellow retention.'
  },
  {
    id: 'granite',
    name: 'Granite',
    species: 'carpet-python',
    locus: 'granite',
    inheritance: 'incdom',
    superName: 'Super Granite',
    rarity: 4,
    mult: 2,
    effect: 'Fine speckled pattern break producing a stone-like texture.'
  },
  {
    id: 'irianjaya',
    name: 'Irian Jaya',
    species: 'carpet-python',
    locus: 'carpet-locality',
    inheritance: 'locality',
    rarity: 2,
    mult: 1.2,
    effect: 'Compact locality, typically the smallest and most manageable carpet form.'
  },
  {
    id: 'jungle',
    name: 'Jungle',
    species: 'carpet-python',
    locus: 'carpet-locality',
    inheritance: 'locality',
    rarity: 3,
    mult: 1.5,
    effect: 'High-contrast black-and-gold locality; selectively bred lines are exceptionally bold.'
  },
  {
    id: 'matrix',
    name: 'Matrix',
    species: 'blood-python',
    locus: 'matrix',
    inheritance: 'incdom',
    superName: 'Goldeneye',
    rarity: 5,
    mult: 2.5,
    effect: 'Pattern fracturing with heightened contrast. The super form, Goldeneye, is a pale animal with gold irises.'
  },
  {
    id: 'blood-albino',
    name: 'Albino',
    species: 'blood-python',
    locus: 'blood-albino',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.6,
    effect: 'White ground with intense orange-red blotching and pink eyes.'
  },
  {
    id: 'ivory',
    name: 'Ivory',
    species: 'blood-python',
    locus: 'ivory',
    inheritance: 'recessive',
    rarity: 6,
    mult: 3,
    effect: 'Near-patternless cream animal with dark eyes.'
  },
  {
    id: 'batik',
    name: 'Batik',
    species: 'blood-python',
    locus: 'batik',
    inheritance: 'incdom',
    superName: 'Super Batik',
    rarity: 4,
    mult: 2,
    effect: 'Increases pattern connectivity into flowing bands along the dorsum.'
  },
  {
    id: 'anaconda',
    name: 'Anaconda',
    species: 'western-hognose',
    locus: 'anaconda',
    inheritance: 'incdom',
    superName: 'Superconda',
    rarity: 2,
    mult: 1.5,
    effect: 'Reduces dorsal blotching; the Superconda form is nearly patternless.'
  },
  {
    id: 'arctic',
    name: 'Arctic',
    species: 'western-hognose',
    locus: 'arctic',
    inheritance: 'incdom',
    superName: 'Super Arctic',
    rarity: 3,
    mult: 1.8,
    effect: 'High-contrast greyscale expression that intensifies with age.'
  },
  {
    id: 'hog-albino',
    name: 'Albino',
    species: 'western-hognose',
    locus: 'hog-albino',
    inheritance: 'recessive',
    rarity: 2,
    mult: 1.6,
    effect: 'Melanin absence producing pink, orange and white with red eyes.'
  },
  {
    id: 'hog-axanthic',
    name: 'Axanthic',
    species: 'western-hognose',
    locus: 'hog-axanthic',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.2,
    effect: 'Full greyscale; combines with Albino to produce Snow.'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    species: 'western-hognose',
    locus: 'lavender',
    inheritance: 'recessive',
    rarity: 6,
    mult: 4.2,
    effect: 'Soft lilac-grey ground with pink undertones. One of the most valuable hognose recessives.'
  },
  {
    id: 'sable',
    name: 'Sable',
    species: 'western-hognose',
    locus: 'sable',
    inheritance: 'recessive',
    rarity: 5,
    mult: 2.6,
    effect: 'Deep chocolate-brown darkening with reduced pattern definition.'
  },
  {
    id: 'toffeebelly',
    name: 'Toffeebelly',
    species: 'western-hognose',
    locus: 'toffeebelly',
    inheritance: 'recessive',
    rarity: 4,
    mult: 2.1,
    effect: 'Warm caramel tones with a distinctive clean ventral surface.'
  }
];

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
