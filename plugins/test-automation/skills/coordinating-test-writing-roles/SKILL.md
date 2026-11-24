---
name: coordinating-test-writing-roles
description: 'Runs test writing as a 4-role pipeline — planner, writer, refactorer, reviewer — where each role has exactly one job and hands a concrete artifact to the next: the planner produces an automation-ready scenario file, the writer turns it into simple passing tests, the refactorer restructures only the explicitly named specs into production architecture, and the reviewer reports findings without rubber-stamping. Use when a feature needs new automated tests and you want plan → code → architecture → review kept separate instead of one agent doing everything, or when adopting this role split in a team workflow. For a single small test, just use the layer-specific skills (api-playwright-test-developer, writing-playwright-tests-best-practices) directly.'
argument-hint: 'The feature or endpoint to cover, and the layer (API / UI / E2E hybrid)'
user-invocable: true
---

# Coordinating Test-Writing Roles

One agent doing plan + write + refactor + review in a single pass produces mush. Splitting the work into four narrow roles — each with one artifact in, one artifact out — keeps every stage checkable. This skill is the orchestration contract for that pipeline.

## The Pipeline

```
Planner ──scenario file (.md)──▶ Writer ──simple passing specs──▶ Refactorer ──production specs──▶ Reviewer ──findings report──▶ (fix → re-review)
```

| Role | ONLY does | Hands off | Never does |
|---|---|---|---|
| **Planner** | Analyze spec/UI/OpenAPI, produce automation-ready scenario file(s) | Scenario file, human-readable, usable as direct input for the writer | Write or modify test code |
| **Writer** | Read the scenario file, write simple **working** specs | Green spec files + run output | Architecture, page objects, refactoring |
| **Refactorer** | Restructure **only the explicitly named** spec files into production architecture | Refactored specs passing twice in a row | Pick its own target files, change tested behavior |
| **Reviewer** | Strict review of the specs: defects, weak assertions, flaky patterns, architecture violations | Severity-ranked findings report | Approve code ("rubber-stamp") |

## Rules of the Pipeline

1. **One role, one turn.** Do not merge roles in a single pass. Each role starts from the previous role's artifact, not from memory of the whole task.
2. **Artifacts are files, not summaries.** Planner → `.scenario.md`; writer → `.spec.ts` + terminal output; refactorer → modified `.spec.ts` + work summary; reviewer → findings report. A role that produced no artifact did no work.
3. **Scope rule for the refactorer.** It refactors only files explicitly handed to it. If none are named, it stops and asks. It never sweeps the whole suite.
4. **Writer's bar is "green and simple"; refactorer's bar is "green twice and production-ready"; reviewer's bar is "assume problems until proven otherwise".**
5. **Every role ends with a mandatory work summary**: files created/modified with reasons, key decisions and trade-offs, terminal output confirming the result.
6. **Reviewer findings go back to the writer/refactorer as fixes, then re-review.** The pipeline does not close on an unaddressed critical finding.

## Running the Pipeline

1. **Planner**: give it the requirement, OpenAPI spec, or UI flow. It validates scenarios against the real system where possible (e.g. via browser/API exploration) and writes the scenario file. Done when: scenario file exists, every scenario is automation-ready (endpoint, method, payload, expected status, expected body shape).
2. **Writer**: give it the scenario file. Done when: spec files exist, `npx playwright test <spec>` passes, output shown.
3. **Refactorer**: hand it the exact spec file paths from step 2. Done when: same assertions preserved, architecture applied (see `refactoring-api-tests` / `refactor-to-page-objects`), tests pass **twice in a row**.
4. **Reviewer**: hand it the final specs. Done when: findings report is produced; critical/high findings are fixed and re-reviewed.

## Layer Variants

The same 4 roles apply per layer — API, UI, and hybrid E2E:

- **API**: planner reads OpenAPI → 3 scenario groups (schema / positive / negative); writer writes simple `request`-based specs; refactorer applies the 3-layer API architecture; reviewer checks contract validation and stability.
- **UI**: planner explores the real UI and validates the scenario before writing it down; writer writes simple page-driven specs; refactorer extracts page objects; reviewer checks locators, waits, assertions.
- **E2E hybrid**: planner designs API-setup → UI-action → UI+API-verify scenarios (see `hybrid-ui-api-testing`); the rest follows the same chain.

## Resource Map

- `resources/role-contracts.md`: per-role contract in detail — inputs, exact responsibilities, forbidden actions, output format, done criteria. Read when standing up the pipeline for a specific layer or adapting the roles to a team's tools.

## Related Skills

- `api-test-plan-and-tests` — planner+writer combined for API, when you do not need the full pipeline
- `hybrid-ui-api-testing` — the E2E scenario shape the planner should produce
- `refactoring-api-tests` / `refactor-to-page-objects` — what the refactorer role applies
- `code-review-advanced` / `unslop-tests` — what the reviewer role checks
- `creating-custom-agents` — to turn each pipeline role into a standing agent with its own tool limits

## Definition of Done

- Each of the 4 stages produced its artifact (scenario file → green specs → refactored specs → findings report)
- Final specs pass twice in a row after refactoring
- No critical or high reviewer finding left unaddressed
- Every role delivered its mandatory work summary
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
