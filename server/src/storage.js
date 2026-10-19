// Customer photos: Netlify Blobs when running on Netlify, a folder in DATA_DIR everywhere else.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const onNetlify = () => !!process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY === 'true';
let store;
const blobs = async () => (store ??= (await import('@netlify/blobs')).getStore({ name: 'uploads', consistency: 'strong' }));
const dir = () => { const d = path.join(config.dataDir, 'uploads'); fs.mkdirSync(d, { recursive: true }); return d; };

export const uploads = {
  async put(name, buf, type) {
    if (onNetlify()) return (await blobs()).set(name, buf, { metadata: { type } });
    fs.writeFileSync(path.join(dir(), name), buf);
  },
  async get(name) {
    if (onNetlify()) {
      const r = await (await blobs()).getWithMetadata(name, { type: 'arrayBuffer' });
      return r && { buf: Buffer.from(r.data), type: r.metadata?.type || 'application/octet-stream' };
    }
    const f = path.join(dir(), name);
    if (!fs.existsSync(f)) return null;
    return { buf: fs.readFileSync(f), type: { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[name.split('.').pop()] };
  },
};
