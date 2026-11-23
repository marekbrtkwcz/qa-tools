# Database state verification checklist

Run after each action under test. Record: check, query used, expected, actual, result.

## Row existence and values

| Check | How |
| --- | --- |
| Row created with expected values | `SELECT * FROM t WHERE id = ...` — compare all columns, not a subset |
| No row created on failure paths | count query returns 0 |
| Updated row | verify new values and that untouched columns kept their old values |
| Deleted row | hard delete: row gone; verify no orphaned children |

## Relationships and cascades

| Check | How |
| --- | --- |
| Child rows created/updated/removed with parent | query child table by foreign key |
| Cascade delete actually cascaded (or was restricted, per design) | attempt parent delete, check children |
| Foreign key enforced | insert with dangling FK — must fail |
| Unique constraint enforced | insert duplicate — must fail, and the app must surface the error, not swallow it |
| Check constraint enforced | value violating CHECK — must fail |

## Transactions

| Check | How |
| --- | --- |
| Partial commit impossible | force a failure mid-transaction; verify no partial rows |
| Rollback on error | error path leaves table unchanged (count before/after) |

## Invisible columns

| Check | How |
| --- | --- |
| Timestamps set correctly | created_at/updated_at present and sane |
| Soft-delete flag | deleted rows flagged, not removed, where designed so |
| Version / optimistic lock | version incremented on update; stale version rejected |

## Jobs and migrations

| Check | How |
| --- | --- |
| Job processed rows | processed flag set, result stored, error rows written on failure |
| Job idempotency | run twice — no duplicated effects |
| Migration schema | columns, types, nullability, indexes, constraints match the migration file |
| Migration data | existing rows transformed correctly; defaults backfilled |

## Fixture hygiene

| Check | How |
| --- | --- |
| Teardown removes fixtures | row count for fixture scope identical before and after the suite |
| Parallel-safe identifiers | fixture IDs unique per worker (no collisions in shared DB) |
