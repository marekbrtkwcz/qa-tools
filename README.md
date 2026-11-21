# QA Tools

[![Validate plugin](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml/badge.svg)](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml)

Vibe CLI plugin (Agent Plugins 1.0 format) with a complete AI toolkit for quality engineering: 18 testing pipelines × 4 stages + 8 role agents = **80 subagents**, **60 skills**, **6 hooks**, **8 knowledge entries**.

## ⚡ Quick Start

After installing the plugin (see [Installation](#installation-in-another-project) below), try these commands in your project to see qa-tools in action:

```bash
# 1. Explore your app and get a test plan (writes .qa/test-plan.md)
/create-test-plan

# 2. Generate tests from the plan (writes tests/, runs them)
/test-generator

# 3. Or jump straight into a single grounded test via Playwright MCP
/playwright-generate-test

# 4. Audit your existing test suite for anti-patterns
/tech-debt-audit

# 5. Check what to retest after a diff/PR
/regression-scope
```

Each command is read-only or writes to `.qa/` / `tests/` — safe to run on any project. Subagents (`qa-tools:ui-test-planner`, etc.) and skills (`/playwright-test-writing`, etc.) are available throughout.

> 📖 **Not sure which agent to use?** See [docs/AGENTS.md](docs/AGENTS.md) — a table of all 80 subagents with "when to use" and examples.

| Area | Subagents | Purpose |
|---|---|---|
| 🖥️ UI | `qa-tools:ui-test-*` | Playwright UI tests |
| 🔌 API | `qa-tools:api-test-*` | API tests (Playwright request, OpenAPI) |
| 🌐 E2E | `qa-tools:e2e-test-*` | full user flows |
| 📱 mobile | `qa-tools:mobile-test-*` | device emulation, touch gestures |
| 🖼️ visual | `qa-tools:visual-test-*` | visual regression (`toHaveScreenshot`) |
| 🚀 load | `qa-tools:load-test-*` | k6 load tests |
| 🗄️ DB | `qa-tools:db-test-*` | data migration / ETL verification |
| 📜 contract | `qa-tools:contract-test-*` | contract tests (Pact / OpenAPI) |
| ♿ a11y | `qa-tools:a11y-test-*` | WCAG accessibility (axe-core, keyboard, screen reader) 🆕 |
| 🛡️ security | `qa-tools:security-test-*` | OWASP Top 10, XSS/CSRF, IDOR, secrets 🆕 |
| 🌪️ chaos | `qa-tools:chaos-test-*` | fault injection, timeouts, dependency degradation 🆕 |
| 🌍 i18n | `qa-tools:i18n-test-*` | locales, RTL, date/currency formats, translation fallbacks 🆕 |
| 🔖 API versioning | `qa-tools:versioning-test-*` | deprecations, `Accept-Version`, backward compatibility 🆕 |
| 🔮 GraphQL | `qa-tools:graphql-test-*` | queries/mutations, `data` + `errors` assertions, variables 🆕 |
| 📨 webhook | `qa-tools:webhook-test-*` | HMAC signature, idempotency/replay, side-effect polling 🆕 |
| ✉️ email | `qa-tools:email-test-*` | Mailpit/Mailosaur, `expect.poll`, links/tokens from mails 🆕 |
| 🔭 observability | `qa-tools:observability-test-*` | log/span/metric assertions via Loki/Tempo/Prometheus, `expect.poll` 🆕 |
| 🐳 testcontainers | `qa-tools:testcontainers-test-*` | real deps (Postgres/Redis/Kafka) per run, healthchecks, mapped ports 🆕 |

Each pipeline: `planner → writer → refactor → code-reviewer`.

## Installation in another project

The plugin loads automatically when the `.vibe/plugins/qa-tools/` directory is inside a **trusted folder** of the project:

```bash
# 1. Copy the plugin into the project (from this repo or as a submodule)
git clone https://github.com/marekbrtkwcz/qa-tools.git /tmp/qa-tools
mkdir -p .vibe/plugins
cp -r /tmp/qa-tools/.vibe/plugins/qa-tools .vibe/plugins/

# 2. Trust the project folder (once, in the Vibe TUI or via ~/.vibe/trusted_folders.toml)
#    ~/.vibe/trusted_folders.toml:
#    folders = ["C:\\path\\to\\project"]

# 3. In the project: /reload-plugins (or restart Vibe), then check:
#    /plugins  → qa-tools
#    /skills   → 44 skills tagged plugin:qa-tools

# 4. (optional) validate the plugin structure
py scripts/validate-plugin.py
```

Usage: subagents as `qa-tools:<name>` (e.g. `qa-tools:ui-test-planner`), skills via `/<skill-name>` or auto-load.

## ⚡ Project commands (slash prompts)

Project-level prompts in `.vibe/prompts/` (loaded only in this trusted project; a same-named `~/.vibe/prompts/` file is shadowed):

| Command | What it does |
|---|---|
| `/fix-tests` | runs failing tests in a scope, diagnoses and fixes root causes without weakening assertions |
| `/bug-report` | turns rough notes into a developer-ready bug report (severity, repro, confidence, missing evidence) |
| `/playwright-generate-test` | walks one scenario live with Playwright MCP, then writes and runs a grounded Playwright spec |
| `/refactor-to-page-objects` | pure structural refactor of specs into page objects, verified against a baseline run |
| `/stabilize-flaky-tests` | reproduces flaky tests (repeat/parallel runs), classifies root cause, fixes it, proves stability with before/after rates |
| `/tech-debt-audit` | report-only audit of test code: anti-patterns with `file:line`, severity-ranked, A–F health score, fix plan |
| `/qa-strategy` | six-lens scenario matrix (happy/boundary/negative/OWASP/adversarial/data integrity) with OWASP coverage table, before any test code |
| `/regression-scope` | turns a diff/PR into a prioritized retest pack (must/should/sample/defer) + minimal confidence suite; analysis only |
| `/verify-acceptance-criteria` | checks evidence (diff, running app via Playwright MCP, screenshots) against ACs: Met/Partial/Not Met/Untestable + sign-off summary |
| `/design-llm-eval-suite` | builds an offline eval suite for an LLM feature: golden/edge/negative cases, cheapest-falsifiable scoring, pinned determinism, regression gate in CI |
| `/test-llm-guardrails` | guardrail + injection-resistance testing with a blocking written authorization gate; adversarial corpus scored on effect, across every content channel |
| `/a11y-webpage-audit` | single-URL WCAG 2.2 AA audit via Playwright MCP: 6 passes, findings with repro/fix/retest, issue table |
| `/a11y-audit-deep-dive` | multi-page/journey a11y deep dive: template sampling, exact WCAG criteria, retest checklist, technical + stakeholder output |
| `/scope-change-gate` | diff gate before merge: file+hunk tagging, relevant practices, changed-line coverage, intent check; BLOCK/warn/nudge/info findings with briefs; read-only |
| `/record-change-intent` | check high-risk surface for recorded rationale (trailers/ADR/register), classify covered/undeclared/malformed, draft `Intent:` trailer for the author — never commits it |
| `/derive-quality-contract` | derive MUST/SHOULD/COULD contract from risk × maturity × surfaces → `.qa/quality-contract.md`, gap matrix, remediation plan |
| `/audit-quality-debt` | governance audit: silent skips inventory (tests/lint/types/CI/coverage), waiver health, intent + comprehension debt, trend; report-only |
| `/create-test-plan` | explore app via Playwright MCP → risk-prioritized plan saved to `.qa/test-plan.md` with stable scenario IDs |
| `/map-requirements-coverage` | RTM: requirements vs existing tests → covered/partial/not covered with evidence, saved to `.qa/requirements-coverage.md` |
| `/review-requirements` | testability review of story/PRD/ACs: 7 passes, clarifying questions, rewritten testable criteria |
| `/manual-test-cases` | executable manual test cases table (ID/priority/type/steps/expected/automation candidate) from story, ACs, or plan |
| `/test-generator` | automate plan cases (default `.qa/test-plan.md`) in project conventions, run, per-case status table; case IDs in test titles |
| `/edge-case-scenario-generator` | BDD edge scenarios (boundaries, invalid transitions, concurrency) → `spec/edge-cases.md` for human review before any code |
| `/generate-test-data` | reusable synthetic test data catalog (valid/boundary/invalid/role-state) with fixture-ready flags |
| `/derive-test-cases-from-code` | white-box cases from branches/boundaries/error paths, marked covered/partial/missing vs existing tests |
| `/analyze-test-results` | noisy run → failure clusters, suspected causes, flake suspects, what to investigate first; analysis only |
| `/explain-test-failure` | diagnose one failing test: root-cause class + confidence + failure chain; never edits |
| `/explain-code` | read-only explanation of code: purpose, flow, patterns, risks, "what to test first" |
| `/playwright-explore-website` | first look at an app via Playwright MCP: 3–5 flows with locators → `.qa/website-exploration-summary.md` + proposed test cases |
| `/playwright-explore-website-requests` | same exploration + network traffic per action (redacted) → endpoint table, candidates for API tests / `page.route` mocks |
| `/generate-quality-report` | aggregate test results, coverage, lint/typecheck, flake rate → `.qa/quality-report-<date>.md` with trend vs previous report 🆕 |
| `/review-pr` | quality-focused PR review: tests mapped to the diff, convention compliance, flaky risk, severity-ranked findings + approve/comment/request-changes verdict; read-only 🆕 |
| `/triage-ci` | red CI run → failure classification (app defect / test bug / env / data / flaky), clusters, first step per cluster; analysis only 🆕 |

## Publishing

Repository: `github.com/marekbrtkwcz/qa-tools` (branch `main`). Changes are published as usual: `git push origin main`. Plugin version lives in `.vibe/plugins/qa-tools/plugin.json`, history in `CHANGELOG.md`. License: MIT (`LICENSE`).

Releases are automatic: on every push to `main`, the `.github/workflows/release.yml` action reads the newest `## [x.y.z]` entry in `CHANGELOG.md` and — if no matching tag exists yet — creates annotated tag `v<x.y.z>` plus a GitHub Release with notes taken from that CHANGELOG section. To cut a release, just add the CHANGELOG entry and bump `plugin.json`, then push.

## Structure

```
.vibe/plugins/qa-tools/
├── plugin.json                          # Agent Plugins 1.0 manifest
├── skills/                              # on-demand knowledge (60 skills)
│   ├── playwright-test-writing/
│   ├── api-testing/
│   ├── accessibility-testing/
│   ├── performance-testing/
│   ├── security-testing/
│   ├── ci-cd-pipelines/
│   ├── test-data-management/
│   ├── data-migration-testing/
│   ├── database-testing/
│   ├── llm-testing/
│   ├── quality-gates/
│   ├── unit-testing/
│   ├── test-driven-development/
│   ├── stabilizing-flaky-tests/
│   ├── diagnosing-test-failures/
│   ├── designing-test-automation-architecture/
│   ├── testing-agent-skills/
│   ├── requirements-traceability/
│   ├── mocking/
│   ├── plugin-authoring/
│   ├── contract-testing/
│   ├── test-planning/
│   ├── exploratory-testing/
│   ├── risk-based-testing/
│   ├── privacy-compliance-testing/
│   ├── feature-flags-testing/
│   ├── ab-experimentation-testing/
│   ├── usability-ux-testing/
│   ├── test-reporting/
│   ├── quality-coaching/
│   ├── canary-production-testing/
│   ├── payment-checkout-testing/
│   └── cross-browser-device-testing/
│   ├── mobile-testing/
│   ├── websocket-sse-testing/
│   ├── offline-pwa-testing/
│   ├── visual-testing/
│   ├── qa-best-practices/
│   ├── unslop-answers/
│   ├── unslop-tests/
│   ├── migrating-tests-to-playwright/
│   ├── attesting-manual-verification/
│   ├── assessing-comprehension-debt/
│   ├── tracking-quality-trends/
│   ├── reviewing-ai-output-groundedness/
│   ├── prd-generator/
│   ├── tech-debt-analysis/
│   ├── documenting-test-suites/
│   ├── communicating-quality-findings/
│   ├── code-review-advanced/
│   ├── static-code-analysis-typescript/
│   ├── analyzing-quality-metrics/
│   ├── chaos-testing/
│   ├── i18n-testing/
│   ├── versioning-testing/
│   ├── graphql-testing/
│   ├── webhook-testing/
│   ├── email-testing/
│   ├── observability-testing/
│   └── testcontainers-testing/
└── ai.mistral.vibe/
    ├── agents/                          # 80 subagents: 72 pipeline (18 areas × 4 stages) + 8 role agents
    ├── hooks.toml                       # lint, playwright --list, typecheck, flaky-watch, convention-guard, QA conventions
├── mcp.json                         # Playwright MCP server (npx @playwright/mcp)
    └── knowledge/                       # knowledge base (architecture, patterns, QA glossary, reporting, quality governance, AI product QA, beyond codegen, playwright conventions)
```

```
    agents/
        ├── ui-test-planner.toml         # UI test planning
        ├── ui-test-writer.toml          # writing UI tests
        ├── ui-test-refactor.toml        # UI refactoring
        ├── ui-test-code-reviewer.toml   # UI code review
        ├── api-test-planner.toml        # API test planning
        ├── api-test-writer.toml         # writing API tests
        ├── api-test-refactor.toml       # API refactoring
        ├── api-test-code-reviewer.toml  # API code review
        ├── e2e-test-planner.toml        # E2E test planning
        ├── e2e-test-writer.toml         # writing E2E tests
        ├── e2e-test-refactor.toml       # E2E refactoring
        ├── e2e-test-code-reviewer.toml  # E2E code review
        ├── mobile-test-planner.toml     # mobile test planning 🆕
        ├── mobile-test-writer.toml      # writing mobile tests 🆕
        ├── mobile-test-refactor.toml    # mobile refactoring 🆕
        ├── mobile-test-code-reviewer.toml # mobile code review 🆕
        ├── visual-test-planner.toml     # visual test planning 🆕
        ├── visual-test-writer.toml      # writing visual tests 🆕
        ├── visual-test-refactor.toml    # visual refactoring 🆕
        ├── visual-test-code-reviewer.toml # visual code review 🆕
        ├── load-test-planner.toml       # load test planning (k6) 🆕
        ├── load-test-writer.toml        # writing k6 scripts 🆕
        ├── load-test-refactor.toml      # k6 refactoring 🆕
        ├── load-test-code-reviewer.toml # k6 code review 🆕
        ├── db-test-planner.toml         # data migration verification planning 🆕
        ├── db-test-writer.toml          # writing migration verification tests 🆕
        ├── db-test-refactor.toml        # DB test refactoring 🆕
        ├── db-test-code-reviewer.toml   # DB test code review 🆕
        ├── contract-test-planner.toml   # contract test planning 🆕
        ├── contract-test-writer.toml    # writing contract tests (Pact) 🆕
        ├── contract-test-refactor.toml  # contract refactoring 🆕
        ├── contract-test-code-reviewer.toml # contract code review 🆕
        ├── a11y-test-planner.toml       # accessibility test planning 🆕
        ├── a11y-test-writer.toml        # writing a11y tests (axe-core, keyboard) 🆕
        ├── a11y-test-refactor.toml      # a11y refactoring 🆕
        ├── a11y-test-code-reviewer.toml # a11y code review 🆕
        ├── security-test-planner.toml   # security test planning 🆕
        ├── security-test-writer.toml    # writing security tests (XSS/CSRF/IDOR) 🆕
        ├── security-test-refactor.toml  # security test refactoring 🆕
        ├── security-test-code-reviewer.toml # security code review 🆕
        ├── chaos-test-planner.toml      # chaos test planning 🆕
        ├── chaos-test-writer.toml       # fault injection via page.route 🆕
        ├── chaos-test-refactor.toml     # fault helpers (500/abort/delay) 🆕
        └── chaos-test-code-reviewer.toml # chaos code review 🆕
        ├── i18n-test-planner.toml           # i18n test planning 🆕
        ├── i18n-test-writer.toml            # writing i18n tests (locales, RTL, formats) 🆕
        ├── i18n-test-refactor.toml          # i18n refactoring (locale helpers) 🆕
        └── i18n-test-code-reviewer.toml     # i18n code review 🆕
        ├── versioning-test-planner.toml     # API versioning test planning 🆕
        ├── versioning-test-writer.toml      # writing versioning tests (Accept-Version) 🆕
        ├── versioning-test-refactor.toml    # versioning refactoring (per-version helpers) 🆕
        ├── versioning-test-code-reviewer.toml # versioning code review 🆕
        ├── graphql-test-planner.toml        # GraphQL test planning 🆕
        ├── graphql-test-writer.toml         # writing GraphQL tests (query + variables) 🆕
        ├── graphql-test-refactor.toml       # GraphQL refactoring (gqlRequest helper) 🆕
        ├── graphql-test-code-reviewer.toml  # GraphQL code review 🆕
        ├── webhook-test-planner.toml        # webhook test planning 🆕
        ├── webhook-test-writer.toml         # writing webhook tests (HMAC sign + poll) 🆕
        ├── webhook-test-refactor.toml       # webhook refactoring (sign/payload helpers) 🆕
        ├── webhook-test-code-reviewer.toml  # webhook code review 🆕
        ├── email-test-planner.toml          # email test planning 🆕
        ├── email-test-writer.toml           # writing email tests (Mailpit/Mailosaur) 🆕
        ├── email-test-refactor.toml         # email refactoring (findEmail helper) 🆕
        ├── email-test-code-reviewer.toml    # email code review 🆕
        ├── observability-test-planner.toml  # observability test planning 🆕
        ├── observability-test-writer.toml   # span/log/metric assertions 🆕
        ├── observability-test-refactor.toml # observability refactoring (poll helpers) 🆕
        ├── observability-test-code-reviewer.toml # observability code review 🆕
        ├── testcontainers-test-planner.toml # local deps planning (Testcontainers/compose) 🆕
        ├── testcontainers-test-writer.toml  # integration tests with real deps 🆕
        ├── testcontainers-test-refactor.toml # env helpers (start/reset) 🆕
        └── testcontainers-test-code-reviewer.toml # env code review 🆕
```

## Testing pipeline

```
Planner → Writer → Refactor → Code Reviewer
```

Available for eighteen areas: **UI**, **API**, **E2E**, **mobile**, **visual (regression)**, **load (k6)**, **DB (data migration/ETL verification)**, **contract (Pact / OpenAPI)**, **a11y (WCAG accessibility)**, **security (OWASP Top 10)**, **chaos (fault injection / resilience)**, **i18n (locales, RTL, formats)**, **API versioning (deprecations, backward compatibility)**, **GraphQL (data + errors assertions)**, **webhook (HMAC signature, idempotency)**, **email (Mailpit/Mailosaur, expect.poll)**, **observability (log/span/metric assertions)**, **testcontainers (real local dependencies per CI run)**.

## qa-tools conventions (enforced by all 60 agents)

Every subagent knows and applies the same conventions:

- **Test naming**: English, `should <result> when <condition>` format; kebab-case `.spec.ts` files; `describe` = feature name, without the word "test"
- **Assertions**: only `await expect(...)` with auto-retry — never `waitForTimeout`; concrete assertions (exact text/URL/status), never just "element exists"
- **Selectors** (Playwright): only `getByRole` / `getByLabel` / `getByText` / `getByTestId` — no brittle CSS/XPath
- **Structure**: tests in `tests/<area>/`, plans in `docs/scenarios/<area>/`, k6 scripts in `load/`; baseURL/secrets only from env
- **Page Object Model**: only at the refactor stage and on explicit request — `tests/pages/BasePage.ts` + one class per screen
- **Plans** share a format (preconditions → steps → validation points → data → out of scope); **reviews** share a report format with severity scale (critical / important / suggestion)

## Usage

The plugin loads automatically in a trusted project. Subagents are available as `qa-tools:<name>` (e.g. `qa-tools:ui-test-planner`). Skills can be invoked via `/playwright-test-writing` or are auto-loaded by the model.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Failed to load plugin agent` on startup | agent TOML keys must be snake_case (`schema_version`, `agent_type`, ...) — the runtime schema forbids extras | run `py scripts/validate-plugin.py`; fixed in v1.2.1 |
| Plugin/skills not visible after copying | project folder not trusted | add the project to `~/.vibe/trusted_folders.toml`, then `/reload-plugins` (or restart Vibe) |
| `/skills` shows no qa-tools skills | plugin dir must be exactly `.vibe/plugins/qa-tools/` | check the path; then `/reload-plugins` |
| Agents produce camelCase TOML when creating new agents | outdated docs/examples | qa-tools agents use snake_case keys; validate with `scripts/validate-plugin.py` |
| `flaky-watch` hook reports nothing | no JUnit reporter configured | add `['junit', { outputFile: 'results.xml' }]` to `reporter` in playwright.config (see `examples/playwright.config.ts`) |
| CI workflow red on a docs-only change | validator failed | run `py scripts/validate-plugin.py` locally — most often a version/count mismatch (`plugin.json` ↔ `CHANGELOG.md` ↔ README) |

## Development

Local validation before committing (CI does the same on every push/PR):

```bash
py scripts/validate-plugin.py                  # plugin structure, exit 0/1
python -m unittest discover -s tests -v        # validator unit tests
```

## Plugin validation

```
py scripts/validate-plugin.py                    # Python 3.11+, stdlib only
python -m unittest discover -s tests -v          # validator unit tests (stdlib)
```

The script checks: `plugin.json`, all 60 agent TOML files (keys, naming conventions, `waitForTimeout` ban, `__ENV`/`thresholds` rules for k6), 44 skill frontmatters, `hooks.toml`, `knowledge/` entries, reference example compliance, and version/count consistency (`plugin.json` ↔ `CHANGELOG.md` ↔ README). Exit code 0 = OK, 1 = errors. Useful locally and in CI — on every push/PR to `main` it is run by the `.github/workflows/validate-plugin.yml` workflow.

## Reference examples

```
examples/
├── playwright.config.ts                  # config template: per-browser/device projects, baseURL from env
├── .env.example                          # env variables (BASE_URL, API_TOKEN, ...)
├── ci/e2e.yml                            # GitHub Actions template: playwright + artifacts (report/trace)
├── docs/scenarios/ui/login.md            # UI scenario plan
├── docs/scenarios/api/users.md           # API scenario plan
├── docs/scenarios/a11y/login.md          # a11y scenario plan (axe-core)
├── docs/scenarios/security/comment-xss.md # security scenario plan (XSS)
├── docs/scenarios/chaos/orders-500.md    # chaos scenario plan (API 500)
├── docs/scenarios/mobile/checkout-swipe.md # mobile scenario plan (touch)
├── docs/scenarios/i18n/locale-pl.md      # i18n scenario plan (pl-PL)
├── docs/scenarios/versioning/users-v1-v2.md # versioning scenario plan (v1 vs v2)
├── tests/ui/login.spec.ts                # Playwright UI test
├── tests/api/users.spec.ts               # API test (request fixture)
├── tests/a11y/login.spec.ts              # a11y test (axe + keyboard)
├── tests/security/comment-xss.spec.ts    # security test (XSS)
├── tests/chaos/orders-500.spec.ts        # chaos test (page.route fault)
├── tests/mobile/checkout.spec.ts         # mobile test (viewport + tap)
├── tests/i18n/locale.spec.ts             # i18n test (pl-PL, date format)
└── tests/versioning/users.spec.ts        # versioning test (Accept-Version, v1 vs v2)
```

This is the reference point for agents and users: it shows what a scenario plan and a test written according to the conventions look like (naming `should ... when ...`, `getBy*` selectors, `await expect(...)` assertions, secrets from env).

## Community

- Bugs and feature requests: GitHub issues (templates in `.github/ISSUE_TEMPLATE/`, PR checklist in `.github/PULL_REQUEST_TEMPLATE.md`).
- Security vulnerabilities: see `SECURITY.md` — report privately, never in a public issue.
- `main` is protected: the `Validate plugin` status check must pass before merging.
