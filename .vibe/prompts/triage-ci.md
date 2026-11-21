---
description: Triage a failing CI run. Argument: run ID/URL (gh run view) or a pasted job log. Fetches failing jobs/tests, classifies each failure (application defect / test bug / environment-config / test data / flaky), clusters them by shared symptom, and gives the first concrete step per cluster. Analysis only. See skills diagnosing-test-failures, stabilizing-flaky-tests; commands /analyze-test-results, /explain-test-failure, /fix-tests.
---

# Triage CI failure

Goal: turn a red CI run into a short, actionable triage — what failed, which failures share a root cause, what to do first. Analysis only; do not modify tests or code.

Argument: CI run ID or URL (e.g. `gh run view <id>`), a job log path, or pasted output. Ask only for the run identifier and, if useful, the previous green run for comparison.

If the `diagnosing-test-failures` skill is available, load it before starting.

## Steps

1. **Run overview**: which jobs failed, which passed; total failed tests; duration vs usual. Note jobs that never ran (dependency failure) — their failures may be downstream noise.
2. **Collect failures**: failing test names, error messages, stack traces, screenshots/trace artifacts if referenced.
3. **Classify each failure** into exactly one class:
   - **application defect** — app behavior is wrong (assertion on real behavior fails consistently)
   - **test bug** — selector/assertion/timing wrong in the test
   - **environment/config** — missing env var, service down, config drift between CI and local
   - **test data** — dirty or missing fixture data, order dependence
   - **flaky** — passes on retry or intermittently on the same commit
4. **Cluster by shared symptom**: same error message, same endpoint/selector, same setup step, same job.
5. **Prioritize**: what blocks the merge, what is safe to defer, which single investigation explains the most failures.

## Output (Markdown)

- run health summary, 2–3 sentences
- classification table: `Failure | Class | Evidence | First step`
- cluster summary: `Cluster | Failures | Suspected root cause | Confidence (high/medium/low)`
- recommended next actions mapped to commands/skills: `/explain-test-failure` for the key single failure, `/analyze-test-results` for the full run, `/fix-tests` for confirmed test bugs, `/stabilize-flaky-tests` for flakes, `/bug-report` for application defects
- if a failure looks environmental, say exactly what to check (env var, service, config) before touching code

## Constraints

- Analysis only — never edit tests, code, or CI config.
- Facts vs hypotheses: a class is a hypothesis until evidence confirms it; label confidence.
- Never recommend "just retry the job" as a fix for a consistent failure; retries are evidence of flakiness, not a remedy.
- If logs are truncated or unreadable, state what is missing and ask for the full job log.
