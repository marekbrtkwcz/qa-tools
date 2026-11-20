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
