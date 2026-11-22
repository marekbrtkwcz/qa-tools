# qa-tools

Narzędzia dla testera automatyzującego — **natywne pluginy dla [Mistral Vibe CLI](https://mistral.ai)**: skille, subagenty, baza wiedzy i hooki quality-gate w formacie Agent Plugins 1.0.

Repozytorium inspirowane ideą i strukturą projektu **[awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality)** (MIT, jaktestowac.pl). Wszystkie treści `src/` pochodzą z tego projektu (adaptacja na format natywny Vibe).

## ✨ Kolekcja — 7 bundle'ów + 4 orkiestracje + 1 wtyczka MCP

| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |
|---|---|---|---|---|---|
| `qa-core` 🧭 | 26 | 4 | 1 | — | planowanie testów, eksploracja, bug reporty, RTM, kryteria akceptacji |
| `test-automation` 🤖 | 26 | 5 | — | ✅ test-file-guard | unit testy, TDD, Playwright, mocki, flakiness, review |
| `api-testing` 🔌 | 3 | 2 | — | — | automatyzacja API (Playwright) i contract testing |
| `non-functional-testing` ⚡ | 6 | 1 | — | — | accessibility, performance/load, security |
| `ai-quality` 🧠 | 7 | 1 | 1 | — | testowanie funkcji LLM, guardrails, groundedness |
| `quality-gates` 🚦 | 17 | 4 | 1 | — | quality contracts, change gates, release readiness |
| `authoring` 🛠️ | 9 | 1 | — | — | tworzenie skilli/agentów/pluginów/hooków |
| `qa-mcp` 🎭 | — | — | — | — | serwer Playwright MCP (przypięty `0.0.86`); instaluj **raz**, obok dowolnego bundla automatyzującego |
| `orchestration-basics` 🎼 | 1 | 3 | 1 | — | paczka: orchestrator + planner/explorer/analyst (start tutaj) |
| `plan-explore-review-commit` 🔄 | 1 | 9 | 1 | — | paczka: pełny pipeline dostarczania z review i commitem |
| `ui-api-automation` 🖥️ | 1 | 7 | 1 | — | paczka: pipeline testów UI + API (explorers → plan → implement → run) |
| `ui-api-automation-minimal` 🧪 | 1 | 4 | 1 | — | paczka: minimalna wersja powyższego |

Razem: **12 pluginów**, **98 skilli**, **41 subagentów**, **7 knowledge**, **1 quality-gate hook**.

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

⚠️ **MCP bez duplikatów**: serwer Playwright MCP jest tylko w pluginie `qa-mcp`. Jeśli używasz browser automation (test-automation, non-functional-testing, paczki UI/API), doinstaluj `cp -r plugins/qa-mcp ~/.vibe/plugins/` **raz** — same bundle nie deklarują już `mcp:`, więc instalacja kilku nie powiela serwera.

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
├── package.json                       # npm scripts: build / check / verify / test
├── scripts/
│   ├── build.js                       # build → plugins/ (natywny Vibe); --check, --verify
│   ├── build.test.js                  # testy jednostkowe builda (node:test)
│   ├── validate-manifests.js          # walidacja JSON manifestów w plugins/
│   └── assets/test-file-guard.js     # skrypt hooka
└── plugins/<bundle>/              # artefakt buildu — do skopiowania (12 pluginów)
    ├── plugin.json                    # manifest Agent Plugins 1.0 + rozszerzenie ai.mistral.vibe
    ├── skills/                        # 1:1 ze src
    ├── mcp.json                       # tylko w pluginach deklarujących mcp: (dziś: qa-mcp)
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
node scripts/build.js --verify   # drift-gate: świeży build do katalogu tmp vs commitowany plugins/ (exit 1 przy różnicach; nie modyfikuje plugins/; porównanie ignoruje wyłącznie różnice EOL — core.autocrlf na Windows przepisuje working tree)
node scripts/validate-manifests.js  # walidacja parsowania wszystkich JSON w plugins/
npm test                          # testy jednostkowe builda (node:test, zero zależności)
```

…albo przez npm: `npm run build | check | verify | validate-manifests | test`, a całość CI: `npm run ci`.

`plugins/` jest commitowany (jak w projekcie źródłowym) — użytkownik może zainstalować bez uruchamiania builda. **Drift-gate** (`--verify`, uruchamiany też w CI) pilnuje, żeby commitowany artefakt zawsze odpowiadał `src/` + `bundles.yaml`: po każdej edycji źródeł wystarczy przebudować i zcommitować, inaczej CI failuje.

## 🏷️ Wersjonowanie

- Wersja każdego pluginu = wersja kolekcji; jedyna prawda: `bundles.yaml`. Bump: `node scripts/build.js --set-version x.y.z` (wszystkie) albo `--bundle <n> --set-version x.y.z` (jeden) — zachowuje komentarze, wcięcia i EOL.
- Historia zmian: `CHANGELOG.md` (wpis per wydanie, sekcje Dodane/Zmienione/Naprawione + uwagi o upgrade).
- **Release**: bump → wpis w `CHANGELOG.md` → `npm run ci` (przebudowa `plugins/` + bramki: członkostwo, manifesty, drift-gate, testy) → commit → `git tag -a vx.y.z -m "..."`. Tag zawiera artefakt zgodny ze `src/`, bo git commit go pilnuje drift-gate.

## 🎨 Konwencja emotek

Emotki w tej kolekcji **niosą znaczenie, nie ozdobę** — i są wpisane w projekt na jednym poziomie: single-source w `src/shared/emoji-style.md`, a build wstrzykuje je (sekcja `## 🎨 Emoji in output`) do **każdego wygenerowanego SKILL.md (98)** i instrukcji **każdego subagenta (41 tom)**. Dzięki temu:

- 🗨️ **zachowanie agentów** — każdy subagent dostaje konwencję w instrukcjach,
- 📋 **generowane raporty** — skille QA użyją jej w nagłówkach, tabelach i statusach,
- 📖 **dokumentacja** — poniższe słownictwo obowiązuje też w README.

Słownictwo (pełne w `src/shared/emoji-style.md`): ✅ passed · ❌ failed/defekt · ⚠️ ryzyko · 🚧 blocked · 🚢 release go · ⛔ no-go · 🐛 bug · 📊 metryki · 🔍 luka · 🧪 test.

Zasady: jedna emotka na nagłówek/komórkę statusu, **nigdy** w nazwach testów, identyfikatorach kodu, plikach, commitach i branchach.

Ikonki bundli z `bundles.yaml` (`icon:`) są buildem podłączane tam, gdzie schemat na to pozwala: do `displayName` pluginu (np. `qa-core 🧭 (qa-tools)`) i `display_name` każdego subagenta (np. `Test Planner 🧭`). ⚠️ Identyfikatory (`name`, `config_name`, ścieżki) i `name` w frontmatter pozostają bez emotek — to wymóg walidacji builda i schematu Vibe (Agent Plugins 1.0 nie definiuje top-level `icon` w manifeście; Vibe go ignoruje z ostrzeżeniem).

Zmiana konwencji = edycja `src/shared/emoji-style.md` + `node scripts/build.js`. 🚫 nie edytuj wygenerowanych `plugins/` ręcznie.

## 🔄 Konwersja formatów (Vibe ⚠ inne niż Claude/Copilot/Codex)

| Źródło (awesome-agents-for-quality) | Target Vibe | Uwagi |
|---|---|---|
| `SKILL.md` (open Agent Skills) | `skills/` 1:1 | + wstrzykiwana sekcja emotek (patrz 🎨 wyżej) |
| `plugin.json` Agent Plugins 1.0 | 1:1 | tylko `displayName` w rozszerzeniu Vibe dostaje ikonę bundla (`qa-core 🧭 (qa-tools)`) |
| slash commands | skill z `user-invocable` | Vibe nie ma komend |
| agent `.md` (frontmatter: name/title/description/capabilities, w paczkach też `tools: Read, Grep…`) | `agents/*.toml` (snake_case!) | `schema_version`, `agent_type`, `display_name` (+ikona bundla, np. `Test Planner 🧭`), opis ≤300 zn., `enabled_tools`; Edit/Write/Bash → `safety = "neutral"` |
| guides | `knowledge/<name>/KNOWLEDGE.md` | frontmatter: name/description(≤300)/display_name/icon |
| mcp | `mcp.json` | Vibe wymaga `$schema` + `type` |
| skill `agents/openai.yaml` (42×) | — (filtrowane przy buildzie) | wyzwalacze Codex/OpenAI (`display_name`, `allow_implicit_invocation`) mają odpowiednik w frontmatter SKILL.md (`disable-model-invocation`); folder nie pływa w natywnym artefakcie |
| — | `hooks.toml` | Vibe-only: quality gates na eventach `pre_tool`/`post_agent` |

Konwencje potwierdzone testami (patrz historia commitów): klucze TOML **snake_case**, `description` ≤300 znaków, hooki nieblokujące z `strict = false` na start.

## ✅ Co zostało zwalidowane (Vibe headless)

- wszystkie 12 pluginów ładuje się bez błędów walidacji (`plugin.*.invalid`)
- 61 skilli widocznych dla modelu; user-invocable dostępne na wywołanie (w tym 4 driver-skille paczek)
- spawn subagentów z personami z instrukcji: `qa-core:rubber-duck` 🦆, `quality-gates:change-gate-reviewer`, `test-automation:test-code-reviewer`, `orchestration-basics:basics-analyst`
- 7 knowledge folders (3 z bundle'ów + 4 GUIDE paczek orkiestracyjnych)
- hook `pre_tool` test-file-guard (w `test-automation`): **blokuje** zapis `.only()`/`fit()` w plikach testowych (structured `decision: deny` — zero false-positive, klasyfikacja po nazwie pliku), **ostrzega** o `waitForTimeout`, sleepach i tautologiach (`system_message`); wszystko logowane w `$PLUGIN_DATA`. Awaria hooka = fail-open (ostrzeżenie, edyt przechodzi), reguły w `vibe-hooks/test-file-guard.js`

## 🧭 Roadmapa

- [ ] `connectors.json` (GitHub, k6) dla bundle'i automatyzujących
- [x] GitHub Actions CI (`.github/workflows/ci.yml`): `build.js --check` + walidacja manifestów JSON + drift-gate `--verify`, matrysa ubuntu + windows
- [ ] weryfikacja ładowania pluginu w Vibe headless w CI (wymaga zainstalowanego CLI i auth — świadomie poza pierwszą iteracją CI)
- [x] hook blokujący dla `.only()`/`fit()` w plikach testowych — deny przez structured response (exit 0), fail-open na awarię hooka
- [ ] pełna polityka jakości hooka: kolejne wzorce (mock-only tests, retries jako „fix"), decyzja fail-open vs strict fail-closed
- [ ] hook-only pluginy źródła (`always-on-skills`, `print-tool-info`) — częściowo pokryte przez `test-file-guard`

## 📄 Licencja i atrybucja

MIT © Marek Bortkiewicz. Treści `src/` adaptowane z [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl), w tym oryginalny plik licencji źródła zachowany w `LICENSE`.
