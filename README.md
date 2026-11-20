# QA Tools

[![Validate plugin](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml/badge.svg)](https://github.com/marekbrtkwcz/qa-tools/actions/workflows/validate-plugin.yml)

Plugin Vibe CLI (format Agent Plugins 1.0) z kompletnym zestawem narzędzi AI dla inżynierii jakości: 8 pipeline'ów testowych × 4 etapy = **40 subagentów**, **13 skillów**, **3 hooki**, **3 wpisy wiedzy**.

| Obszar | Subagenty | Cel |
|---|---|---|
| UI | `qa-tools:ui-test-*` | testy Playwright UI |
| API | `qa-tools:api-test-*` | testy API (Playwright request, OpenAPI) |
| E2E | `qa-tools:e2e-test-*` | pełne flow użytkownika |
| mobile | `qa-tools:mobile-test-*` | emulacja urządzeń, gesty touch |
| visual | `qa-tools:visual-test-*` | visual regression (`toHaveScreenshot`) |
| load | `qa-tools:load-test-*` | testy obciążeniowe k6 |
| DB | `qa-tools:db-test-*` | weryfikacja migracji danych / ETL |
| contract | `qa-tools:contract-test-*` | testy kontraktowe (Pact / OpenAPI) |
| a11y | `qa-tools:a11y-test-*` | dostępność WCAG (axe-core, klawiatura, czytnik ekranu) 🆕 |
| security | `qa-tools:security-test-*` | OWASP Top 10, XSS/CSRF, IDOR, sekrety 🆕 |

Każdy pipeline: `planner → writer → refactor → code-reviewer`.

## Instalacja w innym projekcie

Plugin ładuje się automatycznie, gdy katalog `.vibe/plugins/qa-tools/` znajdzie się w **zaufanym folderze** projektu:

```bash
# 1. Skopiuj plugin do projektu (z tego repo lub submodule)
git clone https://github.com/marekbrtkwcz/qa-tools.git /tmp/qa-tools
mkdir -p .vibe/plugins
cp -r /tmp/qa-tools/.vibe/plugins/qa-tools .vibe/plugins/

# 2. Zaufaj folderowi projektu (jednorazowo, w TUI Vibe lub przez ~/.vibe/trusted_folders.toml)
#    ~/.vibe/trusted_folders.toml:
#    folders = ["C:\\ścieżka\\do\\projektu"]

# 3. W projekcie: /reload-plugins (lub restart Vibe), potem sprawdź:
#    /plugins  → qa-tools
#    /skills   → 11 skillów z tagiem plugin:qa-tools

# 4. (opcjonalnie) walidacja struktury pluginu
py scripts/validate-plugin.py
```

Użycie: subagenty jako `qa-tools:<nazwa>` (np. `qa-tools:ui-test-planner`), skille przez `/<nazwa-skilla>` lub auto-load.

## Publikacja

Repozytorium: `github.com/marekbrtkwcz/qa-tools` (branch `main`). Zmiany publikuje się standardowo: `git push origin main`. Wersja pluginu w `.vibe/plugins/qa-tools/plugin.json`, historia w `CHANGELOG.md`. Licencja: MIT (`LICENSE`).

## Struktura

```
.vibe/plugins/qa-tools/
├── plugin.json                          # manifest Agent Plugins 1.0
├── skills/                              # wiedza ładowana on-demand (13 skillów)
│   ├── playwright-test-writing/
│   ├── api-testing/
│   ├── accessibility-testing/
│   ├── performance-testing/
│   ├── security-testing/
│   ├── ci-cd-pipelines/
│   ├── test-data-management/
│   ├── data-migration-testing/
│   ├── contract-testing/
│   ├── test-planning/
│   ├── mobile-testing/
│   ├── websocket-sse-testing/
│   └── qa-best-practices/
└── ai.mistral.vibe/
    ├── agents/                          # 40 subagentów pipeline'u testowego (10 obszarów × 4 etapy)
    ├── hooks.toml                       # lint plików testowych, typecheck, konwencje QA
    └── knowledge/                       # baza wiedzy (architektura Playwright, wzorce, słownik QA)
```

```
    agents/
        ├── ui-test-planner.toml         # planowanie testów UI
        ├── ui-test-writer.toml          # pisanie testów UI
        ├── ui-test-refactor.toml        # refaktoryzacja UI
        ├── ui-test-code-reviewer.toml   # review kodu UI
        ├── api-test-planner.toml        # planowanie testów API
        ├── api-test-writer.toml         # pisanie testów API
        ├── api-test-refactor.toml       # refaktoryzacja API
        ├── api-test-code-reviewer.toml  # review kodu API
        ├── e2e-test-planner.toml        # planowanie testów E2E
        ├── e2e-test-writer.toml         # pisanie testów E2E
        ├── e2e-test-refactor.toml       # refaktoryzacja E2E
        ├── e2e-test-code-reviewer.toml  # review kodu E2E
        ├── mobile-test-planner.toml     # planowanie testów mobile 🆕
        ├── mobile-test-writer.toml      # pisanie testów mobile 🆕
        ├── mobile-test-refactor.toml    # refaktoryzacja mobile 🆕
        ├── mobile-test-code-reviewer.toml # review kodu mobile 🆕
        ├── visual-test-planner.toml     # planowanie testów wizualnych 🆕
        ├── visual-test-writer.toml      # pisanie testów wizualnych 🆕
        ├── visual-test-refactor.toml    # refaktoryzacja visual 🆕
        ├── visual-test-code-reviewer.toml # review kodu visual 🆕
        ├── load-test-planner.toml       # planowanie testów obciążeniowych (k6) 🆕
        ├── load-test-writer.toml        # pisanie skryptów k6 🆕
        ├── load-test-refactor.toml      # refaktoryzacja k6 🆕
        ├── load-test-code-reviewer.toml # review kodu k6 🆕
        ├── db-test-planner.toml         # planowanie weryfikacji migracji danych 🆕
        ├── db-test-writer.toml          # pisanie testów weryfikacji migracji 🆕
        ├── db-test-refactor.toml        # refaktoryzacja testów DB 🆕
        ├── db-test-code-reviewer.toml   # review kodu testów DB 🆕
        ├── contract-test-planner.toml   # planowanie testów kontraktowych 🆕
        ├── contract-test-writer.toml    # pisanie testów kontraktowych (Pact) 🆕
        ├── contract-test-refactor.toml  # refaktoryzacja kontraktów 🆕
        └── contract-test-code-reviewer.toml # review kodu kontraktów 🆕
        ├── a11y-test-planner.toml           # planowanie testów dostępności (a11y) 🆕
        ├── a11y-test-writer.toml            # pisanie testów a11y (axe-core, klawiatura) 🆕
        ├── a11y-test-refactor.toml          # refaktoryzacja testów a11y 🆕
        └── a11y-test-code-reviewer.toml     # review kodu testów a11y 🆕
        ├── security-test-planner.toml       # planowanie testów bezpieczeństwa 🆕
        ├── security-test-writer.toml        # pisanie testów security (XSS/CSRF/IDOR) 🆕
        ├── security-test-refactor.toml      # refaktoryzacja testów security 🆕
        └── security-test-code-reviewer.toml # review kodu testów security 🆕
```

## Pipeline testowy

```
Planner → Writer → Refactor → Code Reviewer
```

Dostępny dla dziesięciu obszarów: **UI**, **API**, **E2E**, **mobile**, **visual (regression)**, **load (k6)**, **DB (weryfikacja migracji danych/ETL)**, **contract (Pact / OpenAPI)**, **a11y (dostępność WCAG)**, **security (OWASP Top 10)**.

## Konwencje qa-tools (wymuszane przez wszystkich 32 agentów)

Każdy subagent zna i stosuje te same konwencje:

- **Nazewnictwo testów**: po angielsku, format `should <rezultat> when <warunek>`; pliki kebab-case `.spec.ts`; `describe` = nazwa funkcjonalności, bez słowa "test"
- **Asercje**: tylko `await expect(...)` z auto-retry — nigdy `waitForTimeout`; asercje konkretne (dokładny tekst/URL/status), nigdy samo "element istnieje"
- **Selektory** (Playwright): tylko `getByRole` / `getByLabel` / `getByText` / `getByTestId` — żadnych kruchych CSS/XPath
- **Struktura**: testy w `tests/<area>/`, plany w `docs/scenarios/<area>/`, skrypty k6 w `load/`; baseURL/sekrety tylko z env
- **Page Object Model**: tylko na etapie refaktoryzacji i na wyraźne żądanie — `tests/pages/BasePage.ts` + jedna klasa na ekran
- **Plany** mają wspólny format (warunki wstępne → kroki → punkty walidacji → dane → poza zakresem); **review** ma wspólny format raportu z skalą ważności (krytyczny / ważny / sugestia)

## Użycie

Plugin ładuje się automatycznie w zaufanym projekcie. Subagenty są dostępne jako `qa-tools:<nazwa>` (np. `qa-tools:ui-test-planner`). Skille można wywołać przez `/playwright-test-writing` lub model załaduje je automatycznie.

## Development

Lokalna walidacja przed commitem (to samo robi CI na każdym pushu/PR):

```bash
py scripts/validate-plugin.py                  # struktura pluginu, exit 0/1
python -m unittest discover -s tests -v       # testy jednostkowe walidatora
```

## Walidacja pluginu

```
py scripts/validate-plugin.py                    # Python 3.11+, tylko stdlib
python -m unittest discover -s tests -v         # testy jednostkowe walidatora (stdlib)
```

Skrypt sprawdza: `plugin.json`, wszystkie 32 TOML-e agentów (klucze, konwencje nazewnictwa, zakaz `waitForTimeout`, reguły `__ENV`/`thresholds` dla k6), frontmatter 11 skillów, `hooks.toml`, wpisy `knowledge/`, zgodność przykładu referencyjnego z konwencjami oraz spójność wersji i liczb (`plugin.json` ↔ `CHANGELOG.md` ↔ README). Exit code 0 = OK, 1 = błędy. Przydatne lokalnie i w CI — na każdym pushu/PR do `main` uruchamia je workflow `.github/workflows/validate-plugin.yml`.

## Przykład referencyjny

```
examples/
├── docs/scenarios/ui/login.md    # plan scenariusza UI w formacie wymaganym przez plannerów
├── docs/scenarios/api/users.md   # plan scenariusza API
├── tests/ui/login.spec.ts        # test Playwright UI zgodny z konwencjami qa-tools
└── tests/api/users.spec.ts       # test API (fixture request) zgodny z konwencjami qa-tools
```

To punkt odniesienia dla agentów i użytkowników: pokazuje, jak wygląda plan scenariusza i test napisany zgodnie z konwencjami (nazewnictwo `should ... when ...`, selektory `getBy*`, asercje `await expect(...)`, sekrety z env).
