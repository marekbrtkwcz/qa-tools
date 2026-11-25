# Document store recipes (MongoDB, DynamoDB)

The same discipline as SQL state verification - assert the record, verify constraint behaviour, clean up what you created - mapped to collections and items. Every row of `state-verification-checklist.md` has an equivalent here; the differences that surprise people are marked.

## MongoDB

### Connect and read

```bash
mongosh "$MONGO_URI" --quiet --eval 'JSON.stringify(db.orders.findOne({orderId: "ord-42"}))'
```

- `JSON.stringify` in `--eval` gives you diffable output - assert the whole document, not a hand-picked field.
- From test code, use the driver (`mongodb` for Node, `pymongo` for Python) - `mongosh` is for humans and CI one-liners.

### Checklist mappings

| SQL checklist row | MongoDB equivalent | What actually surprises |
| --- | --- | --- |
| Row created with expected values | `findOne` full document | embedded docs and arrays are part of the row - compare wholesale |
| Foreign-key enforced | `conn.dropDatabase()` level: reference is a field holding an `_id` - no engine check | dangling references are YOUR test to catch: query the referenced doc exists |
| Unique constraint | unique index (`getIndexes()` shows it); duplicate insert fails E11000 | without a unique index, duplicates silently coexist - verify the INDEX exists, not just today's data |
| Check constraint | `$jsonSchema` validator | collections created without a validator accept anything - malformed documents are a finding, may be by design |
| Update untouched columns | `$set` touches named fields only | document compare before/after catches accidental field loss |
| Transaction rollback | multi-document ACID needs `startTransaction` on a session | without an explicit session, each write commits alone - partial writes are legal |
| Upsert semantics | `updateOne(..., { upsert: true })` | verify which branch fired: document created vs updated (compare `_id` + updatedAt) |

- **TTL index**: `getIndexes()` shows `expireAfterSeconds`. The TTL monitor sweeps roughly every minute, so deletion is not instant - assert the indexed expiry FIELD value in-suite; if disappearance itself matters, wait for a sweep window and say so, never a blind fixed sleep.
- **Explain before blaming the query**: `db.orders.find({sku: "X"}).explain("executionStats")` - a collection scan on a big collection is a state-verification latency finding of its own.

### Testcontainers wiring

```ts
import { GenericContainer } from 'testcontainers';

const container = await new GenericContainer('mongo:7.0')
  .withExposedPorts(27017)
  .start();
const uri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}`;
// fixture schema + data: .withCopyContentToContainer(file, '/docker-entrypoint-initdb.d/init.js')
```

- One container per suite, not per test (startup is seconds) - isolate with a database name per suite (`db.orders` in `qa-suite-17`), then `dropDatabase()` in teardown.
- Fixtures as code (`test-data-factories`), deterministic `_id` per test, delete by that `_id` in teardown; verify with `countDocuments()` before/after like the SQL rules.

## DynamoDB

### Local-first development

```bash
docker run -d -p 8000:8000 amazon/dynamodb-local   # local table API
# LocalStack instead when the test needs broader AWS parity (e.g. S3 event wiring):
docker run -d -p 4566:4566 -e SERVICES=dynamodb localstack/localstack
```

- Endpoint `http://localhost:8000` with dummy region/credentials in env; the AWS SDK client points at the endpointOverride and stops there.
- The same container works under testcontainers (`GenericContainer('amazon/dynamodb-local')`), mapped port + endpoint override in the client config.

### Checklist mappings

| SQL checklist row | DynamoDB equivalent | What actually surprises |
| --- | --- | --- |
| Row created with expected values | `GetItem` - include the whole Item | unverifiable-by-scan: items without the key pattern are invisible to `Query` - find by all access patterns |
| Unique constraint | `PutItem` with ConditionExpression `attribute_not_exists(pk)` | ConditionalCheckFailedException is idempotent-create - a duplicate put returns 400, not 200-with-second-copy |
| Optimistic locking | version attribute in `UpdateItem` condition | expected version mismatch = concurrent-write bug caught |
| Partial commit impossible | `TransactWriteItems` (or the record is single-Item) | without a transaction, multi-item writes fail independently and half-apply |
| Pagination / bulk retrieval | `Query` with `LastEvaluatedKey` | 1MB page cap: a "get all for user" test breaks silently at volume - assert on paged getters |
| Secondary access path | Query on the GSI (or LSI index) | verify the GSI exists (`DescribeTable`) AND carries the item - the base table never rejects |
| Read-your-own-write | Set ConsistentRead on Get/Query | eventual consistency in tests = flaky assertions; eventual-only flows are a finding when the read must be fresh |

- **TTL**: `UpdateTimeToLive` sets the attribute; `DescribeTimeToLive` must say `ENABLED` with the attribute name and the Item must carry the epoch-second value. DynamoDB can take up to ~48 hours to actually delete expired items - **the disappearance is not verifiable inside a test run**; assert attribute + policy status and mark deletion as untestable in-suite, honestly.
- **Counts are not shape**: `ItemCount` in `DescribeTable` is metadata, stale for tables until maintenance - never used as a test oracle; a `Scan` with a filter (NOT on hot paths) when a real count matters.
- Key discipline: partition key spreads load; a test table keyed by a low-cardinality attribute will throttle under batch fixtures - key the fixtures the way production keys the table.

### Fixture and cleanup pattern

- `CreateTable` per suite with `PAY_PER_REQUEST` billing; `DeleteTable` in teardown - simpler and faster than per-item deletes.
- Deterministic keys with a run prefix (`test-run-<ts>-sku-1`): parallel CI shards never collide, cleanup can `Scan` + batch-delete with the prefix when the table must persist.

## Tooling routes

- `testing-with-testcontainers` - container wiring patterns for both stores
- `test-data-factories` - fixture documents/items as code with deterministic seeds
- `handling-sensitive-test-data` - documents with personal data get the same PII rules as rows
