---
name: api-request-response-logging
description: "Adds request/response logging to Playwright API tests via a custom `request` fixture wrapping APIRequestContext in a transparent Proxy: zero dependencies (raw ANSI colors, no chalk), env-gated (LOGGER=true), automatic redaction of Authorization/Cookie/API-key headers so secrets never reach CI logs, plus an attach-on-failure variant for CI artifacts instead of console noise. Use when API tests are hard to debug locally, CI failures lack request/response evidence, or you want readable API traffic in test output without plugins."
argument-hint: "Whether logging is for local debugging, CI artifacts on failure, or both"
user-invocable: true
---

# API Request/Response Logging in Playwright

Playwright's built-in `request` fixture makes raw API calls in tests. This skill shows how to wrap it so every call is logged — for local debugging — and how to attach the evidence to the test report on failure, which is what CI actually needs. The pattern comes from the pwapi-logger project, cleaned up: no `chalk`, no `any`, strict-TS-safe, secrets redacted.

## When to Use

- debugging API tests locally: "what exactly was sent and what came back?"
- CI failures where the trace viewer is not enough and you want request/response attached to the report
- demo/recording of API traffic in test output (with redaction)
- NOT for: permanent console logging in CI (noise + leak risk) — use attach-on-failure there

## The pattern

Override the `request` fixture in `src/fixtures/test.ts` (or `tests/fixtures.ts`):

```ts
import { test as base, expect, type APIRequestContext, type APIResponse } from '@playwright/test';

const LOGGER = process.env.LOGGER === 'true';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'fetch';
const HTTP_METHODS: readonly HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'];

const REDACTED = '[REDACTED]';
const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization']);

function redact(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, SENSITIVE_HEADERS.has(k.toLowerCase()) ? REDACTED : v]),
  );
}

function wrapRequest(ctx: APIRequestContext): APIRequestContext {
  return new Proxy(ctx, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string' && (HTTP_METHODS as readonly string[]).includes(prop)) {
        const method = prop as HttpMethod;
        return async (url: string | URL, options?: Parameters<APIRequestContext[HttpMethod]>[1]) => {
          const t0 = Date.now();
          const call = target[method] as (u: string | URL, o?: unknown) => Promise<APIResponse>;
          const response: APIResponse = await call(url, options);
          if (LOGGER) {
            logCall(method, response.url(), options, response, Date.now() - t0);
          }
          return response;
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export const test = base.extend<{ request: APIRequestContext }>({
  request: async ({ request }, use) => {
    await use(wrapRequest(request));
  },
});

export { expect };
```

`logCall` prints method + URL, redacted request headers/payload, then status + elapsed ms + redacted response headers + pretty-printed JSON body (guarded try/catch for non-JSON). Full ready-to-paste implementation with ANSI colors: `./resources/api-logger-fixture.md`.

## CI variant: attach on failure, not console

In CI, console logging is noise; attach the exchange to the test artifact only when the test fails:

```ts
test.afterEach(async ({ request }, testInfo) => {
  if (testInfo.status !== 'failed') return;
  // exchange log collected per test via a test-scoped buffer in the fixture
  await testInfo.attach('api-traffic.log', { body: getTrafficLog(), contentType: 'text/plain' });
});
```

Rules: buffer per test (clear in `beforeEach`), redact before attaching, keep bodies truncated (e.g. first 4 KB) so artifacts stay small. Playwright's own trace already records API responses — this logger is for readable, greppable text (`test-reports-and-artifacts` covers trace/video/screenshot retention).

## Rules

- **Always redact** `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`, and any header matching your secret naming — before printing AND before attaching. Default-deny: redact unknown `*-key`/`*token*` headers too.
- **Env-gated**: `LOGGER=true` locally; off by default in CI. Never commit a `.env` with real values (`.env` in `.gitignore`).
- **Zero-dep colors**: raw ANSI escapes (`\x1b[36m` etc.), not `chalk` — keeps Biome strict happy and avoids a CJS-only dependency.
- **Proxy must be transparent**: non-method properties (e.g. `storageState`, `dispose`) must pass through bound to the target — a broken Proxy breaks every API test in subtle ways.
- **Body reading is safe**: `response.json()`/`text()` cache the body in Playwright; logging does not consume it for the test.
- **Performance**: skip logging entirely when the flag is off (check before doing any formatting work).

## Red Flags

- logging headers without redaction into CI artifacts — secret leak (`handling-sensitive-test-data`)
- `chalk`/other color lib added just for this — one less dep, Biome-cleaner without it
- Proxy that forgets to bind non-method functions — `request.storageState()` etc. break
- permanent `console.log` of full payloads in CI — log size and PII risk; attach-on-failure instead
- asserting on log output — the logger is observability, not a test oracle; assert on responses

## Related Skills

- `api-playwright-test-developer` - the request fixture and API test structure this extends
- `test-reports-and-artifacts` - traces, attachments, CI artifact retention (the CI-side home of this evidence)
- `diagnosing-test-failures` - when an API test fails and you need the exact exchange
- `debugging-with-chrome-devtools-mcp` - the browser-side equivalent for UI-driven network traffic
- `handling-sensitive-test-data` - redaction rules and secrets hygiene
- `mocking-network-and-time` - when instead of logging you should stub the API entirely

## Definition of Done

- `request` fixture is wrapped once in a shared fixtures file; all API tests log through it with zero changes to test bodies
- sensitive headers are redacted in both console and attached output
- logging is off by default, enabled via env flag; CI uses attach-on-failure, not console
- the fixture file passes `tsc --noEmit` (strict) and `biome ci` with no suppressions
- one real API test was debugged locally using the logger and the output shown
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
