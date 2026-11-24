---
name: test-generator
description: Generates automated tests for the cases in a written test plan file, in the project's existing framework and conventions, runs them, and reports which pass, which fail, and which could not run. Use when a plan from create-test-plan, test-plan-basic, or manual-test-cases is ready to automate. To generate one test from a scenario description by walking it live first, use the playwright-generate-test command.
argument-hint: "[testPlanPath]"
disable-model-invocation: true
---

# Generate tests based on test plan

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `testPlanPath`: path to the test plan file (default: .qa/test-plan.md)

# Task

If you have a single scenario in words and a running app, use the `playwright-generate-test` command instead.

Generate automated tests for the test cases in <testPlanPath>.

## Before writing code

1. Read the plan. If no path was given, look for `.qa/test-plan.md` or `.qa/basic-test-plan.md`; if neither exists, ask for the path and stop until you have it.
2. Identify the framework from the project (`playwright.config.ts`, `cypress.config.*`, WebdriverIO or Selenium setup), plus the test folder, naming, fixtures, page objects, auth setup, and helpers. If there is no test framework, ask whether to set up Playwright Test before continuing.
3. Choose the cases to automate: those marked as automation candidates, or P1 cases if the plan has no such marking. If that is more than about 15 cases, show me the list and confirm before writing. List the cases you skip and why (manual-only, needs data you lack, unclear expected result).

## Writing the tests

- Follow the project's existing structure, naming, fixtures, and helpers; do not add a parallel structure.
- Each test is independent and sets up its own state and data.
- Assertions check the expected result stated in the plan, not just navigation.
- Use the framework's waiting and assertion mechanisms; in Playwright, user-facing locators (`getByRole`, `getByLabel`, `getByTestId` as fallback) and web-first assertions (`await expect(locator).toBeVisible()`), never `waitForTimeout` or sleeps.
- No hardcoded credentials or environment URLs: use existing config (`baseURL`, `storageState`) or environment variables.
- Put the plan's case ID in each test title (e.g. `test('CHK-003 rejects an expired card', …)`) for traceability.
- When the plan's expected result is ambiguous, write the test for the clear part and list the question; do not invent the rule.

## Run and fix

Run the generated tests. For each failure, decide whether it is a test bug or an app defect:

- test bug: fix and rerun, up to 3 attempts per test
- app defect, or still failing after 3 attempts: leave the test failing (or mark it with the framework's `fixme` annotation and a comment naming the defect, if I agree) and report it

## Output

- files created or changed
- a table: `Case ID | Test file | Status (passed / failed: app defect / failed: unresolved / not run) | Notes`
- cases skipped from the plan, with reasons
- open questions about the plan
- the command to run the new tests

## Guardrails

- Run tests only against environments you are authorized to use.
- Never weaken assertions, add retries, raise timeouts, or skip tests to get a green run.
- Report exactly which tests ran and passed. Never present unexecuted tests as verified.

## Related Skills

- `playwright-generate-test` - one scenario at a time, verified live in the browser first
- `designing-functional-tests` (qa-core) - where the written plan file comes from
- `automation-backlog-planner` (agent, qa-core) - deciding which plan cases get generated first
- `bootstrap-test-suite` - when the repo has no test framework yet

## Definition of Done

- generated tests follow the repo's existing framework and conventions - no second runner or client introduced
- tests were run and the result is quoted
- coverage against the plan file is stated: which cases generated, which skipped and why
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
