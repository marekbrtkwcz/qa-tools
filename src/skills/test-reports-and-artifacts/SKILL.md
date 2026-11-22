---
name: test-reports-and-artifacts
description: 'Configures the evidence a test run leaves behind: HTML and Allure reporting, trace/video/screenshot attachment on failure, one merged report for sharded runs, run history and trends, and artifact retention in CI. Use when a failed run leaves nothing readable behind, when reports cannot be opened or add nothing a log does not, when shards produce N separate reports, or when a team asks for run history or a trend page. For how CI jobs are triggered and shaped use automating-ci-test-pipelines; for interpreting metrics over time use tracking-quality-trends.'
argument-hint: 'The runner and its current reporter config, where runs happen (local, CI), what a failed run leaves behind today, and who reads the report'
user-invocable: true
---

# Test Reports and Artifacts

Make every run leave behind something a reader can act on without rerunning it.

A report exists for one reader: whoever must decide, from evidence they did not see happen, what broke and where to look. The two failure shapes this skill fixes are the run that keeps nothing (a log ending in "1 failed") and the run that keeps everything (a 40-minute artifact upload nobody scrolls). The target is a report that opens offline, shows the failed test with its own trace and screenshot, and stays reachable long enough to be read.

## When to Use

- a failed run cannot be debugged from what it kept: no trace, no screenshot, an HTML report that is not generated or not uploaded
- shards or parallel jobs each produce their own report and nobody looks at N reports
- a team asks for run history, flake trends, or an Allure-style dashboard and the raw CI log is doing that job
- test titles and failure output are so unreadable that even a good report answers nothing

## When NOT to Use

- the problem is how CI jobs are structured (triggers, sharding, caching, runtime budget): `automating-ci-test-pipelines` owns the pipeline; this skill owns what an individual run emits
- a number from the report is being interpreted or tracked (pass rate, flake rate, duration): `tracking-quality-trends` and `analyzing-quality-metrics` read the data; this skill produces it
- the reader needs a decision, not the artifact (go/no-go, stakeholder summary): `communicating-quality-findings`
- the report exists and a specific failure needs a root cause: `diagnosing-test-failures`

## Operating Principles

- **Design for the failure case first.** Configure what a red run keeps before tuning what a green one shows. A report is proven by opening it on a deliberately broken test, not by admiring it on a green run.
- **Attach on failure, unless history proves otherwise.** Trace and video only-for-failures keeps runs fast and reports small. "Video always" is a real choice (needed for flakes that leave no artifact) — make it explicitly, with the cost written down.
- **One report per run.** Sharded runs are merged before upload. A merged report is one link in one place; N shard reports are N links nobody clicks. Merge in CI, not "we all open our local one".
- **History only if someone will read it.** Allure history needs a persistent directory the CI keeps between runs (cache or artifact round-trip). If nobody will look at the trend page, the built-in HTML report plus CI retention is the honest setup.
- **A report is only as good as its titles.** Retitle before reconfiguring: `before_each` hook fails / `checkout > guest cannot see basket` — the second needs no video to triage.
- **Retention is a decision, not a default.** Write the retention period down (days), and check it matches how long the team actually goes back to read a run.

## Procedure

1. **Inventory what a failed run keeps today.** Read the runner config and CI workflow; if claims are unclear, break a cheap test deliberately and report what artifacts survive: artifacts kept, formats, links that work offline, where they expire. State what a reader can and cannot see today.
2. **Pick the reporter stack.** Start with the runner's built-in HTML report; move to Allure (or similar) only when history, flake badges, or environment grouping are actually wanted. Record the choice and the reason in one line each.
3. **Wire the evidence.** On failure: trace (or equivalent replay), screenshot of the failure moment, video if the runner offers failure-only. Annotate what steps mean (`test.step` / labels) so the reader does not parse a selector stack to understand intent.
4. **Merge shards into one report.** Use the runner's merge tool after all shards land. Verify by choosing a failing shard and confirming its tests appear in the merged report.
5. **Set retention and history.** Upload on failure (and on merge for the main branch). Set `retention-days` out loud. For Allure: preserve the history directory across runs and publish where the team can reach it.
6. **Verify from the reader's chair.** Open the produced report the way a teammate would (downloaded artifact, not localhost), find the deliberately broken test, and confirm: title says what broke, failure text explains the assertion, trace steps are readable, screenshot is the failure not the load screen. If any of that fails, fix the report before shipping the config.

## Resource Map

- `./resources/reporter-options.md` - read when a runner-specific config is needed: reporter and attachment options for Playwright, Vitest, Jest and pytest, plus the trade-offs of each attachment mode and how history is kept per runner

## Related Skills

- `automating-ci-test-pipelines` - the pipeline that runs the jobs; this skill defines what one job emits
- `diagnosing-test-failures` - what to do with the evidence once the report made it reachable
- `stabilizing-flaky-tests` - flake evidence (video, trace of the retry) feeds the diagnosis this skill guarantees exists
- `tracking-quality-trends` - turns archived runs into a trend line; this skill produces the archives
- `communicating-quality-findings` - the report is the artifact; the decision is a different text

## Definition of Done

- a deliberately broken run leaves: an openable report, a trace of the failure, a screenshot at the failure moment - each verified from outside CI, the way a reader reaches it
- sharded runs produce exactly one merged report link per run
- every attachment mode (always / on-failure / never) used is stated in the config with the reason it is not one of the others
- retention is an explicit number of days written in the workflow file, not a silent default
- test titles were reviewed before the report was called done: no `before_each hook fails` as the only description of a business-level failure
