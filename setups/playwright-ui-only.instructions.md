---
description: "Set up a minimal Playwright + TypeScript project for UI tests only (no API/E2E layers). Uses shared Biome config. Trigger: ui-only setup, same testy UI, projekt tylko UI."
---

# 📌 Playwright UI-Only Project Setup

Minimal variant of `playwright-fullstack.instructions.md` — use when only UI tests are needed.

## 🔧 Steps

1. `npm init -y`, ustaw `"type": "module"` w `package.json` (ESM) + install latest: `npm i -D typescript @playwright/test @types/node`, `npm i -D @biomejs/biome` oraz `npm i -D dotenv dotenv-cli`, `npm i zod` oraz `npm i -D @faker-js/faker npm-check-updates @clack/prompts` (do interaktywnych skryptów CLI)
2. Copy shared configs from this repo: `shared/biome.json` → project root, and create `tsconfig.json` from `shared/tsconfig.base.json` (trim `paths` to `@ui/*`, `@data/*`, `@utils/*`, `@fixtures/*` only)
3. `npx playwright install --with-deps` (Linux) / `npx playwright install` (Windows)
4. Minimal directory structure (with `.gitkeep`):
   ```
   src/ui/{pages,components,models,factories}/
   src/fixtures/ src/data/ src/utils/
   scripts/
   tests/ui/
   docs/scenarios/ui/
   ```
5. Skopiuj `shared/ncurc.json` → `.ncurc.json` (konfig ncu, target: latest), `shared/faker.ts` → `src/utils/faker.ts` oraz `shared/script.example.ts` → `scripts/example.ts` i `shared/menu.ts` → `scripts/menu.ts` (menu zadań, `npm run menu`) oraz `shared/clean.ts` → `scripts/clean.ts` (porządki, `npm run clean`) (instancja @faker-js/faker + seed) i stwórz `src/config/env.ts` z szablonu `shared/env.ts` (singleton env: dotenv + zod); `playwright.config.ts` importuje go: `baseURL: env.BASE_URL` — jeden projekt (`ui`, chromium), reporter `['list', { printSteps: true }]` + `['html', { open: 'never' }]`
6. `.env.example` from `shared/env.example`; skopiuj `shared/gitignore` → `.gitignore` (`.env` jest już ignorowany)
7. Skrypty npm: scal `shared/package.scripts.json` do `scripts` w `package.json` — w wariancie ui-only zostaw `test:ui`, `test:headed`, `test:debug`, `test:report`, skrypty Biome (`format`, `lint`, `lint:fix`, `check`), `audit` / `audit:fix` i `deps:*` (najnowsze wersje bibliotek = bezpieczeństwo; `package-lock.json` commituj)
8. Install latest versions only — no version pins unless compatibility requires it
