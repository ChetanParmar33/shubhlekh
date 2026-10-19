import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, Vite serves the React app and forwards everything server-side to the Node API on :8800.
const api = 'http://localhost:8800';
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: Object.fromEntries(['/api', '/i', '/t', '/core', '/uploads'].map((p) => [p, { target: api, changeOrigin: false }])),
  },
});
