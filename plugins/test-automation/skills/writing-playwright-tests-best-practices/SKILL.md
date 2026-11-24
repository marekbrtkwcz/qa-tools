---
name: writing-playwright-tests-best-practices
description: 'Writes Playwright UI tests the maintainable way: user-facing locators (getByRole/getByLabel over CSS/XPath), auto-waiting instead of hardcoded waits, no sleeps, one behaviour per test, deterministic data and state, proper use of fixtures and trace/screenshot on failure, and flake-resistant assertions. Use when Playwright tests are brittle, slow, or fail randomly, when a new suite is being written, or when reviewing UI test code.'
argument-hint: 'The Playwright suite or test file to write or review, and the app URL/environment under test'
user-invocable: true
---

# Writing Playwright Tests: Best Practices

Use this skill when writing or reviewing Playwright UI tests. Most flaky, slow, unreadable UI tests break the same handful of rules: CSS/XPath locators that break on markup changes, `waitForTimeout` instead of waiting on state, one test doing five things, and shared mutable state between tests. This skill is the compact contract for UI test code; `unslop-tests` is the audit that enforces it.

## When to Use

- writing a new Playwright suite or adding UI tests
- existing UI tests are flaky, slow, or fail on unrelated UI changes
- reviewing UI test code in a PR
- tests pass locally but fail in CI (often selectors, timing, or isolation)

## Operating Principles

- **Locate like a user, not like a DOM.** `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId` (last resort) — never CSS classes or XPath. If the markup changes but the user experience does not, the test must not break.
- **Wait on state, never on time.** `expect(locator).toBeVisible()` auto-waits; `waitForTimeout(3000)` is a flake and a slowdown. The only acceptable explicit wait is on a specific condition.
- **Assert on what the user sees.** Visible text, role, state — not implementation details or internal attributes.
- **One behaviour per test.** A test that logs in, creates, edits, and deletes tests four things and reports one failure.
- **Deterministic input, isolated state.** Unique data per test/worker (`ensuring-test-isolation`, `test-data-factories`); no dependence on execution order.
- **Evidence on failure.** Trace/video/screenshot on failure configured once (`test-reports-and-artifacts`), so a CI failure is debuggable without re-running locally.

## Workflow

### Phase 1: Structure

- arrange–act–assert per test; setup via fixtures (`test.use`, `beforeEach`), not copy-pasted blocks
- page objects or screenplay only when the same flow repeats in many tests (`designing-test-automation-architecture`)

### Phase 2: Write the test

Work through `./resources/playwright-practices-checklist.md`:

- locator: user-facing role/label/text; `data-testid` only when nothing user-facing exists
- action then auto-waiting assertion; no `waitForTimeout`, no manual `waitForSelector` unless asserting absence
- assertions on visible outcome with `expect(...).toBeVisible()/toHaveText()/toHaveCount()` etc.
- soft assertions only where multiple independent checks belong to one behaviour; otherwise hard assertions

### Phase 3: Make it deterministic

- unique test data per run; cleanup in teardown
- auth via a setup project with `storageState` (`testing-auth-flows`), not login in every test
- network/third-party calls stubbed where they are not the subject (`mocking-network-and-time`)
- fixed viewport where layout matters; reduced motion if animations interfere

### Phase 4: Review and stabilize

- run the file 10× locally and in CI — a flake is a defect (`stabilizing-flaky-tests`), not a retry policy
- audit the file against `unslop-tests`; fix findings before merge

## Resource Map

- `./resources/playwright-practices-checklist.md` - the per-test review checklist: locators, waits, assertions, isolation, evidence. Read during Phases 2–4.

## Related Skills

- `unslop-tests` - the audit that flags weak/brittle test code
- `stabilizing-flaky-tests` - diagnosing intermittent UI failures by root cause
- `designing-test-automation-architecture` - where UI tests sit, page objects vs helpers
- `testing-auth-flows` - storageState and login-once setup
- `mocking-network-and-time` - stubbing and fake clocks in UI tests
- `test-reports-and-artifacts` - trace/video/screenshot on failure
- `bootstrap-test-suite` - first green Playwright setup

## Definition of Done

This skill is complete when:

- every new/reviewed test uses user-facing locators and auto-waiting assertions — zero `waitForTimeout`
- one behaviour per test; setup in fixtures; unique data per test
- trace/screenshot on failure configured
- the file passes 10 consecutive local + CI runs
- `unslop-tests` audit of the file is clean
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
