# axe-core in Playwright — Setup Reference

## Fixture

```typescript
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend({
  a11y: async ({ page }, use) => {
    await use(async (opts = {}) => {
      return new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .options(opts)
        .analyze();
    });
  },
});
```

## Common axe rules → WCAG criteria

| Rule ID | WCAG | Severity |
|---|---|---|
| `color-contrast` | 1.4.3 | serious |
| `label` | 3.3.2 / 1.3.1 | critical |
| `button-name` | 4.1.2 | critical |
| `image-alt` | 1.1.1 | critical |
| `heading-order` | 1.3.1 | moderate |
| `landmark-one-main` | 1.3.1 | moderate |
| `region` | 1.3.1 | moderate |

## Scoping

```typescript
// Only check a component
await a11y({ include: ['#payment-form'] });

// Exclude third-party widget
await a11y({ exclude: ['#chat-widget', '.ads-container'] });
```

## Anti-patterns

- ❌ Disabling rules globally to make tests pass
- ❌ Only checking the homepage
- ❌ Treating all violations as blocking (moderate/minor = noise)
