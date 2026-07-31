/**
 * Jurisdiction guidance.
 *
 * IMPORTANT: this is a starting point for a conversation, not legal advice and
 * not a substitute for checking. Reptile law changes at three levels at once —
 * federal, state and municipal — and the municipal layer is the one that
 * catches people out. Every record here carries its own review date and the UI
 * surfaces that date rather than hiding it.
 */

export const LAST_REVIEWED = '2026-07-01';

export const DISCLAIMER =
  'Compiled as a research aid and reviewed periodically. It is not legal advice. City and county ordinances frequently restrict animals that state law permits, and they are not comprehensively captured here. Confirm with your state wildlife agency and your local authority before placing an order — we will ask you to attest that you have done so.';

/** Federal-level constraints that apply regardless of destination state. */
export const FEDERAL = [
  {
    id: 'lacey',
    title: 'Lacey Act — injurious wildlife listing',
    applies: ['reticulated-python'],
    level: 'permit',
    body:
      'The reticulated python was added to the US Fish and Wildlife Service injurious wildlife list in 2015, alongside the green anaconda and two other anaconda species. The listing bans importation into the United States outright. It does not, following the D.C. Circuit\'s 2017 decision in United States Association of Reptile Keepers v. Zinke, prohibit transport between the states — the court held the Act\'s "shipment between States" clause does not reach that conduct. We ship domestically on that basis; the position has been stable since, but it is a court holding rather than a statutory amendment and you should treat it as live.',
    action: 'We supply the full documentation package with every retic. Confirm your own state has not layered its own restriction on top.'
  },
  {
    id: 'lacey-burm',
    title: 'Lacey Act — species we do not handle',
    applies: [],
    level: 'prohibited',
    body:
      'Burmese pythons, Northern and Southern African rock pythons and yellow anacondas are all injurious-listed. We do not breed, hold or broker any of them, and we will decline enquiries for them.',
    action: null
  },
  {
    id: 'cites',
    title: 'CITES Appendix II',
    applies: ['ball-python', 'reticulated-python', 'green-tree-python', 'boa-constrictor', 'blood-python', 'emerald-tree-boa', 'brazilian-rainbow-boa'],
    level: 'permit',
    body:
      'Most of what we place is CITES Appendix II listed. Appendix II imposes no restriction whatsoever on domestic US movement of captive-bred animals. It becomes relevant only on export, where a CITES export permit and a matching import permit in the destination country are both required before the animal moves.',
    action: 'International clients: we handle the export permit. You are responsible for the import permit, and we will not despatch until we have seen it.'
  },
  {
    id: 'esa',
    title: 'Endangered Species Act',
    applies: [],
    level: 'open',
    body: 'None of the species we place is listed under the Endangered Species Act. All animals are captive-bred, multi-generation, with documented lineage.',
    action: null
  }
];

/**
 * level: 'open' | 'notify' | 'permit' | 'restricted' | 'prohibited'
 */
export const STATES = {
  AL: { level: 'open', note: 'No state restriction on the species we place. Venomous native species are separately regulated.' },
  AK: { level: 'restricted', note: 'Alaska operates a restrictive "clean list" — animals not expressly permitted are prohibited. Confirm with the Department of Fish and Game before ordering.' },
  AZ: { level: 'open', note: 'Non-venomous constrictors are unrestricted at state level. Several municipalities impose length limits.' },
  AR: { level: 'open', note: 'No state restriction on the species we place.' },
  CA: { level: 'restricted', note: 'California maintains a restricted species list administered by CDFW. The common pythons and boas we place are generally permitted, but the list is specific and unforgiving — verify your exact species before ordering.' },
  CO: { level: 'open', note: 'No state restriction on the species we place.' },
  CT: { level: 'permit', note: 'Connecticut restricts several large constrictors and requires registration for others. Check with DEEP before ordering anything expected to exceed six feet.' },
  DE: { level: 'permit', note: 'A permit is required for many non-native species. Contact the Division of Fish and Wildlife.' },
  DC: { level: 'prohibited', note: 'The District prohibits the private possession of all snakes other than a narrow list of small colubrids. We cannot ship to a DC address.' },
  FL: { level: 'restricted', note: 'Florida\'s 2021 rule moved reticulated pythons, Burmese pythons, green anacondas and African rock pythons to Prohibited status. Personal possession of these is no longer permitted for new keepers. Ball pythons, boas, carpets, bloods, GTPs and hognose remain unrestricted.' },
  GA: { level: 'permit', note: 'Georgia requires a wild animal licence for many non-native species. Ball pythons and most common boids are exempt; confirm for anything larger.' },
  HI: { level: 'prohibited', note: 'Hawaii prohibits the private possession of all snakes without exception, and enforcement is aggressive. We cannot ship to Hawaii under any circumstances.' },
  ID: { level: 'open', note: 'No state restriction on the species we place.' },
  IL: { level: 'permit', note: 'Illinois restricts constrictors over six feet under the Herptiles-Herps Act. A permit is required.' },
  IN: { level: 'open', note: 'No state restriction on the species we place. Indianapolis imposes its own limits.' },
  IA: { level: 'restricted', note: 'Iowa restricts "dangerous wild animals", which includes several large constrictors. Verify before ordering.' },
  KS: { level: 'open', note: 'No state restriction on the species we place.' },
  KY: { level: 'restricted', note: 'Kentucky prohibits a schedule of inherently dangerous species including some large constrictors. Verify before ordering.' },
  LA: { level: 'permit', note: 'Louisiana requires a permit for constrictors over twelve feet and for all venomous species.' },
  ME: { level: 'permit', note: 'Maine operates a permit system for non-domesticated species. Ball pythons and corn snakes are on the unrestricted list; most else requires review.' },
  MD: { level: 'open', note: 'No state restriction on the species we place. Baltimore City and several counties impose their own rules.' },
  MA: { level: 'permit', note: 'Massachusetts requires a permit for most non-native reptiles. The exempt list is short — check it carefully.' },
  MI: { level: 'open', note: 'No state restriction on the species we place. Detroit and Ann Arbor have municipal ordinances.' },
  MN: { level: 'restricted', note: 'Minnesota prohibits constrictors over six feet under its regulated animals statute.' },
  MS: { level: 'permit', note: 'Mississippi requires a permit for inherently dangerous animals, which includes large constrictors.' },
  MO: { level: 'notify', note: 'Missouri requires registration of large constrictors with local law enforcement.' },
  MT: { level: 'open', note: 'No state restriction on the species we place.' },
  NE: { level: 'open', note: 'No state restriction on the species we place. Omaha and Lincoln have municipal ordinances.' },
  NV: { level: 'open', note: 'No state restriction on the species we place. Clark County has its own limits.' },
  NH: { level: 'permit', note: 'New Hampshire requires a permit for most non-native reptiles.' },
  NJ: { level: 'permit', note: 'New Jersey requires an exotic species permit for most constrictors. The process is thorough and takes time — start it before you order.' },
  NM: { level: 'open', note: 'No state restriction on the species we place.' },
  NY: { level: 'restricted', note: 'New York State restricts several large constrictors. New York City separately prohibits all constrictors regardless of size, so a city address cannot be served.' },
  NC: {
    level: 'open',
    home: true,
    note: 'Our home state. North Carolina imposes no permit requirement on the non-venomous species we place. Venomous reptiles are governed by G.S. 14-416 et seq., which requires an escape-proof, bite-proof, locking enclosure labelled with the species, its common name, the appropriate antivenin and the owner\'s details, and requires immediate notification of local law enforcement in the event of an escape. Several counties, Lincoln among them, have added their own ordinances — check yours.'
  },
  ND: { level: 'permit', note: 'North Dakota requires a non-traditional livestock licence for many species.' },
  OH: { level: 'permit', note: 'Ohio restricts constrictors over twelve feet under its Dangerous Wild Animals Act. A permit and liability insurance are required.' },
  OK: { level: 'open', note: 'No state restriction on the species we place.' },
  OR: { level: 'open', note: 'No state restriction on the species we place. Portland has a municipal ordinance.' },
  PA: { level: 'open', note: 'No state restriction on the species we place. Philadelphia and Pittsburgh have their own ordinances.' },
  RI: { level: 'permit', note: 'Rhode Island requires a permit for most non-native reptiles.' },
  SC: { level: 'open', note: 'No state restriction on the species we place.' },
  SD: { level: 'permit', note: 'South Dakota requires a permit for non-domestic animals.' },
  TN: { level: 'restricted', note: 'Tennessee classifies some large constrictors as Class I wildlife, requiring a permit that is difficult to obtain privately.' },
  TX: { level: 'permit', note: 'Texas requires a controlled exotic snake permit for retics, African rocks, Burmese, green anacondas and all venomous species.' },
  UT: { level: 'restricted', note: 'Utah operates a controlled species list. Verify before ordering.' },
  VT: { level: 'permit', note: 'Vermont requires a permit for most non-native reptiles.' },
  VA: { level: 'open', note: 'No state restriction on the species we place.' },
  WA: { level: 'restricted', note: 'Washington prohibits several large constrictors as dangerous wild animals.' },
  WV: { level: 'permit', note: 'West Virginia requires a dangerous wild animal permit for some species.' },
  WI: { level: 'open', note: 'No state restriction on the species we place.' },
  WY: { level: 'open', note: 'No state restriction on the species we place.' }
};

export const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', level: 'permit', note: 'Most pythons and boas are unrestricted. The Dangerous Wild Animals Act 1976 schedule does capture the larger constrictors — reticulated python among them — which require a local authority licence. CITES import permit required for all Appendix II species.', ships: true },
  { code: 'DE', name: 'Germany', level: 'restricted', note: 'Regulated at Länder level and the variation is significant. Several states require proof of expertise (Sachkundenachweis) and impose enclosure minimums. CITES import permit required.', ships: true },
  { code: 'NL', name: 'Netherlands', level: 'permit', note: 'Positive-list system. CITES import permit required for Appendix II species.', ships: true },
  { code: 'FR', name: 'France', level: 'permit', note: "Certificat de capacité required above defined thresholds. CITES import permit required.", ships: true },
  { code: 'CH', name: 'Switzerland', level: 'permit', note: 'Cantonal permit required for most snakes, with enclosure and expertise requirements. CITES import permit required.', ships: true },
  { code: 'CA', name: 'Canada', level: 'restricted', note: 'Federal CITES import permit plus provincial and municipal rules. Several major cities prohibit constrictors over three metres.', ships: true },
  { code: 'JP', name: 'Japan', level: 'permit', note: 'Large constrictors are Specified Animals under the Act on Welfare and Management of Animals and require prefectural permission before import.', ships: true },
  { code: 'AE', name: 'United Arab Emirates', level: 'permit', note: 'Import permit from the Ministry of Climate Change and Environment required in advance.', ships: true },
  { code: 'NO', name: 'Norway', level: 'restricted', note: 'Reptile keeping was legalised in 2017 against a defined species list. Ball pythons and corn snakes are included; most else is not.', ships: true },
  { code: 'AU', name: 'Australia', level: 'prohibited', note: 'Australia prohibits the importation of exotic reptiles entirely. There is no permit route and we will decline all enquiries.', ships: false },
  { code: 'NZ', name: 'New Zealand', level: 'prohibited', note: 'New Zealand prohibits the private keeping of snakes entirely.', ships: false },
  { code: 'SG', name: 'Singapore', level: 'prohibited', note: 'Private possession of snakes is prohibited.', ships: false },
  { code: 'IE', name: 'Ireland', level: 'open', note: 'No licensing requirement for the species we place. CITES import permit required for Appendix II species.', ships: true }
];

export const LEVEL_META = {
  open: { label: 'No state restriction', tone: 'clear', rank: 0 },
  notify: { label: 'Notification required', tone: 'caution', rank: 1 },
  permit: { label: 'Permit required', tone: 'caution', rank: 2 },
  restricted: { label: 'Restricted species list', tone: 'warn', rank: 3 },
  prohibited: { label: 'Prohibited', tone: 'critical', rank: 4 }
};

/**
 * @param {{state?:string, country?:string, species?:string}} q
 */
export function check(q) {
  const out = { federal: [], jurisdiction: null, level: 'open', shippable: true, disclaimer: DISCLAIMER, reviewed: LAST_REVIEWED };

  for (const f of FEDERAL) {
    if (!f.applies.length && f.level === 'prohibited') continue;
    if (!q.species || !f.applies.length || f.applies.includes(q.species)) {
      if (f.applies.length && q.species && !f.applies.includes(q.species)) continue;
      out.federal.push(f);
    }
  }

  if (q.country && q.country !== 'US') {
    const c = COUNTRIES.find((x) => x.code === q.country);
    if (c) {
      out.jurisdiction = { kind: 'country', name: c.name, level: c.level, note: c.note };
      out.level = c.level;
      out.shippable = c.ships;
    }
    return out;
  }

  if (q.state) {
    const s = STATES[q.state];
    if (s) {
      out.jurisdiction = { kind: 'state', name: q.state, level: s.level, note: s.note, home: !!s.home };
      out.level = s.level;
      out.shippable = s.level !== 'prohibited';
    }
  }

  // Species-specific state overlays.
  if (q.species === 'reticulated-python' && q.state && ['FL', 'TX', 'TN', 'WA', 'MN', 'IL', 'OH'].includes(q.state)) {
    out.speciesOverlay = {
      level: q.state === 'FL' ? 'prohibited' : 'permit',
      note:
        q.state === 'FL'
          ? 'Florida moved reticulated pythons to Prohibited status in 2021. New private possession is not permitted and we cannot ship this species to a Florida address.'
          : 'This state specifically regulates reticulated pythons. A permit must be in hand before we will despatch.'
    };
    if (out.speciesOverlay.level === 'prohibited') out.shippable = false;
    if (LEVEL_META[out.speciesOverlay.level].rank > LEVEL_META[out.level].rank) out.level = out.speciesOverlay.level;
  }

  return out;
}
