---
description: Turn rough tester notes, logs, or observed behavior into a developer-ready bug report with severity, reproducibility, confidence, and a missing-evidence checklist. For diagnosing why an automated test fails, use the diagnosing-test-failures skill first.
---

# Create a bug report

Goal: turn partial notes into a clean, developer-ready bug report.

If the `qa-best-practices` skill is available, load it before starting.

Ask only for missing essentials: where it happened, what was expected, what happened instead, how to reproduce, environment/build details, evidence already captured. If evidence is incomplete, do not guess — mark it in the **Confidence** section and a **Missing evidence** checklist.

Then:

1. Normalize into a reproducible story: starting state → trigger → actual result → expected result.
2. Classify: category, severity (blocker/critical/major/minor/trivial), reproducibility, confidence.
3. Report structure: title, severity, confidence, environment, preconditions, steps to reproduce, actual result, expected result, user impact, evidence (redact secrets/tokens — `<REDACTED>`), notes.
4. Keep diagnosis separate from observation — an uncertain root cause is a labeled hypothesis.
5. Finish with suggested retest focus and missing data needed for confirmation.

Output Markdown only, ready to paste into Jira / GitHub Issues / Linear.
