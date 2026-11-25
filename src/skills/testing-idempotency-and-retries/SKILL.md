---
name: testing-idempotency-and-retries
description: "Tests idempotency and retry behavior of APIs and integrations: idempotency keys, at-least-once delivery, duplicate submissions, double-click/double-submit protection, retry storms, and safe replays. Use when an endpoint can receive the same request twice (client retry, webhook redelivery, queue at-least-once), when payments or state-changing operations must not double-apply, or when a retry policy is added to a client."
argument-hint: "The endpoint/flow that can be replayed, and where duplicates can originate (client retry, webhook redelivery, queue)"
user-invocable: true
---

# Testing Idempotency and Retries

Distributed systems deliver **at least once**, not exactly once. If the same request can arrive twice, the system must make the second arrival a no-op. This skill tests exactly that — and the client-side retry policies that create duplicates.

## When to Use

- POST endpoints that move money, create orders, send notifications
- webhooks with provider redelivery (`testing-webhooks` covers delivery mechanics; this covers duplicates)
- queue consumers with at-least-once semantics (`testing-event-driven-systems`)
- client retry logic after timeouts (a timeout ≠ a failure — the server may have processed it)
- double-click / double-submit in the UI

## Server-side patterns to verify

1. **Idempotency key:** client sends `Idempotency-Key: <uuid>`; server stores the key → response mapping and returns the *original* response on replay, without re-executing the side effect. Test: same key twice → identical response body/status, side effect happened once (check DB count, downstream call count, balance).
2. **Key scope and expiry:** keys are scoped per endpoint/user and expire (typically 24h). Test: same key on a *different* endpoint must not collide; expired key re-executes.
3. **Replay with different payload:** same key + different body → server should reject (409) rather than silently return the old response.
4. **Natural idempotency:** PUT/replace semantics are safe to replay by construction — test that too.

## Client-side patterns to verify

- **Retry only on safe conditions:** retries on timeouts/5xx/network errors, never blindly on 4xx; exponential backoff with jitter (a synchronized fleet retrying at once is a thundering herd — the jitter is the fix, test its presence in config).
- **Retry budget:** after N attempts the client gives up and surfaces the error (no infinite retry loop).
- **UI double-submit:** button disabled after first click / in-flight guard; test with two rapid clicks → one request reaches the server.

## Test techniques

- **Controlled duplication:** send the same request twice (sequentially, and concurrently) with the same key; assert one side effect.
- **Downstream counting:** wrap the downstream call (mock via `mocking-network-and-time`) and count invocations.
- **Crash-replay simulation:** kill/timeout the client after send, replay, assert no double-apply.
- **Race test:** fire N identical concurrent requests; assert exactly one side effect (this catches check-then-act without locking).

## Red Flags

- "the client retries, so the server must be idempotent" used as a reason to skip server-side protection — retries are not the only duplicate source (webhooks, queues, user double-click)
- idempotency key derived from something non-unique (timestamp, user id alone)
- replay returning a *fresh* execution result (201 created again) instead of the stored response — clients depend on the original
- no test for the concurrent case — sequential duplicates pass while races double-apply
- retry without backoff+jitter in a service with many instances

## Related Skills

- `testing-webhooks` - webhook delivery, signatures, redelivery mechanics
- `testing-event-driven-systems` - queue consumers, at-least-once, dead-letter
- `testing-api-contracts` - the Idempotency-Key header belongs in the OpenAPI spec; contract-test it
- `mocking-network-and-time` - simulating timeouts/crashes and counting downstream calls
- `testing-abuse-limits` - rate limiting is the sibling protection against retry storms
- `flaky-test-policy` / `stabilizing-flaky-tests` - do not "fix" a duplicate-processing bug by adding test retries

## Definition of Done

- every state-changing endpoint that can receive duplicates has a tested idempotency mechanism (key or natural)
- replay returns the original response and the side effect count stays 1 — proven including the concurrent case
- same-key-different-payload is rejected; key scoping/expiry is covered
- client retry policy is tested: safe-only triggers, backoff+jitter, retry budget, surfaced error
- UI double-submit produces exactly one server request
