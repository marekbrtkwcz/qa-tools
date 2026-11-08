import { expect, test } from '@fixtures/test.fixture';
import { LoginPage } from '@ui/pages/login.page';

test.describe('Logowanie', () => {
  test('użytkownik loguje się poprawnymi danymi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'tajne-haslo');
    await expect(page).toHaveURL(/\/dashboard|\/home|\/kokpit/);
  });

  test('błędne dane pokazują komunikat o błędzie', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'zle-haslo');
    await loginPage.expectErrorVisible();
  });
});
