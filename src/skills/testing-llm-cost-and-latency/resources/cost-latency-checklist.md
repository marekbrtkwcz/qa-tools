# Cost and latency checklist

Per request, record: case id, prompt tokens, completion tokens, total, cost, latency ms.

## Aggregates

| Metric | Gate |
| --- | --- |
| p50 / p95 / p99 latency | p95 ≤ budget |
| mean and max cost per call | max ≤ cost cap |
| prompt tokens | ≤ max context budget |

## Context growth (multi-turn)

| Turn | Prompt tokens | Latency | Cost |
| --- | --- | --- | --- |
| 1, 5, 10, 20 | must not explode; linear growth expected, superlinear = finding |

## Gate rules

- baseline vs current on identical request set
- breach → block or dated waiver
- CI: smoke subset with hard assertions; full set nightly
