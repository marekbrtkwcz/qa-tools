---
name: test-estimation
description: 'Estimates testing effort and duration: decomposes the change or feature into test activities, estimates each from risk and complexity, adds environment and reporting overhead, and produces a range with stated assumptions. Use when planning a sprint or release and someone asks "how long will QA take", or when a scope change needs a re-estimate.'
argument-hint: 'The scope (feature, change, release), the test levels planned, and historical data from past similar work if available'
user-invocable: true
---

# Test Estimation

Use this skill when "how long will testing take" needs a defensible answer, not a gut number. A good estimate is a range with assumptions and a breakdown — not a single point that will be wrong.

## When to Use

- sprint/release planning asks for QA effort
- a scope change mid-cycle needs a re-estimate
- comparing options (automate vs manual, full regression vs risk-based)
- post-hoc: comparing estimate vs actual to improve the next one

## Operating Principles

- **Estimate activities, not "testing".** Design, environment setup, execution, defect handling, reporting, regression — each gets a number.
- **Anchor on risk and size, not only on feature count.** A login change costs more than a label change.
- **Give a range, not a point.** Low–high with the assumptions that move it.
- **Include the overhead people forget.** Environment issues, flaky re-runs, defect investigation, reporting.
- **Track actuals.** Every estimate vs actual pair improves the next estimate; keep them in `tracking-quality-trends`-style records.

## Workflow

### Phase 1: Decompose the scope

- break the change into testable units (flows, endpoints, screens)
- classify each by risk (from `designing-functional-tests` / `analyzing-regression-scope`) and complexity (integrations, data, permissions raise it)

### Phase 2: Estimate per activity

Work through `./resources/estimation-worksheet.md`:

- test design (cases/scenarios/checklists), per unit: low/medium/high complexity → hours
- environment and data setup
- execution (manual and automated), including re-runs for flakes
- defect handling: expected defect count from risk × history, each with triage+verify time
- regression scope decision and its cost
- reporting and sign-off

### Phase 3: Aggregate and state assumptions

- sum into a range; list assumptions (environment stable, no scope change, automation exists where assumed)
- state what is excluded (performance testing, security review) or estimate it separately

### Phase 4: Track and recalibrate

- record actual hours per activity after the work
- compare with the estimate; adjust the per-complexity anchors for next time

## Resource Map

- `./resources/estimation-worksheet.md` - the activity breakdown and per-complexity anchor table. Read during Phase 2.

## Related Skills

- `designing-functional-tests` - the scope decomposition input
- `analyzing-regression-scope` - how much regression the change needs
- `assessing-release-readiness` - the estimate feeds the go/no-go timeline
- `tracking-quality-trends` - storing estimate-vs-actual over time

## Definition of Done

This skill is complete when:

- the scope is decomposed into testable units with risk and complexity per unit
- each activity (design, setup, execution, defects, regression, reporting) has an estimated range
- the total is a range with explicit assumptions and exclusions
- actuals were recorded and compared, and the anchors adjusted
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
