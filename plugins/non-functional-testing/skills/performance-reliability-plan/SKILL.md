---
name: performance-reliability-plan
description: Designs a risk-based performance and reliability test strategy for a system's critical flows (objectives, workload types, and concrete smoke, load, stress, soak, and spike scenarios) and drafts scripts in the project's existing tool, defaulting to k6. Use when a system has no performance testing yet, before a launch or traffic event, or when SLOs exist but nothing checks them. Writes plans and scripts; runs nothing beyond a confirmed smoke check.
argument-hint: "[system] [targetEnvironment]"
disable-model-invocation: true
---

# Performance and reliability test planner

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `system`: system or service to plan for, and where its code lives (default: this repository)
- `targetEnvironment`: environment the tests would run against (default: staging; never production without written approval)

# Task

Design a practical performance and reliability test plan for <system>, and draft the first scripts.

If the `testing-performance-and-load` skill is installed, load it before starting; it holds the workload-modelling, threshold, and analysis rules this command relies on.

## Inputs to collect

Ask concise questions for anything missing; infer the rest from the codebase and say what you inferred.

| Input | Notes |
| --- | --- |
| System context | `<system>`: type (web app, API, services), stack, deployment |
| Target environment | `<targetEnvironment>`: must be named before any run |
| Traffic and goals | Peak users or requests/s, background jobs, SLOs/SLIs (latency, error rate, availability) |
| Known pain points | Timeouts, spikes, 5xx, slow endpoints from production |
| Existing tooling | k6, JMeter, Locust, Gatling, Artillery; CI platform; monitoring stack |

## Steps

Say which phase you are in at each step.

1. **Discover.** Search the codebase for key services and modules, existing performance or integration tests, and infrastructure config (Docker, Kubernetes, cloud). List the critical flows (login, search, checkout, high-volume endpoints, batch jobs) and where latency or throughput matters most. Ask me to confirm the list before continuing.
2. **Set objectives.** Per critical flow, propose p95/p99 latency, throughput, and error-rate targets. Mark each as from an SLO or as a proposed starting point. Map flows to workload types:
   - **smoke**: low volume, quick, after each change
   - **load**: sustained expected peak
   - **stress**: ramp until degradation, to find limits
   - **soak**: long, steady load, to reveal leaks and slow degradation
   - **spike**: sudden burst and drop
   Pause for my feedback.
3. **Design scenarios.** Reuse the tool already in the repo; if there is none, recommend one (k6 for HTTP APIs and web backends) and say why. For each scenario give: flows and their traffic mix, think time, ramp shape, duration, data needs, and pass/fail thresholds.
4. **Draft scripts** in the existing performance folder, or `tests/perf/` if none exists. Read base URLs and credentials from environment variables, and include thresholds (e.g. a k6 `thresholds` block) so a run can fail.
5. **Check the smoke script** only if I confirm the target environment and that a low-volume run is acceptable there. Report what ran and its result. Do not run load, stress, soak, or spike scenarios; hand me the command instead.

## Output

Save the plan to `.qa/performance-plan.md`:

```markdown
# Performance and reliability plan: <system>
Environment: <env> · Sources: <SLOs, traffic data, or "proposed">

## Critical flows
## Objectives
| Flow | Workload | p95 | p99 | Throughput | Error rate | Source |
## Scenarios
| ID | Type | Flows and mix | Ramp / duration | Thresholds | Cost and runtime |
## How to run
## Open questions and risks
```

Then list the script files created, the exact command for each scenario, and a minimal starting set (usually smoke plus load).

## Guardrails

- Plan and run only against systems you are authorized to test.
- Never run load, stress, soak, or spike tests without my explicit confirmation of the environment, window, and who needs to be told. Never against production, or shared environments that third parties depend on, without written approval.
- Never send traffic to third-party services (payment providers, email, analytics) from a load script; stub or exclude them.
- Report percentiles, not averages, and state when an environment differs from production enough to make a number a shape rather than a capacity.
- Stop after the plan, the scripts, and an optional confirmed smoke run.
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
