---
name: designing-test-automation-architecture
description: Load this skill when deciding the target shape of a test suite before it grows — which behavior is tested at which layer, folder and project layout, fixtures vs page objects vs helpers, test data and auth strategy, multi-environment config, tag taxonomy, and ownership, with each significant choice recorded as a decision record. Use when starting a new suite, before a migration translates its first file, when a suite has grown inconsistent, when E2E tests are doing unit/API work, or when the team argues about page objects, folder layout, or shared accounts. Complements the playwright-architecture knowledge entry (concrete qa-tools layout). Adapted from jaktestowac/awesome-agents-for-quality.
user-invocable: true
---

# 🏗️ Designing Test Automation Architecture

Suites rarely fail because of one bad test. They fail because nobody decided where a test belongs — so every behavior goes through the browser; shared accounts make parallelism impossible; page objects grew into a second application; one tag means three things. These are architecture decisions: cheap on day one, expensive at test five hundred.

Output: a short set of **decision records** (choice + reason + rejected alternatives + reversal condition) plus a skeleton the team can start writing into.

## 🚫 When NOT to use

- the shape is settled and needs documenting for new readers → write it into project docs / knowledge
- migrating an existing Cypress/Selenium suite → follow `playwright-test-writing` migration guidance, using this skill for the target shape
- CI layout (triggers, shards, caching) → `ci-cd-pipelines`; this skill defines the tags/projects CI selects on

## 🧭 Operating principles

- **Lowest layer that can prove it.** Business rules → unit tests; contracts/permissions → API tests; rendering/widgets → component tests; cross-page journeys → E2E. The E2E layer stays thin — it covers only what only it can see.
- **Isolation is architectural.** Parallelism is decided by the data and auth strategy, not by individual test authors.
- **One way to do each thing.** One place for setup/teardown (fixtures), one UI-interaction pattern, one meaning per tag.
- **Shape follows the team.** Name the owners first: a suite owned by 3 QA engineers vs one every developer writes into need different abstraction levels.
- **Start small, promote on repetition.** Inline → helper when repeated → page object/fixture per the promotion rule. Abstraction ahead of need is the most common design debt.

## 🔁 Workflow

### 1️⃣ Phase 0 — gather context

App architecture (frontend framework, backend services, owned vs consumed), existing tests per layer (runner, count, runtime), environments (local / ephemeral per PR / staging; who controls data), owners, and the trigger (new suite / migration / inconsistency). If nobody can say who owns the suite — that is the first decision record.

### 2️⃣ Phase 1 — place behavior on layers

Per feature area, decide the layer per behavior: unit / API / component / E2E. Flag existing E2E tests that belong lower (validation messages, permission matrices, calculation edge cases) as push-down candidates. Don't prescribe a pyramid ratio — per-behavior placement is the decision.

### 3️⃣ Phase 2 — choose reuse patterns

- **fixtures** (`test.extend`) for anything with a lifecycle: auth state, API clients, created test data, page objects needing setup
- **page objects** only for pages/components reused across several files; intent-level methods + locators; assertions stay in tests (unless a reusable check like `expectLoaded()`)
- **helpers** for stateless utilities: data builders, formatters
- **screenplay** only when many actors/roles/interfaces (UI, API, email) share tasks and the team will maintain the layer

Record what each layer may and may not contain.

### 4️⃣ Phase 3 — test data & auth (decides parallelism)

- each test creates what it needs via API or seeding fixture, tears it down (`afterEach`); shared reference data is read-only — see `test-data-management`
- uniqueness: generated values include a per-test unique part; per-worker resources keyed by worker/shard
- auth: log in once per role in a setup project, save `storageState` to gitignored `.auth/`, reuse via projects/fixtures; per-worker accounts when tests mutate account state
- mocking boundary: your own backend stays real in E2E; third parties stubbed — see `mocking`
- sensitive data: synthetic by default

### 5️⃣ Phase 4 — folders, config, environments, tags

qa-tools reference layout (see also `playwright-architecture` knowledge):

```
tests/
├── e2e/            # *.spec.ts — cross-page journeys
├── api/            # *.spec.ts — Playwright request
├── fixtures/       # auth.fixture.ts, test-data.fixture.ts
├── pages/          # Page Object Model (base.page.ts + per-page)
├── helpers/        # stateless utilities
└── playwright.config.ts   # projects per browser/device/role, env via .env
```

Decide: naming (`should <result> when <condition>`), selectors (`getByRole`/`getByLabel` first), assertions only via `expect()` (never `waitForTimeout`), projects per browser/device/role/setup, environments via env vars (`.env`, never committed secrets), and the tag taxonomy CI shards on (`@smoke`, `@regression`, …).

### 6️⃣ Phase 5 — record decisions & skeleton

- one decision record per significant choice: decision, reason, alternatives rejected, reversal condition (e.g. "if E2E runtime > 15 min on CI, push validation cases down to API")
- a minimal skeleton: config, one fixture, one page object, one e2e + one api spec proving the shape works

## 🚨 Red flags

- E2E suite testing business rules that a unit test could prove in milliseconds
- shared mutable account/data → tests serialized (`--workers=1`) to "fix" flakiness
- page objects containing assertions or business logic
- two patterns for the same thing (fixtures AND manual setup in tests)
- tags with overlapping meanings; no owner named for the suite
- decisions made verbally, not recorded

## 🔗 Related skills

- `playwright-test-writing` — writing tests within the chosen shape
- `test-data-management` — the values themselves; this skill decides the mechanism
- `mocking` — where the stub boundary sits
- `ci-cd-pipelines` — sharding/selection on the tags defined here
- `stabilizing-flaky-tests` — when isolation decisions were wrong

## ✅ Checklist

- [ ] Owners named; context gathered (app arch, existing tests, environments)
- [ ] Layer per behavior decided; E2E push-down candidates listed
- [ ] Reuse pattern per layer decided (fixtures / page objects / helpers) + what each may contain
- [ ] Data & auth strategy decided → parallelism possible without shared mutable state
- [ ] Folder layout, naming, selectors, assertion rules, projects, env config, tags defined
- [ ] Decision records written (choice + reason + alternatives + reversal condition)
- [ ] Skeleton (config + fixture + one POM + one e2e + one api spec) runs green in CI
