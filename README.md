# Shubhlekh — digital wedding invitation platform

Customers preview 12 designs for free, buy a plan once (₹299 Classic / ₹499 Royal), and our team sets up the invitation for them on WhatsApp. Customers can also edit it themselves. They share an `/i/<name>` link, guests RSVP, and the couple sees the replies in their dashboard.

Live: https://shubhlekh.netlify.app

| Part | Tech | Folder |
|---|---|---|
| Website + dashboard | React 19 + Vite + React Router | `web/` |
| API, invitation pages, payments | Node 22+ / Express 5, Postgres | `server/` |
| The 12 invitation designs (6–17) | Plain JS/CSS engine shared by all designs, English + ગુજરાતી | `core/`, `samples/6…17/` |
| Hosting | Netlify: static site + one function, Netlify Blobs for photos, Neon Postgres | `netlify.toml`, `netlify/`, `scripts/netlify-build.mjs` |
| Promo videos | Frame-exact capture + synthesised music | `marketing/` |

Designs 1–5 are older ones. They are hidden from the catalog but still render for existing invitations.

## Run it locally

```bash
npm run install:all
npm run build          # builds web/ into web/dist
npm start              # http://localhost:8800  (serves API + site + invitations)
```

For development with hot reload, run `npm run dev:api` and `npm run dev:web` in two terminals, then open http://localhost:5173. Vite forwards `/api`, `/i`, `/t`, `/core` and `/uploads` to the API on :8800.

Locally, the database is PGlite (Postgres in WASM) in `server/data/pg`, and photos are stored in `server/data/uploads`. Without Razorpay keys, payments run in **test mode**: the plan window shows a "Complete test payment" button and no money moves. With keys in `server/.env`, local checkout uses the Razorpay test or live account those keys belong to.

## Deploy (Netlify)

Deploy with `netlify deploy --build --prod`, or link the GitHub repo in Netlify to deploy on every push.

1. `scripts/netlify-build.mjs` assembles `public/`:
   - the React app
   - the designs at `/t`
   - the engine at `/core`
   - each marketing route pre-rendered with its own title and description
2. `netlify.toml` rewrites `/api/*`, `/i/*` and `/uploads/*` to the `api` function, which runs the Express app (`server/src/netlify.js`).
3. Set these environment variables on the Netlify project:

| Variable | What |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon, pooled) |
| `SESSION_SECRET` | 32+ random characters |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API keys (test or live) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook `https://<site>/api/webhooks/razorpay`, event `payment.captured` |
| `ADMIN_EMAILS` | Comma-separated team accounts that see `/dashboard/team` |
| `SUPPORT_WHATSAPP` | Team WhatsApp number with country code (e.g. `919876543210`) — every "WhatsApp us" button |
| `SUPPORT_EMAIL`, `BRAND_NAME` | Shown on the site |

Inside the function, production mode is detected automatically. Don't set `NODE_ENV` for the build, or Vite won't be installed.

Before taking real money:
- Switch to Razorpay live keys.
- Review the legal pages in `web/src/pages/Legal.jsx`. They are starting-point text only. Add your registered business name, address and GST details.

## What's included

- **Marketing site**
  - Home, Designs (live phone previews, no sign-up needed), Pricing, Contact, Terms, Privacy, Refunds, and a real 404 page
  - WhatsApp buttons everywhere, including a floating one
- **Done-for-you flow**
  - The customer buys a plan.
  - Our team gets the order, with the customer's WhatsApp number, on `/dashboard/team`.
  - The team builds the invitation and moves its status along: new → contacted → building → ready.
  - The customer sees that status in their dashboard.
- **Accounts**
  - Signup (with WhatsApp number) and login, with scrypt password hashes and signed httpOnly cookies
  - Changing your password signs you out on other devices
  - Rate-limited login and signup
- **Editor** (unlocks after buying a plan)
  - 13 sections, each text field in English and ગુજરાતી
  - Autosave and a live phone preview
  - Customisation requests to the team
- **Payments**
  - Razorpay checkout with signature verification and a webhook
  - Upgrading from Classic to Royal costs the difference
  - Plan limits are enforced on the server
- **Invitation pages** (`/i/<slug>`)
  - Correct WhatsApp preview for each couple
  - Drafts are visible only to their owner
  - Links go offline 15 days (Classic) or 60 days (Royal) after the last event
- **RSVP inbox**
  - Totals per event, search, personalised guest links and CSV export (Royal)

## Tests

```bash
npm test                                                     # API end-to-end (node:test, in-memory PGlite)
PUPPETEER_CORE=<path to puppeteer-core> node web/e2e.mjs     # browser walk-through; needs `npm start` without Razorpay keys
```

## Changing things

| To change | Edit |
|---|---|
| Prices, plan limits or features | `PLANS` in `server/src/config.js` |
| Design catalog (names, tiers, languages) | `CATALOG` in `server/src/templates.js` |
| Design content / pages | `tools/build_samples.py`, then each `samples/<n>/theme.js` + `theme.css` |
| Design music | `tools/synth.py` |
| Design preview images | `tools/og.py` (from `tools/shot.mjs` screenshots) |
| Site share image | Edit `web/og-card.html`, then run `node web/make-og.mjs` with the server running |

The design photos are Creative Commons photos (credits at `/t/<n>/assets/img/credits.html`). Invitations that still use them show a "photo credits" link automatically.

## Not built yet

- Password reset by email (needs an email provider)
- Invoices or GST receipts
