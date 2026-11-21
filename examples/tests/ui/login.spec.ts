import { expect, test } from '@playwright/test';

// Przykład referencyjny konwencji qa-tools:
// - nazwa testu: should <rezultat> when <warunek>
// - selektory: getByLabel / getByRole (nigdy CSS/XPath)
// - asercje: tylko await expect(...) z auto-retry (nigdy waitForTimeout)
// - sekrety: tylko ze zmiennych środowiskowych

test.describe('Logowanie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should redirect to dashboard when credentials are valid', async ({ page }) => {
    await page.getByLabel('Email').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill(process.env.TEST_USER_PASSWORD ?? '');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
