---
name: qa-api-playwright
description: Load when the user wants to plan, write, refactor, or review Web API tests (REST, contract/schema validation, positive/negative scenarios) with Playwright request fixtures and TypeScript. Orchestrates agents/api and OpenAPI-driven planning.
---

# 🧵 QA API Playwright

Workflow for Web API test automation with Playwright (`request` fixture) + TypeScript.

## ⛓️ Pipeline

1. **Plan** — `agents/api/api-test-planner.agent.md`: read OpenAPI spec (`OPENAPI_SPEC` in `.env`), produce 3 scenario groups (schema validation / positive / negative) in `docs/scenarios/api/`
2. **Write** — `agents/api/api-test-writer.agent.md`: write simple working `tests/api/*.spec.ts` from a scenario file
3. **Refactor** — `agents/api/api-test-refactor.agent.md`: typed models, factories, API steps, cleanup (only provided files)
4. **Review** — `agents/api/api-test-code-review.agent.md`: strict review

## 📌 Setup

- `setups/api-testing-only.instructions.md` for API-only projects, or `setups/playwright-fullstack.instructions.md`
- Shared: `shared/biome.json`, `shared/tsconfig.base.json`, `shared/conventions.md`

## 📏 Rules

- OpenAPI spec is the ONLY source of truth for endpoints, schemas, status codes
- Never mock API responses; never invent undocumented behavior
- Base URL and tokens come from the env singleton `src/config/env.ts` (`env.API_URL`) — never hardcoded, never raw `process.env` in tests
- **zod** validates every API response: schemas in `src/api/models/*`, parse in `src/api/requests/*` via `schema.parse(res.json())` — contract + type in one place
- Request payloads come from factories (`src/api/factories/*`) using **@faker-js/faker** (`src/utils/faker.ts`, seeded) — never hardcoded JSON in test steps
- Lint/format with Biome

## 🧪 Gdzie mieszkają testy API

Testy Web API runą **wewnątrz tego samego projektu Playwright** — nie ma osobnego frameworku. Używają wbudowanego fixture `request` (`@playwright/test`) i katalogu `tests/api/`. W pełnym projekcie (`playwright-fullstack`) warstwa API jest częścią standardowej struktury; w wariancie API-only korzysta z `setups/api-testing-only.instructions.md`.
