---
name: testing-observability
description: "Verifies the application's observability signals actually work: structured logs contain the fields operators need, metrics are emitted with sane cardinality, traces span the critical path, and alerts fire when they should. Use when an incident was invisible in dashboards, when logs lack request ids, when a new service ships without metrics, or when alert rules have never been tested."
argument-hint: "Service or app under test, its log/metrics/trace endpoints or files, and the alert rules in scope"
user-invocable: true
---

# Testing Observability

An incident you cannot see in logs, metrics or traces is an incident that lasts longer. This skill verifies the signals themselves - not the monitoring vendor, the signals your app emits.

## Operating Principles

- **Test signals, not dashboards.** A dashboard can be broken while the data is fine; query the raw log/metric/trace source.
- **Every request should be traceable end to end** via a correlation/request id present in logs and trace spans.
- **An alert that has never fired is an alert that may never fire.** Fire it on purpose in a test environment.
- **Cardinality is a bug.** A metric label that takes user ids or URLs as values will explode the TSDB; test the label set.
- **Personal data does not belong in logs** - `handling-sensitive-test-data` applies to log content too.

## Workflow

### 1. Logs

- Trigger each critical path (login, checkout, error path) and read the raw log output.
- Check: structured format (JSON), timestamp, level, service name, request id, user/tenant id (pseudonymised).
- Check error logs contain the exception message and stack, not just "something failed".
- Check no passwords, tokens or full personal data appear - grep the log output for the test account's email and known secret values.

### 2. Metrics

- List emitted metrics for the critical paths; check counters increment and gauges move as expected.
- Check label cardinality: high-cardinality labels (user id, email, URL path with ids) are a finding.
- Check the metrics endpoint itself is not exposed publicly without auth.

### 3. Traces

- Run one full user journey; verify a single trace spans UI -> API -> DB with the same trace id.
- Check slow spans are visible (the N+1 query or the 5s downstream call shows up as its own span).
- Check trace sampling does not drop 100% of errors (error traces must be sampled at 100%).

### 4. Alerts

- For each alert rule in scope: trigger the condition in a test environment (e.g. error rate over threshold for 5 min - use a short window in test), and confirm the alert fires and routes to the right channel.
- Verify the alert payload contains enough context to act (which service, which deploy, link to trace).
- Verify alert silence: a condition below threshold does NOT fire.

## Red Flags

- "we'll add logging later" - logs added after an incident are logs written from memory
- request id missing on some paths, so one incident is scattered across unrelated lines
- metrics with user-id labels
- alert rules with no test, no owner, or routing to a channel nobody reads
- traces that stop at the edge (only the gateway is traced, not the service)

## Related Skills

- `monitoring-llm-in-production` (ai-quality) - production monitoring specifically for LLM features
- `analyzing-quality-metrics` (quality-gates) - interpreting the metrics once they exist
- `handling-sensitive-test-data` (qa-core) - personal data must not leak into logs
- `testing-performance-and-load` (non-functional-testing) - load runs are the best trace/metric volume test

## Definition of Done

- each critical path produces structured logs with request id and no personal data
- metrics for critical paths verified, cardinality checked
- one end-to-end trace verified across UI/API/DB with error sampling at 100%
- every in-scope alert rule fired on purpose in test and routed correctly
- findings listed with the exact missing signal and where it should appear
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
