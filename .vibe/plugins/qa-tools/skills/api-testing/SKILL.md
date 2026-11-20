---
name: api-testing
description: Load this skill when planning, writing, or reviewing API tests. Covers REST testing with Playwright request, OpenAPI contract validation, negative cases, and auth handling.
user-invocable: true
---

# API Testing

## Playwright API request
Use `request` fixture from `@playwright/test`:

```typescript
test('GET /users returns 200', async ({ request }) => {
  const response = await request.get('/api/users');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});
```

## Always validate three things
1. **Status code** — `expect(response.status()).toBe(200)`
2. **Response body** — structure and key values
3. **Schema** — validate against OpenAPI spec

## Negative test cases
Every endpoint should have negative tests:
- missing/invalid auth token → 401
- insufficient permissions → 403
- non-existent resource → 404
- invalid payload → 400 with error details
- rate limiting → 429

## Auth handling
```typescript
test.describe('Authenticated endpoints', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'test@example.com', password: 'secret' }
    });
    token = (await res.json()).token;
  });

  test('GET /profile with token', async ({ request }) => {
    const res = await request.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status()).toBe(200);
  });
});
```

## Base URL from environment
Never hardcode URLs — use env vars:
```typescript
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const response = await request.get(`${BASE_URL}/api/users`);
```

## Cleanup
Tests that create resources must clean up:
```typescript
test.afterEach(async ({ request }) => {
  await request.delete(`/api/test-data/${createdId}`);
});
```
