/**
 * Production server: serves the built app (dist/) and the API.
 *   npm run build && npm run start
 * Any Node host works; for GDPR-first deployments choose an EU region.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createApiHandler } from './api.mjs';
import { loadDotEnv } from './config.mjs';

const env = { ...loadDotEnv(), ...process.env };
const api = createApiHandler(env);
const DIST = resolve(process.cwd(), 'dist');
const PORT = Number(env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain',
};

if (!existsSync(DIST)) {
  console.error('No dist/ folder. Run "npm run build" first.');
  process.exit(1);
}

createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  api(req, res, () => {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    let file = join(DIST, path);
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
    const ext = extname(file);
    res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', file.includes(`${DIST}/assets/`) ? 'public, max-age=31536000, immutable' : 'no-cache');
    createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log(`Lumetta running on http://localhost:${PORT}`));
