---
name: reporting-and-metrics
description: Raportowanie i metryki testów — raporty Playwright (HTML/JSON/Allure), flaky rate, quality gates w CI, progi jakości i jak o nich raportować.
display_name: Raportowanie i metryki
icon: chart
---

# Raportowanie wyników testów i metryki jakości

## Raporty Playwright

| Raport | Konfiguracja | Kiedy |
|---|---|---|
| HTML (wbudowany) | `reporter: [['html', { open: 'never' }]]` | lokalnie i w CI — artefakt `playwright-report/` |
| List | `['list']` | czytelny log w CI |
| JSON | `['json', { outputFile: 'results.json' }]` | do dalszej analizy/metryk |
| JUnit | `['junit', { outputFile: 'results.xml' }]` | integracja z GitHub Checks / Jenkins |
| Allure | `allure-playwright` | bogaty raport z załącznikami (trace, video, screenshot) |

Artefakty w CI (GitHub Actions): `actions/upload-artifact` z `playwright-report/`, `test-results/` (trace/video/screenshot), zawsze (`if: always()`), żeby raport był dostępny także przy failu.

## Co mierzyć

- **pass rate** per projekt/przeglądarka — spadek = regresja
- **flaky rate** = testy z `retries` zakończone sukcesem / wszystkie — próg: < 2%; lista flaky testów do naprawy (nigdy nie „przykrywać” retries)
- **czas wykonania** (duration) — trend w czasie; alert przy wzroście > 20% vs mediana z 7 dni
- **pokrycie wymagań** — mapa scenariuszy z `docs/scenarios/` na testy (plannerzy to generują)

## Quality gates w CI

- `npx playwright test` — wszystkie testy zielone (wymagane)
- `--forbid-only` w CI — żaden `test.only` nie przechodzi
- flaky rate poniżej progu (skrypt z `results.json`)
- walidacja struktury pluginu: `py scripts/validate-plugin.py` (ten plugin)
- raport HTML jako artefakt; JUnit jako check w PR

## Zasady raportowania

- każdy fail w raporcie ma trace + screenshot + video (`retain-on-failure`) — bez tego raport jest bezużyteczny
- flaky testy oznaczamy i naprawiamy, nie retry-ujemy w nieskończoność
- metryki (pass rate, duration, flaky) wrzucamy do dashboardu (np. trendy w czasie), nie tylko „zielone/czerwone”
