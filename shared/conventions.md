# 🌟 Shared Conventions — QA Automation

Applies to every project created from `setups/`.

## 🧰 Tooling
- Linter + formatter: **Biome** only (`shared/biome.json`). No Prettier.
- npm scripts: kanoniczny blok `scripts` z szablonu `shared/package.scripts.json` (scal do `package.json`, w wariancie projektu zostaw tylko odpowiednie testy: `test:ui` / `test:api` / `test:a11y` / `test:security`); Biome: `format`, `format:check`, `lint`, `lint:fix`, `check`; bezpieczeństwo: `audit`, `audit:fix`, `deps:check`, `deps:update`, `deps:update:major`, `deps:interactive`.
- Wersje bibliotek: zawsze najnowsze — sekcja poniżej (bezpieczeństwo).
- TypeScript strict mode; `paths` aliases without `baseUrl`.

## 🔌 ESM (ECMAScript Modules) — standard dla wszystkich projektów TS/JS
- `package.json`: `"type": "module"` — każdy projekt TS/JS pracuje w ESM (o ile ma zastosowanie).
- `tsconfig`: `module` / `moduleResolution: "NodeNext"` + `verbatimModuleSyntax: true` (szablon `shared/tsconfig.base.json`).
- W TS importy względne zakończone `.js` (`import { x } from './y.js'`); typy tylko przez `import type`.
- Nie używamy `require`, `module.exports`, `__dirname` / `__filename` — zamiast tego `import.meta.url` + `fileURLToPath`.
- Wyjątki „o ile ma zastosowanie”: skrypty k6 (własny runtime, bez `package.json`/`type: module`) oraz biblioteki CJS-only — te ładuj przez dynamiczny `import()`.

## 🔒 Wersje bibliotek — zawsze najnowsze (względy bezpieczeństwa)
- Zawsze instaluj najnowsze wersje: `npm install <pkg>` bez pinowania; pin (`--save-exact`) TYLKO przy udokumentowanym problemie kompatybilności.
- `package-lock.json` zawsze commituj — reprodukowalne buildy i audytowalne drzewo zależności.
- **npm-check-updates (ncu)** jako element projektu: `npm i -D npm-check-updates`; konfig z szablonu `shared/ncurc.json` → `.ncurc.json` w katalogu głównym (`target: latest`).
- Skrypty npm: `"audit": "npm audit"`, `"audit:fix": "npm audit fix"`, `"deps:check": "ncu"`, `"deps:update": "ncu -u"`, `"deps:update:major": "ncu -u --upgrade"`, `"deps:interactive": "ncu -i"`.
- Regularnie (minimum przed releasem i w CI): `npm run deps:check`, `npm audit` oraz `npm run deps:update` + pełny re-run testów (major upgrade = osobny PR z re-testem).
- ncu działa tam, gdzie jest `package.json` (projekty TS/JS/Playwright). Binarki poza npm (np. k6) aktualizuj przez menedżera pakietów systemu (`winget upgrade k6` / `brew upgrade k6` / `choco upgrade k6`), weryfikacja: `k6 version`.
- Rozważ Dependabot/Renovate w repo — automatyczne PR z aktualizacjami zabezpieczeń.

## 🏷️ Naming
- Files: kebab-case (`login-page.ts`, `user-factory.ts`); specs: `*.spec.ts`; k6: `*.test.js`.
- Scenarios/plans: kebab-case in `docs/scenarios/<domain>/`.
- SQL scripts: `NNN_description.sql`.

## 🧭 Layers
- `src/` = reusable code (pages, components, api requests/steps, factories, fixtures, utils, data). Never test scenarios here.
- `tests/{ui,api,e2e}/` = only `*.spec.ts`. No selectors/logic outside `src/`.
- `docs/` = openapi, scenarios, adr, guides, architecture. Never executable test code.

## 📜 Skrypty — scripts/ (uruchamiane przez tsx)
- Każdy projekt ma folder `scripts/` — skrypty TS/JS (CLI, generatory, narzędzia pomocnicze, seedowanie danych).
- Uruchamianie przez tsx: skrypt npm `"script": "tsx"` (z `shared/package.scripts.json`) → `npm run script -- scripts/nazwa.ts`.
- Skrypty w ESM (jak cały projekt), env przez singleton `env` (`src/config/env.ts`), dane przez `src/utils/faker.ts`; Biome i tsconfig obejmują `scripts/**` (oba szablony w `shared/`).
- Skrypty SQL nie tu — patrz `scripts/sql/` (osobna konwencja w `qa-data-sql`).
- Porządki (usuwanie artefaktów: playwright-report, test-results, coverage, dist, k6-results, logi…): szablon `shared/clean.ts` → `scripts/clean.ts`, uruchomienie `npm run clean` (multiselect z emojami + potwierdzenie). Lista zgodna z `shared/gitignore`.
- Interaktywne menu do zadań z `package.json`: szablon `shared/menu.ts` → `scripts/menu.ts`, uruchomienie `npm run menu` (skrypt `menu` z `shared/package.scripts.json`) — kategorie i pozycje z emotkami, dwupoziomowy wybór, wykonanie przez `npm run <script>`.
- Interaktywne skrypty CLI (pytają użytkownika): biblioteka **@clack/prompts** — `npm i -D @clack/prompts`, szablon `shared/script.example.ts`. O ile ma zastosowanie: tylko gdy skrypt ma być interaktywny; w CI/trybie nieinteraktywnym używaj argumentów CLI + `env.X`, nie promptów.

## 📚 Dokumentacja projektu — docs/ (zawsze)
- Każdy projekt ma folder `docs/` — dokumentacja i scenariusze:
  ```
  docs/
  ├── openapi/        ← specyfikacja OpenAPI/Swagger (źródło: system, nigdy ręcznie)
  ├── scenarios/      ← plany scenariuszy od agentów planner, per domena:
  │   ├── ui/  api/  e2e/  performance/  security/  accessibility/
  ├── adr/            ← Architecture Decision Records
  ├── guides/         ← przewodniki i tutoriale projektu
  └── architecture/   ← dokumentacja architektury
  ```
- `docs/scenarios/<domena>/` — tylko pliki Markdown z planami (kebab-case), nigdy wykonywalny kod testowy.
- Setup per typ zadania tworzy odpowiednie podfoldery `docs/` (patrz `setups/`).

## 🎯 Locators (UI)
getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > css (last resort). No XPath, no `nth()`, no `waitForTimeout`. Inspect DOM before choosing locators.

## 🧪 Test data
- No hardcoded emails/passwords/URLs in tests — `src/data/` constants or factories (faker for dynamic data, in `beforeEach`/`beforeAll`).
- Base URL / API URL / tokens tylko z singletonu `env` (`env.BASE_URL` / `env.API_URL`, walidowane zod w `src/config/env.ts`) — wyjątek: skrypty k6 (`__ENV`). `.env.example` committed, `.env` git-ignored.
- API factories follow the backend contract (ISO 8601 dates); UI factories follow UI format (e.g. DD/MM/YYYY). Never mix.

## 🧪 Generacja danych testowych — @faker-js/faker (standard)
- Biblioteka: **@faker-js/faker** — `npm i -D @faker-js/faker` (najnowsza wersja).
- Dane dynamiczne generuj TYLKO w factories (`src/api/factories/*`, `src/ui/factories/*`) lub w `beforeEach`/`beforeAll` — nigdy inline w krokach testu.
- Szablon instancji: `shared/faker.ts` → `src/utils/faker.ts` (eksportuje `faker`, `fakerPL` dla danych PL oraz `seedFaker()`).
- Deterministyczność: wywołuj `faker.seed(<liczba>)` w `beforeEach`/`beforeAll`, aby runy były powtarzalne.
- Stałe wartości (statusy, kategorie, stałe komunikaty) trzymaj w `src/data/` — nie mieszaj z fakerem.
- Format danych per warstwa: API factories = kontrakt backendu (ISO 8601), UI factories = format UI (np. DD/MM/YYYY).

## 🌍 Zmienne środowiskowe — dotenv + singleton env (standard)
- Biblioteki: **dotenv** (+ **dotenv-cli** do CLI poza Node) i **zod** — `npm i -D dotenv dotenv-cli && npm i zod`.
- `.env` tylko lokalnie (gitignored); `.env.example` commitujesz do repo (szablon: `shared/env.example`).
- Jeden singleton: `src/config/env.ts` (szablon: `shared/env.ts`) — ładuje dotenv, waliduje `process.env` przez schemat zod i eksportuje zamrożony obiekt `env`. Moduł Node jest cache'owany, więc to prawdziwy singleton.
- W testach, skryptach i `playwright.config.ts` używaj tylko `env.X` — nigdy `process.env.X` bezpośrednio (np. `baseURL: env.BASE_URL`).
- Błąd walidacji = fail-fast przy starcie z czytelną listą brakujących/nieprawidłowych zmiennych.
- k6 to wyjątek: runtime k6 nie wspiera pakietów npm (brak zod) — tam wartości przez `__ENV.X` + ręczny check na starcie skryptu, uruchomienie przez dotenv-cli: `"perf": "dotenv -e .env -- k6 run ..."`.
- CLI baz danych (psql / mysql / sqlcmd): wrapper dotenv-cli — identycznie na Windows i Linux.
- Nigdy nie hardcoduj sekretów ani URL-i w kodzie; nigdy nie commituj `.env`.

## 🗂️ Walidacja struktur — zod (standard)
- Zod waliduje: zmienne środowiskowe (singleton `env`), odpowiedzi API (schematy zod w `src/api/models/*`, parsowanie w `src/api/requests/*` przez `schema.parse(res.json())` → typowany obiekt) oraz payloady generowane przez factories.
- W testach API każda odpowiedź przechodzi przez schemat zod — kontrakt i typ w jednym miejscu; OpenAPI pozostaje źródłem prawdy o kształcie kontraktu.
- Nie waliduj zodem DOM/UI — od tego są asercje Playwright. Nie używaj zod w skryptach k6 (inny runtime).

## 🧪 API tests
- OpenAPI spec (`OPENAPI_SPEC` in `.env`, file in `docs/openapi/`) is the only source of truth. Never invent endpoints, fields, or status codes. Never mock responses.

## 🧪 Unit tests — Vitest (standard, coverage obowiązkowy)
- Framework: **Vitest** + **@vitest/coverage-v8** (najnowsze wersje); config: `shared/vitest.config.ts` → `vitest.config.ts` (progi 80% statements/branches/functions/lines; raport HTML w `coverage/` — gitignored).
- Skrypty npm: `test:unit` (`vitest run`), `test:unit:watch` (`vitest`), `coverage` (`vitest run --coverage`) — `coverage` to gate w CI, musi przejść progi.
- Specy tylko w `tests/unit/**/*.spec.ts`; kod testowany w `src/`. Jawne importy: `import { describe, expect, it, vi, beforeEach } from 'vitest'`; importy źródeł względne z sufiksem `.js` (ESM).
- Mocki: `vi.mock` / `vi.fn` / `vi.spyOn`; `vi.restoreAllMocks()` w `afterEach`; brak prawdziwego I/O (fs, network, timery) w testach jednostkowych.
- Dane dynamiczne tylko przez faker (`src/utils/faker.ts`) z `faker.seed()` w `beforeEach`; env tylko przez singleton `env.X`.
- Scenariusze/plan per moduł: `docs/scenarios/unit/{module}-unit.scenario.md` (happy path / edge / błędy / mocki).
- Testy jednostkowe własnych elementów projektu Playwright (factories, utils, steps): domyślnie Vitest (`tests/unit/` + coverage). Alternatywnie — projekt Playwright BEZ przeglądarki (zakomentowany `unit-pw` w `shared/playwright.config.ts`, katalog `tests/unit-pw/`), gdy chcesz użyć runnera/fixture'ów Playwright (np. `request`); wtedy bez coverage — Vitest pozostaje bramką.

## 🌿 Git
- `.gitignore`: szablon `shared/gitignore` → kopiuj jako `.gitignore` (node_modules, dist, coverage, playwright-report, test-results, `.env` + warianty, logi, pliki systemowe/IDE, k6-results).
- `package-lock.json` commituj (nigdy nie ignoruj) — patrz sekcja o wersjach bibliotek.
- Empty dirs kept with `.gitkeep`.

## 🌐 Cross-platform
- Windows + Linux: npm scripts only, no OS-specific paths; env expansion via `dotenv-cli` or `$VAR`/`%VAR%` per OS; line endings LF (Biome `lineEnding: lf`). See `docs/CROSS-PLATFORM.md`.
