# Production monitoring checklist

Per feature and per prompt version:

| Metric | Source | Alert |
| --- | --- | --- |
| Quality score (sampled eval re-run) | sampled requests through eval checks | sustained drop vs pre-launch baseline |
| Guardrail trigger rate | guardrail verdicts | ~0 (not wired) or spike (attack/regression) |
| Refusal / fallback rate | model/guardrail outcomes | trend change |
| p95 latency, cost per call | request logs | breach of budget |
| User feedback (thumbs, regenerate, abandon) | feedback events | negative-rate spike |
| Token usage distribution | request logs | context growth drift |

## Operating rules

- sample, don't log full traces for every request
- segment by prompt version and model to separate provider drift from data drift
- weekly dashboard review with named alert owners
- sampled failures → new golden cases in the eval suite
