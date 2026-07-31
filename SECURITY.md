# Security

## Reporting

Email **security@vscaleexotics.com**. We aim to acknowledge within two working days.

We will not pursue legal action against anyone who reports a vulnerability in good faith, gives us
reasonable time to remediate, and does not access, modify or exfiltrate data belonging to anyone else.

---

## Threat model

This is a static site that handles no payments, stores no credentials, and has no authenticated
surface. The realistic threats are therefore narrower than for a typical commerce site, and the
controls are chosen accordingly.

| Threat | Control |
| --- | --- |
| Supply-chain compromise via a dependency | **The site has no dependencies.** No npm packages, no CDN scripts, no external fonts, no analytics, no tag manager. `package.json` has an empty dependency tree and exists only to mark the project as ESM and register the local tooling scripts. The one exception is `/admin/`, which loads the Decap CMS bundle from unpkg at a **pinned version** — see the /admin/ exception below. No page a visitor can reach loads third-party code. |
| XSS via injected markup | The only DOM construction path is `h()` in `assets/js/core/dom.js`, which has no route to `innerHTML` — every string becomes a text node. Event handlers can only be attached programmatically. `href`/`src` values are scheme-checked, and `on*` attributes are rejected outright. |
| XSS via CSP bypass | `script-src 'self'` with no `unsafe-inline` and no `unsafe-eval`. There are zero inline `<script>` bodies and zero inline event handlers in the HTML; `tools/check.mjs` fails the build if any appear. |
| CSS injection / exfiltration | `style-src 'self'` with no `unsafe-inline`. Dynamic styling goes through `element.style.setProperty()`, which is CSSOM and unaffected by `style-src`. No `style="..."` attributes are emitted by JavaScript. |
| Clickjacking | `frame-ancestors 'none'` plus `X-Frame-Options: DENY`. |
| MIME confusion | `X-Content-Type-Options: nosniff`, with explicit content types set by every server config. |
| Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin`. |
| Tampering with client-side state | Everything read from `localStorage` is validated against a shape before use: identifiers must match `/^[a-z0-9-]{3,40}$/`, preference values must be members of a known enum, list lengths are capped. Anything unrecognised is dropped rather than repaired. See `assets/js/core/store.js`. |
| Tampering with URL state | Query-string values are matched against known facet values, known sort keys and known record ids. Nothing from `location.search` is ever inserted into the DOM as anything but a matched, known-good value. |
| Automated form abuse | Honeypot field plus a minimum time-to-submit on the enquiry form. Both fail to a generic message so an automated client learns nothing about which check it tripped. **The server must revalidate everything** — see below. |
| Enquiry endpoint abuse | Rate limiting configured in `nginx.conf` (5/min per address, burst 3), 16 KB body cap, POST only. |
| Stale availability data | The service worker is network-first for HTML and for `/assets/js/data/*`, so a sold animal never renders as available from cache. |
| Invalid or impossible content reaching production | `tools/build-data.mjs` validates every referential and genetic constraint and refuses to write on failure; `tools/check.mjs` fails if the generated modules drift from `content/`. The CMS uses editorial workflow, so edits arrive as pull requests rather than direct commits to `main`. |
| Compromise of a CMS editor account | Editors authenticate through DecapBridge, not with GitHub credentials, and hold no repository access. Revoke a user from the DecapBridge dashboard. Editorial workflow means their changes are reviewable before merge. |

---

## Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'none';
form-action 'self';
frame-ancestors 'none';
frame-src 'none';
manifest-src 'self';
worker-src 'self';
upgrade-insecure-requests
```

Notes:

- `img-src` permits `data:` for two small inline SVGs in the stylesheet (the film-grain turbulence
  and the select-control chevron). No raster data URIs are used.
- `frame-ancestors` cannot be set via `<meta>`, so it is present only in the server headers. The
  `<meta>` CSP in each page is a defence-in-depth fallback for hosts where header configuration is
  unavailable; **the headers are the real policy**.
- JSON-LD blocks are `<script type="application/ld+json">`. These are data, not executable script,
  and are not governed by `script-src`.

### The /admin/ exception

`/admin/` runs Decap CMS, a third-party React application, under a **looser policy scoped to that
path only**:

```
script-src  'self' https://unpkg.com
style-src   'self' 'unsafe-inline'
connect-src 'self' https://auth.decapbridge.com https://gateway.decapbridge.com https://api.github.com
img-src     'self' data: blob: https://avatars.githubusercontent.com
```

Notes:

- A page's `<meta>` CSP and its header CSP are both enforced as an **intersection**. Relaxing only
  the meta tag would do nothing while the server still sent the strict header, so the exception is
  present in all five configs below.
- The Decap bundle version is **pinned** in `admin/index.html`. It must not float to `latest`: the
  admin panel holds write access to the repository, so an unreviewed bundle is a supply-chain change
  to your content.
- `/admin/` is `noindex, nofollow` by header and disallowed in `robots.txt`.
- Every other path on the origin keeps `default-src 'self'` with no external origins.

The policy is defined in **five** places that must be kept in sync:

1. `_headers` — Netlify / Cloudflare Pages
2. `vercel.json` — Vercel
3. `nginx.conf` — self-hosted
4. `.htaccess` — Apache
5. `tools/serve.mjs` — local development, so violations surface before deploy

The `<meta>` copy in each HTML page is generated by `tools/scaffold.mjs`.

---

## If you wire up the enquiry endpoint

`assets/js/pages/concierge.js` POSTs JSON to `/api/enquiry`. That endpoint is **not included** in
this repository. If you implement it, treat everything in the payload as hostile:

- Revalidate every field server-side. The client-side validation is a usability feature and provides
  no security guarantee whatsoever.
- Enforce length limits again. The client caps fields, an attacker will not.
- Never interpolate submitted values into an HTML email without escaping — this is the single most
  likely place for stored XSS to enter a system like this.
- Never interpolate them into a shell command, a SQL statement, or a file path.
- Rate limit by address and, if you add one, by session.
- Do not reflect the submission back in the HTTP response.
- Log the submission, not the requester's full IP, unless you have a stated retention policy for it.

---

## What this site deliberately does not do

- No cookies of any kind, so no consent banner is required or present.
- No analytics, no session recording, no advertising pixels, no A/B framework.
- No third-party embeds on any public page — the Open Graph card, favicon and every image are
  generated locally by `tools/gen-assets.mjs` and served from this origin. The `/admin/` panel is the
  sole exception and is not a public page.
- No user accounts, so no password storage, no session tokens, no account-recovery surface.
- No payment processing in the browser. Payment happens by bank transfer or through a PCI-compliant
  processor out of band; no card data ever reaches this site.

---

## Verifying

```bash
node tools/build-data.mjs # validates content/ and refuses to write impossible genetics
node tools/check.mjs      # inline scripts, inline handlers, broken links, missing meta, stale data
node tools/smoke.mjs      # loads every page module and asserts it renders
node tools/serve.mjs      # production headers, so CSP violations appear in the console
```

All three run in CI on every push and pull request (`.github/workflows/verify.yml`). Each exits
non-zero on any finding, which is what makes the CMS editorial workflow meaningful — a bad content
edit fails on its branch rather than on `main`.
