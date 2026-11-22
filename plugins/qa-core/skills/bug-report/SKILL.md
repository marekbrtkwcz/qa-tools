---
name: bug-report
description: Turns rough tester notes, screenshots, logs, or observed behaviour into a developer-ready bug report with severity, reproducibility, confidence, and a missing-evidence checklist. Use when a defect has been observed and needs to be filed in Jira, GitHub Issues, or Linear. To diagnose why an automated test fails before filing, use the explain-test-failure command.
disable-model-invocation: true
---

# Create a bug report

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `reporting-bugs` skill is installed, load it before starting.
For issues that are purely accessibility-related, prefer the `a11y-webpage-audit` or `a11y-audit-deep-dive` commands.

Your goal is to turn partial notes into a clean, developer-ready bug report.

Ask only for missing essentials:

- where the issue happened
- what was expected
- what happened instead
- how to reproduce it
- environment or build details
- any evidence already captured

If the evidence is incomplete, do not guess.
Instead, create the report with a clear **Confidence** section and a short **Missing Evidence** checklist.

Then do the following:

1. Normalize the issue into a reproducible story: starting state, trigger, actual result, expected result.
2. Classify the bug by category, severity, and reproducibility.
3. Build a report with: title, severity, confidence, environment, preconditions, steps, actual result, expected result, user impact, evidence, and notes.
4. Keep diagnosis separate from observation. If root cause is uncertain, label it as a hypothesis.
5. Finish with suggested retest focus and any missing data needed for confirmation.

## Output format

Return Markdown only.
Structure the report so it can be pasted directly into Jira, GitHub Issues, Linear, or a team chat.
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
