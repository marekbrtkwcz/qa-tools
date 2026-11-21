---
name: webhook-testing
description: 'Load this skill when testing incoming webhooks: HMAC signature verification (X-Hub-Signature-256), fast 2xx ack, idempotency on redelivery/replay, malformed payloads, and asserting side effects by polling with expect.poll. Covers signing test payloads and choosing a receiver (local test server / webhook.site).'
user-invocable: true
---

# 📨 Webhook Testing

A webhook endpoint must **verify the signature, ack fast (2xx), and be idempotent** — providers redeliver. Test all three, plus the side effect the webhook is supposed to cause.

## 🎯 When to Use

- your app receives webhooks (payments, SaaS events, CI callbacks)
- you need to verify signature checking, replay protection, and error handling
- agents: `qa-tools:webhook-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## 🔐 Signing a Test Payload (HMAC-SHA256)

```typescript
import crypto from 'node:crypto';

function sign(payload: string, secret: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

test('should accept webhook with valid signature and create payment record', async ({ request }) => {
  const payload = JSON.stringify({ event: 'payment.succeeded', id: 'pay_123', amount: 4999 });
  const res = await request.post(`${process.env.BASE_URL}/webhooks/stripe`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Hub-Signature-256': sign(payload, process.env.WEBHOOK_SECRET!),
    },
    data: payload,
  });
  expect(res.status()).toBe(200);

  // side effect: poll until the record appears — never waitForTimeout
  await expect.poll(async () => {
    const r = await request.get(`${process.env.BASE_URL}/api/payments/pay_123`, {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    });
    return r.status();
  }, { timeout: 10_000 }).toBe(200);
});
```

## 📋 Checklist

- **Valid signature → 2xx** and the expected side effect (poll with `expect.poll`).
- **Invalid/missing signature → 401/403**, no side effect.
- **Malformed payload (broken JSON) → 400**, no crash, no side effect.
- **Replay / redelivery (same event id twice) → still 2xx, side effect applied once** (idempotency key / unique event id).
- **Unknown event type → 2xx (ack, ignore) or 400** — assert whichever the contract says.
- **Slow processing**: endpoint must ack 2xx quickly and process async — assert response time and that the side effect lands later.
- Secrets and URLs only from env (`WEBHOOK_SECRET`, `BASE_URL`) — never hardcoded.

## 🧰 Receiver Options

- **Local test server** (e.g. a tiny HTTP listener in the test) — for outgoing webhooks your app sends.
- **webhook.site / similar** — public URL with inspection UI, useful for manual exploration; never send real secrets to it.
- **The app's own endpoint via `request`** — the usual case for incoming webhooks (shown above).

## ❌ Common Pitfalls

- Testing only the happy path — signature failure and replay are where production incidents live.
- `waitForTimeout` to "give it time" — use `expect.poll` on the observable state instead.
- Asserting only the status code, not the side effect.
- Forgetting cleanup of records created by the webhook (`afterEach`).

## 🧹 Conventions

- `request` fixture; names `should <result> when <condition>`; poll with `expect.poll`; no `waitForTimeout`.
