---
description: Build a scenario matrix for a feature, user story, or API spec across six lenses (happy path, boundary, negative, OWASP Top 10, adversarial, data integrity), with an OWASP coverage table and open questions — before any test code is written. Argument: feature / user story / API spec (text, URL, or file path). Design only — scenarios are executed later, and only against systems you are authorized to test.
---

# QA strategy — scenario matrix

If the `test-planning` skill is available, load it; for the risk-sorted matrix and testability review you can also delegate to the `qa-tools:qa-strategist` subagent.

Produce a QA strategy for the feature given as the command argument that names concrete ways it can be abused, broken, or exploited. Prefer specific scenarios over general advice. If any required input is missing, ask before proceeding.

## Inputs to collect

| Input | Required | Notes |
|---|---|---|
| Feature / user story / API spec | ✅ | text, URL, or file path (command argument) |
| Authentication model | ⬜ | roles, token type, session mechanism |
| Environment | ⬜ | dev / stage / prod — affects risk tolerance |
| Known out-of-scope areas | ⬜ | e.g. "skip load testing", "third-party SSO only" |

## What to produce

1. **Attack surface map** — every input, state transition, auth boundary, external dependency, and business rule the feature exposes.
2. **Scenario matrix across all six lenses**: 🔄 happy path (one baseline only), 🔲 boundary/edge (min, max, off-by-one, null, overflow, Unicode), ❌ negative (invalid input, missing fields, wrong type, rejected transitions), 🔐 security (OWASP A01–A10: injection, IDOR, CSRF, auth bypass, SSRF), ⚔️ adversarial (races, replay, parameter tampering, privilege escalation), 💥 data integrity (concurrent writes, partial failure, stale cache, orphaned records). Table: `# | Surface | Lens | Scenario | Input/Action | Precondition | Expected Result | Risk 🔴🟠🟢`
3. **OWASP coverage table** — A01–A10 mapped to scenarios: ✅ covered / ⚠️ partial / ❌ not applicable (only with a one-line reason).
4. **Blind spots & open questions** — what must be answered before tests can be written.
5. **Recommended test types** — unit, API, E2E, fuzzing, DAST, contract testing, matched to the findings.

## Guardrails

- Ground every scenario in the provided input; where a rule is unknown, put it in Blind Spots instead of assuming behaviour.
- Return Markdown only; stop after section 5.
