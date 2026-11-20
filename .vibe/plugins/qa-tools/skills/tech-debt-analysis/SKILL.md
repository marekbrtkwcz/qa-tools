---
name: tech-debt-analysis
description: 'Analyzes technical debt in codebases, test suites, architecture, dependencies, and delivery workflows from observable signals, producing a prioritized register (severity, risk, effort, ROI) and a Fix Now / Fix Soon / Accept for Now roadmap. Use when auditing repository health, explaining slow delivery or flaky tests, planning refactoring, or deciding what to fix now versus defer. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🧾 Tech Debt Analysis

Evidence-driven analysis that surfaces the real drivers of delivery drag, quality risk, and maintenance cost — not intuition. Output: a structured register prioritized by severity, remediation risk, effort, and ROI, plus actionable next steps. **Test debt is first-class debt**: unreliable tests damage delivery as much as bad production code.

## 🎯 When to Use

- "audit this repository for technical debt"
- "why is delivery slowing down?" / "why are our tests slow, flaky, hard to maintain?"
- pre-migration / pre-upgrade assessment, refactor planning
- "what should we fix now versus consciously defer?"

## 🧭 Analysis Principles

Evidence before verdict · debt is a trade-off, not a moral failure (explain the cost) · root cause over symptom · risk-aware, not risk-averse · incremental remediation over heroic rewrites (reversible steps) · explicit uncertainty — missing context becomes a stated assumption, never a bluff.

## 🔄 Workflow

### Phase 0: Frame the analysis
Scope (repo / subsystem / module / test layer), audience, goal (awareness / prioritization / roadmap / release risk), constraints (legacy boundaries, compliance, "no refactor now"), pain signals (regressions, slow CI, flakes, upgrade blockers, onboarding friction). List assumptions for anything missing.

### Phase 1: Collect evidence
Never assign debt labels from instinct. Read first: README and architecture docs, package manifests and dependencies, build/test/lint scripts, CI workflows and gates, high-churn directories, TODO/FIXME/HACK markers and repeated workarounds. Capture: duplication/complexity/coupling signals, flaky/slow/weak tests, dependency age and blocked upgrades, fragile pipelines, missing ownership/docs. **No evidence = an unknown, not a debt item.** For test scope, also apply `unslop-tests`.

### Phase 2: Atomic debt items
Each item: category, location, symptom, observed evidence, probable root cause, risk of leaving it, risk of fixing it now, impact. No vague findings ("the code is messy").

### Phase 3: Score and prioritize
Per item: **Severity** (cost today), **Risk** (remediation risk), **Effort** (change size + coordination), **ROI**, **time horizon**. Buckets: **Fix Now** (active drag / high-risk exposure), **Fix Soon** (needs preparation), **Accept for Now** (deferred with a written rationale).

### Phase 4: Remediation design
For top items: minimal viable fix, staged refactor plan, or containment — each with the safety net required first, sequencing, rollback/escape hatch, and how improvement will be measured. Prefer reversible steps.

### Phase 5: Output
Repo/module audit → `TECHNICAL_DEBT_REPORT.md`; quick advisory → inline summary with top drivers, register highlights, priorities; test-debt focus → same structure with an explicit test-debt section and CI/test-confidence impact.

### Phase 6: Self-check
Every important item has concrete evidence · categories consistent · biggest risks on top · test/quality impact explicit · remediation incremental and believable · deferred debt documented, not forgotten.

## 💡 Heuristics — debt hides in
Repeated TODOs/retries/workarounds in one area · CI failing noisily with little diagnosis · abstractions that trade duplication for confusion · outdated dependencies blocking upgrades · small changes touching too many files · onboarding on tribal knowledge · tests that pass "often enough to be tolerated, not enough to be trusted".

## ✅ Definition of Done

- scope, audience, goal, and assumptions stated at the top
- every debt item has location, evidence, root cause, risk-of-leaving and risk-of-fixing
- no-evidence items listed as unknowns, not debt
- every item scored and bucketed; every Accept-for-Now has a written rationale
- top Fix Now items have a remediation path with the required safety net and measurement
- test debt explicit when in scope (or its absence stated)
- report saved as `TECHNICAL_DEBT_REPORT.md` or delivered inline per the template

## 🔗 Related Skills

- `qa-best-practices` — reviewing a specific change instead of mapping debt
- `unslop-tests` — test-by-test audit with each finding proven by execution
- `quality-gates` — skipped checks, disabled rules, waivers without owner/expiry
- `stabilizing-flaky-tests` — when the debt is flaky tests
- agent `qa-tools:tech-debt-auditor` — the report-only role agent for this workflow
