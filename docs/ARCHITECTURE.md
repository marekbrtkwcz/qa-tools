# 🧵 Architecture — qa-tools

Biblioteka umiejętności i agentów dla testera automatyzującego (TS/JS, Playwright, k6, SQL, Biome).

## 📌 Model: domena × rola

Każda domena testów ma 4 agentów (subagentów) spiętych w pipeline. **Agenci nie pinują modelu** (brak pola `model:` w frontmatter) — każdy subagent dziedziczy aktywny model sesji Vibe:

```
planner → writer → refactor → code-review
```

| Domena | Katalog agentów | Skill (Vibe) | Setup |
|---|---|---|---|
| UI (Playwright) | `agents/ui/` | `qa-ui-playwright` | `setups/playwright-ui-only` / `playwright-fullstack` |
| Web API | `agents/api/` | `qa-api-playwright` | `setups/api-testing-only` / `playwright-fullstack` |
| E2E hybrid (API+UI) | `agents/e2e/` | `qa-e2e-hybrid` | `setups/playwright-fullstack` |
| Wydajność (k6) | `agents/performance/` | `qa-performance-k6` (+ wbudowane skille k6*) | `setups/performance-k6` |
| Security / dane | `agents/security/` | `qa-security-data` | `setups/security-and-data` |
| SQL / konwersje danych | `agents/data/` | `qa-data-sql` | `setups/security-and-data` |
| Dostępność (WCAG, axe-core) | `agents/accessibility/` | `qa-accessibility-wcag` | `setups/accessibility-wcag` |
| Unit (Vitest + coverage) | `agents/unit/` | `qa-unit-vitest` | `setups/unit-testing-vitest` |

## ⛓️ Przepływ pracy

1. Użytkownik wybiera **typ zadania** → właściwy **setup** tworzy projekt.
2. Właściwy **skill** ładuje pipeline agentów dla domeny.
3. Agenci pracują jako subagenci w kolejności: plan (walidacja względem realnego UI / OpenAPI / kodu źródłowego) → kod → refaktoryzacja → review.
4. Każdy agent kończy obowiązkowym **Work Summary** (pliki, decyzje, założenia).

## 🔧 Warstwy wspólne

- `shared/biome.json` — jeden kanoniczny config lintera/formattera.
- `shared/tsconfig.base.json` — strict TS + `verbatimModuleSyntax` + aliasy `@api/*`, `@ui/*`.
- `shared/playwright.config.ts` — kanoniczny config Playwright: projekty `api`/`ui`/`e2e` z `baseURL` z singletonu env (`env.API_URL` / `env.BASE_URL`); w configu brak `process.env`.
- `shared/conventions.md` — nazewnictwo, lokatory, dane testowe, gitignore.
- `shared/env.ts` — singleton zmiennych środowiskowych (dotenv + zod); `shared/env.example` — szablon `.env.example`.
- `shared/faker.ts` — szablon instancji @faker-js/faker (`src/utils/faker.ts`) z seedem; dane tylko w factories.
- `shared/ncurc.json` — konfig npm-check-updates (`.ncurc.json`, target: latest); aktualizacje zależności tylko tam, gdzie jest `package.json`.
- `shared/package.scripts.json` — kanoniczny blok `scripts` do `package.json` (testy per warstwa incl. `test:unit`, coverage `coverage`, Biome, audit, deps:*).
- `shared/vitest.config.ts` — kanoniczny config Vitest: coverage provider v8, raporty text/html/json-summary/lcov do `coverage/`, progi (thresholds) 80% — coverage obowiązkowe w projektach unit.
- `shared/gitignore` — szablon `.gitignore` (sekrety lokalnie, lockfile w repo).
- `shared/security-payloads.ts` — szablon kanarkowych payloadów (`CANARIES`, `SECURE_BEHAVIOR`) i skanera wycieków `scanForLeaks()` (PESEL, nr karty, JWT, token, pole password) + `EXPECTED_SECURITY_HEADERS`; kopiowany do `src/data/security-payloads.ts` tylko w setupach z warstwą security.
- `shared/security-fixtures.ts` — szablony kontekstów ról (`userRequest()` / `adminRequest()` / `anonymousRequest()`) i asercji IDOR/auth (`expectNoIdorLeak()`, `expectUnauthorized()`); kopiowany do `src/fixtures/auth.fixture.ts`.
- `shared/security-plan.template.md` — szablon planu security (rules of engagement, macierz OWASP, rejestr findings) do `docs/scenarios/security/`.
- `shared/ci/github-actions.yml` — szablon workflow GitHub Actions → `.github/workflows/ci.yml` (Biome check + `npm audit` + Gitleaks → testy → coverage jako gate; `.env` w CI tylko z GitHub Secrets).
- Każdy projekt testowy ma folder `docs/` (openapi, scenarios per domena, adr, guides, architecture) — konwencja w `shared/conventions.md`.
- Każdy projekt ma też `scripts/` — skrypty TS na tsx (`npm run script -- ...`), interaktywne CLI na @clack/prompts (szablon `shared/script.example.ts`), menu zadań `shared/menu.ts` (`npm run menu`), porządki `shared/clean.ts` (`npm run clean`); `scripts/sql/` dla SQL.
- Standard walidacji struktur: **zod** (env, odpowiedzi API, payloady); wyjątek: skrypty k6.
- Konwencja bezpieczeństwa: zawsze najnowsze wersje bibliotek, `package-lock.json` commitujemy, `npm audit` + `ncu -u` regularnie.
- Wszystkie projekty TS/JS w ESM: `"type": "module"`, `NodeNext` + `verbatimModuleSyntax` (wyjątek: skrypty k6).

## 🧰 Wbudowane skille (narzędzia)

Skill `qa-performance-k6` deleguje pracę nad skryptami do wbudowanych skilli: `k6`, `k6-perf-test-website`, `k6-browser-test`, `k6-trend-analysis`, `k6-cloud-investigate-test`, `k6-manage`. Skill `qa-ui-playwright` korzysta z `playwright-best-practices` i `playwright-cli`.

