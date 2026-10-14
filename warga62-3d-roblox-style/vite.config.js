import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 5173, open: false, host: true },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@legacy': path.resolve(import.meta.dirname, './legacy_source'),
    },
  },
  build: { chunkSizeWarningLimit: 1500, target: 'es2020' },
});
