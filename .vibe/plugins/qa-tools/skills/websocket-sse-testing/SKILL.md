---
name: websocket-sse-testing
description: Load this skill when testing real-time channels — WebSocket and Server-Sent Events (SSE) — with Playwright. Covers waiting for messages, asserting order and payloads, reconnect behavior, and SSE via request/response events.
user-invocable: true
---

# Testing WebSocket & SSE with Playwright

Playwright has **no built-in WebSocket fixture** — use `page.waitForEvent('websocket')`.

## WebSocket

```typescript
test('should receive order update when event is published', async ({ page }) => {
  await page.goto('/orders');

  const wsPromise = page.waitForEvent('websocket');
  await page.getByRole('button', { name: 'Subscribe' }).click();
  const ws = await wsPromise;

  // wait for a frame and assert payload
  const msg = await ws.waitForEvent('framereceived', { timeout: 5000 });
  expect(JSON.parse(msg.payload as string)).toMatchObject({ type: 'ORDER_UPDATED', id: '123' });

  // send a frame from the test
  ws.send(JSON.stringify({ type: 'PING' }));
  const pong = await ws.waitForEvent('framereceived');
  expect(JSON.parse(pong.payload as string).type).toBe('PONG');
});
```

Rules:

- **always assert content, not just "a frame arrived"** — parse JSON and match fields with `expect`
- use explicit `{ timeout }` on `waitForEvent` — default 30s hides slow regressions; never `waitForTimeout`
- collect multiple messages in order: loop `ws.waitForEvent('framereceived')` into an array, then assert the sequence
- **reconnect**: after `page.reload()` or network drop, a NEW websocket event fires — wait for it again; assert the app resubscribes (e.g. last message re-sent)
- close: `ws.close()` in `afterEach` if the test opened one manually

## Server-Sent Events (SSE)

SSE is plain HTTP — test it via the `request` fixture is NOT possible for streaming; use the `response` event on `page`:

```typescript
test('should stream events when subscribing to SSE feed', async ({ page }) => {
  const events: string[] = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/events') && res.headers()['content-type']?.includes('text/event-stream')) {
      const body = await res.body(); // full body (SSE streams until close in tests)
      for (const line of body.toString().split('\n')) {
        if (line.startsWith('data:')) events.push(line.slice(5).trim());
      }
    }
  });

  await page.goto('/dashboard');
  // trigger server-side event via API, then assert
  await expect.poll(() => events.length).toBeGreaterThan(0);
  expect(JSON.parse(events[0])).toMatchObject({ type: 'NOTIFICATION' });
});
```

- assert `content-type: text/event-stream` header
- use `expect.poll(...)` for streamed data — it retries without `waitForTimeout`
- for long-lived streams prefer `page.waitForResponse(url)` + reading chunks, and close the page to end the stream

## Common pitfalls

| Pitfall | Fix |
|---|---|
| `waitForTimeout` after click to "let WS connect" | `await page.waitForEvent('websocket')` then `waitForEvent('framesent'/'framereceived')` |
| Asserting only "ws opened" | assert first frame payload (auth/hello message) |
| One global `page.on('websocket')` handler mixing sockets | scope per test; create the promise BEFORE the action that opens the socket |
| SSE test reading empty body | SSE never "finishes" — read via stream chunks or `expect.poll` on collected events |
| Flaky order assertions | collect frames into array, assert with `toEqual` on mapped types |
| Ignoring reconnect | after reload, wait for a new `websocket` event and assert resubscribe message |
