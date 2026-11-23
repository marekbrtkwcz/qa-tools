# Realtime channel test checklist

Run per endpoint/protocol. Record: scenario, expected, observed, result. Waits collect messages with a bounded window — no fixed sleeps as proof of absence.

## Connection and auth

| Scenario | Expected |
| --- | --- |
| Valid token on upgrade | handshake 101, ack/welcome message received |
| Missing token | handshake rejected (401/403 or close code), documented |
| Expired token | rejected like missing |
| Wrong-role token | rejected, or connected with reduced subscriptions per design |
| Unsupported subprotocol | handshake rejected or default negotiated per spec |

## Message behaviour

| Scenario | Assert |
| --- | --- |
| Server→client message | arrives complete and parseable |
| Ordered burst on one connection | received in sent order |
| Broadcast to N clients | every client received the event (assert per client) |
| Client→server message | processed and acknowledged (or documented fire-and-forget) |
| Malformed message | documented behaviour: close code or error message; connection state per design; no server crash |
| Duplicate message id | one effect (idempotent) or documented re-apply |
| Slow consumer | backpressure per design: buffer capped / dropped / disconnected — record which |

## Lifecycle

| Scenario | Assert |
| --- | --- |
| Heartbeat | ping/pong within interval; missing pong → client detects within timeout |
| Server drop | client detects and reconnects within expected window |
| Reconnect resync | missed events replayed or full resync; post-reconnect state matches server state |
| Duplicate connection (same user) | both receive events, or old connection kicked — per design |
| SSE stream | events arrive as `data:` frames; `retry:` field honoured; stream ends on server close |

## Hygiene

| Check | How |
| --- | --- |
| Teardown closes connections | no open sockets after suite |
| No wall-clock assertions | every wait is a bounded message-collection window |
