---
name: mocking
description: Load this skill when mocking network, time, or randomness in tests. Covers MSW (browser Service Worker and Node setupServer), Playwright page.route, deterministic API responses, fault injection (500/timeout/network error), time mocking (fake timers, clock, date), and rules for what to mock (external/unstable dependencies) vs what to hit for real.
user-invocable: true
---

# Mocking Network, Time & Randomness

Mock **at the boundary** to make tests deterministic and fast — but mock only what is external or unstable. The app under test's own backend should be real in E2E.

## 🎭 1. MSW (Mock Service Worker) — preferred for HTTP

Install `msw` (v2 API: `http` + `HttpResponse`).

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'Mocked User' })
  ),
  // fault injection — see chaos area
  http.get('/api/orders', () => HttpResponse.error()),            // network error
  http.get('/api/flaky', () => HttpResponse.json({}, { status: 500 })),
  http.get('/api/slow', async () => {
    await new Promise((r) => setTimeout(r, 3000));
    return HttpResponse.json({ ok: true });
  }),
];
```

**Browser (E2E/UI):**

```typescript
import { setupWorker } from 'msw/browser';

const worker = setupWorker(...handlers);

test.beforeAll(async () => { await worker.start({ onUnhandledRequest: 'warn' }); });
test.afterEach(() => worker.resetHandlers());
test.afterAll(async () => { await worker.stop(); });
```

**Node (API tests with playwright request):**

```typescript
import { setupServer } from 'msw/node';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Per-test override** (reset happens in `afterEach`):

```typescript
worker.use(http.get('/api/users/:id', () => HttpResponse.json({ id: '1', name: 'Override' })));
```

## 🛣️ 2. Playwright page.route — when MSW can't reach it

Use for binary files, WebSocket upgrades, or when MSW and route would collide (never both on the same URL in one test):

```typescript
test('should show fallback banner when API returns 500', async ({ page }) => {
  await page.route('**/api/orders', (route) => route.fulfill({ status: 500, body: 'oops' }));
  await page.goto('/orders');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.unroute('**/api/orders'); // cleanup
});
```

## ⏰ 3. Time & randomness

- **Fake timers** in unit tests: `vi.useFakeTimers()` / `vi.setSystemTime(...)`; in Playwright use `page.clock` (Playwright ≥1.45) for browser-side time:

```typescript
await page.clock.install({ time: new Date('2026-11-20T12:00:00Z') });
await page.clock.runFor(5000); // advance without real waiting
```

- Never `waitForTimeout` to "wait for the async thing" — use `expect.poll(..., { timeout })` for real async, fake timers for unit tests.
- Randomness: seed the RNG or inject it; assert structure/invariants, not random values.

## 📏 Rules

- Mock only **external/unstable** dependencies (payment provider, 3rd-party API, flaky service). Own API stays real in E2E.
- `onUnhandledRequest: 'warn'` (or `'error'` in strict suites) — a silent pass-through hides missing mocks.
- Deterministic payloads: fixed IDs, fixed dates (`2026-11-20`), no `Date.now()` inside handlers.
- Assert the **UI/behavior reacted to the mock** (banner shown, retry happened), not that the mock was called — except in pure API tests where the response itself is the subject.
- Cleanup in `afterEach`/`afterAll`: `resetHandlers()`, `unroute()`, `server.close()`, `worker.stop()`.
- Secrets in mocks: none — fictitious tokens only (`test-token-123`).
- Naming: `should <result> when <condition>` (e.g. `should show error toast when API returns 500`).

## ✅❌ Good vs bad

✅ DOBRY:
```typescript
test('should show error toast when API returns 500', async ({ page }) => {
  await page.route('**/api/orders', (r) => r.fulfill({ status: 500 }));
  await page.goto('/orders');
  await expect(page.getByRole('alert')).toContainText('Something went wrong');
  await page.unroute('**/api/orders');
});
```

❌ ZŁY:
```typescript
test('mock works', async ({ page }) => {
  let called = false;
  await page.route('**/api/orders', (r) => { called = true; r.continue(); });
  await page.goto('/orders');
  await page.waitForTimeout(2000); // zakazane
  expect(called).toBe(true);      // testujemy mock, nie zachowanie
});
```

## ✅ Checklist

- [ ] Only external/unstable deps mocked; own API real in E2E
- [ ] MSW worker/server started in beforeAll, reset in afterEach, stopped in afterAll
- [ ] `onUnhandledRequest` set to warn/error — no silent pass-through
- [ ] Deterministic payloads (fixed IDs/dates)
- [ ] Assertions on behavior, not on mock invocation
- [ ] page.route used only where MSW can't reach; unroute in cleanup
- [ ] Time via fake timers / page.clock; async via expect.poll with deadline — never waitForTimeout
