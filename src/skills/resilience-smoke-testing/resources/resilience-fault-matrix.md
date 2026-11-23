# Resilience fault matrix

Apply one fault at a time, in a non-production environment. Record: dependency, fault, observed, expected, recovery time, result.

## Faults per dependency type

| Fault | How to inject safely | Expected behaviour |
| --- | --- | --- |
| Slow (beyond timeout) | latency proxy / toxiproxy / `mocking-network-and-time` in tests | request fails within timeout budget; user sees a clear error or fallback, never a hang |
| Down (connection refused) | block port / stop container / firewall drop | failover, cache, or clean error; no stack-trace leak |
| 5xx storm | stub endpoint returning 500s | retry with growing backoff; circuit breaker opens after threshold; half-open probe after cooldown |
| Malformed payload | truncated JSON / wrong type | parse error handled; no crash, no poisoned cache entry |
| Partial failure | one of N calls fails | partial result marked as such, or operation fails cleanly — never silent wrong data |

## Circuit breaker lifecycle

| State | Verify |
| --- | --- |
| Closed (normal) | calls flow |
| Open (after threshold) | calls fail fast without hitting the dependency; user sees the fallback |
| Half-open (after cooldown) | probe call allowed; success closes, failure re-opens |

## Recovery checks (run after every fault)

- fallback disengages once the dependency is healthy — no stale cached data served indefinitely
- circuit breaker closes and normal traffic resumes within the stated window
- queued/backlogged work drains; record drain time
- latency returns to baseline (compare with pre-fault measurement)
