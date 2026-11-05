---
name: qa-e2e-hybrid
description: Load when the user wants end-to-end tests combining API setup, UI actions, UI verification, API verification, and API cleanup (hybrid E2E). Orchestrates agents/e2e on top of the UI and API layers.
---

# 🌟 QA E2E Hybrid

Workflow for hybrid E2E tests: API for setup/cleanup, UI for the business action, both layers for verification.

## ⛓️ Pipeline

1. **Plan** — `agents/e2e/e2e-test-planner.agent.md`: analyze OpenAPI + existing tests, validate scenario via browser, save to `docs/scenarios/e2e/`
2. **Write** — `agents/e2e/e2e-test-writer.agent.md`: write `tests/e2e/*.spec.ts`
3. **Refactor** — `agents/e2e/e2e-test-refactor.agent.md`
4. **Review** — `agents/e2e/e2e-test-code-review.agent.md`

## 🧭 Setup

`setups/playwright-fullstack.instructions.md` (E2E needs the full `src/` + `tests/` structure).

## 📏 Rules

- Prefer API setup over UI setup (faster, more stable)
- Clean up created data via API in `afterEach`/`teardown`
- Reuse `qa-ui-playwright` and `qa-api-playwright` conventions for the respective layers
