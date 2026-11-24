---
name: migrate-tests-to-playwright
description: "Migrates UI tests from Cypress, Selenium, Puppeteer, or Protractor to Playwright Test while preserving what each test verifies: translates idioms instead of lines, runs both suites where possible, and reports a migration status per test. Use when moving a suite or part of one to Playwright. To restructure tests that are already in Playwright, use the refactor-to-page-objects command."
argument-hint: "[sourceScope]"
disable-model-invocation: true
---

# Migrate tests to Playwright

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `sourceScope`: file, folder, or glob of tests to migrate

# Task

If the `migrating-tests-to-playwright` skill is installed, load it before starting.

Your goal is to migrate the tests in <sourceScope> to Playwright with `@playwright/test`, without losing what the original tests verified.

Ask only for missing essentials:

- the source scope, if not provided
- whether to migrate incrementally (both suites coexist) or replace outright
- the target location for migrated tests, if a Playwright setup does not already exist

Then do the following:

1. Inventory the source tests: what each one verifies, shared commands/helpers, custom waits, fixtures, and configuration (base URL, viewports, retries).
2. Set up or reuse Playwright scaffolding: `playwright.config.ts` with `baseURL`, `trace: 'on-first-retry'`, CI-aware `retries` and `forbidOnly`; do not duplicate an existing setup.
3. Translate idiomatically - never line-by-line:
   - selector chains and `cy.get`/`findElement` calls become user-facing locators (`getByRole`, `getByLabel`, `getByTestId` as fallback)
   - implicit waits, `cy.wait(ms)`, and `sleep` calls become web-first assertions or waits on concrete conditions
   - custom commands and helper classes become fixtures or page objects following existing project patterns
   - request stubs (`cy.intercept`) become `page.route()` mocks
   - assertions map to Playwright `expect`, preserving the exact behavior each original assertion checked
4. Run each migrated test. If it fails, fix the translation and rerun, up to 3 attempts per test; then mark it blocked with the last error and move on. Where the environment allows, run the original test too and compare what they verify.
5. Produce a migration report: per source test - migrated & passing, migrated with noted differences, or blocked (and why). List source-suite behaviors that have no Playwright equivalent and how you handled them.

# Guardrails

- Coverage parity over speed: a migrated test that silently checks less than the original is a regression, not progress.
- Do not delete source tests unless I explicitly ask; migration and cleanup are separate steps.
- Report honestly which migrated tests were executed and which could not run in this environment.
- Never use `waitForTimeout` as a translation of `cy.wait(ms)` or `sleep`, and never add retries to get a migrated test green.

## Related Skills

- `migrating-tests-to-playwright` - the full staged-migration skill with parity gates; use it for real migrations, this command for a quick start
- `designing-test-automation-architecture` - layer placement decisions before translating files
- `bootstrap-test-suite` - when the target repo has no Playwright setup yet

## Definition of Done

- translated tests preserve what each original test verified
- parity shown: old and new run on the same build, same pass set
- old files removed only after their slice passed parity
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
