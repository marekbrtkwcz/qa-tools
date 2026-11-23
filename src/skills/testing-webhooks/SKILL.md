---
name: testing-webhooks
description: 'Tests webhook integrations on both sides: as a consumer, verifying signature validation, idempotent handling of retries, timestamp tolerance, and response codes; as a provider, delivering events with correct payloads, signatures, retries with backoff, and dead-letter after exhaustion. Use when the app receives or sends webhooks (Stripe, GitHub, payment providers), when duplicate event processing is reported, or when deliveries silently stop.'
argument-hint: 'Webhook endpoint URL(s), the signing secret for the test environment, the event types in scope, and whether the app is consumer, provider, or both'
user-invocable: true
---

# Testing Webhooks

Use this skill when events arrive as HTTP POSTs to your endpoint, or your service POSTs events to someone else's. Webhook failure modes are specific: forged or replayed events accepted because the signature was not checked, duplicate processing because retries were not deduplicated, and silent delivery death because nobody watched the dead-letter queue.

## When to Use

- the app consumes provider webhooks (payments, git hosting, identity)
- the app publishes webhooks to customer-registered URLs
- duplicate side effects (double charge, double email) are reported
- deliveries fail and retry behaviour is unknown
- signature secret rotation is planned

## Operating Principles

- **Verify the signature on every event, before parsing.** HMAC over the raw body with a timestamp tolerance; reject missing, stale, or wrongly-signed events with 400/401 and do no work.
- **Delivery is at-least-once.** Providers retry; the consumer must be idempotent — dedupe on the provider's event id, and test that a replayed event has one effect.
- **Respond fast, process async.** A 2xx within seconds, with processing queued; a slow handler causes provider timeouts and retry storms.
- **Test both sides against a simulator.** Never test against the real provider's production endpoint; use their test mode or a local mock that replays recorded payloads.
- **Watch the dead-letter.** Undeliverable webhooks must land somewhere observable after retries exhaust, with the payload preserved.

## Workflow

### Phase 1: Map the webhook surface

- inbound: provider, endpoint, event types, signature scheme (header name, algorithm, timestamp header), secret storage
- outbound: registered URLs per tenant, event types, signing, retry policy, DLQ

### Phase 2: Consumer-side checks

Work through `./resources/webhook-checklist.md`:

- valid signed event: 2xx, event processed, side effect happened once
- bad/missing signature: rejected before processing; no side effect
- replayed timestamp outside tolerance: rejected
- duplicate delivery (same event id): one side effect
- malformed payload: 400, no crash, event logged
- slow handler: responds 2xx quickly and processes async; provider does not time out

### Phase 3: Provider-side checks

- event published → POST to registered URL with correct payload shape and signature headers
- endpoint returns 5xx or times out → retried with backoff (verify growing intervals), then DLQ with payload
- endpoint unregistered/disabled → no delivery attempt, logged
- secret rotation: old secret still accepted during the overlap window, then rejected

### Phase 4: Automate and report

Automate with a local mock receiver (records deliveries) and recorded real payloads as fixtures. Defects go to `reporting-bugs` with the payload and headers.

## Resource Map

- `./resources/webhook-checklist.md` - consumer-side and provider-side check matrix. Read during Phases 2–3.

## Related Skills

- `testing-api-security` - signature bypass, replay attacks, timing attacks on comparison
- `testing-event-driven-systems` - the broker-based alternative to webhooks; same idempotency rules
- `api-playwright-test-developer` - webhook simulation in Playwright API tests
- `testing-api-contracts` - payload schema validation for webhook bodies
- `handling-sensitive-test-data` - secrets and real payloads in fixtures

## Definition of Done

This skill is complete when:

- signature verification (valid, bad, missing, stale timestamp) was tested on every inbound endpoint
- duplicate delivery produced exactly one side effect
- provider retries with backoff and DLQ were observed on failure
- handler responds 2xx within the provider's timeout and processes async
- secret rotation overlap behaved per design
- tests used recorded payloads / local mock only, never production provider endpoints
