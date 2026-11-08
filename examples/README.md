# 📦 Przykłady — qa-tools

Ten katalog zawiera **działający przykładowy projekt** wygenerowany przez scaffold qa-tools.

## 🚀 demo-project

```
examples/demo-project/   ← pełny projekt Playwright (UI + API + E2E) wygenerowany przez:
                           node scripts/new-project.ts --setup=playwright-fullstack --dir=examples/demo-project
```

Zawiera przykładowe:

- `src/ui/pages/login.page.ts` — Page Object Model
- `tests/ui/login.spec.ts` — test UI logowania
- `tests/api/health.spec.ts` — test API health-check
- `docs/scenarios/ui/login.ui.scenario.md` — przykładowy plan scenariusza od plannera

### Jak uruchomić demo

```bash
cd examples/demo-project
npm install
cp .env.example .env    # uzupełnij BASE_URL / API_URL
npx playwright install
npm run test:ui         # lub test:api, test:e2e
```
