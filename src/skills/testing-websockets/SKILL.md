---
name: testing-websockets
description: 'Tests WebSocket and other realtime channels (WebSocket, Server-Sent Events): connection lifecycle, authentication on upgrade, message ordering and delivery, reconnection and heartbeat behaviour, backpressure, and broadcasting to multiple clients. Use when a feature pushes events to clients in real time, when a socket connection drops or duplicates messages, or when SSE streams need coverage.'
argument-hint: 'The realtime endpoint URL and protocol, auth token strategy for the upgrade, and the events in scope'
user-invocable: true
---

# Testing WebSockets and Realtime Channels

Use this skill when the interaction under test is a persistent connection, not a request/response. The failure modes are different from HTTP: connections that silently die, messages delivered out of order or twice, auth that passes the HTTP layer but not the upgrade, and heartbeats that mask a dead peer. Flakiness here usually means asserting on arrival time instead of on received messages.

## When to Use

- a feature pushes live updates (chat, notifications, live dashboards, collaborative editing)
- connection drops, reconnects, or duplicate deliveries are reported
- authentication or authorization applies to the socket, not just the HTTP API
- SSE streams or WebSocket subprotocols need coverage
- backpressure (slow client, fast producer) is in scope

## Operating Principles

- **Assert on received messages, not on timing.** Collect messages for a bounded window and assert on the set/sequence received; never assert "nothing arrived within 500ms" as proof of absence — use an explicit quiescence signal where the protocol has one.
- **Control the server side.** Tests run against a test instance where the server can be told to send specific messages, drop the connection, or delay delivery. If only the client is controllable, the test can only prove the client works.
- **Auth on upgrade is auth.** A token in the query string of the WS handshake must be validated like any other credential; test missing, expired, and wrong-role tokens.
- **Every connection has a lifecycle.** Connect, auth, subscribe, message, ping/pong, disconnect, reconnect — test each transition and the state carried across reconnect.
- **Ordering is per connection.** Messages on one socket are ordered; across sockets or after reconnect they are not guaranteed. Test what the protocol actually promises.

## Workflow

### Phase 1: Map the channel contract

- protocol (WebSocket, SSE), endpoint, subprotocols, and message envelope (type, payload, id, timestamp)
- auth on the upgrade: token/header/query param, and rejection behaviour
- server→client message types and their ordering guarantees
- heartbeat: ping/pong interval, timeout, who sends what
- reconnect semantics: resume token, replay window, or full resync

### Phase 2: Connection and auth tests

Work through `./resources/realtime-checklist.md`:

- connect with valid token: handshake succeeds, welcome/ack message received
- connect with missing/expired/wrong-role token: handshake rejected with the documented close code
- subprotocol negotiation: supported vs unsupported
- server restart / network drop: client detects (heartbeat timeout) and reconnects within the expected window

### Phase 3: Message behaviour

- server→client messages arrive complete, parsed, and in order per connection
- client→server messages are processed and acknowledged (or the documented fire-and-forget)
- broadcast: N clients connected, one event → all N receive it (assert per client, not just count)
- slow consumer: server-side backpressure or client-side queue overflow behaves per design (disconnect, drop, or buffer with a cap)
- duplicate or replayed message id: handled per idempotency design
- malformed message: connection stays up (or closes with the documented code), error message sent, no crash

### Phase 4: Reconnect and resume

- after reconnect, the client resyncs: missed messages are replayed (resume token/window) or a full resync happens — assert the post-reconnect state matches, not just that the socket is open
- concurrent connections for the same user: both receive events, or the old one is kicked, per design

### Phase 5: Automate and report

Automate with a WS client library in the test framework; each test uses a fresh connection and closes it in teardown. Collect messages with a bounded wait and assert on content. Defects go to `reporting-bugs` with the message sequence and connection state.

## Resource Map

- `./resources/realtime-checklist.md` - the per-scenario check matrix for WebSocket and SSE. Read during Phases 2–4.

## Related Skills

- `mocking-network-and-time` - controlling realtime channels whose messages a test cannot otherwise control, including fake clocks for heartbeats
- `testing-event-driven-systems` - the broker-side counterpart of the same events
- `testing-auth-flows` - token acquisition and expiry for the WS handshake
- `testing-application-security` - injection through socket messages, auth on upgrade
- `stabilizing-flaky-tests` - when realtime tests fail intermittently on timing

## Definition of Done

This skill is complete when:

- handshake auth (valid/missing/expired/wrong-role) was tested with documented close codes
- message delivery, ordering per connection, and broadcast to multiple clients were verified against a controllable server
- heartbeat, disconnect detection, reconnect, and resync behaviour were tested
- malformed and duplicate messages were handled per design
- no assertion depends on wall-clock sleeps; all waits collect messages with a bounded window
- connections are closed in teardown and no server-side state leaks between tests
