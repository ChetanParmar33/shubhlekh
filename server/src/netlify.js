// Netlify Function running the whole Express API (also /i/:slug invitation pages and /uploads photos).
// netlify/functions/api.mjs re-exports this; netlify.toml rewrites /api/*, /i/* and /uploads/* to it.
import serverless from 'serverless-http';
import { connectLambda } from '@netlify/blobs';
import { openDb } from './db.js';
import { createApp } from './app.js';

let ready; // one app + DB connection per warm function instance
const PREFIX = '/.netlify/functions/api';

export const handler = async (event, context) => {
  if (event.blobs) connectLambda(event); // gives @netlify/blobs its credentials in Lambda-style functions
  // Express needs the public path (/api/…, /i/…): take it from the original URL, or strip the function prefix.
  const original = event.rawUrl ? new URL(event.rawUrl).pathname : event.path;
  event.path = original.startsWith(PREFIX) ? original.slice(PREFIX.length) || '/' : original;
  ready ??= openDb().then((db) => serverless(createApp(db), { binary: ['image/*', 'application/octet-stream'] }));
  return (await ready)(event, context);
};
