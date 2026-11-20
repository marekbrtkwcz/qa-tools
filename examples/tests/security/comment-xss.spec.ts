import { test, expect } from '@playwright/test';

// Przykład referencyjny testu security (XSS):
// - nazwa: should <rezultat> when <warunek>
// - payload tylko fikcyjny; sekrety tylko z env
// - asercja: treść enkodowana (nie wykonana) + brak dialogu alert

test.describe('Comments — XSS', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/comments');
  });

  test('should render comment as text when payload is XSS', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', (dialog) => {
      alertFired = true;
      void dialog.dismiss();
    });

    await page.getByLabel('Comment').fill('<script>alert(1)</script>');
    await page.getByRole('button', { name: 'Add comment' }).click();

    // payload widoczny jako tekst (enkodowany), a nie wykonany jako skrypt
    await expect(page.getByText('<script>alert(1)</script>')).toBeVisible();
    expect(alertFired).toBe(false);
  });
});
