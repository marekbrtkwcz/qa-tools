---
name: robot-framework-automation
description: "Writes and runs Robot Framework suites: keyword-driven .robot files, Resources as the reuse unit, tags routing smoke vs regression, setup/teardown, data-driven templates, Browser Library (Playwright-backed) and SeleniumLibrary, Robocop for static analysis, and pabot parallel runs merged by rebot for CI gates. Use for keyword-driven or acceptance-style automation, an inherited .robot codebase, or when the team simply says 'robot'. For porting these conventions to pytest/JUnit/NUnit use port-suite-to-python-java; a whole-suite move to Playwright goes through migrating-tests-to-playwright."
argument-hint: "The app under test, the suite or resource files to work on, and the browser library in use"
user-invocable: true
---

# Robot Framework Automation

Robot Framework is keyword-driven automation: test cases read like sentences, and the sentences are keywords — the layer that plays the role page objects and helpers play elsewhere. This skill keeps discipline the collection already enforces (selectors, tags routing suites, teardown that cleans, lint/format gates) and maps it onto the Robot way of working.

## When to Use

- the team asks for keyword-driven or acceptance-style automation ("make it in robot")
- an inherited `.robot` codebase must be maintained, stabilized, or brought under CI
- a Python shop wants automation its product people can read and review
- an RF suite must be split for pabot parallelism, or linted like the rest of the repo

## Suite anatomy

A `.robot` file has four sections, always in this order:

```robotframework
*** Settings ***
Documentation     Checkout acceptance flows
Resource          ../resources/login.resource
Library          Browser
Test Setup        Open The Test App
Test Teardown     Close The Test App
Test Tags        regression

*** Variables ***
${URL}            %{APP_URL=https://staging.example.com}
@{BAD_PASSWORDS}    empty    wrongpass

*** Test Cases ***
Valid user can log in
    [Tags]    smoke
    Given a registered user exists
    When the user logs in with valid credentials
    Then the dashboard shows their name

*** Keywords ***
The dashboard shows their name
    Get Text    [data-test=welcome]    ==    Welcome, ${USER_NAME}
```

- **Test cases say WHAT, keywords say HOW.** A case that manipulates waits and selectors inline is a keyword in the wrong place — factor the how into keywords, ideally into a Resource, so other suites can reuse them.
- `Test Tags` is the routing surface (`Force Tags` before RF 6.1). Tags decide what CI runs: `--include smoke` is the deploy gate, `regression` grows by risk — the same contract tags hold elsewhere in this collection.
- `[Setup]`/`[Teardown]` are fixture and cleanup; **teardown runs even when the test fails**, so cleanup lives there, not at the end of the test body.
- `[Template]` turns one test case into a data-driven table — one keyword, many argument rows, one verdict per row. Prefer this over copy-pasted near-identical cases.
- Given/When/Then prefixes are **documentation sugar**: RF strips them while resolving keyword names. They aid review; they do not create BDD semantics — the assertions inside the keywords do that.
- Environment goes through `%{APP_URL}` (environment variable) or `--variable URL:...` — never hardcoded into the case.

## Resources are the reuse unit

Keywords live in `.resource` files and are imported once per suite. Treat a resource like a page object layer: named after a capability, owning its selectors.

```robotframework
*** Settings ***
Documentation     Login capability: credentials, session, lockout
Library           Browser

*** Keywords ***
The user logs in with valid credentials
    Open The Test App
    Fill Text    id=email    ${USER.email}
    Fill Text    id=password    ${USER.password}
    Click    id=submit
    Get Text    [data-test=welcome]    contains    Welcome
```

- Selector discipline is unchanged from the rest of the collection: stable `id`/`data-test` first, text as a marked bridge, no deep XPath — see `selector-strategy`. The Browser Library locators accept the same attributes Playwright would.
- One capability = one resource (`login.resource`, `checkout.resource`). Resources that import resources three levels deep are a design smell: flatten.
- Keywords are named after user-visible behaviour ("the user logs in"), not implementation ("click login button") — the name is the contract; the selector is an implementation detail it must survive.

## Browser Library vs SeleniumLibrary

- **Browser Library** (Playwright-backed) is the default for new work: real auto-waiting, rich getter keywords with built-in assertions (`Get Text ... == ...` fails the test when text differs — an explicit `Should Be Equal` next to it is redundant), interception (`Get Request`/`Wait For Request` when an API call follows the click — pair with `mocking-network-and-time` habits).
- **SeleniumLibrary** is for inherited suites and Selenium Grid realities. Do not rewrite a stable Selenium suite to Browser "while we're in there" — that is `migrating-tests-to-playwright` territory with a parity gate, decided deliberately, not as a drive-by.
- Both capture page screenshots on failure by default; the log bundles them. The CI artifact set is `output.xml`, `log.html`, `report.html`.

## Running

```bash
robot tests/                          # everything
robot --include smoke tests/          # the deploy gate shape
robot --exclude wip tests/            # quarantine without deleting cases
robot --dryrun tests/                 # parse + resolve names, no actions: cheap syntax gate
robot --outputdir results tests/
```

- Exit code is non-zero on any failure — the CI gate needs nothing on top.
- **Robocop / Robotidy are this world's lint/format pair** — same job as Biome does for the JS/TS suites in this collection: naming rules, complexity caps, missing documentation, formatting. Wire `robocop` and `robotidy --check` into the pipeline the way `static-code-analysis-typescript` wires Biome.
- **pabot** parallelizes across processes — but granularity is the SUITE (it splits by file/directory), so one mega-suite parallelizes nowhere: split suites by capability first, then `pabot --processes 4 tests/`. Merge the per-process outputs with `rebot --output output.xml output-*.xml` (and `rebot` also produces the shared HTML report/logs). `--pabotlib` gives suite-level locks when suites share state — prefer isolation-first per `ensuring-test-isolation` over locking.
- JUnit for CI test tabs: RF 7 emits JUnit XML natively; older RF uses a `robotframework-junitxml` listener — check the installed version before promising it in a pipeline.
- Keywords are Python underneath (`python-for-testers`): custom keywords in a plain Python library class beat tortured `${}` scripting for anything beyond a few lines. JSR-style `Evaluate` chains are a smell.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "RF is our BDD framework" | Prefixes are stripped sugar; collaboration value is in reviewable case text. | Keep the Given/When/Then wording, but make keywords assert for real; actual BDD-process skills stay with `implementing-bdd-tests`. |
| "All tests in one suite file" | pabot has nothing to parallelize; a failure reruns everything. | Suite per capability; tags route the subsets CI runs. |
| "Keywords are self-documenting" | `Click Element ui-id-5` documents 2021's DOM. | Name keywords after user-visible behaviour; selectors live in the keyword body only. |
| "We'll add cleanup later" | Next run fails on leftover state. | `[Teardown]` where any state persists; teardown runs even on failure. |
| "Replace Selenium with Browser real quick" | Stable suite, week-long destabilization, no parity gate. | Decide via `migrating-tests-to-playwright` discipline; the quick win is Robocop, not the library swap. |
| "Run the whole robot suite for every commit" | 40-minute E2E replaces where pytest says in seconds. | Pyramid rules hold: smoke tagged for deploy gates, full regression scheduled. |

## Red Flags

- test case bodies longer than a screen — the HOW moved into the case instead of a keyword
- keyword names containing selectors or DOM details
- no tags anywhere, so there is no smoke subset to gate a deploy with
- `Sleep` used as wait — browser libraries auto-wait; a sleep is a race with extra steps
- keywords copy-pasted across suites instead of imported from one resource
- state from a previous run leaks in (no teardown where any data persists)

## Related Skills

- `port-suite-to-python-java` - the same collection conventions mapped onto pytest/JUnit/NUnit
- `migrating-tests-to-playwright` - the deliberate path for a whole-suite move out of RF/Selenium
- `python-for-testers` - custom keywords are Python classes
- `selector-strategy` - selector discipline unchanged between Playwright and Browser Library
- `mocking-network-and-time` - interception and deterministic time apply to Browser Library flows
- `automating-ci-test-pipelines` - pabot sharding, rebot merges, CI artifacts
- `implementing-bdd-tests` - BDD-as-process; RF's Given/When/Then is syntax only
- `unslop-tests` - RF tests pass without proving anything too; getters with assertions are the antidote

## Definition of Done

- cases read as WHAT, keywords as HOW, selectors only inside keyword bodies
- tags route: a smoke subset gates the deploy, regression grows by risk
- teardown covers every state the suite persists; rerun proves no leakage
- `robocop` + `robotidy --check` pass in the pipeline like the JS/TS lint gate
- parallel runs split by suite and merge with rebot into one report; the run commands are quoted real output
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
