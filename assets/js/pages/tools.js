/** Tools index. */

import { initShell } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { TOOLS } from '../core/sitemap.js';

initShell();

const DETAIL = {
  'gene-lab': 'Models loci rather than genes, so Mojave × Lesser resolves to a Blue-Eyed Leucistic. Removes non-viable genotypes from the live clutch, separates genotype from visual result, and derives possible-het percentages instead of hard-coding them.',
  codex: 'Ninety-one genes across ten species with inheritance mode, originating breeder, year proven, rarity index and — the part usually missing — which locus each occupies and what it is allelic with.',
  valuation: 'Applies a decaying weight to each successive gene rather than multiplying them all together, which is why it does not value a five-gene animal at ten times what anyone would pay. Returns a band and a liquidity assessment.',
  clutch: 'Temperature-dependent incubation for oviparous species, gestation windows for live-bearers. Candling dates, pip window, when cutting is justified, first shed and first feed.',
  husbandry: 'Sizes the enclosure to the animal in front of you rather than to an adult of the species, and produces a build checklist with the critical items marked.',
  feeding: 'Prey mass as a species-appropriate share of body mass, matched to the nearest standard item, with interval, annual consumption and a projected growth curve.',
  shipping: 'Regional climatological normals against carrier limits, so you can plan a despatch months ahead. Returns the next viable dates and the accessories a marginal window would need.',
  legality: 'Federal injurious-wildlife listings and CITES, all fifty states, and thirteen destination countries. Flags where a species-specific rule overrides the general state position.',
  quarantine: 'The ninety-day protocol as a dated, checkable list. Progress persists in your browser and nowhere else.'
};

const grid = $('[data-tools-grid]');
if (grid) {
  render(
    grid,
    ...TOOLS.map((t) =>
      h(
        'a',
        { class: 'tool-card', href: t.href },
        h('span', { class: 'tool-card__icon' }, icon(t.icon || 'arrow')),
        h('h3', { text: t.label }),
        h('p', { text: t.blurb || '' }),
        h('span', { class: 'arrow-link', style: { 'margin-top': '.5rem', 'align-self': 'flex-start' } }, 'Open', icon('arrow'))
      )
    )
  );
}

const detail = $('[data-tools-detail]');
if (detail) {
  render(
    detail,
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '2rem' }, text: 'What each one actually does' }),
    h(
      'div',
      { class: 'specs' },
      ...TOOLS.map((t) =>
        h(
          'div',
          { class: 'spec' },
          h('span', { class: 'spec__k' }, h('a', { class: 'link', href: t.href, text: t.label })),
          h('span', { class: 'spec__v', text: DETAIL[t.id] || t.blurb || '' })
        )
      )
    ),
    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '2.5rem' } },
      icon('shield', 'notice__icon'),
      h(
        'span',
        {},
        h('strong', { text: 'Nothing here leaves your browser. ' }),
        'There is no server component to any of these tools. No account, no analytics, no third-party scripts. ',
        'The quarantine checklist and your Vault use local storage on your own device, and clearing your browser data removes them.'
      )
    )
  );
}
