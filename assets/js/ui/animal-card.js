/**
 * Animal card + shared genetic display fragments.
 * Used by the collection browser, the homepage, the Vault and compare views.
 */

import { h, icon } from '../core/dom.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { STATUS_LABEL, TIER_LABEL } from '../data/inventory.js';
import { money, weight, ageFrom, sexSymbol } from '../core/format.js';
import { makeAnimalCanvas } from './scales.js';
import { vault, compare } from '../core/store.js';
import { rarityScore } from '../engine/valuation.js';

/** A single gene, rendered with its zygosity made explicit. */
export function geneChip(trait, opts = {}) {
  const gene = GENES_BY_ID[trait.geneId];
  if (!gene) return null;

  let label = gene.name;
  let cls = 'gene-chip';

  if (gene.inheritance === 'recessive') {
    if (trait.zygosity === 'het') { label = `het ${gene.name}`; cls += ' gene-chip--het'; }
    else cls += ' gene-chip--recessive';
  } else if (gene.inheritance === 'incdom' && trait.zygosity === 'homo') {
    label = gene.superName || `Super ${gene.name}`;
    cls += ' gene-chip--super';
  }
  if (gene.lethality === 'wobble') cls += ' gene-chip--warn';

  if (opts.link) {
    return h('a', { class: cls, href: `/tools/codex.html?gene=${encodeURIComponent(gene.id)}`, text: label, title: gene.effect || '' });
  }
  return h('span', { class: cls, text: label, title: gene.effect || '' });
}

export function geneChips(traits, opts = {}) {
  const chips = (traits || []).map((t) => geneChip(t, opts)).filter(Boolean);
  if (!chips.length) return h('span', { class: 'gene-chip', text: 'Wild-type / locality' });
  return h('div', { class: 'cluster cluster--tight' }, ...chips);
}

export function statusBadge(status) {
  return h(
    'span',
    { class: `badge badge--${status}` },
    h('span', { class: 'badge__dot', 'aria-hidden': 'true' }),
    STATUS_LABEL[status] || status
  );
}

export function rarityMeter(traits) {
  const score = rarityScore(traits);
  const filled = Math.round(score);
  return h(
    'div',
    {},
    h(
      'div',
      { class: 'rarity-meter', role: 'img', 'aria-label': `Rarity index ${score} out of 10` },
      ...Array.from({ length: 10 }, (_, i) => h('span', { class: `rarity-meter__seg${i < filled ? ' is-on' : ''}` }))
    ),
    h('p', { class: 'stat__note', style: { 'margin-top': '.4rem' }, text: `Rarity index ${score} / 10` })
  );
}

/**
 * @param {object} animal
 * @param {{layout?:'grid'|'list', priority?:boolean}} opts
 */
export function animalCard(animal, opts = {}) {
  const sp = SPECIES_BY_ID[animal.species];
  if (!sp) return h('div');

  const canvas = makeAnimalCanvas(animal, sp, GENES_BY_ID, {
    width: opts.layout === 'list' ? 360 : 520,
    height: opts.layout === 'list' ? 270 : 390,
    detail: 'card'
  });

  const isSaved = vault.has(animal.id);
  const inCompare = compare.has(animal.id);

  const priceEl = animal.price
    ? h('span', { class: 'card__price num', text: money(animal.price) })
    : h('span', { class: 'card__price card__price--poa', text: 'POA' });

  const media = h(
    'div',
    { class: 'card__media' },
    canvas,
    h(
      'div',
      { class: 'card__actions', style: { position: 'absolute', top: '.6rem', right: '.6rem', display: 'flex', gap: '.25rem' } },
      h(
        'button',
        {
          class: 'icon-btn',
          type: 'button',
          'aria-pressed': String(isSaved),
          'aria-label': `Save ${animal.title} to your Vault`,
          title: 'Save to Vault',
          dataset: { vaultToggle: animal.id }
        },
        icon('bookmark')
      ),
      h(
        'button',
        {
          class: 'icon-btn',
          type: 'button',
          'aria-pressed': String(inCompare),
          'aria-label': `Add ${animal.title} to comparison`,
          title: 'Add to comparison',
          dataset: { compareToggle: animal.id }
        },
        icon('layers')
      )
    ),
    h(
      'div',
      { style: { position: 'absolute', left: '.75rem', top: '.75rem', display: 'flex', gap: '.35rem', 'flex-wrap': 'wrap' } },
      statusBadge(animal.status),
      animal.tier === 'flagship' ? h('span', { class: 'badge badge--flagship', text: TIER_LABEL.flagship }) : null
    )
  );

  const body = h(
    'div',
    { class: 'card__body' },
    h('p', { class: 'card__meta', text: `${sp.common} · ${animal.sku}` }),
    h(
      'h3',
      { class: 'card__title' },
      h('a', { class: 'card__link', href: `/animal.html?id=${encodeURIComponent(animal.id)}`, text: animal.title })
    ),
    h(
      'p',
      { class: 'card__meta', style: { 'text-transform': 'none', 'letter-spacing': '.02em', color: 'var(--muted)' },
        text: `${sexSymbol(animal.sex)} ${animal.sex} · ${weight(animal.weight)} · ${ageFrom(animal.hatched)}` }
    ),
    opts.layout === 'list' ? geneChips(animal.traits) : null,
    h('div', { class: 'card__foot' }, priceEl, h('span', { class: 'card__meta', text: TIER_LABEL[animal.tier] || '' }))
  );

  return h(
    'article',
    { class: `card${animal.tier === 'flagship' ? ' card--flagship' : ''}${animal.status === 'sold' ? ' is-sold' : ''}` },
    media,
    body
  );
}
