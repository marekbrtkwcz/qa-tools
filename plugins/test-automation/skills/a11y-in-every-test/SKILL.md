---
name: a11y-in-every-test
description: 'Embeds automated accessibility checks (axe-core) into every Playwright UI test so a11y regressions fail in CI as test failures, not as a separate audit: inject axe on page load, assert zero critical/serious violations per page or component, scope checks to the region under test, and handle dynamic content. Use when accessibility must be enforced continuously in the test suite rather than audited periodically, when wiring axe into existing Playwright tests, or when deciding which WCAG violations block a test. For a full one-off WCAG audit of a page or flow, use auditing-accessibility.'
argument-hint: 'Playwright test suite path, WCAG level target (A/AA), and whether to check full pages or specific components'
user-invocable: true
---

# Accessibility in Every Test

A periodic a11y audit finds issues weeks after they ship. Embedding axe-core into the existing Playwright suite makes accessibility a CI gate: every test run checks the pages it touches, and a violation fails the build immediately.

## When to Use

- Accessibility must be enforced continuously, not audited once per release
- Existing Playwright suite needs axe-core wired in
- Deciding which WCAG violations should fail a test vs. warn
- Scoping a11y checks to components/regions to avoid noise from third-party widgets

## When NOT to Use

- One-off full WCAG 2.2 audit of a page or flow — use `auditing-accessibility`
- Mobile app accessibility — use `auditing-mobile-accessibility`
- No test suite exists yet — wire this in via `bootstrap-test-suite` conventions first

## Workflow

### 1. Install and create the axe fixture

```bash
npm i -D @axe-core/playwright
```

```typescript
// fixtures/a11y.ts
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend<{ a11y: (options?) => Promise<AxeResults> }>({
  a11y: async ({ page }, use) => {
    await use(async (options = {}) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .options(options)
        .analyze();
      return results;
    });
  },
});
```

### 2. Decide the assertion policy

| Severity | CI behavior | Reason |
|---|---|---|
| critical | ❌ fail the test | blocks users entirely |
| serious | ❌ fail the test | major barrier |
| moderate | ⚠️ warn (annotation) | real issue, not blocking |
| minor | 📝 log only | noise in CI |

```typescript
function assertA11y(results: AxeResults) {
  const blocking = results.violations.filter(v =>
    ['critical', 'serious'].includes(v.impact ?? '')
  );
  expect(blocking, formatViolations(blocking)).toHaveLength(0);
}
```

### 3. Add a11y assertions to tests

```typescript
test('login page is accessible', async ({ page, a11y }) => {
  await page.goto('/login');
  const results = await a11y();
  assertA11y(results);
});

test('checkout form has no critical a11y issues in the payment section', async ({ page, a11y }) => {
  await page.goto('/checkout');
  const results = await a11y({ include: ['#payment-form'] });
  assertA11y(results);
});
```

- Full-page check on key pages (login, checkout, dashboard)
- Scoped check (`.include(selector)`) for components embedded in pages with known third-party noise
- Done when: every critical user journey page has an a11y assertion

### 4. Handle known false positives explicitly

- Third-party widgets (chat, ads, maps) often violate axe rules — exclude with `.exclude()` and record why in a `a11y-baseline.md`
- Never blanket-disable rules (`rules: { 'color-contrast': { enabled: false } }`) — that is the lint-disable antipattern; use `governing-quality-waivers` if a rule must be off
- Done when: every exclusion is documented with a reason and an owner

### 5. Validate

- Run the suite: `npx playwright test`
- Introduce a deliberate a11y defect (remove a label) in a local branch → test must fail
- Done when: suite is green, and a known violation fails the relevant test

## Output

- `fixtures/a11y.ts` with the axe fixture
- a11y assertions in tests covering critical user journeys
- `a11y-baseline.md` documenting scoped exclusions with reasons
- CI run showing a11y checks execute as part of the normal test suite

## Resource Map

- `resources/axe-setup.md`: fixture code, assertion helpers, common axe rule IDs mapped to WCAG criteria, exclusion patterns

## Related Skills

- `auditing-accessibility` — full WCAG 2.2 audit with manual keyboard/screen-reader checks
- `writing-playwright-tests-best-practices` — general test quality alongside a11y
- `governing-quality-waivers` — recording any a11y rule exclusions as waivers

## Definition of Done

- axe fixture exists and is used in tests covering all critical user journeys
- critical/serious violations fail the test; moderate/minor are logged
- A deliberately introduced violation fails the suite
- All exclusions are documented in `a11y-baseline.md`
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
