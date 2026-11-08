---
description: "Use when setting up a Playwright project for mobile web testing with device emulation (iPhone, Pixel, touch gestures, responsive breakpoints). Based on playwright-fullstack but adds a dedicated 'mobile' project with devices descriptor. Trigger phrases: mobile tests, testy mobile, device emulation, emulacja urządzeń, responsive testing, iPhone, Pixel, touch gestures."
---

# 📱 Mobile Playwright Setup

Bazuje na `setups/playwright-fullstack.instructions.md` — wykonaj najpierw tamten setup, potem dopnij mobile:

## 1. Dodaj projekt `mobile` do `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env.js';

export default defineConfig({
  projects: [
    { name: 'api', testDir: './tests/api', use: { baseURL: env.API_URL } },
    { name: 'ui', testDir: './tests/ui', use: { baseURL: env.BASE_URL } },
    { name: 'e2e', testDir: './tests/e2e', use: { baseURL: env.BASE_URL } },
    {
      name: 'mobile',
      testDir: './tests/mobile',
      use: { ...devices['iPhone 14'], baseURL: env.BASE_URL },
    },
    {
      name: 'mobile-android',
      testDir: './tests/mobile',
      use: { ...devices['Pixel 7'], baseURL: env.BASE_URL },
    },
  ],
});
```

## 2. Struktura katalogów

```
tests/mobile/          ← testy mobile (*.spec.ts)
docs/scenarios/mobile/ ← plany scenariuszy od plannera
```

## 3. Skrypty npm

```json
"test:mobile": "playwright test tests/mobile --project=mobile --project=mobile-android",
"test:mobile:iphone": "playwright test tests/mobile --project=mobile",
"test:mobile:android": "playwright test tests/mobile --project=mobile-android"
```

## 4. Zasady mobile

- Viewport/isMobile/hasTouch z device descriptor — nigdy `page.setViewportSize()` w teście
- Gesty dotykowe: `page.touchscreen.tap()`, `locator.tap()`
- Responsywne breakpointy: osobne projekty (mobile / tablet / desktop) gdy layout się łamie
- Walidacja planu przez Playwright MCP z emulacją device
