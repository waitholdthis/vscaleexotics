/**
 * One-time page scaffolder.
 *
 * The tool pages and policy pages share an identical document head; writing it
 * out twenty times by hand guarantees they drift. This generates the shells
 * from a single spec. Generated files are then edited normally — this is
 * scaffolding, not a build step, and nothing at runtime depends on it.
 *
 * Re-running will overwrite. `node tools/scaffold.mjs --dry` to preview.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const ORIGIN = 'https://vscaleexotics.com';

const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; " +
  "connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-src 'none'; " +
  "manifest-src 'self'; upgrade-insecure-requests";

/** Escape a value destined for a double-quoted HTML attribute. */
const escAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escape a value destined for element text content (quotes are safe here). */
const escText = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Strip entities back to plain text for JSON-LD values. */
const plain = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function page(spec) {
  const url = `${ORIGIN}${spec.path}`;
  const crumbs = [{ name: plain(spec.h1), item: url }];
  crumbs.unshift(...(spec.crumbs || []));
  crumbs.unshift({ name: 'Home', item: `${ORIGIN}/` });

  const ld = {
    '@context': 'https://schema.org',
    '@type': spec.schemaType || 'WebPage',
    name: plain(spec.h1),
    description: plain(spec.description),
    url,
    isPartOf: { '@type': 'WebSite', url: `${ORIGIN}/` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item }))
    },
    ...(spec.extraSchema || {})
  };

  const crumbHtml = crumbs
    .slice(0, -1)
    .map((c) => `          <li><a href="${c.item.replace(ORIGIN, '') || '/'}">${c.name}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escText(spec.title)}</title>
<meta name="description" content="${escAttr(spec.description)}">
<link rel="canonical" href="${url}">

<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#07080a">

<meta property="og:type" content="website">
<meta property="og:site_name" content="VScale Exotics">
<meta property="og:title" content="${escAttr(plain(spec.h1))} — VScale Exotics">
<meta property="og:description" content="${escAttr(spec.ogDescription || spec.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/img/og-default.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/core.css">
<link rel="stylesheet" href="/assets/css/components.css">
<link rel="stylesheet" href="/assets/css/pages.css">

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>

<body data-page="${spec.page}">
<a class="skip-link" href="#main">Skip to content</a>
<div id="site-header-host"></div>

<main id="main">

  <header class="page-head">
    <div class="shell page-head__inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
${crumbHtml}
          <li><span aria-current="page">${spec.h1}</span></li>
        </ol>
      </nav>
      ${spec.eyebrow ? `<p class="eyebrow" style="margin-top:1.25rem">${spec.eyebrow}</p>` : ''}
      <h1>${spec.h1}</h1>
      <p class="lede">${spec.lede}</p>
    </div>
  </header>

${spec.body}

</main>

<div id="site-footer-host"></div>
<script type="module" src="${spec.script}"></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 * Tool page body — a two-column control/output layout.
 * ------------------------------------------------------------------ */

const toolBody = (extra = '') => `  <section class="section">
    <div class="shell">
      <div class="tool-layout">
        <aside class="tool-controls" data-tool-controls aria-label="Controls"></aside>
        <div class="tool-output" data-tool-output></div>
      </div>
${extra}
    </div>
  </section>`;

const simpleBody = (inner) => `  <section class="section">
    <div class="shell">
${inner}
    </div>
  </section>`;

/* ------------------------------------------------------------------ */

const PAGES = [
  /* ---------------- Tools index ---------------- */
  {
    path: '/tools.html', page: 'tools', script: '/assets/js/pages/tools.js',
    title: 'Breeder Tools — Genetics, Husbandry, Shipping | VScale Exotics',
    description: 'Nine free tools for serious keepers and breeders: a locus-aware genetics calculator, morph codex, valuation index, incubation planner, husbandry architect, feeding calculator, shipping window checker, legality lookup and quarantine protocol.',
    h1: 'The Instruments', eyebrow: 'Free, no account, nothing stored',
    lede: 'Built for our own breeding operation over seventeen years, then opened up. Every calculation runs entirely in your browser — nothing you enter is transmitted anywhere, and there is nothing to sign up for.',
    body: simpleBody(`      <div class="grid grid--3" data-tools-grid data-reveal-group></div>
      <div style="margin-top:5rem" data-tools-detail></div>`)
  },

  /* ---------------- Gene Lab ---------------- */
  {
    path: '/tools/gene-lab.html', page: 'gene-lab', script: '/assets/js/pages/gene-lab.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Gene Lab — Locus-Aware Morph Calculator | VScale Exotics',
    description: 'A multi-locus punnett calculator that models allelic complexes correctly. Mojave by Lesser gives a Blue-Eyed Leucistic, not a Mojave Lesser. Handles non-viable genotypes, separates genotype from visual outcome, and shows where 66% possible het actually comes from.',
    h1: 'Gene Lab', eyebrow: 'Multi-locus punnett engine',
    lede: 'Most public morph calculators treat every gene as independent. Several of the most valuable ball python traits are not — they are alleles competing for one locus, and getting that wrong produces animals that cannot exist. This one models loci.',
    body: toolBody()
  },
  {
    path: '/tools/codex.html', page: 'codex', script: '/assets/js/pages/codex.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Morph Codex — Snake Gene Encyclopedia | VScale Exotics',
    description: 'Every gene we work with, indexed by species and inheritance mode: what it does visually, who produced it and when, how rare it is, which locus it belongs to, and which other genes it is allelic with.',
    h1: 'Morph Codex', eyebrow: 'Gene reference',
    lede: 'Every gene we work with, with the inheritance mode, the originating breeder, the year it was proven, and — critically — which locus each one occupies.',
    body: simpleBody(`      <div class="tool-layout">
        <aside class="tool-controls" data-codex-controls aria-label="Filter genes"></aside>
        <div class="tool-output"><div data-codex-results></div></div>
      </div>`)
  },
  {
    path: '/tools/valuation.html', page: 'valuation', script: '/assets/js/pages/valuation.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Valuation Index — Snake Morph Price Estimator | VScale Exotics',
    description: 'Estimate the market value of any snake morph combination. Models diminishing returns on gene stacking, sex premium, maturity and expression quality, and reports a confidence band and liquidity assessment rather than a single misleading figure.',
    h1: 'Valuation Index', eyebrow: 'Market estimate, with its working shown',
    lede: 'Multiply every gene multiplier together and you will overvalue a five-gene animal by an order of magnitude. The market does not pay linearly for stacking. This model applies a decaying weight to each successive gene, which tracks observed pricing far more closely.',
    body: toolBody()
  },
  {
    path: '/tools/clutch.html', page: 'clutch', script: '/assets/js/pages/clutch.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Clutch Planner — Incubation & Gestation Timeline | VScale Exotics',
    description: 'Temperature-dependent incubation timelines for oviparous species and gestation windows for live-bearers, with candling dates, the pip window, cutting guidance, first shed and first feed.',
    h1: 'Clutch Planner', eyebrow: 'Incubation & gestation',
    lede: 'Incubation duration is a function of temperature, and a single degree of drift over the back half will move your hatch date by three days. Enter the lay date and your incubator setpoint and this maps the whole cycle.',
    body: toolBody()
  },
  {
    path: '/tools/husbandry.html', page: 'husbandry', script: '/assets/js/pages/husbandry.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Husbandry Architect — Enclosure Specification | VScale Exotics',
    description: 'Generate a complete enclosure specification and build checklist for any species at any life stage: dimensions, thermal gradient, humidity targets, substrate, furniture and the equipment list, sized to the individual animal rather than a generic care sheet.',
    h1: 'Husbandry Architect', eyebrow: 'Enclosure specification',
    lede: 'A care sheet tells you what an adult needs. This computes what your animal needs at its current mass, which is a different and more useful question — under-furnished space is the most common cause of feeding refusal we see.',
    body: toolBody()
  },
  {
    path: '/tools/feeding.html', page: 'feeding', script: '/assets/js/pages/feeding.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Feeding & Growth Planner — Prey Sizing Calculator | VScale Exotics',
    description: 'Calculate correct prey size and feeding interval from your animal\'s actual mass and species, with an annual consumption forecast and a projected growth curve. Heavy-bodied species take proportionally smaller meals than a flat percentage suggests.',
    h1: 'Feeding &amp; Growth', eyebrow: 'Prey sizing & schedule',
    lede: 'Prey width should never exceed the widest point of the animal. Weight is only a guide to which item to reach for — and the right percentage of body mass is not the same for a hognose as it is for an emerald tree boa.',
    body: toolBody()
  },
  {
    path: '/tools/shipping.html', page: 'shipping', script: '/assets/js/pages/shipping.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Ship Window — Safe Reptile Shipping Dates | VScale Exotics',
    description: 'Check whether a given date and destination fall inside the safe temperature band for shipping live reptiles, with carrier rules, required heat or cold packs, live arrival guarantee conditions and the next viable despatch dates.',
    h1: 'Ship Window', eyebrow: 'Safe despatch assessment',
    lede: 'Live reptiles move on FedEx Priority Overnight, Monday to Wednesday, inside a defined temperature band. This checks a destination and date against regional climatological normals so you can plan months out — the final call is always made against the actual forecast on the morning of despatch.',
    body: toolBody()
  },
  {
    path: '/tools/legality.html', page: 'legality', script: '/assets/js/pages/legality.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Legality Check — Snake Ownership Laws by State | VScale Exotics',
    description: 'Look up federal, state and international restrictions on keeping the species we place: Lacey Act injurious listings, CITES, state permit regimes and country-level import rules. A research aid, not legal advice.',
    h1: 'Legality Check', eyebrow: 'Federal, state & international',
    lede: 'Reptile law operates at three levels simultaneously, and the municipal layer is the one that catches people out. This covers the first two properly and flags the third. Confirm locally before you order — we will ask you to attest that you have.',
    body: toolBody()
  },
  {
    path: '/tools/quarantine.html', page: 'quarantine', script: '/assets/js/pages/quarantine.js',
    crumbs: [{ name: 'Tools', item: `${ORIGIN}/tools.html` }],
    title: 'Quarantine Protocol — 90-Day Intake Checklist | VScale Exotics',
    description: 'The ninety-day quarantine protocol we use for every intake, as an interactive checklist with dates computed from your arrival day. Progress is saved in your browser.',
    h1: 'Quarantine Protocol', eyebrow: '90-day intake',
    lede: 'Snake mites complete a life cycle in under three weeks, but eggs sitting in a substrate crack outlast most keepers\' patience. Ninety days is not caution, it is arithmetic. Enter your arrival date and this dates every step.',
    body: toolBody()
  },

  /* ---------------- House pages ---------------- */
  {
    path: '/provenance.html', page: 'provenance', script: '/assets/js/pages/provenance.js',
    title: 'Provenance — How We Breed and What We Refuse | VScale Exotics',
    description: 'Seventeen years of unbroken breeding records from Chatham County, North Carolina. How the facility runs, how lineage is documented, why we hold thirty-nine animals rather than three thousand, and the genetics we will not work with at any price.',
    h1: 'Provenance', eyebrow: 'Est. 2009',
    lede: 'A collection is only as good as its records. Ours go back to 2009 without a gap, and everything on this page is something we will show you rather than assert.',
    body: `  <section class="section">
    <div class="shell">
      <div class="split">
        <div class="prose" data-reveal>
          <p class="eyebrow">The premise</p>
          <h2 style="margin:.75rem 0 1.5rem;font-size:var(--t-xl)">Thirty-nine animals, not three thousand</h2>
          <p>
            The economics of this trade push in one direction: hold more animals, produce more clutches,
            move volume. We went the other way in 2013 and have never regretted it. A collection you can
            hold in your head is a collection whose every animal you actually know &mdash; its feeding
            history, its temperament, the way its colour has shifted across four seasons.
          </p>
          <p>
            It also means we can tell you the truth about an animal, because we are not trying to move
            forty of them this month. When we say a Desert Ghost is showing early and will finish well,
            that is a judgement formed over eleven months of looking at it.
          </p>
          <p>
            <strong>We turn down more sales than we make.</strong> Usually because the enclosure described
            is not adequate, occasionally because the species is wrong for the keeper, and sometimes
            because the buyer wants an animal as an asset rather than as a life.
          </p>
        </div>
        <div class="feature__media" data-reveal="scale" style="aspect-ratio:4/5">
          <canvas data-feature-canvas="vs-bp-0158" aria-hidden="true"></canvas>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="section-head" data-reveal>
        <div class="section-head__text">
          <p class="eyebrow">The facility</p>
          <h2>How the room actually runs</h2>
          <p>Nothing here is unusual. It is simply done consistently, which turns out to be the hard part.</p>
        </div>
      </div>
      <div class="steps steps--3" data-reveal-group>
        <div class="step">
          <h3>Every enclosure on two thermostats</h3>
          <p>
            A proportional thermostat driving the heat source, and an independent over-temperature
            cut-off behind it set four degrees higher. A single thermostat failure at ninety degrees
            destroys a room in under four hours. We have had two failures in seventeen years. Both were
            caught by the second device.
          </p>
        </div>
        <div class="step">
          <h3>Weights logged, not remembered</h3>
          <p>
            Every animal is weighed on a fixed schedule and the figure is written down. A weight series
            is the earliest diagnostic you have for almost everything that goes wrong, and it is
            worthless if it lives in your memory. Those series transfer with the animal.
          </p>
        </div>
        <div class="step">
          <h3>Ninety-day quarantine, without exception</h3>
          <p>
            Every intake, including animals from breeders we have known for a decade. A positive mite
            finding restarts the clock at day zero. We publish the full protocol as a tool because there
            is no reason to keep it to ourselves.
          </p>
        </div>
        <div class="step">
          <h3>Nothing is power-fed</h3>
          <p>
            Growth curves are deliberately unremarkable. Pushing an animal to breeding weight in half the
            natural time measurably shortens its life, and it produces females that fail at their first
            clutch. We would rather sell you a slower animal in two years.
          </p>
        </div>
        <div class="step">
          <h3>Photographs at every shed</h3>
          <p>
            Colour in this hobby is a moving target &mdash; a blood python is a different animal in March
            and September. The photographic series is how you judge what a gene is actually doing rather
            than what one lucky frame suggests.
          </p>
        </div>
        <div class="step">
          <h3>Lineage recorded to the founder</h3>
          <p>
            Not a certificate generated the morning of despatch. A continuous record, with both parents
            photographed, clutch data attached, and every generation back to the animal we originally
            acquired. Available for inspection before you commit to anything.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="panel panel--brass" data-reveal>
        <p class="eyebrow">Position</p>
        <h2 style="margin:.75rem 0 1.5rem;font-size:var(--t-xl)">What we will not work with</h2>
        <div class="split">
          <div class="prose">
            <p>
              <strong>The Spider / Champagne / Hidden Gene Woma locus.</strong> Every animal carrying any
              of these three alleles has a neurological syndrome, ranging from a mild head tilt to
              corkscrewing severe enough that the animal cannot strike accurately at prey. No homozygous
              form has ever been produced alive, in nearly three decades. This is not disputed by anyone
              breeding them; what is disputed is whether it matters.
            </p>
            <p>
              We think it matters, and we do not breed, buy, broker or place them. The Gene Lab will still
              calculate pairings involving them, because withholding the arithmetic helps nobody.
            </p>
          </div>
          <div class="prose">
            <p>
              <strong>Jaguar carpet pythons.</strong> Same problem, same reasoning. The homozygous form is
              not viable and the heterozygous form carries a variable wobble.
            </p>
            <p>
              <strong>Super forms of the Cinnamon and Black Pastel locus.</strong> Elevated rates of
              vertebral kinking and duckbill. We work with both genes in single copy and screen every
              hatchling.
            </p>
            <p>
              <strong>Anything on the Lacey Act injurious list that we cannot place responsibly.</strong>
              No Burmese pythons, no African rock pythons, no anacondas &mdash; regardless of what
              somebody is willing to pay for one.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell shell--narrow" style="text-align:center">
      <div data-reveal>
        <p class="eyebrow">Visiting</p>
        <h2 style="margin-top:1rem">The room is open, by appointment</h2>
        <p class="lede" style="margin:1.5rem auto 0">
          Anyone spending five figures on an animal should see where it was produced. We schedule visits
          on weekday afternoons, we will show you the records for any animal in the building, and there is
          no expectation that you buy anything.
        </p>
        <div class="cluster" style="justify-content:center;margin-top:2.5rem">
          <a class="btn btn--primary btn--lg" href="/concierge.html">Request a visit</a>
          <a class="btn btn--lg" href="/collection.html">See what is here</a>
        </div>
      </div>
    </div>
  </section>`
  },
  {
    path: '/acquire.html', page: 'acquire', script: '/assets/js/pages/acquire.js',
    title: 'How to Acquire — Buying Process, Payment, Shipping | VScale Exotics',
    description: 'How buying from VScale Exotics works, start to finish: enquiry, conversation, reservation and deposit, payment plans, pre-flight checks, despatch and aftercare. Including what we ask of you and why we decline sales.',
    h1: 'How Acquisition Works', eyebrow: 'Start to finish',
    lede: 'There is no cart button on this site. Every animal is placed after a conversation, which sounds like friction and is actually the reason our live arrival record is what it is.',
    body: `  <section class="section">
    <div class="shell">
      <div class="steps" data-reveal-group style="max-width:60rem">
        <div class="step">
          <h3>You tell us what you want</h3>
          <p>
            Either about a specific animal in the collection, or in the abstract &mdash; species,
            genetics, sex, timeframe, budget. Most of what we place never reaches the public listings, so
            the abstract route is often the more productive one. Use the Private Concierge form or write
            to us directly.
          </p>
        </div>
        <div class="step">
          <h3>We talk</h3>
          <p>
            A call or a long email. We will ask what you keep now, what your enclosure looks like, and
            what your experience is. This is where we establish whether the animal is right for you, and
            it is where we will say so if it is not. We will also confirm the species is legal at your
            address &mdash; use the Legality Check before we get there and it saves a step.
          </p>
        </div>
        <div class="step">
          <h3>Photographs and video</h3>
          <p>
            Before any money moves. Current photographs from several angles, video of the animal moving
            and feeding, the full weight series, the feeding log and the lineage documentation. If you
            want a specific shot, ask for it.
          </p>
        </div>
        <div class="step">
          <h3>Reservation</h3>
          <p>
            A twenty-five percent deposit holds the animal for sixty days. Refundable in full within the
            first week, non-refundable after that because the animal comes off the market. On animals
            above five thousand dollars we offer an interest-free plan across three to six months, with
            the animal staying here and fully cared for until the balance clears.
          </p>
        </div>
        <div class="step">
          <h3>Pre-flight</h3>
          <p>
            We confirm the shipping window against the actual forecast, not the seasonal average. We
            confirm you or someone else will be present, or that hold-at-facility is arranged. We send the
            husbandry specification for the animal at its current weight so the enclosure is running and
            stable before it arrives &mdash; not on the day.
          </p>
        </div>
        <div class="step">
          <h3>Despatch</h3>
          <p>
            FedEx Priority Overnight, Monday to Wednesday, insulated box with the appropriate heat or cold
            pack. Tracking goes to you the moment the label is generated. If the forecast turns marginal
            between booking and despatch, we hold the animal here at no cost and rebook. We will not ship
            into a bad window to meet a date.
          </p>
        </div>
        <div class="step">
          <h3>Arrival</h3>
          <p>
            Photograph the sealed box and the animal in situ before you remove it. Two photographs. Then
            unbox in the quarantine enclosure, weigh, and leave the animal completely alone for five days.
            Tell us it arrived. Tell us straight away if anything is wrong.
          </p>
        </div>
        <div class="step">
          <h3>Afterwards</h3>
          <p>
            We are available for the life of the animal, not for thirty days. If it stops feeding in year
            three, write to us &mdash; we have the complete history and we would rather help than find out
            later that it went badly. There is no charge for this and there never will be.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="split">
        <div>
          <p class="eyebrow">Payment</p>
          <h2 style="margin:.75rem 0 1.5rem;font-size:var(--t-lg)">What we accept</h2>
          <div class="specs" data-acquire-payment></div>
        </div>
        <div>
          <p class="eyebrow">Honest answers</p>
          <h2 style="margin:.75rem 0 1.5rem;font-size:var(--t-lg)">Questions we get asked</h2>
          <div class="accordion" data-acquire-faq></div>
        </div>
      </div>
    </div>
  </section>`
  },
  {
    path: '/concierge.html', page: 'concierge', script: '/assets/js/pages/concierge.js',
    title: 'Private Concierge — Tell Us What You Are Looking For | VScale Exotics',
    description: 'Most of what we place never reaches the public listings. Describe the animal you want — species, genetics, sex, timeframe — and we will tell you honestly whether we can find it, what it will cost and how long it will take.',
    h1: 'Private Concierge', eyebrow: 'Sourcing & enquiries',
    lede: 'Most of what we place is never listed. Tell us what you are actually looking for and we will tell you honestly whether we can find it, what it will cost, and how long it will take — including when the answer is that we cannot.',
    body: `  <section class="section">
    <div class="shell">
      <div class="split split--sidebar">
        <div data-concierge-form></div>
        <aside class="stack stack--lg" data-concierge-aside></aside>
      </div>
    </div>
  </section>`
  },
  {
    path: '/journal.html', page: 'journal', script: '/assets/js/pages/journal.js',
    title: 'Journal — Notes from the Collection Room | VScale Exotics',
    description: 'Writing on snake genetics, husbandry and the ethics of the trade: why locus matters more than gene, why dwarf percentage is a claim rather than a measurement, the wobble question answered plainly, and why ninety days of quarantine is arithmetic rather than caution.',
    h1: 'Journal', eyebrow: 'Notes from the collection room',
    lede: 'Longer pieces on genetics, husbandry and the parts of this trade that do not get written about honestly very often.',
    body: `  <section class="section">
    <div class="shell">
      <div class="article-list" data-journal-full></div>
    </div>
  </section>`
  },
  {
    path: '/vault.html', page: 'vault', script: '/assets/js/pages/vault.js',
    title: 'Your Vault — Saved Animals | VScale Exotics',
    description: 'Animals you have saved, held in your browser and nowhere else. Review them side by side, check their combined value, and send the list to us as a single enquiry.',
    h1: 'Your Vault', eyebrow: 'Saved to this device',
    lede: 'Everything you have saved, stored in your browser and nowhere else. We cannot see this list until you choose to send it to us.',
    body: `  <section class="section">
    <div class="shell">
      <div data-vault-root></div>
    </div>
  </section>`
  },
  {
    path: '/compare.html', page: 'compare', script: '/assets/js/pages/compare.js',
    title: 'Compare Animals | VScale Exotics',
    description: 'Compare up to four animals side by side: genetics, weight, age, price, rarity index, husbandry requirements and species difficulty.',
    h1: 'Comparison', eyebrow: 'Side by side',
    lede: 'Up to four animals, every field aligned. Useful mostly for deciding between two you already like.',
    body: `  <section class="section">
    <div class="shell">
      <div data-compare-root></div>
    </div>
  </section>`
  },

  /* ---------------- Policies ---------------- */
  {
    path: '/legal/health-guarantee.html', page: 'health-guarantee', script: '/assets/js/pages/doc.js',
    crumbs: [], title: 'Health Guarantee | VScale Exotics',
    description: 'Our health guarantee: what is covered, for how long, what voids it, and what we do when something goes wrong. Written plainly, without the escape clauses that make most reptile guarantees worthless.',
    h1: 'Health Guarantee', eyebrow: 'Policy',
    lede: 'Most reptile health guarantees are written to be unenforceable. This one is written to be used.',
    body: simpleBody('      <div class="doc" data-doc="health-guarantee"></div>')
  },
  {
    path: '/legal/shipping-policy.html', page: 'shipping-policy', script: '/assets/js/pages/doc.js',
    crumbs: [], title: 'Shipping & Live Arrival Guarantee | VScale Exotics',
    description: 'How we ship live animals: carrier and service, permitted despatch days, temperature limits, heat and cold packs, weather holds, international export, and the exact conditions of the live arrival guarantee.',
    h1: 'Shipping &amp; Live Arrival', eyebrow: 'Policy',
    lede: 'A live arrival guarantee is a refund, not a resurrection. Everything here exists to make sure it is never invoked.',
    body: simpleBody('      <div class="doc" data-doc="shipping-policy"></div>')
  },
  {
    path: '/legal/terms.html', page: 'terms', script: '/assets/js/pages/doc.js',
    crumbs: [], title: 'Terms of Sale | VScale Exotics',
    description: 'Terms of sale for VScale Exotics: reservation and deposit terms, payment, title transfer, cancellation, buyer eligibility, export responsibilities and dispute resolution.',
    h1: 'Terms of Sale', eyebrow: 'Policy',
    lede: 'The commercial terms on which we place an animal.',
    body: simpleBody('      <div class="doc" data-doc="terms"></div>')
  },
  {
    path: '/legal/privacy.html', page: 'privacy', script: '/assets/js/pages/doc.js',
    crumbs: [], title: 'Privacy | VScale Exotics',
    description: 'What this site stores, what it does not, and why there are no third-party scripts, no analytics, no cookies and no trackers anywhere on it.',
    h1: 'Privacy', eyebrow: 'Policy',
    lede: 'This site sets no cookies, loads no third-party code, and runs no analytics. That is not a marketing position — it is the whole policy, and the rest of this page explains the consequences.',
    body: simpleBody('      <div class="doc" data-doc="privacy"></div>')
  }
];

let written = 0;
for (const spec of PAGES) {
  const target = join(ROOT, spec.path);
  mkdirSync(dirname(target), { recursive: true });
  const html = page(spec);
  if (DRY) {
    console.log(`${existsSync(target) ? 'overwrite' : 'create   '}  ${spec.path}  (${html.length} bytes)`);
  } else {
    writeFileSync(target, html, 'utf8');
    written++;
  }
}
console.log(DRY ? `${PAGES.length} page(s) would be written` : `wrote ${written} page(s)`);
