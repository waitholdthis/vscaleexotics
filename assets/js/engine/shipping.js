/**
 * Safe-shipping window model.
 *
 * Uses regional climatological normals, not a forecast. That is a deliberate
 * choice: this tool answers "is this a sane week to move an animal" months in
 * advance, and a 7-day forecast cannot. The final go/no-go is always made
 * against the actual forecast on the morning of despatch.
 */

export const CARRIER_RULES = {
  service: 'FedEx Priority Overnight',
  note:
    'Live reptiles move on FedEx Priority Overnight only. It is a federal offence to ship reptiles via USPS, and no ground service is ever acceptable.',
  shipDays: [1, 2, 3], // Mon–Wed, so nothing can be caught over a weekend
  shipDayLabel: 'Monday to Wednesday',
  cutoff: '14:00 ET',
  safeRange: [35, 90],
  holdRange: [25, 95],
  heatPackBelow: 50,
  coldPackAbove: 85
};

/** Federal holidays that suspend despatch. Reviewed annually. */
const BLACKOUT = new Set([
  '2026-09-07', '2026-11-26', '2026-11-27', '2026-12-24', '2026-12-25', '2026-12-31',
  '2027-01-01', '2027-01-18', '2027-05-31', '2027-07-05', '2027-09-06', '2027-11-25', '2027-11-26', '2027-12-24'
]);

/**
 * Monthly climatological normals [avgLowF, avgHighF] for Jan..Dec.
 */
export const CLIMATE_REGIONS = {
  northeast: {
    name: 'Northeast',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
    normals: [[18, 36], [20, 39], [28, 48], [38, 60], [48, 70], [58, 79], [63, 84], [62, 82], [54, 75], [42, 63], [33, 52], [24, 41]]
  },
  midatlantic: {
    name: 'Mid-Atlantic',
    states: ['MD', 'DE', 'DC', 'VA', 'WV'],
    normals: [[25, 43], [27, 47], [34, 56], [43, 67], [53, 76], [63, 84], [68, 88], [66, 86], [59, 79], [47, 68], [37, 57], [29, 47]]
  },
  southeast: {
    name: 'Southeast',
    states: ['NC', 'SC', 'GA', 'TN', 'KY', 'AL', 'MS', 'AR'],
    normals: [[31, 51], [34, 55], [41, 63], [49, 72], [59, 80], [67, 87], [71, 90], [70, 89], [64, 83], [52, 73], [42, 63], [34, 54]]
  },
  florida: {
    name: 'Florida & Gulf Coast',
    states: ['FL', 'LA'],
    normals: [[50, 71], [53, 74], [58, 78], [63, 83], [70, 88], [75, 91], [76, 92], [76, 92], [74, 90], [66, 85], [58, 78], [52, 73]]
  },
  midwest: {
    name: 'Midwest',
    states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MO', 'IA'],
    normals: [[16, 33], [19, 37], [29, 49], [39, 62], [50, 73], [60, 82], [65, 85], [63, 83], [54, 76], [42, 63], [31, 48], [21, 36]]
  },
  plains: {
    name: 'Northern Plains',
    states: ['MN', 'ND', 'SD', 'NE', 'KS'],
    normals: [[6, 24], [11, 30], [23, 43], [35, 58], [47, 70], [58, 80], [63, 85], [60, 83], [49, 73], [36, 59], [23, 41], [11, 27]]
  },
  south: {
    name: 'South Central',
    states: ['TX', 'OK'],
    normals: [[36, 57], [40, 61], [48, 69], [56, 77], [65, 84], [73, 91], [76, 95], [76, 95], [69, 88], [58, 78], [47, 67], [38, 58]]
  },
  mountain: {
    name: 'Mountain West',
    states: ['CO', 'UT', 'WY', 'MT', 'ID'],
    normals: [[16, 40], [20, 44], [27, 53], [34, 62], [43, 72], [52, 83], [59, 91], [57, 88], [47, 79], [36, 65], [25, 50], [16, 39]]
  },
  desert: {
    name: 'Desert Southwest',
    states: ['AZ', 'NV', 'NM'],
    normals: [[43, 67], [47, 71], [52, 77], [59, 86], [68, 95], [77, 104], [83, 106], [82, 104], [76, 99], [64, 88], [51, 75], [43, 66]]
  },
  pacificnw: {
    name: 'Pacific Northwest',
    states: ['WA', 'OR'],
    normals: [[36, 47], [37, 51], [40, 56], [43, 61], [49, 68], [54, 73], [57, 79], [57, 79], [53, 73], [46, 61], [40, 51], [36, 46]]
  },
  california: {
    name: 'California',
    states: ['CA'],
    normals: [[45, 65], [47, 67], [49, 69], [52, 73], [56, 76], [59, 80], [63, 84], [64, 85], [62, 83], [57, 78], [50, 70], [45, 64]]
  },
  alaska: {
    name: 'Alaska',
    states: ['AK'],
    normals: [[9, 23], [12, 27], [18, 34], [30, 44], [40, 56], [48, 63], [52, 66], [50, 64], [42, 55], [29, 40], [17, 28], [11, 24]]
  },
  hawaii: {
    name: 'Hawaii',
    states: ['HI'],
    normals: [[66, 80], [66, 80], [67, 81], [68, 82], [70, 84], [72, 86], [73, 87], [74, 88], [73, 88], [72, 86], [70, 84], [67, 81]]
  }
};

export const STATE_TO_REGION = (() => {
  const m = {};
  for (const [id, r] of Object.entries(CLIMATE_REGIONS)) for (const s of r.states) m[s] = id;
  return m;
})();

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
];

const ORIGIN_REGION = 'southeast'; // Chatham County, North Carolina

function normalsFor(regionId, monthIndex) {
  const r = CLIMATE_REGIONS[regionId];
  if (!r) return null;
  return r.normals[monthIndex];
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function isShippable(date) {
  const day = date.getUTCDay();
  return CARRIER_RULES.shipDays.includes(day) && !BLACKOUT.has(iso(date));
}

/**
 * @param {{state:string, date:string|Date, holdForPickup?:boolean}} opts
 */
export function assess(opts) {
  const date = opts.date instanceof Date ? opts.date : new Date(`${opts.date}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');

  const regionId = STATE_TO_REGION[opts.state];
  const region = CLIMATE_REGIONS[regionId];
  const month = date.getUTCMonth();

  if (!region) {
    return {
      verdict: 'unsupported',
      headline: 'Destination not covered',
      detail: 'Select a US state, or use the international enquiry route for shipments outside the fifty states.',
      region: null, checks: [], accessories: [], nextDates: []
    };
  }

  const dest = normalsFor(regionId, month);
  const origin = normalsFor(ORIGIN_REGION, month);
  const [safeLo, safeHi] = CARRIER_RULES.safeRange;
  const [holdLo, holdHi] = CARRIER_RULES.holdRange;
  const lo = Math.min(dest[0], origin[0]);
  const hi = Math.max(dest[1], origin[1]);
  const range = opts.holdForPickup ? [holdLo, holdHi] : [safeLo, safeHi];

  const checks = [];
  const accessories = [];
  let verdict = 'clear';

  if (regionId === 'hawaii') {
    return {
      verdict: 'prohibited',
      headline: 'Hawaii prohibits snakes entirely',
      detail:
        'Hawaii bans the private possession of all snakes without exception, and penalties are severe. We cannot ship to Hawaii under any circumstances.',
      region, checks: [], accessories: [], nextDates: []
    };
  }

  if (lo < range[0]) {
    verdict = lo < range[0] - 12 ? 'no-ship' : 'conditional';
    checks.push({
      status: verdict === 'no-ship' ? 'fail' : 'warn',
      label: 'Cold exposure',
      detail: `Regional low averages ${lo}°F against a ${range[0]}°F floor${opts.holdForPickup ? ' for hold-at-facility' : ''}.`
    });
    if (verdict === 'conditional') accessories.push({ item: '72-hour heat pack', reason: `Transit low near ${lo}°F.` });
  } else {
    checks.push({ status: 'pass', label: 'Cold exposure', detail: `Regional low averages ${lo}°F, inside the ${range[0]}°F floor.` });
  }

  if (hi > range[1]) {
    verdict = hi > range[1] + 10 ? 'no-ship' : verdict === 'no-ship' ? 'no-ship' : 'conditional';
    checks.push({
      status: hi > range[1] + 10 ? 'fail' : 'warn',
      label: 'Heat exposure',
      detail: `Regional high averages ${hi}°F against a ${range[1]}°F ceiling.`
    });
    if (hi <= range[1] + 10) accessories.push({ item: 'Phase-change cold pack', reason: `Transit high near ${hi}°F.` });
  } else {
    checks.push({ status: 'pass', label: 'Heat exposure', detail: `Regional high averages ${hi}°F, inside the ${range[1]}°F ceiling.` });
  }

  const dayOk = isShippable(date);
  checks.push({
    status: dayOk ? 'pass' : 'fail',
    label: 'Despatch day',
    detail: dayOk
      ? `${date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })} is a valid despatch day.`
      : BLACKOUT.has(iso(date))
        ? 'Carrier blackout — federal holiday period.'
        : `We despatch ${CARRIER_RULES.shipDayLabel} only, so nothing can be stranded over a weekend.`
  });
  if (!dayOk && verdict === 'clear') verdict = 'conditional';

  if (opts.holdForPickup) {
    accessories.push({ item: 'Hold at FedEx facility', reason: 'Widens the acceptable temperature band and removes the doorstep risk entirely.' });
  }

  const headlines = {
    clear: 'Clear to ship',
    conditional: 'Shippable with conditions',
    'no-ship': 'Outside the safe window',
    prohibited: 'Cannot ship'
  };

  return {
    verdict,
    headline: headlines[verdict],
    detail: detailFor(verdict, region, opts.holdForPickup),
    region,
    month,
    destNormals: dest,
    originNormals: origin,
    checks,
    accessories,
    nextDates: nextViableDates(date, opts.state, opts.holdForPickup)
  };
}

function detailFor(verdict, region, hold) {
  switch (verdict) {
    case 'clear':
      return `Seasonal normals for the ${region.name} sit comfortably inside the carrier's live-animal band. Standard protocol applies.`;
    case 'conditional':
      return `Movement to the ${region.name} is workable at this time of year with the mitigations listed below. We will confirm against the actual forecast on the morning of despatch.`;
    case 'no-ship':
      return hold
        ? `Seasonal normals for the ${region.name} fall outside the band even with facility hold. We will hold the animal at no cost until the window opens.`
        : `Seasonal normals for the ${region.name} fall outside the safe band. Facility hold may bring this back into range — try the option above.`;
    default:
      return '';
  }
}

/** Next four valid despatch dates that clear or conditionally clear. */
export function nextViableDates(from, state, hold, limit = 4) {
  const out = [];
  const cursor = new Date(from.getTime());
  for (let i = 0; i < 400 && out.length < limit; i++) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (!isShippable(cursor)) continue;
    const regionId = STATE_TO_REGION[state];
    if (!regionId) break;
    const dest = normalsFor(regionId, cursor.getUTCMonth());
    const origin = normalsFor(ORIGIN_REGION, cursor.getUTCMonth());
    const range = hold ? CARRIER_RULES.holdRange : CARRIER_RULES.safeRange;
    const lo = Math.min(dest[0], origin[0]);
    const hi = Math.max(dest[1], origin[1]);
    const ok = lo >= range[0] && hi <= range[1];
    const near = lo >= range[0] - 12 && hi <= range[1] + 10;
    if (ok || near) {
      out.push({ date: iso(cursor), verdict: ok ? 'clear' : 'conditional' });
    }
  }
  return out;
}

export const LAG_TERMS = [
  {
    title: 'Someone must receive the package',
    body:
      'The Live Arrival Guarantee is void if the animal is left unattended. Either be present for the delivery window or elect hold-at-facility and collect within six hours of arrival.'
  },
  {
    title: 'Unopened photographic evidence',
    body:
      'In the event of a problem, photograph the sealed box and the animal in situ before removing it. A claim without this cannot be processed by the carrier and we will not be able to recover the loss on your behalf.'
  },
  {
    title: 'Notify within two hours',
    body: 'Report any issue to the office within two hours of the recorded delivery scan. Later notification voids the guarantee.'
  },
  {
    title: 'Weather holds are free',
    body:
      'If conditions move outside the band between order and despatch, we hold the animal in our facility at no charge and rebook at the first clear window. We never ship into a marginal forecast to meet a date.'
  }
];
