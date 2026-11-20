---
description: Reproduce intermittently failing tests with repeated and parallel runs, classify the root cause (timing, isolation, data, environment), fix the cause — never by retries or timeouts — and prove stability with before/after failure rates. Argument: known flaky test(s) or a suite scope to screen (e.g. /stabilize-flaky-tests tests/e2e/checkout/). For tests that fail on every run, use /fix-tests instead.
---

# Stabilize flaky tests

Goal: make flaky tests deterministic — not make them pass more often. Target: the scope given as the command argument.

If the `stabilizing-flaky-tests` skill is available, load it before starting.

Ask only for missing essentials: the scope if not provided, and any CI evidence of intermittent failures (retry logs, failure history) if available.

## Steps

1. **Reproduce the flakiness**: run the suspect tests repeatedly (`npx playwright test <scope> --repeat-each=10`) and, separately, with parallel workers — to observe both timing and isolation failures. Record the failure rate.
2. **Classify each flaky test by root cause**:
   - **Timing/UI** — races with rendering, animation, or network; sleeps and hardcoded waits
   - **Test isolation** — order dependence, shared state, leaked data between tests or workers
   - **Data** — non-unique or reused test data colliding across runs or workers
   - **Environment** — CI-only conditions, resource limits, external dependencies
3. **Fix the root cause, not the symptom**:
   - replace sleeps with web-first assertions / waits on concrete conditions (a specific response, URL, or element state); start `page.waitForResponse` before the triggering action
   - make each test own its state: unique per-worker data, setup/teardown in fixtures, cleanup in `afterEach`, no shared mutable state or `beforeAll` page sharing
   - mock unstable external dependencies instead of tolerating them
   - disable animations when they interfere with interactions
4. **Prove stability**: rerun each fixed test repeatedly and in parallel until it passes consistently (10+ consecutive runs). Report the before/after failure rate.
5. **Quarantine what cannot be fixed now**: explicit annotation plus a tracking note with the diagnosis — never delete it or hide it behind retries.

## Output

- per test: root-cause class, the fix, before/after failure rate (e.g. "7/10 → 0/10 over 10 runs, plus 3 parallel runs green")
- quarantined tests with the diagnosis and owner

## Guardrails

- Never stabilize by increasing global timeouts, adding retries, weakening assertions, or forcing serial execution without documenting why. Project conventions: `getByRole`/`getByLabel` selectors, assertions only via `expect()`, never `waitForTimeout`.
- Keep each fix minimal; explain the root cause per test in the summary.
