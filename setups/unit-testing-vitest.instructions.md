---
description: "Set up a project for unit testing TypeScript/JavaScript code with Vitest + mandatory coverage (v8, thresholds). ESM, Biome, dotenv+zod env singleton, faker, ncu. Trigger: unit tests, vitest setup, testy jednostkowe, coverage, projekt tylko testy jednostkowe."
---

# 🧪 Unit-Testing-Vitest Project Setup

Dedicated project for unit-testing your own TS/JS code (libraries, utils, business logic) with **Vitest** and **coverage thresholds**. Use when the code under test is NOT a web app — e.g. utilities, parsers, validators, services.

> ⚡ **IMPORTANT:** Always install the **LATEST versions** of all libraries. No version pins (pin only for documented compatibility issues). Commit `package-lock.json`.

## 🔧 Steps

1. `npm init -y`, ustaw `"type": "module"` w `package.json` (ESM) + install latest: `npm i -D typescript vitest @vitest/coverage-v8 @types/node tsx`, `npm i -D @biomejs/biome` oraz `npm i -D dotenv dotenv-cli`, `npm i zod` oraz `npm i -D @faker-js/faker npm-check-updates @clack/prompts`
2. Copy `shared/biome.json` → project root; `tsconfig.json` from `shared/tsconfig.base.json` — trim `paths` to what the project needs (e.g. `@utils/*`, `@data/*`); `include` already covers `vitest.config.ts`
3. Copy `shared/vitest.config.ts` → `vitest.config.ts` (coverage provider **v8**, reporters `text/html/json-summary/lcov`, `reportsDirectory: ./coverage`, thresholds 80% — adjust per project, but coverage stays MANDATORY)
4. Directory structure:
   ```
   src/            ← kod testowany (utils, services, parsers, validators…)
   src/config/env.ts   ← singleton env (szablon shared/env.ts)
   src/utils/faker.ts  ← szablon shared/faker.ts
   tests/unit/     ← tylko *.spec.ts (vitest)
   scripts/        ← skrypty tsx + menu.ts + clean.ts
   docs/scenarios/unit/ docs/adr/ docs/guides/ docs/architecture/
   ```
5. Skopiuj `shared/ncurc.json` → `.ncurc.json`, `shared/script.example.ts` → `scripts/example.ts`, `shared/menu.ts` → `scripts/menu.ts`, `shared/clean.ts` → `scripts/clean.ts`; stwórz `src/config/env.ts` z `shared/env.ts` i `.env.example` z `shared/env.example`
6. `.gitignore`: skopiuj `shared/gitignore` → `.gitignore` (`coverage/` już tam jest, `.env` ignorowany, `package-lock.json` NIE)
7. Skrypty npm: scal `shared/package.scripts.json` do `scripts` w `package.json` — zostaw w tym projekcie: `test:unit`, `test:unit:watch`, `coverage`, skrypty Biome, `audit` / `audit:fix`, `deps:*`, `script`, `menu`, `clean`
8. Konwencje testów jednostkowych (pełne reguły: skill `qa-unit-vitest` + `shared/conventions.md`):
   - jawne importy z vitest: `import { describe, expect, it, vi, beforeEach } from 'vitest'`
   - importy źródeł względne z sufiksem `.js`; specy tylko w `tests/unit/**/*.spec.ts`
   - mocki: `vi.mock` / `vi.fn` / `vi.spyOn`, `vi.restoreAllMocks()` w `afterEach`; brak prawdziwego I/O
   - dane dynamiczne tylko przez faker (`faker.seed()` w `beforeEach`); env tylko przez singleton `env.X`
   - `npm run coverage` musi przechodzić progi z `vitest.config.ts` (run w CI = gate)
9. Latest library versions only
