/**
 * Development static server. Node stdlib only.
 *
 * Serves the site with the same security headers the production configs set,
 * so CSP violations surface in development rather than after deploy.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, normalize, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'none'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "media-src 'self'",
  'upgrade-insecure-requests',
  'report-uri /api/csp-report'
].join('; ');

/**
 * The admin panel runs a third-party React application that injects its own
 * styles and talks to DecapBridge and the GitHub API. It therefore needs a
 * looser policy than the rest of the site — scoped to /admin/ and nowhere else.
 *
 * Note that a page's meta CSP and its header CSP are BOTH enforced, as an
 * intersection. Relaxing only the meta tag in admin/index.html would achieve
 * nothing while the server still sent the strict header, which is why this
 * branch has to exist in every server config.
 */
const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://avatars.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://auth.decapbridge.com https://gateway.decapbridge.com https://api.github.com",
  "frame-ancestors 'none'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  'upgrade-insecure-requests'
].join('; ');

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY'
};

const SECURITY_HEADERS = { ...baseHeaders, 'Content-Security-Policy': CSP };

const headersFor = (pathname) =>
  pathname.startsWith('/admin')
    ? { ...baseHeaders, 'Content-Security-Policy': ADMIN_CSP, 'X-Robots-Tag': 'noindex, nofollow' }
    : SECURITY_HEADERS;

/**
 * Sink for `report-uri /api/csp-report`.
 *
 * A blocked resource is not an error in the page — no exception, no failed
 * request, usually nothing anyone scrolls back far enough in the console to
 * see. Sixty inline styles were dropped on every page for weeks before anyone
 * noticed, and only then because a screenshot looked wrong.
 *
 * tools/check.mjs catches the violations that are visible in the source. This
 * catches the ones that are not: anything a script constructs at runtime.
 * Production needs the same endpoint — see the /api/enquiry note in README.
 */
function handleCspReport(req, res) {
  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 64_000) req.destroy(); });
  req.on('end', () => {
    try {
      const r = JSON.parse(raw)['csp-report'] || {};
      console.error(
        `\n  CSP VIOLATION  ${r['violated-directive'] || '?'}` +
          `\n    blocked : ${r['blocked-uri'] || '?'}` +
          `\n    on page : ${r['document-uri'] || '?'}` +
          (r['source-file'] ? `\n    source  : ${r['source-file']}:${r['line-number'] ?? '?'}` : '') +
          (r['script-sample'] ? `\n    sample  : ${String(r['script-sample']).slice(0, 120)}` : '') +
          '\n'
      );
    } catch {
      console.error('  CSP VIOLATION (unparseable report)');
    }
    res.writeHead(204).end();
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    if (pathname === '/api/csp-report') {
      if (req.method !== 'POST') { res.writeHead(405, SECURITY_HEADERS).end(); return; }
      handleCspReport(req, res);
      return;
    }

    // Path traversal guard: resolve, then confirm the result is inside ROOT.
    const target = normalize(join(ROOT, pathname));
    if (target !== ROOT && !target.startsWith(ROOT + sep)) {
      res.writeHead(403, SECURITY_HEADERS).end('Forbidden');
      return;
    }

    let file = target;
    try {
      const s = await stat(file);
      if (s.isDirectory()) file = join(file, 'index.html');
    } catch {
      // Try adding .html for extensionless URLs.
      if (!extname(file)) {
        try { await stat(file + '.html'); file += '.html'; } catch { /* fall through to 404 */ }
      }
    }

    const body = await readFile(file);
    const type = TYPES[extname(file)] || 'application/octet-stream';

    // Range support. Safari refuses to play media from a server that does not
    // honour Range requests, so without this the hero video works everywhere
    // except Safari — and only in development, which is the worst place to
    // discover it.
    const range = req.headers.range;
    if (range && /^bytes=/.test(range)) {
      const [startRaw, endRaw] = range.replace('bytes=', '').split('-');
      const start = Number(startRaw) || 0;
      const end = endRaw ? Math.min(Number(endRaw), body.length - 1) : body.length - 1;

      if (start >= body.length || start > end) {
        res.writeHead(416, { ...headersFor(pathname), 'Content-Range': `bytes */${body.length}` }).end();
        return;
      }
      res.writeHead(206, {
        ...headersFor(pathname),
        'Content-Type': type,
        'Content-Range': `bytes ${start}-${end}/${body.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Cache-Control': 'no-store'
      }).end(body.subarray(start, end + 1));
      return;
    }

    res.writeHead(200, {
      ...headersFor(pathname),
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Content-Length': body.length,
      'Cache-Control': 'no-store'
    }).end(body);
  } catch (err) {
    const code = err.code === 'ENOENT' ? 404 : 500;
    res.writeHead(code, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' })
      .end(code === 404 ? 'Not found' : 'Server error');
  }
});

server.listen(PORT, () => {
  console.log(`V-Scale Exotics — http://localhost:${PORT}`);
  console.log('Serving with production security headers.');
});
