---
description: Run failing tests in a scope, diagnose each failure, and fix the root cause without weakening assertions, adding retries, or masking app defects. Flaky tests → /stabilize-flaky-tests workflow; diagnose only → use the diagnosing-test-failures skill.
---

# Fix failing tests

Goal: fix failing tests in the given scope (test file, folder, or suite — default: the full suite, run with `npx playwright test`).

If the `diagnosing-test-failures` skill is available, load it before starting.

1. **Identify failing tests**: run the suite limited to the scope; read error messages, logs, and traces (`npx playwright test --trace on`, then `npx playwright show-trace`).
2. **Classify each failure** before fixing: application defect / test bug / environment-config / test data / flaky. Re-run a failing test in isolation when you suspect flakiness — an intermittent failure needs a root-cause fix (condition-based waiting via `expect()`, test isolation, data setup), never a retry. For pass+fail on the same commit, follow the `stabilizing-flaky-tests` skill.
3. **Fix by root cause**: modify the test or the code under test; keep fixes minimal.
4. **Validate**: re-run affected tests; for fixed flaky tests confirm stability with `--repeat-each=5`, not a single green run; re-run the full scope to catch regressions.

Stop after 3 failed fix iterations and summarize: what was found, what was tried, what still fails.

## Guardrails

- Never make a test pass by weakening/deleting assertions, raising global timeouts to mask races, adding retries to hide flakiness, or skipping the test.
- Replace sleeps/hardcoded waits with condition-based waiting (`await expect(...)`), per project conventions: `getByRole`/`getByLabel` selectors, assertions only via `expect()`, no `waitForTimeout`.
- If the failure is an application defect outside the requested scope, stop and report it with evidence instead of changing the test to accept broken behavior.
- Clean up created test data in `afterEach`.
