import crypto from 'node:crypto';
import { config } from './config.js';

const COOKIE = 'sl_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  const [kind, salt, hash] = String(stored).split('$');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const got = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(expected, got);
}

// Signed session token: base64url(json).base64url(hmac). Stateless; a password change rotates `pv`.
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function unsign(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const want = crypto.createHmac('sha256', config.sessionSecret).update(body).digest('base64url');
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() / 1000 ? p : null;
  } catch { return null; }
}
export function passVersion(passHash) { return crypto.createHash('sha256').update(passHash).digest('base64url').slice(0, 10); }

export function setSession(res, user) {
  const token = sign({ uid: user.id, pv: passVersion(user.pass_hash), exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: config.isProd, maxAge: MAX_AGE * 1000, path: '/' });
}
export function clearSession(res) { res.clearCookie(COOKIE, { path: '/' }); }

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function sessionMiddleware(db) {
  return async (req, _res, next) => {
    const p = unsign(readCookie(req, COOKIE));
    const u = p && await db.get('SELECT id, name, email, phone, pass_hash FROM users WHERE id = ?', p.uid);
    req.user = u && passVersion(u.pass_hash) === p.pv ? { id: u.id, name: u.name, email: u.email, phone: u.phone, admin: config.adminEmails.includes(u.email.toLowerCase()) } : null;
    next();
  };
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  next();
}

// Tiny fixed-window limiter, per process. ponytail: on Netlify each function instance counts separately; move to a shared store if abuse shows up.
export function rateLimit({ windowMs, max, key = (req) => req.ip }) {
  const hits = new Map();
  setInterval(() => hits.clear(), windowMs).unref();
  return (req, res, next) => {
    const k = key(req);
    const n = (hits.get(k) || 0) + 1;
    hits.set(k, n);
    if (n > max) return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    next();
  };
}
