---
description: Diagnose ONE failing test from error message, stack trace, CI log, or trace file — classify root cause (app defect / test bug / environment / flakiness), explain the failure chain, state confidence, and recommend the next command. Argument: failure evidence (test name + error/stack/log or report path). Diagnosis only, never edits. For fixing use /fix-tests; for a whole red run use /analyze-test-results. See skill diagnosing-test-failures.
---

# Explain a test failure

If the `diagnosing-test-failures` skill is available, load it before starting.

Goal: explain why a test is failing — not to fix it. Evidence: command argument (test name, error message, stack trace, CI log, or report/trace path).

Ask only for missing essentials: failing test name/file if unclear, where it failed (local / CI / both), whether the failure is constant or intermittent.

## Steps

1. Read the failing test and the code/page it exercises; follow the stack trace to the exact failing line.
2. If it can be run safely, rerun it in isolation (`npx playwright test <file> -g <name>`) to confirm and check for flakiness. Do not modify any files to do so.
3. Classify the root cause as one of: **application defect** (product behaves incorrectly), **test bug** (wrong assertion, stale locator, bad test data, broken setup), **environment/config** (missing dependency, wrong URL, credentials, CI-only), **flakiness** (race, timing, interdependence, unstable data).
4. Explain the failure chain step by step: what the test expected, what happened, why.
5. If evidence is inconclusive, list 2–3 ranked falsifiable hypotheses, each with the single check that would confirm or eliminate it.
6. State confidence; be explicit about what you verified vs inferred.

## Output (Markdown)

- one-paragraph verdict: root-cause classification + confidence
- the failure chain
- evidence cited from code, logs, or reruns
- recommended next step: file an app bug (`/bug-report`), fix the test (`/fix-tests`), adjust environment, or stabilize the flake (`/stabilize-flaky-tests`)

## Constraints

- Never edit files or "try a fix" — diagnosis only.
- Do not guess: separate confirmed facts from hypotheses explicitly.
