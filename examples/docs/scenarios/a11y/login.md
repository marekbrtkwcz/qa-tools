# Scenariusz: Dostępność ekranu logowania (a11y)

## 1. Nazwa scenariusza
Ekran logowania nie ma krytycznych naruszeń WCAG i obsługuje pełną nawigację klawiaturą

## 2. Warunki wstępne
- Aplikacja dostępna pod adresem z konfiguracji (env), ekran `/login`
- axe-core zainstalowane (`@axe-core/playwright`)

## 3. Kroki
1. Użytkownik otwiera `/login`
2. Skan axe-core ekranu
3. Użytkownik nawiguje klawiaturą: Tab z pola Email → Hasło → przycisk "Zaloguj się"

## 4. Punkty walidacji
- Skan axe: zero naruszeń o impact `critical` lub `serious`
- Po dwóch Tabach fokus jest na przycisku: `await expect(page.getByRole('button', { name: 'Log in' })).toBeFocused()`
- Pola formularza mają etykiety (axe: `label` rule)

## 5. Dane testowe
- brak (sam ekran)

## 6. Poza zakresem
- Pełny audyt WCAG wszystkich ekranów
- Testy czytnika ekranu (osobny audyt)
