// Rootowa konfiguracja Playwright dla konwencji qa-tools.
// Testy żyją w tests/e2e/ i tests/api/ — uruchomienie: npx playwright test
// Sekrety i adresy tylko ze zmiennych środowiskowych (.env / CI), nigdy w repo.
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Nigdy nie maskuj flaków retries — flaky naprawiamy przyczyną (stabilizing-flaky-tests).
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Self-signed certy na lokalnych/środowiskach dev — NIE włączaj przeciwko produkcji.
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
