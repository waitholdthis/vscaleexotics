/**
 * Private Concierge enquiry form.
 *
 * Security notes:
 *  - honeypot field plus a minimum time-to-submit, which between them stop the
 *    overwhelming majority of automated submissions without a CAPTCHA
 *  - every field is length-capped and validated client side; the server must
 *    revalidate, and the README says so
 *  - the submitted payload is assembled from typed values only and rendered
 *    back to the user with textContent, never markup
 *  - if no endpoint is configured the form degrades to a pre-filled mail link
 *    rather than silently losing the enquiry
 */

import { initShell, toast } from '../ui/shell.js';
import { h, $, render, icon } from '../core/dom.js';
import { INVENTORY_BY_ID } from '../data/inventory.js';
import { SPECIES } from '../data/species.js';
import { SITE } from '../core/sitemap.js';
import { US_STATES } from '../engine/shipping.js';
import { COUNTRIES } from '../engine/legality.js';
import { vault } from '../core/store.js';

initShell();

const ENDPOINT = '/api/enquiry';
const MIN_FILL_MS = 3500;
const openedAt = Date.now();

const params = new URLSearchParams(location.search);
const preAnimal = params.get('animal');
const preselected = preAnimal && Object.prototype.hasOwnProperty.call(INVENTORY_BY_ID, preAnimal) ? INVENTORY_BY_ID[preAnimal] : null;

const LIMITS = { name: 80, email: 120, phone: 32, location: 80, keeping: 2000, looking: 2000, budget: 40 };

const EXPERIENCE = [
  ['first', 'This would be my first snake'],
  ['some', 'A few years, common species'],
  ['experienced', 'Experienced — multiple species, several years'],
  ['breeder', 'I breed'],
  ['professional', 'Professional / facility']
];

const TIMEFRAME = [
  ['now', 'Ready now'],
  ['3m', 'Within three months'],
  ['season', 'Next season'],
  ['watching', 'Just watching the market']
];

/* ------------------------------------------------------------------ */

const formHost = $('[data-concierge-form]');
const asideHost = $('[data-concierge-aside]');

function field(name, label, opts = {}) {
  const id = `f-${name}`;
  const el = opts.textarea
    ? h('textarea', { class: 'textarea', id, name, maxlength: String(LIMITS[name] || 500), placeholder: opts.placeholder || '', required: opts.required ? '' : null })
    : h('input', {
        class: 'input', id, name,
        type: opts.type || 'text',
        maxlength: String(LIMITS[name] || 120),
        placeholder: opts.placeholder || '',
        autocomplete: opts.autocomplete || 'off',
        required: opts.required ? '' : null
      });
  if (opts.value) el.value = opts.value;

  return h(
    'div',
    { class: 'field' },
    h('label', { class: 'field__label', for: id }, label, opts.required ? h('span', { style: { color: 'var(--brass)' }, text: ' *' }) : null),
    el,
    opts.hint ? h('p', { class: 'field__hint', text: opts.hint }) : null,
    h('p', { class: 'field__error', id: `${id}-error`, hidden: '' })
  );
}

function selectField(name, label, options, opts = {}) {
  const id = `f-${name}`;
  return h(
    'div',
    { class: 'field' },
    h('label', { class: 'field__label', for: id }, label, opts.required ? h('span', { style: { color: 'var(--brass)' }, text: ' *' }) : null),
    h(
      'select',
      { class: 'select', id, name, required: opts.required ? '' : null },
      ...options.map(([v, t]) => h('option', { value: v, text: t, selected: opts.value === v ? '' : null }))
    ),
    opts.hint ? h('p', { class: 'field__hint', text: opts.hint }) : null
  );
}

function buildForm() {
  const savedIds = vault.list();
  const saved = savedIds.map((id) => INVENTORY_BY_ID[id]).filter(Boolean);

  const form = h(
    'form',
    { class: 'stack stack--lg', novalidate: '', autocomplete: 'on' },

    h(
      'section',
      { class: 'form-section' },
      h('p', { class: 'form-section__title', text: 'You' }),
      h(
        'div',
        { class: 'form-grid form-grid--2' },
        field('name', 'Name', { required: true, autocomplete: 'name' }),
        field('email', 'Email', { required: true, type: 'email', autocomplete: 'email' }),
        field('phone', 'Phone', { type: 'tel', autocomplete: 'tel', hint: 'Optional. Useful for anything above five figures.' }),
        field('location', 'City', { required: true, autocomplete: 'address-level2' })
      ),
      h(
        'div',
        { class: 'form-grid form-grid--2', style: { 'margin-top': '1.5rem' } },
        selectField('country', 'Country', [['US', 'United States'], ...COUNTRIES.filter((c) => c.ships).map((c) => [c.code, c.name]), ['other', 'Elsewhere']], { required: true }),
        selectField('state', 'State (US only)', [['', '—'], ...US_STATES.map(([c, n]) => [c, n])], { hint: 'We check legality before quoting.' })
      )
    ),

    h(
      'section',
      { class: 'form-section' },
      h('p', { class: 'form-section__title', text: 'Your experience' }),
      selectField('experience', 'How long have you been keeping?', EXPERIENCE, { required: true }),
      h('div', { style: { 'margin-top': '1.5rem' } },
        field('keeping', 'What do you keep now?', {
          textarea: true,
          placeholder: 'Species, how long, enclosure type and dimensions, how they are heated…',
          hint: 'Be specific about enclosures. This is the part that determines whether we can sell you what you are asking for.'
        }))
    ),

    h(
      'section',
      { class: 'form-section' },
      h('p', { class: 'form-section__title', text: 'What you are looking for' }),
      preselected
        ? h(
            'div',
            { class: 'notice notice--note', style: { 'margin-bottom': '1.5rem' } },
            icon('info', 'notice__icon'),
            h('span', {}, h('strong', { text: 'Enquiring about ' }), h('strong', { text: `${preselected.sku} — ${preselected.title}` }), '. Anything you add below is extra context.')
          )
        : null,
      saved.length
        ? h(
            'div',
            { class: 'notice', style: { 'margin-bottom': '1.5rem' } },
            icon('bookmark', 'notice__icon'),
            h(
              'span',
              {},
              h('strong', { text: `${saved.length} animal${saved.length === 1 ? '' : 's'} in your Vault. ` }),
              'We will include the list with your enquiry: ',
              saved.map((a) => a.sku).join(', ')
            )
          )
        : null,
      h(
        'div',
        { class: 'form-grid form-grid--2' },
        selectField('species', 'Species of interest', [['any', 'Open to suggestions'], ...SPECIES.map((s) => [s.id, s.common])]),
        selectField('timeframe', 'Timeframe', TIMEFRAME, { required: true })
      ),
      h('div', { style: { 'margin-top': '1.5rem' } },
        field('budget', 'Budget', { placeholder: 'e.g. up to $8,000, or open', hint: 'Genuinely useful. It stops us showing you things that are not relevant.' })),
      h('div', { style: { 'margin-top': '1.5rem' } },
        field('looking', 'Describe the animal', {
          textarea: true, required: true,
          value: preselected ? `Enquiring about ${preselected.sku} — ${preselected.title}.\n\n` : '',
          placeholder: 'Genetics, sex, expression, whether it is for a project or a display animal…'
        }))
    ),

    h(
      'section',
      { class: 'form-section' },
      h('p', { class: 'form-section__title', text: 'Confirmations' }),
      h(
        'div',
        { class: 'stack stack--sm' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'legal', required: '' }),
          h('span', { text: 'I have checked that the species I am asking about is legal to keep at my address, at state and local level.' })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'enclosure', required: '' }),
          h('span', { text: 'I understand you may decline the sale if the enclosure I describe is not adequate.' })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'contact', required: '' }),
          h('span', { text: 'You may contact me about this enquiry. You will not add me to a mailing list.' }))
      )
    ),

    // Honeypot — off-screen, hidden from assistive technology, never filled by a human.
    h(
      'div',
      { class: 'hp-field', 'aria-hidden': 'true' },
      h('label', { for: 'f-website', text: 'Website' }),
      h('input', { id: 'f-website', name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' })
    ),

    h('div', { class: 'field__error', id: 'form-error', hidden: '' }),
    h(
      'div',
      { class: 'cluster', style: { 'margin-top': '1rem' } },
      h('button', { class: 'btn btn--primary btn--lg', type: 'submit' }, 'Send enquiry'),
      h('p', { class: 'field__hint', style: { margin: '0' }, text: 'We answer every enquiry within two working days.' })
    )
  );

  form.addEventListener('submit', (e) => onSubmit(e, form, saved));
  return form;
}

/* ------------------------------------------------------------------ */

function setError(form, name, message) {
  const input = form.querySelector(`[name="${name}"]`);
  const err = form.querySelector(`#f-${name}-error`);
  if (!input) return;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (err) {
    err.textContent = message || '';
    err.hidden = !message;
    input.setAttribute('aria-describedby', message ? `f-${name}-error` : '');
  }
}

function validate(form) {
  const data = new FormData(form);
  const errors = [];
  const get = (k) => String(data.get(k) || '').trim();

  for (const [name, label] of [['name', 'Your name'], ['location', 'Your city'], ['looking', 'A description of what you want']]) {
    setError(form, name, '');
    if (!get(name)) { setError(form, name, `${label} is required.`); errors.push(name); }
  }

  const email = get('email');
  setError(form, 'email', '');
  if (!email) { setError(form, 'email', 'An email address is required.'); errors.push('email'); }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > LIMITS.email) {
    setError(form, 'email', 'That does not look like a valid email address.');
    errors.push('email');
  }

  for (const box of ['legal', 'enclosure', 'contact']) {
    if (!data.get(box)) errors.push(box);
  }

  if (get('country') === 'US' && !get('state')) {
    errors.push('state');
  }

  return errors;
}

async function onSubmit(e, form, saved) {
  e.preventDefault();
  const formError = form.querySelector('#form-error');
  formError.hidden = true;

  // Bot checks. Both fail silently to a generic message — telling an automated
  // client exactly which check it failed only helps it.
  const data = new FormData(form);
  if (String(data.get('website') || '').length > 0 || Date.now() - openedAt < MIN_FILL_MS) {
    formError.textContent = 'Could not send that enquiry. Please try again in a moment.';
    formError.hidden = false;
    return;
  }

  const errors = validate(form);
  if (errors.length) {
    formError.textContent =
      errors.some((x) => ['legal', 'enclosure', 'contact'].includes(x))
        ? 'Please complete the required fields and tick all three confirmations.'
        : 'Please correct the highlighted fields.';
    formError.hidden = false;
    const first = form.querySelector(`[name="${errors[0]}"]`);
    first?.focus();
    return;
  }

  const payload = {};
  for (const [k, v] of data.entries()) {
    if (k === 'website') continue;
    payload[k] = String(v).slice(0, LIMITS[k] || 200);
  }
  payload.vault = saved.map((a) => a.sku);
  if (preselected) payload.animal = preselected.sku;

  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.setAttribute('aria-disabled', 'true');
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(String(res.status));
    showSuccess(payload);
  } catch {
    // No endpoint wired up, or it is down. Do not lose the enquiry.
    showFallback(payload);
  } finally {
    submitBtn.removeAttribute('aria-disabled');
    submitBtn.textContent = 'Send enquiry';
  }
}

function enquiryText(payload) {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Location: ${payload.location}, ${payload.state || ''} ${payload.country}`.replace(/\s+/g, ' ').trim(),
    `Experience: ${payload.experience}`,
    `Timeframe: ${payload.timeframe}`,
    payload.budget ? `Budget: ${payload.budget}` : null,
    payload.species && payload.species !== 'any' ? `Species: ${payload.species}` : null,
    payload.animal ? `Animal: ${payload.animal}` : null,
    payload.vault?.length ? `Vault: ${payload.vault.join(', ')}` : null,
    '',
    'Currently keeping:',
    payload.keeping || '(not stated)',
    '',
    'Looking for:',
    payload.looking
  ];
  return lines.filter((l) => l !== null).join('\n');
}

function showSuccess(payload) {
  render(
    formHost,
    h(
      'div',
      { class: 'panel panel--brass', role: 'status' },
      h('p', { class: 'eyebrow', text: 'Received' }),
      h('h2', { style: { 'font-size': 'var(--t-xl)', margin: '1rem 0' }, text: 'Thank you — we have your enquiry' }),
      h('p', { class: 'text-dim', text: `We answer every enquiry within two working days, usually the same day. It will come from ${SITE.email}, so check your spam folder if you do not see it.` }),
      h('div', { class: 'cluster', style: { 'margin-top': '2rem' } },
        h('a', { class: 'btn', href: '/collection.html', text: 'Back to the collection' }),
        h('a', { class: 'btn btn--ghost', href: '/tools.html', text: 'Explore the tools' }))
    )
  );
  toast('Enquiry sent.', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFallback(payload) {
  const body = enquiryText(payload);
  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent('Private enquiry — ' + payload.name)}&body=${encodeURIComponent(body)}`;

  render(
    formHost,
    h(
      'div',
      { class: 'panel', role: 'status' },
      h('p', { class: 'eyebrow', text: 'One more step' }),
      h('h2', { style: { 'font-size': 'var(--t-xl)', margin: '1rem 0' }, text: 'Send this from your mail client' }),
      h('p', { class: 'text-dim', text: 'We could not reach the enquiry service just now. Your enquiry is not lost — everything you typed is below. Send it directly and we will pick it up.' }),
      h('div', { class: 'cluster', style: { margin: '1.5rem 0' } },
        h('a', { class: 'btn btn--primary', href: mailto, text: 'Open in mail client' }),
        h('button', {
          class: 'btn', type: 'button',
          on: {
            click: async (e) => {
              try {
                await navigator.clipboard.writeText(body);
                toast('Enquiry copied to your clipboard.', 'success');
              } catch {
                toast('Select the text below and copy it manually.', 'error');
              }
            }
          }
        }, 'Copy to clipboard')),
      h('pre', {
        class: 'mono',
        style: {
          'white-space': 'pre-wrap', 'word-break': 'break-word', background: 'var(--ink)',
          border: '1px solid var(--line-soft)', 'border-radius': 'var(--radius)',
          padding: '1rem', 'font-size': 'var(--t-xs)', color: 'var(--bone-dim)', 'max-height': '22rem', 'overflow-y': 'auto'
        },
        text: body
      })
    )
  );
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ */

if (formHost) render(formHost, buildForm());

if (asideHost) {
  render(
    asideHost,
    h(
      'div',
      { class: 'panel sticky-aside' },
      h('p', { class: 'eyebrow', text: 'Direct' }),
      h('p', { style: { 'margin-top': '1rem' } }, h('a', { class: 'link', href: `mailto:${SITE.email}`, text: SITE.email })),
      h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)', 'margin-top': '.5rem' }, text: SITE.hours }),
      h('p', { class: 'text-muted', style: { 'font-size': 'var(--t-sm)' }, text: `${SITE.locality}, ${SITE.region}` }),
      h('hr', { style: { border: '0', 'border-top': '1px solid var(--line-soft)', margin: '1.5rem 0' } }),
      h('p', { class: 'eyebrow eyebrow--muted', text: 'What happens next' }),
      h(
        'ol',
        { class: 'footer-list', style: { 'margin-top': '1rem', 'padding-left': '1rem', 'list-style': 'decimal' } },
        h('li', {}, h('span', { class: 'text-muted', text: 'We read it properly and reply within two working days.' })),
        h('li', {}, h('span', { class: 'text-muted', text: 'If we have something, we send photographs and video before anything else.' })),
        h('li', {}, h('span', { class: 'text-muted', text: 'If we do not, we say so — and tell you who might.' })),
        h('li', {}, h('span', { class: 'text-muted', text: 'No follow-up sequence, no newsletter, no chasing.' }))
      )
    ),
    h(
      'div',
      { class: 'notice notice--note' },
      icon('shield', 'notice__icon'),
      h('span', {}, h('strong', { text: 'What happens to this. ' }), 'Your enquiry goes to our own mail infrastructure over TLS. It is not passed to a CRM, an advertising platform, or anyone else. Ask us to delete it and we will, the same day.')
    )
  );
}
