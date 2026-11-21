---
description: Aggregate test results, coverage, lint/typecheck status, and flake rate into a single quality report saved to .qa/quality-report-<date>.md (or .html). No args = auto-detect sources (Playwright report, JUnit XML, coverage JSON, CI logs). Optional arg: path to a specific report file or previous .qa/quality-report-*.md for trend comparison. Read-only — never modifies tests or code. See skills reporting-and-metrics (knowledge), tracking-quality-trends.
---

# Generate quality report

Goal: one report that answers "is the project healthy right now?" — pass rate, flake rate, coverage, static checks — with a trend vs the previous report when available.

## Steps

1. **Collect sources** (auto-detect; skip what's missing, note it in the report):
   - Test results: `playwright-report/` (Playwright HTML/JSON), `results.xml` / `test-results/junit.xml` (JUnit), or a path given as argument.
   - Coverage: `coverage/coverage-summary.json` (Istanbul/nyc), `coverage/lcov.info`, or `npx nyc report --reporter=json-summary` output.
   - Static checks: run `npx tsc --noEmit` (count TS errors), `npx eslint . --format json` or `npx biome check .` (count lint issues) — only if the project has them configured; do not install anything.
   - Flake evidence: parse JUnit XML for tests that passed on retry; if `.qa/flaky-history.md` or previous reports exist, include trend.
   - Previous report: newest `.qa/quality-report-*.md` for before/after comparison.

2. **Compute metrics**:
   - `pass_rate = passed / (passed + failed + skipped)`
   - `flake_rate = flaky / total` (flaky = needed retry or in quarantine)
   - `coverage` lines/branches/functions from coverage summary (if present)
   - `ts_errors`, `lint_errors` counts
   - `run_duration` from report metadata if available

3. **Trend** (only if a previous report exists): per metric show `previous → current → Δ` and arrow (better/worse/same). Use the limit/current/goal framing from the `tracking-quality-trends` skill if goals are recorded in `.qa/quality-contract.md`.

4. **Write the report** to `.qa/quality-report-<YYYY-MM-DD>.md`:

```markdown
# Quality Report — YYYY-MM-DD

## Summary
One paragraph: overall health, the one number that matters most, the top risk.

## Metrics
| Metric | Current | Previous | Δ | Goal (if set) | Status |
|---|---|---|---|---|---|
| Pass rate | 94.2% (188/200) | 96.0% | -1.8pp | ≥ 98% | ⚠️ below goal |
| Flake rate | 3.5% (7/200) | 2.0% | +1.5pp | ≤ 1% | ❌ above goal |
| Coverage (lines) | 71% | 68% | +3pp | ≥ 80% | ⚠️ below goal |
| TS errors | 0 | 0 | — | 0 | ✅ |
| Lint errors | 12 | 5 | +7 | 0 | ❌ regressed |

## What changed since last report
- Bullet list of notable movements (new failures, fixed flakes, coverage gains/losses).

## Top risks (ranked)
1. ...
2. ...
3. ...

## Recommended actions
Mapped to commands: /fix-tests, /stabilize-flaky-tests, /tech-debt-audit, /regression-scope, etc.

## Sources used
List of files parsed + timestamp. What was NOT available (and therefore not in the report).
```

## Constraints

- Read-only: never edit tests, config, or code. The report is the only artifact written.
- If no test results are found, say so and produce a report with only the available metrics (coverage, static checks) — do not invent numbers.
- Every number must have a denominator (e.g. `188/200`, not just `94%`).
- If the argument is a previous report file, use it as the baseline for trend and still collect fresh current data.
- Cite source file for every metric (e.g. `results.xml`, `coverage-summary.json`).
