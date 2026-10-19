// Browser walk-through of the whole product. Server must be running (npm start) with DEV_PAYMENTS on.
//   PUPPETEER_CORE=<path> node web/e2e.mjs [outDir]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pc = require(process.env.PUPPETEER_CORE || 'puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8800';
const OUT = process.argv[2] || '/tmp';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) failed++; };

const b = await pc.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const errs = [];
const page = async (w = 390) => {
  const p = await b.newPage(); await p.setViewport({ width: w, height: w < 600 ? 844 : 900, isMobile: w < 600, hasTouch: w < 600 });
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/favicon|ERR_ABORTED|net::/.test(m.text()) && errs.push(m.text()));
  return p;
};
const clickText = (p, sel, text) => p.evaluate((s, t) => { const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim().includes(t)); el?.click(); return !!el; }, sel, text);

// marketing pages
for (const w of [390, 1366]) {
  const p = await page(w);
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' }); await sleep(1200);
  await p.screenshot({ path: `${OUT}/home-${w}.png` });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(120); }
  await sleep(800); await p.evaluate(() => scrollTo(0, 0)); await sleep(300);
  await p.screenshot({ path: `${OUT}/home-${w}-full.png`, fullPage: true });
  ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, `home: no sideways scroll at ${w}`);
  for (const path of ['/templates', '/pricing', '/contact', '/terms', '/login']) { await p.goto(BASE + path, { waitUntil: 'networkidle0' }); await sleep(500); await p.screenshot({ path: `${OUT}/page${path.replace('/', '-')}-${w}.png`, fullPage: true }); }
  await p.close();
}

// signup with a chosen design → editor
const owner = await page(1366);
await owner.goto(BASE + '/templates', { waitUntil: 'networkidle0' }); await sleep(600);
await owner.click('.tpl-card:nth-child(2) .tpl-thumb'); await sleep(1500);
ok(await owner.$eval('.preview-modal', (d) => d.open), 'template preview opens');
await owner.screenshot({ path: `${OUT}/preview-modal.png` });
await clickText(owner, '.preview-modal a', 'Use this design'); await owner.waitForSelector('.auth-card');
const email = `e2e${Date.now()}@example.com`;
await owner.type('input[name=name]', 'Riya Sharma'); await owner.type('input[name=phone]', '98765 43210'); await owner.type('input[name=email]', email); await owner.type('input[name=password]', 'secret1234');
await owner.click('.auth-card button.btn-primary');
await owner.waitForSelector('.editor', { timeout: 15000 }); await sleep(2500);
ok(/\/dashboard\/edit\/\d+/.test(owner.url()), 'signup lands in the editor with the chosen design');
ok(await owner.$('.paywall') !== null, 'editor asks for a plan before personalising');
await owner.screenshot({ path: `${OUT}/editor-paywall.png` });

// buy the plan first (test payment)
await clickText(owner, '.paywall button', 'Choose a plan'); await sleep(1200);
ok(await owner.$eval('.publish', (d) => d.open), 'plan dialog');
await owner.screenshot({ path: `${OUT}/plan-dialog.png` });
await clickText(owner, '.publish button', 'Pay'); await sleep(1500);
await clickText(owner, '.publish button', 'Complete test payment'); await sleep(1500);
ok(await owner.evaluate(() => /plan is active/.test(document.querySelector('.publish').textContent)), 'plan active after test payment');
ok(await owner.evaluate(() => /our team will whatsapp you/i.test(document.querySelector('.publish').textContent)), 'told our team will contact them');
await owner.screenshot({ path: `${OUT}/plan-done.png` });
await clickText(owner, '.publish button', 'Close'); await sleep(1200);
ok(await owner.$('.team-card') !== null, 'team status card in editor');
await owner.screenshot({ path: `${OUT}/editor-1.png` });

// edit names (English + ગુજરાતી)
const setField = async (label, value, second) => owner.evaluate((l, v, two) => {
  const lab = [...document.querySelectorAll('.fld label')].find((x) => x.textContent.trim() === l);
  const input = two ? lab.parentElement.querySelectorAll('input, textarea')[1] : document.getElementById(lab.htmlFor);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
  setter.call(input, v); input.dispatchEvent(new Event('input', { bubbles: true }));
}, label, value, !!second);
await setField('Groom’s name', 'Arjun'); await setField('Bride’s name', 'Riya'); await setField('Groom’s name', 'અર્જુન', true);
await sleep(3500);
ok((await owner.$eval('.save-state', (e) => e.textContent)) === 'All changes saved', 'autosave');
const frameTitle = await owner.evaluate(() => new Promise((r) => { const f = document.querySelector('.ed-preview iframe'); setTimeout(() => r(f.contentDocument?.querySelector('h1')?.textContent || ''), 2500); }));
ok(/Arjun/.test(frameTitle) && /Riya/.test(frameTitle), 'live preview shows new names');
const guName = await owner.evaluate(async () => (await (await fetch(location.pathname.replace('/dashboard/edit/', '/api/invitations/'))).json()).data.groom.name.gu);
ok(guName === 'અર્જુન', 'Gujarati name saved');

// photo upload (a generated JPEG)
await owner.evaluate(() => [...document.querySelectorAll('.ed-index button')].find((x) => x.textContent === 'Photos').click()); await sleep(500);
const jpg = await owner.evaluate(() => { const c = document.createElement('canvas'); c.width = 800; c.height = 600; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 800, 600); gr.addColorStop(0, '#e4572e'); gr.addColorStop(1, '#2d1b2f'); g.fillStyle = gr; g.fillRect(0, 0, 800, 600); return c.toDataURL('image/jpeg', .9).split(',')[1]; });
const fs = await import('node:fs');
fs.writeFileSync(`${OUT}/test-photo.jpg`, Buffer.from(jpg, 'base64'));
const fileInput = await owner.$('.photo-fld input[type=file]');
await fileInput.uploadFile(`${OUT}/test-photo.jpg`); await sleep(2500);
ok(await owner.$eval('.photo-fld img', (i) => i.src.includes('/uploads/')), 'photo upload');
await sleep(2000);
await owner.screenshot({ path: `${OUT}/editor-photos.png` });

// customisation request to our team
await owner.evaluate(() => [...document.querySelectorAll('.ed-index button')].find((x) => x.textContent === 'Customisation help').click()); await sleep(500);
await owner.type('#cz-msg', 'Please make the gate a little more pink.'); await owner.type('#cz-ph', '+91 98765 43210');
await clickText(owner, '.ed-sec button', 'Send request'); await sleep(1200);
ok(await owner.$eval('.cz-list', (e) => /more pink/.test(e.textContent)), 'customisation request sent');
await owner.screenshot({ path: `${OUT}/editor-customise.png` });

// publish (free once the plan is bought)
await clickText(owner, '.ed-bar button', 'Publish'); await sleep(1800);
ok(await owner.$('.ed-live') !== null, 'published');
await owner.screenshot({ path: `${OUT}/published.png` });
const link = await owner.$eval('.ed-live .share-box input', (i) => i.value);

// guest opens and RSVPs
const guest = await (async () => { const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true }); p.on('pageerror', (e) => errs.push(e.message)); return p; })();
await guest.goto(link.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: 'networkidle0' }); await sleep(2000);
await guest.evaluate(() => document.querySelector('#gate button:not(.skip)')?.click()); await sleep(3500);
await guest.evaluate(() => document.querySelector('.skip')?.click()); await sleep(1500);
ok(/Arjun/.test(await guest.$eval('h1', (e) => e.textContent)), 'guest sees the published invitation');
await guest.screenshot({ path: `${OUT}/guest-hero.png` });
await guest.type('.rsvp-card [name=name]', 'Sharma Family');
await guest.$eval('.rsvp-card [name=attending][value=yes]', (e) => e.click());
await guest.$eval('[data-step="1"]', (e) => e.click()); await guest.$eval('[data-step="1"]', (e) => e.click());
await guest.$eval('.rsvp-card [type=submit]', (e) => e.click()); await sleep(1500);
ok(await guest.$eval('.rsvp-done', (e) => !e.hidden), 'guest RSVP saved');

// owner inbox
await owner.goto(BASE + '/dashboard', { waitUntil: 'networkidle0' }); await sleep(800);
await owner.screenshot({ path: `${OUT}/dashboard.png`, fullPage: true });
await clickText(owner, 'a', 'RSVPs'); await owner.waitForSelector('.kpis'); await sleep(600);
ok(/Sharma Family/.test(await owner.$eval('.rsvp-list', (e) => e.textContent)), 'RSVP appears in the inbox');
ok((await owner.$eval('.kpi b', (e) => e.textContent)) === '3', 'guest total = 3');
await owner.screenshot({ path: `${OUT}/inbox.png`, fullPage: true });

// mobile editor
const m = await page(390);
await m.setCookie(...(await owner.cookies()));
await m.goto(owner.url().replace(/\/dashboard.*/, '/dashboard'), { waitUntil: 'networkidle0' });
await clickText(m, 'a', 'Edit'); await m.waitForSelector('.editor'); await sleep(1500);
await m.screenshot({ path: `${OUT}/editor-mobile.png` });
ok(await m.evaluate(() => document.documentElement.scrollWidth) <= 390, 'mobile editor: no sideways scroll');

ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''));
await b.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
