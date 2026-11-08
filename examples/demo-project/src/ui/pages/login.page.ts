import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object dla strony logowania.
 * Konwencja: lokatory przez getByRole/getByLabel — nigdy CSS/XPath.
 */
export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel(/e-?mail/i);
    this.passwordInput = page.getByLabel(/hasło|password/i);
    this.submitButton = page.getByRole('button', { name: /zaloguj|log in|sign in/i });
    this.errorMessage = page.getByRole('alert').or(page.getByText(/błędne|invalid|nieprawidłowe/i));
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
