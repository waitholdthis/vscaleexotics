/** Provenance page. */

import { initShell } from '../ui/shell.js';
import { INVENTORY } from '../data/inventory.js';
import { SPECIES_BY_ID } from '../data/species.js';
import { GENES_BY_ID } from '../data/genes.js';
import { makeAnimalCanvas, mountScaleCanvases } from '../ui/scales.js';

initShell();

for (const el of document.querySelectorAll('[data-feature-canvas]')) {
  const animal = INVENTORY.find((a) => a.id === el.dataset.featureCanvas);
  if (!animal) continue;
  const sp = SPECIES_BY_ID[animal.species];
  const canvas = makeAnimalCanvas(animal, sp, GENES_BY_ID, { width: 760, height: 950, detail: 'card' });
  el.replaceWith(canvas);
}

mountScaleCanvases();
