---
name: migrating-tests-to-playwright
description: 'Migrates Cypress, Selenium, WebdriverIO, or Protractor suites to Playwright in staged vertical slices, each with a parity gate (including a deliberate-break check) before the old tests are deleted. Use when porting a legacy browser suite, when a half-finished migration has stalled with two suites running in parallel, when deciding which tests are not worth porting, or when a migration needs a plan before anyone starts translating files. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🚚 Migrating Tests to Playwright

The characteristic failure of a migration is not a hard translation problem. It is a migration that stalls at 60%, leaving two suites, two CI jobs, two sets of conventions — and nobody willing to delete the old one because nobody can prove the new one covers the same ground. Everything here prevents that: **slices with parity gates, and a deletion at the end of every slice.**

Second thing this skill insists on: a migration is the cheapest opportunity you will ever get to not port the tests that should not exist. A line-by-line translation preserves the old suite's flakiness, weak assertions, and coverage gaps — and adds migration risk on top.

## 🎯 When to Use

- a Cypress, Selenium, WebdriverIO, or Protractor suite is moving to Playwright
- a migration is underway and stalled with both suites running
- someone is about to start translating files with no plan
- the question is which tests to port and which to drop
- a framework evaluation needs a migration-cost estimate

## 🧭 Operating Principles

- **Slices, not a big bang.** Migrate a vertical slice, prove parity, delete the old tests in that slice, then move on. Two suites is a temporary state with a deadline, not a phase.
- **Every slice ends with a deletion.** Without it the old suite survives forever and the migration is never done.
- **Port behaviour, not code.** The old test's intent is the requirement; its implementation is not.
- **Triage before translating.** Flaky, redundant, or vacuous tests get dropped or rewritten, not carried over.
- **Parity is measured, not asserted.** A slice is done when the new tests fail on the defects the old ones caught.
- **Adopt Playwright's model, don't emulate the old one.** A Cypress-shaped Playwright suite pays the migration cost and gets none of the benefit.

## 📋 Phase 0: Inventory and Triage

Done when every source test has a class — translation starts after that.

| Class | Signal | Action |
| --- | --- | --- |
| **Port** | Covers real risk, passes reliably, meaningful assertions | Migrate |
| **Rewrite** | Covers real risk, but flaky, over-mocked, or asserts nothing | Migrate the intent, write the test fresh |
| **Merge** | Duplicates another test's coverage | Fold into one |
| **Drop** | Tests a removed feature, proves nothing, or is permanently skipped | Delete, with a note |
| **Defer** | Real coverage, low risk, expensive to port | Backlog — and say so out loud |

Record the counts: "porting 140 tests" and "porting 90, rewriting 20, dropping 30" are different projects with different estimates. Run `unslop-tests` over the source suite so drop/rewrite decisions are made on evidence, not impression — a suite where 30% of tests pass with the feature deleted should be rewritten, not ported.

## 🏗️ Phase 1: Establish the Target Shape

Decide the Playwright conventions **before** the first file, or the first ten files set them accidentally: fixtures vs page objects, auth strategy (`storageState` once, not a login per test), data strategy (API seeding with teardown), what stays real vs stubbed, tags/projects, folder layout. Use `designing-test-automation-architecture` and record the decisions — in eight months someone will ask why the migration did not keep the old page objects.

## 🍰 Phase 2: Slice the Work

A slice is a **vertical journey**, not a directory. "Checkout" is a slice; "all tests in `specs/forms/`" is not. Order: (1) a thin slice first — 2–3 tests proving toolchain, CI, reporting, auth end to end; (2) highest risk next; (3) most flaky after that — the rewrite pays back immediately; (4) the rest, by cohesion. For each slice record: source tests, target tests, parity evidence, deletion commit.

## ✍️ Phase 3: Translate

Rules while translating:

- **Take the assertion, question the mechanics.** Selectors, waits, helper chains are the old framework's shape.
- **Waits become web-first assertions.** Explicit sleeps and manual wait helpers are replaced by an assertion on the condition they waited for — the single largest quality gain in the migration. Never port `waitForTimeout`/`sleep`/polling loops.
- **Selectors become role/label locators** (`getByRole`, `getByLabel`, `getByTestId` fallback). A brittle CSS/XPath chain is re-targeted, not copied; if there is no accessible name to target, that is an accessibility finding.
- **Custom commands are re-homed by what they do** — often a fixture, sometimes a helper, occasionally three things that should be split.
- **Write native Playwright, no compatibility layer.** A `cy.*`-shaped wrapper over Playwright keeps the old model and adds an abstraction nobody understands.

Key construct mappings (full tables in the source repo's resources):

| Cypress | Playwright |
| --- | --- |
| `cy.get('.btn-primary')` | `page.getByRole('button', { name: 'Save' })` — port intent, not CSS |
| `cy.get('[data-cy=submit]')` | `page.getByTestId('submit')` (or `testIdAttribute: 'data-cy'`) |
| `cy.get('input#email')` | `page.getByLabel('Email')` — no label = a11y finding |
| `.type('x')` / `.clear().type('x')` | `.fill('x')` (`.pressSequentially` when key events matter) |
| `.select('X')` | `.selectOption({ label: 'X' })` |
| `.should('be.visible')` | `await expect(loc).toBeVisible()` — `expect` retries like `should`, the `await` is the only real change |
| `.should('have.text','x')` | `await expect(loc).toHaveText('x')` |
| `cy.url().should('include','/c')` | `await expect(page).toHaveURL(/\/c/)` |
| `cy.wait(2000)` | **delete** — web-first assertions already wait |
| `cy.wait('@getUsers')` | start `page.waitForResponse('**/api/users')` **before** the triggering action (it only sees later responses), or better: assert on the resulting UI |
| `cy.intercept('GET','/api/u',{fixture})` | `page.route('**/api/u', r => r.fulfill({ path: 'fixtures/u.json' }))` |
| `cy.request('POST','/api/seed',b)` | `await request.post('/api/seed', { data: b })` |

| Selenium / WebdriverIO | Playwright |
| --- | --- |
| `driver.findElement(By.css('.btn'))` | `page.getByRole(...)` preferred over `page.locator('.btn')` |
| `By.xpath("//button[text()='Save']")` | `page.getByRole('button', { name: 'Save' })` — XPath chains encode DOM structure; a clear signal the test is worth **rewriting**, not porting |
| `element.sendKeys('x')` | `locator.fill('x')` |
| `new Select(el).selectByVisibleText('X')` | `locator.selectOption({ label: 'X' })` |
| `new Actions(driver).dragAndDrop(a,b)` | `a.dragTo(b)` |
| `driver.switchTo().frame(el)` | `page.frameLocator('#frame').getByRole(...)` |
| `driver.switchTo().alert().accept()` | `page.on('dialog', d => d.accept())` registered before the trigger |
| `driver.switchTo().window(handles[1])` | `context.waitForEvent('page')` |
| `Thread.sleep(2000)` / `driver.sleep(2000)` / `browser.pause(1000)` | **delete** |
| `new WebDriverWait(...).until(visibilityOf(el))` | `await expect(loc).toBeVisible()` |
| `until(elementToBeClickable(el))` | not needed — `locator.click()` waits for actionability |
| `driver.manage().timeouts().implicitlyWait(...)` | `expect.timeout` in config |
| custom `waitForPageLoad()` helper | **delete** — actions and assertions wait |
| retry loop around a flaky click | **delete** — if it still needs one, that is a product defect to report |
| `el.waitForDisplayed()` (WebdriverIO) | `await expect(loc).toBeVisible()` |

## ⚖️ Phase 4: Prove Parity

The gate that makes deletion safe, per slice:

- every ported test's intent maps to at least one new test, recorded in a mapping table
- the new tests run green **three consecutive times**
- **for at least the slice's highest-risk cases, the new test fails when the behaviour is deliberately broken** — break it, watch, quote the output. A test that has never failed is a test whose value is unmeasured
- new suite runtime and flake rate recorded
- coverage the slice deliberately dropped is listed explicitly

Without the deliberate-break check, parity means "both suites are green" — which is compatible with the new suite testing nothing.

## 🗑️ Phase 5: Delete

Same pull request as the parity evidence, or the next one. Not "later": delete the slice's source tests, remove the old framework's config for that area, update CI so the old job stops running them, update the README coverage section. When the last slice lands: remove the source framework from `package.json`, its config, plugins, and CI job. A leftover dependency gets updated by a bot forever.

## 📈 Phase 6: Track and Report

Keep the plan visible: slices done/in-progress/remaining; tests ported/rewritten/merged/dropped/deferred; runtime and flake rate old vs new; the one list of deliberately dropped coverage; honest projected finish date. A stalled migration is usually a migration nobody was reporting on.

## ⚠️ Common Failure Modes

Translating file-by-file alphabetically (highest-risk coverage moves last); porting flaky tests unchanged; a wrapper making Playwright behave like the old framework; dropping coverage silently; migrating without deciding the target architecture first.

## 🚩 Red Flags

- A ported test containing `waitForTimeout`, `sleep`, or a polling helper.
- CSS chains or XPath copied verbatim from the source test.
- A helper whose API mirrors `cy.*` or WebDriver calls.
- A slice marked done with no deletion commit for its source tests.
- A parity claim with green runs only — no quoted failure on deliberately broken behaviour.
- Fewer source tests deleted/ported than the inventory classified, with no entry in the dropped-coverage list.
- The source framework still in `package.json` or CI after the final slice.

## ✅ Definition of Done

- the inventory classifies every source test (port/rewrite/merge/drop/defer), counts sum to the suite total
- the target-architecture decision record exists at a stated path and predates the first translated file
- the slice plan lists vertical journeys: thin proving slice first, highest-risk second
- a quoted search of the new suite finds no fixed waits, copied CSS/XPath chains, or old-framework wrappers
- each slice has an intent→test mapping table, three consecutive green runs, and a quoted failure of its highest-risk tests on deliberately broken behaviour
- each slice links the commit/PR that deleted its source tests
- dropped coverage is listed in one place, one line per dropped test with the reason
- after the last slice, the source framework, its config, and its CI job are gone from the repository

## 🔗 Related Skills

- `designing-test-automation-architecture` — decide the target shape before the first file
- `unslop-tests` — triage the source suite so weak tests are rewritten, not ported
- `playwright-test-writing` — how the ported tests should be written
- `mocking` — re-expressing the source suite's intercepts/stubs (`page.route`, MSW)
- `stabilizing-flaky-tests` — for tests classified as rewrite because of flakiness
- `ci-cd-pipelines` — the CI transition and running both suites during the overlap
- `qa-best-practices` — documenting the migration decision and new conventions
