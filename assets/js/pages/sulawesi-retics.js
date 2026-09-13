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
       + 'Gold and olive dorsal pattern with white-centred flank markings and a pale head.',
    video: null
  },
  female: {
    name: 'Knyx',
    src: '/assets/img/founder-knyx.jpg',
    width: 640,
    height: 480,
    alt: 'Knyx, the founding female Sulawesi reticulated python, resting on substrate with her '
       + 'head extended. Dark chain patterning over gold flanks and a bright yellow head.',
    video: null
  }
};

/**
 * Founder video slot.
 *
 * When a real clip is ready, place its served copy in assets/video/ and change
 * that founder's `video` value above from null to, for example:
 *
 *   video: {
 *     mp4: '/assets/video/knox-field-note-01.mp4',
 *     webm: '/assets/video/knox-field-note-01.webm'
 *   }
 *
 * The page deliberately keeps the verified photograph in the slot until then.
 * A habitat render or unrelated snake must never stand in for either founder.
 */
function founderVideo(founder) {
  if (!founder.video) {
    return h('div', { class: 'founder-film-placeholder' },
      h('img', {
        src: founder.src,
        alt: '',
        width: String(founder.width),
        height: String(founder.height),
        loading: 'lazy',
        decoding: 'async'
      }),
      h('span', { class: 'founder-film-placeholder__status', text: 'Video forthcoming' })
    );
  }

  const video = h('video', {
    class: 'founder-film-video',
    controls: '',
    playsinline: '',
    preload: 'metadata',
    poster: founder.src,
    'aria-label': `${founder.name}, Sulawesi reticulated python — field note video`
  });
  if (founder.video.webm) video.appendChild(h('source', { src: founder.video.webm, type: 'video/webm' }));
  if (founder.video.mp4) video.appendChild(h('source', { src: founder.video.mp4, type: 'video/mp4' }));
  return video;
}

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

let pendingVideos = 0;
for (const host of document.querySelectorAll('[data-sulawesi-video]')) {
  const founder = FOUNDERS[host.dataset.sulawesiVideo];
  if (!founder) continue;
  if (!founder.video) pendingVideos++;
  host.appendChild(founderVideo(founder));
}

const videoNote = document.querySelector('[data-sulawesi-video-note]');
if (videoNote && pendingVideos === 0) videoNote.textContent = 'Recorded on site and presented without filters or playback tricks.';
else if (videoNote && pendingVideos === 1) videoNote.textContent = 'One founder film is live; the second will be added when its field note is ready.';

mountScaleCanvases();
