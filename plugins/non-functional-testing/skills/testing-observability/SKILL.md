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
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
