# Content management

Decap CMS at **`/admin/`**, authenticated through [DecapBridge](https://decapbridge.com).

---

## Finishing setup

Three things, once:

1. Create a site at DecapBridge and connect `waitholdthis/vscaleexotics`.
2. Replace `YOUR-SITE-ID` in [`admin/config.yml`](admin/config.yml) with the id it gives you.
3. Invite yourself as a user from the DecapBridge dashboard, then open `/admin/`.

Nothing else needs changing. DecapBridge replaces Netlify Identity and Git Gateway, both of which
are deprecated — editors log in with email, Google or Microsoft and never need a GitHub account.

---

## How an edit reaches the live site

```
   /admin/  ──writes JSON──▶  content/  ──build-data.mjs──▶  assets/js/data/*.js  ──▶  site
                                            │
                                            └─ validates genetics, refuses to write if impossible
```

This indirection is deliberate and it is the crux of the whole design.

The site runs on ES modules with **no fetch and no async data loading**. That is what lets the
genetics engine, the valuation model and every husbandry calculator be synchronous, and what keeps
the runtime dependency-free. A CMS that wrote directly to the files the browser loads would force
the entire site to become asynchronous.

So the CMS writes to `content/`, and `tools/build-data.mjs` compiles that into the modules the site
actually runs on. The compiled files are committed, so the repository is always servable as a plain
static site with no build.

**Editors never touch the generated files.** `tools/check.mjs` fails if they drift out of sync.

---

## What is editable

| Collection | Files | What it drives |
| --- | --- | --- |
| **Livestock** | `content/inventory/` | Listings, animal records, portraits, valuations, Gene Lab presets, structured data |
| **Species** | `content/species/` | Every husbandry figure, enclosure spec, prey calculation, care panel |
| **Genes** | `content/genes/` | The Codex, the Gene Lab, portrait generation, valuation multipliers |
| **Loci** | `content/loci/` | Allelic complexes and their combination names |
| **Journal** | `content/journal/` | The journal index |
| **Settings** | `content/settings/site.json` | Contact details, footer, structured data, policy pages |

### Editorial workflow

`publish_mode: editorial_workflow` is on, so saving creates a pull request rather than committing to
`main`. A bad edit fails CI on a branch instead of breaking the live build. Run
`node tools/check.mjs && node tools/smoke.mjs` in CI on pull requests to get that benefit.

### Photographs

Upload to an animal's **Photographs** field and they replace its generated portrait automatically —
on the card, the detail page and the comparison table. With no photographs the site falls back to a
portrait derived from that animal's genetics, and the "generated study, not a photograph"
disclaimer is shown. With photographs, the disclaimer is correctly suppressed.

Media lands in `assets/img/animals/`.

---

## The validation layer

`tools/build-data.mjs` refuses to write anything if the content is genetically or referentially
impossible. It catches, among others:

- a gene assigned to a species that does not exist
- an animal carrying a gene belonging to a different species
- **more than two alleles at one locus** — the single most likely thing to get wrong, because it
  looks reasonable in a form
- a locus combination referencing a gene from a different locus
- a duplicate SKU
- an inheritance mode, status, tier, sex or quality outside the allowed set
- a malformed date, a missing `maturityWeight`, a non-positive weight

This is not defensive padding. Seeding it against the existing data immediately surfaced three real
bugs that had already shipped:

1. **Candino Enchi** was recorded as homozygous Albino *and* homozygous Candy — four alleles at a
   two-slot locus. A Candino is a compound heterozygote. Loading that animal into the Gene Lab
   crashed.
2. **Reticulated python albino combinations never matched**, because they were keyed on the ball
   python gene id `lavenderalbino` rather than the retic's `lavenderalbino-r`.
3. `buildParent`'s own error path threw a raw `TypeError` when both same-locus entries were
   homozygous, instead of the readable `GeneticsError` it was supposed to produce.

If content validation ever feels like it is in the way, that is what it is buying.

---

## Working locally

```bash
node tools/build-data.mjs     # compile content/ → assets/js/data/
node tools/serve.mjs          # http://localhost:4173, production headers
node tools/check.mjs          # includes the content/generated sync check
```

The CMS itself needs the deployed origin to authenticate against DecapBridge, so `/admin/` is not
usable from `localhost` without extra setup. Edit the JSON directly when working offline — it is the
same data, and the build validates it either way.

To add a field: add it to the collection in `admin/config.yml`, then handle it in the matching
section of `tools/build-data.mjs`. Those two files are the whole contract.

---

## Security

`/admin/` runs under a **deliberately looser Content Security Policy** than the rest of the site,
scoped to that path and nowhere else. Decap CMS is a third-party React application: it injects its
own styles at runtime and talks to DecapBridge and the GitHub API.

Two things worth understanding:

- A page's `<meta>` CSP and its response-header CSP are **both** enforced, as an intersection.
  Relaxing only the meta tag would achieve nothing while the server still sent the strict header.
  The scoped exception therefore exists in all five server configs — `_headers`, `vercel.json`,
  `nginx.conf`, `.htaccess` and `tools/serve.mjs`.
- The Decap bundle version in `admin/index.html` is **pinned**. Do not float it to `latest`. The
  admin panel has write access to the repository, so an unreviewed bundle update is a supply-chain
  change to your content. Review the release notes, bump the pin, deploy.

`/admin/` is `noindex, nofollow` by header and disallowed in `robots.txt`.

Everything else on the origin keeps `default-src 'self'` with no external origins at all. See
[SECURITY.md](SECURITY.md).
