# Microservices seam and flow checklist

Run per seam and per critical flow. Record: seam/flow, check, result.

## Seams

| Check | How |
| --- | --- |
| HTTP/gRPC seam has contract verification | pact verify / schema validation in CI |
| Event topic has schema + compatibility rule | registry check; breaking change classified |
| Provider deploy gated | can-i-deploy passes before merge/deploy |
| Service virtualized in isolated tests | stubs at the boundary; drift guarded by contract tests |

## End-to-end flows

| Check | Assert |
| --- | --- |
| Happy path across services | user-visible outcome correct |
| Side effects per service | DB rows / events verified (`testing-database-state`) |
| Trace continuity | one trace id across all spans, no missing segments |
| Fault at one seam | flow degrades per contract; no cascade |

## Cross-service consistency

| Check | Assert |
| --- | --- |
| Eventual-consistency pair | poll downstream state until it matches, within timeout; record convergence time |
| Duplicate event across services | final state still correct |
| Out-of-order delivery | final state still correct |

## Environment

| Check | How |
| --- | --- |
| Composed test environment reproducible | compose / testcontainers / test namespace, one command |
| No production data or topics used | synthetic fixtures only |
