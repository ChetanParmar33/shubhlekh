// Screenshot a design: node tools/shot.mjs <id> <lang> <outdir>  (server on :8800)
import { createRequire } from 'node:module';
const pc = createRequire(import.meta.url)(process.env.PUPPETEER_CORE || 'puppeteer-core');
const [id, lang = 'en', OUT = '/tmp'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await pc.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('response', (r) => r.status() >= 400 && !/favicon|\.mp3/.test(r.url()) && errs.push(r.status() + ' ' + r.url()));
await p.goto(`http://localhost:8800/t/${id}/?lang=${lang}`, { waitUntil: 'networkidle0' }); await sleep(1500);
await p.screenshot({ path: `${OUT}/${id}-${lang}-g0.png` });
await p.evaluate(() => document.querySelector('#gate button:not(.skip)')?.click());
for (const [ms, k] of [[900, 'g1'], [1100, 'g2'], [3200, 'h0']]) { await sleep(ms); await p.screenshot({ path: `${OUT}/${id}-${lang}-${k}.png` }); }
await p.evaluate(() => document.querySelector('.skip')?.click()); await sleep(1400);
let H = await p.evaluate(() => document.documentElement.scrollHeight), i = 0;
for (let y = 0; y < H && i < 16; y += 784) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(1300); await p.screenshot({ path: `${OUT}/${id}-${lang}-t${String(i++).padStart(2, '0')}.png` }); }
console.log(id, lang, 'frames', i, errs.length ? 'ERRS ' + errs.join(' | ') : 'ok');
await b.close();
