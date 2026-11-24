---
name: ensuring-test-isolation
description: 'Makes tests isolated and order-independent: removes shared mutable state (database rows, files, caches, queues, third-party state), gives every test or worker its own data scope with unique identifiers, guarantees cleanup in teardown even on failure, and proves isolation by running the suite shuffled and in parallel. Use when tests pass alone but fail in the suite, when CI goes green only on retry, or when parallel workers collide on the same data.'
argument-hint: 'The test suite and its shared resources (database, files, queues, external services), and how it runs in CI (single run, sharded, parallel workers)'
user-invocable: true
---

# Ensuring Test Isolation

Use this skill when "passes locally, fails in CI" or "passes alone, fails in the suite" is the symptom. A test that depends on what ran before it, on leftover data, or on a specific worker is a flaky test by construction. Isolation is not a cleanup chore at the end — it is a design property of every test.

## When to Use

- tests fail only when run together, or only in a different order
- parallel CI workers collide on the same rows, files, or accounts
- a retry makes CI green (the retry is hiding an isolation bug)
- teardown is missing or does not run on failure
- tests share fixtures that mutate (a shared "admin" user whose state changes)

## Operating Principles

- **Every test owns its data.** Unique identifiers per test/worker (uuid, worker id + counter); nothing shared that mutates.
- **Cleanup runs even on failure.** Teardown in `afterEach`/`afterAll` or transaction rollback — verified by counting rows before and after.
- **No test reads another test's leftovers.** If test B needs data, it creates it; it never assumes test A ran.
- **External state counts too.** Files, cache keys, queue messages, third-party sandbox state — scope or purge them per test.
- **Prove it, don't assume it.** Run the suite shuffled and with different worker counts; isolation holds or it doesn't.

## Workflow

### Phase 1: Find the shared state

- list every shared resource the suite touches: database tables, filesystem paths, caches, message queues, external services, time
- for each, ask: does any test mutate it? does any test depend on its prior contents?
- grep for hardcoded ids, emails, filenames that several tests use

### Phase 2: Scope and identify

Work through `./resources/isolation-checklist.md`:

- per-test unique prefixes/suffixes for rows, files, queue messages (e.g. `test-${workerId}-${testId}-...`)
- per-test fixtures built via `test-data-factories`, never shared mutable singletons
- database: transaction rollback per test, or schema/database per worker, or truncate-in-teardown verified by counts
- external services: sandbox accounts per run, webhooks/mock state reset in setup

### Phase 3: Guarantee teardown

- cleanup in `afterEach` (per-test data) and `afterAll` (suite resources), structured so a failure mid-test still cleans up
- verify: row/file/message counts for the test scope are zero after the suite, on pass and on fail

### Phase 4: Prove isolation

- run the suite with shuffled order (seeded random) several times — same result
- run with 1 worker and with N workers — same result
- run a single test alone — passes; run the whole suite — passes
- if a test fails only in combination, it has a hidden dependency — find it with bisection (disable half the suite)

### Phase 5: Keep it enforced

- CI runs shuffled order on a schedule (nightly) or per PR for the affected suite; `stabilizing-flaky-tests` owns any failure that surfaces
- new tests follow the pattern: create own data, clean up in teardown — enforced in review

## Resource Map

- `./resources/isolation-checklist.md` - the shared-state inventory, scoping, teardown, and proof checks. Read during Phases 1–4.

## Related Skills

- `stabilizing-flaky-tests` - diagnosing the intermittent failures isolation bugs cause
- `test-data-factories` - per-test data as code with real teardown
- `testing-database-state` - verifying cleanup by row counts
- `mocking-network-and-time` - resetting mocked external state between tests
- `automating-ci-test-pipelines` - sharding and worker configuration
- `testing-with-testcontainers` - ephemeral dependencies as an isolation strategy

## Definition of Done

This skill is complete when:

- every shared resource is inventoried and either scoped per test/worker or reset in setup/teardown
- teardown runs on failure and post-suite counts for the test scope are zero
- the suite passes shuffled, with 1 worker, and with N workers, repeatedly
- no test depends on another test's data or execution order
- CI enforces a shuffled or parallel run so regressions in isolation surface
