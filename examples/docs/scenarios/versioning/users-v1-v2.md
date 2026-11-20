# Scenariusz: Kompatybilność API users v1 vs v2

## 1. Nazwa scenariusza
Endpoint users zwraca te same pola core w v1 i v2, a v1 ma nagłówek Deprecation

## 2. Warunki wstępne
- API dostępne pod adresem z env (`BASE_URL`); token w `API_TOKEN`
- Wersjonowanie przez nagłówek `Accept-Version`

## 3. Kroki
1. Test wysyła `GET /api/users/1` z `Accept-Version: v1`
2. Test wysyła `GET /api/users/1` z `Accept-Version: v2`

## 4. Punkty walidacji
- Oba statusy = 200
- Pola core identyczne: `expect(b1.id).toBe(b2.id)`, `expect(b1.email).toBe(b2.email)`
- v1 ma nagłówki: `deprecation: true` i `sunset` (data)

## 5. Dane testowe
- Użytkownik `1` (seed testowy), token z env

## 6. Poza zakresem
- 410 Gone po sunsecie (osobny scenariusz), path versioning (`/v1/...`), pełna macierz wersji
