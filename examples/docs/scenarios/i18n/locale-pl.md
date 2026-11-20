# Scenariusz: Strona zamówienia po polsku (pl-PL)

## 1. Nazwa scenariusza
Ekran zamówienia wyświetla polskie teksty i format daty dd.mm.rrrr dla locale pl-PL

## 2. Warunki wstępne
- Aplikacja dostępna pod adresem z konfiguracji (env)
- Przełącznik języka ustawiony na „Polski" (lub URL `/pl/...`)

## 3. Kroki
1. Użytkownik otwiera `/pl/orders/123`
2. Użytkownik widzi nagłówek i datę zamówienia

## 4. Punkty walidacji
- `document.documentElement.lang` = `pl`
- Nagłówek po polsku: `await expect(page.getByRole('heading', { name: 'Zamówienie' })).toBeVisible()`
- Data w formacie pl-PL: `await expect(page.getByTestId('order-date')).toHaveText('20.11.2026')`

## 5. Dane testowe
- Zamówienie `123` z datą 2026-11-20 (seed testowy)

## 6. Poza zakresem
- Inne języki (osobne scenariusze per locale), RTL (osobny scenariusz), formaty walut
