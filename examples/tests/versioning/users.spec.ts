import { expect, test } from '@playwright/test';

// Przykład referencyjny testu wersjonowania API:
// - nazwa: should <rezultat> when <warunek>
// - nagłówek wersji jawnie per request (Accept-Version), token z env
// - trzy asercje: status, pola core zgodne między wersjami, nagłówki deprecation

test.describe('Users API — v1 vs v2', () => {
  const auth = { Authorization: `Bearer ${process.env.API_TOKEN ?? ''}` };

  test('should return same core fields when requesting v1 and v2', async ({ request }) => {
    const v1 = await request.get('/api/users/1', { headers: { ...auth, 'Accept-Version': 'v1' } });
    const v2 = await request.get('/api/users/1', { headers: { ...auth, 'Accept-Version': 'v2' } });

    expect(v1.status()).toBe(200);
    expect(v2.status()).toBe(200);
    const b1 = await v1.json();
    const b2 = await v2.json();
    expect(b1.id).toBe(b2.id);
    expect(b1.email).toBe(b2.email);
  });

  test('should include Deprecation header when v1 is requested', async ({ request }) => {
    const res = await request.get('/api/users/1', { headers: { ...auth, 'Accept-Version': 'v1' } });

    expect(res.status()).toBe(200);
    expect(res.headers()['deprecation']).toBe('true');
    expect(res.headers()['sunset']).toBeTruthy();
  });
});
