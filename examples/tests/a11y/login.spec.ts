import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Przykład referencyjny testu a11y:
// - skan axe-core: zero naruszeń critical/serious
// - nawigacja klawiaturą przez Tab + toBeFocused()
// - selektory getBy* (rola i label to podstawa a11y)

test.describe('Login page accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should have no critical or serious a11y violations when login page is open', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(blocking).toEqual([]);
  });

  test('should focus submit button when tabbing through the form', async ({ page }) => {
    await page.getByLabel('Email').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Log in' })).toBeFocused();
  });
});
