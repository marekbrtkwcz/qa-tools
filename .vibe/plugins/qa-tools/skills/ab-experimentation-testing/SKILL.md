---
name: ab-experimentation-testing
description: Load this skill when validating A/B tests and experiments before and after launch — checking randomization quality, assignment consistency, metric instrumentation, guardrail metrics, and statistical sanity of results. Covers bucketing (stable user assignment, no flicker), event tracking completeness, peeking and multiple-comparison pitfalls, segment cuts, and deciding ship/kill/iterate. Complements risk-based-testing and observability-testing (metrics pipelines).
user-invocable: true
---

# 🧪 A/B Test & Experimentation Validation

An A/B test is only as good as its **assignment** and its **measurement**. A broken experiment ships a bad variant to everyone, or worse, ships a good one while the dashboard says it failed. Validate both the mechanics and the analysis.

Use it when: launching an experiment, reading results, or auditing an experimentation platform setup.

## 🚫 When NOT to use

- Testing the feature itself → normal suites
- Business decision whether to run an experiment → that's product analytics, not QA

## 🎲 Step 1 — Validate assignment (randomization)

- **Consistency**: the same user must land in the same variant across sessions, devices (via account ID), and page reloads — otherwise users flicker between variants and results are garbage. Test: log in, note variant, clear cookies / new device / reload → same variant
- **Balance**: over a large sample, variant sizes match the configured split (50/50, 90/10) within tolerance — a skewed split signals broken bucketing
- **No leakage**: users in the control group must not see any trace of the variant (no flag UI, no extra network calls revealing the experiment)
- **Edge cases**: logged-out users, users with ad-blockers, users in excluded segments — all must be assigned deterministically or excluded explicitly

## 📏 Step 2 — Validate instrumentation before launch

- Every metric event fires exactly once per user action (no double-counting on retry/refresh — dedupe by event ID)
- Conversion funnel events exist for every step; a missing middle step silently breaks the funnel
- Test events with a known test user, then verify they appear in the analytics pipeline (`observability-testing`)
- **Guardrail metrics** defined and tracked: latency, error rate, revenue per user — a variant that wins on the primary metric but tanks a guardrail is a kill

## 📊 Step 3 — Validate the analysis

- **Sample ratio mismatch (SRM)**: observed variant ratio vs expected — if they differ beyond chance, assignment is broken; do not trust any result from that run
- **Peeking**: repeatedly checking a running test inflates false positives — use fixed horizon or sequential testing (alpha spending); if someone peeked, say so in the report
- **Multiple comparisons**: testing 10 metrics × 3 segments, something will be "significant" by chance — pre-register the primary metric and treat the rest as exploratory
- **Minimum detectable effect (MDE)** was calculated before launch and the test ran long enough to detect it — a test stopped early for a "winner" is not evidence
- **Segment cuts**: a win overall can be a loss in a segment (e.g. mobile) — check segments before shipping, and never ship a variant that harms a protected segment

## 🏁 Step 4 — Ship / kill / iterate decision

- Ship only if: SRM clean, primary metric significant at the pre-registered horizon, guardrails flat or better, no harmful segment
- Report in countable units: effect size with confidence interval, sample sizes per variant, duration, guardrail deltas — not "variant B is better"
- Archive the experiment record: hypothesis, assignment config, metrics, result, decision — so future tests learn from it (`tracking-quality-trends`)
