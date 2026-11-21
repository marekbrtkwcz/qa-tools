# 🤖 Agent Reference — kiedy użyć którego agenta

Wszystkie 76 subagentów qa-tools w jednym miejscu. Wywołujesz jako `qa-tools:<nazwa>`.

---

## 📋 Pipeline agents (17 obszarów × 4 etapy = 68)

Każdy obszar ma ten sam łańcuch: **planner → writer → refactor → code-reviewer**.

### 🖥️ UI — `ui-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:ui-test-planner` | Masz scenariusz użytkownika, chcesz plan testu Playwright | „Zaplanuj test logowania przez formularz” |
| `qa-tools:ui-test-writer` | Masz plan w `docs/scenarios/ui/`, chcesz działający `.spec.ts` | „Napisz test z planu `login.md`” |
| `qa-tools:ui-test-refactor` | Testy działają, chcesz Page Object Model lub wydzielić helpery | „Zrefaktoryzuj testy UI do POM” |
| `qa-tools:ui-test-code-reviewer` | Masz napisany test, chcesz review pod kątem konwencji | „Zrecenzuj `tests/ui/login.spec.ts`” |

### 🔌 API — `api-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:api-test-planner` | Planujesz testy REST/GraphQL dla endpointu | „Zaplanuj testy dla `POST /api/orders`” |
| `qa-tools:api-test-writer` | Piszesz testy API (Playwright `request`) z planu | „Napisz testy API z `docs/scenarios/api/users.md`” |
| `qa-tools:api-test-refactor` | Refaktoryzacja testów API (wspólne nagłówki, auth helper) | „Wydziel wspólny auth helper w testach API” |
| `qa-tools:api-test-code-reviewer` | Review testów API (statusy, walidacja schematu, negatywne przypadki) | „Zrecenzuj `tests/api/users.spec.ts`” |

### 🌐 E2E — `e2e-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:e2e-test-planner` | Planujesz pełny flow użytkownika (wiele ekranów) | „Zaplanuj E2E: rejestracja → zakup → potwierdzenie” |
| `qa-tools:e2e-test-writer` | Piszesz test E2E z planu | „Napisz E2E z planu `checkout-flow.md`” |
| `qa-tools:e2e-test-refactor` | Refaktoryzacja E2E do POM (wiele ekranów = wiele page objects) | „Podziel E2E na page objects” |
| `qa-tools:e2e-test-code-reviewer` | Review E2E (izolacja, dane testowe, cleanup) | „Zrecenzuj `tests/e2e/checkout.spec.ts`” |

### 📱 Mobile — `mobile-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:mobile-test-planner` | Planujesz test na mobile (viewport, touch) | „Zaplanuj test swipe na liście produktów (iPhone 14)” |
| `qa-tools:mobile-test-writer` | Piszesz test mobile (device emulation, tap, swipe) | „Napisz test mobile z planu” |
| `qa-tools:mobile-test-refactor` | Refaktoryzacja testów mobile (wspólne setupy device) | „Wydziel fixture dla mobile viewport” |
| `qa-tools:mobile-test-code-reviewer` | Review mobile (brak hover, mały viewport, meta viewport) | „Zrecenzuj test mobile” |

### 🖼️ Visual — `visual-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:visual-test-planner` | Planujesz visual regression (`toHaveScreenshot`) | „Zaplanuj screenshot testy dla dashboardu” |
| `qa-tools:visual-test-writer` | Piszesz testy wizualne (baseline, maski, threshold) | „Napisz visual test strony głównej” |
| `qa-tools:visual-test-refactor` | Refaktoryzacja (wspólne viewporty, dark mode) | „Dodaj wariant dark mode do visual testów” |
| `qa-tools:visual-test-code-reviewer` | Review visual (czcionki, animacje, fullPage vs viewport) | „Zrecenzuj visual testy” |

### 🚀 Load — `load-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:load-test-planner` | Planujesz test obciążeniowy k6 (scenariusze, VUs, progi) | „Zaplanuj load test: 500 VU na logowanie przez 10 min” |
| `qa-tools:load-test-writer` | Piszesz skrypt k6 (HTTP, checks, thresholds) | „Napisz k6 script: smoke + stress na /api/search” |
| `qa-tools:load-test-refactor` | Refaktoryzacja k6 (moduły, helpery, custom metrics) | „Podziel k6 script na moduły per endpoint” |
| `qa-tools:load-test-code-reviewer` | Review k6 (thresholds SLO, czy checks nie są puste) | „Zrecenzuj `load/checkout.js`” |

### 🗄️ DB — `db-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:db-test-planner` | Planujesz weryfikację migracji danych / ETL | „Zaplanuj weryfikację migracji tabeli users → users_v2” |
| `qa-tools:db-test-writer` | Piszesz testy migracji (counts, checksums, field diff) | „Napisz test kompletności migracji zamówień” |
| `qa-tools:db-test-refactor` | Refaktoryzacja testów DB (wspólne połączenia, fixture danych) | „Wydziel helper do porównania source vs target” |
| `qa-tools:db-test-code-reviewer` | Review DB (idempotency, rollback, referential integrity) | „Zrecenzuj test migracji danych” |

### 📜 Contract — `contract-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:contract-test-planner` | Planujesz kontrakty Pact / OpenAPI | „Zaplanuj kontrakt dla consumer→provider: GET /users/:id” |
| `qa-tools:contract-test-writer` | Piszesz consumer tests (Pact) lub walidację OpenAPI | „Napisz Pact consumer test dla /users/:id” |
| `qa-tools:contract-test-refactor` | Refaktoryzacja kontraktów (matchery, provider states) | „Dodaj matchery regex do kontraktów” |
| `qa-tools:contract-test-code-reviewer` | Review kontraktów (czy matchery nie są za luźne) | „Zrecenzuj kontrakty Pact” |

### ♿ A11y — `a11y-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:a11y-test-planner` | Planujesz audit dostępności WCAG dla ekranu/flow | „Zaplanuj a11y test dla formularza rejestracji (WCAG 2.2 AA)” |
| `qa-tools:a11y-test-writer` | Piszesz testy a11y (axe-core, keyboard nav, kontrast) | „Napisz a11y test: axe + nawigacja klawiaturą” |
| `qa-tools:a11y-test-refactor` | Refaktoryzacja (wspólne reguły axe, custom rules) | „Dodaj custom rule axe dla ARIA live regions” |
| `qa-tools:a11y-test-code-reviewer` | Review a11y (czy screen reader też był sprawdzony) | „Zrecenzuj testy dostępności” |

### 🛡️ Security — `security-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:security-test-planner` | Planujesz testy OWASP Top 10 dla ficzera | „Zaplanuj testy XSS/CSRF dla formularza komentarzy” |
| `qa-tools:security-test-writer` | Piszesz testy bezpieczeństwa (XSS, IDOR, secrets) | „Napisz test: stored XSS w komentarzu” |
| `qa-tools:security-test-refactor` | Refaktoryzacja (payloady ataków w osobnych plikach) | „Wydziel payloady XSS do osobnego pliku” |
| `qa-tools:security-test-code-reviewer` | Review security (czy testy nie są tylko „happy path ataków”) | „Zrecenzuj testy bezpieczeństwa” |

> ⚠️ Testy security wymagają pisemnej autoryzacji — patrz skill `security-testing`.

### 🌪️ Chaos — `chaos-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:chaos-test-planner` | Planujesz fault injection (500, timeout, degradacja API) | „Zaplanuj chaos test: API płatności zwraca 500” |
| `qa-tools:chaos-test-writer` | Piszesz chaos testy (`page.route` → abort/500/delay) | „Napisz test: checkout gdy API zamówień laguje 5s” |
| `qa-tools:chaos-test-refactor` | Refaktoryzacja (wspólne helpery fault injection) | „Wydziel helper `injectFault(route, type)`” |
| `qa-tools:chaos-test-code-reviewer` | Review chaos (czy stan po awarii jest poprawnie czyszczony) | „Zrecenzuj chaos testy” |

### 🌍 i18n — `i18n-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:i18n-test-planner` | Planujesz testy lokalizacji (pl/en, RTL, formaty dat) | „Zaplanuj test i18n: przełączenie na arabski (RTL)” |
| `qa-tools:i18n-test-writer` | Piszesz testy i18n (locale switch, date/currency format) | „Napisz test: data w formacie pl-PL vs en-US” |
| `qa-tools:i18n-test-refactor` | Refaktoryzacja (helper do zmiany locale) | „Wydziel helper `setLocale('ar')`” |
| `qa-tools:i18n-test-code-reviewer` | Review i18n (fallbacki tłumaczeń, hardcoded strings) | „Zrecenzuj testy lokalizacji” |

### 🔖 API versioning — `versioning-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:versioning-test-planner` | Planujesz testy kompatybilności wstecznej (v1 vs v2) | „Zaplanuj test: v1 klient vs v2 API (Accept-Version)” |
| `qa-tools:versioning-test-writer` | Piszesz testy versioning (deprecation headers, backward compat) | „Napisz test: deprecated endpoint zwraca warning header” |
| `qa-tools:versioning-test-refactor` | Refaktoryzacja (per-version helpery) | „Wydziel helper `requestAsVersion('v1')`” |
| `qa-tools:versioning-test-code-reviewer` | Review versioning (czy breaking changes są wykryte) | „Zrecenzuj testy versioning” |

### 🔮 GraphQL — `graphql-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:graphql-test-planner` | Planujesz testy GraphQL (query/mutation, variables, data + errors) | „Zaplanuj test: mutation createOrder zwraca data i brak errors” |
| `qa-tools:graphql-test-writer` | Piszesz testy GraphQL (Playwright `request`, POST /graphql) | „Napisz test GraphQL z planu `create-order.md`” |
| `qa-tools:graphql-test-refactor` | Refaktoryzacja (helper `gqlRequest`, fragmenty) | „Wydziel wspólny helper gqlRequest z auth headerem” |
| `qa-tools:graphql-test-code-reviewer` | Review GraphQL (czy errors są asercjowane, brak interpolacji zmiennych) | „Zrecenzuj `tests/graphql/orders.spec.ts`” |

### 📨 Webhook — `webhook-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:webhook-test-planner` | Planujesz testy incoming webhook (podpis HMAC, replay, efekt uboczny) | „Zaplanuj test: webhook payment.succeeded tworzy rekord płatności” |
| `qa-tools:webhook-test-writer` | Piszesz testy webhooków (sign payload, POST, expect.poll na efekt) | „Napisz test webhooka z planu `payment-succeeded.md`” |
| `qa-tools:webhook-test-refactor` | Refaktoryzacja (helper podpisu, buildery payloadów) | „Wydziel helper `sign()` i `postWebhook()`” |
| `qa-tools:webhook-test-code-reviewer` | Review webhooków (zły podpis = 401, replay idempotentny, cleanup) | „Zrecenzuj `tests/webhook/stripe.spec.ts`” |

### ✉️ Email — `email-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:email-test-planner` | Planujesz testy maili transakcyjnych (Mailpit/Mailosaur) | „Zaplanuj test: rejestracja wysyła maila weryfikacyjnego z linkiem” |
| `qa-tools:email-test-writer` | Piszesz testy e-mail (expect.poll na skrzynkę, asercje temat/odbiorca/treść) | „Napisz test e-mail z planu `welcome-verification.md`” |
| `qa-tools:email-test-refactor` | Refaktoryzacja (helper findEmail, extractLink, cleanup skrzynki) | „Wydziel helper `findEmail(request, to, subject)`” |
| `qa-tools:email-test-code-reviewer` | Review e-mail (expect.poll zamiast waitForTimeout, cleanup, przypadek negatywny) | „Zrecenzuj `tests/email/signup.spec.ts`” |

### 🔭 Observability — `observability-test-*`

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:observability-test-planner` | Planujesz testy sygnałów: span OTel, log, metryka po akcji | „Zaplanuj test: złożenie zamówienia daje span z order.id i logiem info” |
| `qa-tools:observability-test-writer` | Piszesz testy obserwowalności (Loki/Tempo/Prometheus API, expect.poll) | „Napisz test obserwowalności z planu `checkout.md`” |
| `qa-tools:observability-test-refactor` | Refaktoryzacja (helpery pollForSpan / pollForLogLine / readCounter) | „Wydziel helper `pollForSpans(request, tags)`” |
| `qa-tools:observability-test-code-reviewer` | Review (asercje na atrybuty/status spanu, error path, brak PII w logach) | „Zrecenzuj `tests/observability/orders.spec.ts`” |

---

## 🎭 Role agents (8)

| Agent | Kiedy użyć | Przykład |
|---|---|---|
| `qa-tools:qa-strategist` | Potrzebujesz macierzy scenariuszy wg ryzyka, przeglądu testowalności wymagań, zakresu regresji po diffie | „Przygotuj strategię testów dla nowego modułu płatności” |
| `qa-tools:tech-debt-auditor` | Chcesz audyt długu technicznego w całym repo/suie testowej (raport z severity, ROI, roadmapą) | „Zaudytuj dług techniczny w testach” |
| `qa-tools:rubber-duck` | Debugujesz failujący/flaky test i chcesz dojść do przyczyny głównej przez pytania (bez gotowych fixów) | „Pomóż mi zdebugować flaky test logowania” |
| `qa-tools:ai-architect` | Projektujesz dwuetapowe generowanie testów (Beyond Codegen): najpierw scenariusze BDD do review, potem kod z POM | „Zaprojektuj proces generowania testów dla LLM feature” |
| `qa-tools:change-gate-reviewer` | Recenzujesz diff/PR względem kontraktu jakości (BLOCK/warn/nudge ustalenia) | „Zrecenzuj ten PR pod kątem jakości” |
| `qa-tools:llm-feature-test-engineer` | Budujesz 3 suity dla ficzera LLM: evals, guardrails, red team + bramka CI | „Przygotuj testy dla nowego chatbota LLM” |
| `qa-tools:quality-contract-architect` | Wyprowadzasz kontrakt jakości projektu (MUST/SHOULD/COULD) i macierz luk | „Wyprowadź kontrakt jakości dla tego projektu” |
| `qa-tools:skill-librarian` | Audytujesz całą kolekcję assetów (skille, prompty, agenci) jako całość — kolizje, pokrycie, jakość | „Zaudytuj kolekcję skillów w projekcie” |

---

## 🔀 Jak wybierać?

```
Potrzebujesz planu testu?          → <obszar>-test-planner
Masz plan, chcesz kod?              → <obszar>-test-writer
Kod działa, chcesz go ulepszyć?     → <obszar>-test-refactor
Chcesz review kodu?                 → <obszar>-test-code-reviewer
Potrzebujesz strategii/porady?      → qa-strategist, rubber-duck, tech-debt-auditor, ...
```

Nie wiesz od którego obszaru zacząć? Zacznij od komendy `/qa-strategy` — sama dobierze odpowiednie agenty.
