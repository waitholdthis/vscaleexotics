/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Compiled from content/inventory/*.json by tools/build-data.mjs.
 * Edit the content through the CMS at /admin/, or edit the JSON directly, then
 * run `node tools/build-data.mjs`. Hand edits here are overwritten and
 * tools/check.mjs will fail while this file is out of sync with content/.
 */

/**
 * `traits` is the genetic truth for each animal. It drives the title, the
 * valuation model, the procedural portrait and the gene-lab "load this animal"
 * action, so a listing cannot drift from its genetics.
 *
 * Prices are USD. `price: null` means Price On Application.
 */

/** @typedef {'available'|'reserved'|'hold'|'sold'} Status */

export const INVENTORY = [
  {
    id: 'vs-bp-0141',
    sku: 'VS-BP-0141',
    species: 'ball-python',
    quality: 'exceptional',
    title: 'Monsoon',
    traits: [
      { geneId: 'monsoon', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-08-14',
    weight: 810,
    price: 28500,
    status: 'available',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Monsoon — Kobylka line', dam: 'het Monsoon — VS-BP-0088', generation: 'F3' },
    weights: [
      ['2025-09-01', 96],
      ['2025-12-01', 288],
      ['2026-03-01', 540],
      ['2026-06-01', 722],
      ['2026-07-20', 810]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-24',
      consecutive: 22,
      refusals: 0
    },
    story: 'Monsoon fractures the pattern into a fine granular static that no other gene reproduces. Fewer than four hundred visual animals are believed to exist. This male is the cleanest expression we have produced in six seasons of working the line — dense speckling with almost no residual blotching along the dorsum.',
    provenance: 'Produced in-house from a Kobylka-line sire acquired 2021. Full clutch documentation and both parent photographs transfer with the animal.',
    notes: 'Feeding on small rats without a single refusal since establishment. Exceptional temperament for the line.'
  },
  {
    id: 'vs-bp-0158',
    sku: 'VS-BP-0158',
    species: 'ball-python',
    quality: 'exceptional',
    title: 'Sunset Clown',
    traits: [
      { geneId: 'sunset', zygosity: 'homo' },
      { geneId: 'clown', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-06-02',
    weight: 1140,
    price: null,
    status: 'available',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Sunset het Clown', dam: 'Clown het Sunset', generation: 'F2' },
    weights: [
      ['2025-07-01', 88],
      ['2025-10-01', 340],
      ['2026-01-01', 640],
      ['2026-04-01', 920],
      ['2026-07-20', 1140]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 12,
      lastFed: '2026-07-22',
      consecutive: 28,
      refusals: 1
    },
    story: 'The combination the Sunset gene was always pointing toward. Clown strips the pattern to a clean dorsal band; Sunset floods what remains with mahogany and oxblood that deepens through every shed. We believe this is one of fewer than a dozen visual Sunset Clown females on the planet.',
    provenance: 'Third-generation in-house line. Both grandparents remain in our breeding collection and are available for viewing by appointment.',
    notes: 'Price on application. Serious enquiries will be asked to complete a keeper profile before we discuss terms.'
  },
  {
    id: 'vs-bp-0163',
    sku: 'VS-BP-0163',
    species: 'ball-python',
    quality: 'strong',
    title: 'Desert Ghost Clown',
    traits: [
      { geneId: 'desertghost', zygosity: 'homo' },
      { geneId: 'clown', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-07-19',
    weight: 690,
    price: 6800,
    status: 'available',
    tier: 'collector',
    featured: true,
    lineage: { sire: 'DG Clown', dam: 'Clown het DG', generation: 'F4' },
    weights: [
      ['2025-08-15', 82],
      ['2025-11-15', 268],
      ['2026-02-15', 452],
      ['2026-05-15', 604],
      ['2026-07-20', 690]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-25',
      consecutive: 19,
      refusals: 0
    },
    story: 'Desert Ghost is a gene you buy on the parents, not the hatchling — it brightens for three full years into deep gold and copper with the black almost entirely withdrawn. Paired with Clown\'s pattern reduction, the adult animal reads as a single sheet of beaten metal.',
    provenance: 'In-house, from a proven DG line established 2018.',
    notes: 'Already showing significant lightening at eleven months, which is early and a strong indicator for the adult expression.'
  },
  {
    id: 'vs-bp-0170',
    sku: 'VS-BP-0170',
    species: 'ball-python',
    quality: 'exceptional',
    title: 'Piebald',
    traits: [
      { geneId: 'piebald', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-09-08',
    weight: 560,
    price: 3200,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Pied', dam: 'het Pied', generation: 'F5' },
    weights: [
      ['2025-10-01', 78],
      ['2026-01-01', 226],
      ['2026-04-01', 398],
      ['2026-07-20', 560]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-23',
      consecutive: 17,
      refusals: 0
    },
    story: 'Approximately ninety percent white expression with three tightly defined pattern islands and a fully unpigmented head — a distribution that occurs in perhaps one hatchling in forty. Piebald is stochastic, not heritable in its degree, so a high-white animal cannot be reproduced to order.',
    provenance: 'In-house. Clutchmates ranged from 20% to this animal\'s 90% white.',
    notes: 'Head is fully white with dark eyes retained. Photographs do not do the contrast justice.'
  },
  {
    id: 'vs-bp-0177',
    sku: 'VS-BP-0177',
    species: 'ball-python',
    quality: 'strong',
    title: 'GHI Leopard Clown',
    traits: [
      { geneId: 'ghi', zygosity: 'het' },
      { geneId: 'leopard', zygosity: 'het' },
      { geneId: 'clown', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-08-30',
    weight: 640,
    price: 5400,
    status: 'reserved',
    tier: 'collector',
    lineage: { sire: 'GHI Leopard het Clown', dam: 'Clown', generation: 'F2' },
    weights: [
      ['2025-10-01', 84],
      ['2026-01-01', 264],
      ['2026-04-01', 470],
      ['2026-07-20', 640]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-24',
      consecutive: 18,
      refusals: 0
    },
    story: 'Three genes that each attack the pattern from a different direction: GHI darkens and adds a gold-green iridescence, Leopard breaks the blotching into discrete spots, Clown removes the flanks entirely. The result holds contrast that most triple combinations lose.',
    provenance: 'In-house.',
    notes: 'Reserved pending final payment. Contact the office to be placed on the waiting list for the repeat pairing.'
  },
  {
    id: 'vs-bp-0184',
    sku: 'VS-BP-0184',
    species: 'ball-python',
    title: 'Candino Enchi',
    traits: [
      { geneId: 'albino', zygosity: 'het' },
      { geneId: 'candy', zygosity: 'het' },
      { geneId: 'enchi', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-07-04',
    weight: 780,
    price: 3900,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Candy het Albino', dam: 'Albino Enchi', generation: 'F2' },
    weights: [
      ['2025-08-01', 90],
      ['2025-11-01', 302],
      ['2026-02-01', 520],
      ['2026-05-01', 682],
      ['2026-07-20', 780]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-26',
      consecutive: 21,
      refusals: 0
    },
    story: 'Candino is the compound heterozygote of two alleles at the albino locus — not a double-recessive stack, which is why it cannot be produced by simply combining two albinos. Enchi tightens the pattern and drives the orange saturation to a level the plain Candino never reaches.',
    provenance: 'In-house.',
    notes: 'Excellent feeder, notably calm. A strong foundation female for an albino-complex project.'
  },
  {
    id: 'vs-bp-0191',
    sku: 'VS-BP-0191',
    species: 'ball-python',
    title: 'Blue-Eyed Leucistic',
    traits: [
      { geneId: 'mojave', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-10-11',
    weight: 430,
    price: 950,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Mojave', dam: 'Lesser', generation: 'F3' },
    weights: [
      ['2025-11-01', 76],
      ['2026-02-01', 208],
      ['2026-05-01', 348],
      ['2026-07-20', 430]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-25',
      consecutive: 15,
      refusals: 1
    },
    story: 'A pure white animal with pale blue eyes and no residual pigment anywhere on the body. The BEL is the classic demonstration of allelic complexes — nine different genes at one locus, any two of which produce this.',
    provenance: 'In-house.',
    notes: 'Homozygous Mojave, so every offspring from this male carries a Mojave-complex allele. An efficient foundation animal.'
  },
  {
    id: 'vs-bp-0198',
    sku: 'VS-BP-0198',
    species: 'ball-python',
    title: 'Super Enchi Ultramel het Clown',
    traits: [
      { geneId: 'enchi', zygosity: 'homo' },
      { geneId: 'ultramel', zygosity: 'homo' },
      { geneId: 'clown', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-06-21',
    weight: 960,
    price: 3100,
    status: 'available',
    tier: 'collector',
    lineage: {
      sire: 'Enchi Ultramel het Clown',
      dam: 'Super Enchi het Ultramel het Clown',
      generation: 'F3'
    },
    weights: [
      ['2025-08-01', 92],
      ['2025-11-01', 348],
      ['2026-02-01', 610],
      ['2026-05-01', 840],
      ['2026-07-20', 960]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 12,
      lastFed: '2026-07-21',
      consecutive: 24,
      refusals: 0
    },
    story: 'Ultramel sits between Albino and wild-type — a partial melanin reduction that produces caramel and apricot rather than white and yellow. Super Enchi compresses the pattern into fine longitudinal bands. Carrying Clown, she is a complete project in one animal.',
    provenance: 'In-house.',
    notes: 'Clown is confirmed by pedigree, not by test breeding. Documentation supplied.'
  },
  {
    id: 'vs-bp-0205',
    sku: 'VS-BP-0205',
    species: 'ball-python',
    quality: 'strong',
    title: 'Black Pastel Piebald',
    traits: [
      { geneId: 'blackpastel', zygosity: 'het' },
      { geneId: 'piebald', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-09-25',
    weight: 520,
    price: 2200,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Black Pastel het Pied', dam: 'Pied', generation: 'F2' },
    weights: [
      ['2025-11-01', 80],
      ['2026-02-01', 244],
      ['2026-05-01', 412],
      ['2026-07-20', 520]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-24',
      consecutive: 16,
      refusals: 0
    },
    story: 'Black Pastel drives the pigmented regions toward true black, which sets up the hardest edge against Piebald\'s white that this species can produce. Roughly sixty percent white on this animal, with the pattern islands rendered almost monochrome.',
    provenance: 'In-house.',
    notes: 'Heterozygous Black Pastel only — we do not produce or place the super form of this locus.'
  },
  {
    id: 'vs-bp-0212',
    sku: 'VS-BP-0212',
    species: 'ball-python',
    title: 'Lavender Albino Pinstripe',
    traits: [
      { geneId: 'lavenderalbino', zygosity: 'homo' },
      { geneId: 'pinstripe', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-08-07',
    weight: 700,
    price: 2400,
    status: 'sold',
    tier: 'collector',
    lineage: { sire: 'Pinstripe het Lavender', dam: 'Lavender Albino', generation: 'F3' },
    weights: [
      ['2025-09-01', 86],
      ['2025-12-01', 292],
      ['2026-03-01', 508],
      ['2026-06-01', 648]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-06-28',
      consecutive: 18,
      refusals: 0
    },
    story: 'Lavender Albino replaces the usual albino white with a genuine lilac ground and ruby eyes. Pinstripe reduces the flanks to a clean sheet crossed by hairline dorsal striping.',
    provenance: 'In-house.',
    notes: 'Sold March 2026. Shown for reference; a repeat pairing is scheduled for the 2027 season.'
  },
  {
    id: 'vs-bp-0219',
    sku: 'VS-BP-0219',
    species: 'ball-python',
    quality: 'exceptional',
    title: 'VPI Axanthic Clown',
    traits: [
      { geneId: 'axanthic', zygosity: 'homo' },
      { geneId: 'clown', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-07-28',
    weight: 720,
    price: 7600,
    status: 'available',
    tier: 'flagship',
    lineage: { sire: 'VPI Axanthic het Clown', dam: 'Clown het VPI Axanthic', generation: 'F3' },
    weights: [
      ['2025-09-01', 88],
      ['2025-12-01', 296],
      ['2026-03-01', 512],
      ['2026-06-01', 654],
      ['2026-07-20', 720]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-26',
      consecutive: 20,
      refusals: 0
    },
    story: 'A true greyscale animal. Axanthic removes red and yellow pigment entirely; Clown removes the pattern. What remains is a graphite-to-silver gradient with no colour information at all — the most severe reduction available in this species.',
    provenance: 'VPI line, verified. In-house production, fourth generation.',
    notes: 'VPI, MJ, TSK and Jolliff axanthic lines are not compatible with one another. This animal is pure VPI and is documented as such.'
  },
  {
    id: 'vs-bp-0226',
    sku: 'VS-BP-0226',
    species: 'ball-python',
    quality: 'exceptional',
    title: 'Stranger het Sunset',
    traits: [
      { geneId: 'stranger', zygosity: 'homo' },
      { geneId: 'sunset', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-05-16',
    weight: 1240,
    price: null,
    status: 'hold',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Stranger', dam: 'het Stranger het Sunset', generation: 'F2' },
    weights: [
      ['2025-07-01', 94],
      ['2025-10-01', 368],
      ['2026-01-01', 690],
      ['2026-04-01', 1010],
      ['2026-07-20', 1240]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 12,
      lastFed: '2026-07-20',
      consecutive: 26,
      refusals: 0
    },
    story: 'Stranger is the most valuable recessive in the species and one of the least understood — extreme pattern aberrancy with a lavender wash that no other gene reproduces. Carrying Sunset, this female is the single most important animal in our collection.',
    provenance: 'Acquired 2025 from the originating collection with full documentation.',
    notes: 'Currently on breeding hold. Registered interest only; she may be released after the 2027 season.'
  },
  {
    id: 'vs-rt-0044',
    sku: 'VS-RT-0044',
    species: 'reticulated-python',
    quality: 'strong',
    title: 'Titanium',
    traits: [
      { geneId: 'platinum', zygosity: 'homo' },
      { geneId: 'superdwarf', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-04-12',
    weight: 3400,
    price: 12500,
    status: 'available',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Platinum 75% SD', dam: 'Platinum 100% SD', generation: 'F3', dwarfPercent: 87 },
    weights: [
      ['2025-06-01', 240],
      ['2025-10-01', 980],
      ['2026-02-01', 2100],
      ['2026-07-20', 3400]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Large',
      interval: 14,
      lastFed: '2026-07-19',
      consecutive: 24,
      refusals: 0
    },
    story: 'Titanium is the homozygous form of Platinum — a near-patternless silver-white animal with faint ghosting where the reticulation used to be. At 87% super dwarf she will mature around seven feet, which is what makes a retic of this calibre genuinely keepable.',
    provenance: 'In-house. Dwarf percentage verified against four generations of records.',
    notes: 'Hook-trained from hatchling and consistently level-headed. Ships with full lineage and dwarf-percentage documentation.'
  },
  {
    id: 'vs-rt-0051',
    sku: 'VS-RT-0051',
    species: 'reticulated-python',
    quality: 'strong',
    title: 'Anthrax Sunfire',
    traits: [
      { geneId: 'anthrax', zygosity: 'homo' },
      { geneId: 'sunfire', zygosity: 'het' },
      { geneId: 'superdwarf', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-05-30',
    weight: 2100,
    price: 9200,
    status: 'available',
    tier: 'flagship',
    lineage: {
      sire: 'Sunfire het Anthrax 100% SD',
      dam: 'Anthrax 75% SD',
      generation: 'F2',
      dwarfPercent: 75
    },
    weights: [
      ['2025-07-01', 220],
      ['2025-11-01', 820],
      ['2026-03-01', 1560],
      ['2026-07-20', 2100]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-22',
      consecutive: 20,
      refusals: 0
    },
    story: 'Anthrax shatters the reticulation into fine black speckling scattered over a clean ground. Sunfire adds orange fire and lifts the iridescence, which on a retic is already the strongest in the family. Under directional light this animal is genuinely difficult to photograph.',
    provenance: 'In-house, from Prehistoric Pets Anthrax line.',
    notes: 'Superb feeding response — standard hook-and-tap protocol applies.'
  },
  {
    id: 'vs-rt-0058',
    sku: 'VS-RT-0058',
    species: 'reticulated-python',
    title: 'Super Tiger Golden Child',
    traits: [
      { geneId: 'tiger', zygosity: 'homo' },
      { geneId: 'goldenchild', zygosity: 'het' },
      { geneId: 'dwarf', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-03-08',
    weight: 4200,
    price: 4800,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Tiger Golden Child 50% D', dam: 'Tiger 50% D', generation: 'F2', dwarfPercent: 50 },
    weights: [
      ['2025-05-01', 280],
      ['2025-09-01', 1240],
      ['2026-01-01', 2600],
      ['2026-07-20', 4200]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Large',
      interval: 14,
      lastFed: '2026-07-18',
      consecutive: 26,
      refusals: 0
    },
    story: 'Super Tiger stretches the pattern into longitudinal bands until the reticulation nearly disappears; Golden Child floods what remains with saturated gold. A large, confident animal for an experienced keeper.',
    provenance: 'In-house.',
    notes: '50% dwarf — expect a mature length in the eleven to thirteen foot range. Two-person handling protocol recommended from twelve feet.'
  },
  {
    id: 'vs-rt-0065',
    sku: 'VS-RT-0065',
    species: 'reticulated-python',
    title: 'Purple Albino Motley',
    traits: [
      { geneId: 'purplealbino', zygosity: 'homo' },
      { geneId: 'motley-r', zygosity: 'het' },
      { geneId: 'superdwarf', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-06-14',
    weight: 1850,
    price: 5600,
    status: 'reserved',
    tier: 'collector',
    lineage: {
      sire: 'Purple Albino 100% SD',
      dam: 'Motley het Purple Albino 75% SD',
      generation: 'F3',
      dwarfPercent: 87
    },
    weights: [
      ['2025-08-01', 210],
      ['2025-12-01', 760],
      ['2026-04-01', 1420],
      ['2026-07-20', 1850]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-23',
      consecutive: 18,
      refusals: 0
    },
    story: 'The purple albino strain keeps a violet cast in the ground colour that the white strain loses entirely. Motley connects the dorsal elements into a continuous chain running the length of the animal.',
    provenance: 'In-house.',
    notes: 'Reserved. A full sibling male is expected from the repeat pairing in early 2027.'
  },
  {
    id: 'vs-rt-0072',
    sku: 'VS-RT-0072',
    species: 'reticulated-python',
    title: 'Platinum het Anthrax',
    traits: [
      { geneId: 'platinum', zygosity: 'het' },
      { geneId: 'anthrax', zygosity: 'het' },
      { geneId: 'dwarf', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-07-02',
    weight: 1420,
    price: 3400,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Platinum 50% D', dam: 'Anthrax 50% D', generation: 'F1', dwarfPercent: 50 },
    weights: [
      ['2025-09-01', 190],
      ['2026-01-01', 700],
      ['2026-05-01', 1180],
      ['2026-07-20', 1420]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-25',
      consecutive: 16,
      refusals: 0
    },
    story: 'A deliberate foundation animal: visual Platinum for immediate impact, carrying Anthrax for the project behind it. Pair him back to an Anthrax female and the maths gets interesting quickly.',
    provenance: 'In-house.',
    notes: 'Anthrax confirmed by pedigree. Run this animal through the Gene Lab to see what he produces against your females.'
  },
  {
    id: 'vs-gt-0019',
    sku: 'VS-GT-0019',
    species: 'green-tree-python',
    quality: 'exceptional',
    title: 'Sorong Blue Line',
    traits: [
      { geneId: 'sorong', zygosity: 'het' },
      { geneId: 'blueline', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2024-11-20',
    weight: 640,
    price: 16000,
    status: 'available',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Sorong high-blue', dam: 'Sorong blue line', generation: 'F4' },
    weights: [
      ['2025-02-01', 92],
      ['2025-08-01', 280],
      ['2026-02-01', 500],
      ['2026-07-20', 640]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Adult',
      interval: 18,
      lastFed: '2026-07-17',
      consecutive: 22,
      refusals: 2
    },
    story: 'Four generations of selective blue intensification on a pure Sorong base. He completed his ontogenetic colour change at nine months and has been darkening toward blue continuously since — the flanks are already turning at twenty months, which is exceptionally early.',
    provenance: 'In-house blue-line project established 2016. Photographic records of all four preceding generations transfer with the animal.',
    notes: 'Blue expression is polygenic, not Mendelian. We represent this animal on its own phenotype and its parents\' documented progression, never as a guarantee of offspring colour.'
  },
  {
    id: 'vs-gt-0026',
    sku: 'VS-GT-0026',
    species: 'green-tree-python',
    title: 'Manokwari',
    traits: [
      { geneId: 'manokwari', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-01-15',
    weight: 520,
    price: 4600,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Manokwari', dam: 'Manokwari', generation: 'F3' },
    weights: [
      ['2025-04-01', 88],
      ['2025-10-01', 250],
      ['2026-04-01', 440],
      ['2026-07-20', 520]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Adult',
      interval: 18,
      lastFed: '2026-07-19',
      consecutive: 19,
      refusals: 1
    },
    story: 'Heavy white and blue dorsal marking over a dark forest green — the Manokwari signature. Pure locality on both sides with no outcrossing anywhere in the documented pedigree.',
    provenance: 'In-house, pure Manokwari line.',
    notes: 'Completed colour change at eleven months from neonate yellow.'
  },
  {
    id: 'vs-gt-0033',
    sku: 'VS-GT-0033',
    species: 'green-tree-python',
    title: 'Biak High Yellow',
    traits: [
      { geneId: 'biak', zygosity: 'het' },
      { geneId: 'gtp-highyellow', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-02-28',
    weight: 470,
    price: 2800,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Biak high yellow', dam: 'Biak', generation: 'F3' },
    weights: [
      ['2025-05-01', 84],
      ['2025-11-01', 236],
      ['2026-05-01', 410],
      ['2026-07-20', 470]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Adult',
      interval: 18,
      lastFed: '2026-07-21',
      consecutive: 17,
      refusals: 3
    },
    story: 'Biak animals retain scattered yellow scaling into adulthood rather than converting fully to green, and selectively bred high-yellow lines push that retention much further. Larger and more assertive than the mainland localities.',
    provenance: 'In-house.',
    notes: 'Typical Biak temperament — a display animal first. Handling should be purposeful and brief.'
  },
  {
    id: 'vs-gt-0040',
    sku: 'VS-GT-0040',
    species: 'green-tree-python',
    title: 'Aru',
    traits: [
      { geneId: 'aru', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2024-12-09',
    weight: 610,
    price: 3200,
    status: 'sold',
    tier: 'collector',
    lineage: { sire: 'Aru', dam: 'Aru', generation: 'F5' },
    weights: [
      ['2025-03-01', 90],
      ['2025-09-01', 300],
      ['2026-03-01', 520],
      ['2026-06-01', 610]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Adult',
      interval: 18,
      lastFed: '2026-06-24',
      consecutive: 21,
      refusals: 0
    },
    story: 'Compact, deep-bodied and blue-tinged, with the clean unbroken dorsal line the Aru locality is known for. Fifth-generation captive with no wild-caught animal in the recorded pedigree.',
    provenance: 'In-house.',
    notes: 'Sold May 2026.'
  },
  {
    id: 'vs-gt-0047',
    sku: 'VS-GT-0047',
    species: 'green-tree-python',
    quality: 'strong',
    title: 'Cyclops',
    traits: [
      { geneId: 'cyclops', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-03-22',
    weight: 440,
    price: 5900,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Cyclops', dam: 'Cyclops', generation: 'F2' },
    weights: [
      ['2025-06-01', 86],
      ['2025-12-01', 240],
      ['2026-06-01', 412],
      ['2026-07-20', 440]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Adult',
      interval: 18,
      lastFed: '2026-07-20',
      consecutive: 15,
      refusals: 2
    },
    story: 'The Cyclops mountains produce animals with pronounced blue development and markedly reduced yellow. Rarely offered outside specialist collections; this is the first Cyclops male we have released in three years.',
    provenance: 'In-house, from imported founder stock documented 2019.',
    notes: 'Slower feeder than our Biak animals, which is normal for the locality. Established on adult mice at consistent intervals.'
  },
  {
    id: 'vs-bc-0088',
    sku: 'VS-BC-0088',
    species: 'boa-constrictor',
    quality: 'strong',
    title: 'Super IMG Kahl Albino',
    traits: [
      { geneId: 'img', zygosity: 'homo' },
      { geneId: 'kahl', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-04-26',
    weight: 1650,
    price: 6400,
    status: 'available',
    tier: 'flagship',
    lineage: { sire: 'IMG het Kahl', dam: 'Super IMG het Kahl', generation: 'F3' },
    weights: [
      ['2025-06-01', 120],
      ['2025-10-01', 560],
      ['2026-02-01', 1120],
      ['2026-07-20', 1650]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-21',
      consecutive: 23,
      refusals: 0
    },
    story: 'Super IMG is a pearl-lavender animal that continues to develop for years after it stops growing. Layered over Kahl albinism, the result is a pale opalescent boa that looks nothing like either parent gene alone.',
    provenance: 'In-house. Kahl line verified — not compatible with Sharp albino stock.',
    notes: 'A significant foundation female. Every offspring inherits one IMG allele and one Kahl allele.'
  },
  {
    id: 'vs-bc-0095',
    sku: 'VS-BC-0095',
    species: 'boa-constrictor',
    quality: 'strong',
    title: 'Moonglow',
    traits: [
      { geneId: 'kahl', zygosity: 'homo' },
      { geneId: 'boa-anery', zygosity: 'homo' },
      { geneId: 'boa-hypo', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-05-18',
    weight: 1180,
    price: 3800,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Snow het Hypo', dam: 'Sunglow het Anery', generation: 'F3' },
    weights: [
      ['2025-07-01', 110],
      ['2025-11-01', 480],
      ['2026-03-01', 900],
      ['2026-07-20', 1180]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-24',
      consecutive: 20,
      refusals: 0
    },
    story: 'Three genes stacked to remove pigment from three different directions — albinism, anerythrism and hypomelanism. The endpoint is a near-white boa with the faintest pink cast and no pattern definition at all.',
    provenance: 'In-house.',
    notes: 'Moonglow is a combination name, not a gene. The underlying genetics are documented on the pedigree sheet.'
  },
  {
    id: 'vs-bc-0102',
    sku: 'VS-BC-0102',
    species: 'boa-constrictor',
    title: 'Leopard Motley',
    traits: [
      { geneId: 'boa-leopard', zygosity: 'homo' },
      { geneId: 'boa-motley', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-06-09',
    weight: 1320,
    price: 4100,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Leopard het Motley', dam: 'Motley het Leopard', generation: 'F2' },
    weights: [
      ['2025-08-01', 116],
      ['2025-12-01', 520],
      ['2026-04-01', 1010],
      ['2026-07-20', 1320]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 14,
      lastFed: '2026-07-22',
      consecutive: 19,
      refusals: 0
    },
    story: 'Leopard is one of the most unusual boa recessives — a spotted pattern reduction that develops an unexpected slate-blue cast as the animal matures. Motley connects the saddles into a continuous dorsal band.',
    provenance: 'In-house.',
    notes: 'The blue cast is already visible at fourteen months and will strengthen through year four.'
  },
  {
    id: 'vs-bc-0109',
    sku: 'VS-BC-0109',
    species: 'boa-constrictor',
    title: 'Super Hypo Jungle het Kahl',
    traits: [
      { geneId: 'boa-hypo', zygosity: 'homo' },
      { geneId: 'boa-jungle', zygosity: 'het' },
      { geneId: 'kahl', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-08-03',
    weight: 840,
    price: 1900,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Hypo Jungle het Kahl', dam: 'Super Hypo het Kahl', generation: 'F2' },
    weights: [
      ['2025-10-01', 104],
      ['2026-02-01', 430],
      ['2026-06-01', 730],
      ['2026-07-20', 840]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 14,
      lastFed: '2026-07-26',
      consecutive: 17,
      refusals: 0
    },
    story: 'Super Hypo strips melanin hard enough that the salmon and orange underneath dominate entirely, and Jungle throws the saddles into an aberrant, asymmetric arrangement unique to each animal.',
    provenance: 'In-house.',
    notes: 'An efficient breeding male — homozygous Hypo, visual Jungle and carrying Kahl albino.'
  },
  {
    id: 'vs-et-0012',
    sku: 'VS-ET-0012',
    species: 'emerald-tree-boa',
    quality: 'exceptional',
    title: 'Amazon Basin Emerald',
    traits: [],
    sex: 'female',
    hatched: '2024-10-04',
    weight: 1420,
    price: 7500,
    status: 'available',
    tier: 'flagship',
    featured: true,
    lineage: { sire: 'Amazon Basin', dam: 'Amazon Basin', generation: 'F2' },
    weights: [
      ['2025-01-01', 180],
      ['2025-07-01', 620],
      ['2026-01-01', 1120],
      ['2026-07-20', 1420]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 24,
      lastFed: '2026-07-12',
      consecutive: 14,
      refusals: 1
    },
    story: 'True Amazon Basin caninus — the full white dorsal blaze running unbroken from neck to vent over a green so saturated it reads as artificial in person. The Basin form is a different animal entirely from the northern Guiana Shield type, and the difference is obvious the moment you see them side by side.',
    provenance: 'Second-generation captive from documented Basin founder stock. Import documentation and CITES paperwork on file.',
    notes: 'A display animal. Handling should be rare, brief and never within ninety-six hours of a feed.'
  },
  {
    id: 'vs-et-0015',
    sku: 'VS-ET-0015',
    species: 'emerald-tree-boa',
    quality: 'strong',
    title: 'Amazon Basin Emerald',
    traits: [],
    sex: 'male',
    hatched: '2024-10-04',
    weight: 1080,
    price: 5200,
    status: 'reserved',
    tier: 'flagship',
    lineage: { sire: 'Amazon Basin', dam: 'Amazon Basin', generation: 'F2' },
    weights: [
      ['2025-01-01', 170],
      ['2025-07-01', 540],
      ['2026-01-01', 880],
      ['2026-07-20', 1080]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 24,
      lastFed: '2026-07-14',
      consecutive: 13,
      refusals: 2
    },
    story: 'Full sibling to VS-ET-0012 and an equally strong expression of the Basin phenotype. Offered as a pair with his sister at a reduced combined figure.',
    provenance: 'As VS-ET-0012.',
    notes: 'Reserved as part of a pair enquiry. Contact the office regarding availability.'
  },
  {
    id: 'vs-rb-0031',
    sku: 'VS-RB-0031',
    species: 'brazilian-rainbow-boa',
    quality: 'strong',
    title: 'Brazilian Rainbow Boa',
    traits: [],
    sex: 'female',
    hatched: '2025-05-11',
    weight: 720,
    price: 2200,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'High-red line', dam: 'High-red line', generation: 'F6' },
    weights: [
      ['2025-07-01', 96],
      ['2025-11-01', 320],
      ['2026-03-01', 560],
      ['2026-07-20', 720]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 16,
      lastFed: '2026-07-23',
      consecutive: 18,
      refusals: 0
    },
    story: 'The iridescence is structural, not pigmentary — microscopic ridges on every scale diffract light into a full spectrum. It cannot be photographed accurately and has to be seen moving under a directional source. Six generations of selection for red saturation underneath it.',
    provenance: 'In-house high-red line.',
    notes: 'Humidity below 70% will produce retained sheds within a single cycle. Review the husbandry specification before ordering.'
  },
  {
    id: 'vs-rb-0038',
    sku: 'VS-RB-0038',
    species: 'brazilian-rainbow-boa',
    title: 'Brazilian Rainbow Boa',
    traits: [],
    sex: 'male',
    hatched: '2025-05-11',
    weight: 590,
    price: 1900,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'High-red line', dam: 'High-red line', generation: 'F6' },
    weights: [
      ['2025-07-01', 92],
      ['2025-11-01', 280],
      ['2026-03-01', 470],
      ['2026-07-20', 590]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 16,
      lastFed: '2026-07-25',
      consecutive: 17,
      refusals: 0
    },
    story: 'Clutchmate to VS-RB-0031 with equally strong red development and heavy black ocelli along the flanks.',
    provenance: 'In-house high-red line.',
    notes: 'Available as a pair with VS-RB-0031.'
  },
  {
    id: 'vs-cp-0067',
    sku: 'VS-CP-0067',
    species: 'carpet-python',
    quality: 'strong',
    title: 'Super Zebra Jungle',
    traits: [
      { geneId: 'zebra-c', zygosity: 'homo' },
      { geneId: 'jungle', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-06-27',
    weight: 780,
    price: 3600,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Zebra Jungle', dam: 'Zebra Jungle', generation: 'F2' },
    weights: [
      ['2025-08-01', 88],
      ['2025-12-01', 340],
      ['2026-04-01', 620],
      ['2026-07-20', 780]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 12,
      lastFed: '2026-07-24',
      consecutive: 20,
      refusals: 0
    },
    story: 'Super Zebra converts the carpet\'s banding into clean longitudinal striping running the full body length. On a high-contrast Jungle base the effect is close to graphic design.',
    provenance: 'In-house.',
    notes: 'No Jaguar anywhere in this pedigree. We do not work with that locus.'
  },
  {
    id: 'vs-cp-0074',
    sku: 'VS-CP-0074',
    species: 'carpet-python',
    quality: 'strong',
    title: 'Caramel Albino Irian Jaya',
    traits: [
      { geneId: 'caramel', zygosity: 'homo' },
      { geneId: 'irianjaya', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-07-15',
    weight: 640,
    price: 2700,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Caramel IJ', dam: 'het Caramel IJ', generation: 'F3' },
    weights: [
      ['2025-09-01', 84],
      ['2026-01-01', 300],
      ['2026-05-01', 530],
      ['2026-07-20', 640]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 12,
      lastFed: '2026-07-25',
      consecutive: 18,
      refusals: 0
    },
    story: 'Caramel swaps black pigment for warm brown, and the effect strengthens for the first three years. Irian Jaya keeps the adult footprint modest — this is the carpet python for keepers who want the pattern without the six-foot enclosure.',
    provenance: 'In-house.',
    notes: 'Expected mature length around five feet.'
  },
  {
    id: 'vs-cp-0081',
    sku: 'VS-CP-0081',
    species: 'carpet-python',
    title: 'Granite Axanthic',
    traits: [
      { geneId: 'granite', zygosity: 'het' },
      { geneId: 'carpet-axanthic', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-08-19',
    weight: 520,
    price: 2100,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Granite het Axanthic', dam: 'Axanthic', generation: 'F2' },
    weights: [
      ['2025-10-01', 82],
      ['2026-02-01', 268],
      ['2026-06-01', 456],
      ['2026-07-20', 520]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 12,
      lastFed: '2026-07-26',
      consecutive: 16,
      refusals: 0
    },
    story: 'Axanthic removes every trace of yellow from a species defined by black and gold, leaving pure silver over charcoal. Granite adds a fine speckled break that gives the whole animal a worked-stone texture.',
    provenance: 'In-house.',
    notes: 'Strong climber — furnish the enclosure vertically.'
  },
  {
    id: 'vs-bl-0023',
    sku: 'VS-BL-0023',
    species: 'blood-python',
    quality: 'strong',
    title: 'Goldeneye',
    traits: [
      { geneId: 'matrix', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-05-04',
    weight: 1900,
    price: 3300,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Matrix', dam: 'Matrix', generation: 'F3' },
    weights: [
      ['2025-07-01', 150],
      ['2025-11-01', 780],
      ['2026-03-01', 1440],
      ['2026-07-20', 1900]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 16,
      lastFed: '2026-07-22',
      consecutive: 21,
      refusals: 0
    },
    story: 'The homozygous Matrix form: a pale, heavily fractured animal with gold irises that catch light from across a room. Blood pythons shift colour dramatically between sheds, and this line runs from near-white through apricot to deep rust across a season.',
    provenance: 'In-house.',
    notes: 'Modern captive-bred brongersmai are a world away from the imported animals that gave the species its reputation. This female is entirely tractable.'
  },
  {
    id: 'vs-bl-0030',
    sku: 'VS-BL-0030',
    species: 'blood-python',
    title: 'Albino Batik',
    traits: [
      { geneId: 'blood-albino', zygosity: 'homo' },
      { geneId: 'batik', zygosity: 'het' }
    ],
    sex: 'male',
    hatched: '2025-06-16',
    weight: 1540,
    price: 2600,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Batik het Albino', dam: 'Albino', generation: 'F2' },
    weights: [
      ['2025-08-01', 145],
      ['2025-12-01', 700],
      ['2026-04-01', 1280],
      ['2026-07-20', 1540]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Medium',
      interval: 16,
      lastFed: '2026-07-24',
      consecutive: 19,
      refusals: 0
    },
    story: 'White ground with intense orange-red blotching and pink eyes. Batik connects the blotches into flowing bands along the dorsum, which on an albino base produces something closer to marbling than pattern.',
    provenance: 'In-house.',
    notes: 'Requires a humid hide at all times — this species is unforgiving of dry, over-warm setups.'
  },
  {
    id: 'vs-wm-0007',
    sku: 'VS-WM-0007',
    species: 'woma-python',
    quality: 'strong',
    title: 'Woma Python',
    traits: [],
    sex: 'female',
    hatched: '2025-04-30',
    weight: 1100,
    price: 2400,
    status: 'available',
    tier: 'collector',
    lineage: { sire: 'Woma', dam: 'Woma', generation: 'F4' },
    weights: [
      ['2025-07-01', 110],
      ['2025-11-01', 460],
      ['2026-03-01', 850],
      ['2026-07-20', 1100]
    ],
    feeding: {
      prey: 'Rat',
      size: 'Small',
      interval: 10,
      lastFed: '2026-07-25',
      consecutive: 24,
      refusals: 0
    },
    story: 'A python that gave up heat pits entirely and hunts reptiles underground instead. Sand-gold banding over a fine, almost polished scale surface, and an inquisitive temperament that is unusual for the family.',
    provenance: 'In-house, fourth generation.',
    notes: 'Must be housed alone without exception — womas are ophiophagous and will consume a cage mate.'
  },
  {
    id: 'vs-hg-0113',
    sku: 'VS-HG-0113',
    species: 'western-hognose',
    quality: 'strong',
    title: 'Superconda Lavender',
    traits: [
      { geneId: 'anaconda', zygosity: 'homo' },
      { geneId: 'lavender', zygosity: 'homo' }
    ],
    sex: 'female',
    hatched: '2025-09-02',
    weight: 180,
    price: 3400,
    status: 'available',
    tier: 'collector',
    featured: true,
    lineage: { sire: 'Anaconda het Lavender', dam: 'Superconda het Lavender', generation: 'F3' },
    weights: [
      ['2025-10-01', 22],
      ['2026-01-01', 74],
      ['2026-04-01', 132],
      ['2026-07-20', 180]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Hopper',
      interval: 7,
      lastFed: '2026-07-27',
      consecutive: 30,
      refusals: 0
    },
    story: 'Superconda removes the dorsal blotching almost entirely; Lavender replaces what pigment remains with a soft lilac-grey over pink undertones. The combination is close to patternless in an intensely subtle colour.',
    provenance: 'In-house.',
    notes: 'Females substantially outgrow males in this species. Watch the feeding schedule — hognose will eat far past need.'
  },
  {
    id: 'vs-hg-0120',
    sku: 'VS-HG-0120',
    species: 'western-hognose',
    quality: 'strong',
    title: 'Super Arctic Albino',
    traits: [
      { geneId: 'arctic', zygosity: 'homo' },
      { geneId: 'hog-albino', zygosity: 'homo' }
    ],
    sex: 'male',
    hatched: '2025-09-16',
    weight: 92,
    price: 1600,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Arctic het Albino', dam: 'Albino het Arctic', generation: 'F2' },
    weights: [
      ['2025-10-15', 18],
      ['2026-01-15', 44],
      ['2026-04-15', 72],
      ['2026-07-20', 92]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Fuzzy',
      interval: 7,
      lastFed: '2026-07-28',
      consecutive: 28,
      refusals: 1
    },
    story: 'Super Arctic drives contrast to its extreme, then Albino removes the melanin that contrast was built from — the result is a high-definition animal rendered entirely in cream, apricot and white.',
    provenance: 'In-house.',
    notes: 'Rear-fanged with a mild secretion that is medically insignificant to humans. Still a snake, still handled with respect.'
  },
  {
    id: 'vs-hg-0127',
    sku: 'VS-HG-0127',
    species: 'western-hognose',
    title: 'Sable Anaconda het Axanthic',
    traits: [
      { geneId: 'sable', zygosity: 'homo' },
      { geneId: 'anaconda', zygosity: 'het' },
      { geneId: 'hog-axanthic', zygosity: 'het' }
    ],
    sex: 'female',
    hatched: '2025-10-01',
    weight: 128,
    price: 1200,
    status: 'available',
    tier: 'foundation',
    lineage: { sire: 'Sable Anaconda', dam: 'Sable het Axanthic', generation: 'F2' },
    weights: [
      ['2025-11-01', 20],
      ['2026-02-01', 58],
      ['2026-05-01', 98],
      ['2026-07-20', 128]
    ],
    feeding: {
      prey: 'Mouse',
      size: 'Hopper',
      interval: 7,
      lastFed: '2026-07-27',
      consecutive: 26,
      refusals: 0
    },
    story: 'Sable pushes the whole animal toward deep chocolate with softened pattern edges. Anaconda thins the blotching further. Carrying Axanthic, she is one pairing away from a Sable Superconda Snow.',
    provenance: 'In-house.',
    notes: 'A genuinely good project female at an accessible figure.'
  }
];

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
