---
name: testing-event-driven-systems
description: 'Tests event-driven integrations: producers and consumers of message brokers (Kafka, SQS, RabbitMQ, EventBridge), event schema validation, ordering and deduplication, dead-letter handling, and eventual-consistency verification between services. Use when a feature communicates through events rather than HTTP, when a consumer must be tested independently of the producer, or when eventual consistency needs a deterministic check.'
argument-hint: 'Broker type and access for the test environment, the topics/queues and event schemas in scope, and the consumers under test'
user-invocable: true
---

# Testing Event-Driven Systems

Use this skill when the interaction under test is "an event was published" and "an event was consumed", not a request/response. The failure modes are different from HTTP: schema drift, poison messages, duplicates, ordering assumptions, and consumers that lag. Flakiness here usually means the test waits on wall-clock time instead of on state.

## When to Use

- a service publishes or consumes events on Kafka/SQS/RabbitMQ/EventBridge or similar
- a consumer needs testing without standing up the real producer
- event schema changes (added/removed/retyped field) need compatibility verification
- ordering, deduplication, or exactly-once-looking behaviour is in scope
- dead-letter / retry behaviour needs verification
- eventual consistency between services needs a deterministic assertion

## Operating Principles

- **Wait on state, not on sleeps.** Poll the observable outcome (row in DB, message in DLQ, HTTP call made) with a timeout; never `sleep(5000)` and hope.
- **Control the clock and the broker.** Use a test broker (container or embedded) or a test topic/queue per run; never shared production topics.
- **Produce known events.** Consumer tests publish their own fixtures with known payloads and IDs; teardown purges the test topic.
- **Schema is a contract.** Validate events against the schema registry or recorded schema before and after changes — see `testing-api-contracts` for the REST analogue.
- **Duplicates will happen.** Consumers must be idempotent; test that processing the same event twice has one effect.
- **Order is not guaranteed unless the broker guarantees it.** Test per-partition ordering only where the broker provides it; otherwise test order-independence.

## Workflow

### Phase 1: Map the event flow

- topics/queues, producers, consumers, and the event types on each
- per event type: schema (fields, types, required/optional), and the consumer's expected side effect
- identify DLQ/retry topology and the eventual-consistency pairs (which service's state should eventually match which event)

### Phase 2: Consumer tests with known events

Work through `./resources/event-test-checklist.md`:

- happy path: publish fixture event, assert the consumer's side effect (via `testing-database-state` or an HTTP stub)
- schema validation: event missing a required field, wrong type, extra field — consumer rejects or handles per design (extra fields must be ignored, not crash)
- poison message: permanently failing event lands in DLQ after the configured retries, with the original payload preserved
- duplicate delivery: same event twice — one side effect
- ordering: events that must be processed in order are; events that need not be, produce a correct final state regardless of arrival order
- consumer lag / eventual consistency: after publishing, poll the downstream state until it matches, within a timeout; record the observed convergence time

### Phase 3: Producer tests

- publishing a domain action emits the expected event on the expected topic with the expected payload shape
- schema compatibility: new producer version's events still validate against the old schema (backward compatible) — and consumers on the old schema still process them

### Phase 4: Schema evolution

- additive changes (new optional field) are safe; removing or retyping a field is breaking
- verify against recorded consumer expectations (see `contract-testing-graphql` for the GraphQL analogue of consumer-driven contracts)
- versioned topics or schema registry entries per breaking change

### Phase 5: Automate and report

Automate with the test broker in CI; each test uses its own topic/queue and known event IDs, and cleans up in teardown. Defects go to `reporting-bugs` with the event payload, topic, and observed behaviour.

## Resource Map

- `./resources/event-test-checklist.md` - the per-scenario check matrix: happy path, schema violations, poison/DLQ, duplicates, ordering, eventual consistency. Read during Phases 2–3.

## Related Skills

- `testing-database-state` - asserting the consumer's persisted side effect
- `testing-api-contracts` - schema validation and breaking-change detection patterns applied to event schemas
- `mocking-network-and-time` - controlling time and stubbing broker-adjacent services
- `testing-with-testcontainers` - standing up the broker (Kafka, RabbitMQ) per test run
- `stabilizing-flaky-tests` - when event tests fail intermittently on timing
- `testing-graphql-apis` - when events are GraphQL subscriptions

## Definition of Done

This skill is complete when:

- every consumer scenario (happy path, schema violation, poison message, duplicate, ordering, lag) ran against known fixture events with state-based assertions
- no test relies on fixed sleeps; all waits poll observable state with a timeout
- producer emits the expected event shape on the expected topic
- schema evolution was classified safe/breaking and breaking changes have a versioning plan
- tests use isolated topics/queues and clean up in teardown
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
