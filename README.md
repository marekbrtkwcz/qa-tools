# QA Tools

Plugin Vibe CLI z kompletnym zestawem narzędzi AI dla inżynierii jakości.

## Struktura

```
.vibe/plugins/qa-tools/
├── plugin.json                          # manifest Agent Plugins 1.0
├── skills/                              # wiedza ładowana on-demand (9 skillów)
│   ├── playwright-test-writing/
│   ├── api-testing/
│   ├── accessibility-testing/
│   ├── performance-testing/
│   ├── security-testing/
│   ├── ci-cd-pipelines/
│   ├── test-data-management/
│   ├── test-planning/
│   └── qa-best-practices/
└── ai.mistral.vibe/
    ├── agents/                          # 24 subagenty pipeline'u testowego
    ├── hooks.toml                       # lint plików testowych, typecheck, konwencje QA
    └── knowledge/                       # baza wiedzy (architektura Playwright, wzorce, słownik QA)
```
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
        └── load-test-code-reviewer.toml # review kodu k6 🆕
```

## Pipeline testowy

```
Planner → Writer → Refactor → Code Reviewer
```

Dostępny dla sześciu obszarów: **UI**, **API**, **E2E**, **mobile**, **visual (regression)**, **load (k6)**.

## Konwencje qa-tools (wymuszane przez wszystkich 24 agentów)

Każdy subagent zna i stosuje te same konwencje:

- **Nazewnictwo testów**: po angielsku, format `should <rezultat> when <warunek>`; pliki kebab-case `.spec.ts`; `describe` = nazwa funkcjonalności, bez słowa "test"
- **Asercje**: tylko `await expect(...)` z auto-retry — nigdy `waitForTimeout`; asercje konkretne (dokładny tekst/URL/status), nigdy samo "element istnieje"
- **Selektory** (Playwright): tylko `getByRole` / `getByLabel` / `getByText` / `getByTestId` — żadnych kruchych CSS/XPath
- **Struktura**: testy w `tests/<area>/`, plany w `docs/scenarios/<area>/`, skrypty k6 w `load/`; baseURL/sekrety tylko z env
- **Page Object Model**: tylko na etapie refaktoryzacji i na wyraźne żądanie — `tests/pages/BasePage.ts` + jedna klasa na ekran
- **Plany** mają wspólny format (warunki wstępne → kroki → punkty walidacji → dane → poza zakresem); **review** ma wspólny format raportu z skalą ważności (krytyczny / ważny / sugestia)

## Użycie

Plugin ładuje się automatycznie w zaufanym projekcie. Subagenty są dostępne jako `qa-tools:<nazwa>` (np. `qa-tools:ui-test-planner`). Skille można wywołać przez `/playwright-test-writing` lub model załaduje je automatycznie.
