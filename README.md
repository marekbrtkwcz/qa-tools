# 🧪 qa-tools — zestaw skills i agentów dla testera automatyzującego

Biblioteka wielokrotnego użytku: TypeScript/JavaScript, Playwright (UI / Web API / E2E), k6 (wydajność), Vitest (testy jednostkowe + coverage), testy bezpieczeństwa danych, SQL / konwersje danych. Linter + formatter: Biome. Działa na Windows i Linux.

## ⚙️ Standardy biblioteczne

- **Zmienne środowiskowe**: biblioteka **dotenv**, a dostęp przez **singleton** — `src/config/env.ts` (szablon: `shared/env.ts`) waliduje `.env` przez **zod** i eksportuje zamrożony obiekt `env`; w kodzie tylko `env.X`, nigdy `process.env` bezpośrednio. Szablon `.env.example`: `shared/env.example`.
- **Walidacja struktur**: **zod** — schematy odpowiedzi API w `src/api/models/*`, walidacja env w singletonie, payloady z factories. Wyjątek: skrypty k6 (inny runtime, brak npm) — tam `__ENV` + ręczny check.
- **Linter/formatter**: Biome (`shared/biome.json`).
- **ESM**: wszystkie projekty TS/JS w ECMAScript Modules — `"type": "module"` w `package.json`, `NodeNext` + `verbatimModuleSyntax` w tsconfig, importy względne z `.js`; wyjątek: skrypty k6 (własny runtime).
- **Skrypty package.json**: kanoniczny blok `scripts` z `shared/package.scripts.json` — testy per warstwa (`test:ui`/`test:api`/`test:e2e`/`test:a11y`/`test:security`/`test:unit`), coverage (`coverage` = vitest z progami), Biome, `audit`/`deps:*` (ncu).
- **Testy jednostkowe (Vitest)**: osobny setup `setups/unit-testing-vitest.instructions.md` + skill `qa-unit-vitest`; **coverage obowiązkowy** — config `shared/vitest.config.ts` (provider v8, progi 80%, raport HTML w `coverage/` gitignored), skrypty `test:unit` / `test:unit:watch` / `coverage`. Wewnątrz projektu Playwright testy jednostkowe własnych elementów robimy domyślnie **jednym runnerem = Playwright** (projekt `unit-pw` bez przeglądarki, `tests/unit-pw/`) — Vitest w projekcie Playwright tylko „na siłę”, z coverage.
- **Folder `scripts/` w każdym projekcie**: skrypty TS uruchamiane przez tsx (`npm run script -- scripts/nazwa.ts`, skrypt `script` z `shared/package.scripts.json`); interaktywne CLI na **@clack/prompts** (szablon `shared/script.example.ts`, tylko gdy ma zastosowanie — w CI argumenty/env); **menu zadań** z `package.json`: `shared/menu.ts` → `scripts/menu.ts`, uruchomienie `npm run menu` (kategorie + emotki); **porządki w artefaktach**: `shared/clean.ts` → `scripts/clean.ts`, `npm run clean` (multiselect z emojami + potwierdzenie).
- **`.gitignore`**: szablon `shared/gitignore` — `.env` ignorowany, `package-lock.json` commitujemy.
- **Folder `docs/` w każdym projekcie**: dokumentacja i scenariusze — `docs/openapi/`, `docs/scenarios/<domena>/` (plany od agentów), `docs/adr/`, `docs/guides/`, `docs/architecture/` (szczegóły: `shared/conventions.md`).
- **Wersje zależności (bezpieczeństwo)**: zawsze najnowsze biblioteki (`npm install <pkg>` bez pinów, pin tylko przy udokumentowanej kompatybilności), `package-lock.json` w repo, regularnie `npm audit` + `ncu` (skrypty `deps:check` / `deps:update`, konfig `shared/ncurc.json` → `.ncurc.json`; ncu tylko tam, gdzie jest `package.json` — binarki typu k6 przez menedżera pakietów), najlepiej też Dependabot/Renovate.
- **Generacja danych testowych**: **@faker-js/faker** (szablon: `shared/faker.ts` → `src/utils/faker.ts`) — tylko w factories / `beforeEach` z `faker.seed()` dla powtarzalności; stałe wartości w `src/data/`.
- **CI**: szablon workflow GitHub Actions `shared/ci/github-actions.yml` → `.github/workflows/ci.yml` — job `quality` (Biome `check` + `npm audit --audit-level=high`) i job `test` (`test:all` + `coverage` jako gate); `.env` w CI tworzony wyłącznie z GitHub Secrets.

## 🚀 Jak zacząć (wybierz typ zadania → setup)

| Zadanie | Setup | Skill (Vibe) |
|---|---|---|
| Pełny projekt Playwright (UI + API + E2E) | `setups/playwright-fullstack.instructions.md` | `qa-ui-playwright`, `qa-api-playwright`, `qa-e2e-hybrid` |
| Tylko testy UI | `setups/playwright-ui-only.instructions.md` | `qa-ui-playwright` |
| Tylko testy Web API | `setups/api-testing-only.instructions.md` | `qa-api-playwright` |
| Testy wydajnościowe (k6) | `setups/performance-k6.instructions.md` | `qa-performance-k6` |
| Testy bezpieczeństwa / dane / SQL | `setups/security-and-data.instructions.md` | `qa-security-data`, `qa-data-sql` |
| Testy dostępności WCAG (axe-core, w projekcie Playwright) | `setups/accessibility-wcag.instructions.md` | `qa-accessibility-wcag` |
| Testy jednostkowe kodu TS/JS (Vitest + coverage) | `setups/unit-testing-vitest.instructions.md` | `qa-unit-vitest` |

Testy Web API i bezpieczeństwa wrzucasz **do tego samego projektu Playwright** — mieszkają w `tests/api/`, `tests/api/security/`, `tests/ui/security/` i używają wbudowanych fixture `request` / `page` (bez osobnego frameworku). Testy WCAG dokładasz do tego samego projektu przez `setups/accessibility-wcag.instructions.md`.

## 🗂️ Struktura

```
qa-tools/
├── agents/            # subagenci .agent.md — 4 role na domenę: planner → writer → refactor → code-review
│   ├── ui/  api/  e2e/  performance/  security/  accessibility/  unit/  data/
├── setups/            # setup projektu zależny od typu zadania (.instructions.md)
├── .vibe/skills/      # skille Vibe: qa-ui-playwright, qa-api-playwright, qa-e2e-hybrid,
│                      #   qa-performance-k6, qa-security-data, qa-data-sql, qa-accessibility-wcag, qa-unit-vitest
├── shared/            # biome.json, tsconfig.base.json, playwright.config.ts, env.ts, env.example, conventions.md
│                      #   i pozostałe kanoniczne szablony (single source of truth — kopiuj, nie wklejaj inline)
└── docs/              # ARCHITECTURE.md, EXTENDING.md (jak rozbudowywać), CROSS-PLATFORM.md
```

## ⛓️ Pipeline w każdej domenie

1. **planner** — plan walidowany względem realnego UI (przeglądarka), OpenAPI lub kodu źródłowego (unit); zapis do `docs/scenarios/<domena>/`
2. **writer** — działający kod testowy, uruchamiany aż do zielonego wyniku
3. **refactor** — tylko pliki wskazane przez użytkownika; architektura produkcyjna bez utraty zachowania
4. **code-review** — ścisła checklista; każdy problem z BEFORE/AFTER

Każdy agent kończy obowiązkowym **Work Summary**.

## 🧰 Wbudowane skille narzędziowe

`qa-performance-k6` używa wbudowanych skilli `k6`, `k6-perf-test-website`, `k6-browser-test`, `k6-trend-analysis`, `k6-cloud-investigate-test`, `k6-manage`; `qa-ui-playwright` używa `playwright-best-practices` i `playwright-cli`.

## 🌱 Rozbudowa

Zobacz `docs/EXTENDING.md` — nowa domena = `agents/<domena>/` (4 role) + `.vibe/skills/qa-<domena>/SKILL.md` + `setups/<typ>.instructions.md` + aktualizacja tabeli w `docs/ARCHITECTURE.md`. Skille można też skopiować do `~/.vibe/skills/`, aby działały globalnie. Przed commitem zmian w bibliotece uruchom walidator: `node scripts/validate-library.ts` (lub `npx tsx scripts/validate-library.ts`).
