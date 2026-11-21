---
name: risk-based-testing
description: Load this skill when deciding what to test, how deeply, and in what order under time or budget pressure — prioritizing test effort by risk (probability × impact). Covers risk identification (brainstorming, defect history, requirement analysis), risk matrices and scoring, mapping risk levels to test depth, maintaining a risk register, residual risk, and communicating risk to stakeholders. Use with test-planning (how to test) and quality-gates (go/no-go); pairs with analyzing-quality-metrics for honest numbers.
user-invocable: true
---

# ⚖️ Risk-Based Testing

Risk-based testing means **spending test effort where failure would hurt most** — not testing everything equally. Risk = probability of failure × impact of failure. When time is short, high-risk areas get deep testing and low-risk areas get a smoke pass or none.

Use it when: release scope is bigger than test capacity, you must scope a regression, you prioritize a backlog of test ideas, or you defend a go/no-go decision with evidence.

## 🚫 When NOT to use

- Compliance/audit contexts requiring full scripted coverage of every requirement → risk-based scoping is a conscious acceptance of residual risk, document it explicitly
- Safety-critical systems where regulation mandates exhaustive testing
- When "no time to assess risk" — a 15-minute risk brainstorm beats gut-feel prioritization; do the fast version, not none

## 🔍 Step 1 — Identify risks

Gather input from multiple sources, not just the loudest voice:

- **Requirement analysis** — new, complex, or vague requirements are risky; stable, well-understood ones less so
- **Defect history** — areas with past bugs cluster (Pareto: few modules cause most defects)
- **Change analysis** — recently changed code, new dependencies, migrations
- **Stakeholder brainstorm** — devs, PO, support, ops each see different failure modes ("what keeps you awake at night?")
- **Architecture** — integrations, shared state, third-party services, data pipelines

## 📊 Step 2 — Score each risk

Score probability and impact on a 1–5 scale (or Low/Med/High), then multiply:

| Risk score | Level | Test depth | Example action |
|---|---|---|---|
| 20–25 | Critical | exhaustive: all paths, edges, negative, performance, security | full manual + automated suite + exploratory session |
| 12–19 | High | deep: main paths + key negatives + edges | automated suite + targeted exploratory |
| 6–11 | Medium | moderate: happy paths + common negatives | automated smoke + scripted edge cases |
| 3–5 | Low | light: smoke only | automated smoke test |
| 1–2 | Minimal | none or existing regression only | rely on existing suite + monitoring |

Impact anchors: 5 = data loss / security breach / legal exposure / revenue stop; 1 = cosmetic. Probability anchors: 5 = fails in normal use; 1 = requires exotic conditions.

## 🧭 Step 3 — Map risks to test effort

1. List risks with scores in a **risk register** (id, description, area, probability, impact, score, owner, mitigation)
2. Map each risk to concrete test activities and assign depth per the table
3. Feed the result into `test-planning` — the plan's coverage matrix should show risk IDs, not just requirement IDs (`requirements-traceability`)
4. Re-score after each test round: passing tests reduce probability, found bugs raise impact awareness

## 📉 Residual risk & go/no-go

- **Residual risk** = risk remaining after testing. Every accepted residual risk needs: what could still fail, why it's acceptable, who accepted it, and what monitoring detects it in production (`observability-testing`)
- Use `quality-gates` for the formal go/no-go: no Critical/High risk may ship with only smoke coverage unless waived with owner + expiry
- Communicate in countable units: "3 High risks untested, here is the first step for each" — never "quality looks fine"

## 🔄 Keep it alive

- Update the register when scope changes, not just at planning time
- After release, compare predicted risks vs actual incidents — calibration improves the next cycle (`tracking-quality-trends`)
- A risk register nobody updates is theater; if it isn't maintained, drop it and say so honestly
