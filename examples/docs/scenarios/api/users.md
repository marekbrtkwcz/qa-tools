# Scenariusz: Pobieranie listy użytkowników (API)

## 1. Nazwa scenariusza
Endpoint GET /api/users zwraca listę użytkowników z poprawnym tokenem

## 2. Warunki wstępne
- API dostępne pod adresem bazowym z konfiguracji (`BASE_URL` w env, ustawiany przez playwright.config)
- Ważny token testowy w zmiennej środowiskowej `API_TOKEN` (nigdy hardkod w teście)
- W bazie istnieje co najmniej jeden użytkownik testowy

## 3. Kroki
1. Test wysyła `GET /api/users` z nagłówkiem `Authorization: Bearer <API_TOKEN>`
2. Test odbiera odpowiedź i parsuje body JSON

## 4. Punkty walidacji
- Status odpowiedzi = 200 → `expect(res.status()).toBe(200)`
- Body jest tablicą, a każdy element ma pola `id`, `email` → `expect(Array.isArray(body)).toBe(true)`, `expect(body[0].email).toContain('@')`
- Przypadek negatywny: `GET /api/users` bez tokena zwraca 401 → osobny test

## 5. Dane testowe
- Token: zmienna środowiskowa `API_TOKEN`
- Ścieżka: `/api/users`

## 6. Poza zakresem
- Paginacja i filtrowanie listy (osobny scenariusz)
- Tworzenie/usuwanie użytkowników
- Walidacja schematu OpenAPI (osobny scenariusz, specyfikacja w `OPENAPI_SPEC`)
