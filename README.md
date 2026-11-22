# qa-tools

Narzędzia dla testera automatyzującego — **natywne pluginy dla [Mistral Vibe CLI](https://mistral.ai)**: skille, subagenty, baza wiedzy i hooki quality-gate w formacie Agent Plugins 1.0.

Repozytorium inspirowane ideą i strukturą projektu **[awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality)** (MIT, jaktestowac.pl). Wszystkie treści `src/` pochodzą z tego projektu (adaptacja na format natywny Vibe).

## ✨ Kolekcja — 7 pluginów

| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |
|---|---|---|---|---|---|
| `qa-core` 🧭 | 26 | 4 | 1 | — | planowanie testów, eksploracja, bug reporty, RTM, kryteria akceptacji |
| `test-automation` 🤖 | 26 | 5 | — | ✅ test-file-guard | unit testy, TDD, Playwright, mocki, flakiness, review |
| `api-testing` 🔌 | 3 | 2 | — | — | automatyzacja API (Playwright) i contract testing |
| `non-functional-testing` ⚡ | 6 | 1 | — | — | accessibility, performance/load, security |
| `ai-quality` 🧠 | 7 | 1 | 1 | — | testowanie funkcji LLM, guardrails, groundedness |
| `quality-gates` 🚦 | 17 | 4 | 1 | — | quality contracts, change gates, release readiness |
| `authoring` 🛠️ | 9 | 1 | — | — | tworzenie skilli/agentów/pluginów/hooków |

Razem: **94 skille** (61 widocznych dla modelu + 33 user-invocable, pochodzące z komend), **18 subagentów**, **3 knowledge**, **1 quality-gate hook**.

## 🚀 Instalacja

```bash
# wszystkie pluginy (globalnie dla użytkownika):
cp -r plugins/* ~/.vibe/plugins/

# albo wybrane:
cp -r plugins/qa-core ~/.vibe/plugins/qa-core

# albo projektowo (wymaga trusted folder):
cp -r plugins/qa-core <projekt>/.vibe/plugins/qa-core
```

Potem w sesji Vibe: `/reload`.

Weryfikacja:
```
vibe -p "List your plugins" --max-turns 1
vibe -p "Spawn child 'duck' from config 'qa-core:rubber-duck' with message 'hi'"
```

## 🗂️ Struktura

```
qa-tools/
├── src/                              # jedno źródło prawdy
│   ├── skills/<name>/SKILL.md        # skille (+ komendy jako user-invocable)
│   ├── agents/<name>.md              # definicje agentów (neutralny format)
│   └── knowledge/<name>.md           # guides → baza wiedzy
├── bundles.yaml                       # podział na pluginy + członkostwo skilli
├── scripts/
│   ├── build.js                       # build → plugins/ (natywny Vibe)
│   └── assets/test-file-guard.js     # skrypt hooka
└── plugins/<bundle>/              # artefakt buildu — do skopiowania (7 pluginów)
    ├── plugin.json                    # manifest Agent Plugins 1.0 + rozszerzenie ai.mistral.vibe
    ├── skills/                        # 1:1 ze src
    ├── mcp.json                       # z $schema + type (wymagane przez Vibe)
    ├── vibe-hooks/                    # skrypty hooków
    └── ai.mistral.vibe/               # rozszerzenia Vibe
        ├── agents/<name>.toml         # schema_version / agent_type / display_name / enabled_tools…
        ├── knowledge/<name>/KNOWLEDGE.md
        └── hooks.toml                 # pre_tool quality gates
```

## 🔨 Build

```bash
node scripts/build.js            # buduje plugins/<bundle>
node scripts/build.js --check    # walidacja: członkostwo w bundles.yaml, name rules, frontmatter
```

`plugins/` jest commitowany (jak w projekcie źródłowym) — użytkownik może zainstalować bez uruchamiania builda.

## 🔄 Konwersja formatów (Vibe ⚠ inne niż Claude/Copilot/Codex)

| Źródło (awesome-agents-for-quality) | Target Vibe | Uwagi |
|---|---|---|
| `SKILL.md` (open Agent Skills) | `skills/` 1:1 | bez zmian |
| `plugin.json` Agent Plugins 1.0 | 1:1 | bez zmian |
| slash commands | skill z `user-invocable` | Vibe nie ma komend |
| agent `.md` (frontmatter: name/title/description/capabilities) | `agents/*.toml` (snake_case!) | `schema_version`, `agent_type`, `display_name`, opis ≤300 zn., `enabled_tools` |
| guides | `knowledge/<name>/KNOWLEDGE.md` | frontmatter: name/description(≤300)/display_name/icon |
| mcp | `mcp.json` | Vibe wymaga `$schema` + `type` |
| — | `hooks.toml` | Vibe-only: quality gates na eventach `pre_tool`/`post_agent` |

Konwencje potwierdzone testami (patrz historia commitów): klucze TOML **snake_case**, `description` ≤300 znaków, hooki nieblokujące z `strict = false` na start.

## ✅ Co zostało zwalidowane (Vibe headless)

- wszystkie 7 pluginów ładuje się bez błędów walidacji (`plugin.*.invalid`)
- 61 skilli widocznych dla modelu; 33 user-invocable dostępnych na wywołanie
- spawn subagentów z personami z instrukcji: `qa-core:rubber-duck` 🦆, `quality-gates:change-gate-reviewer`, `test-automation:test-code-reviewer`
- 3 knowledge folders (`qa-core:beyond-codegen`, `ai-quality:ai-product-qa`, `quality-gates:quality-governance`)
- hook `pre_tool` test-file-guard (w `test-automation`): wykrywa `waitForTimeout` w zapisie `.spec.ts`, loguje w `$PLUGIN_DATA`

## 🧭 Roadmapa

- [ ] orkiestracje ze źródła (`orchestration-basics`, `plan-explore-review-commit`, `ui-api-automation`) → subagenty Wibe
- [ ] `connectors.json` (GitHub, k6) dla bundle'i automatyzujących
- [ ] GitHub Actions CI: `build.js --check` + weryfikacja ładowania pluginu w Vibe headless
- [ ] hook strict (blokujący) po zdefiniowaniu polityki jakości

## 📄 Licencja i atrybucja

MIT © Marek Bortkiewicz. Treści `src/` adaptowane z [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl), w tym oryginalny plik licencji źródła zachowany w `LICENSE`.
