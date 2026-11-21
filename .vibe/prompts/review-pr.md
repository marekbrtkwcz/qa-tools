---
description: Quality-focused PR review. Argument: PR number/URL or a diff (git diff / gh pr diff). Checks test coverage of the change, convention compliance (getBy* selectors, expect()-only assertions, no waitForTimeout, cleanup in afterEach), flaky risk, API/contract changes, negative cases. Output: severity-ranked findings with file:line and an approve/comment/request-changes recommendation. Read-only — never edits code. See skills code-review-advanced, unslop-tests, quality-gates.
---

# Review PR for quality

Goal: one PR review from the quality perspective — what the change does, what tests prove it, and what is missing or risky. Read-only: report findings, never modify code.

Argument: PR number or URL (fetch with `gh pr diff` / `gh pr view`), or a pasted diff. If no argument is given, review the current branch's diff against main (`git diff main...HEAD`).

If the `code-review-advanced` skill is available, load it before starting.

## Steps

1. **Understand the change**: read the PR description and the diff. Identify the riskiest surfaces touched (auth, payments, persistence, CI config, shared fixtures, hot paths).
2. **Map tests to the change**: which test files were added/modified? Do they cover the changed behavior — happy path AND negative cases? Is there a test that would fail if the change were reverted (a real regression guard, not a tautology)?
3. **Check conventions** on new/changed test code: `getByRole`/`getByLabel`/`getByText`/`getByTestId` selectors only (no CSS/XPath), assertions only via `await expect(...)`, no `waitForTimeout`, each test independent, created data cleaned up in `afterEach`, names `should <result> when <condition>`.
4. **Check flaky risk**: new waits without condition, order dependence, shared state, fixed sleeps, timing assumptions.
5. **Check API/contract impact**: changed request/response shapes, versioning headers, OpenAPI spec updated? Are contract tests affected?
6. **Check CI impact**: new/changed workflow files, gate blocking-ness, artifact uploads.
7. **Rank findings** by severity and write the verdict.

## Output (Markdown)

- one-paragraph summary of the change + verdict: **approve** / **comment** / **request changes**
- findings table: `Severity | file:line | finding | recommended first step` — severities: Blocker / High / Medium / Low / Note
- what is done well (1–3 bullets)
- suggested next commands: `/regression-scope` for retest pack, `/analyze-test-results` on the PR's CI run, `/verify-acceptance-criteria` if ACs are linked

## Constraints

- Read-only. Never edit, commit, or push anything.
- Base every finding on the actual diff — cite `file:line`, never invent locations.
- Distinguish facts from suspicions; label hypotheses as such.
- If the diff cannot be fetched (no gh auth, no network), say so and ask for a pasted diff instead of guessing.
