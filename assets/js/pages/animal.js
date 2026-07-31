/**
 * Animal detail record.
 *
 * The `id` comes from the query string, so it is looked up against the known
 * inventory and anything unrecognised renders a not-found view. No part of the
 * URL is ever placed into the document.
 */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon, svg as svgEl } from '../core/dom.js';
import { INVENTORY, INVENTORY_BY_ID, TIER_LABEL } from '../data/inventory.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { makeAnimalCanvas, mountScaleCanvases } from '../ui/scales.js';
import { geneChips, statusBadge, rarityMeter, animalCard, animalMedia } from '../ui/animal-card.js';
import { money, weight, weightBoth, date, ageFrom, sexSymbol, lengthRange, tempRange, dimensions } from '../core/format.js';
import { enclosureSpec, feedingPlan, growthProjection } from '../engine/husbandry.js';
import { vault, compare, recent } from '../core/store.js';
import { SITE } from '../core/sitemap.js';

initShell();

const root = $('[data-animal-root]');
const params = new URLSearchParams(location.search);
const id = (params.get('id') || '').trim();
const animal = Object.prototype.hasOwnProperty.call(INVENTORY_BY_ID, id) ? INVENTORY_BY_ID[id] : null;

if (!animal) {
  render(
    root,
    h(
      'div',
      { class: 'shell', style: { 'padding-top': 'calc(var(--header-h) + 5rem)', 'padding-bottom': '6rem' } },
      h(
        'div',
        { class: 'empty' },
        h('p', { class: 'empty__title', text: 'That record does not exist' }),
        h('p', { text: 'The animal may have been placed and archived, or the link may be incomplete.' }),
        h('a', { class: 'btn btn--primary', href: '/collection.html', text: 'Browse the collection' })
      )
    )
  );
} else {
  recent.push(animal.id);
  buildPage(animal);
}

/* ================================================================== */

function buildPage(a) {
  const sp = SPECIES_BY_ID[a.species];
  const enclosure = enclosureSpec(a.species, a.weight);
  const feeding = feedingPlan(a.species, a.weight);

  document.title = `${a.title} — ${sp.common} ${a.sku} | VScale Exotics`;
  setMeta('description', `${a.title}. ${sp.common} (${sp.scientific}), ${a.sex}, ${weight(a.weight)}, hatched ${date(a.hatched)}. ${a.story.slice(0, 110)}…`);
  injectProductSchema(a, sp);

  render(
    root,
    pageHead(a, sp),
    h(
      'section',
      { class: 'section section--flush-top', style: { 'padding-top': '3rem' } },
      h(
        'div',
        { class: 'shell' },
        h('div', { class: 'animal-hero' }, portrait(a, sp), purchasePanel(a, sp)),
        h('div', { style: { 'margin-top': '4rem' } }, detailBody(a, sp, enclosure, feeding))
      )
    ),
    relatedSection(a)
  );

  mountScaleCanvases(root);
}

/* ---------- head ---------- */

function pageHead(a, sp) {
  return h(
    'header',
    { class: 'page-head' },
    h(
      'div',
      { class: 'shell page-head__inner' },
      h(
        'nav',
        { class: 'breadcrumb', 'aria-label': 'Breadcrumb' },
        h(
          'ol',
          {},
          h('li', {}, h('a', { href: '/', text: 'Home' })),
          h('li', {}, h('a', { href: '/collection.html', text: 'Collection' })),
          h('li', {}, h('a', { href: `/collection.html?species=${encodeURIComponent(a.species)}`, text: sp.common })),
          h('li', {}, h('span', { 'aria-current': 'page', text: a.sku }))
        )
      ),
      h(
        'div',
        { class: 'cluster', style: { 'margin-top': '1.5rem' } },
        statusBadge(a.status),
        a.tier === 'flagship' ? h('span', { class: 'badge badge--flagship', text: TIER_LABEL.flagship }) : null,
        h('span', { class: 'badge', text: sp.common })
      ),
      h('h1', { text: a.title }),
      h('p', { class: 'lede', style: { 'font-style': 'italic' }, text: sp.scientific })
    )
  );
}

/* ---------- portrait ---------- */

function portrait(a, sp) {
  const hasPhoto = Array.isArray(a.images) && a.images.length > 0;
  const media = animalMedia(a, sp, { width: 1000, height: 750, detail: 'card', priority: true });

  const gallery = hasPhoto && a.images.length > 1
    ? h(
        'div',
        { class: 'grid grid--4', style: { 'margin-top': '.75rem' } },
        ...a.images.slice(1, 5).map((src, i) =>
          h('img', {
            src,
            alt: `${a.title}, photograph ${i + 2}`,
            loading: 'lazy',
            decoding: 'async',
            style: { 'aspect-ratio': '4 / 3', 'object-fit': 'cover', 'border-radius': 'var(--radius)' }
          })
        )
      )
    : null;

  return h(
    'div',
    {},
    h(
      'figure',
      { class: 'animal-portrait' },
      media,
      // The disclaimer belongs on generated art only. Leaving it under a real
      // photograph would be actively misleading.
      hasPhoto
        ? null
        : h('figcaption', {
            class: 'animal-portrait__note',
            text:
              'Generated pattern study, derived from this animal\'s recorded genetics — not a photograph. ' +
              'Full photography and video are supplied on request before any deposit is taken.'
          })
    ),
    gallery,
    h(
      'div',
      { class: 'cluster', style: { 'margin-top': '1rem' } },
      h('a', { class: 'btn btn--sm', href: '/concierge.html', text: hasPhoto ? 'Request video' : 'Request photographs' }),
      h('a', { class: 'btn btn--sm', href: `/tools/gene-lab.html?sire=${encodeURIComponent(a.id)}`, text: 'Load into Gene Lab' })
    )
  );
}

/* ---------- purchase panel ---------- */

function purchasePanel(a, sp) {
  const priceEl = a.price
    ? h('p', { class: 'animal-price num', text: money(a.price) })
    : h('p', { class: 'animal-price animal-price--poa', text: 'Price on application' });

  const canBuy = a.status === 'available';
  const saved = vault.has(a.id);
  const comparing = compare.has(a.id);

  return h(
    'div',
    { class: 'panel sticky-aside' },
    h('p', { class: 'eyebrow eyebrow--muted', text: a.sku }),
    h('div', { style: { 'margin-top': '.75rem' } }, priceEl),
    a.price
      ? h('p', { class: 'stat__note', style: { 'margin-top': '.4rem' }, text: 'Excludes overnight shipping, quoted at checkout by destination.' })
      : h('p', { class: 'stat__note', style: { 'margin-top': '.4rem' }, text: 'Figure discussed once we have spoken. This is not a negotiating tactic — animals at this level are placed, not listed.' }),

    h(
      'div',
      { class: 'specs', style: { 'margin-top': '1.75rem' } },
      spec('Sex', `${sexSymbol(a.sex)} ${a.sex}`),
      spec('Hatched', `${date(a.hatched)} · ${ageFrom(a.hatched)} old`),
      spec('Weight', weightBoth(a.weight)),
      spec('Tier', TIER_LABEL[a.tier] || '—'),
      spec('Generation', a.lineage?.generation || '—'),
      a.lineage?.dwarfPercent ? spec('Dwarf', `${a.lineage.dwarfPercent}% super dwarf`) : null,
      spec('CITES', sp.cites)
    ),

    h('div', { style: { 'margin-top': '1.5rem' } }, rarityMeter(a.traits)),

    h(
      'div',
      { class: 'stack stack--sm', style: { 'margin-top': '1.75rem' } },
      canBuy
        ? h('a', { class: 'btn btn--primary btn--block btn--lg', href: `/concierge.html?animal=${encodeURIComponent(a.id)}`, text: 'Begin acquisition' })
        : h('a', { class: 'btn btn--block btn--lg', href: '/concierge.html', text: a.status === 'sold' ? 'Enquire about the repeat pairing' : 'Register interest' }),
      h(
        'button',
        {
          class: 'btn btn--block',
          type: 'button',
          'aria-pressed': String(saved),
          dataset: { vaultToggle: a.id }
        },
        icon('bookmark'),
        saved ? 'In your Vault' : 'Save to Vault'
      ),
      h(
        'button',
        {
          class: 'btn btn--block btn--ghost',
          type: 'button',
          'aria-pressed': String(comparing),
          dataset: { compareToggle: a.id }
        },
        icon('layers'),
        'Add to comparison'
      )
    ),

    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '1.5rem' } },
      icon('shield', 'notice__icon'),
      h('span', {}, h('strong', { text: 'No animal ships blind. ' }),
        'We speak to every buyer before despatch and will decline the sale if the setup described is not one this animal can live well in.')
    )
  );
}

function spec(k, v) {
  if (v == null) return null;
  return h('div', { class: 'spec' }, h('span', { class: 'spec__k', text: k }), h('span', { class: 'spec__v', text: String(v) }));
}

/* ---------- body ---------- */

function detailBody(a, sp, enclosure, feeding) {
  return h(
    'div',
    { class: 'split split--sidebar' },

    h(
      'div',
      { class: 'stack stack--lg' },

      block('This animal', [
        h('p', { class: 'lede', text: a.story })
      ]),

      block('Genetics', [
        h('p', { class: 'text-dim', style: { 'margin-bottom': '1rem' },
          text: 'Every trait as recorded, with zygosity made explicit. Heterozygous recessives are carried but not visible; super forms are homozygous co-dominants.' }),
        geneChips(a.traits, { link: true }),
        h('div', { class: 'specs', style: { 'margin-top': '1.5rem' } }, ...a.traits.map((t) => geneRow(t)).filter(Boolean)),
        a.traits.some((t) => GENES_BY_ID[t.geneId]?.lethality)
          ? h('div', { class: 'notice notice--caution', style: { 'margin-top': '1rem' } }, icon('alert', 'notice__icon'),
              h('span', { text: a.traits.map((t) => GENES_BY_ID[t.geneId]).filter((g) => g && g.lethalityNote).map((g) => g.lethalityNote).join(' ') }))
          : null
      ]),

      block('Growth', [
        h('p', { class: 'text-dim', style: { 'margin-bottom': '1.25rem' },
          text: 'Recorded weights since hatching, with the projected curve to adult mass at the current feeding plan. A steady, unremarkable line is exactly what you want to see here.' }),
        growthChart(a, sp)
      ]),

      block('Feeding record', [
        h(
          'div',
          { class: 'stat-row', style: { 'border-top': '0', 'padding-top': '0' } },
          stat(String(a.feeding.consecutive), 'Consecutive feeds'),
          stat(String(a.feeding.refusals), 'Refusals recorded'),
          stat(`${a.feeding.interval}d`, 'Current interval'),
          stat(date(a.feeding.lastFed), 'Last fed')
        ),
        h('p', { class: 'text-dim', style: { 'margin-top': '1.25rem' },
          text: `Currently taking ${a.feeding.size.toLowerCase()} ${a.feeding.prey.toLowerCase()}, frozen-thawed, every ${a.feeding.interval} days.` }),
        feeding
          ? h('p', { class: 'stat__note', style: { 'margin-top': '.5rem' },
              text: `At ${weight(a.weight)} the calculated target is ${feeding.targetGrams} g (${feeding.targetPercent}% of body mass) — closest standard item ${feeding.primary.label}, every ${feeding.interval} days.` })
          : null,
        h('p', { style: { 'margin-top': '1rem' } },
          h('a', { class: 'arrow-link', href: `/tools/feeding.html?species=${encodeURIComponent(a.species)}&weight=${a.weight}` }, 'Open in Feeding & Growth', icon('arrow')))
      ]),

      block('Lineage', [
        pedigree(a),
        h('p', { class: 'text-dim', style: { 'margin-top': '1.25rem' }, text: a.provenance })
      ]),

      block('Husbandry it needs', [
        h('p', { class: 'text-dim', style: { 'margin-bottom': '1.25rem' },
          text: `Specification computed for this animal at its current mass, not a generic ${sp.common.toLowerCase()} care sheet.` }),
        h(
          'div',
          { class: 'specs' },
          spec('Enclosure now', `${dimensions(enclosure.dimensions)} (${enclosure.orientation})`),
          spec('Enclosure at adult', dimensions(enclosure.adultDimensions)),
          spec('Warm side', tempRange(enclosure.thermal.warmSide)),
          spec('Cool side', tempRange(enclosure.thermal.coolSide)),
          spec('Humidity', `${enclosure.humidity.standard[0]}–${enclosure.humidity.standard[1]}%, ${enclosure.humidity.shed[0]}–${enclosure.humidity.shed[1]}% in shed`),
          spec('Substrate', enclosure.substrate.join(', ')),
          spec('Adult length', lengthRange(sp.adultLength)),
          spec('Lifespan', `${sp.lifespan[0]}–${sp.lifespan[1]} years`)
        ),
        h('div', { class: 'notice', style: { 'margin-top': '1.25rem' } }, icon('info', 'notice__icon'), h('span', { text: sp.care.notes })),
        h('p', { style: { 'margin-top': '1rem' } },
          h('a', { class: 'arrow-link', href: `/tools/husbandry.html?species=${encodeURIComponent(a.species)}&weight=${a.weight}` }, 'Full build specification', icon('arrow')))
      ]),

      a.notes ? block('Keeper notes', [h('p', { class: 'text-dim', text: a.notes })]) : null
    ),

    h(
      'div',
      { class: 'stack stack--lg' },
      h(
        'div',
        { class: 'panel' },
        h('p', { class: 'eyebrow', text: 'Species' }),
        h('h3', { style: { 'margin-top': '.75rem', 'font-size': 'var(--t-md)' }, text: sp.common }),
        h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-top': '.75rem' }, text: sp.blurb }),
        h(
          'div',
          { class: 'specs', style: { 'margin-top': '1rem' } },
          spec('Origin', sp.origin),
          spec('Temperament', sp.temperament),
          spec('Difficulty', `${sp.difficulty} / 5`)
        )
      ),
      h(
        'div',
        { class: 'panel' },
        h('p', { class: 'eyebrow', text: 'Before you order' }),
        h(
          'ul',
          { class: 'footer-list', style: { 'margin-top': '1rem' } },
          h('li', {}, h('a', { class: 'link', href: `/tools/legality.html?species=${encodeURIComponent(a.species)}`, text: 'Check the rules where you live' })),
          h('li', {}, h('a', { class: 'link', href: '/tools/shipping.html', text: 'Check the shipping window' })),
          h('li', {}, h('a', { class: 'link', href: '/tools/quarantine.html', text: 'Read the quarantine protocol' })),
          h('li', {}, h('a', { class: 'link', href: '/legal/health-guarantee.html', text: 'Health guarantee' })),
          h('li', {}, h('a', { class: 'link', href: '/acquire.html', text: 'How acquisition works' }))
        )
      )
    )
  );
}

function block(title, children) {
  return h(
    'section',
    {},
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1.25rem' }, text: title }),
    ...children.filter(Boolean)
  );
}

function stat(v, k) {
  return h('div', { class: 'stat' }, h('span', { class: 'stat__v num', text: v }), h('span', { class: 'stat__k', text: k }));
}

function geneRow(trait) {
  const g = GENES_BY_ID[trait.geneId];
  if (!g) return null;
  const zyg =
    g.inheritance === 'recessive'
      ? trait.zygosity === 'homo' ? 'Homozygous — visual' : 'Heterozygous — carried, not visible'
      : trait.zygosity === 'homo' ? 'Homozygous — super form' : 'Heterozygous — single copy';
  return h(
    'div',
    { class: 'spec' },
    h('span', { class: 'spec__k' }, h('a', { class: 'link', href: `/tools/codex.html?gene=${encodeURIComponent(g.id)}`, text: g.name })),
    h(
      'span',
      { class: 'spec__v' },
      h('span', { text: g.effect || '' }),
      h('span', { class: 'stat__note', style: { display: 'block', 'margin-top': '.35rem' },
        text: `${zyg}${g.originator ? ` · ${g.originator}` : ''}${g.year ? `, ${g.year}` : ''}` })
    )
  );
}

/* ---------- growth chart ---------- */

function growthChart(a, sp) {
  const W = 640, H = 240, PAD = { l: 46, r: 16, t: 16, b: 28 };
  const recorded = a.weights.map(([d, g]) => ({ d, g, projected: false }));

  const monthsAhead = 18;
  const proj = growthProjection(a.species, a.weight, monthsAhead)
    .slice(1)
    .filter((_, i) => i % 3 === 2)
    .map((p) => {
      const base = new Date(`${a.weights[a.weights.length - 1][0]}T12:00:00Z`);
      base.setUTCMonth(base.getUTCMonth() + p.month);
      return { d: base.toISOString().slice(0, 10), g: p.grams, projected: true };
    });

  const all = [...recorded, ...proj];
  const maxG = Math.max(...all.map((p) => p.g)) * 1.1;
  const t0 = new Date(`${all[0].d}T12:00:00Z`).getTime();
  const t1 = new Date(`${all[all.length - 1].d}T12:00:00Z`).getTime();

  const x = (d) => PAD.l + ((new Date(`${d}T12:00:00Z`).getTime() - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
  const y = (g) => H - PAD.b - (g / maxG) * (H - PAD.t - PAD.b);

  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)} ${y(p.g).toFixed(1)}`).join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    svgEl('line', { x1: PAD.l, x2: W - PAD.r, y1: y(maxG * f), y2: y(maxG * f) })
  );
  const gridLabels = [0.25, 0.5, 0.75, 1].map((f) =>
    svgEl('text', { x: PAD.l - 8, y: y(maxG * f) + 3, 'text-anchor': 'end' }, String(Math.round(maxG * f)))
  );

  const chart = svgEl(
    'svg',
    { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label':
      `Weight from ${weight(recorded[0].g)} at ${date(recorded[0].d)} to ${weight(a.weight)} now, projected to ${weight(proj[proj.length - 1].g)} over the next ${monthsAhead} months.` },
    svgEl('defs', {},
      svgEl('linearGradient', { id: 'growthFill', x1: '0', y1: '0', x2: '0', y2: '1' },
        svgEl('stop', { offset: '0%', 'stop-color': '#c6a15b', 'stop-opacity': '.28' }),
        svgEl('stop', { offset: '100%', 'stop-color': '#c6a15b', 'stop-opacity': '0' })
      )
    ),
    svgEl('g', { class: 'chart__grid' }, ...gridLines),
    svgEl('g', { class: 'chart__axis' }, ...gridLabels),
    svgEl('path', { class: 'chart__area', d: `${line(recorded)} L${x(recorded[recorded.length - 1].d)} ${y(0)} L${x(recorded[0].d)} ${y(0)} Z` }),
    svgEl('path', { class: 'chart__line chart__proj', d: line([recorded[recorded.length - 1], ...proj]) }),
    svgEl('path', { class: 'chart__line', d: line(recorded) }),
    ...recorded.map((p) => svgEl('circle', { class: 'chart__dot', cx: x(p.d), cy: y(p.g), r: '3' })),
    svgEl('g', { class: 'chart__axis' },
      svgEl('text', { x: PAD.l, y: H - 8 }, date(recorded[0].d)),
      svgEl('text', { x: W - PAD.r, y: H - 8, 'text-anchor': 'end' }, date(proj[proj.length - 1].d))
    )
  );

  return h(
    'div',
    { class: 'chart' },
    chart,
    h(
      'div',
      { class: 'cluster', style: { 'margin-top': '.75rem', 'font-size': 'var(--t-xs)', color: 'var(--muted-2)' } },
      h('span', {}, '—— recorded'),
      h('span', {}, '- - - projected'),
      h('span', {}, `grams · adult target ≈ ${sp.maturityWeight} g`)
    )
  );
}

/* ---------- pedigree ---------- */

function pedigree(a) {
  const l = a.lineage || {};
  return h(
    'div',
    { class: 'pedigree' },
    h(
      'div',
      { class: 'pedigree__row' },
      node('Sire', l.sire || 'Not recorded'),
      node('Dam', l.dam || 'Not recorded')
    ),
    h('div', { class: 'pedigree__row' }, node('This animal', `${a.title} · ${a.sku}`, true)),
    h(
      'div',
      { class: 'specs', style: { 'margin-top': '.5rem' } },
      spec('Generation', l.generation || '—'),
      l.dwarfPercent ? spec('Dwarf percentage', `${l.dwarfPercent}% — computed from four generations of records, not estimated`) : null
    )
  );
}

function node(role, name, self = false) {
  return h(
    'div',
    { class: `pedigree__node${self ? ' pedigree__node--self' : ''}` },
    h('p', { class: 'pedigree__role', text: role }),
    h('p', { text: name })
  );
}

/* ---------- related ---------- */

function relatedSection(a) {
  const related = INVENTORY.filter((x) => x.id !== a.id && x.species === a.species && x.status !== 'sold').slice(0, 3);
  const fallback = INVENTORY.filter((x) => x.id !== a.id && x.tier === 'flagship').slice(0, 3);
  const list = related.length ? related : fallback;
  if (!list.length) return null;

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'shell' },
      h(
        'div',
        { class: 'section-head' },
        h('div', { class: 'section-head__text' },
          h('p', { class: 'eyebrow', text: 'Also held' }),
          h('h2', { style: { 'font-size': 'var(--t-lg)' }, text: related.length ? `More ${SPECIES_BY_ID[a.species].common.toLowerCase()}s` : 'Other flagship animals' })
        ),
        h('a', { class: 'arrow-link', href: '/collection.html' }, 'Full collection', icon('arrow'))
      ),
      h('div', { class: 'grid grid--3' }, ...list.map((x) => animalCard(x)))
    )
  );
}

/* ---------- meta ---------- */

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function injectProductSchema(a, sp) {
  const availability = {
    available: 'https://schema.org/InStock',
    reserved: 'https://schema.org/PreOrder',
    hold: 'https://schema.org/BackOrder',
    sold: 'https://schema.org/SoldOut'
  }[a.status];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${a.title} — ${sp.common}`,
    sku: a.sku,
    description: a.story,
    category: sp.common,
    brand: { '@type': 'Brand', name: SITE.name },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Scientific name', value: sp.scientific },
      { '@type': 'PropertyValue', name: 'Sex', value: a.sex },
      { '@type': 'PropertyValue', name: 'Hatch date', value: a.hatched },
      { '@type': 'PropertyValue', name: 'Weight', value: `${a.weight} g` },
      { '@type': 'PropertyValue', name: 'Genetics', value: a.traits.map((t) => `${t.zygosity === 'het' ? 'het ' : ''}${GENES_BY_ID[t.geneId]?.name || ''}`).join(', ') || 'Wild-type' }
    ],
    offers: {
      '@type': 'Offer',
      url: `${SITE.origin}/animal.html?id=${encodeURIComponent(a.id)}`,
      priceCurrency: 'USD',
      availability,
      seller: { '@type': 'Organization', name: SITE.legalName },
      ...(a.price ? { price: String(a.price) } : {})
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
