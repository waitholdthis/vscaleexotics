/**
 * Generates the favicon (SVG) and the Open Graph card (PNG).
 *
 * The PNG is written with a hand-rolled encoder using node's zlib, because the
 * whole point of this project is having no dependency tree — pulling in an
 * image library to produce one 1200×630 card would undercut that.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets', 'img');
mkdirSync(IMG, { recursive: true });

/* ------------------------------------------------------------------ *
 * Favicon
 * ------------------------------------------------------------------ */

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="7" fill="#07080a"/>
  <circle cx="20" cy="20" r="15.5" fill="none" stroke="#c6a15b" stroke-width="1" opacity=".35"/>
  <g fill="none" stroke="#c6a15b" stroke-width="1.9" stroke-linecap="round">
    <path d="M9 26c4.5 0 7.5-3.2 11-3.2S27.5 26 31 26"/>
    <path d="M11 20.5c3.6 0 6.2-3.1 9-3.1s5.4 3.1 9 3.1" opacity=".78"/>
    <path d="M13.5 15c2.6 0 4.6-3 6.5-3s3.9 3 6.5 3" opacity=".56"/>
  </g>
</svg>
`;
writeFileSync(join(IMG, 'favicon.svg'), favicon, 'utf8');

/* Maskable PWA icon — same mark with the safe-zone padding PWA requires. */
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#07080a"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#c6a15b" stroke-width="10" opacity=".35"/>
  <g fill="none" stroke="#c6a15b" stroke-width="19" stroke-linecap="round">
    <path d="M115 333c58 0 96-41 141-41s83 41 141 41"/>
    <path d="M141 263c46 0 79-40 115-40s69 40 115 40" opacity=".78"/>
    <path d="M173 192c33 0 59-38 83-38s50 38 83 38" opacity=".56"/>
  </g>
</svg>
`;
writeFileSync(join(IMG, 'icon-512.svg'), maskable, 'utf8');

/* ------------------------------------------------------------------ *
 * Minimal PNG encoder (truecolour, 8-bit, no alpha)
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

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // colour type: truecolour
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------------ *
 * Open Graph card — a procedural scale field in the brand palette,
 * generated the same way the site generates its portraits.
 * ------------------------------------------------------------------ */

const W = 1200, H = 630;
const px = Buffer.alloc(W * H * 3);

const OBSIDIAN = [7, 8, 10];
const BRASS = [198, 161, 91];
const DEEP = [22, 16, 9];
const MID = [138, 106, 52];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x5ca1e5);

const noiseGrid = new Float32Array(64 * 64);
for (let i = 0; i < noiseGrid.length; i++) noiseGrid[i] = rng();
const nAt = (x, y) => noiseGrid[(((y % 64) + 64) % 64) * 64 + (((x % 64) + 64) % 64)];
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const sx = x - xi, sy = y - yi;
  const s = (t) => t * t * (3 - 2 * t);
  const fx = s(sx), fy = s(sy);
  return (
    nAt(xi, yi) * (1 - fx) * (1 - fy) + nAt(xi + 1, yi) * fx * (1 - fy) +
    nAt(xi, yi + 1) * (1 - fx) * fy + nAt(xi + 1, yi + 1) * fx * fy
  );
}
function fbm(x, y) {
  let v = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < 4; i++) { v += noise(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2; }
  return v / norm;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

/* Scales large enough to read as scales at card size rather than as texture. */
const SCALE = 30;
const ROW = SCALE * 0.72;
const COLS = Math.ceil(W / SCALE) + 2;
const ROWS = Math.ceil(H / ROW) + 2;

/* Resolve every scale's tone once, so a scale is a coherent unit. */
const tone = new Float32Array(COLS * ROWS);
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const nx = (c * SCALE) / W;
    const ny = (r * ROW) / H;
    // Large irregular blotching, the way a ball python's dorsal pattern reads,
    // plus a lighter band running along the spine.
    const blotch = Math.pow(fbm(nx * 4.2 + 5, ny * 3.4 + 2), 1.5);
    const spine = Math.pow(1 - clamp01(Math.abs(ny - 0.46) * 2.3), 1.6);
    const jitter = (mulberry32(c * 7919 + r * 104729)() - 0.5) * 0.13;
    tone[r * COLS + c] = clamp01(blotch * 1.55 + spine * 0.40 + jitter - 0.52);
  }
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;

    const row = Math.floor(y / ROW);
    const stagger = row % 2 ? SCALE * 0.5 : 0;
    const col = Math.floor((x + stagger) / SCALE);
    const cx = col * SCALE - stagger + SCALE / 2;
    const cy = row * ROW + ROW / 2;

    // Overlapping rounded lozenge — wider than the row pitch so scales
    // imbricate the way real ones do instead of sitting in a grid.
    const dx = (x - cx) / (SCALE * 0.54);
    const dy = (y - cy) / (ROW * 0.82);
    const d = dx * dx + dy * dy;

    let c;
    if (d > 1) {
      c = DEEP; // the shadow between scales, never pure background
    } else {
      const t = tone[Math.min(ROWS - 1, row) * COLS + Math.min(COLS - 1, Math.max(0, col))] || 0;
      c = t < 0.5
        ? [lerp(DEEP[0], MID[0], t * 2), lerp(DEEP[1], MID[1], t * 2), lerp(DEEP[2], MID[2], t * 2)]
        : [lerp(MID[0], BRASS[0], (t - 0.5) * 2), lerp(MID[1], BRASS[1], (t - 0.5) * 2), lerp(MID[2], BRASS[2], (t - 0.5) * 2)];

      // Keratin highlight on the leading edge, shadow at the trailing edge.
      const shade = 1 + (1 - d) * 0.30 - Math.max(0, dy) * 0.42;
      c = [c[0] * shade, c[1] * shade, c[2] * shade];
    }

    // Diagonal specular sweep — the thing that makes a snake photograph.
    const sweep = Math.exp(-Math.pow((nx * 0.72 + (1 - ny) * 0.28 - 0.40) / 0.34, 2));
    // Vignette, plus a bottom scrim heavy enough for overlaid text to read.
    const vig = 1 - Math.min(1, Math.hypot((nx - 0.44) * 1.15, (ny - 0.42) * 1.40)) * 0.90;
    const scrim = 1 - Math.pow(clamp01((ny - 0.30) / 0.70), 1.5) * 0.80;
    const k = Math.min(1.12, Math.max(0, vig * scrim) * (1 + sweep * 0.30));

    const o = (y * W + x) * 3;
    px[o] = Math.min(255, Math.round(c[0] * k));
    px[o + 1] = Math.min(255, Math.round(c[1] * k));
    px[o + 2] = Math.min(255, Math.round(c[2] * k));
  }
}

writeFileSync(join(IMG, 'og-default.png'), encodePNG(W, H, px));

console.log('wrote assets/img/favicon.svg, icon-512.svg, og-default.png');
