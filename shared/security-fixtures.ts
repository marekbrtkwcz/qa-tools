// 🔒 Kanoniczne fixtures roli (user/admin) do testów bezpieczeństwa — kopiuj do projektu jako src/fixtures/auth.fixture.ts.
// Konta testowe TYLKO ze zmiennych env (singleton src/config/env.ts, konto ze środowiska testowego).
// Dostosuj ciało login*() do realnej aplikacji (endpoint / format tokenu / Set-Cookie) — to szablon.

import { request as playwrightRequest, expect } from '@playwright/test';
import { env } from '../config/env.js';

// ── Adapter logowania — JEDYNE miejsce do dostosowania per aplikacja ──

type AuthTokens = { token: string; cookies?: Record<string, string> };

/** Logowanie kontem testowym; zwraca token (Bearer) i/lub cookies sesyjne. Dostosuj endpoint + parsing. */
async function login(email: string, password: string): Promise<AuthTokens> {
  const api = await playwrightRequest.newContext({ baseURL: env.API_URL ?? env.BASE_URL });
  try {
    const response = await api.post('/auth/login', {
      data: { email, password },
    });
    expect(response.status(), `login ${email} powinien działać (konto testowe)`).toBeLessThan(400);
    const body = (await response.json()) as { token?: string; access_token?: string };
    const token = body.token ?? body.access_token;
    if (!token) throw new Error('Szablon: dostosuj parsing tokenu w src/fixtures/auth.fixture.ts');
    return { token };
  } finally {
    await api.dispose();
  }
}

// ── Fabryki kontekstów per rola (API request z auth) ──

function requireCreds(email: string | undefined, password: string | undefined, role: string): { email: string; password: string } {
  if (!email || !password) {
    throw new Error(
      `Brak konta testowego roli ${role}: uzupełnij TEST_${role.toUpperCase()}_EMAIL / TEST_${role.toUpperCase()}_PASSWORD w .env (tylko środowisko testowe)`,
    );
  }
  return { email, password };
}

/** Request context zalogowany jako zwykły USER (Bearer). Pamiętaj o dispose() w afterAll/teardown. */
export async function userRequest() {
  const creds = requireCreds(env.TEST_USER_EMAIL, env.TEST_USER_PASSWORD, 'USER');
  const { token } = await login(creds.email, creds.password);
  return playwrightRequest.newContext({
    baseURL: env.API_URL ?? env.BASE_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}

/** Request context zalogowany jako ADMIN (do testów privilege escalation / IDOR „z góry"). */
export async function adminRequest() {
  const creds = requireCreds(env.TEST_ADMIN_EMAIL, env.TEST_ADMIN_PASSWORD, 'ADMIN');
  const { token } = await login(creds.email, creds.password);
  return playwrightRequest.newContext({
    baseURL: env.API_URL ?? env.BASE_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}

/** Request context BEZ auth — do asercji 401 (auth missing). */
export async function anonymousRequest() {
  return playwrightRequest.newContext({ baseURL: env.API_URL ?? env.BASE_URL });
}

// ── Gotowe asercje bezpiecznego zachowania (używaj w specach) ──

/** Getting obcego zasobu jako user powinien odrzucić: 401/403/404 — nigdy 200 z treścią. */
export async function expectNoIdorLeak(response: { status(): number; text(): Promise<string> }, ownerHint: string): Promise<void> {
  const status = response.status();
  expect(status, `IDOR: user widzi zasób ${ownerHint} (${status})`).toBeGreaterThanOrEqual(400);
  const body = await response.text();
  expect(body, `IDOR: treść zasobu ${ownerHint} nie może wyciekać`).not.toContain(ownerHint);
}

/** Odpowiedź bez/nieprawidłowym auth: 401 (lub 403), nie 2xx/3xx do treści. */
export async function expectUnauthorized(response: { status(): number }): Promise<void> {
  expect(response.status(), 'brak auth powinien dawać 401/403').toBeGreaterThanOrEqual(401);
}
