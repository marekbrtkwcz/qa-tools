---
name: database-testing
description: Load this skill when testing database behavior directly — schema and constraints, transactions and rollback, concurrency, stored procedures/triggers, and verifying DB side effects after UI/API actions. Covers direct SQL/ORM access from Playwright tests, test isolation, and safe handling of test databases.
user-invocable: true
---

# Database Testing

Testing the database layer itself (not just data migrations — see `data-migration-testing`). A feature is not done until its **persistence** is verified: what the API/UI writes to the DB is exactly what was promised.

## Layers of DB tests

| Layer | What it covers | Tool |
|---|---|---|
| **Unit (repository/ORM)** | query logic, mapping, edge cases | vitest/jest + test DB or in-memory (SQLite) |
| **Integration** | schema, constraints, triggers, FK cascade | testcontainers / dedicated test DB |
| **E2E verification** | DB side effects after a UI/API action | Playwright + DB client in `afterEach`/assertion step |

## Direct DB access from Playwright tests

Connect **only in setup/teardown or a fixture — never open connections inside the test body**, and always close them:

```typescript
// tests/fixtures/db.ts
import { Pool } from 'pg';

export function createDbPool() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is required');
  if (url.includes('prod')) throw new Error('refusing to run against production DB');
  return new Pool({ connectionString: url });
}
```

```typescript
// global-setup.ts — per-run schema reset (preferred over per-test cleanup for speed)
import { createDbPool } from './tests/fixtures/db';

export default async () => {
  const db = createDbPool();
  await db.query('TRUNCATE TABLE orders, users RESTART IDENTITY CASCADE');
  await db.end();
};
```

Rules:

- credentials **only from env vars** (`TEST_DATABASE_URL`), never hardcoded
- assert the environment guard: refuse to run when the URL points at prod
- use a **dedicated test database** (or testcontainers), wiped per run in `globalSetup` / per test in `afterEach` — pick one strategy and document it
- prefer an ORM (`prisma`, `drizzle`, `typeorm`) when the app uses one — tests then match the real query layer

## Verifying DB side effects after UI/API actions

The strongest E2E assertion is on persisted state, not just the HTTP 200:

```typescript
test('should persist order in database when checkout is completed', async ({ page, request }) => {
  // Arrange: login + fill cart via UI
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();

  // Act: read the DB directly
  const db = createDbPool();
  try {
    const { rows } = await db.query(
      'SELECT id, status, total_amount FROM orders WHERE user_email = $1',
      ['test.user@example.com']
    );

    // Assert: exact persisted state
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('CONFIRMED');
    expect(Number(rows[0].total_amount)).toBe(199.99);
  } finally {
    await db.end();
  }
});
```

## What to test in the schema

- **Constraints**: `NOT NULL` rejection, `UNIQUE` violation (duplicate email → 409/23505), `CHECK` (negative price rejected), `DEFAULT` values applied
- **Foreign keys**: insert with missing parent fails; `ON DELETE CASCADE` removes children; `ON DELETE RESTRICT` blocks
- **Indexes**: exist on FK/lookup columns (query `pg_indexes` / `information_schema.statistics`); unique index enforces uniqueness at DB level, not only in app code
- **Column types & precision**: `NUMERIC(10,2)` rounding, `timestamptz` timezone storage, enum vs text
- **Triggers / stored procedures / views**: fire on the right events, return expected values, are idempotent where required

```typescript
test('should reject duplicate email at database level when user already exists', async () => {
  const db = createDbPool();
  try {
    await db.query('INSERT INTO users (email) VALUES ($1)', ['dup@example.com']);
    await expect(
      db.query('INSERT INTO users (email) VALUES ($1)', ['dup@example.com'])
    ).rejects.toMatchObject({ code: '23505' }); // unique_violation
  } finally {
    await db.end();
  }
});
```

## Transactions, rollback and isolation

- each test should run in a transaction that is **rolled back** at the end (fast, zero cleanup):

```typescript
test('should not leak data when test fails mid-transaction', async () => {
  const db = createDbPool();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query("INSERT INTO users (email) VALUES ('tx@example.com')");
    const { rows } = await client.query("SELECT COUNT(*) FROM users WHERE email = 'tx@example.com'");
    expect(Number(rows[0].count)).toBe(1);
    // no COMMIT — rollback in finally
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
```

- tests must be **independent** — no test may depend on data created by another test
- beware of implicit commits inside ORMs/stored procedures — verify rollback actually rolls back

## Concurrency

- parallel writes to the same row: last-write-wins vs optimistic locking (`version` column / `SELECT ... FOR UPDATE`)
- unique constraint under race: two concurrent inserts of the same email → exactly one succeeds
- deadlocks: assert the app handles `40P01` with retry, not a crash

```typescript
test('should allow exactly one winner when two concurrent signups use the same email', async () => {
  const db = createDbPool();
  try {
    const attempts = Array.from({ length: 2 }, () =>
      db.query('INSERT INTO users (email) VALUES ($1)', ['race@example.com'])
        .then(() => 'ok').catch((e) => e.code)
    );
    const results = await Promise.all(attempts);
    expect(results.filter((r) => r === 'ok')).toHaveLength(1);
    expect(results.filter((r) => r === '23505')).toHaveLength(1);
  } finally {
    await db.end();
  }
});
```

## Performance of queries (lightweight)

- `EXPLAIN ANALYZE` on hot queries — no sequential scan on large tables where an index is expected
- N+1 detection: count queries per request (ORM logging / `pg_stat_statements`) stays constant as the list grows

## Rules

- assertions must be **concrete**: exact row content, exact counts, exact error codes — never `rows.length > 0` or "query executed"
- naming: `should <result> when <condition>` (e.g. `should reject duplicate email when unique index exists`)
- no `waitForTimeout`-style sleeps on DB — use explicit polling with deadline (`expect.poll` / retry loop with timeout) for async DB effects (queues, triggers)
- cleanup in `afterEach`/`afterAll` and always close pools (`db.end()` in `finally`)
- never test against production; masked/synthetic data only (see `test-data-management`)

## Good vs bad

DOBRY:
```typescript
test('should cascade delete order items when order is deleted', async () => {
  const db = createDbPool();
  try {
    await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
    const { rows } = await db.query('SELECT COUNT(*) FROM order_items WHERE order_id = $1', [orderId]);
    expect(Number(rows[0].count)).toBe(0);
  } finally {
    await db.end();
  }
});
```

ZŁY:
```typescript
test('delete works', async () => {
  const db = createDbPool();
  const res = await db.query('DELETE FROM orders WHERE id = $1', [orderId]);
  expect(res.rowCount).toBeGreaterThan(0); // rowCount>0 says nothing about cascades/FKs
  // no db.end(), no check of child tables
});
```

## Checklist

- [ ] Dedicated test DB (or testcontainers), guarded against prod URLs
- [ ] Connections opened in fixtures/setup, closed in `finally`
- [ ] Schema, constraints, indexes, triggers verified explicitly
- [ ] DB side effects asserted after UI/API actions, not just HTTP status
- [ ] Isolation: rollback per test or full wipe per run
- [ ] Concurrency cases covered for unique/race-prone writes
- [ ] Concrete assertions: exact values, counts, error codes
