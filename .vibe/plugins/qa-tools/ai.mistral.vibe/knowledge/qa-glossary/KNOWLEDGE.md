---
name: qa-glossary
description: Słownik pojęć i terminów inżynierii jakości — definicje testów jednostkowych, integracyjnych, E2E, smoke, regression, flaky tests, test double, CI/CD i inne kluczowe terminy QA.
display_name: Słownik QA
icon: book
---

# Słownik pojęć QA

## Rodzaje testów

| Termin | Definicja |
|---|---|
| **Unit test** | Test pojedynczej funkcji/metody w izolacji. Szybki, deterministyczny. |
| **Integration test** | Test współpracy między komponentami (API + baza, UI + API). |
| **E2E test** | Test pełnego flow użytkownika przez całą aplikację w przeglądarce. |
| **Smoke test** | Szybki zestaw testów weryfikujący że aplikacja w ogóle działa po deployu. |
| **Regression test** | Testy uruchamiane po zmianie, aby upewnić się że nic się nie zepsuło. |
| **Sanity test** | Wąski, powierzchowny test po małej zmianie — czy dana funkcjonalność działa. |
| **Acceptance test (UAT)** | Testy wykonywane przez biznes — czy aplikacja spełnia wymagania. |

## Problemy z testami

| Termin | Definicja |
|---|---|
| **Flaky test** | Test który czasem przechodzi, czasem nie — bez zmiany kodu. |
| **Test double** | Obiekt zastępujący rzeczywistą zależność (mock, stub, fake, spy). |
| **Mock** | Obiekt z predefiniowanymi odpowiedziami, weryfikuje wywołania. |
| **Stub** | Obiekt zwracający z góry ustalone dane, bez weryfikacji wywołań. |
| **Fixture** | Stały stan/dane używane jako baza dla testów. |

## Metryki jakości

| Termin | Definicja |
|---|---|
| **Code coverage** | % kodu wykonany podczas testów (line, branch, function). |
| **Mutation testing** | Wprowadzanie małych zmian w kodzie aby sprawdzić czy testy to wykryją. |
| **Defect density** | Liczba bugów na jednostkę kodu (np. na 1000 linii). |
| **MTTR** | Mean Time To Repair — średni czas naprawy błędu. |
| **MTBF** | Mean Time Between Failures — średni czas między awariami. |

## Procesy

| Termin | Definicja |
|---|---|
| **CI (Continuous Integration)** | Automatyczne budowanie i testowanie przy każdej zmianie. |
| **CD (Continuous Delivery/Deployment)** | Automatyczne wdrażanie na produkcję po przejściu testów. |
| **Shift-left testing** | Testowanie jak najwcześniej w cyklu życia — nie tylko na końcu. |
| **Quality gate** | Zestaw kryteriów które muszą być spełnione przed release. |
| **Test pyramid** | Proporcje: dużo unit, średnio integration, mało E2E. |

## Web performance

| Termin | Definicja |
|---|---|
| **LCP** | Largest Contentful Paint — czas załadowania największego elementu. |
| **INP** | Interaction to Next Paint — czas reakcji na interakcję użytkownika. |
| **CLS** | Cumulative Layout Shift — stabilność wizualna podczas ładowania. |
| **TTI** | Time to Interactive — czas do pełnej interaktywności strony. |
| **TBT** | Total Blocking Time — czas blokowania głównego wątku. |
