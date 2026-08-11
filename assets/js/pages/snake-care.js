/** Reptile & Snake Keeper Academy — interactive education and safety planner. */

import { initShell, toast } from '../ui/shell.js';
import { h, $, render } from '../core/dom.js';
import { fieldSelect, fieldCheck, fieldRange, toolPanel, noticeFor, methodology, statBlock } from '../ui/controls.js';
import { SPECIES } from '../data/species.js';

initShell();

const controls = $('[data-tool-controls]');
const output = $('[data-tool-output]');
const KEY = 'vscale:reptile-academy';
const OLD_KEY = 'vscale:snake-academy';

const ANIMAL_TYPES = {
  snake: {
    label: 'Snake',
    promise: 'Focus on enclosure security, low-stress handling, feeding cues, shed cycles and body-language decisions.',
    cautions: ['escape-proof locks', 'feeding response control', 'post-meal handling delay'],
    icon: 'Serpent'
  },
  lizard: {
    label: 'Lizard',
    promise: 'Focus on UVB, basking behavior, calcium balance, enrichment, handling boundaries and species-specific diet.',
    cautions: ['UVB replacement schedule', 'calcium/D3 balance', 'tail/drop or bite stress'],
    icon: 'Basker'
  },
  gecko: {
    label: 'Gecko',
    promise: 'Focus on secure hides, humidity rhythm, delicate handling, feeder nutrition and nocturnal/crepuscular routines.',
    cautions: ['gentle handling', 'feeder gut-loading', 'humidity hides'],
    icon: 'Nocturne'
  },
  turtle: {
    label: 'Aquatic turtle',
    promise: 'Focus on water quality, basking access, UVB, filtration, diet variety and Salmonella-safe cleaning routines.',
    cautions: ['water testing', 'dry basking dock', 'separate cleaning tools'],
    icon: 'Aquatic'
  },
  tortoise: {
    label: 'Tortoise / terrestrial turtle',
    promise: 'Focus on grazing diet, UVB, hydration, outdoor safety, substrate depth and long-lifespan planning.',
    cautions: ['fiber-rich diet', 'soak/hydration rhythm', 'predator-proof outdoor space'],
    icon: 'Grazer'
  }
};

const HABITATS = {
  tropical: {
    label: 'Tropical / humid forest',
    range: 'Higher humidity with ventilation; avoid stagnant wetness.',
    priorities: ['humidity gradient', 'ventilation', 'mold-resistant cleaning', 'hydration monitoring']
  },
  arid: {
    label: 'Arid / desert',
    range: 'Dry ambient air with a humid retreat or hydration opportunity.',
    priorities: ['strong basking zone', 'UVB exposure', 'dry substrate', 'hydration checks']
  },
  temperate: {
    label: 'Temperate / seasonal',
    range: 'Moderate humidity, day/night rhythm and seasonal observation.',
    priorities: ['photoperiod', 'cool-side security', 'seasonal appetite records', 'clean ventilation']
  },
  arboreal: {
    label: 'Arboreal / canopy',
    range: 'Vertical usable space with safe perches, gradients and fall protection.',
    priorities: ['perch diameter', 'climbing structure', 'vertical heat gradient', 'visual barriers']
  },
  aquatic: {
    label: 'Aquatic / semi-aquatic',
    range: 'Water quality is husbandry; basking, UVB and filtration are non-negotiable.',
    priorities: ['filtration', 'water testing', 'basking dock', 'dry haul-out area']
  }
};

const TRACKS = {
  first: {
    label: 'First reptile / researching',
    goal: 'Understand the animal before purchase and identify whether the setup, schedule and household are ready.',
    emphasis: ['mindset', 'habitat', 'hygiene', 'feeding']
  },
  keeper: {
    label: 'Current keeper',
    goal: 'Tighten routine husbandry, improve handling consistency and spot early warning signs.',
    emphasis: ['records', 'behavior', 'health', 'enrichment']
  },
  family: {
    label: 'Family / child education',
    goal: 'Create adult-controlled safety rules for a home where children or guests may be present.',
    emphasis: ['hygiene', 'supervision', 'handling', 'boundaries']
  },
  advanced: {
    label: 'Advanced, large or sensitive species',
    goal: 'Stress-test safety, second-person protocols, veterinary readiness and emergency planning before acquisition or contact.',
    emphasis: ['advanced', 'emergency', 'risk', 'records']
  }
};

const SITUATIONS = [
  ['newArrival', 'New arrival / still settling in', 'Delay routine handling until the animal has acclimated, hydrated and eaten or established normal behavior.'],
  ['afterMeal', 'Recently fed', 'Handling too soon can cause stress, regurgitation or defensive behavior.'],
  ['inShed', 'Shed, dull color, cloudy eyes or skin issue', 'Vision, comfort and tolerance may be reduced; humidity and surfaces matter.'],
  ['children', 'Children or guests may interact', 'An adult must control access, hygiene, duration and room setup.'],
  ['largeAnimal', 'Large, strong, fast or defensive animal', 'Needs written rules, escape control and second-person protocols where appropriate.'],
  ['foodScent', 'Food scent, insects, thawed prey or greens nearby', 'Separate feeding cues from handling cues; wash and use tools.'],
  ['quarantine', 'Animal is in quarantine', 'Handle last, use dedicated tools and minimize stress.'],
  ['aquaticCleaning', 'Tank or water feature needs cleaning', 'Dirty water, biofilm and shared sinks increase health and hygiene risks.'],
  ['uvbUnknown', 'UVB or heat-source setup is unknown', 'Lighting and heat mistakes cause chronic illness in many reptiles.'],
  ['healthConcern', 'Possible illness, injury, mites, abnormal breathing, swelling or lethargy', 'Stop routine handling and contact a qualified reptile veterinarian.']
];

const MODULES = [
  {
    id: 'mindset',
    title: '1. Keeper mindset: reptiles are not mammals',
    body: [
      'Reptiles do not need affection in the mammalian sense. They need correct heat, humidity, lighting, food, hydration, security, sanitation and choice between microclimates.',
      'Most “behavior problems” begin as husbandry problems: incorrect temperatures, poor enclosure security, wrong lighting, overhandling, dirty water, insufficient hides, seasonal rhythm or illness.',
      'The keeper’s job is to control risk quietly: prevent escapes, burns, dehydration, metabolic bone disease, prey injuries, Salmonella transmission, chronic stress and missed warning signs.'
    ],
    actions: ['Research exact species, adult size, diet, lifespan and legal restrictions before buying.', 'Build the adult-level enclosure plan before the juvenile arrives.', 'Find a qualified reptile veterinarian before there is an emergency.']
  },
  {
    id: 'habitat',
    title: '2. Habitat engineering: gradients, not guesses',
    body: [
      'Reptiles are ectotherms. Digestion, movement, immunity, shedding and appetite depend on access to correct warm, cool, dry, humid, bright, shaded, aquatic or basking zones depending on species.',
      'One uniform temperature is not husbandry; choice is husbandry. A thermostat controls heat. Thermometers and hygrometers verify what the animal actually experiences.',
      'Arboreal animals need usable height, aquatic turtles need filtered water plus a dry basking zone, arid species often still need hydration strategy, and tropical setups need ventilation as much as humidity.'
    ],
    actions: ['Map warm side, cool side, humid retreat, basking/UVB zone and escape routes.', 'Use thermostats on heat sources and replace UVB bulbs on schedule.', 'Test the empty enclosure for several days before the animal arrives.']
  },
  {
    id: 'hygiene',
    title: '3. Hygiene and household safety',
    body: [
      'Healthy reptiles can carry Salmonella without looking sick. Wash hands after touching reptiles, prey, feeders, water bowls, substrate, hides or cleaning equipment.',
      'Keep reptiles and reptile equipment away from kitchens, dining surfaces and food-preparation sinks. Children under five, older adults, pregnant people and immunocompromised people need stricter controls.',
      'Aquatic turtle water, bioactive soil, insect bins and thawed prey all require dedicated tools and cleaning zones. “Looks clean” is not the same as low-risk.'
    ],
    actions: ['Create a cleaning kit that never enters food spaces.', 'Disinfect surfaces safely and rinse where the animal contacts them.', 'Write family rules for children and guests.']
  },
  {
    id: 'handling',
    title: '4. Handling: consent, support and exit plans',
    body: [
      'Read posture first. Loose exploration, normal breathing and steady investigation are different from freezing, gaping, hissing, tail whipping, musking, biting, fleeing or frantic climbing.',
      'Approach calmly, support the body, avoid predator-like overhead grabs and end sessions before the animal is exhausted or defensive. Many reptiles should be observed more than handled.',
      'Never restrain the head or neck for casual handling, place snakes around the neck, grab lizards by the tail, allow unsupervised child handling or free-handle venomous/medically significant animals.'
    ],
    actions: ['Keep early sessions short and predictable.', 'Handle over safe surfaces and close doors/windows first.', 'Use hooks, tubs or visual barriers for food-responsive or advanced animals.']
  },
  {
    id: 'feeding',
    title: '5. Feeding: nutrition, schedule and food response',
    body: [
      'Diet is species-specific. Snakes usually take whole prey, insectivorous lizards need gut-loaded/dusted feeders, herbivorous tortoises need fiber-rich greens, and aquatic turtles often need varied animal and plant matter.',
      'Overfeeding creates obesity, organ stress and shortened healthy lifespan. Underfeeding, low temperatures, incorrect UVB, dehydration and stress can stall growth or trigger refusal.',
      'Use records. Track prey or feeder type, supplements, dates, refusals, weight trend, shed, stool, water quality and behavior. Memory misses patterns that records catch.'
    ],
    actions: ['Separate feeding cues from handling cues.', 'Never microwave prey and never leave live rodents unattended with snakes.', 'Review heat, UVB, hydration and security before blaming a picky animal.']
  },
  {
    id: 'behavior',
    title: '6. Behavior decoder: normal, stressed or urgent?',
    body: [
      'Hiding, basking, burrowing, soaking, climbing, fasting, glass-surfing and defensive displays can be normal or concerning depending on species, season and context.',
      'The key question is change from baseline. A new pattern matters more than a single behavior: less basking, weaker grip, abnormal posture, noisy breathing, repeated escape attempts or reduced appetite can signal husbandry or health issues.',
      'Do not punish reptile behavior. Adjust the environment, reduce stress, observe, record and seek veterinary help when signs point beyond routine care.'
    ],
    actions: ['Log normal behavior for your individual animal.', 'Make one husbandry change at a time when safe.', 'Escalate quickly for breathing issues, neurologic signs, burns, prolapse or major appetite/weight changes.']
  },
  {
    id: 'health',
    title: '7. Health warning signs and emergency thinking',
    body: [
      'Open-mouth breathing, bubbles, wheezing, neurologic signs, prolapse, burns, swelling, mouth redness, retained eye caps, parasites, shell lesions, soft jaw/limbs and unexplained weight loss are not wait-and-see issues.',
      'Do not use leftover antibiotics, dog or cat parasite products, essential oils, tape for retained shed, internet force-feeding methods or improvised vitamin dosing. Many household remedies are dangerous to reptiles.',
      'When behavior changes, check environment first, records second and contact a qualified reptile veterinarian early. Reptiles often hide illness until it is advanced.'
    ],
    actions: ['Keep transport tubs, towels and heat-safe travel supplies ready.', 'Save vet contact information in the reptile room.', 'Bring records, photos and fresh samples when your veterinarian requests them.']
  }
];

const BEHAVIOR_DECODER = [
  ['Steady exploration, normal breathing, relaxed posture', 'Curious or calm investigation', 'Continue calmly; support the animal and keep sessions short.'],
  ['Freezing, hissing, gaping, tail vibration/whip, musking', 'Defensive stress signal', 'Stop pushing contact. Add distance, security and a calmer routine.'],
  ['Dull color, cloudy eyes, retained shed, rough skin', 'Shed/humidity or skin support issue', 'Avoid handling; verify humidity, surfaces and hydration. Seek help for retained eye caps or constriction.'],
  ['Persistent soaking or staying at water', 'May be hydration, heat, mites, shedding or normal aquatic behavior', 'Verify temperatures, inspect for mites and compare against species baseline.'],
  ['Glass surfing, repeated escape attempts, frantic climbing', 'Stress, enclosure mismatch, seasonal drive or unmet needs', 'Check enclosure size, cover, temperatures, light cycle and privacy.'],
  ['Food refusal with stable weight and normal behavior', 'May be seasonal, maturity-related, prey preference or setup-related', 'Record it, verify husbandry and avoid panic-feeding changes.'],
  ['Regurgitation, vomiting, diarrhea or abnormal stool', 'Stress, low temperature, wrong food size, parasite or illness', 'Pause feeding temporarily, minimize stress and contact a reptile veterinarian if repeated/severe.'],
  ['Weakness, tremors, soft jaw/limbs, poor grip', 'Possible metabolic, neurologic, nutritional or lighting issue', 'Treat as urgent; verify UVB/heat and contact a reptile veterinarian.']
];

const STARTER_CHECKLIST = [
  'Exact species, adult size, lifespan, diet and legal restrictions researched from reputable sources.',
  'Enclosure is appropriate for adult size or has a written upgrade schedule.',
  'Thermostat controls every heat source; temperature readings are verified independently.',
  'UVB/basking plan matches species needs and bulb distance/replacement schedule is documented.',
  'Warm zone, cool zone, hides/cover and species-appropriate humidity or hydration are ready.',
  'Escape-proof enclosure with positive latches, closed cable gaps and safe ventilation.',
  'Fresh water, safe substrate, cleaning tools and dedicated non-kitchen cleaning zone ready.',
  'Food source, supplements/feeder care or frozen-thawed prey handling plan identified.',
  'Reptile veterinarian located and emergency transport container prepared.',
  'Quarantine or intake plan ready for any new reptile.',
  'Household hygiene rules understood by every adult who may supervise contact.',
  'Records started for weight, meals, refusals, sheds, cleaning, water quality and behavior.'
];

const QUIZ = [
  ['A reptile keeps hiding. What is the first assumption?', 'It may be normal or a security/temperature issue; check species baseline and enclosure conditions before calling it a personality problem.'],
  ['Can reptile equipment be washed in the kitchen sink?', 'No. Use dedicated tools and cleaning zones away from food-preparation areas.'],
  ['What does a thermostat do?', 'It controls a heat source. Thermometers verify the temperatures the animal can actually access. You need both.'],
  ['Should most snakes be handled right after eating?', 'No. Wait at least 24–48 hours, longer for large meals, heavy-bodied species or regurgitation-prone animals.'],
  ['Why do many lizards and turtles need UVB?', 'UVB supports vitamin D3 synthesis and calcium metabolism; incorrect UVB can contribute to metabolic bone disease.']
];

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY) || '{}');
    return {
      animalType: ANIMAL_TYPES[raw.animalType] ? raw.animalType : 'snake',
      habitat: HABITATS[raw.habitat] ? raw.habitat : 'tropical',
      track: TRACKS[raw.track] ? raw.track : 'first',
      species: typeof raw.species === 'string' ? raw.species : 'ball-python',
      experience: Number.isFinite(raw.experience) ? Math.min(10, Math.max(0, raw.experience)) : 2,
      readiness: Number.isFinite(raw.readiness) ? Math.min(10, Math.max(0, raw.readiness)) : 3,
      situations: Array.isArray(raw.situations) ? raw.situations.filter((s) => SITUATIONS.some(([id]) => id === s)) : ['newArrival', 'children'],
      quizOpen: raw.quizOpen === true
    };
  } catch {
    return defaults();
  }
}

function defaults() {
  return { animalType: 'snake', habitat: 'tropical', track: 'first', species: 'ball-python', experience: 2, readiness: 3, situations: ['newArrival', 'children'], quizOpen: false };
}

const state = loadState();

function saveState() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* no storage */ }
}

function selectedSpecies() {
  return SPECIES.find((s) => s.id === state.species) || SPECIES[0];
}

function animalProfile() {
  return ANIMAL_TYPES[state.animalType] || ANIMAL_TYPES.snake;
}

function habitatProfile() {
  return HABITATS[state.habitat] || HABITATS.tropical;
}

function riskProfile() {
  const chosen = new Set(state.situations);
  const species = selectedSpecies();
  let risk = 0;
  if (state.experience <= 2) risk += 2;
  if (state.readiness <= 4) risk += 2;
  if (state.animalType === 'snake' && species.difficulty >= 4) risk += 2;
  if (state.animalType === 'snake' && species.adultLength?.[1] >= 96) risk += 2;
  if (state.animalType === 'turtle' && state.habitat !== 'aquatic') risk += 2;
  if (chosen.has('largeAnimal')) risk += 2;
  if (chosen.has('afterMeal')) risk += 2;
  if (chosen.has('foodScent')) risk += 2;
  if (chosen.has('uvbUnknown') && state.animalType !== 'snake') risk += 3;
  if (chosen.has('uvbUnknown') && state.animalType === 'snake') risk += 1;
  if (chosen.has('aquaticCleaning') || (state.animalType === 'turtle' && chosen.has('children'))) risk += 2;
  if (chosen.has('inShed')) risk += 1;
  if (chosen.has('children')) risk += 1;
  if (chosen.has('healthConcern')) risk += 4;
  if (chosen.has('newArrival')) risk += 1;
  if (chosen.has('quarantine')) risk += 1;
  const level = risk >= 8 ? 'critical' : risk >= 4 ? 'caution' : 'clear';
  return { risk, level };
}

function renderControls() {
  const speciesOptions = SPECIES.map((s) => [s.id, `${s.common} — ${s.scientific}`]);
  render(
    controls,
    toolPanel(
      'Build your lesson plan',
      fieldSelect({
        label: 'Animal focus',
        value: state.animalType,
        options: Object.entries(ANIMAL_TYPES).map(([id, t]) => [id, t.label]),
        hint: 'Broad reptile category. Snake selection unlocks this site’s species data.',
        onChange: (v) => { state.animalType = v; if (v === 'turtle') state.habitat = 'aquatic'; saveState(); update(); }
      }),
      fieldSelect({
        label: 'Habitat style',
        value: state.habitat,
        options: Object.entries(HABITATS).map(([id, t]) => [id, t.label]),
        hint: 'Use the closest natural-history model for the enclosure lesson.',
        onChange: (v) => { state.habitat = v; saveState(); update(); }
      }),
      fieldSelect({
        label: 'Learning track',
        value: state.track,
        options: Object.entries(TRACKS).map(([id, t]) => [id, t.label]),
        hint: 'Changes the emphasis of the action plan.',
        onChange: (v) => { state.track = v; saveState(); update(); }
      }),
      state.animalType === 'snake' ? fieldSelect({
        label: 'Reference snake species',
        value: state.species,
        options: speciesOptions,
        hint: 'Used to tune size, difficulty and care notes from this site’s species library.',
        onChange: (v) => { state.species = v; saveState(); update(); }
      }) : null,
      fieldRange({
        label: 'Keeper experience',
        value: state.experience,
        min: 0,
        max: 10,
        step: 1,
        format: (n) => `${n}/10`,
        onChange: (n) => { state.experience = n; saveState(); update(); }
      }),
      fieldRange({
        label: 'Setup readiness',
        value: state.readiness,
        min: 0,
        max: 10,
        step: 1,
        format: (n) => `${n}/10`,
        onChange: (n) => { state.readiness = n; saveState(); update(); }
      })
    ),
    toolPanel(
      'Current situation',
      h('div', { class: 'stack stack--xs' },
        ...SITUATIONS.map(([id, label, hint]) => fieldCheck({
          label,
          hint,
          checked: state.situations.includes(id),
          onChange: (checked) => {
            const set = new Set(state.situations);
            checked ? set.add(id) : set.delete(id);
            state.situations = [...set];
            saveState();
            update();
          }
        }))
      )
    ),
    h('button', {
      class: 'btn btn--block btn--ghost',
      type: 'button',
      on: { click: () => { localStorage.removeItem(KEY); localStorage.removeItem(OLD_KEY); Object.assign(state, defaults()); update(); toast('Academy inputs reset.', 'info'); } }
    }, 'Reset academy')
  );
}

function renderOutput() {
  const species = selectedSpecies();
  const track = TRACKS[state.track];
  const animal = animalProfile();
  const habitat = habitatProfile();
  const risk = riskProfile();
  const handling = handlingRecommendation(risk, species, animal);
  const selectedNotes = SITUATIONS.filter(([id]) => state.situations.includes(id));
  const score = Math.max(0, 100 - risk.risk * 9 - Math.max(0, 5 - state.readiness) * 4 - Math.max(0, 3 - state.experience) * 4);

  render(
    output,
    h('section', { class: 'academy-dashboard panel panel--brass' },
      h('div', { class: 'academy-score' },
        h('span', { class: `academy-score__ring academy-score__ring--${risk.level}`, style: { '--score': `${score}%` } }, h('span', { text: `${score}` })),
        h('div', {},
          h('p', { class: 'eyebrow', text: 'Readiness snapshot' }),
          h('h2', { text: score >= 78 ? 'Solid foundation' : score >= 50 ? 'Proceed with controls' : 'Training needed before contact' }),
          h('p', { class: 'text-muted', text: track.goal })
        )
      ),
      statBlock(dashboardStats(species, animal, habitat)),
      noticeFor(risk.level, handling)
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Care path' }),
        h('h2', { text: `${animal.label} learning path` })
      ),
      h('div', { class: 'academy-path' },
        pathTile('01', 'Animal lens', animal.promise),
        pathTile('02', 'Habitat lens', `${habitat.label}: ${habitat.range}`),
        pathTile('03', 'Risk lens', risk.level === 'clear' ? 'No major red flags selected. Keep standard hygiene and observation habits.' : 'Pause and resolve the selected flags before pushing interaction.'),
        pathTile('04', 'Record lens', 'Write down meals, sheds, weight, cleaning, water quality, UVB changes, temperatures and behavior changes.')
      )
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Your immediate action plan' }),
        h('h2', { text: 'What to do before the next handling, feeding or enclosure decision' })
      ),
      h('div', { class: 'academy-plan' }, ...actionPlan(species, animal, habitat, risk).map((item, i) => planCard(i + 1, item)))
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Habitat cockpit' }),
        h('h2', { text: 'Build the environment around choices, not decoration' })
      ),
      h('div', { class: 'academy-cockpit' }, ...habitatCockpit(animal, habitat).map(([k, v]) => h('div', { class: 'cockpit-card' }, h('span', { text: k }), h('p', { text: v }))))
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Situation flags' }),
        h('h2', { text: selectedNotes.length ? 'The risks you selected' : 'No special risks selected' })
      ),
      selectedNotes.length
        ? h('div', { class: 'grid grid--2' }, ...selectedNotes.map(([, label, hint]) => h('div', { class: 'mini-card' }, h('h3', { text: label }), h('p', { text: hint }))))
        : noticeFor('clear', 'No special flags are selected. Still use standard hygiene, support and enclosure checks every session.')
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Field manual' }),
        h('h2', { text: 'Core lessons every reptile keeper should know' })
      ),
      h('div', { class: 'accordion academy-lessons' }, ...MODULES.map((m, idx) => lesson(m, idx === 0 || track.emphasis.some((e) => m.id.includes(e)))))
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Behavior decoder' }),
        h('h2', { text: 'What the reptile may be telling you' })
      ),
      h('div', { class: 'scroll-x', role: 'region', 'aria-label': 'Reptile behavior decoder', tabindex: '0' },
        h('table', { class: 'table care-table' },
          h('thead', {}, h('tr', {}, h('th', { text: 'Observation' }), h('th', { text: 'Likely meaning' }), h('th', { text: 'Keeper response' }))),
          h('tbody', {}, ...BEHAVIOR_DECODER.map(([obs, meaning, response]) => h('tr', {}, h('td', { text: obs }), h('td', { text: meaning }), h('td', { text: response }))))
        )
      )
    ),

    state.animalType === 'snake' ? snakeSpeciesSection(species) : archetypeSection(animal, habitat),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Learning check' }),
        h('h2', { text: 'Five questions before ownership or handling' })
      ),
      h('div', { class: 'academy-quiz' }, ...QUIZ.map(([q, a], i) => h('details', { class: 'quiz-card', open: state.quizOpen && i === 0 ? '' : null }, h('summary', {}, q), h('p', { text: a }))))
    ),

    h('section', { class: 'academy-section' },
      h('div', { class: 'section-heading' },
        h('p', { class: 'eyebrow', text: 'Print-ready checklist' }),
        h('h2', { text: 'Before a reptile comes home' })
      ),
      h('div', { class: 'academy-checklist' }, ...STARTER_CHECKLIST.map((item) => h('label', { class: 'protocol-item' }, h('input', { type: 'checkbox' }), h('span', { class: 'protocol-item__task', text: item }))))
    ),

    methodology('How to use this tool safely', [
      'This page is an education and planning tool. It is not a veterinary diagnosis, not a replacement for a species-specific care sheet and not legal advice for restricted species.',
      'The risk score is deliberately conservative. It is built from husbandry readiness, keeper experience, animal category, species difficulty where available and immediate situational flags such as feeding, shed, quarantine, children, food scent, UVB uncertainty, water cleaning and health concerns.',
      'Exact temperatures, humidity, UVB index, enclosure dimensions, prey or diet, supplements and seasonal rhythms differ by species, age, sex, locality and individual health. Use this tool to ask better questions, then verify details with reputable sources and an experienced reptile veterinarian.'
    ])
  );
}

function dashboardStats(species, animal, habitat) {
  if (state.animalType === 'snake') {
    return [
      [`${species.difficulty}/5`, 'Species difficulty', species.common],
      [`${species.adultLength?.[0] || '—'}–${species.adultLength?.[1] || '—'} in`, 'Adult length', 'Plan for adult size'],
      [`${species.care?.humidity?.[0] || '—'}–${species.care?.humidity?.[1] || '—'}%`, 'Humidity range', 'Starting point'],
      [`${species.care?.warmSide?.[0] || '—'}–${species.care?.warmSide?.[1] || '—'}°F`, 'Warm side', 'Thermostat-controlled']
    ];
  }
  return [
    [animal.icon, 'Animal focus', animal.label],
    [habitat.label.split(' ')[0], 'Habitat model', habitat.range],
    [state.situations.includes('uvbUnknown') ? 'Verify' : 'Plan', 'Lighting/UVB', 'Species-specific requirement'],
    [state.readiness >= 7 ? 'Ready' : 'Build', 'Setup status', 'Test before contact']
  ];
}

function handlingRecommendation(risk, species, animal) {
  if (state.situations.includes('healthConcern')) return 'Do not perform routine handling. Isolate if appropriate, verify heat, UVB, hydration and ventilation, preserve records and contact a qualified reptile veterinarian.';
  if (state.situations.includes('afterMeal')) return 'Do not handle now. Let digestion progress before contact; extend the wait for large meals, heavy-bodied reptiles or regurgitation-prone species.';
  if (state.situations.includes('foodScent')) return 'Do not free-handle around food scent. Wash, remove prey/feed cues and use tools, bowls, tongs or a hook/tap routine before judging temperament.';
  if (state.situations.includes('uvbUnknown') && state.animalType !== 'snake') return 'Pause acquisition confidence until lighting is verified. Many lizards, turtles and tortoises can suffer serious disease from incorrect UVB and calcium planning.';
  if (state.situations.includes('largeAnimal') || (state.animalType === 'snake' && species.adultLength?.[1] >= 120)) return 'Use advanced-animal protocols: no risky solo handling, no neck placement for snakes, doors secured, phone accessible and a second competent adult when size or behavior demands it.';
  if (risk.level === 'critical') return 'Pause direct handling until the flagged risks are resolved. Work on enclosure security, observation, records and professional support first.';
  if (risk.level === 'caution') return `Proceed only with a short, controlled ${animal.label.toLowerCase()} session: calm room, clean hands, supported body, no feed scent, clear exit plan and no children handling independently.`;
  return 'Standard low-stress interaction is reasonable: read posture first, support the animal, respect retreat signals and end before stress rises.';
}

function actionPlan(species, animal, habitat, risk) {
  const items = [];
  if (state.readiness < 6) items.push(['Complete the enclosure first', `Run the ${habitat.label.toLowerCase()} setup before acquisition or handling goals: verified gradient, safe lighting/heat, secure hides/cover, clean water, correct humidity/hydration and escape-proof latches.`]);
  if (state.experience < 4) items.push(['Practice observation before contact', 'Spend several sessions only reading posture, breathing, tongue flicks or visual scanning, retreat choices, basking and activity timing. Handling skill begins with knowing when not to handle.']);
  if (state.situations.includes('children')) items.push(['Write family rules', 'Adults control the animal and the room. Children watch or touch only under direct adult control, then wash hands. No reptiles near food spaces.']);
  if (state.situations.includes('uvbUnknown') && state.animalType !== 'snake') items.push(['Verify lighting and supplements', 'Confirm UVB type, distance, screen blockage, replacement age, basking access, calcium/D3 plan and diet before assuming the setup is healthy.']);
  if (state.situations.includes('aquaticCleaning') || state.animalType === 'turtle') items.push(['Treat water as life support', 'Test water, size filtration for the animal, provide a fully dry basking dock and never clean aquatic equipment in food-preparation sinks.']);
  if (state.situations.includes('quarantine')) items.push(['Protect the collection', 'Use dedicated tools, simple furnishings, paper substrate where appropriate and last-of-day care. Do not share tongs, bowls, hides or cleaning equipment.']);
  if (state.situations.includes('largeAnimal') || (state.animalType === 'snake' && species.adultLength?.[1] >= 96)) items.push(['Define second-person thresholds', 'Before the animal is large or defensive, decide when solo handling stops, who the second adult is, and how doors, phones and emergency steps work.']);
  if (risk.level !== 'clear') items.push(['Resolve the red flags', 'Do not try to out-handle stress, food response, shed problems, recent meals, poor water, unknown UVB or possible illness. Fix the context first, then reassess.']);
  items.push(['Start records today', 'Track meals, feeders/supplements, refusals, shed, waste, weight, temperatures, humidity, water quality, cleaning, UVB replacement and unusual behavior. Trends reveal problems earlier than memory.']);
  items.push(['Use the right companion tools', 'After this lesson, use Husbandry Architect for enclosure specs, Feeding & Growth for prey planning and Quarantine Protocol for new arrivals.']);
  return items.slice(0, 7);
}

function habitatCockpit(animal, habitat) {
  const base = [
    ['Heat gradient', 'Create a verified warm zone and cool retreat so the animal can regulate itself instead of being trapped at one temperature.'],
    ['Security', 'Use hides, cover, visual barriers and latches. A calm reptile is usually a reptile that can choose privacy.'],
    ['Hydration', habitat.range],
    ['Records', 'Log readings and behavior. The cockpit is only as good as the measurements behind it.']
  ];
  for (const p of habitat.priorities.slice(0, 3)) base.push(['Priority', p]);
  for (const c of animal.cautions.slice(0, 2)) base.push(['Caution', c]);
  return base.slice(0, 8);
}

function snakeSpeciesSection(species) {
  return h('section', { class: 'academy-section' },
    h('div', { class: 'section-heading' },
      h('p', { class: 'eyebrow', text: 'Species-specific starting point' }),
      h('h2', { text: `${species.common}: what this tool knows` })
    ),
    h('div', { class: 'specs' },
      spec('Scientific name', species.scientific),
      spec('Origin', species.origin),
      spec('Natural context', species.biome),
      spec('Temperament', species.temperament),
      spec('Substrate options', species.care?.substrate?.join(', ') || 'Species-specific research required'),
      spec('Feeding note', species.care?.feedingAdult || 'Use species-specific prey and interval guidance'),
      spec('Critical note', species.care?.notes || 'Confirm details with a current care sheet and veterinarian')
    )
  );
}

function archetypeSection(animal, habitat) {
  return h('section', { class: 'academy-section' },
    h('div', { class: 'section-heading' },
      h('p', { class: 'eyebrow', text: 'General reptile starting point' }),
      h('h2', { text: `${animal.label}: what to verify next` })
    ),
    h('div', { class: 'specs' },
      spec('Animal category', animal.label),
      spec('Habitat model', habitat.label),
      spec('Primary environment lesson', habitat.range),
      spec('Care caution 1', animal.cautions[0]),
      spec('Care caution 2', animal.cautions[1]),
      spec('Care caution 3', animal.cautions[2]),
      spec('Critical note', 'This broad category view is a starting point only. Verify exact species requirements before purchase or husbandry changes.')
    )
  );
}

function pathTile(n, title, body) {
  return h('article', { class: 'path-tile' }, h('span', { text: n }), h('h3', { text: title }), h('p', { text: body }));
}

function planCard(n, [title, body]) {
  return h('article', { class: 'plan-card' }, h('span', { class: 'plan-card__num', text: String(n).padStart(2, '0') }), h('h3', { text: title }), h('p', { text: body }));
}

function lesson(m, open) {
  return h('details', { open: open ? '' : null },
    h('summary', {}, m.title),
    h('div', { class: 'accordion__body prose' },
      ...m.body.map((p) => h('p', { text: p })),
      h('ul', {}, ...m.actions.map((a) => h('li', { text: a })))
    )
  );
}

function spec(k, v) {
  return h('div', { class: 'spec' }, h('span', { class: 'spec__k', text: k }), h('span', { class: 'spec__v', text: v }));
}

function update() {
  renderControls();
  renderOutput();
}

update();
