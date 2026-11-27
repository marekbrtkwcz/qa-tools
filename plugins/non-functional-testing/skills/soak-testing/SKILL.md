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
