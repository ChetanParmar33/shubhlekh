// Renders stage.html frame-by-frame (1080x1920, 30 fps) with the invitation frames inside the phone.
// Run: PUPPETEER_CORE=<path> node capture_stage.mjs en|hi
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
const pc = createRequire(import.meta.url)(process.env.PUPPETEER_CORE || 'puppeteer-core');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const V = process.argv[2] || 'en', FPS = 30, DUR = 34.2, INV = 672, START = 3.2;
const DIR = new URL('.', import.meta.url).pathname, OUT = `${DIR}frames/stage-${V}/`;
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
const b = await pc.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars', '--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920 });
p.on('pageerror', (e) => console.error('pageerror', e.message));
await p.goto(`file://${DIR}stage.html?v=${V}`, { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
const n = Math.round(DUR * FPS);
for (let f = 0; f < n; f++) {
  const t = f / FPS, i = Math.max(0, Math.min(INV - 1, Math.round((t - START) * FPS)));
  await p.evaluate((t, src) => window.render(t, src), t, `file://${DIR}frames/invite/${String(i).padStart(4, '0')}.jpg`);
  await p.screenshot({ path: `${OUT}${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  if (f % 150 === 0) process.stdout.write(`${f}/${n} `);
}
console.log(`\n✓ stage-${V}`, n);
await b.close();
