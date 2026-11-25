---
name: testing-database-state
description: 'Verifies the persisted state a feature leaves behind: checks rows, documents, constraints, indexes, and transaction outcomes directly in the database or document store after an API call, UI action, or background job, and designs database-level test data and cleanup. Use when the user-visible result looks correct but the stored state may be wrong, when the state lives in a document store (MongoDB, DynamoDB), when a migration or job needs verification, or when tests need deterministic database fixtures.'
argument-hint: 'Database connection details for the test environment, the feature or job under test, and the tables in scope'
user-invocable: true
---

# Testing Database State

Use this skill when "the API returned 200" is not the end of the story. Most integration defects live in what was actually written: missing row, wrong value, violated constraint silently swallowed, transaction that committed halfway. UI and API responses are claims; the database is the record.

## When to Use

- an API or UI action reports success but the persisted state needs proof
- a migration, backfill, or background job ran and its effect must be verified row by row
- a transaction boundary is in question (partial commit, rollback behaviour)
- tests need deterministic database fixtures and reliable cleanup between runs
- a constraint (unique, foreign key, check) fires or should have fired
- the state lives in a document store (MongoDB, DynamoDB): collections, embedded documents, TTL - recipes in `./resources/document-store-recipes.md`

## Operating Principles

- **Assert on the record, not the response.** Query the table after the action; compare full rows, not just counts.
- **Test environments only.** Never run verification queries that modify data against production; read-only checks only there, and only with approval.
- **Clean up what you create.** Every test inserts its own rows and deletes them (or uses a transaction that rolls back); shared databases make leftover rows other tests' flaky data.
- **Verify constraints, not just data.** A unique violation swallowed by the app is a defect the row check alone will miss.
- **Schemaless is not assertionless.** A document store has no FK to lean on, so shape bugs move into the documents themselves: assert whole documents (embedded fields and arrays included), not a field here and there. Full mapping of the checklist to stores is in `./resources/document-store-recipes.md`.
- **Check the invisible columns.** timestamps, soft-delete flags, version/optimistic-lock columns, and audit fields are where state bugs hide.

## Workflow

### Phase 1: Scope the tables and the expected state

- list the tables the feature touches, directly and via cascades/triggers
- for each action under test, write the expected row state: which columns, which values, which must be null
- note constraints and triggers that should fire

### Phase 2: Verify after each action

Work through `./resources/state-verification-checklist.md`:

- the row exists (or does not) with the expected values
- child/dependent rows were created, updated, or removed as expected (cascade behaviour)
- constraints behaved: duplicates rejected, foreign keys enforced, check constraints fired
- transaction outcome: on failure, nothing partial was committed
- soft-delete / archive behaviour: the row is flagged, not deleted, where that is the design

### Phase 3: Jobs and migrations

- after a background job: query the affected rows; verify processed flags, error records, and idempotency (rerun does not duplicate)
- after a migration: schema shape (columns, types, indexes, constraints) plus data shape (transformed values, defaults applied to existing rows)

### Phase 4: Fixtures and cleanup

- build fixtures as code (`test-data-factories`), seeded deterministically
- cleanup runs in teardown even when the test fails; verify by counting rows before and after the suite
- for shared environments, scope fixtures with unique identifiers that survive parallel workers

### Phase 5: Report

Defects found at the database layer go to `reporting-bugs` with the query, the expected row, and the actual row.

## Resource Map

- `./resources/state-verification-checklist.md` - per-action verification matrix: existence, values, cascades, constraints, transactions, soft-delete, jobs. Read during Phases 2–3.
- `./resources/document-store-recipes.md` - the same matrix mapped onto MongoDB and DynamoDB: connections, whole-document assertions, unique indexes and conditional puts, TTL behaviour, testcontainers wiring. Read when the store is a document store.

## Related Skills

- `test-data-factories` - building fixtures as code with deterministic seeds and real teardown
- `designing-test-data` - designing what data should exist (roles, boundaries, personas)
- `testing-graphql-apis` / `api-playwright-test-developer` - the API layer whose side effects this skill verifies
- `handling-sensitive-test-data` - keeping personal data out of fixtures and verification queries
- `testing-with-testcontainers` - when the database itself should be provisioned per test run

## Definition of Done

This skill is complete when:

- every action under test was followed by a direct database check of the expected row state
- cascade, constraint, and transaction outcomes were verified, not assumed
- job and migration effects were verified row by row and for schema shape
- fixtures are deterministic and teardown actually removes them (row counts match before/after)
- findings include the query, expected row, and actual row
