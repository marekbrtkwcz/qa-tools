# Selector Patterns & Anti-Patterns

## Fallback chain template (TypeScript / Playwright)

```typescript
import { Page, Locator } from '@playwright/test';

export async function resilientLocator(
  page: Page,
  strategies: Array<() => Locator>,
  description: string
): Promise<Locator> {
  for (const strategy of strategies) {
    const locator = strategy();
    try {
      if (await locator.count() > 0) {
        return locator.first();
      }
    } catch {
      // strategy failed, try next
    }
  }
  throw new Error(`Could not locate: ${description}`);
}

// Usage:
const saveButton = await resilientLocator(page, [
  () => page.getByTestId('save-btn'),
  () => page.getByRole('button', { name: /save/i }),
  () => page.locator('button:has-text("Save")'),
], 'Save button');
```

## Playwright locator cheat sheet (best to worst)

| Locator | Example | Stability |
|---|---|---|
| `getByTestId` | `page.getByTestId('checkout')` | ⭐⭐⭐ |
| `getByRole` | `page.getByRole('dialog', { name: 'Confirm' })` | ⭐⭐⭐ |
| `getByLabel` | `page.getByLabel('Username')` | ⭐⭐⭐ |
| `getByText` | `page.getByText('Welcome back')` | ⭐⭐ |
| `getByPlaceholder` | `page.getByPlaceholder('Search...')` | ⭐⭐ |
| `locator(css)` | `page.locator('.btn-primary')` | ⭐ |
| `locator(xpath)` | `page.locator('//div[2]/button[1]')` | ⭐ |

## Anti-patterns

- ❌ `page.locator('div > div > div > button')` — breaks on any wrapper change
- ❌ `page.locator('.list-item').nth(3)` — breaks on reordering
- ❌ `page.locator('#id-generated-12345')` — dynamic IDs
- ❌ `page.locator('text=Click here')` — breaks on copy changes
- ✅ Prefer role + name over any structural selector
