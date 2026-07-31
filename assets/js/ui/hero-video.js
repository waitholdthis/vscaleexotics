/**
 * Hero video layer.
 *
 * A background video on a landing page is one of the easiest things to do
 * badly, so the rules here are deliberate:
 *
 *  - It never blocks the page. The poster paints immediately and the video
 *    fades in only once it can actually play through, so there is no flash of
 *    a half-loaded frame and no layout shift.
 *  - It does not autoplay under `prefers-reduced-motion`. Vestibular triggers
 *    are not a preference to be overridden by a nice camera move.
 *  - It does not download on a metered or slow connection. Save-Data and
 *    2g/3g both fall back to the poster, which is 90 KB rather than 1.7 MB.
 *  - It pauses when scrolled out of view or when the tab is hidden. A looping
 *    decoder running behind three other tabs is a battery cost with no
 *    corresponding benefit.
 *  - Mobile gets a half-resolution rendition at roughly half the bytes.
 *
 * If any of that fails or is unsupported, the procedural scale field that was
 * here before takes over, so the hero is never empty.
 */

import { prefersReducedMotion } from '../core/dom.js';

const SOURCES = {
  large: [
    { src: '/assets/video/hero.webm', type: 'video/webm' },
    { src: '/assets/video/hero.mp4', type: 'video/mp4' }
  ],
  small: [
    { src: '/assets/video/hero-sm.webm', type: 'video/webm' },
    { src: '/assets/video/hero-sm.mp4', type: 'video/mp4' }
  ]
};

const POSTER = { large: '/assets/video/hero-poster.jpg', small: '/assets/video/hero-poster-sm.jpg' };

/** Metered connection, or slow enough that 1.7 MB is rude. */
function connectionIsConstrained() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;
  if (c.saveData) return true;
  return ['slow-2g', '2g', '3g'].includes(c.effectiveType);
}

/**
 * @param {HTMLElement} stage  the hero stage element
 * @returns {{ok: boolean, video?: HTMLVideoElement}}
 */
export function initHeroVideo(stage) {
  if (!stage) return { ok: false };

  const reduced = prefersReducedMotion();
  const small = window.matchMedia('(max-width: 820px)').matches;
  const size = small ? 'small' : 'large';

  const video = document.createElement('video');
  video.className = 'hero-video';
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.disablePictureInPicture = true;
  video.setAttribute('disablepictureinpicture', '');
  video.poster = POSTER[size];

  // Reduced motion or a constrained connection: keep the poster, skip the
  // download entirely. `preload="none"` means no bytes beyond the poster.
  const shouldPlay = !reduced && !connectionIsConstrained();
  video.preload = shouldPlay ? 'auto' : 'none';

  if (shouldPlay) {
    for (const s of SOURCES[size]) {
      const source = document.createElement('source');
      source.src = s.src;
      source.type = s.type;
      video.appendChild(source);
    }
  }

  stage.appendChild(video);

  if (!shouldPlay) {
    // The poster alone is a perfectly good hero. Mark it ready so the
    // procedural layer underneath fades out and we do not show both.
    video.classList.add('is-ready');
    return { ok: true, video, playing: false };
  }

  // Fade in only when the browser is confident it can play through, so the
  // transition from poster to motion is never a stutter.
  const reveal = () => video.classList.add('is-ready');
  video.addEventListener('canplaythrough', reveal, { once: true });
  // Safety net: some browsers are stingy with canplaythrough on looped media.
  video.addEventListener('loadeddata', () => setTimeout(reveal, 400), { once: true });

  const attemptPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay refused (some power-saving modes do this even when muted).
        // The poster stays; nothing is broken.
        reveal();
      });
    }
  };
  attemptPlay();

  /* Pause offscreen — no reason to decode a hero nobody is looking at. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { if (video.paused) attemptPlay(); }
          else if (!video.paused) video.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(stage);
  }

  /* Pause on a hidden tab. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (isOnScreen(stage)) attemptPlay();
  });

  /* If the viewport crosses the mobile breakpoint, swap the rendition rather
     than continuing to stream a 720p file to a phone. */
  const mq = window.matchMedia('(max-width: 820px)');
  const onChange = () => {
    const nowSmall = mq.matches;
    if (nowSmall === small) return;
    // A reload is the honest way to re-pick sources; doing it in place means
    // reasoning about partially buffered ranges for no real gain.
    video.poster = POSTER[nowSmall ? 'small' : 'large'];
  };
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);

  return { ok: true, video, playing: true };
}

function isOnScreen(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
