# VScale Exotics

A private acquisition house for rare captive-bred serpents — Chatham County, North Carolina.

Static site. **Zero runtime dependencies.** No npm packages, no CDN, no fonts, no analytics, no
trackers, no build step required to run it.

```bash
node tools/build-data.mjs # compile content/ → assets/js/data/ (validates genetics)
node tools/serve.mjs      # http://localhost:4173, with production security headers
node tools/check.mjs      # static checks — CSP violations, broken links, stale generated data
node tools/smoke.mjs      # runtime checks — loads every page module against a DOM shim
```

Content is edited through **Decap CMS at `/admin/`**, authenticated by DecapBridge — see
[CMS.md](CMS.md).

---

## Why no dependencies

The largest realistic attack surface for a site like this is the supply chain, not the code. Having
no dependency tree removes that surface entirely, and it is what makes a genuinely strict CSP
possible — `script-src 'self'` with no `unsafe-inline` and no external origins.

The cost is that everything is hand-built. The benefit is that everything is auditable, the whole
site is about 400 KB, and it will still work in five years.

`package.json` exists only to mark the project as ESM and register the local tooling. Its dependency
tree is empty and should stay that way.

---

## Layout

```
index.html                  homepage
collection.html             faceted browser
animal.html                 individual record (?id=…)
tools.html  tools/*.html    the nine instruments
provenance.html             how the facility runs
acquire.html                buying process + FAQ
concierge.html              enquiry form
journal.html  vault.html  compare.html
legal/*.html                policies
404.html  offline.html

content/                    CMS-owned source of truth (JSON)
  inventory/ species/ genes/ loci/ journal/ settings/
admin/                      Decap CMS — config.yml, index.html
                            NOTE: runs under a scoped, looser CSP. See CMS.md.

assets/css/
  core.css                  tokens, reset, typography, layout, motion
  components.css            buttons, cards, forms, tables, header, palette, tray
  pages.css                 page-level composition

assets/js/
  core/    dom.js store.js format.js sitemap.js
  data/    GENERATED from content/ — species, genes, inventory, journal, site
  engine/  genetics.js valuation.js shipping.js husbandry.js incubation.js legality.js
  ui/      shell.js scales.js hero.js animal-card.js controls.js
  pages/   one entry point per page

tools/
  build-data.mjs content/ → assets/js/data/, with genetics validation
  serve.mjs      dev server with production headers
  check.mjs      static verification
  smoke.mjs      runtime verification
  scaffold.mjs   page shell generator (scaffolding, not a build step)
  sitemap.mjs    regenerates sitemap.xml
  gen-assets.mjs regenerates favicon and the OG card
```

---

## The parts worth knowing about

### Genetics is modelled by locus, not by gene

`assets/js/engine/genetics.js`. Mojave, Lesser, Butter, Russo, Phantom, Mystic, Special, Daddy and
Bamboo are not nine independent genes — they are nine alleles competing for two slots at one locus.
Calculators that treat them as independent will happily report a "Mojave Lesser", which does not
exist; the real result is a Blue-Eyed Leucistic.

The engine therefore:

- combines alleles per locus and multiplies distributions across loci
- resolves named combination phenotypes (`Candino`, `Mystic Potion`, `Highway`, `Ivory`)
- removes non-viable genotypes (Spider × Spider, Jaguar × Jaguar) from the live clutch and reports
  them separately, renormalising the survivors rather than silently inflating everything else
- separates the **genotype** view from the **visual** view, and derives possible-het percentages as
  a conditional probability — which is where the familiar "66% possible het" actually comes from
- refuses to run polygenic and locality traits through a punnett square at all

### Portraits are generated from genetics

`assets/js/ui/scales.js`. There is no photography in this repository. Rather than use placeholder
imagery, each animal's portrait is generated from its recorded genetics: the species supplies a base
palette and pattern grammar, then each gene applies a transformation derived from its own documented
effect text — albinism lifts and desaturates, axanthism strips chroma, GHI darkens, Piebald punches
unpigmented voids, Clown collapses the pattern to a dorsal band, Anthrax fractures it into speckle.

Seeded from the animal's id, so a given animal renders identically every time.

**To use real photography:** add an `image` field to the inventory record and branch in
`makeAnimalCanvas()`. Nothing else needs to change.

### Everything computes client-side

None of the nine tools has a server component. Nothing typed into them is transmitted anywhere. The
Vault, comparison tray and quarantine checklist use `localStorage` and are validated on read, because
`localStorage` is user-writable and shared with anything else on the origin.

---

## Before deploying

1. **Wire up `/api/enquiry`.** `assets/js/pages/concierge.js` POSTs JSON there. It is not included in
   this repository. Read the relevant section of [SECURITY.md](SECURITY.md) first — treat the payload
   as hostile, revalidate everything, and never interpolate a submitted value into an HTML email
   without escaping. Until it exists the form degrades gracefully to a pre-filled mail link, so
   nothing is lost.
2. **Replace the placeholder contact details** in `assets/js/core/sitemap.js` (`SITE.email`,
   `SITE.phone`) and in `.well-known/security.txt`. The phone number is a `555` reservation.
3. **Set the real origin** if it is not `vscaleexotics.com` — `SITE.origin` in
   `assets/js/core/sitemap.js`, plus `ORIGIN` in `tools/scaffold.mjs`, then re-run the scaffolder and
   `tools/sitemap.mjs`.
4. **Pick a host config**: `_headers` (Netlify / Cloudflare Pages), `vercel.json`, `nginx.conf` or
   `.htaccess`. All four carry the same policy. If you change it, change it in all of them plus
   `tools/serve.mjs`.
5. **Review `assets/js/engine/legality.js`.** It carries a `LAST_REVIEWED` date that the UI displays.
   Reptile law changes; a stale date here is worse than no tool. Re-review it before launch and on a
   schedule after.
6. **Run `node tools/check.mjs && node tools/smoke.mjs` in CI.** Both exit non-zero on any finding.

---

## Content is data, not markup

Content lives in `content/` as JSON and is edited through the CMS. `tools/build-data.mjs` compiles
it into `assets/js/data/*.js` — **those files are generated; do not edit them.**

Adding an animal means one record in `content/inventory/`. Its `traits` array is the source of
record: the title, valuation, rarity index, portrait, husbandry figures, structured data and the
"load into Gene Lab" action are all derived from it, so a listing cannot drift from its genetics.

Adding a gene means one record in `content/genes/`, with its `locus`. If it is allelic with
existing genes, give it their locus id and add the combination names to that locus in
`content/loci/`. The Gene Lab, the Codex, the valuation model and the portrait renderer all pick it
up without further changes.

The build refuses to write if the result would be genetically impossible — more than two alleles at
one locus, a gene attached to the wrong species, a combination spanning two loci. See [CMS.md](CMS.md).

---

## Accessibility & performance notes

- Semantic landmarks, skip link, visible focus rings, full keyboard operation including the command
  palette (<kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> / <kbd>/</kbd>).
- `prefers-reduced-motion` is honoured properly — the hero rotation, parallax, specular sweep,
  marquee and scroll reveals all stop, rather than merely running faster.
- `forced-colors` and print stylesheets are both handled.
- Generated portraits carry descriptive `aria-label`s and are painted lazily via
  `IntersectionObserver`.
- No layout shift: every canvas and media box has an intrinsic aspect ratio in CSS.
- No web fonts, so no FOUT, no FOIT and no font request.

---

## Licence

Proprietary. All content and code © VScale Exotics LLC.
