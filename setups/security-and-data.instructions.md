---
description: "Set up a workspace for security verification tests (OWASP, safe payloads) and data/SQL tasks on top of a Playwright project. Trigger: security setup, testy bezpieczeństwa setup, SQL scripts setup."
---

# 🧪 Security & Data Testing Setup

Extends an existing Playwright project (run `playwright-fullstack.instructions.md` first) or a standalone scripts workspace.

## 🧪 Security tests

1. Add directories: `tests/api/security/`, `tests/ui/security/`, `docs/scenarios/security/`
2. Skopiuj szablony security z qa-tools (lub użyj `scripts/new-project.ts --setup=security-and-data`):
   - `shared/security-payloads.ts` → `src/data/security-payloads.ts` — kanarkowe payloady (`CANARIES`, `SECURE_BEHAVIOR`), skaner wycieków `scanForLeaks()` (PESEL, karta, JWT, token, pole password), `EXPECTED_SECURITY_HEADERS`
   - `shared/security-fixtures.ts` → `src/fixtures/auth.fixture.ts` — konteksty ról `userRequest()` / `adminRequest()` / `anonymousRequest()` + asercje `expectNoIdorLeak()` / `expectUnauthorized()`; dostosuj tylko adapter `login()` do realnej aplikacji
   - `shared/security-plan.template.md` → `docs/scenarios/security/_plan-template.md` — szablon planu (metadane, rules of engagement, macierz OWASP, rejestr findings)
3. `npm i -D dotenv dotenv-cli` (najnowsze wersje); `.env.example` additions: `TEST_USER_EMAIL=`, `TEST_USER_PASSWORD=`, `TEST_ADMIN_EMAIL=`, `TEST_ADMIN_PASSWORD=` — test accounts only, never real credentials; `.env` stays git-ignored; w testach pobieraj przez singleton `env.TEST_USER_*` z `src/config/env.ts` (nigdy `process.env` bezpośrednio)
4. npm scripts: `test:security` → `playwright test tests/api/security tests/ui/security`
5. Rules of engagement: non-destructive verification only; no production without written authorization (enforced by `agents/security/*`)
6. Aktualizacje zależności (ncu, npm audit) dziedziczone z projektu Playwright — patrz `shared/conventions.md`

## 🗄️ Data / SQL tasks

1. Add `scripts/` (skrypty TS uruchamiane przez `npm run script -- ...`, tsx) oraz `scripts/sql/` with ordered scripts `001_...sql`, `002_...sql`
2. Connection via env (`DATABASE_URL` or `DB_HOST/DB_USER/DB_NAME`); example in `.env.example`
3. npm scripts per DB CLI, e.g. `"db:migrate": "psql \"%DATABASE_URL%\" -f scripts/sql/001_init.sql"` (Windows) / `"db:migrate": "psql \"$DATABASE_URL\" -f scripts/sql/001_init.sql"` (Linux) — or use `dotenv-cli` for cross-platform: `"db:migrate": "dotenv -e .env -- psql \"$DATABASE_URL\" -f scripts/sql/001_init.sql"`
4. Conventions: explicit transactions, idempotent statements, validate counts/checksums after conversion — see `qa-data-sql` skill and `shared/conventions.md`
