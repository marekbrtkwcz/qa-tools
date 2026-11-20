# QA Tools

Plugin Vibe CLI z kompletnym zestawem narzędzi AI dla inżynierii jakości.

## Struktura

```
.vibe/plugins/qa-tools/
├── plugin.json                          # manifest Agent Plugins 1.0
├── skills/                              # wiedza ładowana on-demand
│   ├── playwright-test-writing/
│   ├── api-testing/
│   ├── test-planning/
│   └── qa-best-practices/
└── ai.mistral.vibe/
    └── agents/                          # subagenty pipeline'u testowego
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
        └── e2e-test-code-reviewer.toml  # review kodu E2E
```

## Pipeline testowy

```
Planner → Writer → Refactor → Code Reviewer
```

Dostępny dla trzech obszarów: **UI**, **API**, **E2E**.

## Użycie

Plugin ładuje się automatycznie w zaufanym projekcie. Subagenty są dostępne jako `qa-tools:<nazwa>` (np. `qa-tools:ui-test-planner`). Skille można wywołać przez `/playwright-test-writing` lub model załaduje je automatycznie.
