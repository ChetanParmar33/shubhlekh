// End-to-end API test: node --test test/   (uses a throwaway data dir + in-memory DB)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'sl-test-'));
process.env.DEV_PAYMENTS = '1';
process.env.ADMIN_EMAILS = 'team@example.com';
const { openDb } = await import('../src/db.js');
const { createApp } = await import('../src/app.js');

let server, base;
before(async () => {
  server = createApp(openDb(':memory:')).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true }); });

function client() {
  let cookie = '';
  return async (method, url, body, raw) => {
    const res = await fetch(base + url, { method, headers: { ...(cookie && { cookie }), ...(body && !raw && { 'content-type': 'application/json' }) }, body: raw ? body : body && JSON.stringify(body) });
    const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0];
    const type = res.headers.get('content-type') || '';
    return { status: res.status, body: type.includes('json') ? await res.json() : await res.text() };
  };
}

test('full flow: signup → draft → buy plan → edit → upload → publish → public page → RSVP → inbox → customisation', async () => {
  const a = client(), guest = client(), other = client();
  assert.equal((await a('POST', '/api/auth/signup', { name: 'Riya', email: 'riya@example.com', password: 'short', phone: '9876543210' })).status, 400);
  assert.equal((await a('POST', '/api/auth/signup', { name: 'Riya', email: 'riya@example.com', password: 'secret123', phone: '12' })).status, 400, 'WhatsApp number is required');
  const su = await a('POST', '/api/auth/signup', { name: 'Riya', email: 'riya@example.com', password: 'secret123', phone: '98765 43210' });
  assert.equal(su.status, 201); assert.equal(su.body.user.phone, '+919876543210');
  assert.equal((await a('POST', '/api/auth/signup', { name: 'R', email: 'RIYA@example.com', password: 'secret123', phone: '9876543210' })).status, 409, 'emails are case-insensitive');

  assert.equal((await a('POST', '/api/invitations', { template: 3 })).status, 400, 'old designs are not offered for new invitations');
  const { body: { id } } = await a('POST', '/api/invitations', { template: 7 });
  let { body } = await a('GET', `/api/invitations/${id}`);
  assert.deepEqual(body.data.groom.name, { en: 'Nirav', gu: 'નિરવ' }, 'draft starts with the design’s bilingual demo content');

  // plan first: no personalising before buying
  const put = await a('PUT', `/api/invitations/${id}`, { data: body.data });
  assert.equal(put.status, 402); assert.equal(put.body.needPlan, true);
  assert.equal((await a('POST', `/api/invitations/${id}/customizations`, { message: 'Please change the colours to pink' })).status, 402);

  // Panetar is a Royal design → the Classic plan is refused, Royal goes through (dev payments) but does not publish by itself
  assert.equal((await a('POST', `/api/invitations/${id}/checkout`, { plan: 'basic' })).status, 400);
  const co = await a('POST', `/api/invitations/${id}/checkout`, { plan: 'premium' });
  assert.equal(co.status, 200); assert.equal(co.body.amount, 49900);
  ({ body } = await a('POST', `/api/invitations/${id}/checkout/verify`, { orderId: co.body.orderId }));
  assert.equal(body.invitation.plan, 'premium'); assert.notEqual(body.invitation.status, 'published');
  ({ body } = await a('GET', `/api/invitations/${id}`));

  // edit: bilingual names keep en + gu only; a hostile monogram/colour/photo path must be neutralised
  const data = { ...body.data, groom: { name: { en: 'Arjun', gu: 'અર્જુન', hi: 'अर्जुन' }, parents: 'Son of A' }, bride: { name: 'Isha', parents: 'Daughter of B' }, monogram: '<img src=x onerror=alert(1)>', heroLine: 'Two hearts',
    events: body.data.events.map((e, i) => ({ ...e, color: i ? e.color : '"><script>' })), photos: { ...body.data.photos, invite: 'javascript:alert(1)' } };
  ({ body } = await a('PUT', `/api/invitations/${id}`, { data, slug: 'arjun-isha' }));
  assert.equal(body.invitation.slug, 'arjun-isha');
  assert.deepEqual(body.data.groom.name, { en: 'Arjun', gu: 'અર્જુન' });
  assert.equal(body.data.heroLine, 'Two hearts', 'hero line is saved');
  assert.ok(!/[<>"]/.test(body.data.monogram));
  assert.equal(body.data.events[0].color, '#999999');
  assert.equal(body.data.photos.invite, '');

  // paid but unpublished invitations are still private
  assert.equal((await guest('GET', '/i/arjun-isha')).status, 404);
  assert.equal((await a('GET', '/i/arjun-isha')).status, 200, 'owner can preview');
  assert.equal((await other('GET', `/api/invitations/${id}`)).status, 401);

  // upload: real PNG accepted, text rejected
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200)]);
  const up = await a('POST', `/api/invitations/${id}/uploads`, png, true);
  assert.equal(up.status, 201); assert.match(up.body.src, /^\/uploads\/[a-z0-9]+\.png$/);
  assert.equal((await a('POST', `/api/invitations/${id}/uploads`, Buffer.from('x'.repeat(300)), true)).status, 415);

  ({ body } = await a('POST', `/api/invitations/${id}/publish`));
  assert.equal(body.invitation.status, 'published');

  // public page + config
  const page = await guest('GET', '/i/arjun-isha');
  assert.equal(page.status, 200); assert.match(page.body, /Arjun &amp; Isha/); assert.match(page.body, /src="\/i\/arjun-isha\/config\.js"/);
  const cfg = await guest('GET', '/i/arjun-isha/config.js');
  assert.match(cfg.body, /"endpoint":"\/api\/i\/arjun-isha\/rsvp"/); assert.match(cfg.body, /"\/t\/7\/assets\/img\//); assert.match(cfg.body, /"gu":"અર્જુન"/);

  // RSVP: validation, upsert by name, inbox totals
  assert.equal((await guest('POST', '/api/i/arjun-isha/rsvp', { name: '', attending: 'yes' })).status, 400);
  await guest('POST', '/api/i/arjun-isha/rsvp', { name: 'Kabir', attending: 'yes', guests: 3, events: ['lagna', 'nope'] });
  await guest('POST', '/api/i/arjun-isha/rsvp', { name: 'kabir', attending: 'yes', guests: 2, events: ['lagna'] });
  await guest('POST', '/api/i/arjun-isha/rsvp', { name: 'Meera', attending: 'no', guests: 5 });
  ({ body } = await a('GET', `/api/invitations/${id}/rsvps`));
  assert.equal(body.summary.responses, 2); assert.equal(body.summary.guests, 2); assert.deepEqual(body.summary.byEvent, { lagna: 2 });
  assert.equal(body.summary.views, 1);
  const csv = await a('GET', `/api/invitations/${id}/rsvps?format=csv`);
  assert.match(csv.body, /"Kabir","Yes","2"/);

  // customisation requests from our team, after buying
  assert.equal((await a('POST', `/api/invitations/${id}/customizations`, { message: 'short' })).status, 400);
  ({ body } = await a('POST', `/api/invitations/${id}/customizations`, { message: 'Please add our family photo to the gate', phone: '+91 98xx<b>' }));
  assert.equal(body.requests.length, 1); assert.equal(body.requests[0].phone, '+91 98');
  assert.equal((await a('GET', `/api/invitations/${id}/customizations`)).body.requests.length, 1);

  // our team: sees the paid order with the customer's number, sets it up, moves the status along
  assert.equal((await a('GET', '/api/admin/orders')).status, 403);
  const team = client();
  await team('POST', '/api/auth/signup', { name: 'Team', email: 'team@example.com', password: 'secret123', phone: '9000000000' });
  const { body: { orders } } = await team('GET', '/api/admin/orders');
  const o = orders.find((x) => x.id === id);
  assert.equal(o.customer.phone, '+919876543210'); assert.equal(o.teamStatus, 'new'); assert.equal(o.requests.length, 1);
  assert.equal((await team('GET', `/api/invitations/${id}`)).status, 200, 'team can open a customer invitation');
  assert.equal((await team('PATCH', `/api/admin/invitations/${id}`, { teamStatus: 'building' })).status, 200);
  assert.equal((await team('PATCH', `/api/admin/invitations/${id}`, { teamStatus: 'nope' })).status, 400);
  assert.equal((await team('PATCH', `/api/admin/customizations/${o.requests[0].id}`, { status: 'done' })).status, 200);
  ({ body } = await a('GET', '/api/invitations'));
  assert.equal(body.invitations.find((x) => x.id === id).teamStatus, 'building', 'customer sees our progress');
});

test('Classic plan cannot use Royal features', async () => {
  const a = client();
  await a('POST', '/api/auth/signup', { name: 'Sam', email: 'sam@example.com', password: 'secret123', phone: '+44 7700 900123' });
  const { body: { id } } = await a('POST', '/api/invitations', { template: 6 });
  const co = await a('POST', `/api/invitations/${id}/checkout`, { plan: 'basic' });
  assert.equal(co.body.amount, 29900);
  await a('POST', `/api/invitations/${id}/checkout/verify`, { orderId: co.body.orderId });
  const { body } = await a('GET', `/api/invitations/${id}`);
  assert.equal((await a('PUT', `/api/invitations/${id}`, { data: body.data, template: 7 })).status, 402, 'Royal design on Classic');
  assert.equal((await a('PUT', `/api/invitations/${id}`, { data: body.data, template: 2 })).status, 400, 'old designs cannot be picked');
  assert.equal((await a('PUT', `/api/invitations/${id}`, { data: body.data, template: 8 })).status, 200, 'another Classic design is fine');
  const up = await a('POST', `/api/invitations/${id}/checkout`, { plan: 'premium' });
  assert.equal(up.body.amount, 20000, 'upgrade pays the difference');
  assert.equal((await a('GET', `/api/invitations/${id}/rsvps?format=csv`)).status, 402);
});

test('pages: per-route meta and real 404s', async () => {
  const c = client();
  assert.equal((await c('GET', '/pricing')).status, 200);
  assert.equal((await c('GET', '/no-such-page')).status, 404);
  assert.equal((await c('GET', '/api/nope')).status, 404);
  assert.equal((await c('GET', '/i/does-not-exist')).status, 404);
});
