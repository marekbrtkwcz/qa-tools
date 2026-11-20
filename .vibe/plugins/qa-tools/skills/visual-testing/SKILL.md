---
name: visual-testing
description: Load this skill when writing or reviewing visual regression tests with Playwright. Covers toHaveScreenshot, baselines, masks, animations/caret options, thresholds, viewports, fullPage, fonts, dark mode, CI strategy, and Percy/Applitools comparison.
user-invocable: true
---

# Visual Regression Testing with Playwright

## 🖼️ Basics — `toHaveScreenshot`

```typescript
test('should match home page screenshot when loaded', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');          // full page by default options
  await expect(page.getByRole('main')).toHaveScreenshot('home-main.png'); // element snapshot
});
```

- First run creates the **baseline** (`__snapshots__/` next to the spec); commit baselines to git
- Update baselines intentionally: `npx playwright test --update-snapshots` (review the diff before committing!)
- Never commit `*-actual.png` / `*-diff.png` artifacts — only baselines (add to `.gitignore`)

## 🧊 Stabilize screenshots — always

```typescript
await expect(page).toHaveScreenshot('home.png', {
  animations: 'disabled',   // freeze CSS animations/transitions
  caret: 'hide',            // hide text cursor
  mask: [page.locator('.timestamp'), page.locator('.avatar')], // dynamic content
  maxDiffPixelRatio: 0.01,  // or threshold: 0.2 — only when the plan says so
});
```

- `animations: 'disabled'` + `caret: 'hide'` — **always**, otherwise flaky
- `mask` every dynamic content (dates, avatars, ads, counters) — listed in the scenario plan
- `threshold` / `maxDiffPixelRatio` only per plan; default strict (0 diff) for critical screens
- wait for the full state before the screenshot: `await expect(page.getByRole('heading')).toBeVisible()` — never screenshot right after `goto`
- fonts: wait for `document.fonts.ready` before screenshot (`await page.evaluate(() => document.fonts.ready)`)

## 📐 Viewports & devices

```typescript
test.use({ viewport: { width: 1280, height: 720 } });

test('should match mobile home screenshot when viewport is 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-mobile.png');
});
```

- One `describe` per screen, one test per viewport — screenshot name: `<screen>-<viewport>.png`
- Test at least: desktop 1280px, mobile 390px (or per plan); `fullPage: true` only when the plan requires
- Dark mode: `test.use({ colorScheme: 'dark' })` + separate baseline `home-dark.png`

## 🤖 CI strategy

- Run visual tests in **one dedicated project** (`{ name: 'visual', use: { ...devices['Desktop Chrome'] } }`) — same browser/font rendering every run; run on CI with `--project=visual`
- Linux CI renders fonts differently than macOS/Windows → generate baselines on CI (or use Docker image with fixed fonts), never mix local+CI baselines
- Shard by spec file; keep total visual suite < 10 min
- On failure, artifacts (`*-actual.png`, `*-diff.png`) must be uploaded (see `examples/ci/e2e.yml` pattern) — review them in the PR

## 🧰 External tools (optional)

- **Percy / Applitools**: snapshot via their SDK or `page.screenshot()` upload; cross-browser matrix for free. Playwright baselines stay the source of truth for local dev
- Use them when you need many browsers/OS combos; keep Playwright `toHaveScreenshot` for the main flow

## 🏷️ Naming & structure (qa-tools conventions)

- test names: `should match <screen> screenshot when <state> on <viewport>`
- files: `tests/visual/<screen>.spec.ts`; screenshots: `<screen>-<viewport>.png`

## ⚠️ Common pitfalls

| Pitfall | Fix |
|---|---|
| Flaky diffs from animations | `animations: 'disabled'`, `caret: 'hide'` |
| Dynamic content in shot | `mask: [...]` per plan |
| Screenshot before fonts/images load | `document.fonts.ready` + `toBeVisible` on key element |
| Different rendering local vs CI | baselines generated on CI, fixed-font Docker image |
| Committed diff artifacts | `.gitignore`: `*-actual.png`, `*-diff.png` |
| Huge fullPage screenshots | `fullPage` only per plan; prefer element snapshots |
| Antialiasing noise across GPUs | `maxDiffPixelRatio` small (0.01–0.02) or fixed CI environment |
