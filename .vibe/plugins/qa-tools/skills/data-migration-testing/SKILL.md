---
name: data-migration-testing
description: Load this skill when verifying data migrations or ETL pipelines — completeness checks (counts, checksums, sums), field-level diff source vs target, referential integrity, idempotency, rollback validation, transformation correctness against business rules, schema drift, and performance of large migrations.
user-invocable: true
---

# Verifying Data Migrations & ETL

A migration is correct only if it is **proven**, not just "ran without error".

## 🧪 Types of checks (every migration needs them all, scaled to risk)

1. **Completeness** — `COUNT(*)` per table, sums/checksums of key columns, source vs target. `SELECT COUNT(*), SUM(amount), MD5(string_agg(id::text, ',' ORDER BY id)) FROM ...`
2. **Field-level diff** — join source and target on the key and compare columns; for large tables sample or use checksums per batch.
3. **Referential integrity** — no orphaned FKs after migration: `LEFT JOIN ... WHERE target.id IS NULL` must return 0 rows.
4. **Idempotency** — run the migration twice; results must be identical (same counts, same checksums).
5. **Transformation correctness** — check business rules on concrete examples: rounding, timezone conversion, enum mapping, null handling.
6. **Rollback** — the down-migration must restore the previous state (verify counts/content after rollback).
7. **Schema drift** — target schema matches expected: column types, nullability, indexes, constraints.
8. **Performance** — migration time and resource usage within budget for the real data volume.

## 📏 Rules

- Connection strings and credentials **only from env vars** — never hardcoded, never production without explicit approval.
- Assertions must be **concrete**: exact counts, checksums, equality of values — never "query executed" or `length > 0`.
- Use synthetic test data or a masked copy of production — never raw production data in tests.
- Always close DB connections (`afterEach`/`afterAll`); tests must be independent.
- Test naming: `should <result> when <condition>` (e.g. `should have identical checksums when migration is applied twice`).

## ✅❌ Good vs bad

✅ DOBRY:
```ts
test('should have same row count in orders after migration', async () => {
  const src = await countRows(process.env.SOURCE_DB_URL, 'orders');
  const tgt = await countRows(process.env.TARGET_DB_URL, 'orders');
  expect(tgt).toBe(src);
});
```

❌ ZŁY:
```ts
test('orders migrated', async () => {
  const rows = await query(process.env.TARGET_DB_URL, 'SELECT * FROM orders');
  expect(rows.length).toBeGreaterThan(0);
});
```
