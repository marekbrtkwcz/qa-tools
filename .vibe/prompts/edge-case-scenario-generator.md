---
description: Generate risk-based Given/When/Then edge-case scenarios for one feature with meaningful state (orders, payments, bookings) — boundaries, invalid state transitions, concurrency — saved to spec/edge-cases.md for human review BEFORE any test code (beyond-codegen stage 1). Arguments: feature/user story (required), application states (optional, e.g. "Pending, Paid, Cancelled"). Scenarios only, no automation code. See knowledge beyond-codegen and agent qa-tools:ai-architect.
---

# Edge-case scenario generator (BDD, stage 1 of beyond-codegen)

Arguments: feature or user story (arg 1, required — ask and stop if missing); application states (arg 2, optional — infer from feature/codebase, list as assumptions, ask for confirmation before writing).

Example: "As a user, I want to pay for my order by credit card" with order states `Pending Payment`, `Processing`, `Paid`, `Cancelled`.

## Steps

1. **Happy path** — the single standard successful flow.
2. **Negative and validation** — invalid format, missing required fields, auth failure, rejected input.
3. **Edge cases**: boundaries and limits (min/max, character limits, non-standard characters, type mismatch); concurrency (double submit, same action in two sessions, parallel updates); invalid state transitions (acting on a wrong or terminal state — paying an already-cancelled order).
4. Each scenario gets a risk rating (High/Medium/Low) and one line on why.
5. List the rules you could not infer and had to assume, for the product owner to confirm.

## Output — save to `spec/edge-cases.md` (ask before overwriting)

Header naming the feature and states used; scenarios grouped Happy path / Negative / Edge cases, each with ID, risk, and Given/When/Then:

```gherkin
# EC-04 · High · paying a cancelled order must not charge the card
Given an order in state "Cancelled"
When the user submits a valid card payment for that order
Then the payment is rejected with "Order is no longer payable"
And no charge is created
```

Plus an assumptions/open-questions section. Aim for ≥8 scenarios, mostly negative/edge. Stop when every state transition and input boundary you identified has at least one scenario; say which you deliberately left out. **Then stop and wait for human review** — this file is the contract for stage 2 (`/test-generator` or `/playwright-generate-test`).

## Guardrails

- Expected results come from stated rules; where a rule is unknown, write the question, not an invented behaviour.
- Scenarios only — no automation code.
