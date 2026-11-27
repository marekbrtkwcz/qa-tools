---
name: designing-smoke-and-sanity-suites
description: 'Designs smoke and sanity test suites: the small set of critical checks that decide whether a build is worth testing further (smoke) or whether a specific change works at all (sanity), with entry/exit criteria, time budget, and ownership. Use when every build needs a fast go/no-go, when a hotfix needs a targeted check, or when the release team asks "is this build testable".'
argument-hint: 'The application or feature area, the build/deploy pipeline stage where the suite runs, and the time budget (e.g. 15 minutes)'
user-invocable: true
---

# Designing Smoke and Sanity Suites

Use this skill when a fast, small suite must answer a yes/no question about a build. **Smoke** asks "is the build testable at all" (broad, shallow, every build). **Sanity** asks "does this specific change work" (narrow, deep on one area, after a fix). Mixing the two produces a suite that is too slow to be smoke and too shallow to be sanity.

## When to Use

- every build/CI run needs a fast pass/fail before deeper testing
- a hotfix or small change needs a targeted verification set
- the team argues about what belongs in the "quick check"
- smoke takes longer than the budget and nobody knows what to cut

## Operating Principles

- **Smoke is broad and shallow; sanity is narrow and deep.** Never merge them into one list.
- **Smoke must fit the budget.** If it runs over, it gets skipped — design to the time box, cut by risk.
- **Every smoke case maps to a critical user path.** Login, core flow, payment/checkout, data save — if it breaks, nothing else matters.
- **Entry/exit criteria are explicit.** Smoke entry: build deployed, environment up. Exit: all cases pass, or a blocking defect is filed and deeper testing stops.
- **Sanity targets the change, not the whole app.** After a fix to search, sanity covers search and what it touches.

## Workflow

### Phase 1: Define the two suites separately

- smoke: critical paths across the whole app, one to a few cases each, automated where possible, manual for what cannot be automated
- sanity: per change area, the cases that prove the change works and did not break adjacent behaviour
- record time budget for each and who runs it (CI for smoke, developer+QA for sanity)

### Phase 2: Build the smoke list

Work through `./resources/smoke-sanity-checklist.md`:

- app starts, health endpoint responds, environment config is correct
- login/logout works for a standard role
- each critical flow completes end to end (create, read, update, delete on the main entity)
- integration points respond (payment, email, external API) — happy path only
- no blocking errors in logs/console during the run

### Phase 3: Build sanity per change

- the changed behaviour itself, plus its immediate neighbours
- one regression case per known past defect in the area

### Phase 4: Wire and maintain

- smoke runs on every build in CI (`automating-ci-test-pipelines`), result is a required gate
- review the smoke list quarterly: remove what never caught anything, add new critical paths
- sanity lists live next to the feature docs (`documenting-test-suites`)

## Resource Map

- `./resources/smoke-sanity-checklist.md` - smoke case categories and sanity derivation rules. Read during Phases 2–3.

## Related Skills

- `designing-functional-tests` - the full test plan the smoke suite is a subset of
- `manual-release-testing` - the release pass that runs after smoke passes
- `analyzing-regression-scope` - deciding what a change touches, which feeds sanity
- `automating-ci-test-pipelines` - running smoke as a CI gate
- `assessing-release-readiness` - smoke results feed go/no-go

## Definition of Done

This skill is complete when:

- smoke and sanity suites are defined separately with entry/exit criteria and time budgets
- smoke covers every critical user path and runs as a CI gate on every build
- sanity derivation per change is documented
- the smoke list was reviewed against past defects (nothing critical missing, nothing dead)
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
