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

## Framework-aware testing (React / Angular / Vue / Svelte / Next.js / ...)

The app under test may be built with any framework — **never branch test logic on the framework**. Selectors stay user-facing (`getByRole`/`getByLabel`/`getByText`/`getByTestId`) regardless of framework. Framework knowledge is used only for *waiting strategy and debugging*, never for selectors:

- **SPA routing**: after clicks that only change client-side route, assert `await expect(page).toHaveURL(/.../)` — do NOT wait for `load` event. Consider `page.goto(url, { waitUntil: 'domcontentloaded' })` for heavy SPAs.
- **Re-renders / change detection (React, Angular, Vue, Svelte)**: state can be reset by a re-render right after an action. Rely on `expect` auto-retry; if an element must be re-queried, re-locate it (never cache locators across awaits that may trigger re-render).
- **Hashed/generated CSS classes** (CSS Modules, Tailwind, Angular emulated encapsulation, Svelte scoped styles): class names like `.btn_x7f3a` are unstable — never use them as selectors.
- **Shadow DOM / Web Components**: Playwright's `getBy*` and CSS selectors pierce **open** shadow roots by default — no special syntax needed. Closed shadow roots are not pierceable; in that case use `getByTestId` placed on the host or light-DOM text.
- **Hydration (Next.js, Nuxt, SvelteKit)**: after `goto`, wait for interactivity via an `expect` on an interactive element (`toBeVisible`/`toBeEnabled`), never via `waitForTimeout`.
- **Angular**: avoid `ng-reflect-*` attributes as selectors; change detection is handled by `expect` polling.
- **data-testid**: agree with the team on a stable `data-testid` convention — it is the framework-agnostic escape hatch when roles/labels are not available (e.g. icon-only buttons).

```typescript
// ✅ framework-agnostic — works the same in React, Angular, Vue, Svelte
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByRole('status')).toHaveText('Saved');
await expect(page).toHaveURL(/\/items\/\d+/);
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
