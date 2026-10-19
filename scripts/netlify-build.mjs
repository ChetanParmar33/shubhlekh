// Netlify build: assembles the static site in public/ — React app, the designs at /t, the engine at /core —
// pre-renders each marketing route with its own <title>/description, and lists design photos for the function.
// Run after `npm run build` (web/dist). Netlify runs it via `npm run build:netlify`.
import fs from 'node:fs';
import path from 'node:path';
import { renderSpa, PAGE_META } from '../server/src/pages.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), OUT = path.join(ROOT, 'public');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'web', 'dist'), OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'samples'), path.join(OUT, 't'), { recursive: true, filter: (f) => !f.endsWith('assets.json') });
fs.cpSync(path.join(ROOT, 'core'), path.join(OUT, 'core'), { recursive: true });

// design photo list for templates.js (the function bundle carries only each design's index.html + config.js)
const list = [];
for (const id of fs.readdirSync(path.join(ROOT, 'samples'))) {
  const img = path.join(ROOT, 'samples', id, 'assets', 'img');
  if (fs.existsSync(img)) for (const f of fs.readdirSync(img)) list.push(`${id}/assets/img/${f}`);
}
fs.writeFileSync(path.join(ROOT, 'samples', 'assets.json'), JSON.stringify(list));

for (const [route, meta] of Object.entries(PAGE_META)) {
  const dir = route === '/' ? OUT : path.join(OUT, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderSpa(route, meta));
}
fs.writeFileSync(path.join(OUT, '404.html'), renderSpa('/404', null)); // Netlify serves it with a real 404; the SPA shows "not found"
console.log('public/ ready:', Object.keys(PAGE_META).length, 'pages,', list.length, 'design photos listed');
