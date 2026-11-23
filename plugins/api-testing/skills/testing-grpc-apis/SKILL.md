---
name: testing-grpc-apis
description: 'Designs and runs tests for gRPC services: unary, server-streaming, client-streaming, and bidirectional calls against the proto contract, deadline and cancellation handling, metadata and auth interceptors, error codes and status details, and retry behaviour. Use when a service exposes gRPC endpoints and needs functional coverage beyond what REST-style tests can reach.'
argument-hint: 'gRPC endpoint address, proto files or reflection access, and an auth token strategy if metadata auth is used'
user-invocable: true
---

# Testing gRPC APIs

Use this skill when the API speaks gRPC: one HTTP/2 endpoint, proto-defined methods, streaming RPCs, and status codes instead of HTTP statuses. REST habits (status code per route, JSON body) do not transfer; coverage is per method and per streaming direction.

For contract/breaking-change detection between proto versions use `testing-api-contracts` patterns applied to protos; for security (auth metadata, interceptor bypass) use `testing-api-security`.

## When to Use

- a service exposes gRPC methods with no automated coverage
- streaming RPCs (server/client/bidi) misbehave: wrong order, missing end-of-stream, hangs
- deadlines, cancellation, or metadata-based auth need verification
- error codes and `StatusDetails` (rich error payloads) need asserting
- retry or hedging policy on flaky calls is in scope

## Operating Principles

- **The proto is the API surface.** Every service and method in the proto is testable, whether any UI calls it or not. Use server reflection in non-production to enumerate it.
- **Status codes are the contract.** Assert on `codes.*` (OK, InvalidArgument, NotFound, Unauthenticated, DeadlineExceeded...), not on message text alone; assert `details` when the server populates them.
- **Deadlines are behaviour.** A call without a deadline can hang forever; verify the server honours client deadlines and sets its own where required.
- **Streams end explicitly.** Server-streaming ends with OK status; client-streaming gets one response; bidi ends when both sides close. Test half-close behaviour.
- **Metadata is input.** Auth tokens, tenant ids, and tracing headers arrive as metadata; test missing, malformed, and wrong-tenancy metadata per method.

## Workflow

### Phase 1: Get the contract and map the methods

- obtain protos from the repo or via gRPC reflection (non-production only)
- list services, methods, and streaming type of each (unary / server-streaming / client-streaming / bidi)
- identify per-method auth metadata requirements

### Phase 2: Unary calls

Work through `./resources/grpc-checklist.md`:

- happy path: request → response fields and values
- validation: missing required field, wrong type, out-of-range → `InvalidArgument` with `details` naming the field (BadRequest with field violations)
- not-found / permission cases → `NotFound` / `PermissionDenied`
- deadline: call with a deadline shorter than server processing → `DeadlineExceeded`; verify the server actually stops work
- cancellation: client cancels mid-call → server observes context cancellation (no leaked work)

### Phase 3: Streaming calls

- server-streaming: N messages arrive in order, then OK; empty stream is valid; error mid-stream ends with the status code, not OK
- client-streaming: N requests → one response; empty client stream handled per design
- bidi: interleaved messages both directions; half-close (client done) → server finishes and closes; server early-close → client sees status
- backpressure: slow consumer on a server stream — server must not buffer unboundedly (observe flow control)

### Phase 4: Metadata, auth, and retries

- missing auth metadata → `Unauthenticated`; wrong tenant → `PermissionDenied`
- retry policy: transient `Unavailable` retried per the service's retry policy with backoff; permanent errors not retried
- compression and message size limits: oversized message → `ResourceExhausted`

### Phase 5: Automate and report

Automate with a gRPC client (grpcurl for exploration, the language client for tests, or Playwright-style API tests where applicable). Assert status code, message fields, and details. Defects go to `reporting-bugs` with method, request, and status.

## Resource Map

- `./resources/grpc-checklist.md` - per-method-type check matrix: unary validation, streaming lifecycle, metadata auth, deadlines. Read during Phases 2–4.

## Related Skills

- `testing-api-contracts` - proto schema validation and breaking-change detection between proto versions
- `testing-api-security` - interceptor bypass, metadata auth, TLS/mTLS verification
- `testing-websockets` - when gRPC-Web or WebSocket transport is used at the edge
- `mocking-network-and-time` - injecting latency/failures for deadline and retry tests
- `testing-with-testcontainers` - running a real gRPC server per test run
- `testing-database-state` - verifying side effects of RPCs

## Definition of Done

This skill is complete when:

- the proto contract was obtained and every method classified by streaming type
- unary methods were tested for happy path, validation errors with details, and status codes
- all streaming directions were tested for ordering, end-of-stream, mid-stream errors, and half-close
- deadlines and cancellation were verified to actually stop server work
- metadata auth (missing/wrong) returned the documented codes
- retry and message-size policies were observed
- checks are automated and assert code + message + details
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
