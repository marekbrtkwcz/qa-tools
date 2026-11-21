---
name: i18n-testing
description: 'Load this skill when testing internationalization and localization (i18n/l10n) with Playwright: switching locales, RTL layouts, date/number/currency formats per locale, translation fallbacks, and missing keys. Covers locale switching via UI/URL/cookie and asserting text in the target language.'
user-invocable: true
---

# 🌍 i18n / Localization Testing

i18n bugs are invisible until a user switches language: truncated buttons, wrong date formats, mixed-language UI, broken RTL. Test the **locale switch itself** and the **formats**, not just the default language.

## 🎯 When to Use

- the app supports more than one language or locale format
- you need to verify RTL (Arabic, Hebrew) layouts
- dates, numbers, currencies, pluralization differ per locale
- agents: `qa-tools:i18n-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## 🔀 Switching Locale in a Test

Pick the mechanism the app actually uses:

```typescript
// via UI language switcher
await page.getByRole('button', { name: 'Language' }).click();
await page.getByRole('option', { name: 'Polski' }).click();

// via URL locale prefix
await page.goto('/pl/login');

// via cookie / storage set before navigation
await page.context().addCookies([{ name: 'locale', value: 'pl-PL', url: baseURL }]);
```

## ✅ What to Assert

```typescript
test('should format order date as dd.mm.yyyy when locale is pl-PL', async ({ page }) => {
  await page.goto('/pl/orders/123');
  await expect(page.getByTestId('order-date')).toHaveText('20.11.2026'); // pl-PL
});

test('should format the same date as 11/20/2026 when locale is en-US', async ({ page }) => {
  await page.goto('/en/orders/123');
  await expect(page.getByTestId('order-date')).toHaveText('11/20/2026'); // en-US
});

test('should render RTL layout when locale is ar', async ({ page }) => {
  await page.goto('/ar/dashboard');
  expect(await page.evaluate(() => document.dir)).toBe('rtl');
  await expect(page.getByTestId('sidebar')).toBeVisible();
});
```

- **Assert UI text in the target language** — `getByRole('button', { name: 'Zaloguj się' })`, not the English key.
- **Formats**: date, time, number separators (`1 234,56` vs `1,234.56`), currency symbol and position (`1 234,56 zł` vs `zł 1 234,56`).
- **Pluralization**: 1 plik / 2 pliki / 5 plików — test the boundary numbers (1, 2, 5 in Polish).
- **Fallback**: missing translation should show the key or the fallback locale — assert which, explicitly.
- **No mixed-language UI**: after switching, assert the whole visible page, not one element.

## ❌ Common Pitfalls

- Hardcoding expected text in the test's own language instead of the target locale.
- Testing only the default locale — most i18n bugs live in the others.
- Asserting `document.dir` but not the actual layout (flex direction, text alignment).
- Forgetting that numbers/dates may come from the API already formatted — then assert the API contract per `Accept-Language`, not the UI.

## 🧹 Conventions

- Selectors only `getByRole` / `getByLabel` / `getByText` / `getByTestId`; assertions only `await expect(...)`; never `waitForTimeout`.
- Each test sets its own locale and does not depend on a previous test's state.
