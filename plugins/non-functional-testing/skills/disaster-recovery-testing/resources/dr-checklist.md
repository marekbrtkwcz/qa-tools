# DR exercise checklist

Record per step: step, expected, observed, duration, deviation.

## Restore verification (scratch env)

| Check | Expected |
| --- | --- |
| Latest backup exists, complete, decryptable | yes |
| Restore completes | duration recorded |
| Row counts / key tables match source at backup time | exact match (or within RPO) |
| Core flows work on restored data | pass |

## Failover exercise (per runbook)

| Check | Expected |
| --- | --- |
| DNS/routing switch | traffic to secondary |
| App healthy in secondary | health checks green |
| Writes work in secondary | create/update verified |
| Monitoring/alerting live in secondary | alerts flow |
| Queued jobs resume | backlog drains |
| RTO measured | start→verified-service time vs target |
| RPO measured | data gap vs target |

## Fail-back

| Check | Expected |
| --- | --- |
| Rollback per runbook | primary serving |
| No split-brain | only one side accepts writes |
| Post-exercise: runbook updated | deviations documented |
