import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

export function openDb(file = path.join(config.dataDir, 'app.db')) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      pass_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS invitations (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      template INTEGER NOT NULL,
      plan TEXT,                         -- set once paid: 'basic' | 'premium'
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      data TEXT NOT NULL,                -- JSON, see templates.js editable shape
      views INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS inv_user ON invitations(user_id);
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY,
      invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      amount INTEGER NOT NULL,           -- paise
      provider TEXT NOT NULL,            -- 'razorpay' | 'dev'
      order_id TEXT UNIQUE,
      payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY,
      invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      submission_key TEXT NOT NULL,      -- name+invite token, so a guest who edits replaces their answer
      name TEXT NOT NULL,
      attending INTEGER NOT NULL,
      guests INTEGER NOT NULL DEFAULT 0,
      events TEXT NOT NULL DEFAULT '[]',
      message TEXT NOT NULL DEFAULT '',
      invite_token TEXT NOT NULL DEFAULT '',
      lang TEXT NOT NULL DEFAULT 'en',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (invitation_id, submission_key)
    );
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      file TEXT NOT NULL,
      bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS customization_requests (
      id INTEGER PRIMARY KEY,
      invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // columns added after launch — CREATE TABLE IF NOT EXISTS does not add them to an existing database
  for (const sql of [
    "ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''",             // WhatsApp number, +91… — our team contacts paid customers
    "ALTER TABLE invitations ADD COLUMN team_status TEXT NOT NULL DEFAULT 'new'", // new | contacted | building | ready — shown to the customer
  ]) { try { db.exec(sql); } catch { /* already there */ } }
  return db;
}
