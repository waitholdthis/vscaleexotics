/**
 * Cinematic hero.
 *
 * A full-bleed procedural scale field rendered from a real animal's genetics,
 * crossfading slowly between the flagship animals, with a CSS-composited
 * specular sweep over the top and a parallax drift on scroll.
 *
 * The expensive part (scale rendering) happens once per animal into an
 * offscreen buffer; the per-frame work is a single drawImage and a transform,
 * so this holds 60fps on modest hardware. Under prefers-reduced-motion the
 * rotation, sweep and parallax all stop and a single still frame is shown.
 */

import { renderScales, derivePhenotype, hashString } from './scales.js';
import { GENES_BY_ID } from '../data/genes.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { prefersReducedMotion, h, render } from '../core/dom.js';

const ROTATE_MS = 9000;
const FADE_MS = 2200;

export function initHero(root, animals) {
  if (!root || !animals || !animals.length) return;

  const stage = root.querySelector('[data-hero-stage]');
  const caption = root.querySelector('[data-hero-caption]');
  if (!stage) return;

  const reduced = prefersReducedMotion();
  const layers = [makeLayer(), makeLayer()];
  layers.forEach((c) => stage.appendChild(c));

  let index = 0;
  let front = 0;
  let timer = null;
  let resizeRAF = null;

  function makeLayer() {
    const c = document.createElement('canvas');
    c.className = 'hero-canvas';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  function sizeFor() {
    const rect = stage.getBoundingClientRect();
    // Render below CSS resolution deliberately — the softness reads as depth of
    // field rather than pixelation, and it keeps the fill rate sane on 4K.
    const w = Math.max(640, Math.min(1600, Math.round(rect.width * 0.72)));
    const h = Math.max(480, Math.round((rect.height || 700) * 0.72));
    return { w, h };
  }

  function paint(canvas, animal) {
    const sp = SPECIES_BY_ID[animal.species];
    if (!sp) return;
    const { w, h: hh } = sizeFor();
    renderScales(canvas, {
      seed: hashString(animal.id),
      phenotype: derivePhenotype(sp, animal.traits, GENES_BY_ID),
      width: w,
      height: hh,
      detail: 'hero',
      iridescence:
        animal.species === 'brazilian-rainbow-boa' ? 0.4 :
        animal.species === 'reticulated-python' ? 0.3 : 0.18
    });
  }

  function writeCaption(animal) {
    if (!caption) return;
    const sp = SPECIES_BY_ID[animal.species];
    render(
      caption,
      h('span', { class: 'hero-caption__sku', text: animal.sku }),
      h('span', { class: 'hero-caption__sep', 'aria-hidden': 'true', text: '·' }),
      h('span', { class: 'hero-caption__title', text: animal.title }),
      h('span', { class: 'hero-caption__sep', 'aria-hidden': 'true', text: '·' }),
      h('em', { class: 'hero-caption__sci', text: sp ? sp.scientific : '' })
    );
    caption.setAttribute(
      'aria-label',
      `Pattern study generated from the recorded genetics of ${animal.sku}, ${animal.title}.`
    );
  }

  function show(i, immediate) {
    const animal = animals[i % animals.length];
    const back = 1 - front;
    paint(layers[back], animal);
    if (immediate) {
      layers[back].classList.add('is-visible');
      layers[front].classList.remove('is-visible');
    } else {
      layers[back].classList.add('is-visible');
      layers[front].classList.remove('is-visible');
    }
    front = back;
    writeCaption(animal);
  }

  show(0, true);

  if (!reduced && animals.length > 1) {
    timer = setInterval(() => {
      index = (index + 1) % animals.length;
      show(index, false);
    }, ROTATE_MS + FADE_MS);
  }

  // Re-render on resize, debounced — the scale field is resolution-dependent.
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastW) < 80) return;
    lastW = window.innerWidth;
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      paint(layers[front], animals[index % animals.length]);
    });
  }, { passive: true });

  // Parallax: the field drifts up at a third of scroll speed, and the copy
  // lifts and fades as it leaves. Both are transforms only, so no layout.
  if (!reduced) {
    const copy = root.querySelector('[data-hero-copy]');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y < vh * 1.2) {
          const p = y / vh;
          stage.style.setProperty('--parallax', `${y * 0.28}px`);
          stage.style.setProperty('--hero-scale', String(1 + p * 0.06));
          if (copy) {
            copy.style.setProperty('--copy-lift', `${y * -0.12}px`);
            copy.style.setProperty('--copy-fade', String(Math.max(0, 1 - p * 1.5)));
          }
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Pause the rotation when the tab is hidden — no point burning cycles.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) { clearInterval(timer); timer = null; }
    else if (!document.hidden && !timer && !reduced && animals.length > 1) {
      timer = setInterval(() => {
        index = (index + 1) % animals.length;
        show(index, false);
      }, ROTATE_MS + FADE_MS);
    }
  });
}
