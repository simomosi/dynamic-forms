import { defineConfig } from 'vitest/config';
import path from 'path';
import { KNOWN_UNHANDLED_ERROR } from './tests/knownBugs';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    onUnhandledError: (error) => error.message !== KNOWN_UNHANDLED_ERROR,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
  },
});
