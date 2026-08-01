/**
 * Canonical site structure.
 *
 * One definition drives the header nav, the mobile drawer, the footer, the
 * command palette index and the generated sitemap.xml. Adding a page in one
 * place makes it discoverable everywhere.
 */

// Site constants are CMS-editable; see content/settings/site.json.
export { SITE } from '../data/site.js';
import { SITE } from '../data/site.js';

/** `id` doubles as the body[data-page] value used to mark the active nav item. */
export const NAV = [
  {
    id: 'collection',
    label: 'The Collection',
    href: '/collection.html',
    primary: true,
    summary: 'Every animal currently available, with full genetics and records.',
    children: [
      { id: 'collection-ball', label: 'Ball Pythons', href: '/collection.html?species=ball-python' },
      { id: 'collection-retic', label: 'Reticulated Pythons', href: '/collection.html?species=reticulated-python' },
      { id: 'collection-gtp', label: 'Green Tree Pythons', href: '/collection.html?species=green-tree-python' },
      { id: 'collection-boa', label: 'Boas', href: '/collection.html?species=boa-constrictor' },
      { id: 'collection-flagship', label: 'Flagship Animals', href: '/collection.html?tier=flagship' }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    href: '/tools.html',
    primary: true,
    summary: 'Nine instruments for planning, valuing and keeping a collection.',
    children: [
      { id: 'gene-lab', label: 'Gene Lab', href: '/tools/gene-lab.html', icon: 'dna', blurb: 'Multi-locus punnett with true allelic complexes.' },
      { id: 'codex', label: 'Morph Codex', href: '/tools/codex.html', icon: 'book', blurb: 'Every gene we work with, indexed and explained.' },
      { id: 'valuation', label: 'Valuation Index', href: '/tools/valuation.html', icon: 'scale', blurb: 'Market estimate for any combination.' },
      { id: 'clutch', label: 'Clutch Planner', href: '/tools/clutch.html', icon: 'calendar', blurb: 'Incubation and gestation timelines.' },
      { id: 'husbandry', label: 'Husbandry Architect', href: '/tools/husbandry.html', icon: 'home', blurb: 'Enclosure specification and build list.' },
      { id: 'feeding', label: 'Feeding & Growth', href: '/tools/feeding.html', icon: 'thermometer', blurb: 'Prey sizing, intervals and growth curve.' },
      { id: 'shipping', label: 'Ship Window', href: '/tools/shipping.html', icon: 'truck', blurb: 'Safe despatch dates for any destination.' },
      { id: 'legality', label: 'Legality Check', href: '/tools/legality.html', icon: 'shield', blurb: 'Federal, state and international rules.' },
      { id: 'quarantine', label: 'Quarantine Protocol', href: '/tools/quarantine.html', icon: 'check', blurb: 'The 90-day intake checklist.' }
    ]
  },
  {
    id: 'education',
    label: 'Education',
    href: '/education.html',
    primary: true,
    summary: 'Practical, evidence-led snake biology, husbandry, health and safety.'
  },
  {
    id: 'provenance',
    label: 'Provenance',
    href: '/provenance.html',
    primary: true,
    summary: 'Who we are, how the facility runs, and what we will not do.'
  },
  {
    id: 'acquire',
    label: 'Acquire',
    href: '/acquire.html',
    primary: true,
    summary: 'How a purchase works, start to finish.',
    children: [
      { id: 'concierge', label: 'Private Concierge', href: '/concierge.html' },
      { id: 'vault', label: 'Your Vault', href: '/vault.html' }
    ]
  },
  {
    id: 'journal',
    label: 'Journal',
    href: '/journal.html',
    primary: true,
    summary: 'Notes from the collection room.'
  }
];

export const LEGAL_NAV = [
  { id: 'health-guarantee', label: 'Health Guarantee', href: '/legal/health-guarantee.html' },
  { id: 'shipping-policy', label: 'Shipping & Live Arrival', href: '/legal/shipping-policy.html' },
  { id: 'terms', label: 'Terms of Sale', href: '/legal/terms.html' },
  { id: 'privacy', label: 'Privacy', href: '/legal/privacy.html' }
];

/** Flat list of every real page, for the palette and sitemap. */
export function allPages() {
  const out = [
    { id: 'home', label: 'Home', href: '/', summary: SITE.tagline, priority: 1.0 },
    ...NAV.map((n) => ({ id: n.id, label: n.label, href: n.href, summary: n.summary, priority: 0.9 })),
    ...NAV.flatMap((n) =>
      (n.children || [])
        .filter((c) => !c.href.includes('?'))
        .map((c) => ({ id: c.id, label: c.label, href: c.href, summary: c.blurb, priority: 0.8 }))
    ),
    ...LEGAL_NAV.map((l) => ({ ...l, priority: 0.3 }))
  ];
  const seen = new Set();
  return out.filter((p) => (seen.has(p.href) ? false : (seen.add(p.href), true)));
}

export const TOOLS = NAV.find((n) => n.id === 'tools').children;
