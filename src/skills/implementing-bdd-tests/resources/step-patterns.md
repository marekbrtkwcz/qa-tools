# BDD Step Definition Patterns

## Common step patterns (Playwright-BDD / Cucumber.js)

```typescript
// Auth
Given('the user is logged in as {string}', async ({ page }, role) => {
  const storageState = `auth/${role}.json`; // from testing-auth-flows
  await page.context().addInitScript(
    s => localStorage.setItem('auth', s), ''
  );
});

// Forms
When('the user fills {string} with {string}', async ({ page }, field, value) => {
  await page.getByLabel(field).fill(value);
});

// Assertions
Then('the page shows {string}', async ({ page }, text) => {
  await expect(page.getByRole('main')).toContainText(text);
});

// Tables (scenario outline)
When('the following users are created:', async ({ page }, dataTable) => {
  for (const row of dataTable.rows()) {
    await createUserViaApi(row[0], row[1]);
  }
});
```

## Config snippets

```js
// cucumber.js
module.exports = {
  paths: ['features/**/*.feature'],
  require: ['steps/**/*.ts'],
  format: ['progress', 'html:reports/cucumber.html'],
};
```

```ts
// playwright.config.ts (playwright-bdd)
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
export default defineConfig({
  ...defineBddConfig({
    features: 'features/**/*.feature',
    steps: 'steps/**/*.ts',
  }),
});
```
