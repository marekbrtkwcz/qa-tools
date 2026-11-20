---
description: Generate automated tests for the cases in a written test plan (default .qa/test-plan.md from /create-test-plan), in the project's existing framework and conventions, run them, and report per-case status. Argument: path to the test plan file. Case IDs go into test titles for traceability (e.g. 'CHK-003 rejects an expired card'). For one scenario walked live first, use /playwright-generate-test. See skills test-planning, playwright-test-writing; never weaken assertions or add retries to get green.
---

# Generate tests from a test plan

Argument: path to the plan file (default `.qa/test-plan.md`, fallback `.qa/basic-test-plan.md`; if neither exists, ask and stop).

## Before writing code

1. Read the plan; identify the framework from the project (`playwright.config.ts` etc.), test folder, naming, fixtures, page objects, auth setup, helpers. No framework → ask whether to set up Playwright Test first.
2. Choose cases to automate: those marked as automation candidates, or P1 if unmarked. If more than ~15, show the list and confirm. List skipped cases with reasons (manual-only, missing data, unclear expected result).

## Writing the tests

- Follow the project's existing structure/naming/fixtures — no parallel structure.
- Each test independent, sets up its own state and data; cleanup in `afterEach`.
- Assertions check the plan's expected result, not just navigation.
- Project conventions: `getByRole`/`getByLabel` selectors, assertions only via `expect()` (web-first), never `waitForTimeout`/sleeps.
- No hardcoded credentials or hosts — use `baseURL`, `storageState`, env vars.
- Put the plan's case ID in each test title (`test('CHK-003 rejects an expired card', …)`).
- Ambiguous expected result → test the clear part, list the question; do not invent the rule.

## Run and fix

Run the generated tests (`npx playwright test <files>`). Per failure: test bug → fix and rerun, max 3 attempts; app defect or still failing → leave failing (or `test.fixme` with the defect named, only with user agreement) and report.

## Output

- files created/changed
- table: `Case ID | Test file | Status (passed / failed: app defect / failed: unresolved / not run) | Notes`
- skipped cases with reasons; open questions about the plan
- the command to run the new tests

## Guardrails

- Run only against authorized environments.
- Never weaken assertions, add retries, raise timeouts, or skip tests for a green run.
- Report exactly which tests ran and passed — never present unexecuted tests as verified.
