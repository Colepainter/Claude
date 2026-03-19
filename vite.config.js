// vite.config.js — bundles Framer Motion animation layer
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry:    resolve(__dirname, 'js/framer-animations.jsx'),
      name:     'EVAnimations',
      fileName: 'framer-animations',
      formats:  ['iife'],
    },
    rollupOptions: {
      // Bundle React + Framer Motion into the output
      // (or set as externals and load from CDN for smaller bundles)
    },
    outDir: 'js/dist',
    emptyOutDir: false,
  },
});
