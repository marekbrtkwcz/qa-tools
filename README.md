# qa-tools

Narzędzia dla testera automatyzującego — **natywne pluginy dla [Mistral Vibe CLI](https://mistral.ai)**: skille, subagenty, baza wiedzy i hooki quality-gate w formacie Agent Plugins 1.0.

Repozytorium inspirowane ideą i strukturą projektu **[awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality)** (MIT, jaktestowac.pl). Wszystkie treści `src/` pochodzą z tego projektu (adaptacja na format natywny Vibe).

## ✨ Kolekcja — 9 bundle'ów + 4 orkiestracje + 1 wtyczka MCP

| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |
|---|---|---|---|---|---|
| `qa-core` 🧭 | 39 | 5 | 1 | — | planowanie testów, eksploracja, bug reporty, RTM, kryteria akceptacji, integracja trackerów (Xray/TestRail/Jira), manualny release pass (instalacja/upgrade/rollback), usability quick-pass, testowanie dokumentacji, standard zapisu rekordów testowych |
| `test-automation` 🤖 | 62 | 5 | 3 | ✅ test-file-guard, red-test-deletion-guard | unit testy, TDD, Playwright, mocki, flakiness, review, bootstrap suity, raporty/artefakty CI, mutacja (Stryker), portowanie na pytest/JUnit/NUnit |
| `api-testing` 🔌 | 16 | 2 | 1 | — | automatyzacja API (Playwright), contract testing: schema/OpenAPI (L25) + Pact (consumer-driven) |
| `non-functional-testing` ⚡ | 23 | 1 | 1 | — | accessibility, performance/load, security: macierz authz + IDOR, security regression smoke po zmianach auth, limity/lockouty (abuse), API security checklist |
| `pentesting` 🕵️ | 11 | 1 | 1 | — | pentest web + API + warstwa sieci/infra na autoryzowanych targetach: rules of engagement (charter + gate autoryzacji + pre-autoryzowane laby), recon i mapa powierzchni ataku, testy klas OWASP Top 10 (access control, injection, auth/session, XSS/CSRF, SSRF), triage eksponowanych usług, słabości TLS i konfiguracji cloud/IaC, raport CVSS z wariantami per odbiorca i retest planem, weryfikacja napraw na fixed buildzie |
| `ai-quality` 🧠 | 12 | 1 | 1 | — | testowanie funkcji LLM, guardrails, groundedness |
| `quality-gates` 🚦 | 19 | 4 | 1 | — | quality contracts, change gates, release readiness |
| `authoring` 🛠️ | 10 | 1 | — | — | tworzenie skilli/agentów/pluginów/hooków |
| `qa-mcp` 🎭 | — | — | — | — | serwery **Playwright MCP + Chrome DevTools MCP** (browser) i **k6 MCP** (testy obciążeniowe; globalne binarne, pływające wersje); instaluj **raz**, obok dowolnego bundla automatyzującego |
| `mobile-testing` 📱 | 2 | 1 | 1 | — | mobile: Maestro-first (Appium jako świadomy fallback), selektory accessibility-id, deterministyczne urządzenia, matryce CI |
| `orchestration-basics` 🎼 | 1 | 3 | 1 | — | paczka: orchestrator + planner/explorer/analyst (start tutaj) |
| `plan-explore-review-commit` 🔄 | 1 | 9 | 1 | — | paczka: pełny pipeline dostarczania z review i commitem |
| `ui-api-automation` 🖥️ | 1 | 7 | 1 | — | paczka: pipeline testów UI + API (explorers → plan → implement → run) |
| `ui-api-automation-minimal` 🧪 | 1 | 4 | 1 | — | paczka: minimalna wersja powyższego |

Razem: **14 pluginów**, **198 skilli**, **44 subagentów**, **14 knowledge**, **2 quality-gate hooki**.

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

⚠️ **Skille wskazują sobie nawzajem sąsiedztwo (cross-bundle)**: opisy i sekcje „Route elsewhere" prowadzą do skilli z innych bundli (np. `tech-debt-audit` [test-automation] → `tech-debt-analysis` [quality-gates] czy `regression-scope` [qa-core] → `scope-change-gate` [quality-gates]). Kolekcja jest projektowana pod instalację pełną; przy instalacji pojedynczych bundli traktuj te wskazania jako „doinstaluj plugin X, jeśli potrzebujesz tej ścieżki", a nie jako błąd.

⚠️ **MCP bez duplikatów**: serwery MCP są tylko w pluginie `qa-mcp` — **Playwright MCP** (`playwright`) i **Chrome DevTools MCP** (`chrome-devtools`) do sterowania przeglądarką oraz **k6 MCP** (`k6`) do testów obciążeniowych. Jeśli używasz browser automation lub k6 (test-automation, non-functional-testing, paczki UI/API), doinstaluj `cp -r plugins/qa-mcp ~/.vibe/plugins/` **raz** — same bundle nie deklarują już `mcp:`, więc instalacja kilku nie powiela serwerów.

Wszystkie trzy serwery działają na **globalnych binarnych** (`playwright-mcp`, `chrome-devtools-mcp`, `k6` — nie na `npx`), więc wymagają jednorazowej instalacji. Przeglądarkowe binarne instalujesz przez npm (każdy system):

```
npm i -g @playwright/mcp@latest
npm i -g chrome-devtools-mcp@latest
```

k6 jest jedynym serwerem z instalacją zależną od systemu:

```
winget install k6 --source winget    # Windows
brew install k6                      # macOS
```

Na Linuxie (Debian/Ubuntu, Fedora/CentOS) instalacja wymaga konfiguracji repo k6 (klucz GPG + źródło pakietu) — blok wielolinijkowy trzymają [oficjalne docs k6](https://grafana.com/docs/k6/latest/set-up/install-k6/); alternatywnie oficjalny instalator MSI z GitHub Releases albo obraz `docker pull grafana/k6`.

Wersje **celowo pływające** (`@latest`, winget/brew zawsze biorą aktualną): manifest pluginu niesie tylko nazwy komend, więc wersja i tak żyje w globalnym installu użytkownika — współdzielonym z innymi narzędziami — a przypinanie wymuszałoby downgrade komuś, kto już ma nowszy binarny. Repo nie trzyma pinów; jedyny wymóg pilnowany przez build (`checkGlobalBinaryInstallDoc`) to, żeby linie instalacyjne (npm ×2, winget, brew) nie zginęły z README — bez nich serwery wypadają błędem spawn na każdej maszynie.

⚠️ **Dlaczego binarny, nie npx**: Vibe daje MCP-om z pluginów twardy budżet 10 s na handshake `initialize`, a schemat pluginowego `mcp.json` nie ma pola timeout. `npx` na Windows (shim `.cmd` + resolving npm + cache/rejestr) potrafił ten budżet przekraczać → `Request 'initialize' timed out`; to samo dotyczy `bunx` i `pnpm dlx` — każdy shim package managera robi zimny start (resolving + cache), który może zjeść 10 s. Globalny binarny startuje w ułamku sekundy, więc ta klasa awarii znika. Brak zainstalowanego binarnego objawia się od razu czytelnym błędem spawn przy starcie sesji. Gdybyś kiedyś mimo to potrzebował dłuższego budżetu: `startup_timeout_sec` działa tylko w `[[mcp_servers]]` w `config.toml` (user-config), a serwer pluginu o tej samej nazwie (`playwright`, `chrome-devtools`) zostaje przez taki wpis automatycznie wywalony (shadow).

⚠️ **Nazwy serwerów ujednolicone do krótkich**: wszystkie trzy serwery używają krótkiej, „produktowej" nazwy (`playwright`, `chrome-devtools`, `k6`) — celowo **nie** nazwy binarki (`playwright-mcp`, `chrome-devtools-mcp`; `k6` to jedyny przypadek, gdzie krótka nazwa i binarka to to samo słowo); konwencja jest jedna dla całego repo i Twojego `config.toml`. **Flagi QA żyją w pluginie**: `mcp.json` niesie stały zestaw flag (Playwright: `--caps vision,pdf,devtools,network,storage,testing`, timeouty akcji/nawigacji, `--snapshot-mode full`; DevTools: kategorie eksperymentalne, `--memoryDebugging`, `--no-usageStatistics`; k6: podkomenda `x mcp --quiet`), więc do zwykłej pracy **nie potrzebujesz żadnego wpisu `[[mcp_servers]]`**. Własne flagi, `startup_timeout_sec` czy dłuższy `tool_timeout_sec` (pól timeoutów nie ma w schemacie pluginu) konfigurujesz we własnym wpisie `config.toml` o tej samej nazwie — wtedy on **shadowuje** kopię pluginu zamiast odpalać drugą instancję. **Dla k6 wpis user-level to stan oczekiwany, nie wyjątek**: narzędzia k6 uruchamiają całe testy obciążeniowe, a domyślny budżet narzędzi MCP ucina dłuższe runy — `tool_timeout_sec` dla długich testów żyje tylko we wpisie user-level (np. 300 s).

Potem w sesji Vibe: `/reload`.

Weryfikacja:
```
vibe -p "List your plugins" --max-turns 1
vibe -p "Spawn child 'duck' from config 'qa-core:rubber-duck' with message 'hi'"
```

## 🗺️ Mapa dokumentacji

```
README.md                 ← ten plik: kolekcja, instalacja, struktura, build, roadmapa
CONTRIBUTING.md           ← jak dodawać assety (frontmatter, bramki check, releasy)
CHANGELOG.md              ← co weszło w każdym wydaniu, per bundle (Keep a Changelog)
evals/README.md           ← suity evali: tabela, protokół runu blind baseline-vs-candidate
src/knowledge/*.md        ← przewodniki per bundle (routing, "czego NIE robi", evidence)
                              → buildowane do plugins/<bundle>/.../knowledge/<name>/KNOWLEDGE.md
src/skills/*/SKILL.md     ← dokumentacja każdego skilla: when / principles / workflow / DoD
src/skills/*/resources/   ← szablony, checklisty, worked examples używane przez skill
src/agents/*.md           ← kontrakty agentów: scope, hands-off, deliverable, DoD
.qa/                      ← audyty kolekcji (commitowane, patrz collection-audit-2026.md)
```

**Zasada:** dokumentacja mieszka przy assetcie, który opisuje — nie w osobnym `docs/`.
Nowy bundle bez `knowledge/` nie przechodzi `npm run check`.

## 🗂️ Struktura

```
qa-tools/
├── src/                              # jedno źródło prawdy
│   ├── skills/<name>/SKILL.md        # skille (+ komendy jako user-invocable)
│   ├── agents/<name>.md              # definicje agentów (neutralny format)
│   └── knowledge/<name>.md           # guides → baza wiedzy
├── bundles.yaml                       # podział na pluginy + członkostwo skilli
├── package.json                       # npm scripts: build / check / verify / lint / test
├── biome.json                         # Biome: lint+format scoped na scripts/ (npm run lint)
├── scripts/
│   ├── build.ts                       # build → plugins/ (natywny Vibe); --check, --verify
│   ├── build.test.ts                  # testy jednostkowe builda (node:test)
│   ├── validate-manifests.ts          # walidacja JSON manifestów w plugins/
│   └── assets/                        # skrypty hooków + ich testy (node --test)
└── plugins/<bundle>/              # artefakt buildu — do skopiowania (13 pluginów)
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
node scripts/build.ts            # buduje plugins/<bundle>
node scripts/build.ts --check    # walidacja bez builda: członkostwo w bundles.yaml (skille + agenci + knowledge, duplikaty i sieroty), name rules (folder ↔ frontmatter), frontmatter i limity description; ostrzeżenia o obcięciach (agenci >300 zn. — build ucina przy generacji)
node scripts/build.ts --verify   # drift-gate: świeży build do katalogu tmp vs commitowany plugins/ (exit 1 przy różnicach, również dla katalogu pluginu w artefakcie, którego nie ma już w bundles.yaml; nie modyfikuje plugins/; porównanie ignoruje wyłącznie różnice EOL — core.autocrlf na Windows przepisuje working tree)
node scripts/validate-manifests.ts  # walidacja parsowania wszystkich JSON oraz składni wygenerowanych TOML (ageni, hooks.toml) w plugins/
npm run lint                      # Biome: lint + format check na scripts/ (bez mutacji plików)
npm test                          # testy jednostkowe builda (node:test, zero zależności)
```

…albo przez npm: `npm run build | check | verify | validate-manifests | lint | test`, a całość CI: `npm run ci`.

`plugins/` jest commitowany (jak w projekcie źródłowym) — użytkownik może zainstalować bez uruchamiania builda. **Drift-gate** (`--verify`, uruchamiany też w CI) pilnuje, żeby commitowany artefakt zawsze odpowiadał `src/` + `bundles.yaml`: po każdej edycji źródeł wystarczy przebudować i zcommitować, inaczej CI failuje.

## 🏷️ Wersjonowanie

- Wersja każdego pluginu = wersja kolekcji; jedyna prawda: `bundles.yaml`. Bump: `node scripts/build.ts --set-version x.y.z` (wszystkie) albo `--bundle <n> --set-version x.y.z` (jeden) — zachowuje komentarze, wcięcia i EOL.
- Historia zmian: `CHANGELOG.md` (wpis per wydanie, sekcje Dodane/Zmienione/Naprawione + uwagi o upgrade).
- **Release**: bump → wpis w `CHANGELOG.md` → `npm run ci` (przebudowa `plugins/` + bramki: członkostwo, manifesty, drift-gate, testy) → commit → `git tag -a vx.y.z -m "..."`. Tag zawiera artefakt zgodny ze `src/`, bo git commit go pilnuje drift-gate.

## 🎨 Konwencja emotek

Emotki w tej kolekcji **niosą znaczenie, nie ozdobę** — i są wpisane w projekt na jednym poziomie: single-source w `src/shared/emoji-style.md`, a build wstrzykuje je (sekcja `## 🎨 Emoji in output`) do **każdego wygenerowanego SKILL.md (98)** i instrukcji **każdego subagenta (41 tom)**. Dzięki temu:

- 🗨️ **zachowanie agentów** — każdy subagent dostaje konwencję w instrukcjach,
- 📋 **generowane raporty** — skille QA użyją jej w nagłówkach, tabelach i statusach,
- 📖 **dokumentacja** — poniższe słownictwo obowiązuje też w README.

### Słownictwo (pełne w `src/shared/emoji-style.md`)

Słownik podzielony jest na **8 kategorii** (Core Status, Findings, Quality & Metrics, Process & Workflow, Automation & Infra, Security & Compliance, Performance & Load, Orchestration), po **8–10 emotek każda** — razem **64 unikalne znaczenia**.

| Kategoria | Emoji | Znaczenie |
|---|---|---|
| Core Status | ✅ | passed / verified / done |
| | ❌ | failed / confirmed defect |
| | ⚠️ | risk / warning / needs attention |
| | 🚧 | blocked / in progress |
| | 🧪 | test / under test |
| | ⏳ | waiting / pending |
| | ➡️ | skipped / not applicable |
| | 🔄 | rerun / retry |
| Findings | 🐛 | defect / bug / issue |
| | 🔍 | gap / missing coverage |
| | 🎲 | flaky / non-deterministic |
| | 🔙 | regression / broken |
| | 💳 | technical debt |
| | 🚨 | critical / high priority |
| Quality | 📊 | metrics / measurement |
| | 📈 | improvement / trend up |
| | 📉 | degradation / trend down |
| | 🔬 | analysis / deep dive |
| | 📋 | checklist / requirements |
| | 📖 | documentation |
| | 🎯 | target / goal |
| | 📌 | pinned / tracked |

Zobacz pełną listę w `src/shared/emoji-style.md`.

### Zasady i przykłady użycia

- **Jedna emotka na nagłówek/komórkę statusu**, nigdy dwie pod rząd, nigdy w środku zdania.
- Emotki należą **tylko do treści i artefaktów** — nigdy w kodzie, nazwach testów, plikach, commitach, branchach.
- Emotka **musí wskazywać jednoznaczne znaczenie** — jeśli czytelnik musi zadać pytanie, użyj słowa.
- **Przykład w tabeli**: `✅ Login API`, `🚧 Checkout flow`, `❌ Payment integration`, `♿ Accessibility audit`.

Słownictwo obowiązuje też w dokumentach repo: nagłówki CHANGELOG (`✅ Dodane`, `🔄 Zmienione`, `🐛 Naprawione`), roadmapa (✅ zrobione / 🔍 luka) i statusy konsoli builda (`✅` sukces, `⚠️` warning, `❌` błąd).

Ikonki bundli z `bundles.yaml` (`icon:`) są buildem podłączane tam, gdzie schemat na to pozwala: do `displayName` pluginu (np. `qa-core 🧭`) i `display_name` każdego subagenta (np. `Test Planner 🧭`). ⚠️ **Identyfikatory** (`name`, `config_name`, ścieżki) i `name` w frontmatter **pozostają bez emotek** — to wymóg walidacji builda i schematu Vibe.

> **Zmiana konwencji** = edycja `src/shared/emoji-style.md` + `node scripts/build.ts`.
> 🚫 **Nie edytuj** wygenerowanych `plugins/` ręcznie.

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

Konwencje potwierdzone testami (patrz historia commitów): klucze TOML **snake_case**, `description` ≤300 znaków, hooki nieblokujące z `strict = false` na start, JS w `scripts/` lintowany Biome (`noRedundantUseStrict` wyłączona: hooki CJS celowo trzymają `'use strict'`).

## ✅ Co zostało zwalidowane (Vibe headless)

- 13 pluginów ładuje się bez błędów walidacji (`plugin.*.invalid`); `mobile-testing` potwierdzony headless po instalacji 2026-11 (bramki builda i manifestów + walidacja instalacji: parzystość plików `plugins/`↔`~/.vibe/plugins`, wersje manifestów, obecność skilli/agentów + załadowanie w sesji Vibe)
- 155 skilli widocznych dla modelu (198 − 43 z `disable-model-invocation: true`; policzone z frontmatterów `src/skills`, pilnuje tego bramka `checkReadmeCounts` w buildzie; user-invocable dostępne na wywołanie — w tym 4 driver-skille paczek)
- spawn subagentów z personami z instrukcji: `qa-core:rubber-duck` 🦆, `quality-gates:change-gate-reviewer`, `test-automation:test-code-reviewer`, `orchestration-basics:basics-analyst`
- 7 knowledge folders (3 z bundle'ów + 4 GUIDE paczek orkiestracyjnych)
- hook `pre_tool` test-file-guard (w `test-automation`, 3 wpisy: `write_file`/`edit`/`bash`): **blokuje** zapis `.only()`/`fit()` oraz `.skip()`/`xit()`/`xdescribe()` w plikach testowych (structured `decision: deny`, klasyfikacja po nazwie pliku; świadoma kwarantanna przechodzi — zapis z adnotacją `waiver` (owner + expiry) jest zamieniany na ostrzeżenie), **ostrzega** o `waitForTimeout`, sleepach, tautologiach oraz zapisie pliku testowego przez `bash` (heredoc/tee/sed — omija bramki plikowe; parsowanie komendy jest zawodne, więc bash jest zawsze warn-only); wszystko logowane w `$PLUGIN_DATA`. Awaria hooka = fail-open (ostrzeżenie, edyt przechodzi), reguły w `vibe-hooks/test-file-guard.js`, 16 testów jednostkowych przypina model severity (`scripts/assets/test-file-guard.test.js`; walidacja `.only()`/fit headless — z 0.2.0, rodzina skip i tryb bash — testy jednostkowe, headless w toku)

## 🧭 Roadmapa

- 🔍 `connectors.json` (GitHub, k6) dla bundle'i automatyzujących
- ✅ GitHub Actions CI (`.github/workflows/ci.yml`): skonsolidowane bramki na push/PR — **fast** (zero-dep: testy, `check`, manifesty, drift-gate; matrysa ubuntu + windows) i **full** (npm ci: `lint`, `typecheck`, P2, P3); tagi `v*` ma wyłącznie `release.yml` (walidacja taga + wszystkie bramki + GitHub Release z artefaktami `plugins/`, bez auto-bumpów i auto-commitów), `quality-gates.yml` działa tylko jako nightly (`security:scan`, `flaky:check`, `benchmark:full`)
- 🔍 weryfikacja ładowania pluginu w Vibe headless w CI (wymaga zainstalowanego CLI i auth — świadomie poza pierwszą iteracją CI)
- hook `pre_tool` red-test-deletion-guard (w `test-automation`, 3 wpisy: `write_file`/`edit`/`bash`, w tym samym modelu severity co test-file-guard): **blokuje** green-by-amnesia — `rm`/`git rm`/`mv`/`unlink` celujące w pliki czy katalogi testowe oraz edity w plikach testowych, które usuwają wszystkie asercje z zastąpionego fragmentu (structured `decision: deny`, exit 0; escape hatch jak wyżej — adnotacja `waiver` zamienia deny w ostrzeżenie), **ostrzega** o `rimraf`/`Remove-Item`/`del` na ścieżkach testowych, in-place edycjach `sed`/`perl`/`dd`/`tee` w plikach testowych oraz edytach zmniejszających liczbę asercji; `rm`/`mv` bez ścieżki testowej = cisza (zero fałszywych trafień), 20 testów jednostkowych przypina model severity (`scripts/assets/red-test-deletion-guard.test.js`)
- ✅ hook blokujący dla `.only()`/`fit()` w plikach testowych — deny przez structured response (exit 0), fail-open na awarię hooka
- 🔍 pełna polityka jakości hooka: kolejne wzorce (mock-only tests, retries jako „fix"), decyzja fail-open vs strict fail-closed
- 🔍 hook-only pluginy źródła (`always-on-skills`, `print-tool-info`) — częściowo pokryte przez `test-file-guard`

## 📄 Licencja i atrybucja

MIT © Marek Bortkiewicz. Treści `src/` adaptowane z [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, © jaktestowac.pl), w tym oryginalny plik licencji źródła zachowany w `LICENSE`.
