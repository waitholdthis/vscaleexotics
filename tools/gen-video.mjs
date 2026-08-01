/**
 * Hero video renditions.
 *
 * Sources live in videos/ — 1280×720, 24fps, ~10s, ~12 Mbps, with an AAC audio
 * track. That is roughly thirty times the bitrate a muted background loop needs,
 * and the audio is dead weight because autoplay requires muting anyway.
 *
 * Two decisions are baked in here:
 *
 *  1. EVERY CLIP IS TRIMMED. Each source ends with the animal coming head-on at
 *     the camera. That is the visual language of a reptile shock video and it
 *     contradicts everything else on this site — which is deliberately calm,
 *     welfare-first, and describes these animals as display animals handled
 *     with respect. It would also jar on every loop. The kept portion of each
 *     clip is the slow move across the animal at rest, which is both the
 *     strongest footage and the right tone.
 *
 *     Per-clip trim points are recorded in CLIPS below and are specific to the
 *     footage — RE-CHECK THEM WHENEVER A SOURCE CHANGES. Set `trimTo: null` to
 *     ship a full clip.
 *
 *  2. NO AUDIO. Muted is a hard requirement for autoplay, so the track is
 *     stripped rather than shipped and ignored.
 *
 * Outputs to assets/video/ as <out>.mp4/.webm, <out>-sm.mp4/.webm and
 * <out>-poster[-sm].jpg. Requires ffmpeg on PATH.
 *
 * Usage:
 *   npm run build:video            all clips
 *   npm run build:video -- hero    just the named clip(s)
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'video');

/**
 * Swap a `source` to change the footage behind a hero, then re-run
 * `npm run build:video -- <out>` and re-check that clip's `trimTo`.
 */
const CLIPS = [
  {
    out: 'hero',
    source: 'V_Scale_Hero_New.mp4',
    /**
     * Seconds. Checked frame by frame: the mouth is still closed at 7.45s and
     * opening by 7.6s, so 7.4 leaves clean headroom.
     */
    trimTo: 7.4,
    /** Frame used for the poster. Near zero so poster → first frame is seamless. */
    posterAt: 0.05,
    /** Where the subject sits, for object-position/background-position. */
    focus: 'center 58%'
  },
  {
    out: 'sulawesi',
    source: 'Sulawesi_Hero.mp4',
    /**
     * Seconds. This source is two shots: a lateral track along the animal at
     * rest, then a hard cut at 6.208s to a second setup that ends on a head-on
     * close-up. Scene detection puts the cut on frame 149; 6.2 keeps every
     * frame of the first shot and none of the second. A background loop cannot
     * carry a hard cut anyway.
     */
    trimTo: 6.2,
    posterAt: 0.05,
    /** The animal lies along the lower third of frame in this one. */
    focus: 'center 62%'
  }
];

const requested = process.argv.slice(2);
const clips = requested.length ? CLIPS.filter((c) => requested.includes(c.out)) : CLIPS;

if (!clips.length) {
  console.error(`No clip matched ${requested.join(', ')}. Known: ${CLIPS.map((c) => c.out).join(', ')}`);
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

const mb = (p) => (statSync(p).size / 1048576).toFixed(2);

for (const clip of clips) {
  const SRC = join(ROOT, 'videos', clip.source);
  if (!existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`);
    process.exit(1);
  }

  const trim = clip.trimTo ? ['-t', String(clip.trimTo)] : [];
  console.log(
    `\n${clip.out} ← ${clip.source} — ${clip.trimTo ? `0–${clip.trimTo}s` : 'full clip'}, audio stripped…\n`
  );

  /* ---- Desktop MP4 (H.264) — the universal fallback ---- */
  const mp4 = join(OUT, `${clip.out}.mp4`);
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
  const webm = join(OUT, `${clip.out}.webm`);
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
  const mp4Small = join(OUT, `${clip.out}-sm.mp4`);
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

  const webmSmall = join(OUT, `${clip.out}-sm.webm`);
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
  const poster = join(OUT, `${clip.out}-poster.jpg`);
  ff(['-ss', String(clip.posterAt), '-i', SRC, '-frames:v', '1', '-q:v', '4', '-vf', 'scale=1280:-2', poster]);

  const posterSmall = join(OUT, `${clip.out}-poster-sm.jpg`);
  ff(['-ss', String(clip.posterAt), '-i', SRC, '-frames:v', '1', '-q:v', '5', '-vf', 'scale=854:-2', posterSmall]);

  /* ---- Report ---- */
  console.log(`\nsource                ${mb(SRC).padStart(7)} MB  ${clip.source} (with audio)`);
  for (const [label, p] of [
    [`${clip.out}.mp4        `, mp4], [`${clip.out}.webm       `, webm],
    [`${clip.out}-sm.mp4     `, mp4Small], [`${clip.out}-sm.webm    `, webmSmall],
    [`${clip.out}-poster.jpg `, poster], [`${clip.out}-poster-sm.jpg`, posterSmall]
  ]) {
    console.log(label, mb(p).padStart(7), 'MB');
  }
  const saved = (1 - statSync(mp4).size / statSync(SRC).size) * 100;
  console.log(`\nprimary rendition is ${saved.toFixed(1)}% smaller than the source`);
}
