---
name: graphql-testing
description: 'Load this skill when testing GraphQL APIs with the Playwright request fixture: POST queries/mutations with variables, asserting the data field and the errors array, auth headers, negative cases (validation errors, unauthorized, malformed query), and avoiding string-interpolated variables (injection).'
user-invocable: true
---

# 🔮 GraphQL API Testing

GraphQL returns **200 with an `errors` array** even when the operation failed — asserting only the status code is the classic false-green. Always assert `data` (shape + values) and `errors` separately.

## 🎯 When to Use

- the API exposes a `/graphql` endpoint (queries, mutations, subscriptions over HTTP)
- you need contract-level assertions on response shape per operation
- agents: `qa-tools:graphql-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## ✅ Request Shape

```typescript
const GRAPHQL_URL = process.env.GRAPHQL_URL ?? `${process.env.BASE_URL}/graphql`; // only from env

test('should return order with items when querying by id', async ({ request }) => {
  const res = await request.post(GRAPHQL_URL, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    data: {
      query: `query GetOrder($id: ID!) {
        order(id: $id) { id status items { name qty } }
      }`,
      variables: { id: '123' },
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.errors).toBeUndefined();                       // no GraphQL errors
  expect(body.data.order.status).toBe('shipped');
  expect(body.data.order.items).toHaveLength(2);
});
```

## 📋 What to Assert

| Aspect | Assertion |
|---|---|
| Transport | `expect(res.status()).toBe(200)` (or 400/401 for malformed/unauthorized) |
| Success | `body.errors` is undefined; `body.data.<field>` has exact values / shape |
| Partial errors | `body.errors[0].message` + `body.data.<field>` is `null` with `path` |
| Validation error | status 400 (or 200 + errors, per server) with `errors[0].extensions.code` |
| Auth | 401/403 or `errors` with `UNAUTHENTICATED` — never a silent empty `data` |
| Mutation side effect | query the entity back and assert persisted state; clean it up in `afterEach` |

## ❌ Common Pitfalls

- **String-interpolated variables** — `query: '{ order(id: "' + id + '") }'` is injection-prone and breaks on quotes. ✅ Always use `variables`.
- Asserting only `res.ok()` — a GraphQL error still returns 200.
- Forgetting `errors` — check it explicitly on every success case.
- Hardcoded URL/token — `GRAPHQL_URL` / `BASE_URL` / `API_TOKEN` only from env.
- No negative cases — malformed query, unknown field, wrong variable type, missing auth.
- Introspection left enabled in production — assert it is disabled (or document the decision).

## 🧪 Negative Examples

```typescript
test('should return validation error when required variable is missing', async ({ request }) => {
  const res = await request.post(GRAPHQL_URL, {
    data: { query: 'query GetOrder($id: ID!) { order(id: $id) { id } }', variables: {} },
  });
  const body = await res.json();
  expect(body.errors[0].message).toContain('id');
});
```

## 🧹 Conventions

- `request` fixture; test names `should <result> when <condition>`; no `waitForTimeout`; mutations cleaned up in `afterEach`.
