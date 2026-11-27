---
name: implementing-bdd-tests
description: 'Implements executable BDD tests from Gherkin .feature files: sets up Cucumber.js or Playwright-BDD, writes step definitions mapped to Given/When/Then, wires fixtures and test data into steps, and runs the suite. Use when .feature files exist (hand-written or generated) and need to become passing automated tests, when adopting BDD in a team, or when acceptance criteria should run as living documentation in CI. For generating .feature files from requirements, use generate-gherkin-scenarios; for general Playwright test writing, use writing-playwright-tests-best-practices.'
argument-hint: '.feature files to implement, framework preference (Cucumber.js / Playwright-BDD), and the application under test'
user-invocable: true
---

# Implementing BDD Tests

Gherkin `.feature` files are only useful when they execute. This skill turns Given/When/Then scenarios into runnable step definitions, wired into a test runner, so acceptance criteria become living documentation that fails in CI when behavior changes.

## When to Use

- `.feature` files exist and need executable step definitions
- Adopting BDD: business-readable scenarios that run in CI
- Acceptance criteria should double as regression tests
- A team writes scenarios in Gherkin but nobody implements them

## When NOT to Use

- Writing .feature files from requirements — use `generate-gherkin-scenarios`
- No Gherkin involved, just Playwright tests — use `writing-playwright-tests-best-practices`
- Designing what to test from a spec — use `designing-functional-tests`

## Workflow

### 1. Choose the runner

| Runner | Best when | Setup |
|---|---|---|
| **Playwright-BDD** | Already using Playwright, want one framework | `npm i -D playwright-bdd`, generate steps via `npx bddgen` |
| **Cucumber.js** | Need mature ecosystem, reporting, parallelization | `npm i -D @cucumber/cucumber`, `cucumber-js` config |

Default for Playwright suites: Playwright-BDD. Default for new projects wanting rich reporting: Cucumber.js.

### 2. Scaffold step definitions

- For each `.feature` file, generate stub step definitions (`npx bddgen` for Playwright-BDD, or Cucumber's `--dry-run` to list undefined steps)
- Map each step to a reusable function — avoid one giant step file; group by domain (auth steps, navigation steps, assertion steps)
- Done when: `cucumber-js --dry-run` or Playwright's list mode shows zero undefined steps

### 3. Implement steps with fixtures

```typescript
// Playwright-BDD style
import { Given, When, Then } from './fixtures';

Given('the user is logged in as {string}', async ({ page }, role: string) => {
  await loginAs(page, role); // reuse testing-auth-flows storageState
});

When('the user submits the form with invalid data', async ({ page }) => {
  await page.getByTestId('email').fill('not-an-email');
  await page.getByRole('button', { name: 'Submit' }).click();
});

Then('an error message {string} is shown', async ({ page }, msg: string) => {
  await expect(page.getByRole('alert')).toContainText(msg);
});
```

- Reuse existing page objects / helpers — BDD steps are glue, not a second architecture
- Parameterize with `{string}`, `{int}`, data tables for scenario outlines
- Done when: every step has a real implementation, no `pending` / `TODO`

### 4. Wire test data

- Scenario outlines (`Examples:` tables) map rows to test cases automatically
- For complex data, use `test-data-factories` inside step definitions, never hardcoded values
- Done when: scenario outlines run once per Examples row

### 5. Run and validate

- `npx cucumber-js` or `npx playwright test` (BDD-generated tests)
- Every scenario must pass; failures mean either a real defect (`reporting-bugs`) or a wrong step
- Done when: full feature file runs green, output lists scenario count

## Output

- Step definition files organized by domain under `steps/` or `support/`
- Runner config (`cucumber.js` / BDD config in `playwright.config.ts`)
- Green run output quoted in the summary

## Resource Map

- `resources/step-patterns.md`: copy-paste step definition patterns for common Given/When/Then (auth, forms, tables, API-backed steps), Cucumber.js vs Playwright-BDD config examples

## Related Skills

- `generate-gherkin-scenarios` — create the .feature files first
- `testing-auth-flows` — login steps via storageState, not UI login in every scenario
- `test-data-factories` — data inside step definitions
- `writing-playwright-tests-best-practices` — assertion quality inside Then steps

## Definition of Done

- Zero undefined steps on dry-run
- All scenarios in scope run and pass
- Steps reuse existing helpers/page objects (no duplicated logic)
- Scenario outlines execute once per Examples row
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
