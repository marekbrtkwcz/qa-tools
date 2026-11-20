---
description: Turn a feature description, acceptance criteria, exploratory notes, or a test plan (e.g. .qa/test-plan.md from /create-test-plan) into immediately executable manual test cases — table with ID, area, priority, type, preconditions, steps, expected result, automation candidate. Argument: feature/story/ACs/notes or plan file; optional URL to inspect via Playwright MCP. See skill test-planning. For code-derived cases see derive-test-cases-from-code (not ported); for live-app generated Playwright tests use /playwright-generate-test.
---

# Generate manual test cases

If the `test-planning` skill is available, load it before starting. Can delegate to `qa-tools:ui-test-planner`.

Goal: manual test cases a tester can execute immediately. Input: feature description, story, ACs, notes, or an existing plan (command argument); optional live URL to sharpen cases via Playwright MCP.

Ask only for missing essentials: the input source, URL/system under test if available, target environment and roles if they affect behavior, explicit out-of-scope areas.

If a live URL is provided, inspect the flow with Playwright MCP to sharpen the cases. Explore only apps you are authorized to test; do not submit forms or change data without confirmation.

## Steps

1. **Validate readiness** — if expected behavior is unclear, list the gaps and ask targeted questions; do not invent product rules.
2. **Normalize** the input into functional areas and stable scenario IDs.
3. **Generate the cases** covering, for high-risk areas: positive, negative, boundary, permission, recovery, and accessibility-smoke.
4. **Mark each case**: priority, case type, automation candidate.
5. End with open questions/assumptions and the best candidates to hand to `/playwright-generate-test`.

## Output (Markdown table)

`ID | Area | Priority | Type | Preconditions | Steps | Expected Result | Automation Candidate | Notes`
