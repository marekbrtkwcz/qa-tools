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
- `api-test-plan-and-tests` (api-testing) — planning the API half of a hybrid suite from the OpenAPI spec when it is larger than the UI journey needs

## Definition of Done

- Each hybrid test uses API for setup, UI for the journey, and both layers for verification where appropriate
- Seeded data is cleaned up after each test
- Suite runtime for hybrid tests is lower than UI-only equivalent (quoted)
- No UI login in setup — auth via token/storageState
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
