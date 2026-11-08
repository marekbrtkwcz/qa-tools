import { defineConfig } from 'vitest/config';

// Config Vitest dla samej biblioteki qa-tools — testuje własne skrypty (scripts/).
// Nie mylić z shared/vitest.config.ts (szablon dla generowanych projektów).
export default defineConfig({
  test: {
    include: ['tests/library/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/**/*.d.ts'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
