import { expect, test } from '@playwright/test';

// Przykład referencyjny konwencji qa-tools dla testów API:
// - nazwa testu: should <rezultat> when <warunek>
// - trzy asercje na odpowiedź: status, konkretne pola body, (opcjonalnie) schemat OpenAPI
// - baseURL tylko z konfiguracji/env (playwright.config), token z zmiennej środowiskowej
// - przypadki negatywne w tym samym pliku; sprzątanie zasobów w afterEach

test.describe('Users API', () => {
  test('should return user list when token is valid', async ({ request }) => {
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN ?? ''}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('email');
  });

  test('should return 401 when token is missing', async ({ request }) => {
    const res = await request.get('/api/users');

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});
