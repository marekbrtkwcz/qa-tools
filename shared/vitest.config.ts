import { defineConfig } from 'vitest/config';

// Kanoniczny config Vitest — kopiuj do katalogu głównego projektu jako vitest.config.ts
// Coverage jest OBOWIĄZKOWY: `npm run coverage` = vitest run --coverage i musi przejść progi (thresholds).
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/config/**', 'src/**/index.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
