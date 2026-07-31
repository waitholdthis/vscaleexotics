/**
 * Procedural scale renderer.
 *
 * We hold no photography, and generic placeholder imagery would undercut the
 * whole premise of the site. So each animal's portrait is *generated from its
 * genetics*: the species supplies a base palette and pattern grammar, and each
 * gene the animal carries applies a documented transformation on top —
 * albinism lifts and desaturates, axanthism strips chroma entirely, GHI
 * darkens, Piebald punches unpigmented voids, Clown collapses the pattern to a
 * dorsal band, Anthrax fractures it into speckle.
 *
 * Seeded from the animal's id, so a given animal always renders identically
 * across sessions and devices. Swapping in real photography later means
 * setting `image` on the inventory record; nothing else changes.
 */

/* ------------------------------------------------------------------ *
 * Deterministic randomness
 * ------------------------------------------------------------------ */

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grid value-noise with smooth interpolation. */
function makeNoise(rng, size = 64) {
  const g = new Float32Array(size * size);
  for (let i = 0; i < g.length; i++) g[i] = rng();
  const at = (x, y) => g[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  const smooth = (t) => t * t * (3 - 2 * t);
  return function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = smooth(x - xi), yf = smooth(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a * (1 - xf) * (1 - yf) + b * xf * (1 - yf) + c * (1 - xf) * yf + d * xf * yf;
  };
}

function fbm(noise, x, y, octaves = 4) {
  let v = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    v += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / norm;
}

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function hsl({ h, s, l }, alpha = 1) {
  const H = ((h % 360) + 360) % 360;
  return `hsl(${H.toFixed(1)} ${clamp(s, 0, 100).toFixed(1)}% ${clamp(l, 0, 100).toFixed(1)}%${alpha < 1 ? ` / ${alpha}` : ''})`;
}

/* ------------------------------------------------------------------ *
 * Gene → visual transformation
 *
 * Driven by keywords in the gene's documented name and effect text, so the
 * portrait stays in step with the gene record rather than needing a parallel
 * hand-maintained art table.
 * ------------------------------------------------------------------ */

const RULES = [
  { k: /leucistic|patternless|ivory|titanium|white albino/i, mod: { l: +38, s: -70, contrast: -0.75 } },
  { k: /albino|amelanis/i,                                   mod: { l: +26, s: -18, hue: 42, hueMix: 0.55, contrast: -0.3 } },
  { k: /axanthic|greyscale|grayscale/i,                      mod: { s: -95, contrast: +0.1 } },
  { k: /anerythris/i,                                        mod: { s: -60, hue: 220, hueMix: 0.25 } },
  { k: /hypomelanis|hypo|reduced melanin|ultramel|ghost/i,   mod: { l: +12, s: -12, contrast: -0.28 } },
  { k: /lavender|lilac|violet|purple/i,                      mod: { hue: 285, hueMix: 0.5, s: -12, l: +10 } },
  { k: /blue/i,                                              mod: { hue: 205, hueMix: 0.62, s: +8, l: -4 } },
  { k: /darken|melanis|charcoal|black|GHI|graphite/i,        mod: { l: -20, contrast: +0.22 } },
  { k: /mahogany|oxblood|red|blood|sunset/i,                 mod: { hue: 8, hueMix: 0.5, s: +18, l: -3 } },
  { k: /orange|apricot|fire|caramel|toffee|butterscotch/i,   mod: { hue: 28, hueMix: 0.45, s: +16, l: +6 } },
  { k: /gold|yellow|brighten|lightens|pastel/i,              mod: { hue: 45, hueMix: 0.35, s: +10, l: +9 } },
  { k: /green|emerald/i,                                     mod: { hue: 140, hueMix: 0.45, s: +10 } },
  { k: /silver|platinum|pearl|opalescent/i,                  mod: { l: +18, s: -45 } },

  /* Pattern-grammar switches */
  { k: /piebald|unpigmented white region|calico/i, flag: 'pied' },
  { k: /dorsal stripe|striping|pinstripe|motley|stripe/i, flag: 'stripe' },
  { k: /spot|leopard|ocelli/i, flag: 'spots' },
  { k: /speckl|static|granular|anthrax|monsoon|granite|fracture/i, flag: 'speckle' },
  { k: /reduces the pattern|pattern reduction|near-patternless|clean flank|removes the flanks/i, flag: 'reduce' },
  { k: /aberran|scramble|confusion|jungle|irregular/i, flag: 'aberrant' },
  { k: /band/i, flag: 'banded' }
];

/**
 * @param {object} species  species record (needs .palette and .pattern)
 * @param {Array<{geneId:string,zygosity:string}>} traits
 * @param {object} genesById
 */
export function derivePhenotype(species, traits, genesById) {
  const p = species.palette;
  let base = hexToHsl(p.base);
  let mid = hexToHsl(p.mid);
  let high = hexToHsl(p.high);
  let dark = hexToHsl(p.dark);

  let contrast = 1;
  const flags = new Set();

  for (const t of traits || []) {
    const gene = genesById[t.geneId];
    if (!gene) continue;
    // Two copies of an incomplete-dominant gene push roughly twice as hard.
    const weight = t.zygosity === 'homo' ? (gene.inheritance === 'recessive' ? 1 : 1.75) : gene.inheritance === 'recessive' ? 0 : 1;
    if (weight === 0) continue; // a het recessive is, by definition, invisible

    const text = `${gene.name} ${gene.effect || ''} ${gene.superName || ''}`;
    for (const rule of RULES) {
      if (!rule.k.test(text)) continue;
      if (rule.flag) { flags.add(rule.flag); continue; }
      const m = rule.mod;
      for (const c of [base, mid, high, dark]) {
        if (m.l) c.l = clamp(c.l + m.l * weight * 0.55, 2, 97);
        if (m.s) c.s = clamp(c.s + m.s * weight * 0.55, 0, 100);
        if (m.hue != null) {
          const amt = clamp((m.hueMix || 0.4) * weight * 0.6, 0, 0.9);
          c.h = c.h + shortestHueDelta(c.h, m.hue) * amt;
          if (m.s == null) c.s = clamp(c.s + 4 * weight, 0, 100);
        }
      }
      if (m.contrast) contrast = clamp(contrast + m.contrast * weight * 0.5, 0.15, 2);
    }
  }

  // Keep the bands legible after stacking — collapse toward the midpoint if
  // the transforms have inverted or flattened the ramp.
  const ramp = [dark, base, mid, high].sort((a, b) => a.l - b.l);
  const spread = ramp[3].l - ramp[0].l;
  if (spread < 12) {
    const c = (ramp[0].l + ramp[3].l) / 2;
    ramp[0].l = clamp(c - 9, 2, 97); ramp[1].l = clamp(c - 3, 2, 97);
    ramp[2].l = clamp(c + 4, 2, 97); ramp[3].l = clamp(c + 11, 2, 97);
  }

  return {
    dark: ramp[0], base: ramp[1], mid: ramp[2], high: ramp[3],
    contrast,
    flags,
    pattern: species.pattern || 'blotch'
  };
}

function shortestHueDelta(from, to) {
  let d = ((to - from + 540) % 360) - 180;
  return d;
}

/* ------------------------------------------------------------------ *
 * Pattern fields — return 0..1 for a normalised (x, y)
 * ------------------------------------------------------------------ */

function patternField(kind, noise, rng) {
  const off = rng() * 100;
  const fields = {
    'alien-head': (x, y) => {
      const spine = Math.abs(y - 0.5);
      const blobs = fbm(noise, x * 5 + off, y * 3.2, 4);
      const band = Math.pow(1 - clamp(spine * 2.4, 0, 1), 1.4);
      return clamp(blobs * 0.75 + band * 0.5, 0, 1);
    },
    reticulate: (x, y) => {
      const a = Math.sin((x * 26 + y * 14 + off) * 0.5);
      const b = Math.sin((x * 14 - y * 26 + off) * 0.5);
      const net = 1 - Math.abs(a * b);
      return clamp(net * 0.7 + fbm(noise, x * 6, y * 6, 3) * 0.45, 0, 1);
    },
    'dorsal-stripe': (x, y) => {
      const spine = 1 - clamp(Math.abs(y - 0.5) * 3.6, 0, 1);
      return clamp(spine * 0.85 + fbm(noise, x * 8 + off, y * 5, 3) * 0.35, 0, 1);
    },
    saddle: (x, y) => {
      const s = Math.sin(x * Math.PI * 7 + off) * 0.5 + 0.5;
      const taper = 1 - clamp(Math.abs(y - 0.5) * 1.7, 0, 1);
      return clamp(Math.pow(s, 1.8) * taper * 1.25 + fbm(noise, x * 5, y * 5, 3) * 0.3, 0, 1);
    },
    blotch: (x, y) => clamp(Math.pow(fbm(noise, x * 4.5 + off, y * 4.5, 4), 1.25) * 1.6, 0, 1),
    banded: (x, y) => {
      const b = Math.sin(x * Math.PI * 9 + fbm(noise, x * 3, y * 3, 2) * 2.5 + off) * 0.5 + 0.5;
      return clamp(Math.pow(b, 1.4), 0, 1);
    },
    ocelli: (x, y) => {
      const s = Math.sin(x * Math.PI * 11 + off) * Math.sin(y * Math.PI * 4);
      return clamp(Math.abs(s) * 0.8 + fbm(noise, x * 7, y * 7, 3) * 0.4, 0, 1);
    },
    lightning: (x, y) => {
      const spine = 1 - clamp(Math.abs(y - 0.5) * 5, 0, 1);
      const jag = Math.abs(Math.sin(x * 18 + fbm(noise, x * 4, y * 4, 2) * 6 + off));
      return clamp(spine * jag * 1.6 + fbm(noise, x * 6, y * 6, 3) * 0.18, 0, 1);
    }
  };
  return fields[kind] || fields.blotch;
}

/* ------------------------------------------------------------------ *
 * Renderer
 * ------------------------------------------------------------------ */

const DETAIL = { thumb: 11, card: 8, hero: 6 };

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} opts { seed, phenotype, width, height, detail }
 */
export function renderScales(canvas, opts) {
  const detail = DETAIL[opts.detail || 'card'] || 8;
  const W = opts.width || 560;
  const H = opts.height || 420;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const ph = opts.phenotype;
  const rng = mulberry32(opts.seed);
  const noise = makeNoise(mulberry32(opts.seed ^ 0x9e3779b9));
  const field = patternField(ph.pattern, noise, rng);

  // Background — the deepest tone, so gaps between scales read as shadow.
  ctx.fillStyle = hsl({ ...ph.dark, l: Math.max(2, ph.dark.l - 6) });
  ctx.fillRect(0, 0, W, H);

  // Pied voids: unpigmented regions punched through the pattern.
  const piedCentres = [];
  if (ph.flags.has('pied')) {
    const n = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      piedCentres.push({ x: rng(), y: rng(), r: 0.18 + rng() * 0.22 });
    }
  }

  const rowH = detail * 0.78;
  const cols = Math.ceil(W / detail) + 2;
  const rows = Math.ceil(H / rowH) + 2;

  const lerp = (a, b, t) => a + (b - a) * t;
  const band = (v) => {
    // Map field value onto the four-tone ramp, widened or narrowed by contrast.
    const c = ph.contrast;
    const t = clamp((v - 0.5) * c + 0.5, 0, 1);
    if (t < 0.3) return { c1: ph.dark, c2: ph.base, t: t / 0.3 };
    if (t < 0.62) return { c1: ph.base, c2: ph.mid, t: (t - 0.3) / 0.32 };
    return { c1: ph.mid, c2: ph.high, t: (t - 0.62) / 0.38 };
  };

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const stagger = r % 2 ? detail * 0.5 : 0;
    for (let c = 0; c < cols; c++) {
      const x = c * detail - stagger;
      const nx = x / W;
      const ny = y / H;

      let v = field(nx, ny);

      // Gene-driven pattern overrides.
      if (ph.flags.has('reduce')) {
        const spine = 1 - clamp(Math.abs(ny - 0.5) * 2.6, 0, 1);
        v = lerp(0.12, v, Math.pow(spine, 1.5));
      }
      if (ph.flags.has('stripe')) {
        const spine = 1 - clamp(Math.abs(ny - 0.5) * 7, 0, 1);
        v = clamp(v * 0.45 + spine * 0.85, 0, 1);
      }
      if (ph.flags.has('speckle')) {
        v = clamp(v * 0.4 + (rng() < 0.18 ? 0.95 : 0.1) * 0.75, 0, 1);
      }
      if (ph.flags.has('spots')) {
        const s = Math.sin(nx * Math.PI * 14) * Math.sin(ny * Math.PI * 7);
        v = clamp(v * 0.4 + Math.pow(Math.abs(s), 3) * 1.1, 0, 1);
      }
      if (ph.flags.has('aberrant')) {
        v = clamp(v + (fbm(noise, nx * 9, ny * 9, 2) - 0.5) * 0.7, 0, 1);
      }
      if (ph.flags.has('banded') && ph.pattern !== 'banded') {
        v = clamp(v * 0.6 + (Math.sin(nx * Math.PI * 8) * 0.5 + 0.5) * 0.55, 0, 1);
      }

      let piedMask = 0;
      for (const p of piedCentres) {
        const d = Math.hypot((nx - p.x) * 1.4, ny - p.y);
        const edge = p.r + fbm(noise, nx * 7, ny * 7, 2) * 0.09 - 0.045;
        if (d < edge) piedMask = Math.max(piedMask, clamp((edge - d) / 0.06, 0, 1));
      }

      const { c1, c2, t } = band(v);
      let col = {
        h: lerp(c1.h, c2.h, t),
        s: lerp(c1.s, c2.s, t),
        l: lerp(c1.l, c2.l, t)
      };

      if (piedMask > 0) {
        col = { h: col.h, s: lerp(col.s, 4, piedMask), l: lerp(col.l, 94, piedMask) };
      }

      // Per-scale variance — real scales are never uniform.
      const jitter = (rng() - 0.5) * 7;
      const shade = 1 - (r % 2) * 0.03;
      ctx.fillStyle = hsl({ h: col.h, s: col.s, l: clamp((col.l + jitter) * shade, 1, 98) });

      // Scale body: a slightly flattened rounded lozenge.
      const w = detail * 0.94;
      const h = rowH * 1.22;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Keratin highlight along the leading edge.
      if (detail > 6 && rng() < 0.85) {
        ctx.fillStyle = hsl({ h: col.h, s: clamp(col.s - 8, 0, 100), l: clamp(col.l + 11, 0, 99) }, 0.5);
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h * 0.34, w * 0.34, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Iridescence — a broad diagonal spectral sweep. Brazilian rainbow boas
  // and retics get a much stronger version because on the real animal it is
  // the dominant visual feature.
  const irid = opts.iridescence ?? 0.16;
  if (irid > 0) {
    const g = ctx.createLinearGradient(0, H, W, 0);
    g.addColorStop(0.0, 'hsl(280 90% 60% / 0)');
    g.addColorStop(0.28, `hsl(255 90% 62% / ${irid})`);
    g.addColorStop(0.46, `hsl(190 90% 60% / ${irid * 0.85})`);
    g.addColorStop(0.62, `hsl(120 80% 58% / ${irid * 0.5})`);
    g.addColorStop(0.82, `hsl(35 90% 60% / ${irid * 0.7})`);
    g.addColorStop(1.0, 'hsl(0 90% 60% / 0)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Specular sheen following the body's implied curvature.
  const sheen = ctx.createLinearGradient(0, 0, 0, H);
  sheen.addColorStop(0, 'rgba(255,255,255,.10)');
  sheen.addColorStop(0.34, 'rgba(255,255,255,.03)');
  sheen.addColorStop(0.6, 'rgba(0,0,0,.16)');
  sheen.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Vignette to seat it against the page.
  const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, Math.min(W, H) * 0.18, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

/* ------------------------------------------------------------------ *
 * Lazy mounting
 * ------------------------------------------------------------------ */

const painted = new WeakSet();

/**
 * Render every [data-scale-canvas] as it scrolls into view.
 * The element supplies its own config through a `_scaleConfig` property set by
 * whatever built it — never through a data-* attribute, so nothing here parses
 * markup-supplied values.
 */
export function mountScaleCanvases(root = document) {
  const nodes = root.querySelectorAll('canvas[data-scale-canvas]');
  if (!nodes.length) return;

  const paint = (el) => {
    if (painted.has(el) || !el._scaleConfig) return;
    painted.add(el);
    try {
      renderScales(el, el._scaleConfig);
      el.dataset.painted = 'true';
    } catch (err) {
      // A failed portrait must never take a page down with it.
      console.warn('scale render failed', err);
    }
  };

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(paint);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          paint(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '250px 0px' }
  );
  nodes.forEach((n) => io.observe(n));
}

/** Convenience: build a configured canvas element for an animal. */
export function makeAnimalCanvas(animal, species, genesById, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.dataset.scaleCanvas = '';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    `Generated pattern study of ${animal.title}, ${species.common}, derived from its recorded genetics.`
  );
  const irid =
    animal.species === 'brazilian-rainbow-boa' ? 0.42 :
    animal.species === 'reticulated-python' ? 0.3 :
    animal.species === 'blood-python' ? 0.2 : 0.14;

  canvas._scaleConfig = {
    seed: hashString(animal.id),
    phenotype: derivePhenotype(species, animal.traits, genesById),
    width: opts.width || 560,
    height: opts.height || 420,
    detail: opts.detail || 'card',
    iridescence: opts.iridescence ?? irid
  };
  return canvas;
}
