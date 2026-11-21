---
name: quality-coaching
description: Load this skill when building quality culture in a team — shifting quality left so defects are prevented early, not found late. Covers quality coaching practices (pairing on tests, review rituals, blameless postmortems), making quality visible (shared metrics, not blame), defining team quality agreements, onboarding devs into the test suite (documenting-test-suites), reducing reliance on a single QA gatekeeper, and measuring whether practices actually stick (quality-governance). Complements quality-gates (the what) — this is the how and the culture.
user-invocable: true
---

# 🌱 Quality Coaching & Shift-Left

Shift-left means **finding defects where they are cheapest** — in design and code review, not in production. Coaching is how a team internalizes that: practices, rituals, and visible metrics, not a QA gatekeeper at the end.

Use it when: quality depends on one person, tests are written only after features ship, postmortems blame people, or leadership asks "why is quality slow/flaky" and nobody has evidence.

## 🚫 When NOT to use

- Setting the actual gate thresholds and CI enforcement → `quality-gates`
- Analyzing whether your metrics are honest → `analyzing-quality-metrics`
- Fixing a specific flaky/failing test → `stabilizing-flaky-tests` / `diagnosing-test-failures`

## 🧑‍🏫 Core coaching practices

- **Pair on tests**: QA + dev write the first tests of a feature together — knowledge transfers, tests land with the code, not after
- **Three Amigos / refinement**: dev + QA + PO walk a story before coding — acceptance criteria become test cases *before* implementation (`test-planning`, `requirements-traceability`)
- **Review tests like code**: test code gets the same review bar as product code — see `code-review-advanced` and `unslop-tests` (no tautological assertions, no mock-only tests)
- **Blameless postmortems**: the question is "what in the system let this happen", never "who" — a blamed person hides the next incident
- **Quality agreements**: the team writes down its own rules (e.g. "every PR touching auth has an API test") — written agreements beat tribal knowledge

## 👁️ Make quality visible, not personal

- Share the same dashboard with the team (`test-reporting`): flake rate, diff coverage, MTTR — trends, not leaderboards
- Celebrate prevented defects ("this review caught it") as much as found ones
- Rotate the "quality buddy" role per sprint so no single gatekeeper

## 🧭 Where to shift left, in order

1. **Design/requirements** — ambiguity is the most expensive defect; clarify before building
2. **Code review** — tests in the same PR as the feature
3. **CI on every PR** — smoke fast, full on merge (`ci-cd-pipelines`, `quality-gates`)
4. **Pre-production** — exploratory sessions on the release candidate (`exploratory-testing`)
5. **Production** — monitoring and canary detect what everything above missed (`observability-testing`); feed incidents back into 1–4

## 📏 Did it work? Measure the practice, not the person

- % PRs with tests, diff coverage trend, MTTR trend, flake rate trend, escaped defects per release — over quarters (`tracking-quality-trends`)
- If a practice isn't adopted in a quarter, drop it or change it — a ritual nobody follows is theater (see `quality-governance` for detecting enforced vs real practices)
- Coach with evidence: "our MTTR went from 2 days to 4 hours after we added X" beats "we should test more"
