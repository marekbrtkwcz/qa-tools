# SSE stream checklist

Run per endpoint. Record: scenario, frames sent/observed, result.

## Frame format

| Scenario | Expected |
| --- | --- |
| Single-line `data:` | one event with the payload |
| Multi-line `data:` | lines joined with `\n` into one event |
| `event: <name>` | dispatched to the named handler, not the default |
| `id: <id>` | sets lastEventId; included in the next reconnect |
| `retry: <ms>` | client reconnect interval updated |
| Comment line (`: ...`) | no event fired |
| Unterminated block / bad UTF-8 | connection survives or closes per spec; no server crash |
| `data:` with no newline at stream end | discarded (incomplete event) |

## Lifecycle and resume

| Scenario | Expected |
| --- | --- |
| Ordered events while connected | increasing ids, in order |
| Drop + auto-reconnect with Last-Event-ID | only events after that id arrive — no gap, no duplicate |
| Reconnect with stale/unknown id | full resync or documented rejection |
| Server close / logout | client stops or reconnects per design — record which |
| Heartbeat comments | no client event; keeps proxies from closing the idle stream |
| N concurrent clients | each receives broadcast events |

## Auth and headers

| Scenario | Expected |
| --- | --- |
| No/expired token | HTTP 401 before stream starts |
| Query-string token | works; flagged as log-leak risk for testing-api-security |
| CORS | allow-origin matches allowed origins only |
