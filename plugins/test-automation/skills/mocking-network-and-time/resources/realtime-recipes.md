# Realtime Recipes: WebSocket, SSE, Long Polling

Read when the dependency is a live channel: the test needs to control what messages arrive, in what order, and when. Tool facts below target the current mainstream surfaces (`@playwright/test` routeWebSocket, MSW v2 `ws` namespace) - verify against your installed versions before pasting.

## Why realtime needs its own treatment

A request/response stub controls the answer to a question the test asks. A realtime channel pushes answers the test did not ask for yet. That difference produces three failure modes plain stubs do not have:

1. **Timing**: the message arrives after the test read the DOM (or before the listener attached).
2. **Order**: a live channel delivers frames in whatever order the network managed; only a controlled channel can force the out-of-order case.
3. **Lifecycle**: connect, disconnect, reconnect, heartbeat. A mock that stays connected forever proves nothing about the app's reconnect path.

## WebSocket: Playwright `routeWebSocket`

`page.routeWebSocket()` gives a mock server side per connection. Register it before the action that opens the socket, like any route:

```ts
await page.routeWebSocket(/wss:\/\/api\.example\.dev\/updates/, (ws) => {
  ws.onMessage((message) => {
    // echo-aware stub: push one update frame on a known subscription message
    ws.send(JSON.stringify({ type: 'price', symbol: 'PLN', value: 3.98 }));
  });
  // push a frame the test waits on without any client message first
  ws.send(JSON.stringify({ type: 'status', state: 'live' }));
});
```

- `page.on('websocket')` observes real connections (URL, frames in the trace) - use it for evidence, `routeWebSocket` for control.
- Force the failure branches a live channel rarely shows: close from the server side (`ws.close({ code: 1011 })` per the mock server API), or simply never respond, so the app's reconnect/backoff path runs in a test.
- Frames sent by the app under test can be inspected in `ws.onMessage` and asserted there, keeping the assertion in one place.

Fidelity guard, same as any mock: the frame shapes are a contract copy. Record real frames once (`page.on('websocket')` + logging, or the trace's WS entry) and stub from the recording, not from memory.

## WebSocket at the app layer: mock-socket / MSW `ws`

When the consumer is the app's own client library or a component test, intercept above the browser transport:

- **MSW v2** supports WebSocket interception via the `ws` namespace (`import { ws } from 'msw'`, `ws.link('wss://...')` handlers with `server`-style events) - same handler-registry workflow as HTTP, one place for both.
- **mock-socket** stands up a fake server class for unit/component tests of the client code; it never exercises the browser's real transport, so claiming E2E confidence from its tests is mislabeled fidelity.
- A local echo/stub server (a few lines of `ws` in Node) can stand in for the provider in integration tests; it is a dependency to maintain, so prefer it only when the same stub serves many suites.

Label the layer honestly in the decision record: transport-level (`routeWebSocket`) catches the app's connection handling; app-level mocks test the client logic alone.

## SSE: fake the stream with a route

SSE is HTTP with a streaming body, so plain route interception covers it:

```ts
await page.route('**/api/events', async (route) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('retry: 10000\n\n'));
      controller.enqueue(encoder.encode('event: price\ndata: {"value": 3.99}\n\n'));
    },
  });
  await route.fulfill({ status: 200, contentType: 'text/event-stream', body: stream });
});
```

- Send the terminator: enqueue an end-of-stream or enqueue nothing further so the client finishes, otherwise the test may hang on a stream that never yields.
- Multiple events over time are only deterministic if the test controls delivery timing frame by frame. If the app requires a gap, deliver on `waitForTimeout` inside the controller **in the mock**, never with a sleep in the test body - the mock is simulating the provider's scheduling.
- The failure branches SSE rarely shows live: a mid-stream disconnect (`route.abort()` after first frames), a malformed `data:` payload, a rewrite changing the event name.

## Waiting for realtime state (the flakiness half)

Waiting rules do not change, only the trigger:

```ts
// Wait on the rendered effect of the message, not on the channel being open
const firstPrice = page.waitForResponse((r) => r.url().includes('/api/events'));
await page.goto('/ticker');
await firstPrice;
await expect(page.getByTestId('price')).toHaveText('3.98');
```

- **Open is not ready.** Socket open proves transport; assert on the first rendered frame the handler produces.
- `expect.poll`/`toPass` still cover non-DOM state changed by a pushed message.
- For the "message arrives before listener" class, see `stabilizing-flaky-tests` root-cause class 8 (realtime timing) - this file controls the channel, that file classifies and proves the fix.

## Long polling

Long polling is request/response with long-held requests, so the standard route recipes apply with two quirks:

- a poll that returns nothing for the full hold then reconnects is normal behaviour - do not stub it to an instant empty 200, or the client's backoff is never exercised
- assert the **sequence** (request N+1 arrives only after response N) by queueing stub responses and verifying the test's server-side log of received polls, not by timing sleeps

## Drift guard

Same rule as HTTP mocks, one extra mechanism: keep one thin smoke test that connects to the real channel (or its staging twin) with the same client code, tagged out of the main run - see the drift-guard phase in the skill body. Frame shapes drift, event names get renamed, and a WS mock that never red is a fixture agreeing with itself.
