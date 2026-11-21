import { expect, test } from '@playwright/test';

// Przykład referencyjny testu i18n:
// - nazwa: should <rezultat> when <warunek>
// - asercje w języku docelowym (getByRole/getByText z polskim tekstem)
// - formaty per locale; nigdy waitForTimeout; locale izolowane per test

test.describe('i18n — pl-PL', () => {
  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should format date as dd.mm.yyyy when locale is pl-PL', async ({ page }) => {
    await page.goto('/pl/orders/123');

    expect(await page.evaluate(() => document.documentElement.lang)).toBe('pl');
    await expect(page.getByRole('heading', { name: 'Zamówienie' })).toBeVisible();
    await expect(page.getByTestId('order-date')).toHaveText('20.11.2026');
  });
});
