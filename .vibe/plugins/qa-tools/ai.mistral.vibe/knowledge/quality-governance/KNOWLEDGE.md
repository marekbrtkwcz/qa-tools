---
name: quality-governance
description: Przewodnik po warstwie ponad pisaniem testów — jak decydować, które praktyki jakości projekt faktycznie egzekwuje, wykrywać czy są wymuszane, uczciwie rejestrować wyjątki i pokazywać kierunek w czasie. Trzy długi (techniczny, intencji, zrozumienia) z trzema różnymi pułapami egzekwowania. Adaptacja przewodnika z jaktestowac/awesome-agents-for-quality.
display_name: Quality Governance
icon: scale
---

# Quality Governance

Większość problemów jakościowych to nie „potrzebujemy więcej testów”, tylko: „nikt nie ustalił, co tu oznacza obowiązkowe”, „bramka raportuje zielono, ale nie potrafi paść”, „wyłączyliśmy check podczas incidentu w marcu”, „nikt nie rozumie modułu, który wychodzi co tydzień”.

## Trzy długi, trzy pułapy

| Dług | Co mierzy | Pułap egzekwowania |
| --- | --- | --- |
| **Techniczny** | kod, architektura, zestaw testów | mierzalny → może blokować build |
| **Intencji (intent debt)** | czy high-risk zmiana ma zapisane ludzkie uzasadnienie | sprawdzalne → blokuje tam, gdzie profil ryzyka tego wymaga |
| **Zrozumienia (comprehension debt)** | czy ktoś attested, że rozumie moduł | doradczy na zawsze — nie da się udowodnić sygnałem |

Kluczowe dla zespołów z AI: **agent nie jest w stanie spłacić długu intencji** — może napisać kod, testy i dokumentację, ale nie ludzki powód, dla którego praca została zlecona.

## Co składa się na governance

- **Kontrakt jakości (quality contract)**: MUST/SHOULD/COULD per praktyka, wyprowadzony z profilu ryzyka × dojrzałość × powierzchnia produktu; macierz luki PRESENT/PARTIAL/MISSING/WAIVED.
- **Bramki warstwowe**: smoke na PR, full na merge, nightly; diff-coverage zamiast procentu repo; bramka, która nigdy nie pada, nie jest bramką.
- **Waivery**: datowane, przypisane do właściciela, wygasające; MUST nie jest waiverowalne; wygasły waiver = finding; inwentaryzacja cichych skipów.
- **Change intent**: na high-risk zmianach (auth, pieniądze, schema, publiczne API, prompty LLM) — `Intent:` trailer / ADR / rejestr, potwierdzony przez człowieka.
- **Metryki z trendem**: każda metryka z decyzją, którą wspiera, i przeciwwagą; trend over snapshot.

## W tym pluginie

- skill `quality-gates` — bramki, waivery, release readiness, change intent, metryki
- agent `change-gate-reviewer` — read-only review pojedynczego diffu
- agent `tech-debt-auditor` — audyt długu technicznego
- wiedza `reporting-and-metrics` — raportowanie i metryki testów
