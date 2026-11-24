---
name: soak-testing
description: 'Runs soak tests: sustained load over hours or days to catch memory leaks, connection-pool exhaustion, log/disk growth, GC degradation, and slow drift in latency — failures that short load tests never see. Use when a service runs for weeks between restarts and "it slows down after a few days" is reported, or before a long-running launch.'
argument-hint: 'The service under test, the realistic load level, the soak duration, and the resources to watch (memory, connections, disk, threads)'
user-invocable: true
---

# Soak Testing

Use this skill when time is the missing ingredient. A 15-minute load test proves the system handles the load now; a soak test proves it still does after hours. `testing-performance-and-load` covers ramp/load/scenarios; this skill covers duration and resource drift.

## When to Use

- the service runs long between restarts (days/weeks) and must not degrade
- "it gets slower after a few hours/days" is reported
- before a launch where uptime over a long window matters
- after changes to caching, pools, queues, or logging

## Operating Principles

- **Duration is the test.** Hours to days at a realistic (not peak) load level; peak-load soak is a different, harsher exercise.
- **Watch resources, not just latency.** Memory, heap, connection pools, threads, file descriptors, disk/log growth, queue depth — plot over time; a flat line is a pass, a slope is a finding.
- **Latency drift matters even within SLO.** p95 creeping from 200ms to 800ms while staying "green" is a leak.
- **No restarts during the soak.** The point is to prove the process survives; a restart resets the evidence.
- **Automate and alert.** The soak runs unattended; alerts on resource thresholds and latency drift; results captured for the report.

## Workflow

### Phase 1: Define the soak

- load level: realistic sustained (e.g. average production load or a stated % of peak), steady — no ramp
- duration: minimum to cover the failure window (often 4–24h; memory leaks show in hours)
- metrics: latency percentiles over time, error rate, memory/heap, pool sizes, thread count, FD count, disk, queue depth

### Phase 2: Run and watch

Work through `./resources/soak-checklist.md`:

- baseline metrics in the first 30 min; then continuous collection
- alerts: memory slope, pool exhaustion, FD growth, disk growth, p95 drift beyond threshold, error rate
- no restart, no config change mid-soak; any intervention invalidates the run — record it and restart

### Phase 3: Analyze and report

- plot every metric over time; identify slopes and step changes
- latency: compare first hour vs last hour p50/p95/p99
- correlate: does latency drift follow memory/pool growth?
- findings → `reporting-bugs` with the metric plot attached; fixes verified by a repeat soak

## Resource Map

- `./resources/soak-checklist.md` - metric list, alert thresholds, and the analysis steps. Read during Phases 1–3.

## Related Skills

- `testing-performance-and-load` - ramp/peak/spike tests that complement soak
- `testing-llm-cost-and-latency` - long conversations as a soak-shaped cost drift
- `monitoring-llm-in-production` - production resource monitoring as continuous soak evidence
- `stabilizing-flaky-tests` - when soak failures are intermittent
- `automating-ci-test-pipelines` - scheduling soaks (nightly/weekend) with report artifacts

## Definition of Done

This skill is complete when:

- a steady-load soak ran for the defined duration with no intervention
- resource and latency metrics were collected and plotted over time
- first-hour vs last-hour comparison done; drift classified as pass/finding
- findings filed with metric evidence; fixes re-soaked
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
