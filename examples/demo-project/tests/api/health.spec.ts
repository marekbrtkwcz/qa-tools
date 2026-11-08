import { expect, test } from '@fixtures/test.fixture';

test.describe('Health check API', () => {
  test('GET /health zwraca 200 i status ok', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });
});
