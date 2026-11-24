---
name: refactor-to-page-objects
description: "Refactors UI test specs into a Page Object Model without changing what they verify: extracts locators and actions into page or component objects, keeps assertions in the tests, and proves behaviour is unchanged by rerunning against a baseline. Use when specs repeat the same locators and action sequences, or before a suite grows past what copy-paste can maintain. For moving tests from another framework into Playwright, use the migrate-tests-to-playwright command."
argument-hint: "[targetScope]"
disable-model-invocation: true
---

# Refactor tests to page objects

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `targetScope`: test file, folder, or glob to refactor

# Task

If the `designing-test-automation-architecture` skill is installed, load it before starting.

Refactor the tests in <targetScope> into page objects. This is a pure structural refactor: the same tests must check the same things afterwards.

If no scope is provided, ask for it and stop until you have it. If the scope has more than about 10 spec files, propose an order (most duplicated first) and confirm before starting.

## Steps

1. **Record the baseline.** Run the target tests and save the result (passed, failed, skipped per test). Do not refactor tests that already fail: list them and leave them unchanged.
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
- ideas you noticed but did not apply (better waits, missing assertions), for a separate change

## Guardrails

- Do not change tested behaviour, add or remove assertions, move assertions into page objects, add waits, or change timeouts during the refactor.
- If a test cannot be refactored cleanly, leave it working as it was and list it.
- Do not delete old helpers until no spec in the scope uses them.

## Related Skills

- `writing-playwright-tests-best-practices` - the conventions the page objects should follow
- `designing-test-automation-architecture` - when the refactor is really a re-layer decision (fixtures vs page objects vs screenplay)
- `unslop-tests` - review pass after refactor: no tautological assertions introduced

## Definition of Done

- suite green before and after with the same pass set - no behavior changed
- locators and actions extracted into page/component objects; specs read as intent
- no duplicated locator left in specs
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
