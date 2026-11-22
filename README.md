# qa-tools

Narzędzia dla testera automatyzującego — **natywny plugin dla [Mistral Vibe CLI](https://mistral.ai)**: skille, subagenty, baza wiedzy i hooki quality-gate w formacie Agent Plugins 1.0.

Repozytorium inspirowane ideą i strukturą projektu **[awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality)** (MIT, jaktestowac.pl). Wszystkie treści `src/` pochodzą z tego projektu (adaptacja na format natywny Vibe).

## ✨ Co dostajesz

| Komponent | Status PoC | Przykład |
|---|---|---|
| 25 skilli QA (planowanie testów, testy eksploracyjne, bug reporty, RTM, kryteria akceptacji…) | ✅ zwalidowane | `qa-core:reporting-bugs` |
| 4 subagentów TOML z personami i uprawnieniami narzędzi | ✅ zwalidowane | `qa-core:rubber-duck` |
| Baza wiedzy ładowana na żądanie | ✅ zwalidowana | `qa-core:beyond-codegen` |
| Hook quality-gate (pre_tool, log-only) na anty-wzorce w testach | ✅ zwalidowany | `test-file-guard` |
| Serwer MCP (Playwright) w deklaracji pluginu | ✅ schemat-poprawny | `mcp.json` |

## 🚀 Instalacja

```bash
# projekt globalny dla użytkownika:
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
└── plugins/qa-core/                   # artefakt buildu — do skopiowania
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

## 🧭 Roadmapa

- [ ] pozostałe bundle ze źródła: test-automation, api-testing, non-functional-testing, ai-quality, quality-gates
- [ ] `connectors.json` (GitHub, k6) i deklaratywne MCP (Playwright) dla bundle'i automatyzujących
- [ ] GitHub Actions CI: `build.js --check` + weryfikacja ładowania pluginu w Vibe headless
- [ ] hook strict (blokujący) po zdefiniowaniu polityki jakości

## 📄 Licencja i atrybucja

MIT © Marek Bortkiewicz. Treści `src/` adaptowane z [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl), w tym oryginalny plik licencji źródła zachowany w `LICENSE`.
