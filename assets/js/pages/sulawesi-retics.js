/** Sulawesi reticulated python locality project. */
import { initShell } from '../ui/shell.js';
import { initHeroVideo } from '../ui/hero-video.js';
import { mountScaleCanvases } from '../ui/scales.js';
import { h } from '../core/dom.js';

initShell();

// The page head carries film. Everything about how it loads — poster first,
// nothing on a metered connection, nothing under prefers-reduced-motion,
// paused offscreen — is handled in hero-video.js.
const film = document.querySelector('[data-film]');
if (film) initHeroVideo(film, film.dataset.film);

/**
 * The founders are photographed now, so the cards carry photographs.
 *
 * They used to render a procedural pattern study from scales.js, captioned
 * "not a photograph" because there was nothing else honest to put there. That
 * placeholder has done its job. A generated wild-type pattern standing in for
 * a real animal on a page whose entire argument is documentation was always
 * the weakest thing here.
 *
 * Sources live in photos/; the served copies are derived by
 * tools/gen-photos.mjs, which strips EXIF on the way through.
 */
const FOUNDERS = {
  male: {
    name: 'Knox',
    src: '/assets/img/founder-knox.jpg',
    width: 480,
    height: 640,
    alt: 'Knox, the founding male Sulawesi reticulated python, coiled and viewed from above. '
       + 'Gold and olive dorsal pattern with white-centred flank markings and a pale head.'
  },
  female: {
    name: 'Knyx',
    src: '/assets/img/founder-knyx.jpg',
    width: 640,
    height: 480,
    alt: 'Knyx, the founding female Sulawesi reticulated python, resting on substrate with her '
       + 'head extended. Dark chain patterning over gold flanks and a bright yellow head.'
  }
};

for (const host of document.querySelectorAll('[data-sulawesi-founder]')) {
  const founder = FOUNDERS[host.dataset.sulawesiFounder];
  if (!founder) continue;
  host.appendChild(h('img', {
    class: 'founder-card__photo',
    src: founder.src,
    alt: founder.alt,
    width: String(founder.width),
    height: String(founder.height),
    loading: 'lazy',
    decoding: 'async'
  }));
}

mountScaleCanvases();
