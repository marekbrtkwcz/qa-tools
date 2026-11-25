# Ready-to-paste API logger fixture (Biome + strict TS clean, zero-dep ANSI)

Save as `tests/fixtures.ts` (or `src/fixtures/test.ts`), then import `test`/`expect` from it in API specs instead of from `@playwright/test`.

```ts
/* API request/response logger: env-gated (LOGGER=true), secrets redacted, zero dependencies. */
import { test as base, expect, type APIRequestContext, type APIResponse } from '@playwright/test';

const LOGGER = process.env.LOGGER === 'true';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'fetch';
const HTTP_METHODS: readonly string[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'];

const SENSITIVE = /authorization|cookie|api[-_]key|token|secret/i;
const REDACTED = '[REDACTED]';

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
};

function redactRecord(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, SENSITIVE.test(k) ? REDACTED : v]));
}

function redactData(data: unknown): unknown {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE.test(k) ? REDACTED : v]),
    );
  }
  return data;
}

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2).slice(0, 4000);
  } catch {
    return String(value);
  }
}

function logCall(
  method: string,
  url: string,
  options: Record<string, unknown> | undefined,
  response: APIResponse,
  elapsedMs: number,
): void {
  const statusColor = response.status() >= 500 ? c.red : response.status() >= 400 ? c.red : response.status() >= 300 ? c.yellow : c.green;
  console.log(
    `\n${c.bold('→ REQUEST')}  ${c.bold(method.toUpperCase())} ${c.cyan(url)}`,
  );
  if (options?.headers) console.log('  headers:', prettyJson(redactRecord(options.headers as Record<string, string>)));
  if (options?.data !== undefined) console.log('  payload:', prettyJson(redactData(options.data)));
  console.log(
    `${c.bold('← RESPONSE')} ${statusColor(String(response.status()))} ${c.dim(`${elapsedMs}ms`)}`,
  );
  console.log('  headers:', prettyJson(redactRecord(response.headers())));
  console.log('  body:', prettyJson(response.body().toString('utf8').slice(0, 4000)));
}

function wrapRequest(ctx: APIRequestContext): APIRequestContext {
  return new Proxy(ctx, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string' && HTTP_METHODS.includes(prop)) {
        const method = prop as HttpMethod;
        return async (url: string | URL, options?: Parameters<APIRequestContext[HttpMethod]>[1]) => {
          const t0 = Date.now();
          const response: APIResponse = await target[method](url, options);
          if (LOGGER) logCall(method, response.url(), options as Record<string, unknown> | undefined, response, Date.now() - t0);
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

## CI attach-on-failure add-on

Collect exchanges per test and attach only on failure:

```ts
const traffic: string[] = []; // module-level buffer is fine for --workers=1; for parallel workers use test-scoped storage via fixture

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'failed' || traffic.length === 0) return;
  await testInfo.attach('api-traffic.log', { body: traffic.join('\n'), contentType: 'text/plain' });
});
```

For parallel workers, make the buffer a fixture-scoped value (created inside the `request` fixture override) rather than module state.

## Checklist before committing

- [ ] `LOGGER` defaults to off; CI never sets it
- [ ] `SENSITIVE` regex covers your auth header names — add project-specific ones
- [ ] bodies truncated (4 KB) in both console and attachments
- [ ] `tsc --noEmit` + `biome ci` pass with zero suppressions
- [ ] verified locally: `LOGGER=true npx playwright test tests/api.spec.ts` shows colored, redacted traffic
