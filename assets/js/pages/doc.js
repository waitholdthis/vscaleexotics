/**
 * Policy documents.
 *
 * Content lives here as structured data so the four policy pages share one
 * renderer and one voice. Written to be read and used, not to be unenforceable.
 */

import { initShell } from '../ui/shell.js';
import { h, $, render } from '../core/dom.js';
import { SITE } from '../core/sitemap.js';
import { CARRIER_RULES } from '../engine/shipping.js';

initShell();

const EFFECTIVE = '1 July 2026';

const DOCS = {
  'health-guarantee': {
    updated: EFFECTIVE,
    sections: [
      {
        h: 'What is guaranteed',
        p: [
          'Every animal we place is guaranteed to arrive alive, in the condition described, feeding on the schedule stated in its record, and free of parasites, respiratory infection and any congenital defect that would affect its welfare.',
          'That guarantee runs for thirty days from delivery. It is not a returns window — it is a period during which, if something is wrong with the animal that was wrong when it left here, we make it right.'
        ]
      },
      {
        h: 'What "making it right" means',
        p: [
          'In order of preference: we cover the cost of veterinary treatment with a qualified reptile veterinarian; we replace the animal with one of equivalent genetics and quality when the next comparable one is produced; or we refund in full, including what you paid for shipping.',
          'You choose which, not us. We have never argued about this and we do not intend to start.'
        ]
      },
      {
        h: 'What voids it',
        p: [
          'Husbandry that falls outside the specification supplied with the animal. If the enclosure was twenty degrees cold or the humidity was at thirty percent for a rainforest species, the animal\'s decline is not something we caused.',
          'Introduction to an existing collection without completing quarantine. If an animal we sent gets sick in week three after being housed next to something you already owned, we cannot distinguish our problem from yours — and neither can you.',
          'Any injury or illness arising after the animal has been handled by a third party, rehomed, or bred.',
          'Failure to be present for delivery, or to collect within six hours where hold-at-facility was elected.'
        ]
      },
      {
        h: 'What we ask of you',
        p: [
          'Photograph the sealed box before opening it, and the animal in situ before removing it. Two photographs, thirty seconds. Without them a carrier claim cannot be processed and we cannot recover the loss on your behalf, which means we absorb it — we will still honour the guarantee, but you will have made it considerably harder for us.',
          'Tell us within two hours of the delivery scan if something is wrong. Not two days. Reptiles decline fast enough that the difference is material.',
          'Weigh the animal on arrival and again at day seven. If you contact us about a problem, that pair of numbers is the most useful thing you can send.'
        ]
      },
      {
        h: 'Congenital defects',
        p: [
          'Some genes carry known structural risk. Homozygous forms of the Cinnamon and Black Pastel locus have an elevated rate of vertebral kinking and duckbill; we do not produce or place them, and we say so on the gene records.',
          'If a defect appears in an animal we sold that was not disclosed and not visible at the time of sale, the guarantee applies without a time limit. Kinking that develops during growth is our problem regardless of when it becomes obvious.'
        ]
      },
      {
        h: 'What we will not do',
        p: [
          'We will not sell you an animal we would not keep ourselves. We will not describe a hatchling\'s adult appearance as a certainty when the gene takes three years to finish. And we will decline a sale outright if the setup you describe is not one the animal can live well in — that is not a guarantee term, it is the reason the guarantee is rarely needed.'
        ]
      }
    ]
  },

  'shipping-policy': {
    updated: EFFECTIVE,
    sections: [
      {
        h: 'Carrier and service',
        p: [
          `Live reptiles move on ${CARRIER_RULES.service} and nothing else. It is a federal offence to ship reptiles via USPS, and no ground service is ever acceptable regardless of distance or season.`,
          `We despatch ${CARRIER_RULES.shipDayLabel}, cut-off ${CARRIER_RULES.cutoff}, so that no animal can be caught in a facility over a weekend.`
        ]
      },
      {
        h: 'Temperature limits',
        p: [
          `Doorstep delivery requires transit temperatures between ${CARRIER_RULES.safeRange[0]} and ${CARRIER_RULES.safeRange[1]}°F at both ends and through the hub network. Electing hold-at-facility widens that to ${CARRIER_RULES.holdRange[0]} to ${CARRIER_RULES.holdRange[1]}°F, because the animal is never left outside.`,
          `A 72-hour heat pack is added below ${CARRIER_RULES.heatPackBelow}°F and a phase-change cold pack above ${CARRIER_RULES.coldPackAbove}°F. Both are packed so the animal cannot come into direct contact with them.`,
          'Use the Ship Window tool to check any destination and date before ordering.'
        ]
      },
      {
        h: 'Weather holds',
        p: [
          'If conditions move outside the band between your order and the despatch date, we hold the animal here at no charge and rebook at the first clear window. We do not ship into a marginal forecast to meet a date, and we will not do it because you ask us to.',
          'We have never lost an animal in transit. That is the direct result of this policy and not of luck.'
        ]
      },
      {
        h: 'Live arrival guarantee',
        p: [
          'Valid where someone is present to receive the package, or where hold-at-facility was elected and the animal is collected within six hours of arrival scan.',
          'Requires photographs of the sealed box and the animal in situ before removal, and notification to the office within two hours of the delivery scan.',
          'Where the guarantee applies, we refund in full including shipping, or replace the animal, at your election.'
        ]
      },
      {
        h: 'International',
        p: [
          'We ship worldwide to destinations that permit it. Most of what we place is CITES Appendix II listed, which requires a CITES export permit from our side and a matching import permit from yours.',
          'We handle the export permit and the veterinary health certificate. You are responsible for the import permit, and nothing despatches until we have seen it. Expect six to ten weeks from deposit to despatch on an international placement.',
          'Australia, New Zealand and Singapore prohibit private snake keeping. We decline those enquiries.'
        ]
      },
      {
        h: 'Costs',
        p: [
          'Domestic overnight shipping runs from $65 for a small animal to $180 for a large insulated box. International is quoted per shipment and typically runs $400 to $900 including permits and veterinary certification.',
          'Shipping is quoted before you pay, not added afterwards.'
        ]
      }
    ]
  },

  terms: {
    updated: EFFECTIVE,
    sections: [
      {
        h: 'Who we sell to',
        p: [
          'We speak to every buyer before despatch. That conversation is not a formality — it is where we establish that the enclosure exists, that the species is legal where you live, and that you understand what you are taking on.',
          'We reserve the right to decline any sale for any reason, and we exercise it. Being able to pay is not, by itself, qualification to keep a reticulated python.',
          'Buyers must be eighteen or over.'
        ]
      },
      {
        h: 'Reservation and deposit',
        p: [
          'A twenty-five percent deposit reserves an animal for up to sixty days. Deposits are non-refundable after seven days, because a reserved animal is withdrawn from the market and we turn away other buyers for it.',
          'Within the first seven days, a deposit is refundable in full for any reason.',
          'Where a shipping window forces a delay beyond sixty days, the reservation extends at no cost until the window opens.'
        ]
      },
      {
        h: 'Payment',
        p: [
          'Balance is due before despatch. We accept bank transfer, and for domestic sales under ten thousand dollars, card. Card payments carry the processor\'s fee at cost.',
          'For animals above ten thousand dollars we use escrow at our expense, on request.',
          'Payment plans are available on animals above five thousand dollars: twenty-five percent deposit and the balance across three to six months, with the animal remaining here and fully cared for until the final payment clears. There is no interest and no fee.'
        ]
      },
      {
        h: 'Title and risk',
        p: [
          'Title passes on final payment. Risk passes on delivery, not on despatch — an animal in transit is our risk, which is the whole point of the live arrival guarantee.'
        ]
      },
      {
        h: 'Your obligations',
        p: [
          'You are responsible for confirming that the species is legal to keep at your address, at state and municipal level. The Legality Check tool is a research aid and not a legal opinion. We will ask you to attest that you have confirmed it.',
          'For international placements you are responsible for the import permit and any national licensing.',
          'Animals are sold as pets and for private breeding. They are not sold for release, for public exhibition without appropriate licensing, or for resale as unrepresented stock.'
        ]
      },
      {
        h: 'Representations',
        p: [
          'Genetics are represented as documented. Where a heterozygous trait is confirmed by pedigree rather than by test breeding, we say so on the record and on the invoice.',
          'Where a gene takes years to express fully — Desert Ghost being the clearest example — we represent the animal on its own current phenotype and its parents\' documented progression. We do not guarantee an adult appearance.',
          'Polygenic and locality traits are never represented as heritable in fixed ratios, because they are not.'
        ]
      },
      {
        h: 'Disputes',
        p: [
          'Talk to us first. In seventeen years we have not had a dispute reach a third party, and that is because we would rather absorb a cost than argue about one.',
          `Governed by the laws of the State of ${SITE.region}.`
        ]
      }
    ]
  },

  privacy: {
    updated: EFFECTIVE,
    sections: [
      {
        h: 'The short version',
        p: [
          'This site sets no cookies. It loads no third-party code. It runs no analytics, no tag manager, no pixel, no session recorder and no advertising network. There is nothing to consent to, which is why there is no consent banner.',
          'Every tool on this site computes in your browser. Nothing you type into the Gene Lab, the Valuation Index or any other tool is transmitted anywhere.'
        ]
      },
      {
        h: 'What is stored on your device',
        p: [
          'Your Vault, your comparison tray, your display preferences and your quarantine checklist progress are stored in your browser\'s local storage. They never leave your device. Clearing your browser data removes them permanently and we cannot restore them, because we never had them.',
          'The stored values are animal identifiers and preference settings. No personal information of any kind is written to local storage.'
        ]
      },
      {
        h: 'What we collect when you contact us',
        p: [
          'When you submit an enquiry we receive what you typed into the form: your name, your contact details, your location, and whatever you told us about your experience and what you are looking for.',
          'We use it to answer you. We keep it for as long as we are in conversation and for two years afterwards, so that when you come back we remember what we discussed. We do not sell it, share it, or send you marketing you did not ask for.',
          'Ask us to delete it and we will, the same day.'
        ]
      },
      {
        h: 'Sale records',
        p: [
          'For animals we have actually placed, we retain the sale record, the lineage documentation and the shipping record indefinitely. This is deliberate: if an animal we bred in 2011 turns up needing its papers, we can produce them. That retention is a service to the animal and to whoever holds it, and it is the one thing on this page we will not delete on request.'
        ]
      },
      {
        h: 'Security posture',
        p: [
          'The site is served with a strict Content Security Policy permitting no external origins at all, HTTP Strict Transport Security, and a full set of hardening headers. There are no runtime dependencies, so there is no third-party supply chain to compromise.',
          'Form submissions travel over TLS to our own mail infrastructure. Payment is handled by bank transfer or by a PCI-compliant processor; we never see or store card details.'
        ]
      },
      {
        h: 'Your rights',
        p: [
          `Wherever you are, you can ask what we hold, ask for a copy, ask for corrections, or ask us to delete it. Write to ${SITE.email} and we will act within seven days rather than the thirty the law allows.`,
          'If you are in the UK or EU, the lawful basis for holding enquiry data is legitimate interest in responding to you, and for sale records it is contractual necessity and legal obligation.'
        ]
      },
      {
        h: 'Reporting a vulnerability',
        p: [
          'If you find a security issue on this site, we want to hear about it and we will not be difficult about it. Details are in our security.txt and SECURITY.md.'
        ]
      }
    ]
  }
};

const host = $('[data-doc]');
if (host) {
  const key = host.dataset.doc;
  const doc = Object.prototype.hasOwnProperty.call(DOCS, key) ? DOCS[key] : null;

  if (!doc) {
    render(host, h('p', { class: 'text-muted', text: 'Document not found.' }));
  } else {
    render(
      host,
      h('p', { class: 'doc__meta', text: `Effective ${doc.updated}` }),
      ...doc.sections.flatMap((s) => [h('h2', { text: s.h }), ...s.p.map((p) => h('p', { text: p }))]),
      h(
        'div',
        { class: 'notice notice--note', style: { 'margin-top': '3rem' } },
        h('span', {}, 'Questions about any of this go to ', h('a', { class: 'link', href: `mailto:${SITE.email}`, text: SITE.email }), '. We answer them properly.')
      )
    );
  }
}
