---
name: test-data-management
description: Load this skill when designing test data strategies. Covers generating realistic test data, managing fixtures, handling PII/sensitive data in tests, database seeding, and cleanup strategies.
user-invocable: true
---

# Test Data Management

## Strategies for test data

| Strategy | When to use | Example |
|---|---|---|
| **Hardcoded fixtures** | Small, stable datasets | login credentials, known products |
| **Generated data** | Large datasets, edge cases | `faker` library for names/emails |
| **Database seeding** | Integration/E2E tests needing DB state | seed script before test suite |
| **API-created data** | Tests that need fresh, unique data | create via API in `beforeEach` |
| **Snapshot/mock** | Unit tests, external APIs | MSW, recorded responses |

## Generating realistic data with faker
```typescript
import { faker } from '@faker-js/faker';

const user = {
  email: faker.internet.email(),
  name: faker.person.fullName(),
  address: faker.location.streetAddress(),
};
```

## Unique data per test run
Avoid collisions in shared environments:
```typescript
const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
```

## PII and sensitive data
- **Never use real production data in tests**
- Use anonymized/synthetic data only
- Mask sensitive fields in test logs and screenshots
- GDPR: test data with personal info must be deletable

## Database seeding
```typescript
// seed.ts — run before E2E suite
test.beforeAll(async ({ request }) => {
  await request.post('/api/test/seed', {
    data: { scenario: 'checkout-flow' }
  });
});
```

### Direct DB seeding (SQL / ORM / migration runner)

When there is no seed API, seed the database directly in `global setup` (runs once per run, with its own DB connection — never inside a test):

```typescript
// global-setup.ts
import { PrismaClient } from '@prisma/client';

export default async () => {
  const prisma = new PrismaClient();
  await prisma.user.upsert({
    where: { email: 'test.user@example.com' },
    update: {},
    create: { email: 'test.user@example.com', name: 'Test User', role: 'user' },
  });
  await prisma.$disconnect();
};
```

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup.ts',
  // DB credentials ONLY from env:
  // use: { baseURL: process.env.BASE_URL },
});
// .env: DATABASE_URL=postgresql://user:pass@localhost:5432/testdb
```

Rules for DB seeding:

- **idempotent** — `upsert` / `ON CONFLICT DO NOTHING`, never blind `INSERT` (re-runs must not fail or duplicate)
- seed only what the scenario needs (minimal dataset), with stable IDs/emails referenced from tests via env or constants
- cleanup strategy: dedicated test DB wiped per run (`globalTeardown` truncates), OR per-test cleanup in `afterEach` — pick one, document it
- never point tests at production DB; assert the env: `if (process.env.DATABASE_URL?.includes('prod')) throw new Error('refusing to run against prod')`
- seed data is **versioned with code** (`tests/fixtures/seed.sql` or migration-like seed script), not hand-edited in the DB

## API mocking with MSW (Mock Service Worker)

Use [MSW](https://mswjs.io) (`msw` package) to intercept requests in the **browser** (Service Worker based) or in **Node** (`@mswjs/interceptors` / `setupServer` from `msw/node`) for API tests:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Mocked User' });
  }),
  // fault injection for chaos tests — see chaos pipeline
  http.get('/api/orders', () => HttpResponse.error()), // network error
  http.get('/api/slow', async () => {
    await new Promise((r) => setTimeout(r, 3000));
    return HttpResponse.json({ ok: true });
  }),
];
```

```typescript
// browser (E2E/UI) — setup in beforeEach/beforeAll
import { setupWorker } from 'msw/browser';

const worker = setupWorker(...handlers);

test.beforeAll(async () => { await worker.start({ onUnhandledRequest: 'warn' }); });
test.afterEach(() => worker.resetHandlers());
test.afterAll(async () => { await worker.stop(); });
```

```typescript
// Node (API tests with playwright request) — setupServer
import { setupServer } from 'msw/node';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Rules for MSW:

- mock only the **external/unstable** dependencies — the app under test's own API should hit the real backend in E2E
- `onUnhandledRequest: 'warn'` (or `'error'` in strict suites) — a silent pass-through hides missing mocks
- per-test overrides: `worker.use(http.get('/api/users/:id', () => HttpResponse.json({ name: 'Override' })))` — reset in `afterEach`
- combine with `page.route` for non-MSW cases (binary files, WebSocket upgrade) — don't mix both on the same URL in one test
- MSW + `expect` — assert the UI reacted to the mocked payload, not that the mock was called

## Cleanup — always clean up
```typescript
test.afterEach(async ({ request }) => {
  // delete created resources
  await request.delete(`/api/users/${createdUserId}`);
});
```

## Test data checklist
- [ ] Data is unique per test (no collisions)
- [ ] No real PII in test data
- [ ] Tests clean up after themselves
- [ ] Seed data is versioned with the code
- [ ] Generated data covers edge cases (empty, max length, unicode)
