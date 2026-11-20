---
description: Review a user story, PRD, or acceptance criteria for testability defects BEFORE implementation — ambiguity, contradictions, missing states, untestable statements — returning clarifying questions and rewritten testable ACs. Argument: the requirements text or file path. See skill test-planning; agent qa-tools:qa-strategist does the testability review. To verify a finished build against criteria use /verify-acceptance-criteria.
---

# Review requirements for testability

Goal: find the defects in the requirements before they become defects in the product. Requirements: command argument (user story, PRD section, ACs, or file path).

Ask only for missing essentials: the requirements text/file, and where the feature sits in the product if unclear.

## Review passes — report what each finds

1. **Testability** — can each statement be verified with a concrete check? Flag vague terms ("fast", "user-friendly", "should work"), missing measurable thresholds, criteria describing implementation instead of observable behavior.
2. **Ambiguity and contradiction** — multiple readings, conflicting rules, undefined terms, unstated assumptions.
3. **Completeness of states** — error, empty, loading states, boundary values, limits never mentioned.
4. **Entity lifecycle** — for each object the feature creates/touches: read, update, delete, duplicate, orphan — is each transition specified?
5. **Roles and permissions** — who may perform each action; what other roles see or are denied.
6. **Cross-feature impact** — interactions with existing features, shared data, concurrent use.
7. **Non-functional gaps** — performance, security, accessibility, observability implied but never stated.

Do not invent product decisions — where a rule is missing, produce a question for the product owner, not an assumption presented as fact.

## Output (Markdown only)

- verdict: **ready for development / needs clarification**, with short justification
- findings grouped by review pass, each with severity (blocker / major / minor)
- numbered clarifying questions, ordered by how much each answer unblocks
- rewritten acceptance criteria for the worst offenders (Given/When/Then or checklist form)
- suggested follow-up: feed clarified requirements into `/manual-test-cases`, `/map-requirements-coverage`, or the `beyond-codegen` knowledge workflow
