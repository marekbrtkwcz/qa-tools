---
description: Refactor UI test specs into a Page Object Model without changing what they verify — extract locators and actions into page/component objects, keep assertions in tests, and prove behaviour is unchanged by rerunning against a baseline. Argument: test file, folder, or glob to refactor (e.g. /refactor-to-page-objects tests/e2e/checkout/). For moving tests from another framework into Playwright, migrate them manually following the playwright-test-writing skill.
---

# Refactor tests to page objects

Goal: refactor the tests in the given scope (command argument: file, folder, or glob) into page objects. This is a pure structural refactor: the same tests must check the same things afterwards.

If no scope is provided, ask for it and stop until you have it. If the scope has more than about 10 spec files, propose an order (most duplicated first) and confirm before starting.

## Steps

1. **Record the baseline.** Run the target tests (`npx playwright test <scope>`) and save the result (passed, failed, skipped per test). Do not refactor tests that already fail: list them and leave them unchanged.
2. **Inventory** repeated locators, repeated action sequences, and existing page objects, components, and fixtures to extend rather than duplicate. Read the project's naming and folder conventions (e.g. `pages/`, `components/`).
3. **Design the page objects**:
   - one object per page or significant component; split large pages into component objects rather than one large class
   - locators live only in the page object, defined with user-facing locators where the original allowed (`getByRole`, `getByLabel`, `getByTestId`)
   - methods describe user intent (`submitOrder()`, not `clickButton()`)
   - navigation methods return the next page object
   - expose locators or state getters so tests can assert; assertions stay in the tests
4. **Refactor one spec at a time**, wiring page objects through the project's fixture mechanism when there is one (e.g. Playwright `test.extend`).
5. **Verify after each spec**: rerun it and compare with the baseline. The same tests must pass, with the same number of assertions. If a spec does not match after 2 attempts, revert that spec and list it with the reason.
6. **Run the whole scope** once more at the end and compare with the baseline.

## Output

- the new structure: page and component objects created or extended, with file paths
- per spec: refactored and matching baseline, or reverted (with reason), or skipped (already failing)
- the baseline and final run results side by side
- duplication removed (e.g. "the login sequence was in 9 specs, now in `LoginPage.login()`")
- ideas noticed but not applied (better waits, missing assertions), for a separate change

## Guardrails

- Do not change tested behaviour, add or remove assertions, move assertions into page objects, add waits (never `waitForTimeout`), or change timeouts during the refactor.
- If a test cannot be refactored cleanly, leave it working as it was and list it.
- Do not delete old helpers until no spec in the scope uses them.
