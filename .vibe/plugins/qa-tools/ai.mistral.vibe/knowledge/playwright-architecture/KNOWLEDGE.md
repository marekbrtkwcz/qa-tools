---
name: playwright-architecture
description: Wzorce architektury testów Playwright — struktura projektu, Page Object Model, fixture'y, konfiguracja wielu środowisk i najlepsze praktyki organizacji kodu testowego.
display_name: Architektura Playwright
icon: building
---

# Architektura testów Playwright

## Zalecana struktura projektu

```
tests/
├── e2e/                    # testy end-to-end
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   └── search.spec.ts
├── api/                    # testy API
│   ├── users.spec.ts
│   └── products.spec.ts
├── fixtures/               # wspólne fixture'y
│   ├── auth.fixture.ts
│   └── test-data.fixture.ts
├── pages/                  # Page Object Model
│   ├── base.page.ts
│   ├── login.page.ts
│   └── checkout.page.ts
├── helpers/                # funkcje pomocnicze
│   ├── api.helper.ts
│   └── data.helper.ts
└── playwright.config.ts
```

## Page Object Model — base page

```typescript
// pages/base.page.ts
export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

## Custom fixture dla autentykacji

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER!);
    await page.getByLabel('Password').fill(process.env.TEST_PASS!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

Użycie: `test('...', async ({ authenticatedPage }) => { ... })`

## Konfiguracja wielu środowisk

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

## Obiekt `Playwright` (punkt wejścia — playwright.dev/docs/api/class-playwright)

W testach `@playwright/test` rzadko dotykasz tego obiektu bezpośrednio (dostajesz `page`/`context` z fixture'ów). Obiekt `Playwright` przydaje się w **global setup, helperach i skryptach standalone**:

- **BrowserType**: `playwright.chromium` / `playwright.firefox` / `playwright.webkit` — wybór przeglądarki; w testach sterujesz tym przez `projects` w configu (`browserName`), nie przez launch ręcznie.
- **launch/connect**: `browserType.launch({ headless, timeout, slowMo })` lokalnie; `connect({ wsEndpoint })` / `connectOverCDP({ endpointURL })` do zdalnej przeglądarki (BrowserStack, Selenium grid, Docker). `slowMo` tylko lokalnie do debugowania — nigdy w CI. `timeout` ustawiaj jawnie (default 30s), nie podnośaj bez powodu.
- **Kontekst vs strona**: `browser.newContext()` izoluje sesję (storage, cookies) — w testach używaj wbudowanego fixture `context`/`page`; ręczne konteksty tylko w setupie/teardownie.
- **API bez przeglądarki**: `playwright.request.newContext({ baseURL, extraHTTPHeaders })` → `APIRequestContext` do czystych testów API (bez browsera) — patrz skill `api-testing`.
- **Custom selectors**: `playwright.selectors.register('data-testid', ...)` — uwaga: domyślnie `getByTestId` używa `data-testid`; rejestruj własny silnik tylko gdy projekt ma inną konwencję atrybutu.
- **Inne**: `playwright.devices` (deskryptory urządzeń dla `devices['iPhone 14']`), `playwright.errors` (typy błędów, np. `TimeoutError`).

```typescript
// global setup / standalone script — NIE w pojedynczym teście
import { chromium, playwright } from '@playwright/test';

const browser = await chromium.launch({ headless: true, timeout: 30_000 });
const api = await playwright.request.newContext({ baseURL: process.env.API_URL });
// ...
await api.dispose();
await browser.close();
```

## Zasady organizacji
- Jeden plik spec per feature/flow (nie per strona)
- POM tylko gdy strona używana w 3+ testach
- Fixture'y dla powtarzalnego setupu (auth, dane)
- Helpery dla operacji API używanych w testach
- Brak logiki biznesowej w testach — tylko kroki + asercje
