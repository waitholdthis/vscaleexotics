/** Journal index. */

import { initShell } from '../ui/shell.js';
import { h, $, render } from '../core/dom.js';
import { JOURNAL } from '../data/journal.js';
import { date } from '../core/format.js';
import { SITE } from '../core/sitemap.js';

initShell();

const host = $('[data-journal-full]');
if (host) {
  render(
    host,
    ...JOURNAL.map((j) =>
      h(
        'article',
        { class: 'article-row', id: j.id },
        h('p', { class: 'article-row__date', text: date(j.date) }),
        h(
          'div',
          {},
          h('h2', { class: 'article-row__title', text: j.title }),
          h('p', { class: 'article-row__excerpt', text: j.excerpt }),
          h('p', { class: 'stat__note', style: { 'margin-top': '.75rem' }, text: `${j.readMinutes} minute read` })
        ),
        h('p', { class: 'article-row__tag', text: j.tag })
      )
    ),
    h(
      'div',
      { class: 'notice notice--note', style: { 'margin-top': '3rem' } },
      h(
        'span',
        {},
        h('strong', { text: 'Full pieces on request. ' }),
        'These are working notes rather than a publishing schedule. If one of them is relevant to something you are deciding, write to ',
        h('a', { class: 'link', href: `mailto:${SITE.email}`, text: SITE.email }),
        ' and we will send it to you in full.'
      )
    )
  );

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VScale Exotics Journal',
    url: `${SITE.origin}/journal.html`,
    publisher: { '@type': 'Organization', name: SITE.legalName },
    blogPost: JOURNAL.map((j) => ({
      '@type': 'BlogPosting',
      headline: j.title,
      datePublished: j.date,
      description: j.excerpt,
      url: `${SITE.origin}/journal.html#${j.id}`,
      author: { '@type': 'Organization', name: SITE.legalName }
    }))
  });
  document.head.appendChild(ld);
}
