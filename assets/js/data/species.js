/**
 * Species reference data.
 *
 * Husbandry figures are expressed as ranges and are intended as a starting
 * specification, not veterinary advice. Temperatures are Fahrenheit, lengths
 * are inches, weights are grams unless a field name says otherwise.
 */

export const SPECIES = [
  {
    id: 'ball-python',
    common: 'Ball Python',
    scientific: 'Python regius',
    family: 'Pythonidae',
    origin: 'West & Central Africa',
    biome: 'Savanna, grassland, forest margin',
    adultLength: [36, 60],
    adultWeight: [1200, 2500],
    maturityWeight: 1200,
    lifespan: [25, 35],
    difficulty: 1,
    temperament: 'Docile, sedentary, highly tractable',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 400,
    blurb:
      'The most genetically documented snake on earth. Four decades of selective work have produced a morph library deeper than any other reptile, which is precisely why the top of this market is so difficult to reach.',
    care: {
      enclosureMin: [48, 24, 18],
      warmSide: [88, 92],
      coolSide: [76, 80],
      ambient: [80, 84],
      humidity: [55, 65],
      humiditySpike: [70, 80],
      substrate: ['Cypress mulch', 'Coconut husk', 'Sphagnum-topped bioactive'],
      lighting: 'Low-output UVB 2–5%, 12h photoperiod',
      water: 'Bowl large enough to submerge; changed every 48h',
      hides: 2,
      feedingAdult: 'One appropriately sized rodent every 10–14 days',
      notes:
        'Chronic refusal in winter months is normal for mature males. Do not chase feeding response with heat increases.'
    },
    palette: { base: '#3B2A18', mid: '#8A6A34', high: '#D8B368', dark: '#161009' },
    pattern: 'alien-head'
  },
  {
    id: 'reticulated-python',
    common: 'Reticulated Python',
    scientific: 'Malayopython reticulatus',
    family: 'Pythonidae',
    origin: 'Southeast Asia, Indonesian archipelago',
    biome: 'Rainforest, river margin, human-adjacent',
    adultLength: [120, 240],
    adultWeight: [12000, 30000],
    maturityWeight: 8000,
    lifespan: [20, 30],
    difficulty: 5,
    temperament: 'Exceptionally intelligent, food-driven, demands experience',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 900,
    blurb:
      'The longest snake in the world and, in the right hands, the most rewarding. Dwarf and super-dwarf localities have made retics genuinely keepable — the giant genetics remain a specialist discipline.',
    care: {
      enclosureMin: [96, 36, 36],
      warmSide: [88, 92],
      coolSide: [78, 82],
      ambient: [82, 86],
      humidity: [60, 75],
      humiditySpike: [80, 90],
      substrate: ['Cypress mulch', 'Sealed PVC with washable liner'],
      lighting: 'UVB 5%, strong day/night cycle',
      water: 'Large basin, secured; retics will soak',
      hides: 1,
      feedingAdult: 'One large prey item every 14–21 days for adults',
      notes:
        'Two-person handling protocol above 12 feet. Hook-train from hatchling. Never free-handle around food scent.'
    },
    palette: { base: '#1A1A16', mid: '#B9A87A', high: '#F0E6CE', dark: '#0A0A08' },
    pattern: 'reticulate'
  },
  {
    id: 'green-tree-python',
    common: 'Green Tree Python',
    scientific: 'Morelia viridis',
    family: 'Pythonidae',
    origin: 'New Guinea, Cape York, offshore islands',
    biome: 'Lowland and montane rainforest canopy',
    adultLength: [48, 72],
    adultWeight: [1100, 2200],
    maturityWeight: 900,
    lifespan: [15, 20],
    difficulty: 4,
    temperament: 'Arboreal, defensive when disturbed, best appreciated visually',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 1400,
    blurb:
      'Locality is everything. Biak, Sorong, Aru, Manokwari and Cyclops lines each carry a distinct adult expression, and a proven high-blue animal is among the most valuable serpents ever sold.',
    care: {
      enclosureMin: [24, 24, 36],
      warmSide: [86, 88],
      coolSide: [76, 78],
      ambient: [80, 84],
      humidity: [65, 80],
      humiditySpike: [85, 95],
      substrate: ['Coconut husk', 'Live planted bioactive'],
      lighting: 'UVB 5%, dappled canopy placement',
      water: 'Bowl plus daily misting cycle',
      hides: 0,
      feedingAdult: 'One small rodent every 14–21 days; do not overfeed',
      notes:
        'Perch diameter must match body girth. Ontogenetic colour change from neonate yellow or red to adult green completes between 6 and 14 months.'
    },
    palette: { base: '#123A22', mid: '#2E8B57', high: '#8FE3B0', dark: '#06170D' },
    pattern: 'dorsal-stripe'
  },
  {
    id: 'boa-constrictor',
    common: 'Boa Constrictor',
    scientific: 'Boa imperator',
    family: 'Boidae',
    origin: 'Central America, northern South America',
    biome: 'Dry forest to humid lowland',
    adultLength: [72, 108],
    adultWeight: [9000, 22000],
    maturityWeight: 7000,
    lifespan: [25, 35],
    difficulty: 2,
    temperament: 'Confident, deliberate, exceptionally consistent',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 500,
    blurb:
      'The connoisseur\'s constrictor. Anerythrism, hypomelanism and the IMG complex layer into adult animals that improve for a decade rather than fading after their first shed.',
    care: {
      enclosureMin: [72, 30, 24],
      warmSide: [88, 92],
      coolSide: [76, 80],
      ambient: [80, 85],
      humidity: [55, 70],
      humiditySpike: [75, 85],
      substrate: ['Cypress mulch', 'Aspen for dry-line localities'],
      lighting: 'UVB 5%, 12h photoperiod',
      water: 'Large bowl; boas soak before shed',
      hides: 2,
      feedingAdult: 'One rodent every 14–21 days; obesity is the primary welfare failure',
      notes:
        'Power-feeding shortens lifespan measurably. Target a slow, structural growth curve over the first four years.'
    },
    palette: { base: '#2A1D16', mid: '#9C7B5E', high: '#E4CBB2', dark: '#120C08' },
    pattern: 'saddle'
  },
  {
    id: 'blood-python',
    common: 'Blood Python',
    scientific: 'Python brongersmai',
    family: 'Pythonidae',
    origin: 'Malay Peninsula, Sumatra',
    biome: 'Swamp forest, palm plantation',
    adultLength: [48, 72],
    adultWeight: [8000, 16000],
    maturityWeight: 6000,
    lifespan: [20, 25],
    difficulty: 3,
    temperament: 'Heavy-bodied, deliberate; modern captive lines are calm',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 650,
    blurb:
      'Colour that behaves like weather. A high-red brongersmai will shift through orange, oxblood and near-black across a single season, and no two sheds present the same animal.',
    care: {
      enclosureMin: [48, 24, 16],
      warmSide: [86, 88],
      coolSide: [74, 78],
      ambient: [78, 82],
      humidity: [65, 80],
      humiditySpike: [85, 90],
      substrate: ['Cypress mulch', 'Deep coconut husk'],
      lighting: 'Low UVB, subdued ambient',
      water: 'Large bowl, humid hide mandatory',
      hides: 2,
      feedingAdult: 'One rodent every 14–21 days',
      notes:
        'Sensitive to sustained temperatures above 90°F. Respiratory issues follow dry, over-warm setups more than any other cause.'
    },
    palette: { base: '#3A1210', mid: '#A33427', high: '#E0873F', dark: '#1A0705' },
    pattern: 'blotch'
  },
  {
    id: 'carpet-python',
    common: 'Carpet Python',
    scientific: 'Morelia spilota',
    family: 'Pythonidae',
    origin: 'Australia, southern New Guinea',
    biome: 'Woodland, rocky outcrop, coastal scrub',
    adultLength: [60, 100],
    adultWeight: [3000, 8000],
    maturityWeight: 2500,
    lifespan: [20, 30],
    difficulty: 2,
    temperament: 'Alert and active; settles reliably with routine',
    venomous: false,
    cites: 'Not listed',
    lacey: false,
    basePrice: 450,
    blurb:
      'Six subspecies, each with a following. Irian Jaya, Jungle, Coastal and Diamond lines cross into designer combinations that hold pattern integrity better than almost any python.',
    care: {
      enclosureMin: [72, 24, 30],
      warmSide: [88, 90],
      coolSide: [72, 76],
      ambient: [78, 82],
      humidity: [50, 60],
      humiditySpike: [65, 75],
      substrate: ['Aspen', 'Cypress mulch'],
      lighting: 'UVB 5–7%, seasonal photoperiod shift',
      water: 'Standard bowl',
      hides: 2,
      feedingAdult: 'One rodent every 10–14 days',
      notes:
        'Provide substantial climbing furniture. A winter cooling period improves long-term breeding outcomes.'
    },
    palette: { base: '#1C1608', mid: '#C9A227', high: '#F5E39A', dark: '#0B0904' },
    pattern: 'banded'
  },
  {
    id: 'emerald-tree-boa',
    common: 'Emerald Tree Boa',
    scientific: 'Corallus caninus',
    family: 'Boidae',
    origin: 'Amazon Basin, Guiana Shield',
    biome: 'Primary rainforest canopy',
    adultLength: [60, 84],
    adultWeight: [1400, 3000],
    maturityWeight: 1200,
    lifespan: [15, 20],
    difficulty: 5,
    temperament: 'Display animal; handling should be minimal and purposeful',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 3000,
    blurb:
      'Amazon Basin animals — the true caninus — carry the white dorsal blaze and a green so saturated it reads as artificial. The single most demanding species we place, and the one clients return for.',
    care: {
      enclosureMin: [24, 24, 36],
      warmSide: [84, 86],
      coolSide: [72, 75],
      ambient: [78, 82],
      humidity: [70, 90],
      humiditySpike: [95, 99],
      substrate: ['Coconut husk', 'Live bioactive with drainage layer'],
      lighting: 'UVB 5%, heavily filtered',
      water: 'Drip system or heavy nightly misting',
      hides: 0,
      feedingAdult: 'One small rodent every 21–30 days',
      notes:
        'Regurgitation risk is the defining husbandry hazard. Never handle within 96 hours of feeding, and never exceed prey width of the animal\'s girth.'
    },
    palette: { base: '#0E3A24', mid: '#1F8B4C', high: '#F2FBF4', dark: '#04150C' },
    pattern: 'lightning'
  },
  {
    id: 'brazilian-rainbow-boa',
    common: 'Brazilian Rainbow Boa',
    scientific: 'Epicrates cenchria',
    family: 'Boidae',
    origin: 'Brazil, Guyana, Suriname',
    biome: 'Humid lowland forest',
    adultLength: [54, 72],
    adultWeight: [1800, 3500],
    maturityWeight: 1500,
    lifespan: [18, 25],
    difficulty: 3,
    temperament: 'Nocturnal, food-responsive, calms considerably with maturity',
    venomous: false,
    cites: 'Appendix II',
    lacey: false,
    basePrice: 1100,
    blurb:
      'Structural iridescence, not pigment. Microscopic ridges on each scale diffract light into a full spectrum — the effect cannot be photographed accurately and has to be seen moving.',
    care: {
      enclosureMin: [48, 24, 18],
      warmSide: [84, 88],
      coolSide: [74, 78],
      ambient: [78, 82],
      humidity: [75, 90],
      humiditySpike: [90, 95],
      substrate: ['Coconut husk', 'Cypress mulch, deep'],
      lighting: 'Low ambient, strong night cycle',
      water: 'Large bowl plus humid hide',
      hides: 2,
      feedingAdult: 'One rodent every 14–21 days',
      notes:
        'Humidity below 70% produces retained sheds and eye caps within a single cycle. Ventilation must be balanced against moisture.'
    },
    palette: { base: '#2A1520', mid: '#B4553E', high: '#E8B7C8', dark: '#100610' },
    pattern: 'ocelli'
  },
  {
    id: 'woma-python',
    common: 'Woma Python',
    scientific: 'Aspidites ramsayi',
    family: 'Pythonidae',
    origin: 'Arid interior Australia',
    biome: 'Sand plain, spinifex desert',
    adultLength: [48, 66],
    adultWeight: [2500, 4500],
    maturityWeight: 2000,
    lifespan: [20, 25],
    difficulty: 3,
    temperament: 'Inquisitive and bold; strong feeding response',
    venomous: false,
    cites: 'Not listed',
    lacey: false,
    basePrice: 1600,
    blurb:
      'A python that abandoned heat pits and hunts other reptiles underground. Sand-gold banding over a fine, almost polished scale surface. Rarely available, never in volume.',
    care: {
      enclosureMin: [48, 24, 16],
      warmSide: [90, 95],
      coolSide: [75, 80],
      ambient: [82, 86],
      humidity: [30, 45],
      humiditySpike: [55, 65],
      substrate: ['Aspen', 'Sand-soil mix, deep for burrowing'],
      lighting: 'UVB 7–10%, bright desert photoperiod',
      water: 'Modest bowl; keep substrate dry',
      hides: 2,
      feedingAdult: 'One rodent every 10–14 days',
      notes:
        'House individually without exception. Womas are ophiophagous and will consume cage mates.'
    },
    palette: { base: '#4A3418', mid: '#D9A441', high: '#F7E4B0', dark: '#1E1408' },
    pattern: 'banded'
  },
  {
    id: 'western-hognose',
    common: 'Western Hognose',
    scientific: 'Heterodon nasicus',
    family: 'Colubridae',
    origin: 'Central North America',
    biome: 'Prairie, sand plain',
    adultLength: [18, 30],
    adultWeight: [100, 350],
    maturityWeight: 150,
    lifespan: [15, 20],
    difficulty: 1,
    temperament: 'Theatrical bluffer, harmless, endlessly characterful',
    venomous: false,
    venomNote: 'Rear-fanged with a mild Duvernoy\'s secretion; medically insignificant to humans but not to prey.',
    cites: 'Not listed',
    lacey: false,
    basePrice: 250,
    blurb:
      'The most expressive small snake in the trade. Superconda, lavender and axanthic lines stack into animals that punch far above their footprint.',
    care: {
      enclosureMin: [36, 18, 12],
      warmSide: [88, 92],
      coolSide: [72, 76],
      ambient: [78, 82],
      humidity: [30, 50],
      humiditySpike: [55, 65],
      substrate: ['Aspen', 'Play sand and topsoil mix'],
      lighting: 'UVB 5%, bright',
      water: 'Small bowl',
      hides: 2,
      feedingAdult: 'One small rodent every 7–10 days',
      notes:
        'Females substantially outgrow males. Watch for obesity — the species will eat well past need.'
    },
    palette: { base: '#4A3E28', mid: '#B79B62', high: '#E9DDBE', dark: '#1C1710' },
    pattern: 'blotch'
  }
];

export const SPECIES_BY_ID = Object.freeze(
  Object.fromEntries(SPECIES.map((s) => [s.id, s]))
);

export function getSpecies(id) {
  return SPECIES_BY_ID[id] || null;
}
