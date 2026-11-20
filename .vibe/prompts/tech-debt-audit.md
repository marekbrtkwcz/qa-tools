---
description: Audit automated test code for anti-patterns (fragile selectors, hardcoded waits, missing or swallowed assertions, test interdependence, CI misconfiguration, credential leaks) and produce a severity-ranked debt report with file:line citations, concrete fixes, and an A–F health score. Report only — do not edit files. Argument: test file, folder, or PR diff to audit (e.g. /tech-debt-audit tests/e2e/). For repo-level debt (skipped tests, disabled lint, weakened CI gates) and effort/ROI ranking, delegate to the qa-tools:tech-debt-auditor subagent instead.
---

# Tech debt audit — test automation code review

If the `unslop-tests` skill is available, load it before starting.

Audit the test code in the scope given as the command argument. Name each anti-pattern precisely, state the harm it causes in this suite, and give a concrete fix.

If no scope is provided, ask for it and stop. Never report on code you have not opened.

## Steps

1. **Detect the framework and read its config** (`playwright.config.*`, CI workflow) before judging timeouts, retries, or parallelism — framework defaults are not defects.
2. If the user named a focus ("selectors only", "security only"), limit the scan to it and say so in the report.
3. **Scan for**: timing and synchronisation, locators, assertions, isolation and shared state, duplication and structure, CI configuration (retries, `forbidOnly`, sharding), and security (secrets, committed session files, real PII).
4. For a large scope, read the files most likely to carry debt first (shared fixtures, helpers, config, the largest specs) and list the files you did not read.
5. **Write the report**: summary line with counts and the A–F health score, findings sorted by severity, quick wins, then findings that need design work. End with a fix plan grouped by when to fix:
   - **Before the next release:** Critical (tests that cannot fail, exposed secrets/PII)
   - **This sprint:** High (flakiness, order dependence, retries masking failures)
   - **Debt backlog:** Medium, each with rough effort
   - **Optional:** Low

## Guardrails

- Report only; do not edit files. Fixes are snippets in the report.
- Cite `file:line` for every finding, and only for code you opened.
- Mark findings that depend on context you don't have (e.g. `ignoreHTTPSErrors` for a self-signed test environment) as "check", not defects.
- If the scope is a whole repository and a debt register with effort and ROI is wanted, stop and delegate to the `qa-tools:tech-debt-auditor` subagent.
