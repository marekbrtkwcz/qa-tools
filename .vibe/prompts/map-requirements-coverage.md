---
description: Build a requirements traceability matrix from a PRD / user stories / acceptance criteria against existing tests — what is covered, at which level, what is missing, which gaps carry the most risk; saved to .qa/requirements-coverage.md. Argument: requirements source (text or file path). A test that merely touches the feature does not count — it must assert the required behavior. See skill requirements-traceability. For verifying a finished build against criteria use /verify-acceptance-criteria.
---

# Map requirements to coverage

If the `requirements-traceability` skill is available, load it and follow its workflow.

Goal: answer with evidence which requirements are actually covered by tests, and which only look covered. Requirements source: command argument (PRD / stories / ACs, text or file path).

Ask only for missing essentials: the requirements source, where tests live (if not discoverable), scope boundaries (explicitly out of scope).

## Steps

1. **Normalize** requirements into atomic, testable statements with stable IDs; split compound ones.
2. **Search the workspace** for tests related to each statement: unit, API, E2E, and manual test case documents.
3. **Build the matrix**: each requirement marked **covered / partially covered / not covered**, with covering test files cited as evidence. A test that merely touches the feature is NOT coverage — it must assert the required behavior.
4. **Classify each gap by risk**: business impact × likelihood of regression.
5. **Recommend** for each significant gap the cheapest test level that closes it, and whether it is an automation candidate.

## Output (Markdown, saved to `.qa/requirements-coverage.md`)

- coverage summary: N covered / N partial / N not covered
- matrix: `Req ID | Requirement | Coverage | Evidence (test files) | Level | Risk | Recommended action`
- top gaps to close first
- open questions where requirement intent was unclear (candidates for `/review-requirements`)
