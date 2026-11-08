# ⚡ Quick Start — 5 minut do pierwszego testu

Pełny opis: `README.md`. Tu tylko najszybsza ścieżka.

## 1. Wybierz setup i wygeneruj projekt

```bash
# interaktywnie (menu):
node scripts/new-project.ts

# albo wprost — pełny projekt Playwright (UI + API + E2E):
node scripts/new-project.ts --setup=playwright-fullstack --dir=~/moj-projekt-testowy
```

Inne setupy: `playwright-ui-only`, `api-testing-only`, `performance-k6`, `security-and-data`, `accessibility-wcag`, `unit-testing-vitest`.

## 2. Zainstaluj zależności i skonfiguruj środowisko

```bash
cd ~/moj-projekt-testowy
npm install -D typescript @types/node @biomejs/biome tsx dotenv dotenv-cli npm-check-updates @faker-js/faker @clack/prompts @playwright/test vitest @vitest/coverage-v8 && npm install zod
cp .env.example .env        # uzupełnij BASE_URL / API_URL
npx playwright install --with-deps chromium
```

## 3. Zobacz przykład

Działający przykładowy projekt znajdziesz w `examples/demo-project/` — skopiuj stamtąd `LoginPage` i testy jako punkt wyjścia.

## 4. Uruchom pierwszy test

```bash
npm run menu                # interaktywne menu zadań (z package.json)
# lub bezpośrednio:
npm run test:ui             # testy UI
npm run test:api            # testy API
npm run test:e2e            # testy E2E
npm run check               # Biome lint + format
```

## 5. Dodaj własny test — pipeline agentów (Vibe)

W projekcie użyj skilla, np. `qa-ui-playwright`, który orchestrę agentów:

```
planner (plan do docs/scenarios/ui/) → writer (tests/ui/*.spec.ts) → refactor → code-review
```

Każdy agent kończy Work Summary. Plan walidowany względem realnego UI przez przeglądarkę.

## 🧹 Porządki i aktualizacje

```bash
npm run clean               # usuń artefakty (playwright-report, test-results, coverage...)
npm run deps:check          # ncu — przestarzałe paczki
npm run audit               # npm audit
```
