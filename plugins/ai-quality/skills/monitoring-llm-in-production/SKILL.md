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
