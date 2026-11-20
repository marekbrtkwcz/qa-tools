---
name: mobile-testing
description: Load this skill when testing mobile web apps or responsive layouts with Playwright. Covers device emulation (devices descriptors, viewport, touch), mobile projects in playwright.config, touch gestures (tap, swipe, pinch), mobile-specific pitfalls (no hover, small viewport, meta viewport), and mobile browser choice.
user-invocable: true
---

# Mobile Testing with Playwright

## Device emulation — config projects

Use Playwright's built-in device descriptors in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
});
```

Run only mobile: `npx playwright test --project=mobile-chrome --project=mobile-safari`.

Key descriptor fields: `viewport` (e.g. `{ width: 390, height: 844 }`), `deviceScaleFactor`, `isMobile`, `hasTouch`, `userAgent`. Override per test with `test.use({ viewport: { width: 320, height: 568 } })`.

## Touch gestures

With `hasTouch: true` the `page.touchscreen` API is available:

```typescript
await page.touchscreen.tap(page.getByRole('button', { name: 'Menu' }));

// swipe: dispatch touch events manually
await page.locator('.carousel').evaluate(el => {
  const r = el.getBoundingClientRect();
  const y = r.top + r.height / 2;
  const opts = (x: number) => ({ bubbles: true, clientX: x, clientY: y, pointerId: 1 });
  el.dispatchEvent(new PointerEvent('pointerdown', opts(r.left + 10)));
  el.dispatchEvent(new PointerEvent('pointermove', opts(r.right - 10)));
  el.dispatchEvent(new PointerEvent('pointerup', opts(r.right - 10)));
});
```

Prefer high-level actions first: `tap()`, `click()` (works with touch), and `expect` auto-retry. Use raw pointer events only for gestures Playwright has no API for (swipe, pinch, long-press).

## Mobile-specific rules

- **No hover**: `:hover` styles and hover menus don't exist on touch — test the tap behavior instead. Never assert hover state on mobile projects.
- **Tap targets**: assert buttons are large enough (`await expect(btn).toBeVisible()` + optionally bounding box ≥ 44px via `boundingBox()`).
- **Viewport meta**: the app must include `<meta name="viewport" content="width=device-width, initial-scale=1">` — otherwise `isMobile` emulation renders at 980px fallback. Test small viewports explicitly: `test.use({ viewport: { width: 320, height: 568 } })` (iPhone SE).
- **Text size / overflow**: assert no horizontal scroll: `await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll')` or check `document.documentElement.scrollWidth <= viewport.width` via evaluate.
- **Keyboard**: mobile keyboards cover the viewport — after `fill()` on an input, assert the submit button is still visible (`toBeVisible()`), or scroll via `locator.scrollIntoViewIfNeeded()`.
- **Selectors stay the same**: `getByRole`/`getByLabel`/`getByText` work identically on mobile — do not switch to CSS because "it's mobile".
- **userAgent / UA sniffing**: if the app serves different markup per UA, test both projects (mobile + desktop) for the same flow.
- **Never `waitForTimeout`** for animations/transitions on mobile — assert the end state with `expect`.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Testing mobile UI in a desktop project | dedicated `devices[...]` project |
| Forgetting `isMobile`/`hasTouch` | spread the full device descriptor, don't cherry-pick |
| Asserting hover styles | test tap instead |
| Fixed 980px layout | check `meta viewport`, test 320px width |
| Gestures via mouse events | use `touchscreen`/pointer events |
| Flaky tap on moving elements | `expect(locator).toBeStable()` before tap, or tap via `dispatchEvent('click')` as last resort |
