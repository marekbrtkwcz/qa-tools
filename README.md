# QA Tools

[![Validate plugin](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml/badge.svg)](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml)

Vibe CLI plugin (Agent Plugins 1.0 format) with a complete AI toolkit for quality engineering: 11 testing pipelines × 4 stages = **60 subagents**, **38 skills**, **5 hooks**, **8 knowledge entries**.

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
#    /skills   → 38 skills tagged plugin:qa-tools

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

## Publishing

Repository: `github.com/marekbrtkwcz/qa-tools` (branch `main`). Changes are published as usual: `git push origin main`. Plugin version lives in `.vibe/plugins/qa-tools/plugin.json`, history in `CHANGELOG.md`. License: MIT (`LICENSE`).

Releases are automatic: on every push to `main`, the `.github/workflows/release.yml` action reads the newest `## [x.y.z]` entry in `CHANGELOG.md` and — if no matching tag exists yet — creates annotated tag `v<x.y.z>` plus a GitHub Release with notes taken from that CHANGELOG section. To cut a release, just add the CHANGELOG entry and bump `plugin.json`, then push.

## Structure

```
.vibe/plugins/qa-tools/
├── plugin.json                          # Agent Plugins 1.0 manifest
├── skills/                              # on-demand knowledge (38 skills)
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
│   ├── mobile-testing/
│   ├── websocket-sse-testing/
│   ├── offline-pwa-testing/
│   ├── visual-testing/
│   ├── qa-best-practices/
│   ├── unslop-answers/
│   ├── unslop-tests/
│   ├── migrating-tests-to-playwright/
│   ├── attesting-manual-verification/
│   ├── reviewing-ai-output-groundedness/
│   ├── prd-generator/
│   ├── tech-debt-analysis/
│   ├── documenting-test-suites/
│   ├── communicating-quality-findings/
│   ├── code-review-advanced/
│   └── static-code-analysis-typescript/
└── ai.mistral.vibe/
    ├── agents/                          # 60 subagents: 52 pipeline (13 areas × 4 stages) + 8 role agents
    ├── hooks.toml                       # lint, playwright --list, typecheck, flaky-watch, QA conventions
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
        └── versioning-test-code-reviewer.toml # versioning code review 🆕
```

## Testing pipeline

```
Planner → Writer → Refactor → Code Reviewer
```

Available for thirteen areas: **UI**, **API**, **E2E**, **mobile**, **visual (regression)**, **load (k6)**, **DB (data migration/ETL verification)**, **contract (Pact / OpenAPI)**, **a11y (WCAG accessibility)**, **security (OWASP Top 10)**, **chaos (fault injection / resilience)**, **i18n (locales, RTL, formats)**, **API versioning (deprecations, backward compatibility)**.

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

The script checks: `plugin.json`, all 60 agent TOML files (keys, naming conventions, `waitForTimeout` ban, `__ENV`/`thresholds` rules for k6), 38 skill frontmatters, `hooks.toml`, `knowledge/` entries, reference example compliance, and version/count consistency (`plugin.json` ↔ `CHANGELOG.md` ↔ README). Exit code 0 = OK, 1 = errors. Useful locally and in CI — on every push/PR to `main` it is run by the `.github/workflows/validate-plugin.yml` workflow.

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
