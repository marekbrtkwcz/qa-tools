# 📦 Changelog

Historia zmian biblioteki **qa-tools**. Format: [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), wersjonowanie: [SemVer](https://semver.org/). Tag `vX.Y.Z` zakładany lokalnie przy każdej paczce zmian (`docs/EXTENDING.md` §6).

## [1.2.0] — 2026-11-07

### ➕ Added

- ⚡ `docs/QUICKSTART.md` — ścieżka „5 minut do pierwszego testu" (scaffold → install → pierwszy test → pipeline agentów); link w README.
- 🐳 `shared/docker-compose.yml` — szablon lokalnego środowiska (Postgres 16 + Redis 7 + RabbitMQ z healthcheckami, sekrety przez `.env`); wpis w conventions i walidatorze (20 szablonów).
- 🖼️ Visual regression — sekcje w `qa-ui-playwright` i `conventions.md`: `toHaveScreenshot`, baseline w `tests/ui/__screenshots__/`, `mask` dla dynamicznych treści, `--update-snapshots` przed commitem.
- 🤝 Contract testing (Pact) — sekcja w `qa-api-playwright`: consumer test z mock providerem, publikacja do Pact Broker, osobny job `test:contract:verify` w CI.
- 📱 **Domena mobile**: `agents/mobile/` (4 role: planner/writer/refactor/code-review z sekcją „Mobile specifics" — device emulation, touch, viewport), skill `qa-mobile-playwright`, setup `setups/mobile-playwright.instructions.md` (projekt `mobile` z `devices['iPhone 14']` / `devices['Pixel 7']`). Sync README/ARCHITECTURE/walidator — 9 skilli, 36 agentów, 8 setupów.
- 🧪 CI: nowy job `test` w `library-ci.yml` — `npm ci` + `npm test` (Vitest, testy `tests/library/`) obok walidatora i Gitleaksa; `version` w `package.json` zsynchronizowany do 1.2.0.

## [1.1.1] — 2026-11-07

### ➕ Added

- 🔒 `shared/security-payloads.ts`: nowe kanarki **NoSQLi** (`NOSQLI_CANARY`), **XXE** (`XXE_CANARY`), **deserialization** (`DESERIALIZATION_CANARY`) + wpisy `SECURE_BEHAVIOR` i rozszerzony `CANARIES`.
- 🔌 Skill `qa-api-playwright`: sekcje **GraphQL** (kontrakt ze schematu, zod dla `data`/`errors`, negatywne: depth/errors) i **WebSocket** (`waitForEvent('websocket')`, `ws` npm, jawne timeouty).
- 🔍 Walidator: check opisów agentów (słowa kluczowe PL **i** EN, min. 40 znaków) + mapowanie setup → skill (każdy setup ma przypisany skill z tabeli README). Poprawiono 10 opisów agentów (api/e2e/ui) — dodano polskie słowa kluczowe.

## [1.1.0] — 2026-11-07

### ➕ Added

- 🔍 **CI biblioteki** — `.github/workflows/library-ci.yml`: walidator `validate-library.ts` + Gitleaks przy każdym push/PR do `main` (czysty Node 22, bez `npm install`).
- 🧪 **Testy jednostkowe skryptów biblioteki** — `package.json` (devDeps: vitest, tsx), `vitest.config.ts`, `tests/library/validate-library.spec.ts` + `tests/library/new-project.spec.ts` (8 testów black-box przez `spawnSync`: walidator exit 0, scaffold dry-run, struktura katalogów, package.json/tsconfig per setup, security templates, odrzucanie niepustego katalogu). `npm test` w root biblioteki.
- 📦 **Przykładowy projekt** — `examples/demo-project/` wygenerowany przez scaffold (`playwright-fullstack`) z przykładowymi plikami: `LoginPage` (POM), `tests/ui/login.spec.ts`, `tests/api/health.spec.ts`, `docs/scenarios/ui/login.ui.scenario.md` + `examples/README.md` jak uruchomić.
- Walidator rozszerzony o sekcję 5b: wymagane pliki infrastruktury (`package.json`, `vitest.config.ts`, `.github/workflows/library-ci.yml`, `tests/library/*.spec.ts`, `examples/README.md`).

## [1.0.0] — 2026-11-05

Pierwsza stabilna wersja biblioteki. Bilans: 8 skilli, 32 agentów (8 domen × 4 role, bez pinów `model:`), 7 setupów, 19 szablonów `shared/`, walidator + scaffold projektów.

### ➕ Added

- 📦 `CHANGELOG.md` + zasady wersjonowania w `docs/EXTENDING.md` §6 — każda paczka zmian = wpis + bump wersji + tag `vX.Y.Z`.
- Walidator pilnuje obecności `CHANGELOG.md` i sekcji wersji.

## [0.14.0] — 2026-11-05

### ➕ Added

- 🔒 Paczka security: `shared/security-payloads.ts` (kanarkowe payloady XSS/SQLi/traversal/SSRF/cmd, `SECURE_BEHAVIOR`, skaner wycieków `scanForLeaks()` z maskowaniem wyników, `EXPECTED_SECURITY_HEADERS`), `shared/security-fixtures.ts` (role `userRequest()` / `adminRequest()` / `anonymousRequest()`, asercje `expectNoIdorLeak()` / `expectUnauthorized()`), `shared/security-plan.template.md` (rules of engagement, macierz OWASP A01–A07, rejestr findings).
- 🛡️ **Gitleaks** w szablonie CI (`shared/ci/github-actions.yml`).
- Scaffold `new-project.ts` kopiuje szablony security tylko do setupów z warstwą security; skill `qa-security-data`, setup i README/ARCHITECTURE wskazują szablony zamiast „stwórz od zera”.

## [0.13.0] — 2026-11-05

### ➕ Added

- 🌟 Skrypt `test:everything` — pełny bieg (wszystkie warstwy + coverage) przed commitem/releasem; scaffold komponuje go z tego, co setup faktycznie ma.

### 🔄 Changed

- Scaffold: setupy unit-only zachowują `test:unit` (wcześniej gubiły go na rzecz `test:everything`).

## [0.12.0] — 2026-11-05

### ➕ Added

- 🏗️ `scripts/new-project.ts` — scaffold projektu z setupów: menu @clack/prompts albo flagi `--setup=` / `--dir=` / `--dry-run`; tworzy strukturę, kopiuje szablony z `shared/`, składa `package.json` i przycina `tsconfig` per setup. Podpięty w README, EXTENDING i walidatorze.

## [0.11.0] — 2026-11-05

### ➕ Added

- 📋 `shared/adr-template.md` — szablon ADR (status, tabela opcji, konsekwencje) do `docs/adr/` w projektach; podpięty w conventions, README i walidatorze.

## [0.10.0] — 2026-11-05

### 🔄 Changed

- 🧭 `menu.ts` czyta zadania **dynamicznie z `package.json`** (zamiast twardej listy „EDYTUJ”): nowe skrypty npm pojawiają się w menu same; kategorie po prefiksie, w CI tryb bez promptów (`npm run menu -- <zadanie>`).
- EXTENDING doprecyzowane o pliki konwencji globalnej (`shared/playwright.config.ts` na liście).

### ➕ Added

- Konwencja husky + lint-staged (pre-commit `biome check --write` na plikach staged) — opcjonalnie, konfiguracja w `shared/conventions.md`.

## [0.9.0] — 2026-11-05

### ➕ Added

- 🗄️ Domena `agents/data` (SQL & data quality — 4 role) + skill `qa-data-sql`; setup `security-and-data` obsługuje oba obszary.
- `shared/ci/github-actions.yml` — szablon workflow GitHub Actions (Biome + audit → testy → coverage jako gate); jedyny element wymuszający platformę CI.

## [0.8.0] — 2026-11-05

### ➕ Added

- 🔍 `scripts/validate-library.ts` — bramka pre-commit biblioteki: frontmatter skilli, zakaz pinów `model:` w agentach, komplet 4 ról per domena, sync README/ARCHITECTURE z katalogami, komplet szablonów `shared/`.

## [0.7.0] — 2026-11-05

### 🔄 Changed

- 🧭 Jedna zasada: **jeden runner na projekt Playwright** — testy jednostkowe elementów projektu idą do bezprzeglądarkowego projektu `unit-pw` (`tests/unit-pw/`); Vitest tylko standalone albo „na upór” (coverage obowiązkowy w obu wariantach).
- 🧹 Usunięte twarde piny `model:` z 28 agentów — każdy subagent dziedziczy aktywny model sesji Vibe.
- Unifikacja szablonów: kanoniczny `shared/playwright.config.ts` + singleton `env` wszędzie; likwidacja dryfu biome/tsconfig definiowanego inline.
- 📋 Reporter Playwright: `list` z `printSteps: true` + `html` (open: never).

### ➕ Added

- Opcjonalny bezprzeglądkowy projekt `unit-pw` w shared config + notka konwencyjna.

## [0.6.0] — 2026-11-05

### ➕ Added

- 🧪 Domena unit: `agents/unit` (4 role), skill `qa-unit-vitest`, setup `unit-testing-vitest`, `shared/vitest.config.ts` (provider v8, progi 80%, raport HTML w `coverage/`); skrypty `test:unit` / `coverage`. **Coverage obowiązkowy.**

## [0.5.0] — 2026-11-05

### ➕ Added

- 🙈 `shared/gitignore` — kanoniczny `.gitignore` (`.env` ignorowany, lockfile commitowany).
- 🧭 `shared/menu.ts` — interaktywne menu zadań na @clack/prompts.
- 🧹 `shared/clean.ts` — porządki w artefaktach testowych (multiselect z emotkami + potwierdzenie).

## [0.4.0] — 2026-11-05

### 🔄 Changed

- 🎨 Emotki w nagłówkach markdown we wszystkich docs, skillach, agentach i setupach (frontmatter, JSON i kod nietknięte).
- 🖥️ Standard **@clack/prompts** dla interaktywnych CLI w projektach TS/JS; szablon `shared/script.example.ts` (w CI argumenty/env zamiast promptów).

## [0.3.0] — 2026-11-05

### ➕ Added

- ♻️ Standardy biblioteczne: **dotenv** dla env (singleton `shared/env.ts` z walidacją **zod**), **@faker-js/faker** do generacji danych (`shared/faker.ts`, seed dla powtarzalności), **npm-check-updates** (`shared/ncurc.json`, skrypty `deps:*`), kanoniczny blok `scripts` (`shared/package.scripts.json`), obowiązkowy `docs/` (dokumentacja + scenariusze), **ESM** wszędzie, folder **`scripts/`** na skrypty tsx w każdym projekcie.
- 🔐 Konwencja bezpieczeństwa: zawsze najnowsze wersje bibliotek.

## [0.2.0] — 2026-11-05

### ➕ Added

- ♿ Domena dostępności: `agents/accessibility`, skill `qa-accessibility-wcag`, setup `accessibility-wcag` (axe-core w projekcie Playwright).

### 🔄 Changed

- Testy Web API i bezpieczeństwa mieszkają w **tym samym projekcie Playwright** (`tests/api/`) na fixture `request` — bez osobnego frameworku.

## [0.1.0] — 2026-11-05

### ➕ Added

- 🎉 Pierwszy release biblioteki: domeny `ui`, `api`, `e2e`, `performance`, `security` (po 4 role: planner → writer → refactor → code-review), skille `qa-*`, setupy per typ zadania, warstwy wspólne `shared/` (Biome, tsconfig, conventions).
