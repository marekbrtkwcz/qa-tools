---
description: "Set up a minimal Playwright + TypeScript project for Web API tests only (request fixture, OpenAPI-driven). Uses shared Biome config. Trigger: api-only setup, testy API, projekt tylko API."
---

# 🧪 API-Testing-Only Project Setup

Minimal variant of `playwright-fullstack.instructions.md` — use when only API tests are needed.

## 🔧 Steps

1. `npm init -y`, ustaw `"type": "module"` w `package.json` (ESM) + install latest: `npm i -D typescript @playwright/test @types/node`, `npm i -D @biomejs/biome` oraz `npm i -D dotenv dotenv-cli`, `npm i zod` oraz `npm i -D @faker-js/faker npm-check-updates @clack/prompts` (do interaktywnych skryptów CLI)
2. Copy `shared/biome.json` to project root; create `tsconfig.json` from `shared/tsconfig.base.json` (trim `paths` to `@api/*`, `@data/*`, `@utils/*`, `@fixtures/*`)
3. No browser download needed: skip `playwright install` browsers; Playwright API tests only need the test runner (run `npx playwright install-deps` only if CI needs system libs)
4. Directory structure:
   ```
   src/api/{consts,models,factories,requests,steps}/
   src/fixtures/ src/data/ src/utils/
   scripts/
   tests/api/
   docs/openapi/ docs/scenarios/api/
   ```
5. Skopiuj `shared/ncurc.json` → `.ncurc.json`, `shared/faker.ts` → `src/utils/faker.ts`, `shared/script.example.ts` → `scripts/example.ts`, `shared/menu.ts` → `scripts/menu.ts` (menu zadań, `npm run menu`), `shared/clean.ts` → `scripts/clean.ts` (porządki, `npm run clean`); stwórz `src/config/env.ts` z szablonu `shared/env.ts` (singleton env: dotenv + zod); `playwright.config.ts`: pojedynczy projekt `api` z `baseURL: env.API_URL`, reporter `html` + `list`. Schematy odpowiedzi API jako zod w `src/api/models/*`
6. `.env.example` from `shared/env.example` (z `API_URL=` i `OPENAPI_SPEC=docs/openapi/openapi.json`); skopiuj `shared/gitignore` → `.gitignore`
7. Place the OpenAPI/Swagger spec in `docs/openapi/` (sourced from the system, never hand-written)
8. Skrypty npm: scal `shared/package.scripts.json` do `scripts` w `package.json` — w wariancie api-only zostaw `test:api`, `test:report`, skrypty Biome, `audit` / `audit:fix` i `deps:*` (najnowsze wersje = bezpieczeństwo; lockfile commituj)
9. Latest library versions only
