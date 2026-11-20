---
description: Turn a raw test run (CI log, JUnit/Playwright report, console output) into failure clusters, suspected root-cause groups, flakiness suspects, and what to investigate first. Argument: path to report/log file or pasted output; optional context: CI vs local, branch/build, previous run for trend. Analysis only — for one failing test use /explain-test-failure. See skills diagnosing-test-failures, stabilizing-flaky-tests.
---

# Analyze test results

Goal: convert a noisy test run into a short list of decisions — nobody should have to scroll through hundreds of log lines. Source: command argument (report/log path or pasted output).

Ask only for missing essentials: the results source, whether the run is CI or local and which branch/build, a previous run if trend analysis is wanted.

## Steps

1. **Parse the results**: total, passed, failed, skipped, duration. Note anything suspicious in the totals themselves (large skip counts, suites that never ran).
2. **Cluster failures by shared symptoms**: same error message, same selector/endpoint, same fixture or setup step, same suite/module.
3. **Per cluster, hypothesize a root-cause group**: application defect / test bug / environment-infrastructure / flakiness — using retry patterns and timing evidence where available.
4. **Identify flakiness suspects**: passed on retry, timing-related errors, order-dependent failures.
5. **Prioritize**: which cluster blocks the release/pipeline, which is safe to defer, which single investigation explains the most failures.

## Output (Markdown)

- run health summary, 2–3 sentences
- failure cluster table: `Cluster | Tests affected | Shared symptom | Suspected cause | Priority`
- flakiness suspects with the evidence for each
- recommended next actions mapped to commands: `/explain-test-failure` for the key failure, `/fix-tests` for confirmed test bugs, `/bug-report` for app defects, `/stabilize-flaky-tests` for flakes

## Constraints

- Distinguish facts from hypotheses — never present a suspected cause as confirmed.
- Analysis only; do not modify tests or code.
- If the source cannot be read/parsed (truncated log, unknown format), say what is missing and ask for the raw report file instead of summarizing a fragment.
