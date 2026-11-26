---
name: automation-tester-essentials
description: "Skondensowana lista z kursów (Playwright UI + Playwright API) i praktyki: każdy punkt to **wiedza** + **problem, któremu zapobiega** + skill w tej kolekcji. Użyj jako checklist onboardingu i self-checku."
display_name: "Automation tester essentials — wiedza i problemy, które warto znać"
icon: book
---
# Automation tester essentials — wiedza i problemy, które warto znać

Skondensowana lista z kursów (Playwright UI + Playwright API) i praktyki: każdy punkt to **wiedza** + **problem, któremu zapobiega** + skill w tej kolekcji. Użyj jako checklist onboardingu i self-checku.

## Środowisko i narzędzia

- Node/Bun + VSCode + Playwright zainstalowane i pierwszy test zielony → problem: "u mnie działa" przez różne wersje → `bootstrap-test-suite`, `test-environment-provisioning`, `testing-with-bun`
- Jeden linter/formatter (Biome) + `tsc --noEmit` w CI → problem: konflikty formatowania i literówki łapane dopiero w review → `static-code-analysis-typescript`, `typescript-for-testers`
- Git na poziomie: init, add, commit, branch, push, clone, `.gitignore` → problem: sekrety/artefakty w historii, popsute branche → `git-for-testers`, `handling-sensitive-test-data`
- SVN obok gita (starsze projekty: trunk/branches/tags, commit od razu na serwer, `svn:ignore`) → problem: gitowe nawyki nie działają, brak bisect → `svn-for-testers`

## Playwright UI

- Lokator vs selektor; preferuj `getByRole`/`getByTestId` nad CSS/XPath → problem: kruche testy przy każdej zmianie HTML → `selector-strategy`
- Wzorzec AAA (Arrange-Act-Assert) i asercje web-first (`expect(locator)`) → problem: flaky przez ręczne `waitForTimeout` → `writing-playwright-tests-best-practices`, `mocking-network-and-time`
- Codegen do nagrania pierwszego testu, potem refactor → problem: pisanie wszystkiego od zera → `playwright-generate-test`
- Trace Viewer + debugowanie (`--debug`, UI mode) → problem: "nie wiem dlaczego test padł" → `diagnosing-test-failures`, `debugging-with-chrome-devtools-mcp`
- Akcje: inputy, dropdowny, checkboxy, dynamiczne elementy, iframe, Shadow DOM, dialogi, upload/download, wiele tabów → problem: testy padają na zwykłych interakcjach → `writing-playwright-tests-best-practices`, `testing-file-uploads-and-exports`
- Logowanie raz = storageState + projekt setup; dane użytkowników w `.env` → problem: wolne, flaky logowanie w każdym teście; sekrety w kodzie → `testing-auth-flows`, `handling-sensitive-test-data`
- Page Object (z klasą bazową, komponentami, fixtures) → problem: duplikacja kroków i rozjazd selektorów → `refactor-to-page-objects`, `designing-test-automation-architecture`
- Sprzątanie po testach (usuwanie utworzonych danych) → problem: dane z testów blokują kolejne runy → `test-data-factories`
- Tagi (`@smoke`, `@slow`) i projekty Playwright → problem: nie da się uruchomić tylko szybkiego zestawu → `designing-smoke-and-sanity-suites`, `automating-ci-test-pipelines`

## API / REST

- REST: zasób, endpoint, metody HTTP, kody statusów, JSON, 6 zasad → problem: nieprecyzyjne zgłoszenia ("API nie działa") → `api-concepts-for-testers`
- CRUD per endpoint + asercja konkretnego statusu i schematu body (JSON Schema/OpenAPI) → problem: "200 ale źle" → `api-playwright-test-developer`, `testing-api-contracts`
- Idempotentność (PUT/DELETE tak, POST nie; Idempotency-Key) → problem: duplikaty przy retry/redelivery → `testing-idempotency-and-retries`
- Auth: Basic/Bearer/JWT/OAuth2, 401 vs 403, sesje/cookies → problem: testy przechodzą z cudzym tokenem / padają na wygaśnięciu → `testing-oauth2-oidc`, `testing-session-management`, `testing-application-security`
- Request/response logger w fixturesach, z redakcją sekretów → problem: brak dowodu co poszło w requestcie; wyciek tokenów w logach CI → `api-request-response-logging`
- Testy UI+API razem (dane przez API, stan weryfikowany w UI) → problem: wolne E2E setupowe → `hybrid-ui-api-testing`

## CI/CD i jakość

- Pipeline: lint → typecheck → unit → API → E2E, artefakty (trace/video/raport) przy failu → problem: czerwony CI bez śladu dlaczego → `automating-ci-test-pipelines`, `test-reports-and-artifacts`
- Quality gates: coverage zmiany, flake rate, waivery z expiry → problem: zielony pipeline, martwy sygnał → `generating-quality-gate-workflows`, `governing-quality-waivers`, `verifying-change-coverage`
- Tylko affected tests w PR + pełna suita nightly → problem: 40-minutowy CI na każdy PR → `monorepo-affected-tests`

## Bezpieczeństwo (zakres QA)

- OWASP API Top 10: BOLA/IDOR, authz matrix, rate limit, JWT lab → problem: cudze dane przez zmianę ID w URL → `testing-api-security`, `testing-application-security`, `testing-abuse-limits`

## AI (jeśli produkt ma funkcje LLM)

- LLM/RAG/agenci/MCP — słownik, groundedness, guardrails, evalsy → problem: "AI odpowiedziało źle" bez klasyfikacji usterki → `ai-concepts-for-testers`, `testing-llm-features`, `test-llm-guardrails`, `design-llm-eval-suite`

## Miękkie umiejętności

- Flaky = fix lub quarantine z ownerem i expiry, nigdy retry jako fix → `flaky-test-policy`, `stabilizing-flaky-tests`
- Testy to też kod: review, `unslop-tests`, nie osłabiaj asercji żeby przejść → `unslop-tests`, `code-review`
- Raport z testów: wynik i blocker w pierwszych 2 liniach → `communicating-quality-findings`
