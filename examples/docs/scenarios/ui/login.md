# Scenariusz: Logowanie użytkownika

## 1. Nazwa scenariusza
Logowanie poprawnymi danymi przekierowuje na dashboard

## 2. Warunki wstępne
- Czysty stan początkowy: wylogowana sesja, puste pola formularza
- Dostępne konto testowe (patrz sekcja 5)
- Aplikacja dostępna pod adresem bazowym z konfiguracji (env), strona startowa: `/login`

## 3. Kroki
1. Użytkownik otwiera stronę `/login`
2. Użytkownik wpisuje adres e-mail konta testowego w polu "Email"
3. Użytkownik wpisuje hasło konta testowego w polu "Hasło"
4. Użytkownik klika przycisk "Zaloguj się"

## 4. Punkty walidacji
- Po kroku 4: URL zmienia się na `/dashboard` → asercja: `await expect(page).toHaveURL('/dashboard')`
- Po kroku 4: widoczny nagłówek "Dashboard" → asercja: `await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()`

## 5. Dane testowe
- Email: `test.user@example.com`
- Hasło: pobierane ze zmiennej środowiskowej `TEST_USER_PASSWORD` (nigdy hardkod w teście)

## 6. Poza zakresem
- Logowanie błędnymi danymi (osobny scenariusz)
- Reset hasła, logowanie przez SSO
- Walidacja pustych pól formularza
