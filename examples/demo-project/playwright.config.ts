// Kanoniczny playwright.config.ts — kopiuj z shared/ do katalogu głównego projektu (ESM).
// Env ładowany WYŁĄCZNIE przez singleton src/config/env.ts (dotenv + zod, fail-fast).
// Nie używaj tu process.env — baseURL per projekt pochodzi z env.API_URL / env.BASE_URL.
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
  ],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.API_URL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.BASE_URL,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.BASE_URL,
      },
    },
    // Projekt BEZ przeglądarki — DOMYŚLNY sposób testów jednostkowych własnych elementów
    // projektu (factories, utils, schematy zod, logika stepsów): jeden runner (Playwright) na projekt.
    // Brak devices[...] = brak browsera; fixture `page` niedostępny, `request` działa.
    // UWAGA: `tests/unit/` = zarezerwowane dla Vitest (tylko gdy ktoś upiera się na Vitest
    // w projekcie Playwright — wtedy coverage 80% obowiązkowe). Odkomentuj przy pierwszym teście:
    // {
    //   name: 'unit-pw',
    //   testDir: './tests/unit-pw',
    // },
  ],
});
