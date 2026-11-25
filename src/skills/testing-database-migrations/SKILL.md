---
name: testing-database-migrations
description: "Tests database migrations and schema changes: up/down correctness, rollback safety, data backfills, zero-downtime expand/contract (deploy migration before code, never destructive in the same release), and compatibility between old and new app versions during rolling deploys. Use when a PR touches a migration, when a backfill can be large/slow, or when a rollback plan must be proven. Complements testing-database-state (runtime DB behavior in tests)."
argument-hint: "The migration under test, the data volume it touches, and the deploy model (rolling / blue-green)"
user-invocable: true
---

# Testing Database Migrations

A migration is code that runs against production data — the highest-stakes code in the repo. The discipline: **every migration is tested up AND down, on realistic data volume, and is deploy-compatible with the previous app version** (expand/contract pattern).

## When to Use

- any PR that adds/alters a migration, index, constraint, or backfill
- "will this lock the table for 10 minutes on 50M rows?"
- rollback drills: prove `down` restores the previous schema and the old app still works
- rolling deploys: old and new app versions run simultaneously against the migrated schema

## What to test

1. **Up correctness.** Apply the migration to a copy of realistic data (schema + volume — see `handling-sensitive-test-data` for anonymizing prod copies). Assert: new schema shape, new columns/tables/indexes exist, constraints enforced (insert violating row → rejected), backfilled values correct on a sample, row counts preserved.
2. **Down correctness.** Run `down` after `up`; assert the previous schema is restored and a sample of data survives. A `down` that loses data is a failed migration.
3. **Duration and locking.** Measure migration time on realistic volume; assert it stays under the deploy budget. Check for table locks: long-running DDL on Postgres/MySQL can block writes — use concurrent-safe patterns (add column nullable → backfill in batches → add constraint; create index CONCURRENTLY).
4. **Backfill safety.** Batch backfills (no single giant UPDATE); assert batch size, progress tracking, and that the migration is resumable after interruption. Test with a deliberately killed run mid-backfill → rerun completes correctly (idempotent — see `testing-idempotency-and-retries`).
5. **Expand/contract (zero-downtime).** Destructive changes (drop column, rename, type change) must be split across releases: **expand** (add new column, dual-write) → deploy → **migrate data** → **contract** (drop old column) in a later release. Test that old app version works on the expanded schema AND new app version works before contract.
6. **Rolling-deploy compatibility.** With old+new app pods running simultaneously, assert both versions read/write the schema without errors during the deploy window.

## Test setup

- Migration tests run against a real database in CI (`testing-with-testcontainers` — Postgres/MySQL container), never sqlite-if-prod-is-postgres: dialect differences (locking, CONCURRENTLY, JSON types) are exactly what you are testing.
- Seed a realistic dataset: schema + volume + edge rows (nulls, orphans, max-length values). `test-data-factories` + anonymized prod snapshot.
- Run the full migration chain from scratch (fresh DB → all migrations) and assert it matches the schema of a long-lived DB (catches drift between migration history and models).

## Red Flags

- migration tested only on an empty dev DB — volume and existing-data edge cases are the whole risk
- `down` never run in tests — rollback is a plan until proven
- destructive change shipped in the same release as the code that stops using the column — rolling deploys break
- giant single-statement backfill on a big table — lock/timeout in prod
- no measurement of migration duration in CI — it regresses silently until deploy night
- fresh-DB migration chain not compared to the evolved schema — drift accumulates

## Related Skills

- `testing-with-testcontainers` - real DB containers in CI for migration tests
- `testing-database-state` - runtime DB behavior in tests (setup/teardown/transactions)
- `testing-idempotency-and-retries` - resumable/idempotent backfills
- `handling-sensitive-test-data` - anonymizing production data copies for migration tests
- `test-data-factories` - seeding realistic volume + edge rows
- `assessing-release-readiness` (quality-gates) - rollback readiness as a go/no-go criterion
- `scoping-change-relevance` (quality-gates) - a migration in the diff should trigger exactly these checks

## Definition of Done

- up and down are both tested on realistic data volume in a real-DB container
- backfill is batched, resumable, and measured under the deploy time budget
- destructive changes follow expand/contract across releases, with old/new app compatibility tested
- migration chain from scratch matches the evolved schema
- rollback is proven by running `down`, not by reading the code
