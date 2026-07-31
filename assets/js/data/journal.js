/**
 * Journal entries. Body copy lives on the article pages; this is the index.
 */

export const JOURNAL = [
  {
    id: 'reading-desert-ghost',
    title: 'Why you cannot buy a Desert Ghost on the hatchling',
    date: '2026-06-18',
    tag: 'Genetics',
    readMinutes: 7,
    excerpt:
      'Desert Ghost takes three years to finish. A hatchling tells you almost nothing about the adult, which means the only honest way to buy the gene is on the parents — and the only honest way to sell it is to show them.'
  },
  {
    id: 'locus-not-gene',
    title: 'A locus is not a gene, and it costs people thousands',
    date: '2026-05-02',
    tag: 'Genetics',
    readMinutes: 9,
    excerpt:
      'Mojave, Lesser, Butter, Russo, Phantom, Mystic, Special, Daddy and Bamboo are not nine genes. They are nine alleles competing for two slots, and every public calculator that treats them otherwise produces animals that cannot exist.'
  },
  {
    id: 'dwarf-percentage-fiction',
    title: 'Dwarf percentage is a claim, not a measurement',
    date: '2026-03-27',
    tag: 'Reticulated Pythons',
    readMinutes: 6,
    excerpt:
      'There is no test for it. A dwarf percentage is arithmetic performed on a pedigree, and it is only as good as the records behind it — which, across most of the market, is not very good at all.'
  },
  {
    id: 'the-wobble-question',
    title: 'The wobble question, answered plainly',
    date: '2026-02-14',
    tag: 'Ethics',
    readMinutes: 11,
    excerpt:
      'Every Spider ball python has a neurological defect. That is not disputed by anyone breeding them. What is disputed is whether it matters, and the argument usually turns on a definition of suffering that would not survive being applied to a mammal.'
  },
  {
    id: 'quarantine-ninety-days',
    title: 'Ninety days, and why sixty is not enough',
    date: '2026-01-09',
    tag: 'Husbandry',
    readMinutes: 8,
    excerpt:
      'Snake mites complete a full life cycle in under three weeks under warm conditions, but eggs in a substrate crack can sit dormant for longer than most keepers quarantine. The number is ninety for a reason.'
  },
  {
    id: 'shipping-into-a-forecast',
    title: 'We have never shipped into a marginal forecast',
    date: '2025-11-21',
    tag: 'Logistics',
    readMinutes: 5,
    excerpt:
      'A live arrival guarantee is a refund, not a resurrection. The entire point of the policy is to make sure it is never invoked, which means the answer to "can you get it here by Friday" is sometimes simply no.'
  }
];

export const JOURNAL_BY_ID = Object.freeze(Object.fromEntries(JOURNAL.map((j) => [j.id, j])));
