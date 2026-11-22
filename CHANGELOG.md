# CHANGELOG

Wszystkie istotne zmiany tego projektu są dokumentowane tutaj. Format zbliżony do [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); wydanie kolekcji = tag `vx.y.z` na historii gita. Wersje per-bundle w `bundles.yaml` są podbijane w tym samym wydaniu (`node scripts/build.js --set-version x.y.z`), więc `plugin.json` każdego pluginu ma wersję kolekcji.

## [Unreleased]

### Naprawione
- 11 martwych manifestów `mcp.json` (puste `mcpServers: {}`) usuniętych z artefaktu — build emituje `mcp.json` tylko w bundlach deklarujących `mcp:` (dziś wyłącznie `qa-mcp`), tak samo jak robi to dla `hooks.toml`.

### Zmienione
- Serwer Playwright MCP w `qa-mcp` przypięty z `@playwright/mcp@0.0.83` na `@0.0.86` (aktualny latest wg rejestru npm).

## [0.2.0] - 2026-11-22

Cykl przeglądu i usztytniania kolekcji (7 zmian z audytu). Wszystkie pluginy: wersja 0.2.0.

### Dodane
- **plugin `qa-mcp`** 🎭 — serwer Playwright MCP (`@playwright/mcp@0.0.83`, wersja przypięta zamiast `@latest`), zdeduplikowany z 5 bundli, które deklarowały każdy własny (qa-core, test-automation, non-functional-testing, ui-api-automation, ui-api-automation-minimal). Instalacja kilku bundli powielała serwer (do 6 duplikatów w jednej sesji Vibe).
- **Drift-gate**: `node scripts/build.js --verify` — świeży build w katalogu tmp porównany z commitowanym `plugins/`; exit 1 z listą plików brakujących / nadmiarowych / zmienionych. Toleruje wyłącznie różnice EOL (working tree z `core.autocrlf=true` przepisuje pliki przy każdym checkout).
- `scripts/validate-manifests.js` — walidacja parsowania wszystkich JSON-ów w `plugins/` (24 manifesty).
- **CI** (`.github/workflows/ci.yml`): matrysa ubuntu + windows; testy jednostkowe, `--check`, manifesty, drift-gate.
- `package.json` — npm scripts (`build / check / verify / validate-manifests / test / ci`), `engines: node >=18`, zero zależności.
- `scripts/build.test.js` — 17 testów builda (node:test): parser YAML (CRLF, cudzysłowy, booleany), frontmatter agentów, mapowanie capabilities→Vibe, klasyfikacja `safety=neutral`, granica 300 znaków opisów, rewrite packów, drift-gate, filtr `openai.yaml`, `--set-version`.
- `--set-version <x.y.z>` w buildzie — bump wersji bundli w `bundles.yaml` z zachowaniem komentarzy, wcięć i EOL.
- CHANGELOG + tagi wydawnicze (`v0.1.0` = stan kolekcji przed przeglądem, `d96ffca`).

### Zmienione
- Hook **`test-file-guard`** (test-automation): model severity — **blokuje** zapis `.only()` / `fit()` / `fdescribe()` w plikach testowych (structured `{"decision":"deny"}` zgodnie z wire protokołem Vibe, klasyfikacja po nazwie pliku, zero false-positive; `.only()` poza plikiem testowym = ostrzeżenie), **ostrzega** o `waitForTimeout()`, sleepach (`cy.wait`/`Thread.sleep`), tautologiach (`expect(true).toBe(true)`) i konstrukcjach always-pass (`system_message` + log w `$PLUGIN_DATA`). Skrypt zawsze kończy się exit 0 — awaria hooka jest fail-open, a nie blokującą.
- Bundele bez zadeklarowanych hooków nie dostają już pustego `hooks.toml` i zbędnej kopii skryptu guard-a (dawniej 10 z 11).
- Driver-skille paczek `ui-api-automation` i `ui-api-automation-minimal`: jawna notka, że UI wymaga pluginu `qa-mcp` (lub już skonfigurowanego serwera Playwright MCP).

### Naprawione
- Wiersze tabel agentów w wygenerowanych SKILL.md 4 paczek traciły zamykającą kreskę (niepoprawny markdown) — wyłapane testami jednostkowymi, naprawione w `rewritePackSkill`.
- Artefakty nie zawierają już 42 plików wyzwalaczy Codex/OpenAI (`skills/*/agents/openai.yaml`) — ich polityka invocation i tak siedzi we frontmatter SKILL.md (`disable-model-invocation`; zweryfikowane 42/42 przed usunięciem).

### Uwagi o upgrade
- Jeśli używasz automatyzacji przeglądarkowej: doinstaluj `qa-mcp` i odśwież pozostałe bundele (`cp -r plugins/* ~/.vibe/plugins/`, potem `/reload`). Starsze kopie qa-core / test-automation / non-functional-testing / paczek ui-api nadal deklarują własny serwer Playwright MCP.
- Po ręcznych edycjach `src/` zawsze przebuduj i zcommituj `plugins/` — CI ma drift-gate.

## [0.1.0] - 2026-11-22

Pierwsze wydanie: 11 pluginów natywnych dla Vibe CLI (Agent Plugins 1.0), adaptacja treści [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl):

- 98 skilli, 41 subagentów, 7 knowledge, quality-gate hook `test-file-guard` (log-only), konwencja emotek jako single-source (`src/shared/emoji-style.md`) wstrzykiwana do każdego SKILL.md i instrukcji każdego agenta.
- Bundle: qa-core, test-automation, api-testing, non-functional-testing, ai-quality, quality-gates, authoring + 4 paczki orkiestracyjne (orchestration-basics, plan-explore-review-commit, ui-api-automation, ui-api-automation-minimal).
