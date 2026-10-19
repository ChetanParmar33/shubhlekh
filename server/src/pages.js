// Per-route <title>/description/canonical injected into the built SPA, so crawlers and link previews see the right page.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const b = () => config.brand;
export const PAGE_META = {
  '/': { title: () => `${b()} — Digital wedding invitations with cinematic openings`, desc: 'Create a moving, music-filled wedding invitation website in minutes. 12 handcrafted designs in English and ગુજરાતી, RSVP inbox, maps and WhatsApp sharing. One-time ₹299 or ₹499.' },
  '/templates': { title: () => `Invitation designs · ${b()}`, desc: 'Twelve handcrafted wedding invitation designs — kankotri, panetar, patola, raas garba, haveli, stepwell and more — each with its own opening animation and music. Preview them all free.' },
  '/pricing': { title: () => `Pricing · ${b()}`, desc: 'Two simple one-time plans: Classic ₹299 and Royal ₹499. No subscription.' },
  '/contact': { title: () => `Contact · ${b()}`, desc: `Questions about your invitation? Write to the ${'team'}.` },
  '/terms': { title: () => `Terms of service · ${b()}`, desc: 'Terms for using the service.' },
  '/privacy': { title: () => `Privacy policy · ${b()}`, desc: 'How we handle your and your guests’ data.' },
  '/refunds': { title: () => `Refund policy · ${b()}`, desc: 'Cancellations and refunds.' },
  '/login': { title: () => `Log in · ${b()}`, desc: 'Log in to manage your invitations.', noindex: true },
  '/signup': { title: () => `Create your account · ${b()}`, desc: 'Sign up free, preview every design and buy a plan when you are ready to personalise.', noindex: true },
  '/dashboard': { title: () => `Dashboard · ${b()}`, desc: 'Your invitations.', noindex: true },
};

let cached;
function shell() {
  if (cached && config.isProd) return cached;
  const file = path.join(config.paths.web, 'index.html');
  cached = fs.existsSync(file) ? fs.readFileSync(file, 'utf8')
    : '<!doctype html><html><head><title></title></head><body><p style="font-family:system-ui;padding:40px">Frontend not built yet — run <code>npm run build</code> (or use the Vite dev server on :5173).</p></body></html>';
  return cached;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function renderSpa(pathname, meta) {
  const m = meta || { title: () => `Page not found · ${b()}`, desc: '', noindex: true };
  const head = `<title>${esc(m.title())}</title>
<meta name="description" content="${esc(m.desc)}">
${m.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${config.publicUrl}${pathname === '/' ? '/' : pathname}">`}
<meta property="og:title" content="${esc(m.title())}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:image" content="${config.publicUrl}/og.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">`;
  return shell().replace(/<title>[^<]*<\/title>/, head);
}
