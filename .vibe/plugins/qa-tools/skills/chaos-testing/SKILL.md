---
name: chaos-testing
description: 'Load this skill when testing application resilience — fault injection, degraded dependencies, timeouts, 5xx responses, network drops — with Playwright (page.route / route.fulfill / route.abort) and the request fixture. Covers safe fault injection rules, cleanup in afterEach, and asserting graceful degradation instead of crashes.'
user-invocable: true
---

# 🌪️ Chaos & Fault-Injection Testing

Chaos testing answers one question: **what does the user see when a dependency fails?** Not "does the system crash" but "does it degrade gracefully". In Playwright, faults are injected via `page.route` (UI) or by mocking responses on `request` (API) — always on a **test environment only**.

## 🎯 When to Use

- a flow depends on an API that can be slow, fail, or return garbage
- you need to verify error banners, retries, fallbacks, offline states
- a third-party service (payments, maps, auth) must be simulated as down
- agents: `qa-tools:chaos-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## 🔌 Fault Injection with page.route

Set the route **before** the action that triggers the request:

```typescript
test('should show error banner when orders API returns 500', async ({ page }) => {
  await page.route('**/api/orders', (route) => route.fulfill({ status: 500, body: 'err' }));
  await page.goto('/orders');
  await expect(page.getByRole('alert')).toHaveText('Could not load orders');
});
```

| Fault | How |
|---|---|
| HTTP 500 / 404 / 503 | `route.fulfill({ status: 500, body: 'err' })` |
| Empty / malformed body | `route.fulfill({ status: 200, contentType: 'application/json', body: '{invalid' })` |
| Slow response (3s) | `await new Promise(r => setTimeout(r, 3000)); await route.continue();` — delay **inside the handler**, never `waitForTimeout` in the test |
| Network drop | `route.abort()` |
| Partial payload | `route.fulfill({ status: 200, body: JSON.stringify({ items: [] }) })` |

## ✅ DOBRY / ❌ ZŁY

```typescript
// ✅ DOBRY: fault + real assertion + cleanup
test('should retry and recover when API fails once', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/orders', (route) => {
    calls++;
    if (calls === 1) return route.fulfill({ status: 500 });
    return route.continue();
  });
  await page.goto('/orders');
  await expect(page.getByRole('list')).toBeVisible(); // retry succeeded
});

// ❌ ZŁY: waitForTimeout + tautology
test('chaos 1', async ({ page }) => {
  await page.route('**/api/**', (r) => r.abort());
  await page.goto('/');
  await page.waitForTimeout(3000);
  expect(true).toBe(true);
});
```

## 🧹 Safety Rules (mandatory)

- **Faults only on test/staging environments** — never inject faults against production or real payments.
- **Always clean up**: `await page.unroute('**/api/orders')` in `afterEach` so the fault does not leak into the next test.
- Each test injects and removes its own fault — tests stay independent.
- Scope routes narrowly (`**/api/orders`, not `**/api/**`) unless the scenario is "everything is down".
- Assert the **user-visible outcome** (alert, fallback UI, retry button, cached data), not just the status code.

## 🌐 API-Level Chaos (request fixture)

```typescript
test('should return 503 when downstream is unavailable', async ({ request }) => {
  // app-level: assert the app maps a downstream failure to 503 + error body
  const res = await request.get('/api/aggregated');
  expect(res.status()).toBe(503);
  expect(await res.json()).toMatchObject({ error: 'downstream_unavailable' });
});
```

For true fault injection against a downstream, use a mock server (MSW / WireMock) in the test environment — see `mocking` skill.
