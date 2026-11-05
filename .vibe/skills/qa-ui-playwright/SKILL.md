---
name: qa-ui-playwright
description: Load when the user wants to plan, write, refactor, or review Playwright TypeScript UI tests (login, forms, navigation, component checks). Orchestrates agents/ui, setups, shared Biome config, and the built-in playwright-best-practices skill.
---

# 🖌️ QA UI Playwright

Workflow for UI test automation with Playwright + TypeScript + Biome.

## ⛓️ Pipeline (use subagents in this order)

1. **Plan** — `agents/ui/ui-test-planner.agent.md`: validate ONE scenario against the real UI, save plan to `docs/scenarios/ui/`
2. **Write** — `agents/ui/ui-test-writer.agent.md`: write `tests/ui/*.spec.ts`, run until green twice in a row
3. **Refactor** — `agents/ui/ui-test-refactor.agent.md`: move to Page Objects / fixtures / components (only for explicitly provided files)
4. **Review** — `agents/ui/ui-test-code-review.agent.md`: strict checklist review before merge

## 🧵 Setup

- New project: `setups/playwright-fullstack.instructions.md` (UI+API+E2E) or `setups/playwright-ui-only.instructions.md`
- Shared config: `shared/biome.json`, `shared/tsconfig.base.json`, conventions in `shared/conventions.md`

## 📌 Built-in skills to leverage

Load `playwright-best-practices` for locators, flakiness, POM, and CI concerns. Load `playwright-cli` for ad-hoc browser automation and debugging.

## 📏 Rules

- Locators: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > css (last resort)
- No `waitForTimeout`, no XPath unless unavoidable, inspect DOM before choosing locators
- Lint/format with Biome: `npm run check` / `npm run lint:fix`
- Env vars only via the singleton `env` from `src/config/env.ts` (dotenv + zod) — never `process.env` directly in tests
- Test data: dynamic data only via **@faker-js/faker** (`src/utils/faker.ts`) in factories / `beforeEach` with `faker.seed()` for reproducibility; constants in `src/data/` — never inline in test steps
