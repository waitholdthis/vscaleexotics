/**
 * The application shell: header, mobile drawer, command palette, compare tray,
 * toasts, footer, and the scroll-reveal observer.
 *
 * Rendered from JS so there is exactly one definition of the chrome rather than
 * twenty drifting copies across the page set. Every page's substantive content
 * is static HTML in the document; only the surrounding furniture is built here.
 */

import { h, icon, $, $$, render, on, trapFocus, prefersReducedMotion } from '../core/dom.js';
import { SITE, NAV, LEGAL_NAV } from '../core/sitemap.js';
import { vault, compare, prefs, subscribe } from '../core/store.js';
import { INVENTORY, STATUS_LABEL } from '../data/inventory.js';
import { GENES, GENES_BY_ID } from '../data/genes.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { money } from '../core/format.js';
import { makeAnimalCanvas, mountScaleCanvases } from './scales.js';

const currentPage = () => document.body.dataset.page || '';

/* ================================================================== *
 * Brand mark — a stylised scale/serpent glyph, drawn inline.
 * ================================================================== */

/**
 * The mark, on its bone panel.
 *
 * The supplied logo is black-and-olive artwork drawn for a white field. Keying
 * the white out deletes the V; recolouring the darks bleaches the snake. So it
 * keeps its own artwork and sits on a bone panel instead — the treatment a
 * pressed seal gets, and bone is already in the palette.
 */
function brandMark() {
  return h('span', { class: 'brand__mark' }, h('img', {
    src: '/assets/img/brand-mark.png',
    alt: '',
    width: '200',
    height: '190',
    decoding: 'async'
  }));
}

/**
 * The wordmark, set as live type — sharper than upscaling a 150px raster and
 * it inherits the site's own serif.
 *
 * Note the hyphen is U+2011 (non-breaking), not a plain hyphen-minus, so the
 * name can never wrap as "V-" / "Scale". It will not match a grep for
 * "V-Scale"; body copy elsewhere uses the ordinary hyphen.
 */
function brandWord() {
  return h(
    'span',
    { class: 'brand__text' },
    h('span', { class: 'brand__name', text: 'V‑Scale' }),
    h('span', { class: 'brand__sub', text: 'Exotics' })
  );
}

/* ================================================================== *
 * Header
 * ================================================================== */

function buildHeader() {
  const page = currentPage();

  const nav = h(
    'nav',
    { class: 'nav', 'aria-label': 'Primary' },
    ...NAV.filter((n) => n.primary).map((n) =>
      h('a', {
        class: 'nav__link',
        href: n.href,
        text: n.label,
        'aria-current': page === n.id || page.startsWith(`${n.id}-`) ? 'page' : null
      })
    )
  );

  const searchBtn = h(
    'button',
    {
      class: 'icon-btn',
      type: 'button',
      'aria-label': 'Search the collection (press Command K)',
      'data-cmdk-open': ''
    },
    icon('search')
  );

  const vaultBtn = h(
    'a',
    { class: 'icon-btn', href: '/vault.html', 'aria-label': 'Your Vault', 'data-vault-count': '' },
    icon('bookmark')
  );

  const menuBtn = h(
    'button',
    { class: 'icon-btn', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', 'data-drawer-open': '' },
    icon('menu')
  );
  menuBtn.classList.add('nav-only-mobile');

  const header = h(
    'header',
    { class: 'site-header', id: 'site-header' },
    h(
      'div',
      { class: 'shell site-header__inner' },
      h(
        'a',
        { class: 'brand', href: '/', 'aria-label': `${SITE.name} — home` },
        brandMark(),
        brandWord()
      ),
      nav,
      h(
        'div',
        { class: 'header-actions' },
        searchBtn,
        vaultBtn,
        h('a', { class: 'btn btn--sm btn--primary header-cta', href: '/concierge.html', text: 'Enquire' }),
        menuBtn
      )
    )
  );

  return header;
}

function initStickyHeader(header) {
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-stuck', window.scrollY > 24);
    ticking = false;
  };
  on(window, 'scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ================================================================== *
 * Mobile drawer
 * ================================================================== */

function buildDrawer() {
  const closeBtn = h(
    'button',
    { class: 'icon-btn', type: 'button', 'aria-label': 'Close menu', 'data-drawer-close': '' },
    icon('close')
  );

  const groups = NAV.map((n) =>
    h(
      'div',
      { class: 'drawer__group' },
      h('p', { class: 'drawer__heading', text: n.label }),
      h('a', { class: 'drawer__link', href: n.href, text: n.summary ? `All ${n.label}` : n.label }),
      ...(n.children || []).map((c) => h('a', { class: 'drawer__link', href: c.href, text: c.label }))
    )
  );

  return h(
    'div',
    { class: 'drawer', id: 'drawer', 'data-open': 'false', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Site menu', inert: '' },
    h(
      'div',
      { class: 'shell site-header__inner' },
      h('span', { class: 'brand__name', text: 'Menu' }),
      h('div', { class: 'header-actions' }, closeBtn)
    ),
    h(
      'div',
      { class: 'drawer__body' },
      ...groups,
      h(
        'div',
        { class: 'drawer__group' },
        h('p', { class: 'drawer__heading', text: 'Contact' }),
        h('a', { class: 'drawer__link', href: '/concierge.html', text: 'Private Concierge' }),
        h('a', { class: 'drawer__link', href: `mailto:${SITE.email}`, text: SITE.email }),
        SITE.instagram
          ? h('a', {
              class: 'drawer__link',
              href: SITE.instagram,
              target: '_blank',
              rel: 'noopener noreferrer me',
              text: SITE.instagramHandle || 'Instagram'
            })
          : null
      )
    )
  );
}

function initDrawer(drawer) {
  let lastFocus = null;
  let releaseTrap = null;

  const open = () => {
    lastFocus = document.activeElement;
    drawer.dataset.open = 'true';
    drawer.removeAttribute('inert');
    document.body.style.setProperty('overflow', 'hidden');
    $$('[data-drawer-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    releaseTrap = trapFocus(drawer);
    $('[data-drawer-close]', drawer)?.focus();
  };
  const close = () => {
    drawer.dataset.open = 'false';
    drawer.setAttribute('inert', '');
    document.body.style.removeProperty('overflow');
    $$('[data-drawer-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    releaseTrap?.();
    lastFocus?.focus();
  };

  on(document, 'click', (e) => {
    if (e.target.closest('[data-drawer-open]')) { e.preventDefault(); open(); }
    else if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); close(); }
    else if (drawer.dataset.open === 'true' && e.target.closest('.drawer__link')) close();
  });
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && drawer.dataset.open === 'true') close();
  });
}

/* ================================================================== *
 * Command palette
 * ================================================================== */

function buildPaletteIndex() {
  const items = [];

  for (const n of NAV) {
    items.push({ group: 'Pages', title: n.label, meta: 'Page', href: n.href, icon: 'arrow', keywords: n.summary || '' });
    for (const c of n.children || []) {
      items.push({ group: n.id === 'tools' ? 'Tools' : 'Pages', title: c.label, meta: n.id === 'tools' ? 'Tool' : 'Page', href: c.href, icon: c.icon || 'arrow', keywords: c.blurb || '' });
    }
  }
  for (const l of LEGAL_NAV) {
    items.push({ group: 'Pages', title: l.label, meta: 'Policy', href: l.href, icon: 'book', keywords: '' });
  }
  for (const a of INVENTORY) {
    const sp = SPECIES_BY_ID[a.species];
    items.push({
      group: 'Animals',
      title: a.title,
      meta: `${a.sku} · ${STATUS_LABEL[a.status]}`,
      href: `/animal.html?id=${encodeURIComponent(a.id)}`,
      icon: 'layers',
      keywords: `${a.sku} ${sp?.common || ''} ${sp?.scientific || ''} ${a.sex} ${a.traits.map((t) => GENES_BY_ID[t.geneId]?.name || '').join(' ')}`
    });
  }
  for (const g of GENES) {
    const sp = SPECIES_BY_ID[g.species];
    items.push({
      group: 'Genetics',
      title: g.name,
      meta: `${sp?.common || ''} · ${g.inheritance}`,
      href: `/tools/codex.html?gene=${encodeURIComponent(g.id)}`,
      icon: 'dna',
      keywords: `${(g.aliases || []).join(' ')} ${g.effect || ''} ${sp?.common || ''}`
    });
  }
  return items;
}

function scoreMatch(item, q) {
  const title = item.title.toLowerCase();
  const kw = `${item.keywords} ${item.meta}`.toLowerCase();
  if (title === q) return 1000;
  if (title.startsWith(q)) return 500 - title.length;
  if (title.includes(q)) return 300 - title.length;
  if (kw.includes(q)) return 100;
  // Subsequence match, so "gtp" finds "Green Tree Python".
  let i = 0;
  for (const ch of title) if (ch === q[i]) i++;
  return i === q.length ? 40 : -1;
}

function buildPalette() {
  const input = h('input', {
    class: 'cmdk__input',
    type: 'search',
    placeholder: 'Search animals, genes, tools…',
    'aria-label': 'Search',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    role: 'combobox',
    'aria-expanded': 'true',
    'aria-controls': 'cmdk-results',
    'aria-autocomplete': 'list'
  });

  const results = h('div', { class: 'cmdk__results', id: 'cmdk-results', role: 'listbox', 'aria-label': 'Search results' });

  const panel = h(
    'div',
    { class: 'cmdk__panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' },
    h('div', { class: 'cmdk__search' }, icon('search'), input),
    results,
    h(
      'div',
      { class: 'cmdk__foot' },
      h('span', {}, h('kbd', { text: '↑↓' }), ' navigate'),
      h('span', {}, h('kbd', { text: '↵' }), ' open'),
      h('span', {}, h('kbd', { text: 'esc' }), ' close')
    )
  );

  const root = h('div', { class: 'cmdk', 'data-open': 'false', inert: '' }, panel);
  return { root, input, results, panel };
}

function initPalette() {
  const { root, input, results, panel } = buildPalette();
  document.body.appendChild(root);

  const index = buildPaletteIndex();
  let active = 0;
  let visible = [];
  let lastFocus = null;
  let releaseTrap = null;

  const DEFAULT = [
    { group: 'Start here', title: 'Browse the collection', meta: 'Page', href: '/collection.html', icon: 'grid', keywords: '' },
    { group: 'Start here', title: 'Gene Lab', meta: 'Tool', href: '/tools/gene-lab.html', icon: 'dna', keywords: '' },
    { group: 'Start here', title: 'Ship Window', meta: 'Tool', href: '/tools/shipping.html', icon: 'truck', keywords: '' },
    { group: 'Start here', title: 'Private Concierge', meta: 'Page', href: '/concierge.html', icon: 'arrow', keywords: '' }
  ];

  function draw(list) {
    visible = list.slice(0, 30);
    render(results);
    if (!visible.length) {
      results.appendChild(h('p', { class: 'cmdk__empty', text: 'Nothing matched. Try a morph name, a species, or an SKU.' }));
      return;
    }
    let group = null;
    visible.forEach((item, i) => {
      if (item.group !== group) {
        group = item.group;
        results.appendChild(h('p', { class: 'cmdk__group', text: group }));
      }
      const a = h(
        'a',
        {
          class: 'cmdk__item',
          href: item.href,
          role: 'option',
          id: `cmdk-opt-${i}`,
          'aria-selected': i === active ? 'true' : 'false',
          dataset: { active: i === active ? 'true' : 'false', index: i }
        },
        icon(item.icon || 'arrow'),
        h('span', { class: 'cmdk__item-title', text: item.title }),
        h('span', { class: 'cmdk__item-meta', text: item.meta })
      );
      results.appendChild(a);
    });
    syncActive();
  }

  function syncActive() {
    $$('.cmdk__item', results).forEach((el, i) => {
      const on_ = i === active;
      el.dataset.active = on_ ? 'true' : 'false';
      el.setAttribute('aria-selected', on_ ? 'true' : 'false');
      if (on_) {
        el.scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', el.id);
      }
    });
  }

  function search(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) { active = 0; draw(DEFAULT); return; }
    const scored = index
      .map((item) => ({ item, score: scoreMatch(item, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .map((x) => x.item);
    // Stable group order regardless of score interleaving.
    const order = ['Tools', 'Animals', 'Genetics', 'Pages'];
    scored.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
    active = 0;
    draw(scored);
  }

  const open = () => {
    lastFocus = document.activeElement;
    root.dataset.open = 'true';
    root.removeAttribute('inert');
    document.body.style.setProperty('overflow', 'hidden');
    input.value = '';
    search('');
    releaseTrap = trapFocus(panel);
    setTimeout(() => input.focus(), 30);
  };
  const close = () => {
    root.dataset.open = 'false';
    root.setAttribute('inert', '');
    document.body.style.removeProperty('overflow');
    releaseTrap?.();
    lastFocus?.focus();
  };

  on(document, 'click', (e) => {
    if (e.target.closest('[data-cmdk-open]')) { e.preventDefault(); open(); }
  });
  on(root, 'click', (e) => { if (e.target === root) close(); });
  on(input, 'input', () => search(input.value));

  on(document, 'keydown', (e) => {
    const isOpen = root.dataset.open === 'true';
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen ? close() : open(); return; }
    if (!isOpen && e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) {
      e.preventDefault(); open(); return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, visible.length - 1); syncActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); syncActive(); }
    else if (e.key === 'Enter') {
      const target = visible[active];
      if (target) { e.preventDefault(); window.location.href = target.href; }
    }
  });
}

/* ================================================================== *
 * Compare tray
 * ================================================================== */

function initCompareTray() {
  const slots = h('div', { class: 'compare-tray__slots' });
  const tray = h(
    'div',
    { class: 'compare-tray', 'data-open': 'false', role: 'region', 'aria-label': 'Comparison tray' },
    slots,
    h('a', { class: 'btn btn--sm btn--primary', href: '/compare.html', text: 'Compare' }),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Clear comparison', on: { click: () => compare.clear() } }, icon('close'))
  );
  document.body.appendChild(tray);

  const paint = (ids) => {
    render(slots);
    tray.dataset.open = ids.length ? 'true' : 'false';
    for (const id of ids) {
      const animal = INVENTORY.find((a) => a.id === id);
      if (!animal) { compare.remove(id); continue; }
      const sp = SPECIES_BY_ID[animal.species];
      const canvas = makeAnimalCanvas(animal, sp, GENES_BY_ID, { width: 96, height: 96, detail: 'thumb' });
      slots.appendChild(
        h(
          'div',
          { class: 'compare-slot' },
          canvas,
          h('span', { class: 'compare-slot__name', text: animal.title }),
          h(
            'button',
            {
              class: 'compare-slot__remove',
              type: 'button',
              'aria-label': `Remove ${animal.title} from comparison`,
              on: { click: () => compare.remove(id) }
            },
            icon('close')
          )
        )
      );
    }
    mountScaleCanvases(slots);
  };

  subscribe('compare', paint);
  paint(compare.list());
}

/* ================================================================== *
 * Toasts
 * ================================================================== */

let toastHost = null;

export function toast(message, kind = 'info') {
  if (!toastHost) {
    toastHost = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(toastHost);
  }
  const el = h('div', { class: `toast toast--${kind}` }, icon(kind === 'error' ? 'alert' : kind === 'success' ? 'check' : 'info'), h('span', { text: message }));
  toastHost.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

/* ================================================================== *
 * Vault badge
 * ================================================================== */

function initVaultBadge() {
  const paint = (ids) => {
    $$('[data-vault-count]').forEach((el) => {
      el.dataset.count = String(ids.length);
      el.setAttribute('aria-label', ids.length ? `Your Vault, ${ids.length} saved` : 'Your Vault, empty');
    });
  };
  subscribe('vault', paint);
  paint(vault.list());
}

/* ================================================================== *
 * Footer
 * ================================================================== */

function buildFooter() {
  const col = (heading, links) =>
    h(
      'div',
      {},
      h('p', { class: 'footer-heading', text: heading }),
      h('ul', { class: 'footer-list' }, ...links.map((l) => h('li', {}, h('a', { href: l.href, text: l.label }))))
    );

  const tools = NAV.find((n) => n.id === 'tools').children;

  return h(
    'footer',
    { class: 'site-footer', id: 'site-footer' },
    h(
      'div',
      { class: 'shell' },
      h(
        'div',
        { class: 'site-footer__grid' },
        h(
          'div',
          { class: 'site-footer__brand' },
          h('div', { class: 'brand brand--footer' }, brandMark(), brandWord()),
          h('p', { class: 'text-muted', style: { 'margin-top': '1.25rem', 'max-width': '26rem', 'font-size': 'var(--t-sm)' },
            text: 'A private acquisition house for rare serpents, operating from Chatham County, North Carolina since 2009. Viewing strictly by appointment.' }),
          h('p', { class: 'mono text-muted', style: { 'margin-top': '1rem', 'font-size': 'var(--t-xs)' } },
            h('a', { class: 'link', href: `mailto:${SITE.email}`, text: SITE.email })),
          h('p', { class: 'mono text-muted', style: { 'font-size': 'var(--t-xs)' }, text: SITE.hours }),
          socialLinks()
        ),
        col('Collection', [
          { label: 'All Available', href: '/collection.html' },
          { label: 'Sulawesi Retic Project', href: '/sulawesi-retics.html' },
          { label: 'Flagship Animals', href: '/collection.html?tier=flagship' },
          { label: 'Ball Pythons', href: '/collection.html?species=ball-python' },
          { label: 'Reticulated Pythons', href: '/collection.html?species=reticulated-python' },
          { label: 'Green Tree Pythons', href: '/collection.html?species=green-tree-python' }
        ]),
        col('Tools', tools.slice(0, 6).map((t) => ({ label: t.label, href: t.href }))),
        col('House', [
          { label: 'Provenance', href: '/provenance.html' },
          { label: 'Education', href: '/education.html' },
          { label: 'How to Acquire', href: '/acquire.html' },
          { label: 'Private Concierge', href: '/concierge.html' },
          { label: 'Journal', href: '/journal.html' },
          { label: 'Your Vault', href: '/vault.html' }
        ]),
        col('Policies', LEGAL_NAV.map((l) => ({ label: l.label, href: l.href })))
      ),
      qrBlock(),
      h(
        'div',
        { class: 'site-footer__bar' },
        h('p', { text: `© ${new Date().getFullYear()} ${SITE.legalName}. All animals captive-bred.` }),
        h(
          'div',
          { class: 'cluster cluster--tight' },
          buildPrefControl('currency', 'Currency', [['USD', 'USD'], ['EUR', 'EUR'], ['GBP', 'GBP'], ['CAD', 'CAD'], ['AUD', 'AUD'], ['JPY', 'JPY'], ['AED', 'AED']]),
          buildPrefControl('units', 'Units', [['imperial', 'in / lb / °F'], ['metric', 'cm / kg / °C']])
        )
      )
    )
  );
}

/**
 * "Take it with you" — a QR to the site, for moving from desktop to phone.
 *
 * Hidden below 48rem in CSS. Offering someone already holding a phone a code
 * to scan with that same phone is nonsense, and vertical space on a small
 * screen is worth more than a decorative square. This exists for exactly one
 * job: getting a visitor off a desktop and onto the device they will actually
 * message us from.
 *
 * Not a link. It points at the page you are already on, so making it clickable
 * would be a no-op dressed up as an affordance.
 */
function qrBlock() {
  return h(
    'div',
    { class: 'qr-block' },
    h('img', {
      class: 'qr-block__code',
      src: '/assets/img/qr-site.png',
      alt: `QR code linking to ${SITE.origin.replace(/^https?:\/\//, '')}`,
      width: '528',
      height: '528',
      loading: 'lazy',
      decoding: 'async'
    }),
    h(
      'div',
      { class: 'qr-block__text' },
      h('p', { class: 'eyebrow', text: 'Continue on your phone' }),
      h('p', {
        class: 'text-dim',
        text:
          'Scan to carry the collection and the tools with you. The Gene Lab, the husbandry ' +
          'calculators and the quarantine checklist all work offline once the page has loaded — ' +
          'useful in a facility with no signal.'
      }),
      h('p', { class: 'mono text-muted', text: SITE.origin.replace(/^https?:\/\//, '').replace(/\/$/, '') })
    )
  );
}

/**
 * Social links.
 *
 * `rel="noopener noreferrer"` is not optional on a target=_blank external link:
 * without noopener the destination gets a handle on this window via
 * `window.opener` and can navigate it elsewhere. h() does not add it
 * automatically, so it is set explicitly here.
 */
function socialLinks() {
  if (!SITE.instagram) return null;
  return h(
    'div',
    { class: 'social', style: { 'margin-top': '1.5rem' } },
    h(
      'a',
      {
        class: 'social__link',
        href: SITE.instagram,
        target: '_blank',
        rel: 'noopener noreferrer me',
        'aria-label': `${SITE.name} on Instagram${SITE.instagramHandle ? `, ${SITE.instagramHandle}` : ''} (opens in a new tab)`
      },
      icon('instagram'),
      h('span', { text: SITE.instagramHandle || 'Instagram' })
    )
  );
}

function buildPrefControl(key, label, options) {
  const id = `pref-${key}`;
  const select = h(
    'select',
    {
      class: 'select',
      id,
      style: { 'font-size': 'var(--t-xs)', padding: '.35rem 1.9rem .35rem .6rem', width: 'auto' },
      on: {
        change: (e) => {
          prefs.set(key, e.target.value);
          // Formatting is baked into rendered nodes, so a reload is the honest
          // way to apply it everywhere rather than partially re-rendering.
          window.location.reload();
        }
      }
    },
    ...options.map(([value, text]) => h('option', { value, text, selected: prefs.get(key) === value ? '' : null }))
  );
  return h('span', { class: 'cluster cluster--tight' }, h('label', { class: 'visually-hidden', for: id, text: label }), select);
}

/* ================================================================== *
 * Scroll reveal
 * ================================================================== */

function initReveal() {
  const targets = $$('[data-reveal], [data-reveal-group]');
  if (!targets.length) return;
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-revealed'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  targets.forEach((t) => io.observe(t));
}

/* ================================================================== *
 * Boot
 * ================================================================== */

export function initShell() {
  document.body.prepend(h('div', { class: 'vignette', 'aria-hidden': 'true' }));
  document.body.prepend(h('div', { class: 'grain', 'aria-hidden': 'true' }));

  const headerHost = $('#site-header-host');
  const header = buildHeader();
  if (headerHost) headerHost.replaceWith(header);
  else document.body.prepend(header);
  initStickyHeader(header);

  const drawer = buildDrawer();
  document.body.appendChild(drawer);
  initDrawer(drawer);

  initPalette();
  initVaultBadge();
  initCompareTray();

  const footerHost = $('#site-footer-host');
  const footer = buildFooter();
  if (footerHost) footerHost.replaceWith(footer);
  else document.body.appendChild(footer);

  initReveal();
  mountScaleCanvases();

  // Vault toggles anywhere on the page.
  on(document, 'click', (e) => {
    const btn = e.target.closest('[data-vault-toggle]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.vaultToggle;
    const added = vault.toggle(id);
    btn.setAttribute('aria-pressed', String(added));
    const animal = INVENTORY.find((a) => a.id === id);
    toast(added ? `${animal ? animal.title : 'Animal'} saved to your Vault.` : 'Removed from your Vault.', added ? 'success' : 'info');
  });

  on(document, 'click', (e) => {
    const btn = e.target.closest('[data-compare-toggle]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.compareToggle;
    if (compare.has(id)) {
      compare.remove(id);
      btn.setAttribute('aria-pressed', 'false');
      return;
    }
    const res = compare.add(id);
    if (!res.ok && res.reason === 'full') {
      toast(`Comparison holds ${compare.max} animals. Remove one first.`, 'error');
      return;
    }
    btn.setAttribute('aria-pressed', 'true');
  });

  registerServiceWorker();
  clearBootSplash();
}

/**
 * Boot splash hand-off.
 *
 * The splash itself is CSS on body's pseudo-elements (see core.css) so that it
 * paints with the stylesheet rather than waiting for this module. All that is
 * left here is telling it the chrome is up.
 *
 * The floor matters: on a warm cache the shell builds in tens of milliseconds,
 * and a mark that appears and vanishes inside a single frame is a flicker, not
 * an introduction. Holding it to ~900ms from navigation start makes it read as
 * deliberate. The CSS clears itself on a timer regardless, so nothing here is
 * load-bearing — if this never runs the page still opens.
 */
const BOOT_FLOOR_MS = 900;

function clearBootSplash() {
  const done = () => document.documentElement.setAttribute('data-booted', '');
  const remaining = BOOT_FLOOR_MS - performance.now();
  if (remaining <= 0) done();
  else setTimeout(done, remaining);
}

/**
 * Service worker registration — production origins only.
 *
 * Deliberately NOT registered on localhost. The worker serves CSS and JS
 * cache-first, which is correct in production but makes local development
 * actively misleading: an edit appears to do nothing because the browser is
 * still holding the copy it cached on first visit. That cost real debugging
 * time once already.
 *
 * On localhost it does the opposite — tears down any worker and cache left
 * over from a previous visit, so a stale one cannot keep haunting the session.
 * Verify offline behaviour on a deployed preview, not here.
 *
 * Failure is silent throughout: offline support is an enhancement, not a
 * requirement.
 */
function registerServiceWorker() {
  // Truthiness, not `in`: some environments define the property and leave it
  // undefined, and `'serviceWorker' in navigator` is true for those.
  if (!navigator.serviceWorker) return;

  const isLocal = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);

  if (isLocal) {
    navigator.serviceWorker.getRegistrations?.()
      .then((regs) => {
        if (!regs.length) return;
        console.info('[V-Scale] Unregistering the service worker on localhost so cached assets cannot mask your edits.');
        return Promise.all(regs.map((r) => r.unregister()));
      })
      .then(() => (window.caches ? caches.keys() : []))
      .then((keys) => Promise.all((keys || []).map((k) => caches.delete(k))))
      .catch(() => undefined);
    return;
  }

  if (location.protocol !== 'https:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
  });
}

export { money };
