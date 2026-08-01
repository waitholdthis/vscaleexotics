/** Sulawesi reticulated python locality project. */
import { initShell } from '../ui/shell.js';
import { initHeroVideo } from '../ui/hero-video.js';
import { makeAnimalCanvas, mountScaleCanvases } from '../ui/scales.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';

initShell();

// The page head carries film. Everything about how it loads — poster first,
// nothing on a metered connection, nothing under prefers-reduced-motion,
// paused offscreen — is handled in hero-video.js.
const film = document.querySelector('[data-film]');
if (film) initHeroVideo(film, film.dataset.film);

const species = SPECIES_BY_ID['reticulated-python'];
const founders = {
  male: { id: 'sulawesi-founder-male', title: 'Sulawesi Founding Male', species: species.id, traits: [] },
  female: { id: 'sulawesi-founder-female', title: 'Sulawesi Founding Female', species: species.id, traits: [] }
};

for (const host of document.querySelectorAll('[data-sulawesi-founder]')) {
  const sex = host.dataset.sulawesiFounder;
  const animal = founders[sex];
  if (!animal) continue;
  const canvas = makeAnimalCanvas(animal, species, GENES_BY_ID, { width: 900, height: 680, detail: 'card' });
  canvas.setAttribute('aria-label', `Procedural wild-type reticulated python pattern study representing the founding ${sex}; not a photograph.`);
  host.replaceWith(canvas);
}

mountScaleCanvases();
