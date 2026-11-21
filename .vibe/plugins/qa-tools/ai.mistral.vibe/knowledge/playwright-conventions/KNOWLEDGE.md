---
name: playwright-conventions
description: Skonsolidowane konwencje repo: Playwright + TypeScript, testy API, page objects, quality gates w CI, trailery commitów, evalsy LLM. Zastępuje reguły z jaktestowac/awesome-agents-for-quality.
display_name: Playwright & Repo Conventions
icon: scroll
---

# Konwencje Playwright i repozytorium

Jeden skonsolidowany przewodnik z ośmiu reguł źródłowych. Odpowiada na pytanie: jak piszemy testy, page objecty, commity i bramki w tym projekcie.

## 🧪 Testy E2E (`tests/e2e/**/*.spec.ts`)

- **Intencja testu**: jeden test = jedna podróż użytkownika / jeden wynik biznesowy. Kroki `test.step` opisują, co użytkownik osiąga („Dodaj produkt do koszyka"), nie który element kliknął. Preconditions seeduj przez API lub fixture; przez UI prowadź tylko testowany flow.
- **Lokatory** w kolejności: `getByRole()` z `name` → `getByLabel()` / `getByPlaceholder()` → `getByText()` → `getByTestId()`; CSS/XPath tylko gdy nic innego nie działa, z komentarzem dlaczego. Nigdy selektory po layoutcie lub wygenerowanych klasach. Każdy lokator rozwiązuje się do jednego elementu (strict mode) — zawężaj przez scope i `filter({ hasText })`, nie przez pozycję (`.nth()` tylko gdy pozycja sama jest testowanym zachowaniem, i pisz to w teście).
- **Synchronizacja**: tylko web-first asercje (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`, `toBeHidden()`). Nigdy `page.waitForTimeout()`, nigdy `waitForLoadState('networkidle')` jako synchronizacja. Gdy test zależy od requestu: zacznij `page.waitForResponse(...)` **przed** akcją, która go wywołuje. Asercje na treści/stanie, nie tylko na widoczności. Nigdy `expect(await locator.isVisible()).toBeTruthy()` — nie retry'uje i nic nie raportuje.
- **Sieć**: mockuj third-party i niedeterministyczne serwisy (płatności, mapy, analytics, e-mail) przez `page.route()` + `route.fulfill({ json })` lub `route.abort()`; rejestruj routes przed akcją (przed `page.goto` dla requestów on-load). Własny backend zostaw prawdziwy, chyba że test dotyczy stanu błędu. HAR przy wielu endpointach: `page.routeFromHAR()`.
- **Anty-flake**: naprawiaj przyczynę, nie objaw — żadnych podwójnych klików, ręcznych pętli retry, `try/catch` wokół akcji. Po nawigacji najpierw asertuj gotowość strony (nagłówek/kluczowy komponent). Timeout podnoś lokalnie i z komentarzem, nigdy globalnie. `expect.poll()` / `toPass()` tylko dla eventual consistency poza stroną, z jawnym `timeout`.
- **Diagnostyka**: `trace: 'on-first-retry'`, screenshot on-failure, tytuły kroków; własny komunikat gdy expected/received nie wystarcza: `await expect(banner, 'payment confirmation').toBeVisible()`.

## 🧱 Page Objects (`**/pages/**/*.ts`)

- Metody na poziomie intencji (`loginAs(user)`, `addProductToCart(name)`), nie łańcuchy `click()`. Lokatory `private readonly`, w camelCase; stan trzymaj jako `Locator` (odporny na re-render), nie ElementHandle i nie migawki stanu, które mogą się zestarzeć.
- Nawigacja relatywna (`page.goto('/login')`, `baseURL` z configu). Metoda wywołująca nawigację czeka na jej zakończenie przed returnem (`waitForURL` lub asercja stabilnego elementu nowej strony). Zdarzenia (popup, download): zacznij czekać przed akcją.
- Asercje w page object: minimalne i znaczące (`expectLoggedInAs(name)`); scenariusz i jego asercje zostają w teście. Nazwy metod — czasowniki (`open()`, `save()`, `deleteProject()`); metody małe i kompozyowalne; nawigacja zwraca kolejny page object (łańcuchowanie). Wspólne setupy jako **fixtures** (`test.extend`), page objecty tworzone przez fixture/factory.

## ⚙️ Wspólne reguły Playwright + TS (`tests/**/*.ts`, config)

- Layout: UI w `tests/e2e/`, API w `tests/api/`, auth setup w `*.setup.ts`, page objecty w `pages/`, fixtures w `fixtures/`. Pliki `<feature>.spec.ts`, jedna cecha na plik. Import `test`/`expect` z modułu fixtures projektu, nie bezpośrednio z `@playwright/test`.
- Struktura: `test.describe` grupuje cechę (wspólny setup, nigdy zależność kolejności). Tytuły opisują zachowanie: `user can pay with a saved card`. AAA widoczne w ciele testu; każdy test kończy się asercją na wyniku, który nazywa. Najbardziej specyficzny matcher: `toHaveText` / `toContainText` / `toHaveCount` / `toMatchAriaSnapshot`.
- **Fixtures ponad zmienne modułowe**: leniwe, komponowalne, teardown po `use()` nawet przy failu; cleanup w teardownie fixture, nie w `afterEach`. Nigdy `page`/`context` w `beforeAll` współdzielony między testami. `{ scope: 'worker' }` tylko dla drogich, read-only zasobów.
- **Dane testowe**: każdy test tworzy/włada danymi, na których asertuje; unikalność per test (`crypto.randomUUID()` lub `test.info().workerIndex`); fabryki z override'ami (`createUser({ role: 'admin' })`); seed przez API/fixture, nie przez UI (chyba że UI jest przedmiotem testu); loguj generowane wartości/seed.
- **Auth**: logowanie raz w projekcie setup, `storageState`, projekty testowe zależą od setupu; `.auth/` w `.gitignore`; osobny projekt per rola; opt-out przez `test.use({ storageState: { cookies: [], origins: [] } })`.
- **Konfiguracja**: `retries: process.env.CI ? 2 : 0` (retry w CI = wykrywanie flake, nie fix), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `forbidOnly: !!process.env.CI`, `baseURL` z configu (env dla wdrożeń), relatywne `page.goto('/login')`, domyślne timeouty — `test.slow()` lokalnie z komentarzem, `webServer` z `reuseExistingServer: !process.env.CI`.

## 🔌 Testy API (`tests/api/**/*.spec.ts`)

- Cel: deterministyczne, izolowane testy weryfikujące semantykę HTTP (status + nagłówki), kontrakt (schema/kształt) i kluczowe pola biznesowe (nie cały payload). AAA widoczne w teście; tytuły opisują zachowanie (`should reject checkout when cart is empty (400)`).
- Klienci API jako typowane wrappery wokół `request`/`APIRequestContext` (typowane wejście/wyjście, scentralizowane nagłówki/auth, baseUrl, obsługa błędów); żadnych duplikowanych fetchy w testach; błędy nigdy połykane — fail z kontekstem (endpoint, status, fragment odpowiedzi).
- Asercje: zawsze status (`toBeOK()` dla 2xx, dokładny kod gdy to kontrakt) i content-type gdy ma znaczenie; komunikat przy każdej asercji; soft assertions tylko dla pól niekrytycznych; kluczowe pola biznesowe (ID, status, sumy, waluty, uprawnienia); bez pełnych snapshotów payloadu (snapshot tylko stabilnych podzbiorów); dla tablic: długość + reprezentatywny element, kolejność tylko gdy API ją gwarantuje.
- Izolacja: dane przez API/setup helpers, unikalne ID per run, cleanup w teardownie fixture (best effort) lub dedykowany tenant/TTL. Nigdy danych „z wczoraj” ani zewnętrznych cronów.
- Środowisko: nigdy produkcja; base URL i credentials z env (`API_BASE_URL`, `API_TOKEN`), raz w config/fixture, relatywne ścieżki w testach; brakująca zmienna = fail fast z jasnym błędem; żadnych sekretów w kodzie i logach (redukcja przy debugowaniu).
- Eventual consistency: `expect.poll` z ograniczonym timeoutem + komentarz dlaczego + ticket/spec. Retry tylko requestu w `expect.poll`/`toPass`, nigdy żeby test „przeszedł”.

## 📝 Styl TypeScript (`{tests,src}/**/*.ts`)

- Eksportowane funkcje/klasy mają jawne return types; żadnych `any` (użyj `unknown` + type guard); `readonly` dla inputów; `type` dla unionów, `interface` dla rozszerzanych kształtów; `as const` dla literałów/fixture.
- Biblioteki w `src/` rzucają typowane błędy (własne klasy `Error` ze stabilnym `name`); catch nie połyka — rethrow, wrap z kontekstem albo typowany `Result`. W testach najpierw typ/kod błędu, dokładny komunikat tylko gdy jest częścią kontraktu.
- Importy sortowane, nieużywane usuwane (linter/formatter, nie ręcznie); `import type` gdy możliwe; named exports dla utilów.
- `async/await` zamiast `.then()`; brak ukrytych efektów przy imporcie (brak I/O i env readów na module load) — jawna inicjalizacja.

## 🧾 Commit trailery

- Trailer zapisuje **dlaczego** zmiana powstała, tam gdzie przyszły czytelnik zaczyna: `git log` / `git blame`. Przeżywa zamknięcie PR i archiwum ticketa.
- Gramatyka: `<type>(<scope>): <subject>`, body w prozie, na końcu blok trailerów (ostatni akapit, jedna para `Key: value` na linię):
  - `Intent: <dlaczego teraz, co wymusiło kształt, co odrzucono>` — **wymagany na high-risk surface** (nowy publiczny eksport, endpoint, auth, schema/migracja, usunięty guard, nowa zależność, opublikowany kontrakt, moduł critical-path); NIE wymagany dla formatowania, lintu, docs, test-only, czystych rename'ów
  - `Intent-Ref: <ADR-nnnn | TICKET-nnn | url>`, `Assisted-by: <tool>`, `Comprehension-Attested-by: <name>` (per-change attestacja zrozumienia — zobacz skill `attesting-manual-verification`)
- Walidacja: `Intent:` ≥ 20 znaków, nie może być prawie duplikatem subjecta, blok musi być ostatnim akapitem; pisz przez `git commit --trailer "..."`.

## 🤖 Evals LLM (`{evals,prompts}/**`, `*.eval.*`, promptfoo)

- **Determinizm**: pinuj model do datowanego snapshot ID (nigdy `latest`); `temperature: 0` chyba że wartość funkcji zależy od wariacji; seed gdzie provider wspiera; zamroź retrieval (snapshot dokumentów do fixtures, żywy indeks testuj osobno); stubuj odpowiedzi narzędzi; `retry: 0`; zapisuj `model`, hash promptu, wersje case-setu i korpusu z każdym wynikiem.
- **Case'y**: każdy ma `id`, `template`, `capability`, `class` (golden/edge/negative/regression/adversarial) i pole `why`. Golden expectations zatwierdza człowiek — nigdy nie wklejaj bieżącego outputu modelu jako oczekiwanie. Każdy szablon promptu ma co najmniej jeden case negatywny. Każda produkcyjna awaria = permanentny case regresyjny, dodany **przed** fixem. Inputy w plikach fixture, nie inline; sanityzacja danych z realnych źródeł.
- **Asercje — najtańsza strategia, która potrafi paść**, w kolejności: exact/regex → walidacja schematu → wymagana/zabroniona treść → deterministyczna własność (liczba zdań, poprawny JSON, cytaty resolvują się do źródeł) → podobieństwo embeddingów → sędzia rubryką → human review. Jedna asercja strukturalna + jedna merytoryczna na case. Ban na unfalsifiable: `not-empty`, `similarity > 0.5`, `rubric: "is helpful"`. Gdzie ryzykiem jest halucynacja — asertuj `null`.

## 🚦 Quality gates w CI

- Bramka, która nigdy nie pada, nie jest bramką: `allow_failure: true` / `continue-on-error: true` = jawny soft gate (amber), `|| true` i threshold 0 = kłamstwo (green).
- Wymagane checki muszą być w branch protection; nie gituj na jobach tylko `schedule`/`workflow_dispatch` ani skipowanych dla forków. Diff-scoped coverage (changed lines, `fetch-depth: 0`; fail gdy changed-lines = 0 przy niepustym diffie); repo-wide coverage jako osobna słabsza reguła „nie może spaść”. `paths:` do drogich jobów tylko tam, gdzie zmiana ma znaczenie.
- Higiena: pinuj wersje actions/kontenerów; `timeout-minutes` na każdym jobie; least-privilege `permissions:`; żadnych sekretów w echo/nietrusted PR code; cache'uj zależności, nie wyniki testów.
- Retry w CI wykrywają flake (nie leczą): trzymaj nisko (`retries: CI ? 2 : 0`), raportuj liczbę flaky, kwarantanna z ownerem i datą.
- Raportowanie: jeden sticky comment per gate (kluczowany nagłówkiem), werdykt + szczegóły worst-first + jawna lista tego, czego check **nie** pokrył; adnotacje na poziomie linii.
- Rollout nowej bramki: report → warn → block na eskalowanych ścieżkach (auth, migracje, critical path) → block wszędzie. Waiver w CI = komentarz z ID i datą wygaśnięcia (zobacz skill `quality-gates`).
