# 🗂️ Scenariusz UI: Logowanie użytkownika

## 🎯 Cel
Sprawdzenie, że użytkownik może zalogować się poprawnymi danymi i że błędne dane wyświetlają komunikat.

## 🧪 Kroki

1. Wejdź na `/login`
2. Wpisz poprawny e-mail i hasło
3. Kliknij „Zaloguj"
4. Sprawdź przekierowanie na dashboard

## 🚫 Przypadek negatywny

1. Wejdź na `/login`
2. Wpisz błędne hasło
3. Kliknij „Zaloguj"
4. Sprawdź widoczność komunikatu o błędzie

## 🧵 Wymagane komponenty
- `LoginPage` (src/ui/pages/login.page.ts)

## 📌 Notatki
- Lokatory: getByLabel dla pól, getByRole dla przycisku
- Brak waitForTimeout — używamy expect().toBeVisible()
