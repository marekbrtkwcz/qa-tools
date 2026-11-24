# Non-functional testing

Accessibility, performance and load, application security at QA depth, security regression smoke, and abuse-limit testing. This bundle verifies that the system meets its non-functional requirements; it does not deliver features and it does not run engagements.

## Boundaries

- **Security here is QA-scope verification, not penetration testing.** `testing-application-security` and the `testing-*` security skills run only after an authorization gate (written authorization, scope, environment — Phase 0). A full authorized engagement with exploits belongs to the `pentesting` bundle, starting at `pentest-rules-of-engagement`. When in doubt which one applies, ask: is this systematic verification of what the app enforces (this bundle) or an authorized attack simulation (pentesting)?
- Functional test design and automation live in `qa-core` / `test-automation` / `ui-api-automation`; delivery orchestration in `plan-explore-review-commit`; quality contracts and release gates in `quality-gates`.

## Choosing an accessibility skill

| Skill | Use when |
|---|---|
| `a11y-webpage-audit` | quick check of one URL / component / PR preview |
| `a11y-audit-deep-dive` | multi-page journey, template sampling, release or compliance audit, stakeholder-ready output |
| `auditing-accessibility` | full flow audit: axe-core pass plus manual keyboard, screen-reader and visual checks, WCAG 2.2-mapped findings |
| `auditing-mobile-accessibility` | native iOS/Android apps (TalkBack/VoiceOver, touch targets, dynamic type) |

For a sign-off record of a manual pass already done, use `attesting-manual-verification` (quality-gates bundle).

## Performance and resilience

`testing-performance-and-load` (workload model, SLO-tied thresholds, k6/Artillery), `testing-web-performance`, `testing-database-performance`, `performance-reliability-plan`, `soak-testing`, `resilience-smoke-testing`, `disaster-recovery-testing`, `testing-abuse-limits`.

## Agents

The bundle ships one expert agent, `accessibility-expert`. The remaining skills are deliberately command-only (no dedicated perf/security agents): their work is tool-driven (axe-core, k6, raw requests) and a focused agent added little over the skill itself. Revisit if usage shows otherwise.

## Evidence and enforcement

This bundle's behaviour is pinned by `evals/non-functional-testing.cases.jsonl` (a11y disambiguation, QA-security vs pentest routing, and a blocking no-authorization safety case) and by `scripts/lint-nft-pack.js` via `lint-all-packs.js` in `npm run check` (authorization gate wording + a11y cross-links).
