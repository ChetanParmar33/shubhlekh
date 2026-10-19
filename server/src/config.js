// Every setting comes from the environment (see .env.example) so nothing secret lives in code.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Project root: next to this file locally; in a bundled Netlify function the included files sit under the task root.
const here = import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd();
export const ROOT = [path.resolve(here, '..', '..'), process.cwd(), process.env.LAMBDA_TASK_ROOT].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, 'samples'))) || path.resolve(here, '..', '..');

const env = process.env;
const isProd = env.NODE_ENV === 'production';
if (isProd && (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32)) {
  throw new Error('SESSION_SECRET (32+ characters) is required in production');
}

export const config = {
  isProd,
  port: Number(env.PORT || 8800),
  host: env.HOST || '0.0.0.0',
  publicUrl: (env.PUBLIC_URL || env.URL || `http://localhost:${env.PORT || 8800}`).replace(/\/$/, ''), // Netlify sets URL
  brand: env.BRAND_NAME || 'Shubhlekh',
  supportEmail: env.SUPPORT_EMAIL || 'support@example.com',
  // Team WhatsApp number, digits with country code (e.g. 919876543210). Every "WhatsApp us" button on the site uses it.
  supportWhatsapp: String(env.SUPPORT_WHATSAPP || '').replace(/\D/g, ''),
  // Emails that can open /admin (paid orders, customer phone numbers, customisation requests).
  adminEmails: String(env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  sessionSecret: env.SESSION_SECRET || 'dev-only-secret-change-me-dev-only-secret',
  dataDir: path.resolve(env.DATA_DIR || path.join(ROOT, 'server', 'data')),
  // Postgres connection: Netlify DB sets NETLIFY_DATABASE_URL. Empty → local PGlite database in DATA_DIR.
  databaseUrl: env.NETLIFY_DATABASE_URL || env.DATABASE_URL || '',
  razorpay: { keyId: env.RAZORPAY_KEY_ID || '', keySecret: env.RAZORPAY_KEY_SECRET || '' },
  // Lets you finish the publish flow locally without a payment gateway. Never enabled in production.
  devPayments: !isProd && env.DEV_PAYMENTS !== '0',
  paths: {
    web: path.join(ROOT, 'web', 'dist'),
    samples: path.join(ROOT, 'samples'),
    core: path.join(ROOT, 'core'),
  },
};

// Plans are the single source of truth for prices and limits; the frontend reads them from /api/plans.
export const PLANS = {
  basic: {
    id: 'basic', name: 'Classic', price: 299,
    blurb: 'Everything a beautiful invitation needs.',
    templates: [], maxGallery: 6, guestLinks: false, csvExport: false, daysAfterEvent: 15,
    features: ['6 Classic designs', 'Our team sets up everything for you on WhatsApp', 'Customisation on request', 'Your photos (up to 6 in the gallery)', 'Music & sound effects', 'English + ગુજરાતી', 'RSVP inbox', 'Google Maps & calendar buttons', 'Live till 15 days after the event'],
  },
  premium: {
    id: 'premium', name: 'Royal', price: 499,
    blurb: 'Cinematic openings and every extra.',
    templates: [], maxGallery: 12, guestLinks: true, csvExport: true, daysAfterEvent: 60,
    features: ['All 12 designs, incl. 6 Royal designs', 'Our team sets up everything — priority', 'Unlimited customisation on request', 'Up to 12 gallery photos', 'Personalised guest links (“Dear Shah Family”)', 'Views & RSVP analytics', 'Download RSVPs as CSV', 'Unlimited edits', 'Live till 60 days after the event'],
  },
};

// Which designs each plan includes is derived from the catalog tiers (see templates.js).
