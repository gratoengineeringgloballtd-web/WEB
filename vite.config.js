import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE: '/' for a site at the domain root; set VITE_BASE=/subfolder/ to host in a folder.
// In development, /api requests go to the local API server (npm run dev:api, port 3001).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  server: { proxy: { '/api': { target: `http://localhost:${process.env.API_PORT || 3001}`, changeOrigin: false } } },
});
