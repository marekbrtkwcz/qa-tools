---
name: testing-llm-cost-and-latency
description: 'Tests the cost and latency budget of LLM features: token usage per request (prompt, completion, total), cost per feature call against a budget, p50/p95/p99 latency, and context-window growth over conversations. Use when an LLM feature gets slower or more expensive after a prompt/model change, when a feature must stay under a cost cap, or when context growth makes long sessions degrade.'
argument-hint: 'The LLM feature and its prompt templates, the model and pricing, the latency/cost budget, and a representative request set'
user-invocable: true
---

# Testing LLM Cost and Latency

Use this skill when an LLM feature has a budget: "this feature must cost under X per call and answer within Y seconds". Prompt and model changes silently move both numbers. Measure them like any other non-functional requirement (`testing-performance-and-load` for the load-testing counterpart).

## When to Use

- a prompt, model, or retrieval change is about to ship and cost/latency must not regress
- a feature has a stated cost or latency budget (SLO)
- long conversations get slower and more expensive as context grows
- comparing models or prompt variants on cost/latency, not just quality

## Operating Principles

- **Measure per request, not per suite.** Token counts (prompt/completion/total) and latency per call, logged per test case; aggregate p50/p95/p99.
- **Budgets are per feature, stated up front.** Cost per call cap, latency p95 cap, max context tokens.
- **Watch context growth.** In multi-turn use, prompt tokens grow every turn; measure cost/latency at turn 1 vs turn N (`testing-multi-turn-conversations`).
- **Compare against a baseline, not a vacuum.** Same request set, baseline vs current — a regression gate needs both numbers.
- **Quality and cost trade off explicitly.** A cheaper model that fails evals (`testing-llm-features`) is not a win; record both.

## Workflow

### Phase 1: Define the budget and the request set

- per feature: cost cap per call, latency p95 cap, max prompt tokens; representative request set (from `testing-llm-features` golden cases or production logs, sanitized)

### Phase 2: Measure

Work through `./resources/cost-latency-checklist.md`:

- per request: prompt tokens, completion tokens, total, cost (model pricing), latency
- aggregates: p50/p95/p99 latency, mean/total cost; per prompt template and per model
- context growth: same conversation at turn 1/5/10/20 — prompt tokens and latency per turn

### Phase 3: Gate changes

- on prompt/model/retrieval change: run the request set, compare vs baseline; breach of budget blocks or needs a recorded waiver (`governing-quality-waivers`)
- CI: a smoke subset of requests with hard budget assertions; full set nightly

### Phase 4: Report

- baseline vs current table per feature; top cost drivers (longest prompts, biggest completions); trend over time (`tracking-quality-trends`)

## Resource Map

- `./resources/cost-latency-checklist.md` - what to measure per request and the aggregation/gate rules. Read during Phases 2–3.

## Related Skills

- `testing-llm-features` - quality evals that must pass alongside the budget
- `testing-multi-turn-conversations` - conversation-length effects on cost/latency
- `testing-performance-and-load` - load testing of the LLM-backed endpoint
- `monitoring-llm-in-production` - the same metrics observed in production
- `governing-quality-waivers` - budget exceptions with expiry

## Definition of Done

This skill is complete when:

- per-feature cost and latency budgets are stated
- a representative request set is measured per request (tokens, cost, latency) with p50/p95/p99
- context-growth effect measured across conversation turns
- prompt/model/retrieval changes are gated against baseline in CI
- trends reported and budget breaches waived or fixed
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
