// Template catalog + turning a stored invitation into the INVITE config the template engine reads.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { config, PLANS } from './config.js';

// The public catalog. Royal designs need the Royal plan; Classic designs work with either plan.
export const CATALOG = [
  { id: 6, key: 'kankotri', name: 'Kankotri', tagline: 'A classic red-and-turmeric card that opens with a kumkum tilak', category: 'Traditional', tier: 'basic', lang2: 'gu', colors: ['#b3121f', '#f6c21a', '#fff4dc'] },
  { id: 7, key: 'panetar', name: 'Panetar', tagline: 'Bridal white and red, bandhani dots that bloom one by one', category: 'Textile', tier: 'premium', lang2: 'gu', colors: ['#fffaf4', '#b0141e', '#d4a24c'] },
  { id: 8, key: 'gharchola', name: 'Gharchola', tagline: 'Zari checks weave themselves across festive red and green', category: 'Textile', tier: 'basic', lang2: 'gu', colors: ['#7d0d16', '#1f6b3a', '#e2b54e'] },
  { id: 9, key: 'patola', name: 'Patola', tagline: 'Double-ikat threads slide in to form the pattern', category: 'Textile', tier: 'basic', lang2: 'gu', colors: ['#5b1236', '#f2b134', '#1d7a6b'] },
  { id: 10, key: 'raas-garba', name: 'Raas Garba', tagline: 'A glowing garbo spins and dandiyas clash under the night sky', category: 'Festive', tier: 'premium', lang2: 'gu', colors: ['#14112e', '#ff3d8b', '#ffb21e'] },
  { id: 11, key: 'safed-rann', name: 'Safed Rann', tagline: 'Full moon over the white salt desert, mirror-work sparkle', category: 'Heritage', tier: 'premium', lang2: 'gu', colors: ['#0d1b3d', '#f4f7ff', '#9fb4d8'] },
  { id: 12, key: 'pol-haveli', name: 'Pol ni Haveli', tagline: 'Carved wooden doors swing open, pigeons take flight', category: 'Heritage', tier: 'premium', lang2: 'gu', colors: ['#5a3a22', '#2c4a8a', '#e8a33d'] },
  { id: 13, key: 'uttarayan', name: 'Uttarayan', tagline: 'Kites soar across a bright sky and their strings write your names', category: 'Festive', tier: 'basic', lang2: 'gu', colors: ['#6ec6f5', '#ff5a5f', '#ffd23f'] },
  { id: 14, key: 'vav', name: 'Vav', tagline: 'Descend the carved stepwell as diyas light up each level', category: 'Heritage', tier: 'premium', lang2: 'gu', colors: ['#c99a62', '#16585e', '#f3e3c3'] },
  { id: 15, key: 'shreeji', name: 'Shreeji', tagline: 'Pichwai lotuses bloom and a peacock spreads its feathers', category: 'Devotional', tier: 'premium', lang2: 'gu', colors: ['#0e3b2e', '#e46aa0', '#e8c25b'] },
  { id: 16, key: 'kesudo', name: 'Kesudo', tagline: 'Modern pastel with a soft rain of flame-of-the-forest flowers', category: 'Modern', tier: 'basic', lang2: 'gu', colors: ['#fdf6ee', '#f26b1d', '#8aa58c'] },
  { id: 17, key: 'jain-shubh-vivah', name: 'Shubh Vivah', tagline: 'Serene white and gold, a lotus opens in light', category: 'Devotional', tier: 'basic', lang2: 'gu', colors: ['#fffdf7', '#c9a14a', '#e9dcc0'] },
];
// Older designs: no longer offered, but invitations already made with them keep working.
const LEGACY = [
  { id: 1, key: 'chandni-mahal', name: 'Chandni Mahal', tier: 'premium', lang2: 'hi' }, { id: 2, key: 'genda-phool', name: 'Genda Phool', tier: 'basic', lang2: 'pa' },
  { id: 3, key: 'rajwada', name: 'Rajwada', tier: 'premium', lang2: 'hi' }, { id: 4, key: 'mehndi-bagh', name: 'Mehndi Bagh', tier: 'basic', lang2: 'ur' }, { id: 5, key: 'kanjivaram', name: 'Kanjivaram', tier: 'basic', lang2: 'ta' },
];
PLANS.basic.templates = CATALOG.filter((t) => t.tier === 'basic').map((t) => t.id);
PLANS.premium.templates = [...CATALOG.map((t) => t.id), ...LEGACY.map((t) => t.id)];
PLANS.basic.templates.push(...LEGACY.filter((t) => t.tier === 'basic').map((t) => t.id));
const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const templateById = (id) => CATALOG.find((t) => t.id === Number(id)) || LEGACY.find((t) => t.id === Number(id));
export const isOffered = (id) => CATALOG.some((t) => t.id === Number(id));

// Each sample's config.js assigns window.INVITE; evaluate it in a sandbox to get the defaults.
const defaultsCache = new Map();
export function templateDefaults(id) {
  if (!defaultsCache.has(id)) {
    const src = fs.readFileSync(path.join(config.paths.samples, String(id), 'config.js'), 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(src, sandbox, { timeout: 500 });
    defaultsCache.set(id, JSON.parse(JSON.stringify(sandbox.window.INVITE)));
  }
  return structuredClone(defaultsCache.get(id));
}

const LANG_KEYS = new Set(['en', 'hi', 'pa', 'ur', 'ta', 'gu']);
const isLangObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'en' in v && Object.keys(v).every((k) => LANG_KEYS.has(k));
// Keep the design's own second-language text ({ en, gu }) so the editor can show both; other languages are dropped.
function forEditor(v, l2) {
  if (isLangObj(v)) return v[l2] ? { en: v.en, [l2]: v[l2] } : v.en;
  if (Array.isArray(v)) return v.map((x) => forEditor(x, l2));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forEditor(x, l2)]));
  return v;
}
// English text of a field that may be { en, gu } — for titles, slugs and meta tags.
export const plain = (v) => (v && typeof v === 'object' ? v.en || '' : v || '');

// The fields a customer can edit. Starts as the template's demo content so the editor is never empty.
export function starterData(id) {
  const d = templateDefaults(id);
  const pick = forEditor({
    groom: d.groom, bride: d.bride, monogram: d.monogram, hashtag: d.hashtag, invocation: d.invocation, heroLine: d.heroLine,
    date: d.date, city: d.city, message: d.message, photos: d.photos, story: d.story, events: d.events, venue: d.venue,
    dress: d.dress, travel: d.travel, families: d.families, wishes: d.wishes, contact: d.contact,
  }, templateById(id).lang2);
  pick.rsvp = { deadline: d.rsvp.deadline, maxGuests: d.rsvp.maxGuests };
  pick.guests = [];          // [{ token, label }] personalised links (Royal plan)
  pick.secondLanguage = true;
  pick.music = true;
  return pick;
}

/* ── validation of what the editor sends ── */
const str = (v, max = 300) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max).trim();
const safeText = (v, max) => str(v, max).replace(/[<>"'&`]/g, '');          // for fields templates drop into SVG/markup
const PHOTO = /^(\/uploads\/[a-z0-9]{12,40}\.(jpg|png|webp)|assets\/img\/[a-z0-9-]{2,40}\.webp)$/;
let photoTemplate = 0; // assets/ paths are relative to a template folder; they must exist in the chosen one
const photo = (v) => { const s = String(v || ''); if (!PHOTO.test(s)) return ''; if (s.startsWith('assets/') && !fs.existsSync(path.join(config.paths.samples, String(photoTemplate), s))) return ''; return s; };
const color = (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v || '')) ? String(v) : '#999999');
const isoDate = (v) => { const s = str(v, 40); return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\+05:30|Z|[+-]\d{2}:\d{2})$/.test(s) && !isNaN(Date.parse(s)) ? s : null; };
const ICONS = new Set(['mehndi', 'haldi', 'sangeet', 'wedding', 'reception', 'rings', 'gurdwara', 'moon', 'lamp']);
const TRAVEL_ICONS = new Set(['plane', 'stay', 'boat', 'car']);
const list = (v, max, fn) => (Array.isArray(v) ? v.slice(0, max).map(fn).filter(Boolean) : []);

export function sanitizeData(input, starter, template) {
  photoTemplate = template;
  const d = input && typeof input === 'object' ? input : {};
  // bilingual text: a plain string, or { en, <design's second language> }
  const l2 = templateById(template)?.lang2;
  const bi = (fn) => (v, max) => (v && typeof v === 'object' && !Array.isArray(v) ? (l2 ? { en: fn(v.en, max), [l2]: fn(v[l2], max) } : fn(v.en, max)) : fn(v, max));
  const S = bi(str), ST = bi(safeText);
  const person = (p = {}) => ({ name: ST(p.name, 40), parents: S(p.parents, 160) });
  const out = {
    groom: person(d.groom), bride: person(d.bride),
    monogram: str(d.monogram, 12).replace(/[<>"'`]/g, ''), // '&' is fine as text; markup characters are not
    hashtag: safeText(d.hashtag, 40), invocation: safeText(d.invocation, 60), heroLine: S(d.heroLine, 80),
    date: isoDate(d.date) || starter.date, city: S(d.city, 60), message: S(d.message, 600),
    photos: {
      hero: photo(d.photos?.hero), invite: photo(d.photos?.invite), venue: photo(d.photos?.venue), end: photo(d.photos?.end),
      gallery: list(d.photos?.gallery, 12, (g) => (photo(g?.src) ? { src: photo(g.src), alt: str(g.alt, 80) } : null)),
    },
    story: list(d.story, 6, (s) => ({ when: S(s?.when, 40), title: S(s?.title, 80), text: S(s?.text, 400), photo: photo(s?.photo) })),
    events: list(d.events, 8, (e, i) => {
      const start = isoDate(e?.start); if (!start) return null;
      return { id: safeText(e?.id, 24).replace(/\s/g, '') || `ev${i}`, icon: ICONS.has(e?.icon) ? e.icon : 'wedding', name: S(e?.name, 50), start,
        hours: Math.min(24, Math.max(1, Number(e?.hours) || 3)), venue: S(e?.venue, 100), address: str(e?.address, 200), note: S(e?.note, 160),
        main: !!e?.main, ...(e?.color ? { color: color(e.color) } : {}) };
    }),
    venue: { name: S(d.venue?.name, 100), address: str(d.venue?.address, 200), map: str(d.venue?.map, 160) },
    dress: list(d.dress, 8, (x) => ({ event: safeText(x?.event, 24), colors: list(x?.colors, 4, color), text: S(x?.text, 120) })),
    travel: list(d.travel, 4, (x) => ({ icon: TRAVEL_ICONS.has(x?.icon) ? x.icon : 'car', title: S(x?.title, 40), text: S(x?.text, 300) })),
    families: {
      bride: { title: S(d.families?.bride?.title, 60), names: S(d.families?.bride?.names, 300) },
      groom: { title: S(d.families?.groom?.title, 60), names: S(d.families?.groom?.names, 300) },
    },
    wishes: list(d.wishes, 10, (w) => (plain(w?.text) ? { name: str(w?.name, 40), text: S(w?.text, 200) } : null)),
    contact: { name: S(d.contact?.name, 60), phone: str(d.contact?.phone, 20).replace(/[^\d+ ]/g, '') },
    rsvp: { deadline: isoDate(d.rsvp?.deadline), maxGuests: Math.min(20, Math.max(1, Number(d.rsvp?.maxGuests) || 6)) },
    guests: list(d.guests, 300, (g) => (/^[a-z0-9]{4,12}$/.test(g?.token) && str(g?.label) ? { token: g.token, label: str(g.label, 60) } : null)),
    secondLanguage: d.secondLanguage !== false,
    music: d.music !== false,
  };
  if (!out.events.length) out.events = starter.events;
  if (!out.events.some((e) => e.main)) out.events[0].main = true;
  return out;
}

/* ── stored invitation → INVITE config for the engine ── */
function deepMerge(base, over) {
  if (Array.isArray(over) || over === null || typeof over !== 'object') return over === undefined ? base : over;
  const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(out[k], v);
  return out;
}
function absolutize(v, prefix) {
  if (typeof v === 'string') return v.startsWith('assets/') ? prefix + v : v;
  if (Array.isArray(v)) return v.map((x) => absolutize(x, prefix));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolutize(x, prefix)]));
  return v;
}

export function buildInviteConfig(inv, { preview = false } = {}) {
  const tpl = templateById(inv.template);
  const defaults = templateDefaults(inv.template);
  const data = JSON.parse(inv.data);
  const { guests, secondLanguage, music, photos, ...rest } = data;
  const merged = deepMerge(defaults, rest);
  // empty photo slots fall back to the template's own pictures
  merged.photos = { ...defaults.photos, ...Object.fromEntries(Object.entries(photos || {}).filter(([, v]) => (Array.isArray(v) ? v.length : v))) };
  // empty story photos / gallery borrow the design's own pictures so nothing renders broken
  merged.story = (merged.story || []).map((st, i) => (st.photo ? st : { ...st, photo: defaults.story[i % defaults.story.length]?.photo || defaults.photos.invite }));
  if (!merged.photos.gallery?.length) merged.photos.gallery = defaults.photos.gallery;
  merged.id = 'i' + inv.id;
  merged.langs = secondLanguage ? ['en', tpl.lang2] : ['en'];
  merged.guests = Object.fromEntries((guests || []).map((g) => [g.token, g.label]));
  merged.siteUrl = `${config.publicUrl}/i/${inv.slug}`;
  merged.rsvp = { ...merged.rsvp, endpoint: preview ? '' : `/api/i/${encodeURIComponent(inv.slug)}/rsvp` };
  const usesDemoPhotos = JSON.stringify([merged.photos, merged.story]).includes('assets/img/');
  merged.credits = `Made with ${escapeHtml(config.brand)}` + (usesDemoPhotos ? ` · <a href="/t/${inv.template}/assets/img/credits.html">photo credits</a>` : '');
  if (!music) merged.media = { ...merged.media, music: '', sfx: {} };
  return absolutize(merged, `/t/${inv.template}/`);
}
