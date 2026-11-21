import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { z } from 'zod';

// Referencyjny smoke test konwencji qa-tools — działa w pełni offline:
// backend jest zamockowany przez page.route, więc test przechodzi też w CI
// bez stawiania aplikacji. Konwencje:
// - nazwa: should <rezultat> when <warunek>, tag @smoke wybierany w CI
// - selektory: getByLabel / getByRole (nigdy CSS/XPath)
// - asercje: tylko await expect(...) (nigdy waitForTimeout)

// Kontrakt odpowiedzi /api/session — zod pilnuje, że frontend dostaje
// dokładnie taki kształt danych, jakiego oczekuje (a nie „cokolwiek”).
const SessionSchema = z.object({
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    role: z.enum(['user', 'admin']),
  }),
});

test.describe('Smoke logowania (mockowany backend)', () => {
  // Ziarno = deterministyczne dane fikcyjne w każdym runie (bez flaków od losowości).
  test.beforeEach(() => {
    faker.seed(123);
  });

  test('@smoke @regression should redirect to dashboard when credentials are submitted', async ({ page }) => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    await page.route('**/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: `<html><body>
          <form action="/dashboard" method="get">
            <label for="email">Email</label><input id="email" name="email" />
            <label for="password">Hasło</label><input id="password" name="password" type="password" />
            <button type="submit">Zaloguj się</button>
          </form>
          <script>fetch('/api/session')</script>
        </body></html>`,
      }),
    );
    await page.route('**/api/session', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          user: { id: faker.string.uuid(), email, role: 'user' },
        }),
      }),
    );
    await page.route('**/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<html><body><h1>Dashboard</h1></body></html>',
      }),
    );

    const sessionResponsePromise = page.waitForResponse('**/api/session');
    await page.goto('/login');
    const session = SessionSchema.parse(await (await sessionResponsePromise).json());
    expect(session.user.email).toBe(email);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Hasło').fill(password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
