# qa-tools

Narzędzia dla testera automatyzującego — **natywne pluginy dla [Mistral Vibe CLI](https://mistral.ai)**: skille, subagenty, baza wiedzy i hooki quality-gate w formacie Agent Plugins 1.0.

Repozytorium inspirowane ideą i strukturą projektu **[awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality)** (MIT, jaktestowac.pl). Wszystkie treści `src/` pochodzą z tego projektu (adaptacja na format natywny Vibe).

## ✨ Kolekcja — 7 bundle'ów + 4 orkiestracje

| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |
|---|---|---|---|---|---|
| `qa-core` 🧭 | 26 | 4 | 1 | — | planowanie testów, eksploracja, bug reporty, RTM, kryteria akceptacji |
| `test-automation` 🤖 | 26 | 5 | — | ✅ test-file-guard | unit testy, TDD, Playwright, mocki, flakiness, review |
| `api-testing` 🔌 | 3 | 2 | — | — | automatyzacja API (Playwright) i contract testing |
| `non-functional-testing` ⚡ | 6 | 1 | — | — | accessibility, performance/load, security |
| `ai-quality` 🧠 | 7 | 1 | 1 | — | testowanie funkcji LLM, guardrails, groundedness |
| `quality-gates` 🚦 | 17 | 4 | 1 | — | quality contracts, change gates, release readiness |
| `authoring` 🛠️ | 9 | 1 | — | — | tworzenie skilli/agentów/pluginów/hooków |
| `orchestration-basics` 🎼 | 1 | 3 | 1 | — | paczka: orchestrator + planner/explorer/analyst (start tutaj) |
| `plan-explore-review-commit` 🔄 | 1 | 9 | 1 | — | paczka: pełny pipeline dostarczania z review i commitem |
| `ui-api-automation` 🖥️ | 1 | 7 | 1 | — | paczka: pipeline testów UI + API (explorers → plan → implement → run) |
| `ui-api-automation-minimal` 🧪 | 1 | 4 | 1 | — | paczka: minimalna wersja powyższego |

Razem: **98 skilli**, **41 subagentów**, **7 knowledge**, **1 quality-gate hook**.

Paczki orkiestracyjne działają jak w źródle: driver-skill (user-invocable) prowadzi orkiestrację, każdy krok delegujesz do subagenta przez `tools.agents` + `config_name` (np. `plan-explore-review-commit:perc-implementer`); GUIDE paczki jest jej knowledge. Build przepisuje instrukcje hostów (Claude Code / Codex) na Vibe: tabela agentów dostaje kolumnę `Vibe` z dokładnie tymi `config_name`, które Vibe potrafi zespawnować.

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

## 🎨 Konwencja emotek

Emotki w tej kolekcji **niosą znaczenie, nie ozdobę** — i są wpisane w projekt na jednym poziomie: single-source w `src/shared/emoji-style.md`, a build wstrzykuje je (sekcja `## 🎨 Emoji in output`) do **każdego wygenerowanego SKILL.md (98)** i instrukcji **każdego subagenta (41 tom)**. Dzięki temu:

- 🗨️ **zachowanie agentów** — każdy subagent dostaje konwencję w instrukcjach,
- 📋 **generowane raporty** — skille QA użyją jej w nagłówkach, tabelach i statusach,
- 📖 **dokumentacja** — poniższe słownictwo obowiązuje też w README.

Słownictwo (pełne w `src/shared/emoji-style.md`): ✅ passed · ❌ failed/defekt · ⚠️ ryzyko · 🚧 blocked · 🚢 release go · ⛔ no-go · 🐛 bug · 📊 metryki · 🔍 luka · 🧪 test.

Zasady: jedna emotka na nagłówek/komórkę statusu, **nigdy** w nazwach testów, identyfikatorach kodu, plikach, commitach i branchach.

Zmiana konwencji = edycja `src/shared/emoji-style.md` + `node scripts/build.js`. 🚫 nie edytuj wygenerowanych `plugins/` ręcznie.

## 🔄 Konwersja formatów (Vibe ⚠ inne niż Claude/Copilot/Codex)

| Źródło (awesome-agents-for-quality) | Target Vibe | Uwagi |
|---|---|---|
| `SKILL.md` (open Agent Skills) | `skills/` 1:1 | + wstrzykiwana sekcja emotek (patrz 🎨 wyżej) |
| `plugin.json` Agent Plugins 1.0 | 1:1 | bez zmian |
| slash commands | skill z `user-invocable` | Vibe nie ma komend |
| agent `.md` (frontmatter: name/title/description/capabilities, w paczkach też `tools: Read, Grep…`) | `agents/*.toml` (snake_case!) | `schema_version`, `agent_type`, `display_name`, opis ≤300 zn., `enabled_tools`; Edit/Write/Bash → `safety = "neutral"` |
| guides | `knowledge/<name>/KNOWLEDGE.md` | frontmatter: name/description(≤300)/display_name/icon |
| mcp | `mcp.json` | Vibe wymaga `$schema` + `type` |
| — | `hooks.toml` | Vibe-only: quality gates na eventach `pre_tool`/`post_agent` |

Konwencje potwierdzone testami (patrz historia commitów): klucze TOML **snake_case**, `description` ≤300 znaków, hooki nieblokujące z `strict = false` na start.

## ✅ Co zostało zwalidowane (Vibe headless)

- wszystkie 11 pluginów ładuje się bez błędów walidacji (`plugin.*.invalid`)
- 61 skilli widocznych dla modelu; user-invocable dostępne na wywołanie (w tym 4 driver-skille paczek)
- spawn subagentów z personami z instrukcji: `qa-core:rubber-duck` 🦆, `quality-gates:change-gate-reviewer`, `test-automation:test-code-reviewer`, `orchestration-basics:basics-analyst`
- 7 knowledge folders (3 z bundle'ów + 4 GUIDE paczek orkiestracyjnych)
- hook `pre_tool` test-file-guard (w `test-automation`): wykrywa `waitForTimeout` w zapisie `.spec.ts`, loguje w `$PLUGIN_DATA`

## 🧭 Roadmapa

- [ ] `connectors.json` (GitHub, k6) dla bundle'i automatyzujących
- [ ] GitHub Actions CI: `build.js --check` + weryfikacja ładowania pluginu w Vibe headless
- [ ] hook strict (blokujący) po zdefiniowaniu polityki jakości
- [ ] hook-only pluginy źródła (`always-on-skills`, `print-tool-info`) — częściowo pokryte przez `test-file-guard`

## 📄 Licencja i atrybucja

MIT © Marek Bortkiewicz. Treści `src/` adaptowane z [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl), w tym oryginalny plik licencji źródła zachowany w `LICENSE`.
