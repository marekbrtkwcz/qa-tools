---
name: hybrid-ui-api-testing
description: 'Designs and writes hybrid tests that combine UI and API in one flow: seed state via API calls (fast, deterministic setup), drive the user journey through the UI, and verify outcomes via API responses (precise assertions) as well as UI. Use when UI tests are slow because of UI-only setup, when you need to verify backend state after a UI action, when testing flows that span both layers (e.g. place order in UI, verify in database via API), or when reducing test runtime by replacing UI setup with API calls. For pure API tests, use api-playwright-test-developer; for pure UI tests, use writing-playwright-tests-best-practices.'
argument-hint: 'The user flow to test, available API endpoints for setup/verification, and the Playwright suite structure'
user-invocable: true
---

# Hybrid UI + API Testing

The fastest, most reliable tests use each layer for what it is best at: API for setup and state verification, UI for the actual user journey. This skill turns that principle into a concrete pattern inside Playwright suites.

## When to Use

- UI test setup is slow (clicking through 5 screens to reach the state under test)
- You need to assert backend/database state after a UI action
- End-to-end flows span UI + API (place order in UI → verify via API)
- Reducing suite runtime by replacing UI-only setup with API calls
- Testing side effects not visible in the UI (webhooks fired, queue messages, emails)

## When NOT to Use

- Pure API testing with no UI — use `api-playwright-test-developer`
- Pure UI testing — use `writing-playwright-tests-best-practices`
- The API and UI under test are owned by different teams with no shared test environment

## The Pattern

```
API setup (seed data, auth token, state)  →  UI action (the actual user journey)  →  Verify (UI assertion + API assertion)
     fast, deterministic                          the thing users do                    precise, layer-appropriate
```

## Workflow

### 1. Map the flow

For the flow under test, list:
- **Setup needs**: what state must exist before the UI action? (users, orders, config)
- **UI action**: the 1-3 user interactions that are the point of the test
- **Verification**: what should be true in the UI? What should be true in the backend?

### 2. Build API setup helpers

```typescript
// helpers/api.ts
import { APIRequestContext } from '@playwright/test';

export async function seedOrder(request: APIRequestContext, order: Partial<Order>) {
  const response = await request.post('/api/orders', { data: order });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function getOrderStatus(request: APIRequestContext, orderId: string) {
  const response = await request.get(`/api/orders/${orderId}`);
  return response.json();
}
```

- Auth via token in `beforeAll` / fixture, not UI login — see `testing-auth-flows`
- Clean up seeded data in `afterEach`/`afterAll` via API `DELETE`
- Done when: setup is one function call, not a chain of UI steps

### 3. Write the hybrid test

```typescript
test('user sees order in list after placing it', async ({ page, request }) => {
  // API: seed the user's session state
  const user = await seedUser(request, { plan: 'premium' });

  // UI: the actual user action
  await page.goto('/orders/new');
  await page.getByRole('button', { name: 'Place order' }).click();

  // UI assertion: user sees confirmation
  await expect(page.getByRole('status')).toContainText('Order placed');

  // API assertion: backend recorded it correctly
  const orders = await listOrders(request, user.id);
  expect(orders).toHaveLength(1);
  expect(orders[0].status).toBe('pending');
});
```

### 4. Choose assertion placement

| What to verify | Assert via | Why |
|---|---|---|
| User sees it | UI | That is the user contract |
| Data stored correctly | API | Precise, no UI parsing |
| Side effect fired (email, webhook) | API / mock | Not visible in UI |
| Redirect / navigation | UI | User-facing behavior |

### 5. Validate

- Run the test: `npx playwright test hybrid/`
- Confirm setup via API is measurably faster than UI-only setup (quote timings)
- Confirm cleanup removes seeded data (query API after test)
- Done when: test passes, seeded data is cleaned up, runtime is lower than the UI-only equivalent

## Output

- API helper module (`helpers/api.ts`) with seed/verify/cleanup functions
- Hybrid tests following the setup→UI→verify pattern
- Runtime comparison: hybrid vs UI-only setup for the same flow

## Resource Map

- `resources/hybrid-patterns.md`: copy-paste patterns for common hybrid scenarios (seed→act→verify, API auth in UI tests, webhook verification, cleanup strategies)

## Related Skills

- `api-playwright-test-developer` — the `request` fixture and APIRequestContext details
- `testing-auth-flows` — API token auth shared between UI and API calls
- `test-data-factories` — generating seed data via API
- `mocking-network-and-time` — webhook/mock verification of side effects

## Definition of Done

- Each hybrid test uses API for setup, UI for the journey, and both layers for verification where appropriate
- Seeded data is cleaned up after each test
- Suite runtime for hybrid tests is lower than UI-only equivalent (quoted)
- No UI login in setup — auth via token/storageState
