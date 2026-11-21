# Testy Playwright — konwencje i taksonomia tagów

Uruchomienie: `npx playwright test` (z katalogu głównego repo). Selektory tylko
`getByRole` / `getByLabel` / `getByText` / `getByTestId`, asercje tylko przez
`await expect(...)` — zakaz `waitForTimeout`. Każdy test niezależny, dane czyścimy
w `afterEach`. Nazwy testów: `should <rezultat> when <warunek>`.

## Struktura

```
tests/
├── e2e/          # testy UI (przeglądarka) — *.spec.ts
├── api/          # testy API (Playwright request) — *.spec.ts
└── README.md     # ten plik
```

## Tagi (tag taxonomy)

Tag wpisujemy w nazwę testu: `test('@smoke @regression should ...', ...)`. Selekcja przez `--grep`.

| Tag | Znaczenie | Kiedy działa w CI | Przykład użycia |
|-----|-----------|-------------------|-----------------|
| `@smoke` | Szybki, offline-safe (zamockowany backend lub publiczne echo-API). Musi przechodzić zawsze. | Każdy PR i push (`e2e.yml` → job `playwright-smoke`) | `npx playwright test --grep @smoke` |
| `@regression` | Pełny zestaw regresji; może wymagać środowiska (`BASE_URL` / `API_URL`). | Push do `main` (job `playwright-regression`) | `npx playwright test --grep @regression` |
| `@flaky` | Kwarantanna: test znany jako niestabilny, z ownerem i datą wygaśnięcia w komentarzu. Nigdy nie naprawiamy flaka przez `retries`. | Wykluczony z bramek (`--grep-invert @flaky`), widoczny w raporcie | `npx playwright test --grep-invert @flaky` |

## Zasady

- Każdy test w `tests/` ma co najmniej `@regression`; szybkie i izolowane mają też `@smoke`.
- Test dodany jako `@flaky` musi mieć komentarz: owner + data wygaśnięcia (por. skill `stabilizing-flaky-tests`).
- CI nie używa `retries` jako „fixu" — `retries: 0` w `playwright.config.ts`.
