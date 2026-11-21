---
name: test-reporting
description: Load this skill when turning test runs into reports different audiences actually act on — developers, release managers, and leadership. Covers report structure (result and blocker in the first two lines, one decision per report), choosing metrics honestly (pass rate, flake rate, duration, coverage — with denominators, see analyzing-quality-metrics), per-audience views (what a dev needs vs what a release manager needs), trend context over point-in-time (tracking-quality-trends), HTML/JSON/Allure Playwright reports, CI annotations, and dashboards that don't become vanity metrics. Pairs with communicating-quality-findings for the narrative.
user-invocable: true
---

# 📊 Test Reporting & Dashboards

A test report exists to **drive a decision**, not to say tests ran. If nobody acts on it, it is noise. Different audiences need different views of the same run — build one data source, several views.

Use it when: setting up CI reporting, building a quality dashboard, preparing a release readout, or when "the tests are green" stops being believed.

## 🚫 When NOT to use

- Interpreting what a metric means or whether it can be gamed → `analyzing-quality-metrics`
- Writing the narrative around findings → `communicating-quality-findings`
- Trending metrics over time → `tracking-quality-trends`

## 🏗️ One data source, three audiences

| Audience | Question they ask | View |
|---|---|---|
| Developer | "did MY change break something, and where?" | failing test, diff since last green, stack trace, trace viewer link |
| Release manager | "can we ship? what is the risk?" | go/no-go summary, open blockers, residual risk, waiver list with expiries (`quality-gates`) |
| Leadership / stakeholder | "is quality getting better or worse?" | trend lines with limit/current/goal, not a single green checkmark |

## 📐 Report structure (every report)

1. **First two lines**: result + blocker — "42 failed, release blocked by auth suite" not "tests ran"
2. **One decision per report** — what should the reader decide now?
3. Findings ordered by cost to fix, each with a first step
4. Every number has a denominator: "97% pass" = 970/1000, over what time window, vs which baseline
5. Long artifact in a file (HTML/JSON report, dashboard link); decisions in the message

## 📈 Metrics worth showing (and how to show them honestly)

- **Pass rate** — with flake rate next to it; a 99% pass rate with 15% flake is worse than 90% deterministic
- **Flake rate per test** — top offenders list, not an average
- **Duration / queue time** — CI feedback latency; slow suites get bypassed
- **Coverage of changed code** — diff coverage, not whole-repo (see `quality-gates`)
- **MTTR of failures** — how fast red turns green again
- Never show a metric without its baseline and trend — a bare "87%" is meaningless (`analyzing-quality-metrics`)

## 🛠️ Tooling

- Playwright: HTML report (default), JSON report for downstream tooling, JUnit XML for CI annotations; attach traces/screenshots/videos on failure — a report without artifacts makes devs re-run locally
- CI: annotate PR diffs with failures (GitHub Actions annotations), fail the job on gate metrics, upload report as artifact with retention
- Dashboard: limit/current/goal per metric (from `tracking-quality-trends`), auto-refresh from the JSON report, one screen — if it doesn't fit one screen, it won't be read

## ⚠️ Anti-patterns

- Vanity dashboards: total tests count, lines of test code, "coverage %" with no definition
- Green checkmark culture: hiding retries so the build looks green (retries must be visible — a retried pass is a flake signal, `stabilizing-flaky-tests`)
- Reports nobody reads: if a weekly report produces zero decisions for a month, change it or stop sending it
