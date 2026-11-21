---
name: canary-production-testing
description: Load this skill when validating safe rollout to production — canary releases, ring deployments, blue/green, and testing in production (TiP) with real traffic. Covers canary analysis (compare metrics vs baseline, guardrails, automatic rollback triggers), synthetic checks against prod, feature-flag-gated rollouts (feature-flags-testing), dark launches, and safe TiP practices (read-only probes, shadow traffic, no real writes without safeguards). Complements observability-testing (signals) and quality-gates (go/no-go).
user-invocable: true
---

# 🐤 Canary & Testing in Production

Production is the only environment with real users, real data, and real load. Canary deployment makes that safe: ship to a small slice, compare against the baseline, and roll back automatically on regression — before everyone is affected.

Use it when: setting up a canary/ring pipeline, analyzing canary metrics, running safe production probes, or dark-launching a feature.

## 🚫 When NOT to use

- Pre-production staging tests → normal suites
- Destructive experiments on real user data → never; use shadow/synthetic traffic instead
- If you have no rollback mechanism — fix that first; a canary without rollback is just a slow deploy

## 🏗️ Rollout strategies and what to verify

| Strategy | What to verify |
|---|---|
| **Canary (1% → 10% → 50% → 100%)** | metrics comparison per stage, auto-rollback triggers, stage duration long enough for signals to appear |
| **Ring (internal → beta → all)** | each ring's users see consistent behavior; ring membership correct |
| **Blue/green** | traffic switch is atomic; no mixed-version requests during switch; old version kept warm for instant rollback |
| **Dark launch / shadow traffic** | new code processes real requests but responses are discarded — compare latency/error rate of shadow vs live path |

## 📊 Canary analysis — compare, don't eyeball

For each canary stage, compare canary vs baseline on:

- **Guardrail metrics**: error rate, latency p95/p99, saturation — auto-rollback if canary exceeds baseline by a defined threshold
- **Business metrics**: conversion, revenue per user — these lag; do not promote on guardrails alone before the lag window passes
- **Segment cuts**: canary regressions often hide in one segment (mobile, one region) — check segments, not just the average
- Use `observability-testing` to query the signals; define the comparison queries **before** the rollout, not during the incident

## 🤖 Automatic rollback

- Rollback triggers must be defined in config and tested (inject a failing canary on purpose in staging — chaos-test the rollout pipeline itself, `chaos-testing`)
- Rollback must be fast (minutes) and verified: after rollback, confirm metrics return to baseline and no mixed state remains
- A manual "someone watches the dashboard" gate is not a canary — it's a deploy with extra steps

## 🔬 Safe testing in production (TiP)

- **Synthetic checks**: scheduled probes hitting prod endpoints (login, checkout) from multiple regions — assert 2xx + latency + payload shape, alert on breach
- **Read-only probes**: safe to run anytime (GETs, health endpoints). **Never** run write/delete probes against prod without a dedicated test tenant and data isolation
- **Shadow traffic**: duplicate real requests to the new version without returning its response — zero user impact, real data fidelity
- **Feature-flag gated rollout**: combine with `feature-flags-testing` — flag controls exposure, canary controls infrastructure load
- **Kill switch drill**: verify the kill switch works in prod conditions before you need it (`feature-flags-testing`)

## 📋 Rollout record

For each release: strategy, stages and durations, guardrails and thresholds, rollback triggers, canary-vs-baseline results per stage, decision (promote/rollback) and who made it. This is the evidence trail for `quality-gates` and postmortems.
