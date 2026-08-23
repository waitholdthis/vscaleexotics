/**
 * Animal photographs, derived from the originals in photos/.
 *
 * WHY THIS EXISTS
 *
 * photos/ is a source folder, not a served one — nothing in the site links
 * into it, and tools/gen-brand.mjs already treats it that way for the logo.
 * Camera originals do not belong on the wire for three reasons:
 *
 *   1. Metadata. A phone photograph carries EXIF, and EXIF carries GPS. These
 *      animals live at a private address that also appears on the contact page
 *      as a county rather than a street, deliberately. Re-encoding drops every
 *      tag, so the coordinates cannot ship by accident.
 *   2. Size. Originals are whatever the camera wrote. Derived copies are sized
 *      to the slot that actually displays them.
 *   3. Naming. Knox.jpg tells a browser cache nothing. founder-knox.jpg sits
 *      beside the other served assets and reads as one.
 *
 * Deliberately NOT upscaling. Both founder photographs are 480px on the short
 * edge; stretching them to fill a 900px card would add bytes and invent no
 * detail. They are served at native size and the card crops with object-fit.
 *
 * Requires ffmpeg, as gen-brand.mjs does. Runs as part of `npm run build`.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'photos');
const OUT_DIR = join(ROOT, 'assets', 'img');

/**
 * Source → served name. Add a row when an animal gets a photograph; the
 * alt text lives with the markup, not here, because it is content.
 */
const PHOTOS = [
  { src: 'Knox.jpg', out: 'founder-knox.jpg' },
  { src: 'Knyx.jpg', out: 'founder-knyx.jpg' }
];

/** JPEG quality. 2 is ffmpeg's near-lossless end; 5 is visually clean at this size. */
const QUALITY = 4;

const kb = (n) => `${Math.round(n / 1024)}kB`;

mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
let missing = 0;

for (const { src, out } of PHOTOS) {
  const from = join(SRC_DIR, src);
  const to = join(OUT_DIR, out);

  if (!existsSync(from)) {
    console.warn(`  skip  ${src} — not found in photos/`);
    missing++;
    continue;
  }

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel', 'error',
      '-i', from,
      // -map_metadata -1 is the line that strips EXIF. Do not remove it.
      '-map_metadata', '-1',
      '-q:v', String(QUALITY),
      to
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );

  const before = statSync(from).size;
  const after = statSync(to).size;
  const delta = Math.round(((after - before) / before) * 100);
  console.log(`  ok    ${src} -> assets/img/${out}  ${kb(before)} -> ${kb(after)} (${delta >= 0 ? '+' : ''}${delta}%)`);
  written++;
}

console.log(`\n${written} photograph${written === 1 ? '' : 's'} derived${missing ? `, ${missing} missing` : ''}`);
if (missing) process.exitCode = 1;
