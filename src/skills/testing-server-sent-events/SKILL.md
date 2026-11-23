---
name: testing-server-sent-events
description: 'Tests Server-Sent Events streams: event frame format and parsing, Last-Event-ID resume after reconnect, the retry field, heartbeat comments, stream lifecycle, and multi-client broadcast. Use when a feature streams server→client updates over SSE (text/event-stream), when clients report missed events after a reconnect, or when the stream should end but does not.'
argument-hint: 'The SSE endpoint URL, auth strategy (headers vs query token), and the event types in scope'
user-invocable: true
---

# Testing Server-Sent Events

Use this skill when the realtime channel is an HTTP stream of `text/event-stream` rather than a WebSocket. SSE is simpler than WebSocket — one-directional, auto-reconnecting, plain HTTP — and its failure modes are specific: missed events after reconnect, `Last-Event-ID` not honoured, heartbeats mistaken for data, and streams that never end. For WebSocket channels use `testing-websockets`.

## When to Use

- a feature streams live updates over SSE (notifications, feeds, progress, logs)
- clients report skipped or duplicated events after a network drop
- the `retry` interval or `Last-Event-ID` resume behaviour is in question
- auth on the stream (EventSource cannot set headers — token in query or cookie) needs verification
- a stream must terminate on logout/server shutdown and does not

## Operating Principles

- **The frame is the contract.** `data:`, `event:`, `id:`, `retry:`, and comment lines (`:`) each have defined meaning; test the parser against malformed frames, not just happy frames.
- **Reconnect must resume, not restart.** A client that reconnects with `Last-Event-ID` must receive only the events after that id; a client that reconnects without it gets a full resync per design.
- **Heartbeats are comments.** `:` comment lines must not surface as events in the client.
- **Auth via query token leaks.** Because `EventSource` cannot set headers, tokens often end up in URLs — they land in logs. Verify the accepted mechanisms and treat query-token URLs as a finding for `testing-api-security`.
- **Assert on collected events, not on timing.** Collect events for a bounded window and assert on content and ids.

## Workflow

### Phase 1: Map the stream contract

- endpoint, content type (`text/event-stream`), event types (`event:` field values), and the id sequence guarantee (monotonic per stream)
- auth mechanism and rejection behaviour (401 on the HTTP response)
- heartbeat: comment interval and expected client behaviour
- server-side termination: logout, idle timeout, explicit close — and what the client sees

### Phase 2: Frame format and parsing

Work through `./resources/sse-checklist.md`:

- single and multi-line `data:` frames reassemble correctly
- `event:` names dispatch to the right handler; unnamed events go to the default handler
- `id:` sets `lastEventId`; `retry:` changes the reconnect interval (verify the client honours a changed value)
- comment lines (`:`) produce no event
- malformed frames (bad UTF-8, unterminated block) — connection survives or closes per spec, no crash

### Phase 3: Stream lifecycle and resume

- events arrive in order with increasing ids while connected
- after a drop, the client reconnects automatically and sends `Last-Event-ID`; the server resumes after that id — no gaps, no duplicates
- a client connecting with a stale/unknown id gets the documented behaviour (full resync or 410-style rejection)
- stream ends on server close/logout: client stops reconnecting or reconnects per design; record which
- multiple concurrent clients each receive the broadcast events

### Phase 4: Auth and headers

- no token / expired token: HTTP 401 before the stream starts
- token in query string: works, and is flagged as a log-leak risk
- CORS: `Access-Control-Allow-Origin` correct for the allowed origins only

### Phase 5: Automate and report

Automate with a raw HTTP client that reads the stream (EventSource in tests where the browser API itself is under test). Close connections in teardown. Defects go to `reporting-bugs` with the frame sequence.

## Resource Map

- `./resources/sse-checklist.md` - the frame-format and lifecycle check matrix. Read during Phases 2–4.

## Related Skills

- `testing-websockets` - bidirectional WebSocket channels
- `testing-event-driven-systems` - the broker-side events that feed the stream
- `mocking-network-and-time` - controlling stream timing and drops in automated tests
- `testing-api-security` - query-string token leakage, CORS misconfiguration
- `stabilizing-flaky-tests` - when SSE tests are timing-flaky

## Definition of Done

This skill is complete when:

- frame parsing (multi-line data, event names, ids, retry, comments, malformed) was verified
- reconnect with `Last-Event-ID` resumed without gaps or duplicates; stale-id behaviour matches the documented design
- heartbeats produced no client events
- auth rejection (401) and the query-token leak risk were checked
- server-side termination and multi-client broadcast were verified
- no assertion relies on fixed sleeps; events were collected in bounded windows
