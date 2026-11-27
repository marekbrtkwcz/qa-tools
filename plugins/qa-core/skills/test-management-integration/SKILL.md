---
name: test-management-integration
description: 'Wires automated test results into test management tools: exporting JUnit XML or runner JSON from the suite, stamping each test with a stable requirement or case ID, and importing to Xray, TestRail or Jira without duplicating cases or losing history. Use when results are pasted into a tracker by hand, when an import created thousands of duplicate cases, when coverage must show up against requirements in the tracker, or when CI must publish results automatically. For writing one bug by hand use reporting-bugs; for the requirement-to-test matrix in code use tracing-requirements-to-code.'
argument-hint: 'The runner and its report formats, the tracker (Xray, TestRail, Jira) and how results reach people today, plus where requirement IDs live in the codebase'
user-invocable: true
---

# Test Management Integration

Close the gap between "the suite went green" and "the tracker knows it went green".

When results reach a tracker by copy-paste, two things rot: the report is stale within a day, and nobody can answer "which requirement did this run verify". This skill designs the export path so the same run that CI executes also updates the tracker: stable IDs on tests, one import direction, counts that reconcile, and a first import that does not create a thousand duplicates.

## When to Use

- test results are manually copied into Jira, Xray, TestRail or a spreadsheet after each release or run
- an automated import duplicated or orphaned cases: each rename created a "new" test, counts in the tracker match nothing
- auditors or release managers ask which automated tests cover which requirement - in the tracker, not in the repo
- CI should publish results to a tracker automatically and nobody has dared to run the first import

## When NOT to Use

- one specific failure needs writing up as a bug: `reporting-bugs` (that is one defect with evidence, not a batch export)
- the question is which requirement maps to which test in the codebase: `tracing-requirements-to-code` owns the matrix in source; this skill moves results out, it does not invent the IDs
- the ask is a quality dashboard (pass rate over time, flake trends): `analyzing-quality-metrics` and `tracking-quality-trends`; a tracker is a bad dashboard
- the tool has no import/API path and one manual paste per release would do: say so - an integration that outruns the team's actual reporting cadence is maintenance cost without benefit

## Operating Principles

- **Stable IDs before any import.** Match on a deliberate ID stamped in the test (`[QA-4127]` in the title, a tag, an annotation), never on test name. A rename must not create a new case; name-based matching guarantees duplicate cases on the first refactor. No ID on a test means it does not get imported - that is honest silence, not data loss.
- **Import granularity is the test case.** One automated result per tracker case, not one per assertion. Assertion-level detail stays in the report (see `test-reports-and-artifacts`); the tracker gets the case verdict and a link to the evidence.
- **One import direction.** CI pushes results; the tracker never reflects renames back into code. Bidirectional sync is how suites end up owned by a tool.
- **Dry-run the first import.** Count exported results, count created/updated cases after import, and show both numbers before letting the import run on the real project. An import that cannot report what it changed is a restore-job-in-waiting.
- **Automated and manual cases need a stated relationship.** Either the automated test *is* the case, or it links to the manual case (Xray: automated test linked to requirement; TestRail: automated results on a dedicated automated-case type). Pick one, record it, keep it.
- **Machine writes, human reads.** The import may close cases, mark executions, attach run summaries - it must never reorganize a human's test plan or silently delete manual case content. Scope the API token to write results only.

## Procedure

1. **Choose the export format.** JUnit XML is the lingua franca (every runner emits it; Xray and TestRail import it) but has limits: no flaky-vs-passed distinction, no attachments, failures as text blobs. When a limit loses information the team actually needs (flake flags, screenshots), use the runner's JSON and a small converter, and record why JUnit XML alone was not enough.
2. **Stamp stable IDs.** Find where requirement/case IDs live today (`grep` the repo for the ID pattern; ask if only some tests carry them) and pick one stamping convention (title suffix vs tag). ID-less tests may be imported to a quarantine/sandbox area or skipped - state which, with counts.
3. **Pick the import path per tracker.** Xray: JUnit XML via the import endpoint (cloud and DC differ: read `./resources/tool-formats.md` for the current endpoints and field mappings). TestRail: JUnit XML mapped by ID via `add_result_for_case` on a run created per CI job. Jira built-in import: JUnit XML as an attachment-level summary only - for real coverage use Xray/Zephyr rather than parsing XML in Jira.
4. **Map fields explicitly.** Failures → failure text with the first stack lines, not the whole log; duration, environment, and a link back to the CI run and the HTML report. Every unmapped field is a decision, not an accident.
5. **Dry-run and reconcile counts.** Run the import against a sandbox or a subset; verify exported == created+updated+expectedly-skipped. Paste the table. Only then schedule it.
6. **Wire into CI.** The publish step runs after the report step (import links to the report; a broken import must not fail the test job unless the team chose required coverage in the tracker as a gate - that is a `governing-quality-waivers`-style decision, made deliberately). Token from CI secrets, never in the workflow file.

## Resource Map

- `./resources/tool-formats.md` - read when wiring a specific tracker: import endpoints and field mapping tables for Xray, TestRail and Jira, JUnit XML limits per runner, sample CI publish steps, and the count-reconciliation checklist

## Related Skills

- `tracing-requirements-to-code` - builds the requirement-to-test links in source; this skill exports their results
- `test-reports-and-artifacts` - produces the evidence the tracker entry links to
- `reporting-bugs` - the one-failure, human-written counterpart to this batch export
- `analyzing-quality-metrics` - when the imported numbers start being read as meaning something
- `automating-ci-test-pipelines` - the pipeline the publish step lives in

## Definition of Done

- every imported test carries a stable ID; a title/name rename in the repo provably results in an update, not a new case
- the import direction, per-tracker mapping, and automated-vs-manual case relationship are each written down in one line the next person can find
- a dry-run table reconciles exported results against created/updated/skipped cases, and it is pasted into the handover, not summarized
- the tracker entry links to the CI run and the run's report (trace/screenshot reachable), and states environment and duration
- credentials live in CI secrets; the token could not delete a test plan if it tried
- the first scheduled import ran green twice in a row, and each run's counts matched the run before it plus known churn
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
