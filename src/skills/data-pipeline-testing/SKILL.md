---
name: data-pipeline-testing
description: "Tests data pipelines and data quality, not just the app: schema drift, freshness/volume SLAs, idempotent re-runs, transformation correctness on boundary records, and downstream contract compatibility. Use when an ETL/warehouse/stream job feeds dashboards or ML, when schema changes break consumers silently, or when 'the report numbers look off' needs a systematic check. For database state in app tests see testing-database-state."
argument-hint: "The pipeline or job under test, its source and target schemas, freshness/volume expectations, and a sample of production-shaped data"
user-invocable: true
---

# Data Pipeline Testing

Dashboards and ML models are only as good as the data flowing into them. This skill tests the pipeline itself: schema, freshness, volume, transformations, and idempotency.

## Operating Principles

- **Schema drift is a breaking change even when nothing in the app changed.** A column rename upstream breaks consumers downstream silently.
- **Test with production-shaped data, not clean fixtures.** Nulls, duplicates, late-arriving records, and timezone edge cases are where pipelines die.
- **Re-running a job must not double the data.** Idempotency is the default expectation; verify it, don't assume it.
- **Freshness and volume are SLAs with numbers.** "The report is updated overnight" is not a test; "max lag 30 min, row count within 5% of source" is.
- **Personal data in pipelines follows `handling-sensitive-test-data`** - masks, synthetic sets, no raw production extracts in test envs.

## Workflow

1. **Map the flow:** source -> transforms -> target, with schemas at each stage and the consumers of the target.
2. **Schema contract:** compare source/target schemas against the expected contract (schema registry, dbt tests, or Great Expectations-style expectations). Any drift = finding with the breaking field named.
3. **Transformation correctness:** boundary records through the transform - nulls, empty strings, max-length, negative numbers, duplicates, late events, out-of-order events. Assert exact expected output, not just "no crash".
4. **Freshness/volume:** run the job on a known input; assert completion time, row counts in vs out, and lag vs the SLA.
5. **Idempotency:** run the same batch twice; assert the target state is identical (no duplicates, no double-counted aggregates).
6. **Downstream compatibility:** run the consumer's contract/schema tests against the new output before deploying the pipeline change.

## Red Flags

- pipeline tested only with a hand-made happy-path CSV
- schema changes deployed without checking consumers
- "it worked yesterday" as the freshness check - no SLA number anywhere
- re-runs that append instead of upsert, discovered only after finance noticed double revenue
- raw production data copied into a test bucket "just for debugging"

## Related Skills

- `testing-database-state` (qa-core) - DB state setup/assertions inside app tests
- `testing-api-contracts` (api-testing) - the same contract discipline for pipeline outputs consumed via API
- `designing-test-data` (qa-core) - boundary-heavy data packs for pipeline inputs
- `handling-sensitive-test-data` (qa-core) - masking and synthetic data in pipelines
- `testing-observability` (non-functional-testing) - pipeline jobs must emit logs/metrics like any service

## Definition of Done

- schema contract checked at each stage, drift findings named field-by-field
- transformation correctness proven on boundary records with exact expected outputs
- freshness and volume asserted against stated SLA numbers
- idempotent re-run verified
- no personal data in test inputs without masking
