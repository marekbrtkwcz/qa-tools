# Scenariusz: Checkout na widoku mobilnym (dotyk)

## 1. Nazwa scenariusza
Użytkownik może dokończyć checkout na widoku mobilnym, używając dotyku (tap)

## 2. Warunki wstępne
- Projekt mobilny w playwright.config (`devices['Pixel 7']`: viewport, hasTouch, isMobile)
- Konto testowe i produkt w koszyku (seedowane przez API w `beforeEach`)

## 3. Kroki
1. Użytkownik otwiera `/checkout` na widoku mobilnym
2. Użytkownik dotyka przycisku "Pay" (`touchscreen.tap` lub click)
3. Użytkownik potwierdza zamówienie

## 4. Punkty walidacji
- Po tapie: `await expect(page).toHaveURL(/\/order-confirmation/)`
- Nagłówek potwierdzenia widoczny: `await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()`
- Brak poziomego scrolla przy szerokości 320px: `document.documentElement.scrollWidth <= 320`

## 5. Dane testowe
- Dane konta testowego ze zmiennych środowiskowych; jeden produkt w koszyku

## 6. Poza zakresem
- Stany hover na desktopie (nie istnieją na touch)
- Prawdziwe płatności — mock PSP na środowisku testowym
