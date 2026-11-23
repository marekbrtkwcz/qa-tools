# Webhook checklist

Run per endpoint (inbound) and per registered URL (outbound). Record: scenario, request/delivery, observed, result.

## Consumer side (inbound)

| Scenario | Expected |
| --- | --- |
| Valid signed event | 2xx, processed, one side effect |
| Bad signature | 400/401 before parsing; no side effect |
| Missing signature header | rejected; no side effect |
| Timestamp outside tolerance | rejected (replay protection) |
| Duplicate event id delivered twice | one side effect (idempotent) |
| Malformed JSON payload | 400, logged, no crash |
| Unknown event type | 2xx (acknowledged, ignored) or 400 per design — record which |
| Handler slow | still 2xx within provider timeout; work queued |

## Provider side (outbound)

| Scenario | Expected |
| --- | --- |
| Event published | POST with correct payload + signature headers |
| Endpoint 5xx / timeout | retried with growing backoff; then DLQ with payload |
| Endpoint disabled/unregistered | no attempt; logged |
| Secret rotation | old secret accepted in overlap window, then rejected |
| Multiple registered URLs | each gets the event; one failing does not block others |
