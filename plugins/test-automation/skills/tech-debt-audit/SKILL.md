---
name: tech-debt-audit
description: 'Audits automated test code for anti-patterns - fragile selectors, hardcoded waits, swallowed assertions, test interdependence, CI misconfiguration, credential leaks - and produces a severity-ranked debt report with line citations, fixes, and an A-F health score. Use when reviewing a test suite or test PR, or when a suite is slow, flaky, or hard to maintain. For repository-level debt (skipped tests, disabled lint rules, weakened CI gates) use the audit-quality-debt command; for debt beyond test code use tech-debt-analysis.'
argument-hint: "[targetPath]"
disable-model-invocation: true
---

# Tech debt audit - test automation code review

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `targetPath`: test file, folder, or PR diff to audit

## Who does the work

Hand this task to the `test-code-reviewer` agent (in Vibe: `test-automation:test-code-reviewer`, spawned with `tools.agents` via `config_name`). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `unslop-tests` skill is installed, load it before starting.

Audit the test code in `<targetPath>`. Name each anti-pattern precisely, state the harm it causes in this suite, and give a concrete fix.

If `<targetPath>` is empty, ask for it and stop. Never report on code you haven't opened.

## Steps

1. Detect the framework and read its config (`playwright.config.*`, `vitest.config.*`, `jest.config.*`, CI workflow) before judging timeouts, retries or parallelism. Framework defaults are not defects.
2. If the user named a focus ("selectors only", "security only"), limit the scan to it and say so in the report.
3. Scan for: timing and synchronisation, locators, assertions, isolation and shared state, duplication and structure, CI configuration (retries, `forbidOnly`, sharding), and security (secrets, committed session files, real PII).
4. For a large scope, read the files most likely to carry debt first (shared fixtures, helpers, config, the largest specs) and list the files you did not read.
5. Write the report in the reviewer's output format: summary line with counts and the A-F health score, findings sorted by severity, quick wins, then findings that need design work.

## Fix plan

End with the findings grouped by when to fix them:

- **Before the next release:** Critical findings (tests that cannot fail, exposed secrets or PII).
- **This sprint:** High findings (flakiness, order dependence, retries masking failures).
- **Debt backlog:** Medium findings, each with a rough effort.
- **Optional:** Low findings.

## Guardrails

- Report only; do not edit files. Fixes are snippets in the report.
- Cite a file and line for every finding, and only for code you opened.
- Mark findings that depend on context you don't have (for example `ignoreHTTPSErrors` for a self-signed test environment) as "check" rather than as defects.
- If the scope is a whole repository and the user wants a debt register with effort and ROI, stop and load the `tech-debt-analysis` skill instead (or suggest the tech-debt-auditor agent if that is preferred).

## Related Skills

- `tech-debt-analysis` (quality-gates) - the repo-wide debt register this audit feeds
- `unslop-tests` - the anti-pattern checklist for test code specifically
- `code-review-advanced` - when findings need a structured PR-level review
- `governing-quality-waivers` (quality-gates) - accepted debt becomes a dated, owned waiver, not a silent skip

## Definition of Done

- every finding has file:line, severity, and a suggested fix
- findings grouped into a prioritized register (fix now / schedule / waive)
- anything consciously left is recorded as a waiver, not left silent
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
