# Scenario: Orders API returns 500 (chaos / fault injection)

## 1. Scenario name
Orders page shows an error banner and keeps the UI usable when the orders API fails with 500

## 2. Preconditions
- App available at base URL from config (env), test account logged in via `beforeEach`
- Playwright request interception available (`page.route`)

## 3. Steps
1. Test injects a fault: `page.route('**/api/orders', route => route.fulfill({ status: 500 }))` BEFORE navigation
2. User opens `/orders`

## 4. Validation points
- Error banner is visible with exact text: `await expect(page.getByRole('alert')).toHaveText('Could not load orders')`
- Page did not crash: heading still visible: `await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()`
- Fault is cleaned up in `afterEach` (`page.unroute`) — no leakage between tests

## 5. Test data
- None (fault only)

## 6. Out of scope
- Latency injection, network abort, partial responses (separate scenarios)
- Real destructive actions — faults only on the test environment
