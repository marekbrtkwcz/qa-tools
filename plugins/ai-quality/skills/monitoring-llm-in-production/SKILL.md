---
name: monitoring-llm-in-production
description: 'Sets up and interprets production monitoring for LLM features: quality drift over time, guardrail trigger rate, fallback and refusal rate, latency/cost in production, user feedback signals, and alerting thresholds. Use when an LLM feature is live and its quality must be watched, when guardrails start firing (or never fire), or when a model provider silently changes behaviour.'
argument-hint: 'The live LLM feature, the observability stack in use, the baseline metrics from pre-launch evals, and the alerting channel'
user-invocable: true
---

# Monitoring LLM in Production

Use this skill when an LLM feature is live. Offline evals (`testing-llm-features`) prove the feature works at a point in time; monitoring proves it still works now. Providers change models, real users ask things the golden set never contained, and guardrails either fire constantly or never.

## When to Use

- an LLM feature is in production and needs quality/latency/cost dashboards
- guardrail trigger rate needs watching (too high = bad UX, zero = maybe not wired)
- a silent model/provider change is suspected (quality drop with no deploy)
- user feedback (thumbs down, regenerate, abandon) needs to feed quality signals

## Operating Principles

- **Monitor the same metrics as the eval suite.** If evals measure groundedness/format/refusal, production must sample the same; dashboards compare live vs pre-launch baseline.
- **Sample, don't log everything.** A sample of production requests goes through the eval checks; cost of monitoring stays bounded.
- **Alert on rates, not single events.** Guardrail trigger rate, refusal rate, p95 latency, cost per call — with thresholds and an owner.
- **Drift has two sources.** Model change (provider) and data change (users). Distinguish by segmenting metrics by prompt version and by input distribution.
- **Feedback loops close the system.** Thumbs-down → sampled review → golden-case addition (`testing-llm-features`).

## Workflow

### Phase 1: Instrument

- log per request: prompt version, model, tokens, cost, latency, guardrail verdicts, user feedback; sample full traces for eval re-runs
- dashboards: quality sample score, guardrail trigger rate, refusal/fallback rate, p95 latency, cost per call, per feature and per prompt version

### Phase 2: Set thresholds and alerts

Work through `./resources/production-monitoring-checklist.md`:

- quality score (sampled eval) vs pre-launch baseline → alert on sustained drop
- guardrail trigger rate: alert if ~0 (not wired) or spiking (attack or regression)
- p95 latency and cost per call vs budget (`testing-llm-cost-and-latency`)
- refusal/fallback rate trend

### Phase 3: Operate

- weekly review of dashboards; alert owner per metric
- on model/provider change: compare live metrics against baseline before/after
- feed sampled failures back into the eval suite as new golden cases

## Resource Map

- `./resources/production-monitoring-checklist.md` - the metric/threshold/alert matrix. Read during Phases 1–2.

## Related Skills

- `testing-llm-features` - the eval suite that defines what "quality" means offline
- `testing-llm-guardrails` - what the guardrail metrics measure
- `testing-llm-cost-and-latency` - the budget metrics monitored live
- `tracking-quality-trends` - limit/current/goal framing for these dashboards
- `evaluating-rag-retrieval` - retrieval quality metrics in production

## Definition of Done

This skill is complete when:

- per-request logging and sampled eval scoring are live, per feature and prompt version
- dashboards and alert thresholds exist for quality, guardrail rate, refusal rate, latency, cost — each with an owner
- baseline comparison detects provider-side drift
- sampled production failures feed back into the eval golden set
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
