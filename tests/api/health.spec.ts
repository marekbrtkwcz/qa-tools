import { expect, test } from '@playwright/test';
import { z } from 'zod';

// Referencyjny smoke test API (Playwright request). Domyślnie używa
// publicznego httpbin.org, żeby przechodził w CI bez własnego backendu;
// przeciwko własnej aplikacji ustaw API_URL (np. http://localhost:8080).
// Konwencje: nazwa should <rezultat> when <warunek>, tylko expect(), tag @smoke.

// Schemat kontraktu odpowiedzi — zod waliduje całe body jednym parse().
const GetResponseSchema = z.object({
  args: z.record(z.string(), z.string()),
  headers: z.record(z.string(), z.string()),
  origin: z.string(),
  url: z.string().url(),
});

test.describe('Smoke API', () => {
  test('@smoke @regression should return 200 when status endpoint is reachable', async ({ request }) => {
    const baseURL = process.env.API_URL ?? 'https://httpbin.org';
    const response = await request.get(`${baseURL}/status/200`);
    expect(response.status()).toBe(200);
  });

  test('@smoke @regression should match body to zod schema when endpoint returns JSON', async ({ request }) => {
    const baseURL = process.env.API_URL ?? 'https://httpbin.org';
    const response = await request.get(`${baseURL}/get?source=qa-tools`);
    expect(response.status()).toBe(200);

    const body = GetResponseSchema.parse(await response.json());
    expect(body.args['source']).toBe('qa-tools');
    expect(body.url).toContain('source=qa-tools');
  });
});
