# Soak test checklist

## Setup

| Item | Value |
| --- | --- |
| Load level (steady, realistic) | |
| Duration | |
| Metrics collection interval | |
| Alert thresholds | |

## Metrics to collect continuously

| Metric | What a finding looks like |
| --- | --- |
| Memory / heap | upward slope, no plateau |
| Connection pool usage | creeping to 100%, exhaustion errors |
| Thread count | unbounded growth |
| File descriptors | growth toward ulimit |
| Disk / log size | unbounded growth, rotation failing |
| Queue depth | steady growth (consumer slower than producer) |
| Latency p50/p95/p99 | drift upward over hours |
| Error rate | any non-zero sustained rate |

## Rules

- no restarts or config changes mid-soak; interventions invalidate the run
- compare first hour vs last hour; a slope within SLO can still be a leak
- alert → capture → continue if safe, or stop and file
