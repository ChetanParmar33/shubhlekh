// Renders og-card.html → public/og.jpg. Run `npm run build` first and keep the server on :8800 running (it serves the /t/ images).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const dist = new URL('./dist/og-card.html', import.meta.url).pathname;
fs.copyFileSync(new URL('./og-card.html', import.meta.url).pathname, dist);
const pc = createRequire(import.meta.url)(process.env.PUPPETEER_CORE || 'puppeteer-core');
const b = await pc.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630 });
await p.goto('http://localhost:8800/og-card.html');
await p.waitForNetworkIdle(); await new Promise((r) => setTimeout(r, 600));
await p.screenshot({ path: new URL('./public/og.jpg', import.meta.url).pathname, type: 'jpeg', quality: 85 });
await b.close();
fs.rmSync(dist);
