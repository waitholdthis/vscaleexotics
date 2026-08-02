/**
 * Boot splash gate.
 *
 * Classic, render-blocking, and in the <head> on purpose — all three are the
 * point. The splash is CSS on body's pseudo-elements, so it is on screen the
 * instant the stylesheet applies. Anything that decides whether to show it
 * therefore has to run before the body paints, and a module (deferred by
 * definition) or the shell bundle would both arrive too late to do anything
 * but produce the flash it is meant to prevent.
 *
 * It costs one small same-origin request, cached after the first page. That is
 * the price of the decision happening early enough to matter.
 *
 * The splash marks a session starting, not a page loading. Every internal link
 * here is a full document load, so without this the seal would replay on every
 * click — which is a tax on the visitor, not an introduction. sessionStorage is
 * the right scope: it survives navigation within a tab and dies with it, so a
 * new tab or a return visit later gets the opening again.
 *
 * If storage is unavailable — private modes, storage disabled — nothing is
 * recorded and the splash simply plays each time. That is the previous
 * behaviour, which is a fine thing to fall back to.
 */
(function () {
  var KEY = 'vscale:booted';
  var root = document.documentElement;

  try {
    if (sessionStorage.getItem(KEY) === '1') {
      // Not "clear it now" — never paint it. A fade-out on a repeat
      // navigation is the flicker this exists to avoid.
      root.setAttribute('data-boot', 'skip');
      return;
    }
    sessionStorage.setItem(KEY, '1');
  } catch (err) {
    /* No storage: play the splash every time rather than never. */
  }
})();
