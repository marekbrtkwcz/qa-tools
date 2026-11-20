---
name: playwright-test-writing
description: Load this skill when writing, reviewing, or refactoring Playwright tests (UI or E2E). Covers selectors, assertions, stability, Page Object Model, and common anti-patterns.
user-invocable: true
---

# Writing Playwright Tests

## Selectors — priority order
Always prefer resilient, user-facing selectors:

1. `getByRole()` — best for buttons, links, inputs, headings
2. `getByLabel()` — form fields with associated labels
3. `getByText()` — non-interactive text content
4. `getByPlaceholder()` — inputs with placeholder
5. `getByTestId()` — last resort, requires `data-testid` in app
6. CSS/XPath — avoid, they break easily

## Assertions
Use `expect` from `@playwright/test` — it auto-retries until timeout:

```typescript
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page).toHaveURL(/dashboard/);
await expect(page.getByRole('alert')).toBeVisible();
```

Never use `waitForTimeout()` — it makes tests flaky. Always wait for a condition via `expect`.

## Test structure
```typescript
test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Anti-patterns to avoid
- ❌ `page.waitForTimeout(3000)` — use `expect` instead
- ❌ CSS selectors like `.btn-primary` — use roles/labels
- ❌ Testing implementation details — test user-visible behavior
- ❌ One giant test — split into focused, independent tests
- ❌ Shared state between tests — each test should be independent

## Page Object Model
Use POM when the same page appears in multiple tests:

```typescript
class LoginPage {
  constructor(private page: Page) {}
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
```
