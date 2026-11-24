# Test isolation checklist

Record: resource, shared state found, fix applied, proof run, result.

## Inventory of shared state

| Resource | Mutated by tests? | Depends on prior contents? | Fix |
| --- | --- | --- | --- |
| Database tables | | | per-test rows with unique ids, rollback, or per-worker schema |
| Files / uploads dir | | | per-test prefix; purge in afterEach |
| Cache | | | flush or key-prefix per test |
| Queues / topics | | | purge or per-test topic suffix |
| External service sandbox | | | reset mock state in beforeEach |
| Shared fixtures / accounts | | | replace with per-test factories |
| Time / clock | | | fixed clock reset per test |

## Teardown guarantees

| Check | How |
| --- | --- |
| Cleanup on failure | afterEach/afterAll structure; forced-fail run leaves zero rows/files |
| Post-suite counts | count test-scoped rows/files/messages = 0 after suite |
| No cross-test reads | each test creates its own data |

## Proof runs

| Run | Expected |
| --- | --- |
| Shuffled order (multiple seeds) | identical pass set |
| 1 worker vs N workers | identical pass set |
| Single test alone vs in suite | passes both |
| Full suite twice in a row | no leftover-state failures |
