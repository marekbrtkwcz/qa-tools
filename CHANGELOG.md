# CHANGELOG

Wszystkie istotne zmiany tego projektu są dokumentowane tutaj. Format zbliżony do [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); wydanie kolekcji = tag `vx.y.z` na historii gita. Wersje per-bundle w `bundles.yaml` są podbijane w tym samym wydaniu (`node scripts/build.js --set-version x.y.z`), więc `plugin.json` każdego pluginu ma wersję kolekcji.

## [Unreleased]

### Dodane
- **Sekcje `## When to Use` w 11 skillach model-invocable**, które ich nie miały — model dostaje jawne triggery aktywacji i „Route elsewhere" zanim zacznie pracę: `automating-ci-test-pipelines`, `code-review`, `creating-skills`, `creating-custom-agents`, `creating-hooks`, `creating-instructions`, `creating-orchestration-packs`, `creating-plugins`, `designing-test-automation-architecture`, `stabilizing-flaky-tests`, `unslop-tests`. Tam gdzie plik ma już `## When NOT to Use`/`Boundary`, nowa sekcja dublowania unika.
- **Bramka release'u dla tagów `v*`** (`scripts/check-release.js` + job `release-gate` w CI): tag = wersja **każdego** bundla w `bundles.yaml` = nagłówek `## [x.y.z]` w CHANGELOG — trzy miejsca, jedno źródło prawdy, sprawdzane mechanicznie zamiast pamięcią releasera. Skrypt testowalny (`--bundles`/`--changelog` do fixture'ów, eksport `checkRelease`); test potwierdza też, że realne repo przechodzi dla `v0.2.1`, a `/tags:` w workflow odpala job tylko na tagach.
- **10 nowych testów builda** (43→53): sieroty i brakujące źródła `checkMembership` na drzewie fixture (dla czego `checkMembership` dostaje parametr `srcRoot`), emisja `hooks.toml` (3 matchery na hook, `test-file-guard-bash`, poprawny TOML; bundle bez `hooks:` nie dostaje ani `hooks.toml`, ani `vibe-hooks/`), transakcyjność swapu (restored tree przy nieudanym rename), ścieżki CLI przez spawn (`--check` → "All bundles valid.", `--verify` → drift-gate, złe `--set-version` → exit 2, `--bundle` ghost → exit 2), `checkRelease` na fixture'ach (zgodność, mismatch wersji, brak wersji, zły format taga).

### Zmienione
- **Atomowy zwykły build**: build odstawia wszystko do `plugins/.tmp-build`, a swap do `plugins/` dzieje się tylko po pełnym sukcesie — błąd w połowie nie zostawia już częściowo przebudowanego artefaktu. Swap jest transakcyjny: stary katalog jest parkowany, nie usuwany, więc nieudany rename (na Windows zdarzają się transient EPERM/EBUSY od antivirusa — złapany na żywo przy pierwszym uruchomieniu) przywraca stan poprzedni zamiast zostawiać dziurę; chwilowe EPERM/EBUSY/EACCES dostają 3 próby ze 100 ms odstępem.
- **Poprawiony komunikat duplikatu knowledge w `checkMembership`**: `kind.slice(0,-1)` produkowało `knowledg "x" declared in both...` (ucinało ostatnią literę każdej nazwy rodzaju) — wykryte przez nowy test na fixture'ach, poprawione na `replace(/s$/,'')`.
- **12 opisów skilli skróconych z zakresu 701–908 zn. do 551–597** (audyt C5 — routing-sygnał rozmywa się powyżej ~600): `testing-agent-skills`, `automating-ci-test-pipelines`, `mobile-app-testing`, `writing-unit-tests`, `creating-orchestration-packs`, `diagnosing-test-failures`, `test-driven-development`, `property-based-testing`, `scope-change-gate`, `stabilizing-flaky-tests`, `designing-test-automation-architecture` oraz `tracking-quality-trends` (701 zn. — wykryty dopiero przez nowy warn, poniżej progu >720 z pierwotnego skanu). Każdy opis trzyma rolę + triggery + 1–2 najbardziej przełączające cross-refy; pełne listy decyzyjne zostają w body i resources.
- **Nowy warn antyregresyjny w `validateFrontmatter`**: opis skilla >700 zn. ostrzega (twardy limit 1024 bez zmian) — z automatu wyłapał 12. plik zanim doszło do commita i chroni poprawkę przed wyparowaniem w kolejnych AI-edytowanych PR-ach. Test polityki warningów (`skill`/`agent`/`knowledge`) jawny w asercji na realnej kolekcji.
- **Higiena szablonu w całej kolekcji** (audyt C2/C3/C6):
  - `api-test-plan-and-tests` sprowadzony do wzorca commandów: 197→89 linii w SKILL.md, szczegółowe przepisy faz przeniesione do `./resources/phase-recipes.md` (progressive disclosure), fazy zdegradowane z `#` do `##`, dodane `## Resource Map` i `## Definition of Done`, zachowane trzy checkpoint'y i guardrails.
  - Podwójny nagłówek `## Inputs` (argumenty commanda + tabela inputów tasku) w **12 plikach**: drugie wystąpienie przemianowane na `## Inputs to collect` — w tym `performance-reliability-plan`, który audyt błędnie uznawał za już naprawiony.
  - Wielkość liter nagłówków ujednolicona w rodzinie `creating-*`: `## Resource map`→`## Resource Map` i `## Common failure modes`→`## Common Failure Modes` w 7 skillach **oraz w samym `SKILL.template.md`**, który uczył błędnego wzorca u źródła.
  - `prd-generator`: usunięty jedyny w kolekcji klucz `license: MIT` z frontmatter (licencja siedzi w `plugin.json`); zdaniowy `argument-hint` zostaje — to wzorzec domu dla skillów model-invocable, nie błąd.
- **Opisy 18 agentów skrócone do limitu 300 znaków** (668→299 w najdłuższym przypadku): build truncuje `description` w emitowanym TOML na 300 znaków, więc host widział urwane opisy (`qa-strategist`, `ai-architect`, `test-automation-expert`, obaj `playwright-automation-engineer-ts*`, `test-code-reviewer`, `quality-debt-auditor`, `tech-debt-auditor`, `skill-librarian` i 9 dalszych). Każdy skrócony opis zachowuje sygnał routingu (rola + kiedy użyć + najważniejszy cross-ref); `npm run check` z tej listy wychodzi teraz bez żadnego WARN.

## [0.2.1] - 2026-11-22

Cykl po audycie kolekcji (2026-11-22): domknięcie driftu cross-referencji skilli, luki obszarowe, bramki walidacji builda, polityka hooka i porządki procesu. Wszystkie pluginy: wersja 0.2.1.

### Dodane
- **Pin serwera Playwright MCP wyniesiony do konfiguracji**: `bundles.yaml` (`mcp-pins: playwright=0.0.86` w bundle `qa-mcp`) jest jedynym miejscem pinu — `build.js` czyta go stąd i **pada, gdy pinu brak** (zamiast produkować manifest, czy zatykać wersję na sztywno w kodzie); błąd budowania nie zostawia pustego `mcp.json` (lekcja z 0.2.0). Procedura bumpu udokumentowana w README. Testy: pin dociera do manifestu 1:1, brak pina = błąd budowania bez artefaktu.
- **LICENSE**: dodany notice „Portions Copyright (c) 2026 Marek Bortkiewicz" dla części własnych (skrypty builda, CI, hook, warstwy konwersji, skille/agenci dodane poza kolekcją źródłową).
- **Pełniejsza polityka jakości `test-file-guard`** (audyt INF-4): BLOCK obejmuje teraz rodzinę `.skip()` (`it.skip`/`test.skip`/`describe.skip`/`xit()`/`xdescribe()`) — committed skip ma ten sam skutek co `.only()` (wycisza suity); furtka: zapis z adnotacją `waiver` (świadoma, datowana kwarantanna — filozofia `stabilizing-flaky-tests`) jest zamieniany na ostrzeżenie; **trzy hooki zamiast dwóch** — nowy wpis `file_system.bash` ostrzega, gdy komenda bash pisze do pliku testowego (heredoc/tee/sed -i — wcześniej taki zapis omijał bramkę całkowicie; parsowanie komendy jest zawodne, więc bash jest zawsze warn-only, nigdy deny); **16 testów jednostkowych hooka** (`scripts/assets/test-file-guard.test.js`, payloady przez stdin jak u hosta) — wcześniej skrypt hooka był jedynym shipped kodem bez ani jednym testem; `npm test` wskazuje teraz jawne pliki testowe, bo discovery `node --test <dir>` łapałoby sam skrypt hooka (`test-*.js`) i wisił na stdin (43 testy, ~2 s).
- **Bramki walidacji builda** (audyt INF-2/INF-3/INF-5): `--check` waliduje teraz frontmatter i name rules (folder ↔ `name:`) również bez pełnego builda; `checkMembership` pilnuje **sierót i duplikatów agents oraz knowledge** (wcześniej tylko skilli); drift-gate (`--verify`) zgłasza **katalog pluginu w artefakcie, którego nie ma w `bundles.yaml`** (wcześniej usunięty bundle zostawał zielony na zawsze); `validate-manifests` waliduje **składnię wygenerowanych TOML** (`agents/*.toml`, `hooks.toml`); `validateFrontmatter` — opisy skilli twarde >1024 = błąd, opisy agentów >300 ostrzegają (bo build je ucina: dziś 18 z 42). Testy jednostkowe: 26 (z 18): checkMembership (sieroty/duplikaty), validateFrontmatter (name-rules, limity, ostrzeżenia), orphanPluginDirs (blind-spot drift-gate), validateTomlText/validateAll (bramka TOML).
- **plugin `mobile-testing`** 📱 — skill `mobile-app-testing` (Maestro-first, Appium jako świadomy fallback: selektory accessibility-id, deterministyczne środowisko urządzenia, obsługa dialogów OS, matrycy CI łącznie z ograniczeniem iOS=macOS) + agent `mobile-test-automation-expert`.
- 5 nowych skilli w `test-automation` z audytu luk obszarowych: `bootstrap-test-suite` (deterministyczny init Playwright/Vitest od zera z zielonym smoke-gate), `testing-auth-flows` (setup project + storageState, tokeny, SSO, wygaśnięcia jako scenariusz), `component-testing-vitest-rtl` (Vitest + Testing Library / Playwright CT), `test-data-factories` (fabryki, seeded Faker, unikalność pod paralleizm, teardown), `property-based-testing` (fast-check: własności, shrink, seed, budżet CI).

### Naprawione
- 11 martwych manifestów `mcp.json` (puste `mcpServers: {}`) usuniętych z artefaktu — build emituje `mcp.json` tylko w bundlach deklarujących `mcp:` (dziś wyłącznie `qa-mcp`), tak samo jak robi to dla `hooks.toml`.

### Zmienione
- Serwer Playwright MCP w `qa-mcp` przypięty z `@playwright/mcp@0.0.83` na `@0.0.86` (aktualny latest wg rejestru npm).
- CI (`.github/workflows/ci.yml`): `timeout-minutes: 10` na jobie i `concurrency` z `cancel-in-progress` (równoległe pushy nie kolejkują zestawionych runów); nazwy kroków odzwierciedlają realny zasięg bramek.
- Parser `bundles.yaml` (`parseBundles`): usunięty martwy callback „stripowania komentarzy" — obsługiwane są wyłącznie komentarze pełnolinijkowe (inline komentarze celowo nie, bo wsiakają w wartości; udokumentowane w kodzie).
- Ostrzeżenia walidacji źródeł drukują się pełną listą w `--check`, w pozostałych trybach jako jedna linia podsumowania (logi build/verify bez szumu).
- Cross-referencje antykolizyjne i domknięcia delegacji (audyt treści 98 skilli): `tech-debt-audit` → `tech-debt-analysis` (description + guardrail dla audytu całego repo z effort/ROI), `a11y-webpage-audit` → `auditing-accessibility` (pełny protokół manualny; quick-path pozostaje samodzielny), `governing-quality-waivers` → `audit-quality-debt` (pełny audyt długu), `testing-agent-skills` ↔ `audit-collection-health` (wzajemne rozgraniczenie: behawioralne vs strukturalne), `scope-change-gate` — description nazywa agregowane skille (`scoping-change-relevance` + `verifying-change-coverage` + `recording-change-intent`) i odsyła do każdego osobno.

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
