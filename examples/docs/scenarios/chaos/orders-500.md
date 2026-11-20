# Scenariusz: API zamówień zwraca 500 (chaos / fault injection)

## 1. Nazwa scenariusza
Strona zamówień pokazuje komunikat błędu i zostaje użyteczna, gdy API zamówień zwraca 500

## 2. Warunki wstępne
- Aplikacja dostępna pod adresem z konfiguracji (env), konto testowe zalogowane w `beforeEach`
- Dostępna interceptacja requestów Playwright (`page.route`)

## 3. Kroki
1. Test wstrzykuje fault PRZED nawigacją: `page.route('**/api/orders', route => route.fulfill({ status: 500 }))`
2. Użytkownik otwiera `/orders`

## 4. Punkty walidacji
- Baner błędu widoczny z dokładnym tekstem: `await expect(page.getByRole('alert')).toHaveText('Could not load orders')`
- Strona się nie wysypała — nagłówek nadal widoczny: `await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()`
- Fault jest sprzątany w `afterEach` (`page.unroute`) — brak przecieków między testami

## 5. Dane testowe
- brak (sam fault)

## 6. Poza zakresem
- Opóźnienie odpowiedzi, zerwanie połączenia, częściowe odpowiedzi (osobne scenariusze)
- Prawdziwe destrukcyjne akcje — faulty tylko na środowisku testowym
