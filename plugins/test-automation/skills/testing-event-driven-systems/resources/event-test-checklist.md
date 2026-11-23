# Event-driven test checklist

Run per consumer and per event type. Record: scenario, event published, observed outcome, result. All waits poll state with a timeout — no fixed sleeps.

## Consumer scenarios

| Scenario | Event published | Assert |
| --- | --- | --- |
| Happy path | valid fixture event | side effect happened (DB row, HTTP call, emitted event) |
| Missing required field | event without a required field | rejected per design; lands in DLQ or is skipped with a log — not a crash loop |
| Wrong field type | e.g. string where int expected | rejected; original payload preserved |
| Extra unknown field | valid event + extra field | processed normally (forward compatibility) |
| Poison message | permanently failing event | after N retries lands in DLQ with payload intact; consumer continues with next messages |
| Duplicate delivery | same event (same ID) twice | exactly one side effect |
| Order-sensitive events | A then B on same key | processed in order where broker guarantees it (per partition/key) |
| Order-insensitive events | A and B in both orders | final state correct regardless of arrival order |
| Eventual consistency | event that triggers cross-service update | poll downstream state until it matches, within timeout; record convergence time |

## Producer scenarios

| Scenario | Assert |
| --- | --- |
| Domain action → event | expected event on expected topic with expected payload shape |
| Schema compatibility | new-version event validates against old schema; old consumer processes it |

## Test hygiene

| Check | How |
| --- | --- |
| Isolated topic/queue per run | unique suffix per test run; no shared topics |
| Teardown purges test topic | topic empty (or consumer group idle) after suite |
| No wall-clock waits | every wait is a state poll with timeout; timeout failure message says what state was missing |
