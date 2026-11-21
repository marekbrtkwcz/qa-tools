---
name: versioning-testing
description: 'Load this skill when testing API versioning: backward compatibility between versions (v1 vs v2), Accept-Version / media-type version headers, Deprecation and Sunset response headers, 410 Gone for removed endpoints, and default-version behavior. Uses the Playwright request fixture against baseURL from config.'
user-invocable: true
---

# 🔢 API Versioning Testing

Versioning bugs are silent: old clients keep working until the day the old version is switched off. Test the **contract per version**, the **deprecation signals**, and the **removal** — not just the latest version.

## 🎯 When to Use

- the API is versioned via header (`Accept-Version`, `Accept: application/vnd.api+json;version=2`) or URL (`/v2/...`)
- a new version is being introduced and v1 must keep working
- a version is being deprecated (Deprecation / Sunset headers) or removed (410 Gone)
- agents: `qa-tools:versioning-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## ✅ What to Assert

```typescript
const baseURL = process.env.BASE_URL; // only from env/config, never hardcoded

test('should return v1 shape when Accept-Version is 1', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/users/123`, {
    headers: { 'Accept-Version': '1' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('name');        // v1 field
  expect(body).not.toHaveProperty('fullName'); // v2-only field absent
});

test('should return v2 shape when Accept-Version is 2', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/users/123`, {
    headers: { 'Accept-Version': '2' },
  });
  expect(await res.json()).toMatchObject({ fullName: expect.any(String) });
});

test('should send Deprecation header on v1 responses', async ({ request }) => {
  const res = await request.get(`${baseURL}/api/users`, { headers: { 'Accept-Version': '1' } });
  expect(res.headers()['deprecation']).toBe('true');
  expect(res.headers()['sunset']).toBeDefined();
});

test('should return 410 Gone when v0 endpoint is called', async ({ request }) => {
  const res = await request.get(`${baseURL}/v0/api/users`);
  expect(res.status()).toBe(410);
});
```

## 📋 Checklist per Version Pair

- **Backward compatibility**: same request on v1 and v2 — assert which fields exist, which changed, which were removed; removed fields in a *minor* version are a breaking change.
- **Default version**: request with no version header — assert which version answers (and that it is documented).
- **Unknown version**: `Accept-Version: 99` — assert a clear 400/406, not a silent v1.
- **Deprecation signals**: `Deprecation: true` (+ version/date), `Sunset` date, `Link: <...>; rel="deprecation"` — assert they are present on the old version and absent on the new.
- **Removal**: after Sunset passes, the old version returns **410 Gone** with an error body pointing at the new version.
- **No cross-version leakage**: v2 response must not contain v1-only fields and vice versa.

## ❌ Common Pitfalls

- Testing only the newest version — old clients are the ones that break in production.
- Hardcoded URLs — `baseURL` only from `process.env.BASE_URL` / config.
- Asserting `res.ok()` instead of the exact version-specific shape.
- Forgetting the version header on the `request` fixture defaults to the server default — be explicit about which version each test targets.

## 🧹 Conventions

- API tests use the `request` fixture; assertions via `expect(res.status()).toBe(...)` and body matchers; test names `should <result> when <condition>`.
