import { defineConfig } from 'vitest/config';

// Tests of the package as published: run after `npm run build` (see `npm run test:package`)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/package/**/*.test.ts'],
    globalSetup: ['tests/package/setup.ts'],
    testTimeout: 30_000,
  },
});
