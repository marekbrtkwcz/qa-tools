---
name: feature-flags-testing
description: Load this skill when testing features behind feature flags / toggles — verifying behavior with the flag on, off, and in every rollout combination (targeting rules, percentage rollouts, kill switches). Covers flag state matrix testing, stale flag cleanup, flag evaluation in tests (deterministic overrides, no random rollouts in CI), permission and targeting rules, and kill-switch drills. Use with risk-based-testing (flags are a mitigation) and quality-gates.
user-invocable: true
---

# 🚩 Feature Flags Testing

A feature flag changes runtime behavior without a deploy. That makes it both a rollout tool and a **risk multiplier**: a wrong flag state ships broken behavior to real users instantly. Testing flags means testing **every reachable state**, not just on/off.

Use it when: adding/changing a flag, testing a flagged feature, doing a percentage rollout, or verifying a kill switch.

## 🚫 When NOT to use

- Testing the feature itself with the flag permanently on → normal test suites
- Flag platform administration (creating flags in LaunchDarkly etc.) → vendor docs

## 🧮 Step 1 — Build the state matrix

List every flag that affects the feature under test, then enumerate combinations that matter:

| Flag A | Flag B | Expected behavior | Test |
|---|---|---|---|
| on | on | new flow + new billing | ✅ |
| on | off | new flow, old billing | ✅ |
| off | on | old flow, new billing (often forgotten!) | ✅ |
| off | off | legacy behavior | ✅ regression baseline |

Do not test all 2ⁿ combinations — test the ones with **distinct user-visible behavior** and the ones your targeting rules can actually produce.

## 🎯 Step 2 — Test targeting and rollout rules

- **User/segment targeting**: flag on for "internal users" must not leak to external — test with both personas
- **Percentage rollout (e.g. 10%)**: verify assignment is stable per user (same user stays in/out across requests — otherwise users flicker between versions) and roughly matches the percentage over a sample
- **Kill switch**: flag off must disable the feature **immediately** (respect cache/TTL of flag evaluation — test the worst-case propagation delay and document it)

## 🧪 Step 3 — Make tests deterministic

- Never let CI tests depend on the live flag state or a random rollout — override flags in test setup (SDK override, env var, test config)
- One test per flag combination: parametrize, don't branch inside the test
- Flag evaluation itself is code: test the fallback when the flag service is **unreachable** (fail-open vs fail-closed must be a deliberate, documented choice — usually fail-closed for risky features)

## 🧹 Step 4 — Flag hygiene (debt prevention)

- Every flag has an owner and an expiry date; expired flags are removed, not left "just in case"
- Test that removing a flag leaves no dead code paths: after flag removal, the "on" branch becomes the only branch — run the full suite against the cleaned code
- Watch for **flag interactions**: two flags that each work alone but conflict together (test the matrix from Step 1 catches this)

## 📋 Evidence

Record per flag: states tested, targeting rules verified, kill-switch drill result with propagation time, owner, expiry. A flag without a tested kill switch is an unmitigated risk — feed it into `risk-based-testing`.
