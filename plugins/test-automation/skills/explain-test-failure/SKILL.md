---
name: explain-test-failure
description: Diagnoses one failing test from an error message, stack trace, CI log, or trace file and classifies the root cause as app defect, test bug, environment issue, or flakiness, without changing any code. Use when a test fails and you need to know why before deciding who fixes what. To have the failure fixed, use the fix-tests command; for a whole run with many failures, use the analyze-test-results command.
argument-hint: "[failureEvidence]"
disable-model-invocation: true
---

# Explain a test failure

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `failureEvidence`: test name, error message, stack trace, CI log, or path to a report/trace file

# Task

If the `diagnosing-test-failures` skill is installed, load it before starting.

Your goal is to explain why a test is failing, not to fix it.

Analyze the failure evidence: <failureEvidence>

Ask only for missing essentials:

- the failing test name or file if not clear from the evidence
- where the failure occurred: locally, in CI, or both
- whether the failure is constant or intermittent, if known

Then do the following:

1. Read the failing test and the code or page it exercises. Follow the stack trace to the exact failing line.
2. If the test can be run safely, rerun it in isolation to confirm the failure and check for flakiness. Do not modify any files to do so.
3. Classify the root cause as one of:
   - **Application defect** - the product behaves incorrectly
   - **Test bug** - wrong assertion, stale locator, bad test data, broken setup
   - **Environment/config** - missing dependency, wrong URL, credentials, CI-only conditions
   - **Flakiness** - race condition, timing, test interdependence, unstable data
4. Explain the failure chain step by step: what the test expected, what actually happened, and why.
5. If the evidence is not conclusive, list 2–3 ranked, falsifiable hypotheses and, for each, the single check that would confirm or eliminate it.
6. State your confidence and be explicit about what you verified versus what you inferred.

## Output format

Return Markdown only, with:

- a one-paragraph verdict: root cause classification and confidence
- the failure chain explanation
- evidence cited from code, logs, or reruns
- recommended next step: fix the app (file a bug with the `bug-report` command), fix the test (use the `fix-tests` command), or adjust the environment

## Constraints

- Never edit files or "try a fix" - this is a diagnosis, not a repair.
- Do not guess: separate confirmed facts from hypotheses explicitly.

## Related Skills

- `diagnosing-test-failures` - the full reproduction loop when classification alone is not enough
- `fix-tests` - when the classification says test bug or app defect and a fix follows
- `reporting-bugs` (qa-core) - when the classification is a confirmed app defect

## Definition of Done

- root-cause class stated (app defect / test bug / environment / flaky / test data)
- evidence cited by file:line or quoted log/trace line
- next step named (fix here, file a bug, quarantine)
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
