/**
 * Hero video renditions.
 *
 * Source: videos/<SOURCE_CLIP> — 1280×720, 24fps, 10.0s, ~12.5 Mbps, with an
 * AAC audio track. That is roughly thirty times the bitrate a muted
 * background loop needs, and the audio is dead weight because autoplay
 * requires muting anyway.
 *
 * Two decisions are baked in here:
 *
 *  1. TRIMMED AT 7.8s. The source ends with the animal striking at the camera,
 *     mouth open. That is the visual language of a reptile shock video and it
 *     contradicts everything else on this site — which is deliberately calm,
 *     welfare-first, and describes these animals as display animals handled
 *     with respect. It would also jar on every loop. The first 7.8 seconds are
 *     a slow push through dappled rainforest onto a coiled animal, which is
 *     both the strongest footage and the right tone.
 *
 *     To ship the full clip instead, set TRIM_TO = null and re-run.
 *
 *  2. NO AUDIO. Muted is a hard requirement for autoplay, so the track is
 *     stripped rather than shipped and ignored.
 *
 * Outputs to assets/video/. Requires ffmpeg on PATH.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** Swap this to change the hero footage, then re-run `npm run build:video`. */
const SOURCE_CLIP = 'V_Scale_Hero_New.mp4';
const SRC = join(ROOT, 'videos', SOURCE_CLIP);
const OUT = join(ROOT, 'assets', 'video');

/**
 * Seconds. Checked frame by frame against the current clip: the mouth is still
 * closed at 7.45s and opening by 7.6s, so 7.4 leaves clean headroom.
 * RE-CHECK THIS WHEN THE SOURCE CHANGES — it is specific to the footage.
 */
const TRIM_TO = 7.4;

/** Frame used for the poster. Zero so poster → first video frame is seamless. */
const POSTER_AT = 0.05;

if (!existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const ff = (args) => {
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  } catch (err) {
    console.error('ffmpeg failed:', err.message);
    process.exit(1);
  }
};

const trim = TRIM_TO ? ['-t', String(TRIM_TO)] : [];
const mb = (p) => (statSync(p).size / 1048576).toFixed(2);

console.log(`Encoding from ${TRIM_TO ? `0–${TRIM_TO}s` : 'full clip'}, audio stripped…\n`);

/* ---- Desktop MP4 (H.264) — the universal fallback ---- */
const mp4 = join(OUT, 'hero.mp4');
ff([
  '-i', SRC, ...trim,
  '-an',
  '-c:v', 'libx264',
  '-profile:v', 'high', '-level', '4.0',
  '-preset', 'veryslow',
  '-crf', '26',
  '-pix_fmt', 'yuv420p',
  // Two-second GOP so the loop restart is cheap and seeking is responsive.
  '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
  '-movflags', '+faststart',
  mp4
]);

/* ---- Desktop WebM (VP9) — meaningfully smaller where supported ---- */
const webm = join(OUT, 'hero.webm');
ff([
  '-i', SRC, ...trim,
  '-an',
  '-c:v', 'libvpx-vp9',
  // CRF tuned by measurement: at 36 VP9 came out LARGER than H.264 on this
  // grainy footage. 40 beats it by ~18% at indistinguishable quality.
  '-crf', '40', '-b:v', '0',
  '-row-mt', '1', '-tile-columns', '2',
  '-deadline', 'good', '-cpu-used', '2',
  '-pix_fmt', 'yuv420p',
  '-g', '48',
  webm
]);

/* ---- Mobile renditions — half the pixels, a third of the bytes ---- */
const mp4Small = join(OUT, 'hero-sm.mp4');
ff([
  '-i', SRC, ...trim,
  '-an',
  '-vf', 'scale=854:480',
  '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1',
  '-preset', 'veryslow', '-crf', '28',
  '-pix_fmt', 'yuv420p',
  '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
  '-movflags', '+faststart',
  mp4Small
]);

const webmSmall = join(OUT, 'hero-sm.webm');
ff([
  '-i', SRC, ...trim,
  '-an',
  '-vf', 'scale=854:480',
  '-c:v', 'libvpx-vp9', '-crf', '42', '-b:v', '0',
  '-row-mt', '1', '-tile-columns', '2',
  '-deadline', 'good', '-cpu-used', '2',
  '-pix_fmt', 'yuv420p', '-g', '48',
  webmSmall
]);

/* ---- Poster ---- */
const poster = join(OUT, 'hero-poster.jpg');
ff(['-ss', String(POSTER_AT), '-i', SRC, '-frames:v', '1', '-q:v', '4', '-vf', 'scale=1280:-2', poster]);

const posterSmall = join(OUT, 'hero-poster-sm.jpg');
ff(['-ss', String(POSTER_AT), '-i', SRC, '-frames:v', '1', '-q:v', '5', '-vf', 'scale=854:-2', posterSmall]);

/* ---- Report ---- */
const srcMb = mb(SRC);
console.log(`\nsource         ${srcMb.padStart(7)} MB  ${SOURCE_CLIP} (with audio)`);
for (const [label, p] of [
  ['hero.mp4     ', mp4], ['hero.webm    ', webm],
  ['hero-sm.mp4  ', mp4Small], ['hero-sm.webm ', webmSmall],
  ['poster.jpg   ', poster], ['poster-sm.jpg', posterSmall]
]) {
  console.log(label, mb(p).padStart(7), 'MB');
}
const saved = (1 - statSync(mp4).size / statSync(SRC).size) * 100;
console.log(`\nprimary rendition is ${saved.toFixed(1)}% smaller than the source`);
