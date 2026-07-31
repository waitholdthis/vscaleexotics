/** The Vault — saved animals. */

import { initShell, toast } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { INVENTORY_BY_ID } from '../data/inventory.js';
import { vault, compare, recent, storageAvailable } from '../core/store.js';
import { animalCard } from '../ui/animal-card.js';
import { mountScaleCanvases } from '../ui/scales.js';
import { money } from '../core/format.js';
import { statBlock } from '../ui/controls.js';

initShell();

const host = $('[data-vault-root]');

function paint() {
  const ids = vault.list();
  const animals = ids.map((id) => INVENTORY_BY_ID[id]).filter(Boolean);

  if (!animals.length) {
    render(
      host,
      h(
        'div',
        { class: 'empty' },
        h('p', { class: 'empty__title', text: 'Your Vault is empty' }),
        h('p', { text: 'Save an animal from the collection and it will appear here, on this device only.' }),
        h('a', { class: 'btn btn--primary', href: '/collection.html', text: 'Browse the collection' })
      ),
      recentSection(),
      storageNotice()
    );
    return;
  }

  const priced = animals.filter((a) => a.price);
  const total = priced.reduce((s, a) => s + a.price, 0);
  const available = animals.filter((a) => a.status === 'available').length;

  render(
    host,
    statBlock([
      [String(animals.length), 'Saved', ''],
      [String(available), 'Still available', ''],
      [priced.length ? money(total) : '—', 'Combined', priced.length < animals.length ? `${animals.length - priced.length} priced on application` : ''],
      [String(new Set(animals.map((a) => a.species)).size), 'Species', '']
    ]),

    h(
      'div',
      { class: 'cluster', style: { margin: '2rem 0' } },
      h('a', { class: 'btn btn--primary', href: '/concierge.html', text: 'Send this list as an enquiry' }),
      h(
        'button',
        {
          class: 'btn', type: 'button',
          on: {
            click: () => {
              let added = 0;
              for (const a of animals) {
                if (compare.isFull()) break;
                if (!compare.has(a.id) && compare.add(a.id).ok) added++;
              }
              toast(added ? `${added} added to comparison.` : `Comparison already holds ${compare.max}.`, added ? 'success' : 'error');
            }
          }
        },
        icon('layers'), 'Add to comparison'
      ),
      h(
        'button',
        {
          class: 'btn btn--ghost', type: 'button',
          on: { click: () => { vault.clear(); toast('Vault cleared.', 'info'); } }
        },
        'Clear Vault'
      )
    ),

    h('div', { class: 'grid grid--3' }, ...animals.map((a) => animalCard(a))),
    recentSection(),
    storageNotice()
  );

  mountScaleCanvases(host);
}

function recentSection() {
  const ids = recent.list().filter((id) => !vault.has(id));
  const animals = ids.map((id) => INVENTORY_BY_ID[id]).filter(Boolean).slice(0, 4);
  if (!animals.length) return null;
  return h(
    'section',
    { style: { 'margin-top': '4rem' } },
    h('h2', { style: { 'font-size': 'var(--t-lg)', 'margin-bottom': '1.5rem' }, text: 'Recently viewed' }),
    h('div', { class: 'grid grid--4' }, ...animals.map((a) => animalCard(a)))
  );
}

function storageNotice() {
  return h(
    'div',
    { class: 'notice notice--note', style: { 'margin-top': '3rem' } },
    icon('shield', 'notice__icon'),
    h(
      'span',
      {},
      storageAvailable()
        ? 'Saved in this browser only. We cannot see this list, and clearing your browser data will remove it. Send it to us as an enquiry if you want us to hold anything.'
        : 'Your browser is blocking local storage, so this list will not survive a reload. Everything still works for this session.'
    )
  );
}

paint();
window.addEventListener('storage', paint);
import('../core/store.js').then(({ subscribe }) => {
  subscribe('vault', paint);
});
