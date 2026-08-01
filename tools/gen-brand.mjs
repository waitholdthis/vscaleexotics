/**
 * Brand assets, derived from photos/VScaleExotics_Logo.jpg.
 *
 * The supplied logo is a 150×150 JPEG on a white field. On an obsidian site
 * that cannot be used as-is, and the obvious fixes are all worse than they
 * look: keying the white deletes the black V entirely, and recolouring the
 * darks bleaches the snake's olive scaling into something the designer never
 * drew. Both were tried and rejected.
 *
 * So the mark keeps its original artwork and is presented on a bone panel —
 * the same treatment a pressed seal or a plaque gets. It is faithful, it holds
 * contrast at 32px, and bone is already in the palette.
 *
 * Outputs:
 *   brand-mark.png   the snake-and-V mark, background removed, colours intact
 *   favicon.png      64px, mark on bone
 *   icon-192/512.png PWA icons, mark on bone
 *
 * The background removal is a FLOOD FILL FROM THE EDGES, not a global colour
 * key: the artwork contains white keylines separating the V from the snake,
 * and keying every white pixel would punch holes straight through it. Those
 * keylines are meant to sit against a light field, which is exactly what the
 * bone panel gives them.
 *
 * The wordmark is deliberately NOT rastered here — it is re-set as live type
 * in the page, which is sharper than any upscale of a 150px source and lets it
 * inherit the site's own serif.
 *
 * Requires ffmpeg (used only to decode the JPEG to raw RGBA).
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'photos', 'VScaleExotics_Logo.jpg');
const OUT = join(ROOT, 'assets', 'img');

if (!existsSync(SRC)) {
  console.error(`Source logo not found: ${SRC}`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ *
 * PNG encoder with alpha (colour type 6)
 * ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------------ *
 * Decode source
 * ------------------------------------------------------------------ */

/** Decode at 6× so the flood fill and crop work on a smoother edge. */
const SCALE = 6;
const W = 150 * SCALE;
const H = 150 * SCALE;

const raw = execFileSync(
  'ffmpeg',
  ['-hide_banner', '-loglevel', 'error', '-i', SRC,
   '-vf', `scale=${W}:${H}:flags=lanczos`,
   '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'],
  { maxBuffer: 1 << 28 }
);

const px = Buffer.from(raw);
const at = (x, y) => (y * W + x) * 4;

/* ------------------------------------------------------------------ *
 * 1. Background removal — flood fill from the border
 * ------------------------------------------------------------------ */

const WHITE_CUT = 232;   // a pixel this bright in all channels is background
const SOFT_CUT = 200;    // below this it is fully opaque; between, feathered

const isBg = (i) => px[i] >= WHITE_CUT && px[i + 1] >= WHITE_CUT && px[i + 2] >= WHITE_CUT;

const bg = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) { stack.push([x, 0], [x, H - 1]); }
for (let y = 0; y < H; y++) { stack.push([0, y], [W - 1, y]); }

while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (bg[k]) continue;
  if (!isBg(at(x, y))) continue;
  bg[k] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

/* Feather: background-adjacent pixels get partial alpha from their brightness,
   which kills the hard jaggies a binary key would leave on a JPEG. */
function alphaFor(x, y) {
  const k = y * W + x;
  if (bg[k]) return 0;
  const i = at(x, y);
  const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114);
  if (lum <= SOFT_CUT) return 255;
  let touchesBg = false;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    if (bg[ny * W + nx]) { touchesBg = true; break; }
  }
  if (!touchesBg) return 255;
  return Math.max(0, Math.min(255, Math.round(255 * (1 - (lum - SOFT_CUT) / (255 - SOFT_CUT)))));
}

/* ------------------------------------------------------------------ *
 * 2. Crop to the mark — the upper artwork, excluding the wordmark, which
 *    is re-set as live type in the page rather than shipped as a raster.
 * ------------------------------------------------------------------ */

const WORDMARK_TOP = Math.round(H * 0.60);
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < WORDMARK_TOP; y++) {
  for (let x = 0; x < W; x++) {
    if (bg[y * W + x]) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const pad = Math.round(SCALE * 2);
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(WORDMARK_TOP - 1, maxY + pad);

const cw = maxX - minX + 1;
const ch = maxY - minY + 1;

/* ------------------------------------------------------------------ *
 * 3. Emit variants
 * ------------------------------------------------------------------ */

const BONE = [236, 231, 221];

function build() {
  const out = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const sx = minX + x, sy = minY + y;
      const i = at(sx, sy);
      const o = (y * cw + x) * 4;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const a = alphaFor(sx, sy);
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
    }
  }
  return out;
}

const mark = build();

/**
 * The extracted mark is 484px wide, which encodes to ~450 KB of RGBA — absurd
 * for something displayed at 32px. Emitted at 200px, which still covers a 48px
 * lockup at 4× device pixel ratio.
 */
function resize(srcRgba, sw, sh, dw) {
  const dh = Math.round((sh / sw) * dw);
  const out = Buffer.alloc(dw * dh * 4);
  const sx = sw / dw, sy = sh / dh;
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor(x * sx), x1 = Math.min(sw, Math.ceil((x + 1) * sx));
      const y0 = Math.floor(y * sy), y1 = Math.min(sh, Math.ceil((y + 1) * sy));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const s = (yy * sw + xx) * 4;
          const al = srcRgba[s + 3] / 255;
          r += srcRgba[s] * al; g += srcRgba[s + 1] * al; b += srcRgba[s + 2] * al;
          a += srcRgba[s + 3]; n++;
        }
      }
      const o = (y * dw + x) * 4;
      if (!n) continue;
      const al = a / n / 255;
      out[o] = al ? Math.round(r / n / al) : 0;
      out[o + 1] = al ? Math.round(g / n / al) : 0;
      out[o + 2] = al ? Math.round(b / n / al) : 0;
      out[o + 3] = Math.round(a / n);
    }
  }
  return { data: out, w: dw, h: dh };
}

const small = resize(mark, cw, ch, 200);
writeFileSync(join(OUT, 'brand-mark.png'), encodePNG(small.w, small.h, small.data));

/* ---- Favicon and PWA icons: mark on a bone panel ---- */

const PANEL = BONE;
function square(size, inset, srcRgba) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = PANEL[0]; out[i * 4 + 1] = PANEL[1];
    out[i * 4 + 2] = PANEL[2]; out[i * 4 + 3] = 255;
  }
  const box = Math.round(size * (1 - inset * 2));
  const scale = Math.min(box / cw, box / ch);
  const dw = Math.round(cw * scale), dh = Math.round(ch * scale);
  const ox = Math.round((size - dw) / 2), oy = Math.round((size - dh) / 2);

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      // Box-average the source region for a clean downsample.
      const x0 = Math.floor(x / scale), x1 = Math.min(cw, Math.ceil((x + 1) / scale));
      const y0 = Math.floor(y / scale), y1 = Math.min(ch, Math.ceil((y + 1) / scale));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const s = (sy * cw + sx) * 4;
          const al = srcRgba[s + 3] / 255;
          r += srcRgba[s] * al; g += srcRgba[s + 1] * al; b += srcRgba[s + 2] * al;
          a += srcRgba[s + 3]; n++;
        }
      }
      if (!n) continue;
      const alpha = a / n / 255;
      if (alpha <= 0.004) continue;
      const o = ((oy + y) * size + (ox + x)) * 4;
      // Composite over obsidian.
      out[o] = Math.round((r / n / (alpha || 1)) * alpha + PANEL[0] * (1 - alpha));
      out[o + 1] = Math.round((g / n / (alpha || 1)) * alpha + PANEL[1] * (1 - alpha));
      out[o + 2] = Math.round((b / n / (alpha || 1)) * alpha + PANEL[2] * (1 - alpha));
      out[o + 3] = 255;
    }
  }
  return out;
}


writeFileSync(join(OUT, 'favicon.png'), encodePNG(64, 64, square(64, 0.10, mark)));
writeFileSync(join(OUT, 'icon-512.png'), encodePNG(512, 512, square(512, 0.20, mark)));
writeFileSync(join(OUT, 'icon-192.png'), encodePNG(192, 192, square(192, 0.20, mark)));

console.log(`mark extracted: ${cw}×${ch}, emitted at ${small.w}×${small.h} (from a 150×150 source)`);
console.log('wrote assets/img/: brand-mark.png, favicon.png, icon-192.png, icon-512.png');
