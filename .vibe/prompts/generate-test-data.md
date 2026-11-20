---
description: Design a reusable test data catalog — valid baselines, boundary values, invalid inputs, role/state combinations — from requirements, constraints, a test plan, or the codebase. Argument: feature/entities/fields involved; optional constraints, target use (manual/automation/both), state/role/environment dependencies. Designs the catalog only — does not write fixture/seed files unless asked. Synthetic data only (test cards, example.com). See skill test-data-management.
---

# Generate test data catalog

If the `test-data-management` skill is available, load it before starting.

Goal: a reusable test data catalog, not a random list of sample values. Input: feature/entities/fields (command argument) plus optional constraints, target use, and state/role/environment dependencies. If constraints are incomplete, derive what you can from the plan/criteria/codebase and list the rest as assumptions.

## Steps

1. Identify key entities and field constraints.
2. Generate grouped data for: valid baseline use · boundary values · invalid formats/rejected inputs · role and state combinations · temporal/expiry-sensitive values when relevant.
3. Add setup, cleanup, and privacy notes.
4. Highlight which data sets are best suited for automation fixtures.

## Output (Markdown, grouped tables)

`ID | Group | Field values | Purpose | Expected outcome | Fixture-ready?`

Stable data-set IDs, clear purpose notes.

## Constraints

- **Synthetic data only** — never real customer data, real card numbers, or production records; use documented test values (e.g. provider test cards) and reserved domains like `example.com`.
- Mark every value derived from an assumption rather than a stated constraint.
- Do not write fixture or seed files unless explicitly asked — this command designs the catalog.
