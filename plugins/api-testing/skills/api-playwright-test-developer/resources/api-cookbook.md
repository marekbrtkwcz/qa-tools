# API Test Cookbook: Flows Past Plain Request/Response

Read when the behaviour under test is not a single status-and-body exchange: files in and out, inbound webhooks, and requests that are held or polled. All snippets use `@playwright/test`. Examples illustrate the shape, not a gold answer; fit names and endpoints to your app.

## File upload through the request context

```ts
// Multipart upload via APIRequestContext
import { readFileSync } from 'node:fs';

test('POST /api/imports accepts a CSV and returns the row count', async ({ request }) => {
  const response = await request.post('/api/imports', {
    multipart: {
      file: {
        name: 'import.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('email,name\nada@example.test,Ada\n'),
      },
    },
  });
  expect(response.status()).toBe(201);
  expect(await response.json()).toMatchObject({ imported: 1, rejected: 0 });
});
```

- Build the file content in the test (or read it from `data/`), so the fixture is reviewed with the test - never upload a path that exists only on the author's machine.
- Assert the meaningful output (parsed row count, extracted metadata, a storage URL that answers), not just `201`: an endpoint that swallows the file and returns 201 with an empty result must fail.
- Large-file behaviour (streaming, limits) is not proven by a 10-byte fixture. Test the 413/422 branch with a generated oversize buffer (`Buffer.alloc(21 * 1024 * 1024)`), and leave true streaming throughput to a performance suite (`testing-performance-and-load`).

## File download: API side and UI side

```ts
// API: assert the bytes, not the status only
const response = await request.get('/api/reports/export.csv');
await expect(response).toBeOK();
const body = Buffer.from(await response.body());
expect(response.headers()['content-type']).toContain('text/csv');
expect(body.toString()).toContain('order,total'); // header row present

// UI: what the browser downloads lands on disk
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export' }).click();
const download = await downloadPromise;
const path = await download.path();
expect(readFileSync(path, 'utf8')).toContain('order,total');
```

- `response.body()` reads the whole response into memory - fine for reports, wrong for gigabyte files.
- A CSV download deserves one real assertion on parsed content, not `toBeOK` alone: an empty CSV with headers removed ships against a green suite (`unslop-tests` flags the shape).
- `suggestedFilename()` is part of the contract when the filename embeds the report id or date; assert it explicitly.

## Inbound webhook simulation

The app consumes webhooks from a provider (payments, CI, chat). Three parts: reach the endpoint, produce the correct payload shape, and satisfy the signature check.

```ts
test('stripe-style webhook: invoice paid flips the order to PAID', async ({ request }) => {
  const secret = process.env.TEST_WEBHOOK_SECRET!;
  const payload = { type: 'invoice.paid', data: { order_id: order.id } };
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${JSON.stringify(payload)}`)
    .digest('hex');

  const response = await request.post('/api/webhooks/billing', {
    data: payload,
    headers: {
      'x-webhook-timestamp': String(timestamp),
      'x-webhook-signature': `t=${timestamp},v1=${signature}`,
    },
  });
  expect(response.status()).toBe(200);

  // assert the *effect*, not the acknowledgement: the order state changed
  await expect
    .poll(async () => (await request.get(`/api/orders/${order.id}`)).json().then((b) => b.status))
    .toBe('PAID');
});
```

- The signature scheme above is a Stripe-shaped illustration; copy the real scheme from the provider's docs (header names, HMAC input format, encoding) - a test that passes with a home-made scheme verifies your mock, not your endpoint.
- **Idempotency is the point of webhooks**: providers redeliver. Send the same event twice and assert one effect (one order flip, one row created). A webhook handler that is not idempotent is a production double-charge waiting for its first retry.
- Replay protection (timestamp outside tolerance) and the `401/403` on a bad signature are separate tests; do not bundle them with the happy path (`writing-unit-tests` one-behaviour rule).
- A sandboxed *real* provider webhook is drift guard, not the functional test - one live round-trip per release is enough, since sandbox webhooks are slow and rate-limited.

## Long polling and long-held requests

```ts
// The held request is the behaviour under test: 25 s hold, then one event
const firstEvent = request.get('/api/events/longpoll?timeout=25000');
// ...trigger nothing for a while if you assert the hold...
const response = await firstEvent;
await expect(response).toBeOK();
expect(await response.json()).toMatchObject({ type: 'price', value: 3.98 });
```

- Set the per-request timeout above the server's hold (`timeout: 30000`) or Playwright kills a valid hold as a failure; a raised per-test timeout inside a comment naming the server's contract is honest, a silently raised global timeout is not.
- Timeout response branch: request a poll the server does not satisfy within its window and assert the documented timeout shape (204, empty 200 - whatever the API contract documents), not a network error.
- Assert the **sequence** of consecutive polls (poll N+1 sent only after response N) via an observable side effect, never with sleeps (`mocking-network-and-time` realtime recipes owns the deterministic version of this).

## Polling for eventual state (the deterministic pattern)

```ts
// Eventually consistent backend: poll the outcome, bounded and readable
await expect
  .poll(async () => (await request.get(`/api/imports/${importId}`)).json().then((b) => b.status))
  .toBe('completed'); // expect.poll bounds the wait and reports the last observed value on failure
```

- `expect.poll` reports the last observed value on failure - keep the polled expression cheap and side-effect-free.
- The default poll bound may be too short for slow pipelines; raise it per assertion (`expect.poll(fn, { timeout: 120_000 })`) and name the reason, the same way a per-request timeout names the server's contract. A sleep-until loop reproduces the same flake class with no reporting.
- An unawaited `request.get(...)` result is a silent leak of a response the context holds open: chain both awaits (`(await request.get(...)).json()`) or assign in two steps.

Keep webhook tests and upload tests in their own files (`webhooks.spec.ts`, `imports.spec.ts`) - they carry fixtures and secrets the rest of the suite does not need.
