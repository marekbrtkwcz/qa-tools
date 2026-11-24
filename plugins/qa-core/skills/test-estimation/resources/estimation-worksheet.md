# Estimation worksheet

Fill per scope item. Anchors are starting points — recalibrate with your actuals.

## Per testable unit

| Unit | Risk (H/M/L) | Complexity (H/M/L) | Design h | Execution h |
| --- | --- | --- | --- | --- |
| | | | M≈1, H≈3 | M≈0.5, H≈2 |

Risk raises defect expectation; complexity raises design+execution.

## Activity overheads

| Activity | Estimate |
| --- | --- |
| Environment + test data setup | fixed per cycle (e.g. 0.5–2 h) or % of execution |
| Flaky re-runs buffer | 10–20% of execution |
| Defects | expected count = Σ(risk) × historical defect rate; each ≈ 0.5–2 h triage+verify |
| Regression pass | per `analyzing-regression-scope` output |
| Reporting + sign-off | fixed (e.g. 1–4 h per release) |

## Output format

- total range (low–high hours/days)
- assumptions list (environment stable, no scope change, automation as stated)
- exclusions (perf, security, a11y unless estimated separately)
- actuals recorded afterwards for recalibration
