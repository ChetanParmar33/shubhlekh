// Records the live Shubh Vivah invitation (design 17) frame-by-frame at 900x1600 / 30 fps.
// A virtual clock replaces timers, rAF, Date and steps every CSS animation/transition, so each frame is exact
// no matter how slow the screenshot is. Actions (tap, scroll, scratch, language) are placed on that clock.
// Run: PUPPETEER_CORE=<path> node capture_invite.mjs   (Shubhlekh server on :8800, or BASE=…)
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
const pc = createRequire(import.meta.url)(process.env.PUPPETEER_CORE || 'puppeteer-core');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';

const FPS = 30, DUR = 22.4, OUT = new URL('frames/invite/', import.meta.url).pathname;
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });

const CLOCK = () => {
  let now = 0, id = 1; const timers = new Map(), rafs = new Map(), seen = new WeakSet();
  const RD = Date, base = RD.now();
  window.Date = class extends RD { constructor(...a) { a.length ? super(...a) : super(base + now); } static now() { return base + now; } };
  performance.now = () => now;
  window.setTimeout = (fn, ms = 0, ...a) => { const i = id++; timers.set(i, { t: now + Math.max(0, +ms || 0), fn, a }); return i; };
  window.setInterval = (fn, ms = 0, ...a) => { const i = id++; timers.set(i, { t: now + Math.max(1, +ms || 1), fn, a, every: Math.max(1, +ms || 1) }); return i; };
  window.clearTimeout = window.clearInterval = (i) => timers.delete(i);
  window.requestAnimationFrame = (fn) => { const i = id++; rafs.set(i, fn); return i; };
  window.cancelAnimationFrame = (i) => rafs.delete(i);
  const freeze = () => document.getAnimations().forEach((a) => { a.pause(); if (!seen.has(a)) { seen.add(a); a.currentTime = 0; } });
  window.__step = (dt) => {
    freeze(); // animations created since the last step start from 0, not from however long the screenshot took
    const end = now + dt;
    for (;;) {
      let pick = null;
      for (const [i, x] of timers) if (x.t <= end && (!pick || x.t < pick[1].t)) pick = [i, x];
      if (!pick) break;
      const [i, x] = pick; now = Math.max(now, x.t);
      if (x.every) x.t += x.every; else timers.delete(i);
      try { typeof x.fn === 'function' ? x.fn(...x.a) : 0; } catch (e) { console.error(e); }
    }
    now = end;
    const cbs = [...rafs.values()]; rafs.clear(); cbs.forEach((f) => { try { f(now); } catch (e) { console.error(e); } });
    freeze();
    document.getAnimations().forEach((a) => { a.currentTime = (a.currentTime || 0) + dt; });
  };
};

const b = await pc.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.setViewport({ width: 360, height: 640, deviceScaleFactor: 2.5, isMobile: true, hasTouch: false });
await p.evaluateOnNewDocument(CLOCK);
p.on('pageerror', (e) => console.error('pageerror', e.message));
await p.goto(`${process.env.BASE || 'http://localhost:8800'}/t/17/?lang=en`, { waitUntil: 'networkidle0' });
await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; const st = document.createElement('style'); st.textContent = '.skip{display:none!important}'; document.head.appendChild(st); await document.fonts.ready; document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); });
const step = (ms) => p.evaluate((m) => window.__step(m), ms);
await p.waitForNetworkIdle({ idleTime: 500, timeout: 20000 }).catch(() => {});
for (let i = 0; i < 30; i++) await step(33.333); // let the gate settle into its idle state
console.log('ready');

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const y = (sel, frac = 0.42) => p.evaluate((s, f) => { const e = document.querySelector(s); return e ? Math.max(0, e.getBoundingClientRect().top + scrollY - innerHeight * f) : 0; }, sel, frac);
let scroll = null, scratch = null, from = 0;
const scrollTo = async (sel, t0, t1, frac) => { from = await p.evaluate(() => scrollY); scroll = { a: from, b: sel === 0 ? 0 : await y(sel, frac), t0, t1 }; };

const ACTIONS = [
  [2.6, async () => p.click('#gate .b-btn')],                       // tap the lotus bud
  [8.8, async () => scrollTo('#date', 8.8, 9.9, 0.1)],
  [10.3, async () => { const r = await p.evaluate(() => { const c = document.querySelector('.scratch canvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; }); scratch = { ...r, t0: 10.3, t1: 11.9, down: false }; }],
  [13.8, async () => scrollTo('.cd-row', 13.8, 14.5, 0.38)],
  [15.2, async () => scrollTo('#events', 15.2, 16.0, 0.12)],
  [18.1, async () => p.click('.fab-lang')],
  [19.4, async () => scrollTo(0, 19.4, 19.44)],
];

const n = Math.round(DUR * FPS);
for (let f = 0; f < n; f++) {
  const t = f / FPS;
  while (ACTIONS.length && ACTIONS[0][0] <= t) await ACTIONS.shift()[1]();
  if (scroll) { const k = ease((t - scroll.t0) / (scroll.t1 - scroll.t0)); await p.evaluate((v) => scrollTo(0, v), scroll.a + (scroll.b - scroll.a) * k); if (t > scroll.t1) scroll = null; }
  if (scratch) {
    const s = scratch, k = (t - s.t0) / (s.t1 - s.t0);
    if (k >= 0 && k <= 1) {
      // zig-zag strokes across the card, like a finger rubbing it
      const rows = 6, row = Math.min(rows - 1, Math.floor(k * rows)), x01 = (k * rows) % 1, dir = row % 2 ? 1 - x01 : x01;
      const px = s.x + s.w * (0.08 + 0.84 * dir), py = s.y + s.h * (0.15 + 0.7 * (row + x01 * 0.9) / rows);
      // synthetic pointer events straight on the canvas (emulated mobile mouse input doesn't reach it)
      const lx = s.lx ?? px, ly = s.ly ?? py;
      await p.evaluate((x0, y0, x, y, first) => { const c = document.querySelector('.scratch canvas'), ev = (type, cx, cy) => c.dispatchEvent(new PointerEvent(type, { clientX: cx, clientY: cy, pointerId: 1, pointerType: 'touch', isPrimary: true, bubbles: true, buttons: 1 }));
        if (first) ev('pointerdown', x, y); for (let j = 1; j <= 4; j++) ev('pointermove', x0 + (x - x0) * j / 4, y0 + (y - y0) * j / 4); }, lx, ly, px, py, !s.down);
      s.down = true; s.lx = px; s.ly = py;
    } else if (k > 1 && s.down) { await p.evaluate(() => document.querySelector('.scratch canvas').dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))); scratch = null; }
  }
  await step(1000 / FPS);
  await p.screenshot({ path: `${OUT}${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  if (f % 60 === 0) process.stdout.write(`${f}/${n} `);
}
console.log('\n✓ invite frames', n);
await b.close();
