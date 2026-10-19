// Postgres everywhere: Netlify Database in production, PGlite (Postgres in WASM) for local dev and tests,
// so there is one SQL dialect. Queries use `?` placeholders; they are turned into $1, $2… here.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

// Timestamps stay 'YYYY-MM-DD HH:MM:SS' UTC text (the API turns them into ISO strings).
export const NOW = "to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,             -- stored lower-case
    pass_hash TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',         -- WhatsApp number, +91… — our team contacts paid customers
    created_at TEXT NOT NULL DEFAULT ${NOW})`,
  `CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,              -- stored lower-case
    template INTEGER NOT NULL,
    plan TEXT,                              -- set once paid: 'basic' | 'premium'
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    team_status TEXT NOT NULL DEFAULT 'new', -- new | contacted | building | ready — shown to the customer
    data TEXT NOT NULL,                     -- JSON, see templates.js editable shape
    views INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW})`,
  'CREATE INDEX IF NOT EXISTS inv_user ON invitations(user_id)',
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL,                -- paise
    provider TEXT NOT NULL,                 -- 'razorpay' | 'dev'
    order_id TEXT UNIQUE,
    payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
    created_at TEXT NOT NULL DEFAULT ${NOW})`,
  `CREATE TABLE IF NOT EXISTS rsvps (
    id SERIAL PRIMARY KEY,
    invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    submission_key TEXT NOT NULL,           -- name+invite token, so a guest who edits replaces their answer
    name TEXT NOT NULL,
    attending INTEGER NOT NULL,
    guests INTEGER NOT NULL DEFAULT 0,
    events TEXT NOT NULL DEFAULT '[]',
    message TEXT NOT NULL DEFAULT '',
    invite_token TEXT NOT NULL DEFAULT '',
    lang TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT ${NOW},
    updated_at TEXT NOT NULL DEFAULT ${NOW},
    UNIQUE (invitation_id, submission_key))`,
  `CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    file TEXT NOT NULL,
    bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW})`,
  `CREATE TABLE IF NOT EXISTS customization_requests (
    id SERIAL PRIMARY KEY,
    invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
    created_at TEXT NOT NULL DEFAULT ${NOW})`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${NOW})`,
];

// a variable, so bundlers (Netlify's esbuild) leave the local-only WASM database out of the function
const PGLITE = '@electric-sql/pglite';
async function netlifyPool() {
  const { getDatabase, MissingDatabaseConnectionError } = await import('@netlify/database');
  try { return getDatabase(config.databaseUrl ? { connectionString: config.databaseUrl } : {}).pool; }
  catch (e) { if (e instanceof MissingDatabaseConnectionError) return null; throw e; }
}
const numbered = (sql) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };

// `file`: ':memory:' for tests. Otherwise Netlify Database when its connection is available (on Netlify, or
// DATABASE_URL set), else a PGlite folder in DATA_DIR.
export async function openDb(file) {
  let query;
  const pool = file ? null : await netlifyPool();
  if (pool) {
    query = async (text, params) => { const r = await pool.query(text, params); return { rows: r.rows, changes: r.rowCount ?? 0 }; };
  } else {
    const { PGlite } = await import(PGLITE);
    const dir = file === ':memory:' ? undefined : file || path.join(config.dataDir, 'pg');
    if (dir) fs.mkdirSync(path.dirname(dir), { recursive: true });
    const pg = new PGlite(dir);
    query = async (text, params) => { const r = await pg.query(text, params); return { rows: r.rows, changes: r.affectedRows ?? 0 }; };
  }
  // one round trip on a warm database; the full schema only runs on a fresh one
  if (!(await query("SELECT to_regclass('public.contact_messages') AS t", [])).rows[0]?.t) for (const s of SCHEMA) await query(s, []);
  return {
    get: async (sql, ...p) => (await query(numbered(sql), p)).rows[0],
    all: async (sql, ...p) => (await query(numbered(sql), p)).rows,
    run: async (sql, ...p) => { const r = await query(numbered(sql), p); return { changes: r.changes, id: r.rows[0]?.id }; }, // add RETURNING id for the new id
  };
}
