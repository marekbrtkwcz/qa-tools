---
name: self-healing-locators
description: 'Designs and implements resilient, self-healing selectors for Playwright and other UI test suites: fallback chains, role-based and label-based locators over CSS/XPath, AI-assisted locator repair when the UI changes, and a drift-detection loop that reports broken selectors before they become flaky failures. Use when selectors break after UI changes, when tests are flaky due to brittle locators, when adopting accessibility-first selector strategy, or when a suite needs to survive frontend refactors. For fixing individual failing tests, use diagnosing-test-failures; for stabilizing intermittent failures in general, use stabilizing-flaky-tests.'
argument-hint: 'Test suite path, framework in use (Playwright default), and examples of broken or brittle selectors'
user-invocable: true
---

# Self-Healing Locators

Brittle selectors are the most common cause of flaky UI tests. A CSS class renamed in a refactor, a reordered DOM, a dynamic ID prefix — each breaks tests that should still be valid. This skill replaces single-point selectors with resilient locator strategies that survive UI changes and heal themselves when they break.

## When to Use

- Selectors break frequently after frontend changes
- Tests are flaky specifically due to "element not found" errors
- Adopting an accessibility-first selector strategy (role, label, test-id over CSS/XPath)
- A suite needs to survive refactors without constant locator maintenance
- Exploring whether AI-assisted locator repair is worth it for this suite

## When NOT to Use

- A single test fails for a non-selector reason — use `diagnosing-test-failures`
- General flakiness from timing, network, or shared state — use `stabilizing-flaky-tests`
- The suite has no tests yet — use `bootstrap-test-suite`

## Selector Priority Hierarchy

Replace CSS/XPath locators with this priority order (top first):

| Priority | Strategy | Example (Playwright) | Why |
|---|---|---|---|
| 1 | `data-testid` attribute | `page.getByTestId('submit-btn')` | Explicitly for tests, stable across refactors |
| 2 | ARIA role + accessible name | `page.getByRole('button', { name: 'Submit' })` | Mirrors how users and screen readers find elements |
| 3 | Label text | `page.getByLabel('Email address')` | Stable, user-meaningful |
| 4 | Placeholder / text content | `page.getByPlaceholder('Search...')` | When no better anchor exists |
| 5 | CSS/XPath | `page.locator('.btn.primary')` | Last resort — brittle by nature |

## Workflow

### 1. Audit current selectors

- Scan the suite for `locator('.`, `locator('#`, `locator('//`, `nth(`, `css=` patterns
- Classify each: test-id / role / label / structural (CSS/XPath)
- Report the ratio of structural selectors — above 30% means high maintenance cost
- Done when: every selector in scope is categorized and the brittle count is known

### 2. Build a fallback chain per critical locator

For each high-value locator (used in many tests or on critical paths), define a chain:

```typescript
async function findSubmitButton(page: Page) {
  const candidates = [
    () => page.getByTestId('submit-btn'),
    () => page.getByRole('button', { name: /submit|save/i }),
    () => page.getByText(/submit|save/i).last(),
  ];
  for (const candidate of candidates) {
    const locator = candidate();
    if (await locator.count() > 0) return locator.first();
  }
  throw new Error('Submit button not found by any strategy');
}
```

- Done when: every critical locator has at least 2 fallback strategies

### 3. Add drift detection

- Run the suite and log every "strict mode violation" (multiple matches) and "element not found" that was resolved by a fallback
- In CI, fail loudly on fallback usage in critical-path tests — a fallback firing means the primary selector drifted
- Report drift weekly so selectors are updated at the source, not just papered over
- Done when: fallback usage is visible in test output or CI logs

### 4. AI-assisted repair (optional, for large suites)

When a selector breaks and no fallback matches:

1. Capture the page snapshot / HTML around the failure (`page.content()`)
2. Send the target element description + HTML snippet to an LLM: "find the locator for the 'Save' button in this HTML, preferring role-based selectors"
3. Validate the suggested locator against the live page before accepting it
4. Record the repair in a `locator-repairs.log` so a human can update the source test-id
- Done when: every AI-suggested locator is validated against the live page before use

### 5. Validate

- Run the full suite: `npx playwright test`
- Simulate a UI change (rename a CSS class locally) and confirm tests still pass via fallback
- Done when: suite is green, and a simulated refactor does not break critical-path tests

## Output

- Updated locators following the priority hierarchy
- Fallback chain helpers in a shared `locators/` or `helpers/` module
- Drift-detection logging wired into test output
- A short report: brittle selector count before/after, fallback coverage, AI-repair log (if used)

## Resource Map

- `resources/selector-patterns.md`: copy-paste fallback chain patterns, Playwright locator cheat sheet, anti-patterns (nth, parent-child CSS chains)

## Related Skills

- `writing-playwright-tests-best-practices` — selector strategy as part of overall test quality
- `stabilizing-flaky-tests` — when failures are intermittent, not locator-related
- `diagnosing-test-failures` — when a specific test fails
- `bootstrap-test-suite` — to set the right selector convention from day one

## Definition of Done

- Structural (CSS/XPath) selectors reduced below 30% in the audited scope
- Every critical-path locator has a fallback chain
- Fallback usage is logged and visible in CI
- Suite passes after a simulated UI refactor on critical paths
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
