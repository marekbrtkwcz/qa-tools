---
name: code-review-advanced
description: 'Thorough, evidence-driven review of PRs, legacy modules, and quality-critical changes across seven lenses (correctness, maintainability, architecture, security/privacy, performance, testing, operability), returning severity-ranked findings (Blocker/High/Medium/Low/Note) with file:line evidence and an approve/comment/request-changes recommendation. Use for large or high-risk changes (auth, payments, persistence, CI, shared fixtures, hot paths). For test-code-only audits use unslop-tests. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🔬 Advanced Code Review

For reviews that must go beyond style feedback and surface real engineering risk: complex PRs, sensitive code paths, test automation suites, refactors where a shallow review misses trade-offs.

## 🎯 When to Use

- "review this PR critically", "audit for maintainability or security", "architectural issues, not just syntax"
- large multi-file PRs, legacy audits, high-risk areas (auth, payments, permissions, data flows, CI)
- changes that add tests but may still reduce confidence

## 🧭 Review Principles

Evidence over intuition (every finding above Note points to a `file:line`, observed behavior, or named missing test) · risk over volume · context before judgment · severity must mean something · actionable feedback only · acknowledge uncertainty explicitly.

## 🔄 Workflow

### Phase 0: Frame the review
Scope (repo / changed files / subsystem), goal (correctness / readiness / architecture / security / test quality / debt), change type (feature / fix / refactor / migration / test-only / infra), constraints (release pressure, backward compat, compliance). Infer cautiously and list assumptions when not given.

### Phase 1: Understand context first
Read the code around the change: surrounding modules and patterns, existing tests and how they express behavior, docs/ticket intent, architectural direction. For a diff, write down: what behavior changed, what stayed implicit, what could regress undetected. Phase 2 checks the diff against these three.

### Phase 2: Seven lenses

Every dimension gets a finding or a "checked, clean" line; every changed file is read in full or listed as sampled:

1. **Correctness** — logic, edge cases, state transitions, error handling
2. **Maintainability** — readability, cohesion, duplication, coupling, naming
3. **Architecture** — boundary violations, abstraction quality, hidden dependencies, future change cost
4. **Security & privacy** — trust boundaries, secrets, authorization, unsafe defaults, logging risks
5. **Performance & scalability** — hot paths, unnecessary work, batching, blocking calls
6. **Testing** — missing coverage, weak assertions, realism, determinism, regression-detection strength (for test code also apply `unslop-tests`)
7. **Operability** — observability, diagnostics, fallback behavior, failure recovery

### Phase 3: Findings structure

Every finding above Note: **severity** (Blocker = likely wrong/unsafe/merge-blocking; High = significant regression/security/data/reliability risk; Medium = important, fix soon; Low = valid, not urgent; Note = observation), **area**, **summary**, **evidence** (`file:line` / behavior / omission), **risk** (why it matters), **recommended direction** (smallest safe improvement).

### Phase 4: The report

1. Short executive summary
2. Highest-risk findings first
3. Strengths worth preserving
4. Missing tests, docs, operational safeguards
5. Recommendation: `approve` / `comment` / `request changes`

### Phase 5: Self-check
Every important finding has evidence · categories consistent · biggest risks on top · test impact explicit · uncertainty stated, not hidden · report saved or delivered per the house format.

## 🚩 Red Flags

- A Blocker/High with no `file:line` or observed behavior
- Severity labels without stated impact
- "Looks good" over a diff only skimmed
- Test-only changes reviewed without the test-quality lens
- Production behavior changed in a "test cleanup" PR
- Recommendations with no smallest-safe step

## ✅ Definition of Done

- scope, goal, change type, and assumptions stated at the top
- all seven lenses covered with a finding or a clean line per dimension
- every changed file read in full or listed as sampled
- findings severity-ranked with evidence, risk, and a recommended direction
- explicit approve / comment / request-changes recommendation
- strengths and missing safeguards listed alongside findings

## 🔗 Related Skills

- `qa-best-practices` — fast sanity check of a small low-risk diff
- `unslop-tests` — test-code-only audit proving findings by execution
- `tech-debt-analysis` — mapping broader debt instead of reviewing one change
- `security-testing` — when the change touches trust boundaries
- `unslop-answers` — the review report itself must keep its evidence rungs
