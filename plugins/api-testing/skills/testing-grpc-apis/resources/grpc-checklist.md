# gRPC check matrix

Run per method. Record: check, request, observed status/message, result.

## Unary

| Check | Expected |
| --- | --- |
| Happy path | OK, response fields correct |
| Missing required field / wrong type | InvalidArgument + details naming the field |
| Unknown resource id | NotFound |
| Wrong tenant / no permission | PermissionDenied |
| No auth metadata | Unauthenticated |
| Deadline shorter than processing | DeadlineExceeded; server work actually cancelled |
| Client cancel mid-call | server observes cancellation; no leaked work |
| Oversized message | ResourceExhausted |

## Streaming

| Type | Check | Expected |
| --- | --- | --- |
| Server-streaming | N messages then end | in order, then OK |
| Server-streaming | empty result | zero messages, OK (valid) |
| Server-streaming | error mid-stream | stream ends with the error code, not OK |
| Client-streaming | N requests → one response | response correct |
| Client-streaming | empty client stream | per design (error or default response) |
| Bidi | interleaved both directions | order per direction preserved |
| Bidi | client half-close | server finishes, closes with OK |
| Bidi | server early close | client sees the status code |
| Server-streaming | slow consumer | flow control applies; no unbounded server buffer |

## Metadata and policy

| Check | Expected |
| --- | --- |
| Missing auth metadata | Unauthenticated |
| Wrong tenant header | PermissionDenied |
| Transient Unavailable | retried with backoff per policy |
| Permanent error (InvalidArgument) | not retried |
