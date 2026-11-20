---
name: test-data-management
description: Load this skill when designing test data strategies. Covers generating realistic test data, managing fixtures, handling PII/sensitive data in tests, database seeding, and cleanup strategies.
user-invocable: true
---

# Test Data Management

## 🧪 Strategies for test data

| Strategy | When to use | Example |
|---|---|---|
| **Hardcoded fixtures** | Small, stable datasets | login credentials, known products |
| **Generated data** | Large datasets, edge cases | `faker` library for names/emails |
| **Database seeding** | Integration/E2E tests needing DB state | seed script before test suite |
| **API-created data** | Tests that need fresh, unique data | create via API in `beforeEach` |
| **Snapshot/mock** | Unit tests, external APIs | MSW, recorded responses |

## 🎲 Generating realistic data with faker
```typescript
import { faker } from '@faker-js/faker';

const user = {
  email: faker.internet.email(),
  name: faker.person.fullName(),
  address: faker.location.streetAddress(),
};
```

## 🦄 Unique data per test run
Avoid collisions in shared environments:
```typescript
const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
```

## 🔒 PII and sensitive data
- **Never use real production data in tests**
- Use anonymized/synthetic data only
- Mask sensitive fields in test logs and screenshots
- GDPR: test data with personal info must be deletable

## 🌱 Database seeding
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

## 🎭 API mocking

Network/time mocking (MSW browser+node, `page.route`, fault injection, fake timers) moved to the dedicated **`mocking`** skill — load `/mocking` when you need it.

## 🧹 Cleanup — always clean up
```typescript
test.afterEach(async ({ request }) => {
  // delete created resources
  await request.delete(`/api/users/${createdUserId}`);
});
```

## ✅ Test data checklist
- [ ] Data is unique per test (no collisions)
- [ ] No real PII in test data
- [ ] Tests clean up after themselves
- [ ] Seed data is versioned with the code
- [ ] Generated data covers edge cases (empty, max length, unicode)
