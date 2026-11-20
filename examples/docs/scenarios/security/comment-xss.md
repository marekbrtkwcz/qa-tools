# Scenariusz: XSS w polu komentarza

## 1. Nazwa scenariusza
Komentarz z payloadem XSS jest wyświetlany jako tekst, nie wykonywany (OWASP A03 Injection)

## 2. Warunki wstępne
- Użytkownik testowy zalogowany (sesja z `beforeEach`)
- Strona z formularzem komentarza: `/comments`

## 3. Kroki
1. Użytkownik wpisuje w polu "Komentarz" payload `<script>alert(1)</script>`
2. Użytkownik klika przycisk "Dodaj komentarz"
3. Strona przeładowuje listę komentarzy

## 4. Punkty walidacji
- Skomentowany tekst jest widoczny jako zwykły tekst (enkodowany): `await expect(page.getByText('<script>alert(1)</script>')).toBeVisible()`
- Żaden dialog `alert` nie został wywołany (listener `page.on('dialog')` z flagą — brak zdarzenia)

## 5. Dane testowe
- Payload (fikcyjny, bezpieczny): `<script>alert(1)</script>`

## 6. Poza zakresem
- SQL injection, CSRF, IDOR (osobne scenariusze)
- Prawdziwe dane użytkowników — nigdy w payloadach
