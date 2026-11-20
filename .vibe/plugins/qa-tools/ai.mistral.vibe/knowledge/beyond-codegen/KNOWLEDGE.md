---
name: beyond-codegen
description: Przewodnik po dwuetapowym generowaniu testów przez AI — model najpierw projektuje scenariusze oparte na ryzyku, człowiek je przegląda, dopiero zatwierdzone scenariusze zamienia w kod testowy. Adaptacja przewodnika z jaktestowac/awesome-agents-for-quality.
display_name: Beyond Codegen
icon: layers
---

# Beyond Codegen — dwa etapy zamiast jednego

One-shot generation („napisz testy Playwright dla strony checkout”) testuje to, co model widzi, nie to, co funkcja obiecuje. Output się kompiluje, przechodzi na zielono i pokrywa happy path plus to, co akurat było w DOM. Scenariusze, których nikt nie zapytał, to te, które znalazłyby buga: płatność za anulowane zamówienie, double submit, 256-znakowe imię. Gdy kod już istnieje, review coverage oznacza czytanie testów linijka po linijce — a tego nikt nie robi. Rozdzielenie designu od kodu przenosi review w najtańszy punkt: listę Given/When/Then, którą product owner czyta w pięć minut.

## Kiedy używać dwóch etapów

Gdy funkcjonalność ma **stan** (zamówienia, subskrypcje, aprovals — cokolwiek z lifecycle), **reguły** (limity, uprawnienia, walidacja) albo **pieniądze i dane** na szali. To tam brakujące scenariusze kosztują najwięcej, a model zgadujący z UI ich nie wymyśli.

Pomiń dla statycznej strony, formularza jedno-polowego albo szybkiego smoke testu — tam lista scenariuszy jest oczywista, a review kosztuje więcej niż oszczędza. Generuj od razu kod (np. komendą `/playwright-generate-test`).

## Jak to robić

1. **Etap 1 — design**: zamień user story i stany encji (np. `Pending Payment`, `Paid`, `Cancelled`) w scenariusze BDD: happy path, negative, boundary, concurrency, invalid state transitions. Bez stanów nie powstaną scenariusze invalid-transition — te, których one-shot nigdy nie znajduje. Zapisz do `spec/edge-cases.md`.
2. **Review scenariuszy przed napisaniem kodu.** Edytuj plik bezpośrednio — to kontrakt dla etapu 2.
3. **Etap 2 — kod**: generuj testy z zatwierdzonego pliku planu, albo `/playwright-generate-test` dla pojedynczego scenariusza, gdy chcesz go najpierw zweryfikować w żywej aplikacji.
4. **Sprawdź wygenerowane testy przeciw scenariuszom**: jeden test (lub jedna grupa `test.step`) na zatwierdzony scenariusz, każdy `Then` oparty na asercji. Scenariusz bez asercji został zgubiony po drodze — wróć do niego.

## Jak wygląda dobry review scenariuszy

Przeczytaj listę z kimś, kto zna funkcjonalność (PO, developer, tester). Dla każdego scenariusza:

- **Czy `Then` jest obserwowalny?** „Płatność zostaje odrzucona” musi powiedzieć jak: komunikat błędu, status, niezmienione saldo. Jeśli nie umiesz napisać asercji, scenariusz nie jest gotowy.
- **Czy to prawda?** Model wymyśla wiarygodne reguły („hasło musi zawierać symbol”). Wykreśl każde oczekiwane zachowanie, którego nikt nie potrafi wskazać w wymaganiach, albo zamień w pytanie do PO.
- **Czy to duplikat?** Pięć wariantów nieprawidłowego e-maila testuje tę samą regułę. Zostaw jeden plus boundary.
- **Czego brakuje?** Porównaj kategorie (happy path, walidacja, boundary, concurrency, invalid transitions) ze stanami, które wymieniłeś. Każdy stan końcowy powinien mieć scenariusz „akcja na zakończonym obiekcie”.
- **Na jakim poziomie to siedzi?** Czysta reguła walidacji jest tańsza jako unit lub API test — oznacz to, żeby etap 2 nie zamieniał każdego scenariusza w test przeglądarkowy.

Review jest skończony, gdy każdy pozostały scenariusz ma obserwowalny wynik, trace do wymagania lub potwierdzonej decyzji, i przypisany poziom testu.

## Co pójdzie nie tak bez tego

- **Suity happy-path.** Model pisze flow, który widzi; invalid transitions i concurrency wymagają wiedzy o domenie i się nie pojawiają.
- **Wymyślone zachowanie zamrożone w asercjach.** Zgadnięta reguła staje się przechodzącym testem, a test zaczyna bronić zgadywanki.
- **Coverage, o którym nie da się rozmawiać.** Product ownerzy nie czytają plików `.spec.ts`, więc nikt poza kodem testów nie umie powiedzieć, czego brakuje.
- **Review fatigue.** Review 400 linii wygenerowanego kodu pod kątem coverage jest wolne i się je pomija; review 12 scenariuszy już nie.
