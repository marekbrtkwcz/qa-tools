# Playwright test review checklist

Per test file. Record: item, found (Y/N), fixed.

## Locators

| Rule | Bad | Good |
| --- | --- | --- |
| User-first | `page.locator('.btn-primary.mt-2')`, `page.locator('//div[3]/button')` | `page.getByRole('button', { name: 'Save' })` |
| Label/text | CSS on placeholder | `getByLabel('Email')`, `getByPlaceholder('you@example.com')` |
| testid last resort | — | `getByTestId('checkout-total')` only when nothing user-facing exists |

## Waiting

| Rule | Bad | Good |
| --- | --- | --- |
| No time-based waits | `await page.waitForTimeout(3000)` | `await expect(page.getByText('Saved')).toBeVisible()` |
| Absence needs explicit wait | `expect(x).toHaveCount(0)` immediately | `await expect(x).toHaveCount(0)` (auto-waits) |
| Network idle only when needed | `waitForLoadState('networkidle')` everywhere | wait on the specific response/request that matters |

## Assertions and structure

- assert on visible outcome (text, role, state, URL), not attributes/implementation
- one behaviour per test; arrange–act–assert
- setup in fixtures, not repeated blocks

## Determinism and evidence

- unique data per test/worker; teardown cleans up
- auth via storageState setup project, not per-test login
- third-party/network stubbed when not under test
- trace/video/screenshot on failure enabled
- 10 consecutive green runs (local + CI)
