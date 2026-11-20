---
name: contract-testing
description: Load this skill when planning, writing, or reviewing contract tests. Covers Pact consumer-driven contracts (consumer tests, provider verification, Pact Broker), matchers with examples, provider states, and OpenAPI contract validation.
user-invocable: true
---

# Contract Testing

Consumer-driven contracts with Pact, plus contract validation against OpenAPI.

## 🧪 Consumer test (Pact V3 + Playwright runner)

```typescript
import { test, expect } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'web-shop',
  provider: 'orders-api',
});

test('should return order when order exists', async () => {
  await provider
    .given('order 42 exists')                    // provider state
    .uponReceiving('a request for order 42')     // interaction description
    .withRequest({ method: 'GET', path: '/api/orders/42' })
    .willRespondWith({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: MatchersV3.like({ id: 42, status: 'created' }),
    });

  await provider.executeTest(async (mockserver) => {
    const res = await fetch(mockserver.url + '/api/orders/42');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(42);
  });
});
```

## 🎯 Matchers — always with examples

Use matchers only for dynamic values; every matcher needs an `example` so the contract stays meaningful:

| Value | Matcher |
|---|---|
| any value of type | `MatchersV3.like({ id: 42 })` |
| number | `MatchersV3.integer({ example: 42 })` |
| string pattern | `MatchersV3.regex({ generate: 'abc-123', matcher: '^[a-z]+-\\d+$' })` |
| array | `MatchersV3.eachLike({ id: 1 }, { min: 1 })` |
| date-time | `MatchersV3.iso8601DateTime()` |

## 🎭 Provider states

Every interaction declares the state the provider must be in: `.given('user 123 exists')`. The provider implements states in its verification setup (seed data per state).

## 🧪 Provider verification

```typescript
// verify provider against published pacts (CI)
import { Verifier } from '@pact-foundation/pact';

const verifier = new Verifier({
  providerBaseUrl: process.env.PROVIDER_BASE_URL,   // from env, never hardcoded
  pactBrokerUrl: process.env.PACT_BROKER_URL,
  provider: 'orders-api',
  stateHandlers: { 'order 42 exists': async () => seedOrder(42) },
});
await verifier.verifyProvider();
```

## 📦 Publishing pacts

- Consumer CI publishes the pact file to the Pact Broker (`PACT_BROKER_URL` from env) or a shared directory.
- Provider CI runs verification against the latest pact (`--latest` or a tag like `main`).

## 🌍 Environment only

All URLs come from env: `PROVIDER_BASE_URL`, `PACT_BROKER_URL`, `OPENAPI_SPEC`. Never hardcode hosts or tokens.

## 🚫 Negative interactions

Every contract should include error interactions: missing resource → 404, invalid payload → 400, missing auth → 401, each with the expected error body shape.

## 📜 OpenAPI contract validation

Validate request/response against the provider's OpenAPI spec:

```typescript
import { validate } from 'openapi-validator-middleware'; // or spectral / custom ajv
// or: expect(body).toMatchSchema(openapiSpec, '#/components/schemas/Order')
```

Cross-check every Pact interaction with the OpenAPI spec of the provider.
