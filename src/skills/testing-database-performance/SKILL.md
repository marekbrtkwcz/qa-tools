---
name: testing-database-performance
description: 'Tests database performance: finds slow queries, N+1 patterns, missing indexes and lock contention using EXPLAIN/ANALYZE and query logs, verifies index usage, and regression-gates query latency after schema or query changes. Use when an endpoint got slower after a release, when reports time out, or when a migration adds an index and its cost must be checked.'
argument-hint: 'The database in a test environment with realistic data volume, the queries/endpoints in scope, and the latency budget per query'
user-invocable: true
---

# Testing Database Performance

Use this skill when the database is the bottleneck. `testing-database-state` verifies data correctness; this skill verifies speed. Slow queries usually mean a missing index, a scan where a seek was expected, N+1 from the ORM, or lock contention — all findable with EXPLAIN and logs before users feel it.

**Test with realistic data volume.** A query fast on 100 rows can be catastrophic on 10M; load a volume-shaped dataset (production-like, synthetic per `handling-sensitive-test-data`).

## When to Use

- an endpoint slowed down after a release and the API is innocent
- reports/exports time out at month-end data volumes
- a migration adds/changes indexes — verify benefit and write cost
- N+1 suspected (query count explodes with list size)

## Operating Principles

- **EXPLAIN ANALYZE before guessing.** Look at actual rows scanned vs estimated, join type, sort/temp usage — not just total time.
- **Indexes have a write cost.** An index that speeds reads slows writes; verify both, especially on hot tables.
- **N+1 scales with list size.** Query count should be constant regardless of items returned; log query count per request.
- **Locks and contention are concurrency bugs.** Long transactions and hot rows show up under concurrent load (`testing-performance-and-load` at the DB layer).
- **Regression-gate the hot queries.** A set of critical queries with latency budgets runs in CI against the volume-shaped dataset.

## Workflow

### Phase 1: Get the hot queries

- from slow-query log, APM traces, or the endpoints in scope; rank by total time (frequency × latency)

### Phase 2: Analyze each

Work through `./resources/db-perf-checklist.md`:

- EXPLAIN ANALYZE: rows scanned, join order, temp files, index used (or seq scan)
- missing index candidates; add and re-measure (read gain vs write cost on a write-heavy table)
- N+1: query count per request vs list size — must be flat
- lock waits and long transactions under concurrent load

### Phase 3: Verify at volume

- run the hot queries against the volume-shaped dataset; record p95 latency per query
- compare vs budget; after index/migration changes, re-run and compare

### Phase 4: Gate and report

- critical query set with budgets in CI; breach blocks the change
- findings → `reporting-bugs` with the EXPLAIN output and the fix tried

## Resource Map

- `./resources/db-perf-checklist.md` - the per-query analysis matrix and budget gate. Read during Phases 2–3.

## Related Skills

- `testing-database-state` - correctness of what queries write
- `testing-performance-and-load` - load at the API layer to expose contention
- `soak-testing` - long-running DB drift (pool exhaustion, autovacuum lag)
- `handling-sensitive-test-data` - volume-shaped synthetic dataset

## Definition of Done

This skill is complete when:

- hot queries identified from logs/traces and ranked
- each analyzed with EXPLAIN ANALYZE; missing indexes and N+1 confirmed and fixed with before/after numbers
- write cost of new indexes measured on hot tables
- critical query latency budgets run in CI against a volume-shaped dataset
