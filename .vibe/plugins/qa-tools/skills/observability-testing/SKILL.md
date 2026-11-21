---
name: observability-testing
description: 'Load this skill when tests should assert on observability signals — structured app logs (JSON fields, correlation IDs), OpenTelemetry traces/spans (names, attributes, error status, propagation), and Prometheus metrics (counters/gauges) — via their query APIs (Loki, Tempo/Jaeger, Prometheus) or log endpoints. Covers polling with expect.poll, correlation of a user action to its trace, and negative cases.'
user-invocable: true
---

# 🔭 Observability Testing (logs / traces / metrics)

A feature that works but is **invisible in production** is half-done: no trace, no error log, no metric. Tests should assert the observability contract: the action produces the expected span, log line, and metric — and failures produce error signals.

## 🎯 When to Use

- after a user/API action, a trace span, structured log line, or metric increment should exist
- you need to verify correlation IDs propagate (request → downstream services)
- error paths must emit error-level logs / span status ERROR / alertable metrics
- agents: `qa-tools:observability-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

Backends and their URLs come **only from env**: `LOKI_URL`, `TRACES_URL` (Tempo/Jaeger API), `PROM_URL`, `BASE_URL`, `API_TOKEN`.

## 🔍 Traces (OpenTelemetry)

```typescript
test('should create order span with item attribute when order is placed', async ({ request }) => {
  const res = await request.post(`${process.env.BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    data: { item: 'book', qty: 1 },
  });
  expect(res.status()).toBe(201);
  const orderId = (await res.json()).id;

  // poll the traces backend until the span appears — never waitForTimeout
  let spans;
  await expect.poll(async () => {
    const r = await request.get(`${process.env.TRACES_URL}/api/search?tags=order.id=${orderId}`);
    spans = (await r.json()).data ?? [];
    return spans.length > 0;
  }, { timeout: 15_000 }).toBe(true);

  const span = spans[0].spans[0];
  expect(span.operationName).toBe('POST /api/orders');
  expect(span.tags['order.id']).toBe(orderId);
  expect(span.tags['error']).toBeUndefined(); // no error on the happy path
});
```

Assert: span **name**, key **attributes** (`order.id`, `http.status_code`), **duration sanity** (not absurdly long), **status** (`ERROR` + `error.message` on failure paths), and **propagation** — downstream spans share the same `traceId` as the parent.

## 📜 Logs (Loki / log endpoint / structured JSON)

```typescript
test('should log structured error with correlation id when payment fails', async ({ request }) => {
  const correlationId = 'test-corr-123';
  const res = await request.post(`${process.env.BASE_URL}/api/payments`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}`, 'X-Correlation-Id': correlationId },
    data: { amount: -1 }, // invalid → error path
  });
  expect(res.status()).toBe(400);

  let lines;
  await expect.poll(async () => {
    const r = await request.get(
      `${process.env.LOKI_URL}/loki/api/v1/query_range?query={app="shop"} |= "${correlationId}"&limit=50`
    );
    const streams = (await r.json()).data?.result ?? [];
    lines = streams.flatMap((s) => s.values.map((v) => v[1]));
    return lines.some((l) => l.includes('"level":"error"'));
  }, { timeout: 15_000 }).toBe(true);

  const errLine = lines.find((l) => l.includes('"level":"error"'));
  const parsed = JSON.parse(errLine);
  expect(parsed.correlationId).toBe(correlationId);
  expect(parsed.msg).toContain('payment');
});
```

Assert: **level**, **message**, structured fields (JSON: `correlationId`, `order.id`, `user.id`), and that PII/secrets are NOT logged (negative assertion on the log line).

## 📊 Metrics (Prometheus)

```typescript
test('should increment orders_created counter when order is placed', async ({ request }) => {
  const before = await readCounter(request, 'orders_created_total');
  const res = await request.post(`${process.env.BASE_URL}/api/orders`, { /* ... */ });
  expect(res.status()).toBe(201);

  await expect.poll(async () => (await readCounter(request, 'orders_created_total')) > before,
    { timeout: 15_000 }).toBe(true);
});

async function readCounter(request, name: string): Promise<number> {
  const r = await request.get(`${process.env.PROM_URL}/api/v1/query?query=${name}`);
  const result = (await r.json()).data?.result ?? [];
  return result.length ? Number(result[0].value[1]) : 0;
}
```

## 📋 Checklist

- Happy path produces: span with expected name/attributes, info-level log if the app logs actions, metric increment.
- Error path produces: span status ERROR, error-level structured log with correlation ID, alertable metric/error counter.
- Correlation ID from the request appears in logs AND trace attributes of downstream spans.
- No secrets/PII in logs or span attributes (negative assertion).
- Poll backends with `expect.poll` — backends are eventually consistent; never `waitForTimeout`.

## ❌ Common Pitfalls

- Asserting only "something was logged" — assert level, message, and structured fields.
- Fixed sleeps for backend ingestion — use `expect.poll` with a timeout.
- Hardcoded backend URLs — env only (`LOKI_URL`, `TRACES_URL`, `PROM_URL`).
- Forgetting the error-path signals — they are what on-call relies on at 3 a.m.

## 🧹 Conventions

- `request` fixture; names `should <result> when <condition>`; poll with `expect.poll`; cleanup created entities in `afterEach`.
