# Audyt kolekcji qa-tools — 2026-11-22

Zakres: 98 skilli (`src/skills/*/SKILL.md`, wszystkie przeczytane strukturalnie, ~45 w całości), 41 agentów, 7 knowledge, `scripts/`, CI, README/CHANGELOG, hook. Trzy równoległe przeglądy (treść skilli, luki domenowe, infrastruktura) + weryfikacja własna kluczowych twierdzeń (liczenie grep, lektura `build.js`, uruchomienie `npm run ci`).

**Wynik `npm run ci`: ✅ PASS** (check, manifesty 13, drift-gate, 18/18 testów, ~6 s; `git status` czysty po przebiegu). Wszystkie liczby w README zgodne z rzeczywistością poza jedną („61 skilli widocznych" — patrz INF-1).

---

## Część 1 — Treść skilli: co poprawić

Kolekcja jest jakościowo wysoka: świadoma architektura „głęboki skill (gerund, model-invocable) + command wrapper (`disable-model-invocation: true`)"; name=folder 98/98; kebab-case 98/98; description wszędzie z warunkiem aktywacji; body po angielsku bez polskich resztek; 52 skille mają `resources/` (realna progressive disclosure); brak sierot i zerwanych cross-refów.

### C1. Trzy commandy nie delegują do swoich głębokich bliźniaków (drift treści) — najwyższy ROI
Wzorzec wrapper→delegacja jest w ~80% par stosowany poprawnie (`bug-report`→`reporting-bugs`, `regression-scope`→`analyzing-regression-scope`, `migrate-tests-to-playwright`→`migrating-tests-to-playwright` itd.). Trzy wyjątki re-implementują procedurę samodzielnie i po cichu zestarzeją się przy zmianie pełnego skilla:
- `src/skills/tech-debt-audit/SKILL.md` (50 linii, zero odwołań do `tech-debt-analysis`)
- `src/skills/map-requirements-coverage/SKILL.md` (49 linii, zero odwołań do `requirements-test-coverage-mapper`)
- `src/skills/a11y-webpage-audit/SKILL.md` (64 linie; `a11y-audit-deep-dive` jest wrapperem `auditing-accessibility`, ten nie)

**Fix:** jednolinijkowa delegacja „If the X skill is installed, load it before starting" + skrócenie zduplikowanego body.

### C2. `api-test-plan-and-tests/SKILL.md` łamie szablon
197 linii, nagłówki `#`-poziomu w środku (` # Task`, `# Phase 1 – Discover`), brak `## When to Use`, `## Resource Map`, `## Definition of Done`. Jedyny taki plik w kolekcji. **Fix:** sprowadzić do szablonu + przenieść przepisy faz do `resources/`.

### C3. Podwójny nagłówek „## Inputs" w 12 plikach
SeKCjA argumentów commanda + osobna tabela inputów tasku o tej samej nazwie: `create-test-plan`, `regression-scope`, `edge-case-scenario-generator`, `performance-reliability-plan`, `scope-change-gate`, `verify-acceptance-criteria`, `derive-quality-contract`, `record-change-intent`, `test-llm-guardrails`, `audit-collection-health`, `audit-quality-debt`, `design-llm-eval-suite`. **Fix:** druga sekcja → `## Inputs to collect` (wzorzec już istnieje w `performance-reliability-plan`).

### C4. Kolizje/niespójności rozróżniające (nie duplikaty, ale bez obronnych cross-refów)
- `audit-quality-debt` vs `governing-quality-waivers` (oba robią inwentarz silent skips — niemal identyczne frazy opisów; zero cross-refów). Rozdzielić: debt = inwentarz + roadmapa, waivers = cykl życia wyjątków.
- `testing-agent-skills` (ai-quality, 208 ln) vs `audit-collection-health` (authoring, 77 ln) — oba audytują kolekcje skilli, żaden nie odsyła do drugiego.
- `scope-change-gate` to superkomenda za 3 skille (`recording-change-intent` + `scoping-change-relevance` + `verifying-change-coverage`), ale nazwa sugeruje bliźniaka `scoping-change-relevance` — dopisać w description.
- `writing-unit-tests`/`writing-unit-tests-quick` i `test-driven-development`/`-quick`: obie pary model-invocable (wspólna przestrzeń triggerów), opisy rozgraniczają dobrze (**OK jak jest** — tylko pilnować, by nie zbiegły).

### C5. Opisy-skróty i body do odchudzenia
- 8 plików z description >700 zn. (formalnie pod limitem 1024, ale routing-sygnał się rozmywa): `automating-ci-test-pipelines` (768), `writing-unit-tests` (765), `creating-orchestration-packs` (757), `testing-agent-skills` (756), `diagnosing-test-failures` (735), `test-driven-development` (734), `stabilizing-flaky-tests` (720), `designing-test-automation-architecture` (717). Cel: ≤500–600 zn., cross-refy zredukować do 1–2 najbardziej przełączających.
- Body do przeniesienia do `resources/`: `static-code-analysis-typescript` (341 ln), `plan-explore-review-commit` (332 ln — sekcja Subagent Instructions inline), `test-driven-development` (314 ln — najdłuższy pojedynczy blok workflow w kolekcji), `api-playwright-test-developer` (Folder Layout + Example + Troubleshooting → 3 pliki zasobów).

### C6. Higiena frontmatter
- `prd-generator` — jedyne 98 z `license: MIT` w frontmatter (licencja już jest w plugin.json) + styl `argument-hint` zdaniowy zamiast `[bracketed]`.
- `argument-hint` jest w ~90 plików, ale to nie jest udokumentowany klucz schematu Vibe (build kopiuje verbatim, nie konsumuje). Do zweryfikowania eksperymentalnie w headless; jeśli host go ignoruje — usunąć z skillów model-invocable (tam i tak bezużyteczny) albo dodać do 4 commandów, które go nie mają (`a11y-audit-deep-dive`, `bug-report`, `generate-test-data`, `manual-test-cases`, paki).
- 12 model-invocable skilli bez sekcji „## When to Use" (cała familia `creating-*`, `code-review`, `unslop-tests`, `stabilizing-flaky-tests`, `designing-test-automation-architecture`, `automating-ci-test-pipelines`).
- Wielkość liter nagłówków: `## Resource Map` (45×) vs `## Resource map` (7×, authoring); `## Common Failure Modes` (39×) vs `## Common failure modes` (7×).

---

## Część 2 — Build, walidacja, CI, hook

### INF-1. README niezgodne z rzeczywistością: „61 skilli widocznych dla modelu"
Własny licznik: **46 z 98 plików** ma `disable-model-invocation: true` (`grep -rl ... src/skills`), więc widocznych dla modelu jest **52** (sic: 4 driver-skille paczek też są user-invocable-only). README twierdzi 61, audit headless z 0.2.0 twierdził 61 — liczba jest nieaktualna albo liczona inaczej. **Fix:** odświeżyć po walidacji headless (jedyna realna niezgodność README; pozostałe 7 policzonych liczb się zgadza).

### INF-2. `npm run check` nie robi tego, co obiecuje README
`scripts/build.js:303` — `if (checkOnly) return []`: `--check` waliduje wyłącznie członkostwo w `bundles.yaml`. Walidacja frontmatter/`name`/istnienia agentów i knowledge dzieje się tylko w pełnym buildzie (ratuje CI drift-gate, ale flaga kłamie o zasięgu, a README opisuje `--check` szerzej). **Fix:** rozszerzyć `--check` o pełną walidację (bez zapisu artefaktu) + warning/errory dla description skilli >300 zn.

### INF-3. Dwie luki walidacyjne builda
- **Orphan-check tylko dla skilli.** `checkMembership` nie pilnuje nieużytych `src/agents/*.md` ani `src/knowledge/*.md` (dziś: 0 sierot — sprawdzone, ale nic tego nie chroni), ani duplikatów agents/knowledge między bundlami (skille mają ochronę `owner.has`).
- **Blind spot drift-gate na poziomie bundla.** `--verify` porównuje tylko katalogi z kluczami `bundles.yaml`: cały plugin usunięty z `bundles.yaml`, a dalej commitowany w `plugins/`, nie zostanie zgłoszony. **Fix:** odwrócone porównanie zbiorów katalogów.

### INF-4. Hook `test-file-guard`: trzy realne luki
1. **BLOCK nie łapie `.skip()`**: `it.skip`/`xit`/`xdescribe`/`pending tests` mają ten sam skutek co `.only()` (wyciszają suity) — dziś przechodzą bez słowa.
2. **Łuka obejścia przez bash**: `hooks.toml` matchuje tylko `file_system.write_file`/`file_system.edit` — zapis pliku testowego przez `bash` (heredoc, `echo >`, `sed -i`) omija guard całkowicie. Fix częściowy: pre_tool warn na oczywiste wzorce „zapis do *.test.ts/.spec.ts" w argumencie basha (deny byłby zbyt false-positive).
3. **Zero testów jednostkowych** — to jedyny shipped kod bez ani jednym testem, a to jednocześnie jedyny kod, który może zablokować edit użytkownikowi.
Additional: `strict = false` + fail-open — świadome i udokumentowane (decyzja OK na start); roadmapa mówi o „pełnej polityce jakości" — to punkt 1 i 2.

### INF-5. Drobne w buildzie i CI
- `parseBundles` (L50–53): callback strippingu komentarzy zwraca `''` tylko dla linii-komentarzy pełnych — inline komentarze (`icon: X # foo`) wsiąkają w wartość. Wywalić albo udokumentować „brak inline komentarzy".
- Zwykły build (`node scripts/build.js`) czyści katalog docelowy PRZED buildem — błąd w połowie zostawia częściowo przebudowany `plugins/`. Fix: buduj do tmp + atomowy swap (jak `--verify`).
- `setBundlesVersions`: regex wymaga wersji w cudzysłowach — goła `version: 0.3.0` zostanie po cichu niepodbita.
- `validate-manifests.js`: tylko `JSON.parse` — brak walidacji semantycznej (unikalne `name`, format wersji) i zero parser-check'u TOML (`agents/*.toml`, `hooks.toml`) – błąd składni w generowanym TOML nie zostanie wyłapany nigdzie.
- `ci.yml`: brak `timeout-minutes` i `concurrency` (cancel-in-progress); brak joba na tag `v*` weryfikującego tag = wersje w `bundles.yaml` = nagłówek CHANGELOG (dyscyplina releasów w pełni ręczna).
- Brak testów: `checkMembership`, generowanie `hooks.toml`, ścieżki CLI `--check/--verify`.
- Hook „command" jest relatywny względem CWD hook-runnera (`node vibe-hooks/test-file-guard.js`) — pozostaje do przetestowania headless (jest w roadmapie README).

Bezpieczeństwo hooka: czysto (stdin JSON + regexy, brak exec/shell, escape przez `tomlString`).

---

## Część 3 — Dokumentacja, proces, licencja

- **[Unreleased] dotyka artefaktu bez bumpu wersji** (`plugins/` zmienione: pin MCP 0.0.86 + 11 pustych `mcp.json` usunięte) — wg własnej konwencji „wersja = jedyna prawda" reinstalacja 0.2.0 z HEAD jest nieodróżnialna od releanowej. **Rekomendacja: wyciąć 0.2.1.**
- Pin `@playwright/mcp@0.0.86` siedzi na sztywnie w `scripts/build.js` (~L407) — nieużytkownik nie ma jak go znaleźć. Fix: wynieść do `bundles.yaml`/`package.json` + procedura podnoszenia w README (pin, nie `latest`, to słuszna decyzja).
- LICENSE: tylko `Copyright (c) 2026 jaktestowac.pl` (upstream). MIT na to pozwala, ale czysto: dodać drugi notice „Portions Copyright (c) 2026 Marek Bortkiewicz" dla części własnych (build/CI).
- CHANGELOG: spójny z tagami (`v0.1.0`, `v0.2.0` = 0.2.0 = wszystkie `plugin.json`); drobiazg: 0.2.0 mówi „17 testów builda", dziś 18 — dopisek w Unreleased.

---

## Część 4 — Luki domenowe: co DODAĆ

Perspektywa użytkownika-kolekcji: testera automatyzującego. Ranking wg realnej wartości:

| # | Propozycja | Bundle | Uzasadnienie |
|---|---|---|---|
| 1 | `bootstrap-test-suite` | test-automation | Deterministic init Playwright/Vitest od zera (`npm create playwright`, `playwright install --with-deps`, struktura, tsconfig, smoke-test gate). Zdejmuje największą barierę wejścia — dziś user kombinuje ręcznie. |
| 2 | Nowa paczka `mobile-testing` (Maestro-first, Appium plan B) + agent | nowa | Jedyna całkowicie brakująca platforma; Maestro ma model prompt-driven wręcz stworzony dla agentów AI. |
| 3 | `testing-auth-flows` | api-testing/test-automation | storageState, token refresh, OAuth/SSO/Keycloak/Entra, service accounts, sesja współdzielona UI↔API. Codzienny ból w suitaach Playwright; `testing-application-security` nie dotyka automatyzacji logowania. |
| 4 | `component-testing-vitest-rtl` | test-automation | Vitest + RTL / Playwright CT: kiedy komponent vs E2E; naturalne rozszerzenie istniejącego `layer-placement.md`. |
| 5 | `test-data-factories` | test-automation | Faker + factory + seeding + cleanup — projektowanie danych już jest (`designing-test-data`), generowanie kodu factory nie ma; kolizje danych to top-przyczyna flakiness. |
| 6 | `property-based-testing` | test-automation | fast-check (native TS): generatory, shrink, kiedy PBT zamiast przykładów; pasuje do `edge-case-scenario-generator`. |
| 7 | `test-reports-and-artifacts` | test-automation | Allure/HTML + trace/video/screenshots w CI + historia; CI jest dziś opisane na poziomie pipeline'u, raportowanie praktyczne nie. |
| 8 | `test-management-integration` | qa-core | Eksport wyników (JUnit/JSON) do import-formatów Xray/TestRail/Jira — dziś tester ręcznie przeklejuje raporty do trackerów. |
| 9 | `port-suite-to-python-java` | test-automation | Cała kolekcja jest TS/JS-only; zamiast skilli per język — jedno mapowanie konwencji (TDD, unslop, architektura) na pytest/JUnit5/NUnit. |
| 10 | `pact-contract-testing` | api-testing | Pact broker + can-i-deploy; `testing-api-contracts` robi schema-validation, nie kontrakty między usługami. |

**Czego NIE dodawać** (uzasadnione odrzucenie): desktop/WinAppDriver (niszowe; Electron = notka w istniejącym skillu), chaos engineering i synthetic monitoring (działalność SRE, poza profilem testera), JMeter (k6+Artillery już są; trzeci stack bez nowej wartości).

## Część 5 — Co ROZSZERZYĆ w istniejących skillach

1. `mocking-network-and-time` + WebSocket/SSE/realtime (`waitForResponse`, mocki ws) — i analogiczny katalog przyczyn flakiness w `stabilizing-flaky-tests`.
2. `api-playwright-test-developer` + cookbook: uploady/pliki, webhooks, long-polling.
3. `running-visual-regression-tests` + warianty i18n/RTL/pseudo-lokalizacja jako wymiar baseline'u.
4. `designing-test-automation-architecture` (`layer-placement.md`) + branch dla testów komponentowych i dla mobile.
5. `auditing-accessibility` + checklista RTL/lokalizacji.
6. Pacy orkiestracyjne → cross-refs do skilli operacyjnych (np. `ui-api-automation` → `stabilizing-flaky-tests` gdy runner pada; dziś paki nie odsyłają do niczego spoza paczki) — tanie, duża korzyść przy realnym użyciu.
7. Każdy skill performatywny (k6, axe-core, faker, allure-cli, Playwright MCP) + sekcja „jeśli brak binarki: wykonaj X" — zdejmuje barierę instalacji narzędzi.
