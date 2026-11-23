# GraphQL query and mutation check matrix

Run per operation. Record: check, query/variables used, result (pass / fail), and the observed `data`/`errors`.

## Queries

| Check | How |
| --- | --- |
| Happy path | expected fields, types, values present and correct |
| Optional argument omitted vs provided | both variants behave per schema |
| Variable of wrong type | server rejects with a clear `errors` entry, no `data` crash |
| Missing required variable | rejected, error names the variable |
| Unknown/extra variable | rejected or ignored per spec — verify which and that it is consistent |
| Unknown field in selection | rejected (spec behaviour), not silently dropped |
| Deep nesting | returns correct data; note latency for the depth/complexity check |
| Aliased duplicate field | `a: field` and `b: field` both returned correctly |
| Fragment spread | fragments resolve, including nested fragments |
| Nullable field error | `data` present, field null, `errors[].path` points at the field |
| Non-null field error | error propagates: parent nullable field becomes null per spec |

## Mutations

| Check | How |
| --- | --- |
| Valid input | response correct; side effect verified by follow-up query |
| Missing required input field | rejected, error names the field, nothing persisted |
| Invalid enum / out-of-range / bad format | rejected per field |
| Extra unknown input field | rejected or ignored per server policy — record which |
| Multi-field partial failure | `errors` identifies the failing field; verify what committed |
| Idempotency | repeat the mutation; effect must not duplicate where required |
| Concurrent mutations | behaviour matches documented conflict semantics |

## Pagination (cursor-based)

| Check | How |
| --- | --- |
| pageInfo correctness | hasNextPage/hasPreviousPage, endCursor/startCursor |
| No gaps or duplicates | walk all pages, compare full id set with unpaginated query |
| Empty result set | first page: empty edges, hasNextPage false |
| Single item | one page, correct flags |
| page size > total | single page, all items |
| Unstable sort key | document behaviour if duplicates/gaps appear |

## Server policy

| Check | How |
| --- | --- |
| Depth/complexity limit | deeply nested or aliased-bomb query is rejected or throttled per stated policy |
| Introspection | enabled in dev/staging; disabled or auth-gated in production |
| Batching | if supported, a batch of mixed valid/invalid operations returns per-operation results |
