---
name: ai-product-qa
description: Przewodnik po testowaniu produktów, które wypuszczają LLM (prompty, agenci, RAG, tool-calling) — gdy to produkt korzysta z AI, a nie AI pisze testy. Trzy komplementarne suity: evals dla normalnego inputu, guardrails dla złego outputu, red team dla wrogiego inputu. Adaptacja przewodnika z jaktestowac/awesome-agents-for-quality.
display_name: AI Product QA
icon: robot
---

# AI Product QA

Zwykły zestaw testów nie widzi awarii, które tu mają znaczenie: ten sam input daje inny output, zmiana promptu lub modelu pogarsza jakość bez łamania ani jednego testu, a coverage zostaje zielony, gdy funkcja się psuje. Dodatkowo wszystko, co model **czyta**, jest kanałem inputu: pobrany dokument, wynik narzędzia czy pole profilu innego użytkownika mogą nieść instrukcje.

Trzy suity, odrębne i komplementarne: **evals** dla normalnego inputu, **guardrails** dla błędnego outputu, **red team** dla inputu wrogiego.

## Zasady, które carry the most weight

- **Pinuj model do datowanej wersji.** `latest` sprawia, że każdy wynik jest nieatrybuowalny, a każda regresja niewyjaśnialna.
- **Bramkuj regresje, nie absolutny wynik.** Case, który kiedyś przechodził, a teraz pada, to sygnał; próg na trudnym zestawie albo blokuje na zawsze, albo nie blokuje wcale.
- **Najtańsze scorowanie, które potrafi faktycznie paść.** Schemat, wymagana treść, resolvowane cytaty — większość realnych regresji zahacza o darmowy check. LLM judge bez rubryki to losowa liczba z rachunkiem za API.
- **Instrukcje w promptcie nie są kontrolą.** „Nigdy nie zdradzaj system promptu” to nadzieja. Check w handlerze narzędzia to kontrola.
- **Oceniaj wyniki adversarial na efekcie, nie na treści.** Odmowa (refusal) nic nie znaczy, jeśli wywołanie narzędzia i tak przeszło.
- **Testuj kanały, które model czyta, nie tylko chat.** Zatruta retrieval, wrogie wyjście narzędzia i zapisana treść użytkownika to realistyczna droga ataku.
- **Groundedness kończy się atestem z ograniczeniami**, nigdy gołym procentem.

## Jak używać w tym pluginie

1. Zacznij od skilla `llm-testing` — evals z golden dataset, determinizm, budżety kosztu i latencji, wycieki PII/secretów, anti-unslop.
2. Dla guardrails i prompt injection / jailbreak resistance użyj sekcji guardrails w `llm-testing`; pamiętaj o **authorization gate** przed pracą adversarial: na piśmie potwierdź, że system jest Twój albo masz zgodę właściciela, nazwij środowisko, okno czasowe i osobę do powiadomienia przy findingu. Bez tego — stop.
3. Przed releasem zrób przegląd groundedness (claim-by-claim attribution, weryfikacja cytowań, omission, responsible-AI pass) na próbce outputu i każdy zmyślony lub sprzeczny claim wprowadź do eval suite jako permanentny case regresyjny. Ten feedback loop sprawia, że ludzki review się kumuluje zamiast ulatywać.
4. Skill `testing-agent-skills` pokazuje, jak testować same assety AI (skille, prompty, hooki) jak produkt.

## Czego to za Ciebie nie zrobi

- Nie tuninguje promptów — buduje pomiar; decyzję o zmianie podejmuje właściciel funkcjonalności.
- Nie przetestuje modelu ani infrastruktury osoby trzeciej.
- Nie rozstrzygnie pytań o bias, fairness czy politykę — responsible-AI pass to obserwacja testera, i tak to opisuje.
- Nie udowodni automatyzacją faktograficzności — ta część jest samplowana, ludzka i rejestrowana z ograniczeniami.
