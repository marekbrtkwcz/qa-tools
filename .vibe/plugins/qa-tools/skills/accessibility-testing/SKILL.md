---
name: accessibility-testing
description: Load this skill when testing web accessibility (a11y). Covers WCAG guidelines, axe-core integration with Playwright, keyboard navigation testing, screen reader considerations, and color contrast checks.
user-invocable: true
---

# Accessibility Testing

## Automated checks with axe-core
Integrate `@axe-core/playwright` for automated WCAG violations:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

## What axe-core catches (and what it doesn't)
| ✅ Automated | ❌ Manual required |
|---|---|
| Missing alt text | Screen reader experience |
| Color contrast | Keyboard navigation flow |
| Missing labels | Focus order logic |
| Invalid ARIA | Cognitive load / clarity |
| Heading hierarchy | Motion / animation sensitivity |

## Keyboard navigation test
```typescript
test('can navigate entire form with keyboard only', async ({ page }) => {
  await page.goto('/signup');
  await page.keyboard.press('Tab'); // first field
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.keyboard.press('Tab'); // next field
  await expect(page.getByLabel('Password')).toBeFocused();
  // ... continue through all fields
  await page.keyboard.press('Enter'); // submit
  await expect(page).toHaveURL('/welcome');
});
```

## WCAG quick checklist
- [ ] All images have meaningful `alt` (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>`
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large
- [ ] All functionality available via keyboard
- [ ] Focus indicator visible on all interactive elements
- [ ] Page has a descriptive `<title>`
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Error messages are descriptive and associated with fields
