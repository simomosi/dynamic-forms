import { defineConfig } from 'vite';
import path from 'path';

// Dev server only (npm run dev): the library is built by tsdown, see tsdown.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@dist': path.resolve(import.meta.dirname, './dist')
    },
    extensions: ['.ts', '.js', '.json']
  },

  server: {
    port: 3000,
    open: true,
    cors: true
  },
});
