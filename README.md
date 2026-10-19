# Shubhlekh — digital wedding invitation platform

Customers pick one of 5 designs, fill in their details, preview for free, pay once (₹299 Classic / ₹499 Royal) and share an `/i/<name>` link. Guests RSVP; the couple sees replies in their dashboard.

| Part | Tech | Folder |
|---|---|---|
| Website + dashboard | React 19 + Vite + React Router | `web/` |
| API, invitation pages, payments | Node 22+ / Express 5, built-in `node:sqlite` | `server/` |
| The 5 invitation designs | Plain JS/CSS engine shared by all designs | `core/`, `samples/1…5/` |

## Run it

```bash
npm run install:all
npm run build          # builds web/ into web/dist
npm start              # http://localhost:8800  (serves API + site + invitations)
```

For development with hot reload, run `npm run dev:api` and `npm run dev:web` in two terminals, then open http://localhost:5173. Vite forwards `/api`, `/i`, `/t`, `/core` and `/uploads` to the API on :8800.

Locally, payments run in **test mode**: the publish window shows a "Complete test payment" button and no money moves. Test mode switches off automatically with `NODE_ENV=production`.

## Going live

1. Copy `server/.env.example` to `server/.env`.
2. Fill in `PUBLIC_URL`, `SESSION_SECRET`, `SUPPORT_EMAIL` and the brand name.
3. Add your **Razorpay** keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) and a webhook:
   - URL: `https://your-domain/api/webhooks/razorpay`
   - Event: `payment.captured`
   - Copy its secret into `RAZORPAY_WEBHOOK_SECRET`
4. Put the app behind HTTPS (nginx or Caddy) with `NODE_ENV=production`.
5. **Back up `server/data/`.** It holds the SQLite database and every uploaded photo.
6. Review the legal pages (`web/src/pages/Legal.jsx`): they are starting-point text only. Add your registered business name, address and GST details.

## What's included

- **Marketing site**
  - Pages: Home, Designs (live phone previews), Pricing with a comparison table, Contact (messages are saved in the database), Terms, Privacy, Refunds, and a real 404 page
  - Every route gets its own title, description and canonical tag from the server
  - Unknown URLs return HTTP 404
- **Accounts**
  - Signup and login with scrypt password hashes and signed httpOnly cookies
  - Changing your password signs out your other devices
  - Rate-limited login and signup
- **Editor**
  - 13 sections: design & link, couple, date & message, photos, events, venue, story, dress code, travel, families, RSVP & contact, wishes, guest links
  - Autosave and a live phone preview
  - Photos are resized on the phone before upload
- **Publishing**
  - Razorpay checkout with signature verification and webhook
  - Upgrading from Classic to Royal costs ₹200, the difference
  - Plan limits are enforced on the server, not just in the UI
- **Invitation pages** (`/i/<slug>`)
  - Built from the stored data and the chosen design
  - Correct WhatsApp preview for each couple (names, date and cover photo)
  - Drafts are visible only to their owner
  - Links go offline 15 days (Classic) or 60 days (Royal) after the last event
- **RSVP inbox**
  - Totals and guests per event
  - Search and filter
  - Personalised guest links (Royal)
  - CSV export (Royal), protected against spreadsheet formula injection

## Tests

```bash
npm test                                                     # API end-to-end (node:test, throwaway DB)
PUPPETEER_CORE=<path to puppeteer-core> node web/e2e.mjs     # browser walk-through; needs `npm start` running
```

## Changing things

| To change | Edit |
|---|---|
| Prices, plan limits or features | `PLANS` in `server/src/config.js` |
| Design catalog (names, tiers, languages) | `CATALOG` in `server/src/templates.js` |
| Brand name | `BRAND_NAME` in `.env`. The logo text in `web/index.html` and `web/og-card.html` is static. |
| Site share image | Edit `web/og-card.html`, then run `node web/make-og.mjs` with the server running |

The design photos are Creative Commons photos (credits at `/t/<n>/assets/img/credits.html`). Invitations that still use them show a "photo credits" link automatically.

## Not built yet

- Password reset by email (needs an email provider)
- An admin panel
- Invoices or GST receipts
