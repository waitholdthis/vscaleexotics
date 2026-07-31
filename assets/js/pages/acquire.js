/** Acquire page — payment table and FAQ. */

import { initShell } from '../ui/shell.js';
import { h, $, render } from '../core/dom.js';

initShell();

const PAYMENT = [
  ['Bank transfer', 'Preferred for any figure. No fee to you.'],
  ['Card', 'Domestic sales under $10,000. Processor fee at cost, shown before you pay.'],
  ['Escrow', 'Above $10,000, at our expense, on request. We would rather you felt safe than saved us a fee.'],
  ['Payment plan', 'Above $5,000. Twenty-five percent deposit, balance across three to six months. No interest, no fee. The animal stays here and is fully cared for until the final payment clears.'],
  ['What we do not accept', 'Cryptocurrency, cash on collection above the reporting threshold, or payment from a third party we have not spoken to.']
];

const FAQ = [
  {
    q: 'Will you sell to a first-time keeper?',
    a: 'For some species, gladly — a hognose or a ball python is a reasonable first snake and we would rather you started with a well-bred one. For a reticulated python, an emerald tree boa or a green tree python, no. Those are not first animals and selling you one would be doing you harm at a profit.'
  },
  {
    q: 'Can I see the animal before I commit?',
    a: 'Always. Photographs and video before any money moves, and you are welcome to visit the facility by appointment. Nobody should spend five figures on an animal they have only seen in a listing photograph.'
  },
  {
    q: 'Why is there no price on some animals?',
    a: 'On the flagship animals the figure is discussed once we have spoken. This is not a negotiating tactic — it is that the conversation determines whether we are selling at all, and quoting a number first inverts that order.'
  },
  {
    q: 'What if it stops feeding after it arrives?',
    a: 'Almost every animal skips one or two meals after a move; that is normal and not a cause for concern for several weeks. Tell us, send the weight, and we will work through it with you. If it becomes a genuine problem within the guarantee period, the guarantee applies.'
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, to countries that permit it. We handle the CITES export permit and the veterinary certificate; you handle the import permit, and nothing despatches until we have seen it. Budget six to ten weeks and $400 to $900 for the logistics.'
  },
  {
    q: 'Will you hold an animal while I build the enclosure?',
    a: 'Yes, and we prefer it. A deposit holds an animal for sixty days as standard, and we will extend that without argument if the enclosure is genuinely being built. An animal arriving into a setup that is still stabilising is the most common avoidable problem in this hobby.'
  },
  {
    q: 'Can I buy purely as an investment?',
    a: 'We will decline. Not out of principle about markets — genetics do hold value and we run a valuation tool ourselves — but because animals bought as assets tend to be housed as assets. If you want exposure to the genetics, buy a breeding pair and actually breed them.'
  },
  {
    q: 'What happens if I can no longer keep it?',
    a: 'Come back to us first. We will either take the animal back or help you place it properly. There is no time limit on this and it applies to animals we sold fifteen years ago. We would rather absorb the cost than have one of ours end up in a bad situation.'
  }
];

const payHost = $('[data-acquire-payment]');
if (payHost) {
  render(payHost, ...PAYMENT.map(([k, v]) =>
    h('div', { class: 'spec' }, h('span', { class: 'spec__k', text: k }), h('span', { class: 'spec__v', text: v }))
  ));
}

const faqHost = $('[data-acquire-faq]');
if (faqHost) {
  render(faqHost, ...FAQ.map((f) =>
    h('details', {},
      h('summary', {}, f.q),
      h('div', { class: 'accordion__body' }, h('p', { class: 'text-dim', text: f.a }))
    )
  ));

  // FAQ structured data, built from the same source as the visible content.
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });
  document.head.appendChild(ld);
}
