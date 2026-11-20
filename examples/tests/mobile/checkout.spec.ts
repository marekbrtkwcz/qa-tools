import { test, expect } from '@playwright/test';

// Reference example of a mobile test:
// - run in a device project (devices['Pixel 7']) — see examples/playwright.config.ts
// - same getBy* selectors as desktop; tap via click/touchscreen
// - assert SPA routing with toHaveURL, never waitForTimeout

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Checkout — mobile', () => {

  test('should confirm order when paying with tap on mobile viewport', async ({ page }) => {
    await page.goto('/checkout');

    await page.getByRole('button', { name: 'Pay' }).click();

    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  });

  test('should not have horizontal scroll at 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/checkout');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
});
