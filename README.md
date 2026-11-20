# QA Tools

[![Validate plugin](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml/badge.svg)](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml)

Vibe CLI plugin (Agent Plugins 1.0 format) with a complete AI toolkit for quality engineering: 11 testing pipelines × 4 stages = **44 subagents**, **14 skills**, **4 hooks**, **4 knowledge entries**.

| Area | Subagents | Purpose |
|---|---|---|
| UI | `qa-tools:ui-test-*` | Playwright UI tests |
| API | `qa-tools:api-test-*` | API tests (Playwright request, OpenAPI) |
| E2E | `qa-tools:e2e-test-*` | full user flows |
| mobile | `qa-tools:mobile-test-*` | device emulation, touch gestures |
| visual | `qa-tools:visual-test-*` | visual regression (`toHaveScreenshot`) |
| load | `qa-tools:load-test-*` | k6 load tests |
| DB | `qa-tools:db-test-*` | data migration / ETL verification |
| contract | `qa-tools:contract-test-*` | contract tests (Pact / OpenAPI) |
| a11y | `qa-tools:a11y-test-*` | WCAG accessibility (axe-core, keyboard, screen reader) 🆕 |
| security | `qa-tools:security-test-*` | OWASP Top 10, XSS/CSRF, IDOR, secrets 🆕 |
| chaos | `qa-tools:chaos-test-*` | fault injection, timeouts, dependency degradation 🆕 |

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
#    /skills   → 14 skills tagged plugin:qa-tools

# 4. (optional) validate the plugin structure
py scripts/validate-plugin.py
```

Usage: subagents as `qa-tools:<name>` (e.g. `qa-tools:ui-test-planner`), skills via `/<skill-name>` or auto-load.

## Publishing

Repository: `github.com/marekbrtkwcz/qa-tools` (branch `main`). Changes are published as usual: `git push origin main`. Plugin version lives in `.vibe/plugins/qa-tools/plugin.json`, history in `CHANGELOG.md`. License: MIT (`LICENSE`).

## Structure

```
.vibe/plugins/qa-tools/
├── plugin.json                          # Agent Plugins 1.0 manifest
├── skills/                              # on-demand knowledge (14 skills)
│   ├── playwright-test-writing/
│   ├── api-testing/
│   ├── accessibility-testing/
│   ├── performance-testing/
│   ├── security-testing/
│   ├── ci-cd-pipelines/
│   ├── test-data-management/
│   ├── data-migration-testing/
│   ├── contract-testing/
│   ├── test-planning/
│   ├── mobile-testing/
│   ├── websocket-sse-testing/
│   ├── offline-pwa-testing/
│   └── qa-best-practices/
└── ai.mistral.vibe/
    ├── agents/                          # 44 pipeline subagents (11 areas × 4 stages)
    ├── hooks.toml                       # lint, playwright --list, typecheck, QA conventions
    └── knowledge/                       # knowledge base (architecture, patterns, QA glossary, reporting)
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
```

## Testing pipeline

```
Planner → Writer → Refactor → Code Reviewer
```

Available for eleven areas: **UI**, **API**, **E2E**, **mobile**, **visual (regression)**, **load (k6)**, **DB (data migration/ETL verification)**, **contract (Pact / OpenAPI)**, **a11y (WCAG accessibility)**, **security (OWASP Top 10)**, **chaos (fault injection / resilience)**.

## qa-tools conventions (enforced by all 44 agents)

Every subagent knows and applies the same conventions:

- **Test naming**: English, `should <result> when <condition>` format; kebab-case `.spec.ts` files; `describe` = feature name, without the word "test"
- **Assertions**: only `await expect(...)` with auto-retry — never `waitForTimeout`; concrete assertions (exact text/URL/status), never just "element exists"
- **Selectors** (Playwright): only `getByRole` / `getByLabel` / `getByText` / `getByTestId` — no brittle CSS/XPath
- **Structure**: tests in `tests/<area>/`, plans in `docs/scenarios/<area>/`, k6 scripts in `load/`; baseURL/secrets only from env
- **Page Object Model**: only at the refactor stage and on explicit request — `tests/pages/BasePage.ts` + one class per screen
- **Plans** share a format (preconditions → steps → validation points → data → out of scope); **reviews** share a report format with severity scale (critical / important / suggestion)

## Usage

The plugin loads automatically in a trusted project. Subagents are available as `qa-tools:<name>` (e.g. `qa-tools:ui-test-planner`). Skills can be invoked via `/playwright-test-writing` or are auto-loaded by the model.

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

The script checks: `plugin.json`, all 44 agent TOML files (keys, naming conventions, `waitForTimeout` ban, `__ENV`/`thresholds` rules for k6), 14 skill frontmatters, `hooks.toml`, `knowledge/` entries, reference example compliance, and version/count consistency (`plugin.json` ↔ `CHANGELOG.md` ↔ README). Exit code 0 = OK, 1 = errors. Useful locally and in CI — on every push/PR to `main` it is run by the `.github/workflows/validate-plugin.yml` workflow.

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
├── tests/ui/login.spec.ts                # Playwright UI test
├── tests/api/users.spec.ts               # API test (request fixture)
├── tests/a11y/login.spec.ts              # a11y test (axe + keyboard)
├── tests/security/comment-xss.spec.ts    # security test (XSS)
├── tests/chaos/orders-500.spec.ts        # chaos test (page.route fault)
└── tests/mobile/checkout.spec.ts         # mobile test (viewport + tap)
```

This is the reference point for agents and users: it shows what a scenario plan and a test written according to the conventions look like (naming `should ... when ...`, `getBy*` selectors, `await expect(...)` assertions, secrets from env).
