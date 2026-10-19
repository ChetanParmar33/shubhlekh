import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config, PLANS } from './config.js';
import { hashPassword, verifyPassword, setSession, clearSession, sessionMiddleware, requireUser, rateLimit } from './auth.js';
import { CATALOG, templateById, isOffered, starterData, sanitizeData, buildInviteConfig, plain } from './templates.js';
import { paymentMode, createRazorpayOrder, verifyCheckoutSignature, verifyWebhook } from './payments.js';
import { renderSpa, PAGE_META } from './pages.js';
import { NOW } from './db.js';
import { uploads } from './storage.js';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
// Indian 10-digit numbers get +91; anything else must already carry a country code. Stored as +<digits>.
const whatsapp = (v) => { const d = String(v || '').replace(/\D/g, '').replace(/^0+/, ''); const n = d.length === 10 ? '91' + d : d; return /^\d{11,15}$/.test(n) ? '+' + n : ''; };
const TEAM_STATUS = new Set(['new', 'contacted', 'building', 'ready']);
const RESERVED = new Set(['admin', 'api', 'login', 'signup', 'dashboard', 'templates', 'pricing', 'demo', 'new', 'edit', 'preview', 'support', 'help']);
const randomToken = (n) => crypto.randomBytes(n).toString('base64url').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, n);
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Frame-Options': 'SAMEORIGIN', // the dashboard previews invitations in an iframe from the same origin
    });
    if (config.isProd) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Webhook needs the raw body for its signature, so it is mounted before express.json().
  app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json', limit: '200kb' }), async (req, res) => {
    if (!verifyWebhook(req.body.toString(), req.get('x-razorpay-signature'))) return res.status(400).end();
    const evt = JSON.parse(req.body.toString());
    const p = evt?.payload?.payment?.entity;
    if (evt.event === 'payment.captured' && p?.order_id) await markPaid(p.order_id, p.id);
    res.json({ ok: true });
  });

  app.use(express.json({ limit: '300kb' }));
  app.use(sessionMiddleware(db));

  const S = (sql) => ({ get: (...p) => db.get(sql, ...p), all: (...p) => db.all(sql, ...p), run: (...p) => db.run(sql, ...p) });
  const q = {
    userByEmail: S('SELECT * FROM users WHERE email = ?'),
    userById: S('SELECT * FROM users WHERE id = ?'),
    createUser: S('INSERT INTO users (name, email, pass_hash, phone) VALUES (?, ?, ?, ?) RETURNING id'),
    setPhone: S('UPDATE users SET phone = ? WHERE id = ?'),
    invById: S('SELECT * FROM invitations WHERE id = ? AND user_id = ?'),
    invAny: S('SELECT * FROM invitations WHERE id = ?'),
    invBySlug: S('SELECT * FROM invitations WHERE slug = lower(?)'),
    slugTaken: S('SELECT 1 FROM invitations WHERE slug = lower(?)'),
    myInvites: S(`SELECT i.id, i.slug, i.template, i.plan, i.status, i.team_status, i.views, i.published_at, i.updated_at, i.data,
      (SELECT COUNT(*)::int FROM rsvps r WHERE r.invitation_id = i.id) AS rsvp_count,
      (SELECT COALESCE(SUM(r.guests), 0)::int FROM rsvps r WHERE r.invitation_id = i.id AND r.attending = 1) AS guest_count
      FROM invitations i WHERE i.user_id = ? ORDER BY i.updated_at DESC`),
    createInv: S('INSERT INTO invitations (user_id, slug, template, data) VALUES (?, ?, ?, ?) RETURNING id'),
    saveInv: S(`UPDATE invitations SET data = ?, slug = ?, template = ?, updated_at = ${NOW} WHERE id = ?`),
    deleteInv: S('DELETE FROM invitations WHERE id = ? AND user_id = ?'),
    addView: S('UPDATE invitations SET views = views + 1 WHERE id = ?'),
    rsvps: S('SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY updated_at DESC'),
    upsertRsvp: S(`INSERT INTO rsvps (invitation_id, submission_key, name, attending, guests, events, message, invite_token, lang)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (invitation_id, submission_key) DO UPDATE SET attending = excluded.attending, guests = excluded.guests,
        events = excluded.events, message = excluded.message, lang = excluded.lang, updated_at = ${NOW}`),
    addUpload: S('INSERT INTO uploads (user_id, invitation_id, file, bytes) VALUES (?, ?, ?, ?)'),
    uploadCount: S('SELECT COUNT(*)::int AS n FROM uploads WHERE invitation_id = ?'),
    createPayment: S('INSERT INTO payments (invitation_id, user_id, plan, amount, provider, order_id) VALUES (?, ?, ?, ?, ?, ?)'),
    paymentByOrder: S('SELECT * FROM payments WHERE order_id = ?'),
    // one statement, so a payment and the plan it unlocks can never get out of step
    markPaid: S(`WITH p AS (UPDATE payments SET status = 'paid', payment_id = COALESCE(payment_id, ?) WHERE id = ? RETURNING invitation_id, plan)
      UPDATE invitations i SET plan = p.plan FROM p WHERE i.id = p.invitation_id`),
    publish: S(`UPDATE invitations SET status = 'published', published_at = COALESCE(published_at, ${NOW}) WHERE id = ?`),
    addCustom: S('INSERT INTO customization_requests (invitation_id, user_id, message, phone) VALUES (?, ?, ?, ?)'),
    customs: S('SELECT id, message, phone, status, created_at FROM customization_requests WHERE invitation_id = ? ORDER BY id DESC'),
    contact: S('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'),
  };

  const publicInvite = (row) => {
    const d = JSON.parse(row.data);
    return { id: row.id, slug: row.slug, template: row.template, plan: row.plan, status: row.status, views: row.views,
      publishedAt: row.published_at && row.published_at.replace(' ', 'T') + 'Z', updatedAt: row.updated_at.replace(' ', 'T') + 'Z', rsvpCount: row.rsvp_count, guestCount: row.guest_count,
      title: `${plain(d.groom?.name)} & ${plain(d.bride?.name)}`, date: d.date, url: `${config.publicUrl}/i/${row.slug}`, teamStatus: row.plan ? row.team_status : null };
  };
  // the owner's dashboard row for an invitation (also used when our team edits a customer's invitation)
  const rowFor = async (inv) => (await q.myInvites.all(inv.user_id)).find((i) => i.id === inv.id);
  const ownInvite = async (req, res) => {
    const inv = req.user.admin ? await q.invAny.get(Number(req.params.id)) : await q.invById.get(Number(req.params.id), req.user.id); // our team builds invitations for customers
    if (!inv) res.status(404).json({ error: 'Invitation not found.' });
    return inv;
  };
  const priceFor = (inv, planId) => {
    const plan = PLANS[planId];
    if (!plan) return null;
    if (inv.plan === 'premium') return 0;
    if (inv.plan === 'basic') return planId === 'premium' ? PLANS.premium.price - PLANS.basic.price : 0; // upgrade pays the difference
    return plan.price;
  };
  const planProblems = (inv, planId) => {
    const plan = PLANS[planId], d = JSON.parse(inv.data), out = [];
    if (!plan.templates.includes(inv.template)) out.push(`The ${templateById(inv.template).name} design is part of the ${PLANS.premium.name} plan.`);
    if ((d.photos?.gallery || []).length > plan.maxGallery) out.push(`The ${plan.name} plan includes up to ${plan.maxGallery} gallery photos (you have ${d.photos.gallery.length}).`);
    if (!plan.guestLinks && (d.guests || []).length) out.push(`Personalised guest links are part of the ${PLANS.premium.name} plan.`);
    return out;
  };
  async function markPaid(orderId, paymentId) {
    const pay = await q.paymentByOrder.get(orderId);
    if (!pay) return false;
    await q.markPaid.run(paymentId, pay.id); // paying unlocks editing; publishing is a separate (free) step
    return true;
  }

  /* ── public info ── */
  app.get('/api/plans', (_req, res) => res.json({ plans: PLANS, templates: CATALOG, payments: paymentMode(), brand: config.brand, supportEmail: config.supportEmail, whatsapp: config.supportWhatsapp }));
  app.post('/api/contact', rateLimit({ windowMs: 15 * 60e3, max: 5 }), async (req, res) => {
    const { name, email, phone = '', message } = req.body || {};
    if (!String(name || '').trim() || !EMAIL.test(String(email || '')) || String(message || '').trim().length < 5) return res.status(400).json({ error: 'Please fill in your name, a valid email and a message.' });
    await q.contact.run(String(name).slice(0, 80), String(email).slice(0, 200), String(phone).slice(0, 20), String(message).slice(0, 2000));
    res.json({ ok: true });
  });

  /* ── auth ── */
  const authLimit = rateLimit({ windowMs: 15 * 60e3, max: 20 });
  app.post('/api/auth/signup', authLimit, async (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80), email = String(req.body?.email || '').trim().toLowerCase(), password = String(req.body?.password || '');
    if (!name) return res.status(400).json({ error: 'Please enter your name.', field: 'name' });
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please enter a valid email.', field: 'email' });
    if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password)) return res.status(400).json({ error: 'Use at least 8 characters with letters and numbers.', field: 'password' });
    const phone = whatsapp(req.body?.phone);
    if (!phone) return res.status(400).json({ error: 'Please enter your WhatsApp number — our team contacts you on it.', field: 'phone' });
    if (await q.userByEmail.get(email)) return res.status(409).json({ error: 'An account with this email already exists. Try logging in.', field: 'email' });
    const { id } = await q.createUser.run(name, email, hashPassword(password), phone);
    const user = await q.userById.get(id);
    setSession(res, user);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  });
  app.post('/api/auth/login', authLimit, async (req, res) => {
    const user = await q.userByEmail.get(String(req.body?.email || '').trim().toLowerCase());
    if (!user || !verifyPassword(String(req.body?.password || ''), user.pass_hash)) return res.status(401).json({ error: 'Email or password is incorrect.' });
    setSession(res, user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  });
  app.post('/api/auth/logout', async (_req, res) => { clearSession(res); res.json({ ok: true }); });
  app.get('/api/auth/me', (req, res) => res.json({ user: req.user }));
  app.patch('/api/account', requireUser, async (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (!name) return res.status(400).json({ error: 'Name cannot be empty.' });
    const phone = req.body?.phone != null ? whatsapp(req.body.phone) : req.user.phone;
    if (req.body?.phone != null && !phone) return res.status(400).json({ error: 'Please enter a valid WhatsApp number.', field: 'phone' });
    await S('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id);
    res.json({ user: { ...req.user, name, phone } });
  });
  app.post('/api/account/password', requireUser, authLimit, async (req, res) => {
    const user = await q.userById.get(req.user.id), next = String(req.body?.newPassword || '');
    if (!verifyPassword(String(req.body?.currentPassword || ''), user.pass_hash)) return res.status(400).json({ error: 'Current password is incorrect.', field: 'currentPassword' });
    if (next.length < 8 || !/[a-z]/i.test(next) || !/\d/.test(next)) return res.status(400).json({ error: 'Use at least 8 characters with letters and numbers.', field: 'newPassword' });
    const hash = hashPassword(next);
    await S('UPDATE users SET pass_hash = ? WHERE id = ?').run(hash, user.id);
    setSession(res, { ...user, pass_hash: hash }); // other devices are signed out by the password-version check
    res.json({ ok: true });
  });

  /* ── invitations ── */
  app.get('/api/invitations', requireUser, async (req, res) => res.json({ invitations: (await q.myInvites.all(req.user.id)).map(publicInvite) }));

  app.post('/api/invitations', requireUser, async (req, res) => {
    const tpl = isOffered(req.body?.template) && templateById(req.body.template);
    if (!tpl) return res.status(400).json({ error: 'Pick a design first.' });
    if ((await q.myInvites.all(req.user.id)).filter((i) => i.status === 'draft').length >= 10) return res.status(400).json({ error: 'You have 10 drafts already. Delete one to start another.' });
    const data = starterData(tpl.id);
    let slug;
    do slug = `${slugify(plain(data.groom.name))}-${slugify(plain(data.bride.name))}-${randomToken(4)}`; while (await q.slugTaken.get(slug));
    const { id } = await q.createInv.run(req.user.id, slug, tpl.id, JSON.stringify(data));
    res.status(201).json({ id });
  });

  app.get('/api/invitations/:id', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    res.json({ invitation: publicInvite(inv), data: JSON.parse(inv.data) });
  });

  // Every plan is bought first; editing, uploads, publishing and customisation unlock after payment.
  const needPlan = (inv, res) => { if (inv.plan) return false; res.status(402).json({ error: 'Please buy a plan to start personalising this invitation.', needPlan: true }); return true; };

  app.put('/api/invitations/:id', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv || needPlan(inv, res)) return;
    const template = req.body?.template != null ? Number(req.body.template) : inv.template;
    if (!templateById(template) || (template !== inv.template && !isOffered(template))) return res.status(400).json({ error: 'Unknown design.' });
    const slug = req.body?.slug != null ? String(req.body.slug).toLowerCase().trim() : inv.slug;
    if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug) || RESERVED.has(slug)) return res.status(400).json({ error: 'Link name: 3–40 letters, numbers or dashes.', field: 'slug' });
    if (slug !== inv.slug && await q.slugTaken.get(slug)) return res.status(409).json({ error: 'That link is taken. Try another.', field: 'slug' });
    const data = sanitizeData(req.body?.data, starterData(template), template);
    if (inv.plan) {
      const problems = planProblems({ ...inv, template, data: JSON.stringify(data) }, inv.plan);
      if (problems.length) return res.status(402).json({ error: problems.join(' ') + ' Upgrade to save this change.', upgrade: true });
    }
    await q.saveInv.run(JSON.stringify(data), slug, template, inv.id);
    const row = await rowFor(inv);
    res.json({ invitation: publicInvite(row), data });
  });

  app.delete('/api/invitations/:id', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    await q.deleteInv.run(inv.id, req.user.id);
    res.json({ ok: true });
  });

  // Photo upload: raw body, type sniffed from magic bytes (never trust the filename or header).
  const MAGIC = [['jpg', [0xff, 0xd8, 0xff]], ['png', [0x89, 0x50, 0x4e, 0x47]], ['webp', [0x52, 0x49, 0x46, 0x46], 8, [0x57, 0x45, 0x42, 0x50]]];
  app.post('/api/invitations/:id/uploads', requireUser, rateLimit({ windowMs: 60e3, max: 30, key: (r) => 'up' + r.user?.id }),
    express.raw({ type: () => true, limit: '8mb' }), async (req, res) => {
      const inv = await ownInvite(req, res); if (!inv || needPlan(inv, res)) return;
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length < 100) return res.status(400).json({ error: 'That file is empty.' });
      const kind = MAGIC.find(([, sig, off2, sig2]) => sig.every((b, i) => buf[i] === b) && (!sig2 || sig2.every((b, i) => buf[off2 + i] === b)));
      if (!kind) return res.status(415).json({ error: 'Please upload a JPG, PNG or WebP photo.' });
      if ((await q.uploadCount.get(inv.id)).n >= 60) return res.status(400).json({ error: 'Upload limit reached for this invitation.' });
      const file = `${randomToken(20)}.${kind[0]}`;
      await uploads.put(file, buf, `image/${kind[0] === 'jpg' ? 'jpeg' : kind[0]}`);
      await q.addUpload.run(req.user.id, inv.id, file, buf.length);
      res.status(201).json({ src: `/uploads/${file}` });
    });

  app.get('/api/invitations/:id/rsvps', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    const rows = (await q.rsvps.all(inv.id)).map((r) => ({ id: r.id, name: r.name, attending: !!r.attending, guests: r.guests, events: JSON.parse(r.events), message: r.message, invite: r.invite_token, lang: r.lang, at: r.updated_at }));
    if (req.query.format === 'csv') {
      if (inv.plan !== 'premium') return res.status(402).json({ error: `CSV export is part of the ${PLANS.premium.name} plan.` });
      const cell = (v) => `"${String(v).replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`; // also blocks spreadsheet formula injection
      const csv = ['Name,Attending,Guests,Events,Message,Invite link,Updated'].concat(rows.map((r) => [r.name, r.attending ? 'Yes' : 'No', r.guests, r.events.join(' / '), r.message, r.invite, r.at].map(cell).join(','))).join('\n');
      res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="rsvps-${inv.slug}.csv"` });
      return res.send('﻿' + csv);
    }
    const yes = rows.filter((r) => r.attending);
    const byEvent = {};
    yes.forEach((r) => r.events.forEach((e) => { byEvent[e] = (byEvent[e] || 0) + r.guests; }));
    res.json({ rsvps: rows, summary: { responses: rows.length, attending: yes.length, declined: rows.length - yes.length, guests: yes.reduce((s, r) => s + r.guests, 0), byEvent, views: inv.views } });
  });

  app.post('/api/invitations/:id/publish', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv || needPlan(inv, res)) return;
    const problems = planProblems(inv, inv.plan);
    if (problems.length) return res.status(402).json({ error: problems.join(' ') + ' Upgrade to publish.', upgrade: true });
    await q.publish.run(inv.id);
    res.json({ invitation: publicInvite(await rowFor(inv)) });
  });

  /* ── our team: paid orders to contact, their status and customisation requests ── */
  const requireAdmin = (req, res, next) => (req.user?.admin ? next() : res.status(req.user ? 403 : 401).json({ error: 'Team members only.' }));
  app.get('/api/admin/orders', requireUser, requireAdmin, async (_req, res) => {
    const rows = await S(`SELECT i.id, i.slug, i.template, i.plan, i.status, i.team_status, i.data, u.name, u.email, u.phone,
        (SELECT MAX(p.created_at) FROM payments p WHERE p.invitation_id = i.id AND p.status = 'paid') AS paid_at
      FROM invitations i JOIN users u ON u.id = i.user_id WHERE i.plan IS NOT NULL ORDER BY paid_at DESC NULLS LAST LIMIT 500`).all();
    const reqs = await S('SELECT id, invitation_id, message, phone, status, created_at FROM customization_requests ORDER BY id DESC LIMIT 2000').all();
    res.json({ orders: rows.map((r) => {
      const d = JSON.parse(r.data);
      return { id: r.id, slug: r.slug, design: templateById(r.template)?.name, plan: r.plan, status: r.status, teamStatus: r.team_status, paidAt: r.paid_at,
        title: `${plain(d.groom?.name)} & ${plain(d.bride?.name)}`, date: d.date, customer: { name: r.name, email: r.email, phone: r.phone },
        requests: reqs.filter((c) => c.invitation_id === r.id) };
    }) });
  });
  app.patch('/api/admin/invitations/:id', requireUser, requireAdmin, async (req, res) => {
    if (!TEAM_STATUS.has(req.body?.teamStatus)) return res.status(400).json({ error: 'Unknown status.' });
    const r = await S('UPDATE invitations SET team_status = ? WHERE id = ? AND plan IS NOT NULL').run(req.body.teamStatus, Number(req.params.id));
    if (!r.changes) return res.status(404).json({ error: 'Order not found.' });
    res.json({ ok: true });
  });
  app.patch('/api/admin/customizations/:id', requireUser, requireAdmin, async (req, res) => {
    if (!['open', 'in_progress', 'done'].includes(req.body?.status)) return res.status(400).json({ error: 'Unknown status.' });
    const r = await S('UPDATE customization_requests SET status = ? WHERE id = ?').run(req.body.status, Number(req.params.id));
    if (!r.changes) return res.status(404).json({ error: 'Request not found.' });
    res.json({ ok: true });
  });

  app.get('/api/invitations/:id/customizations', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    res.json({ requests: await q.customs.all(inv.id) });
  });
  app.post('/api/invitations/:id/customizations', requireUser, rateLimit({ windowMs: 60 * 60e3, max: 10, key: (r) => 'cz' + r.user?.id }), async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv || needPlan(inv, res)) return;
    const message = String(req.body?.message || '').trim().slice(0, 2000), phone = String(req.body?.phone || '').replace(/[^\d+ ]/g, '').slice(0, 20);
    if (message.length < 10) return res.status(400).json({ error: 'Please describe what you would like us to customise (at least a sentence).', field: 'message' });
    await q.addCustom.run(inv.id, req.user.id, message, phone);
    res.status(201).json({ requests: await q.customs.all(inv.id) });
  });

  /* ── checkout ── */
  app.post('/api/invitations/:id/checkout', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    const planId = req.body?.plan;
    const phone = whatsapp(req.body?.phone ?? req.user.phone);
    if (!phone) return res.status(400).json({ error: 'Please enter your WhatsApp number so our team can contact you.', field: 'phone' });
    if (phone !== req.user.phone) await q.setPhone.run(phone, req.user.id);
    const amount = priceFor(inv, planId);
    if (amount == null) return res.status(400).json({ error: 'Choose a plan.' });
    if (amount === 0) return res.status(400).json({ error: 'This invitation already has this plan.' });
    const problems = planProblems(inv, planId);
    if (problems.length) return res.status(400).json({ error: problems.join(' '), problems });
    const mode = paymentMode();
    if (mode === 'off') return res.status(503).json({ error: 'Online payments are not set up yet. Please contact us to publish your invitation.' });
    try {
      if (mode === 'razorpay') {
        const order = await createRazorpayOrder({ amountPaise: amount * 100, receipt: `inv${inv.id}-${Date.now()}`, notes: { invitation: String(inv.id), plan: planId } });
        await q.createPayment.run(inv.id, req.user.id, planId, amount * 100, 'razorpay', order.id);
        return res.json({ mode, orderId: order.id, amount: amount * 100, keyId: config.razorpay.keyId, name: config.brand, prefill: { name: req.user.name, email: req.user.email } });
      }
      const orderId = 'dev_' + randomToken(16);
      await q.createPayment.run(inv.id, req.user.id, planId, amount * 100, 'dev', orderId);
      res.json({ mode, orderId, amount: amount * 100 });
    } catch (e) {
      console.error(e.auth ? 'Razorpay rejected the API keys — check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in server/.env' : e);
      // the customer is logged in fine; a key problem is ours, so it is a 500 (a 401 here would read as "please log in")
      res.status(e.status === 400 ? 400 : 500).json({ error: e.auth ? 'Online payments are temporarily unavailable. Please WhatsApp us and we will help you pay.' : 'Could not start the payment. Please try again.' });
    }
  });

  app.post('/api/invitations/:id/checkout/verify', requireUser, async (req, res) => {
    const inv = await ownInvite(req, res); if (!inv) return;
    const { orderId, paymentId, signature } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Payment details are missing.' });
    const pay = await q.paymentByOrder.get(String(orderId || ''));
    if (!pay || pay.invitation_id !== inv.id) return res.status(400).json({ error: 'Payment not found.' });
    if (pay.provider === 'razorpay' && (!paymentId || !signature)) return res.status(400).json({ error: 'Payment details are missing.' });
    if (pay.provider === 'razorpay' && !verifyCheckoutSignature({ orderId, paymentId, signature })) return res.status(400).json({ error: 'Payment could not be verified. If money was deducted, it will be refunded automatically — or contact us.' });
    if (pay.provider === 'dev' && paymentMode() !== 'dev') return res.status(400).json({ error: 'Test payments are disabled.' });
    await markPaid(pay.order_id, pay.provider === 'dev' ? 'dev_' + randomToken(10) : paymentId);
    const row = await rowFor(inv);
    res.json({ invitation: publicInvite(row) });
  });

  /* ── public invitation ── */
  const eventEnd = (data) => Math.max(...(data.events || []).map((e) => Date.parse(e.start) + (e.hours || 3) * 36e5), Date.parse(data.date) || 0);
  function viewable(req, inv) {
    if (!inv) return { ok: false, status: 404 };
    const owner = req.user && req.user.id === inv.user_id;
    if (inv.status !== 'published') return owner ? { ok: true, preview: true } : { ok: false, status: 404 };
    const days = PLANS[inv.plan]?.daysAfterEvent ?? 30;
    if (!owner && Date.now() > eventEnd(JSON.parse(inv.data)) + days * 864e5) return { ok: false, status: 410 };
    return { ok: true, owner };
  }

  app.get('/i/:slug/config.js', async (req, res) => {
    const inv = await q.invBySlug.get(req.params.slug), v = viewable(req, inv);
    if (!v.ok) return res.status(v.status).type('js').send('/* not available */');
    if (!v.preview && !v.owner && !req.query.nocount) await q.addView.run(inv.id);
    const cfg = buildInviteConfig(inv, { preview: v.preview });
    res.set('Cache-Control', 'no-store').type('js').send(`window.INVITE = ${JSON.stringify(cfg).replace(/</g, '\\u003c')};`);
  });

  app.get('/i/:slug', async (req, res) => {
    const inv = await q.invBySlug.get(req.params.slug), v = viewable(req, inv);
    if (!v.ok) return res.status(v.status).type('html').send(endedPage(v.status));
    const data = JSON.parse(inv.data), tpl = inv.template;
    let html = fs.readFileSync(path.join(config.paths.samples, String(tpl), 'index.html'), 'utf8');
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const title = `${plain(data.groom.name)} & ${plain(data.bride.name)}`;
    const when = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(data.date));
    const cover = data.photos?.hero || data.photos?.invite;
    const ogImage = cover && cover.startsWith('/uploads/') ? config.publicUrl + cover : `${config.publicUrl}/t/${tpl}/assets/img/og.jpg`;
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)} · ${esc(when)}</title>`)
      .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(title)} — ${esc(when)}, ${esc(plain(data.city))}"><meta name="robots" content="noindex">`)
      .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)} are getting married">`)
      .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="You are invited · ${esc(when)} · ${esc(plain(data.city))}"><meta property="og:url" content="${config.publicUrl}/i/${inv.slug}">`)
      .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(ogImage)}">`)
      .replace('href="theme.css"', `href="/t/${tpl}/theme.css"`)
      .replace('src="theme.js"', `src="/t/${tpl}/theme.js"`)
      .replace('src="config.js"', `src="/i/${esc(inv.slug)}/config.js${v.owner || v.preview ? '?nocount=1' : ''}"`)
      .replaceAll('../../core/', '/core/');
    if (v.preview) html = html.replace('<body>', '<body><div style="position:fixed;z-index:9999;left:50%;bottom:76px;transform:translateX(-50%);background:#111;color:#fff;font:600 12px/1 system-ui;padding:8px 14px;border-radius:99px;opacity:.85;pointer-events:none">Preview · publish to share this link</div>');
    res.set('Cache-Control', 'no-store').type('html').send(html);
  });

  app.post('/api/i/:slug/rsvp', rateLimit({ windowMs: 10 * 60e3, max: 20 }), async (req, res) => {
    const inv = await q.invBySlug.get(req.params.slug);
    if (!inv || inv.status !== 'published') return res.status(404).json({ error: 'Invitation not found.' });
    const b = req.body || {}, data = JSON.parse(inv.data);
    if (b.company) return res.json({ ok: true }); // honeypot filled → silently drop bots
    const name = String(b.name || '').trim().slice(0, 80);
    if (!name || !['yes', 'no'].includes(b.attending)) return res.status(400).json({ error: 'Name and attendance are required.' });
    const ids = new Set(data.events.map((e) => e.id));
    const yes = b.attending === 'yes';
    const events = yes ? (Array.isArray(b.events) ? b.events : []).filter((e) => ids.has(e)).slice(0, 10) : [];
    const guests = yes ? Math.min(data.rsvp?.maxGuests || 10, Math.max(1, Number(b.guests) || 1)) : 0;
    const token = /^[a-z0-9]{4,12}$/.test(b.invite || '') ? b.invite : '';
    await q.upsertRsvp.run(inv.id, (name.toLowerCase() + '|' + token), name, yes ? 1 : 0, guests, JSON.stringify(events), String(b.message || '').slice(0, 500), token, String(b.lang || 'en').slice(0, 5));
    res.json({ ok: true });
  });

  /* ── static files ── */
  const longCache = { maxAge: '7d' };
  app.use('/core', express.static(config.paths.core, longCache));
  app.use('/t', express.static(config.paths.samples, longCache));
  app.get('/uploads/:file', async (req, res) => {
    const f = /^[a-z0-9]{12,40}\.(jpg|png|webp)$/.test(req.params.file) && await uploads.get(req.params.file);
    if (!f) return res.status(404).end();
    res.set({ 'Content-Type': f.type, 'Cache-Control': 'public, max-age=2592000, immutable' }).send(f.buf);
  });
  app.use('/assets', express.static(path.join(config.paths.web, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(config.paths.web, { index: false, maxAge: '1h' }));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // SPA routes get their own title/description/canonical server-side; unknown paths return a real 404.
  app.get('/{*path}', async (req, res) => {
    const known = PAGE_META[req.path] || (/^\/dashboard(\/.*)?$/.test(req.path) ? PAGE_META['/dashboard'] : null);
    res.status(known ? 200 : 404).type('html').send(renderSpa(req.path, known));
  });

  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'That file is too large (max 8 MB).' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });

  return app;
}

function endedPage(status) {
  const msg = status === 410 ? 'This celebration has ended — thank you for the love and blessings!' : 'This invitation doesn’t exist or hasn’t been published yet.';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${config.brand}</title>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbf4ea;color:#2d1b2f;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px}a{color:#c2410c}</style></head>
  <body><div><p style="font-size:42px;margin:0">❀</p><p>${msg}</p><p><a href="/">Create your own invitation with ${config.brand}</a></p></div></body></html>`;
}
