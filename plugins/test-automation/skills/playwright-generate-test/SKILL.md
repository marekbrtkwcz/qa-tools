---
name: playwright-generate-test
description: Generates a Playwright Test (TypeScript) spec from a scenario description by first walking through the scenario live with Playwright MCP, then running the generated test until it passes. Use when you have one scenario in words and a running app, and want a test grounded in the real UI rather than guessed locators. To generate tests for a whole written test plan file, use the test-generator command.
argument-hint: "[scenario]"
disable-model-invocation: true
---

# Generate tests based on a scenario using Playwright MCP

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `scenario`: the scenario to automate, e.g. 'a guest adds a product to the cart and sees the updated total'

# Task

If you have a whole written test plan to automate, use the `test-generator` command instead.

Generate a Playwright TypeScript test with `@playwright/test` for this scenario: <scenario>

If no scenario is provided, or it does not say what outcome to check, ask for it and stop until you have it. If the app URL is not in the project config (`baseURL`) or the scenario, ask for it.

## Steps

1. **Break the scenario into user steps**, each with the outcome that proves it worked. Show me the list.
2. **Walk through it live.** Execute each step in order with the Playwright MCP tools and confirm its outcome before moving on. Note the user-facing locator for every element you touch. If a step cannot be completed, stop and report where and why; do not write code for a flow you could not run.
3. **Read the project's setup**: `playwright.config.ts`, existing fixtures, page objects, auth setup (`storageState`), naming, and test folder. Match them.
4. **Write the test**:
   - user-facing locators first (`getByRole`, `getByLabel`, `getByText`); `getByTestId` as a fallback; narrow multiple matches with `.filter()` or chaining, not `nth-child` CSS
   - web-first assertions (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`); never `waitForTimeout` or manual sleeps; when waiting on a response, start `page.waitForResponse` before the action that triggers it
   - assert the meaningful outcome (content, state change), not only the URL
   - the test sets up its own state and does not depend on other tests or leftover data
   - group steps with `test.step()` so the report reads like the scenario
   - tags in the title (`@smoke`, `@regression`) only if the project uses them
   - no hardcoded credentials or secrets: environment variables or existing fixtures
5. **Save** the spec in the project's test folder (the `testDir` from the config, or `tests/` if none), named after the feature, e.g. `tests/cart/add-to-cart.spec.ts`.
6. **Run it** (`npx playwright test <file>`). If it fails, fix the test and rerun, up to 3 attempts. If it still fails, or the failure looks like an app defect, stop and report the error and your diagnosis instead of bending the test to pass.

## Output

- the final test file path and its contents
- the run result: passed, or failed with the last error
- any assumptions you made (test data, roles, environment)

## Guardrails

- Run only against apps you are authorized to test, and ask before steps that create real orders, payments, or messages outside a test environment.
- Never make the test pass by weakening assertions, adding retries, raising timeouts, or skipping steps.
- Present only executed tests as verified.

## Related Skills

- `designing-functional-tests` (qa-core) - where the scenario to generate comes from: a designed, reviewable case, not an ad-hoc prompt
- `automation-backlog-planner` (agent, qa-core) - decides whether this scenario belongs in the automated suite at all, and at what priority
- `test-generator` - the batch form: generates a whole suite from a written plan file such as the approved scenario list

## Definition of Done

- the generated test was executed and is green, output quoted
- assertions were not weakened to make it pass; no retries or raised timeouts added
- the source scenario is stated (from which plan or exploration note)
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
