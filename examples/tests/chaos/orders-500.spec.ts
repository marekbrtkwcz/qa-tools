import { test, expect } from '@playwright/test';

// Reference example of a chaos test (fault injection):
// - page.route set BEFORE the action that triggers the request
// - assert the fallback UI, not just "no crash"
// - cleanup: unroute in afterEach (faults must not leak between tests)
// - never waitForTimeout — waits live inside the route handler

test.describe('Orders — API 500', () => {

  test.afterEach(async ({ page }) => {
    await page.unroute('**/api/orders');
  });

  test('should show error banner when orders API returns 500', async ({ page }) => {
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' })
    );

    await page.goto('/orders');

    await expect(page.getByRole('alert')).toHaveText('Could not load orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });
});
