# 🔒 Plan weryfikacji bezpieczeństwa: <NAZWA APLIKACJI / OBSZARU>

<!-- Szablon planu — kopiuj do docs/scenarios/security/NN-<obszar>.md (NN = kolejny numer).
     Wypełnia go security-test-planner na podstawie rozmowy z użytkownikiem; writer implementuje wyłącznie ten plan. -->

## 📋 Metadane

| Pole | Wartość |
|---|---|
| Autor planu | <kto> |
| Data | <RRRR-MM-DD> |
| Cel (target) | `<BASE_URL / API_URL>` (środowisko **testowe**) |
| Autoryzacja | <pisemna zgoda na testy / własne środowisko> |
| Warstwa | API / UI / obie |
| Baza | OpenAPI: `docs/openapi/openapi.json` |

## ⚔️ Rules of engagement

- Verification only — **bez destrukcyjnych payloadów i DoS**
- Tylko konta testowe z `.env` (singleton `env.TEST_*`) — nigdy realne dane
- Payloady wyłącznie kanarkowe (`shared/security-payloads.ts` → `src/data/security-payloads.ts`)
- Zakaz zapisu/edycji produkcyjnych danych; każdy test czyszczący dane piszę jako API-cleanup

## 🎯 Zakres (scope)

- [ ] Endpointy / widoki w zakresie: `<lista>`
- [ ] Poza zakresem: `<lista lub brak>`

## 🛡️ Klasy OWASP do pokrycia

| # | Klasa | Scenariusz | Warstwa | Oczekiwane zachowanie bezpieczne |
|---|---|---|---|---|
| A01 | Broken Access Control | IDOR: user czyta zasób usera B | API | 401/403/404, brak treści zasobu |
| A02 | Cryptographic Failures | wyciek danych w odpowiedzi (PESEL, karta, token) | API | `scanForLeaks()` = brak trafień |
| A03 | Injection | SQLi/XSS kanarki w parametrach | API+UI | brak SQL error, encja zamiast raw payloadu |
| A04 | Insecure Design | mass assignment (`role`, `isAdmin`) | API | pole ignorowane w odpowiedzi |
| A07 | Auth Failures | brak/nieprawidłowy token | API | 401, nie 200/redirect do treści |
| A05 | Security Misconfiguration | nagłówki na głównej odpowiedzi | API+UI | `EXPECTED_SECURITY_HEADERS` obecne |

<!-- Dopisz/usuń wiersze wg targetu — minimum: injection, broken access control, auth, wyciek danych, nagłówki. -->

## 🧪 Scenariusze testowe

| ID | Scenariusz | Plik spec | Status |
|---|---|---|---|
| SEC-001 | <opis> | `tests/api/security/<nazwa>.spec.ts` | ⬜ do napisania |
| SEC-002 | <opis> | `tests/ui/security/<nazwa>.spec.ts` | ⬜ do napisania |

## 🚨 Rejestr findings

<!-- Test, który FAILED z powodu braku zabezpieczenia = finding (NIE „naprawiamy" testu pod aplikację). -->

| ID | Finding | Severity | Raport |
|---|---|---|---|
| F-001 | <opis zachowania niebezpiecznego + endpoint> | High/Med/Low | <link/raport> |
