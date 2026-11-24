# API Test Architecture Blueprint

Read when the project lacks the layered API test architecture or a layer is missing. This is the target structure that `refactoring-api-tests` introduces.

## 3-Layer Request System

```
Layer 1: APIRequest            — generic HTTP methods wrapping APIRequestContext
Layer 2: <Resource>APIRequest  — resource endpoints, uses APIRequest + endpoint constants
Layer 3: <Resource>APISteps    — validates status, parses typed responses, returns typed objects
```

All layers are injected into tests via Playwright fixtures. Tests never instantiate classes directly.

### Layer 1 — generic client
`src/api/requests/api.request.ts` — `get / post / put / delete / patch / head` returning `Promise<APIResponse>`.

### Layer 2 — resource requests
`src/api/requests/<resource>/<resource>.api.request.ts` — class `<Resource>APIRequest` with one method per endpoint, using `API_ENDPOINTS` constants. Never hardcode paths here.

### Layer 3 — steps
`src/api/steps/<resource>/<resource>.api.steps.ts` — class `<Resource>APISteps`. Each method asserts the expected status via constants and returns `parseResponse<T>(response)`. Used in tests for setup, cleanup, and reusable operations. Add new methods to the existing class instead of creating new files.

### Fixtures
`src/fixtures/api.fixture.ts` — one fixture per layer, built with `base.extend`. Merge everything in `src/fixtures/test.fixture.ts`; tests import `test` and `expect` from there. When a new resource appears, wire its request + steps into the fixture.

### Which fixture when

| Need | Use |
|---|---|
| Create/delete for setup & cleanup | `<resource>ApiSteps` |
| Read with validated status + typed body | `<resource>ApiSteps` |
| Raw `APIResponse` (headers, non-standard status) | `<resource>ApiRequest` (+ `parseResponse<T>`) |
| Parallel calls | `<resource>ApiRequest` + `Promise.all` |

Default to steps; fall back to the request class only for raw responses.

## Constants

- `http.status.codes.const.ts` — `HTTP_200_OK`, `HTTP_201_CREATED`, `HTTP_204_NO_CONTENT`, `HTTP_400_BAD_REQUEST`, `HTTP_404_NOT_FOUND`, … Never raw numbers in assertions.
- `api.endpoints.const.ts` — `API_ENDPOINTS.<resource> = { base: '/<resource>', byId: (id) => ... }`. Used only inside Layer 2, never in specs.
- Base URL lives in `.env` (`BASE_URL=...`) and is consumed via `use.baseURL` in `playwright.config.ts`. Never define URL constants in spec files.

## Models

`src/api/models/<resource>.model.ts` — `<Resource>Payload` and `<Resource>Response` interfaces. Every Payload/Response interface ends with `[key: string]: unknown;` — mandatory, even for small interfaces.

## Factories

`src/api/factories/<resource>.factory.ts` — Faker-based. **Exactly two functions per file:**

- `getRandom<Resource>Payload()` — fully random valid payload
- `getRandom<Resource>OverridePayload(overrides)` — base + overrides for controlled fields

Never add more factory functions; use overrides for special values. Factories are used in steps (setup/cleanup) and in specs — never inline payload objects.

## Utils

- `parse.response.utils.ts` — `async function parseResponse<T>(response): Promise<T>`
- `random.data.utils.ts` — Faker-only random data helpers (strip apostrophes from names)

## Cleanup

- Per-test resources → `afterEach` deleting via `<resource>ApiSteps.delete(id)`
- `beforeAll` seeds → collect ids, delete all in `afterAll`

## Datasets

Similar scenarios collapse into an array + `forEach`, e.g. invalid ids `['abc', '1.5', '9223372036854775808']` each generating a `should return 400 for ...` test.

## Tags & naming

- Every `describe` has tags; `@api` is always required so `--grep @api` isolates API tests from UI ones
- Defaults: `['@api', '@<resource>', '@smoke']` positive/schema, `['@api', '@<resource>', '@regression']` negative, `['@api', '@<resource>', '@schema', '@smoke']` schema-only
- `describe` names include method, endpoint, and response group: `GET /books/{id} 4xx`
- Test names start with `should`

## Folder structure

```text
src/
├── api/
│   ├── consts/          api.endpoints.const.ts, http.status.codes.const.ts
│   ├── factories/       <resource>.factory.ts
│   ├── models/          <resource>.model.ts
│   ├── requests/        api.request.ts, <resource>/<resource>.api.request.ts
│   └── steps/           <resource>/<resource>.api.steps.ts
├── fixtures/            api.fixture.ts, test.fixture.ts
└── utils/               parse.response.utils.ts, random.data.utils.ts

tests/api/<resource>/    <resource>-<method>-{schema,positive,negative}.spec.ts
```

## Forbidden patterns (checklist)

- ❌ raw `request` fixture in specs
- ❌ hardcoded URLs or URL constants in spec files
- ❌ untyped `response.json()` — use `parseResponse<T>`
- ❌ raw status numbers
- ❌ missing `@api` tag
- ❌ inline payload objects — use factories
- ❌ extra factory functions — use overrides
- ❌ `any` types
- ❌ created resources without cleanup
