---
description: Check implementation evidence (code, PR/diff, screenshots, API responses, or a running app via Playwright MCP) against acceptance criteria and mark each criterion Met / Partial / Not Met / Untestable with cited evidence and a sign-off summary. Arguments: (1) acceptance criteria or user story text (or file path), (2) evidence to check against — PR/branch, code paths, running URL, screenshots, API responses. Read-only. For reviewing the criteria text itself, see the requirements-traceability skill.
---

# Verify acceptance criteria

If the `requirements-traceability` skill is available, load it before starting.

Verify whether the implementation satisfies the acceptance criteria. Both inputs come from the command arguments: criteria (or story/ticket text/file) and evidence (PR or diff, code paths, running URL, screenshots, API responses).

## Inputs

| Input | If missing |
|---|---|
| Acceptance criteria | Ask for them and stop until you have them |
| Implementation evidence | If the workspace has uncommitted changes or a branch ahead of `main`, use that diff and say so; otherwise ask |
| Environment under review | Ask only if a running URL is involved |

## Steps

1. **Normalize the criteria** into atomic items with stable IDs (`AC-1`, `AC-2`, …). Split compound criteria ("user can edit and delete") into separate items.
2. **Verify each item** against the evidence:
   - code or diff: find the code path that implements it and any test that asserts it
   - running URL: exercise the behaviour with the Playwright MCP tools (shipped by the qa-tools plugin in `mcp.json`) and record what you saw
   - screenshots / API responses: compare with the expected result
3. **Assign a status**: Met (evidence shows the behaviour), Partial (some cases/conditions missing), Not Met (evidence contradicts it or no implementation found), Untestable (criterion too vague or evidence unavailable). Cite evidence for every status.
4. **Summarize**: what is ready, what needs follow-up, what needs clarification.

## Output (Markdown)

```markdown
# Acceptance verification: <story>
Evidence checked: <PR/branch/URL/screenshots> · Environment: <env>

| ID | Criterion | Status | Evidence | Notes |
| AC-1 | … | Met | `src/cart/total.ts:42`, test `cart.spec.ts` "updates total" | |

## Sign-off summary
Met n · Partial n · Not Met n · Untestable n
Verdict: ready / not ready, because …

## Next step
```

End with one next step: fix (which items), clarify requirements (which questions), add tests (which items have no test), or re-verify later (what evidence is missing).

## Guardrails

- Do not invent product rules — a criterion needing an unstated rule is Untestable, with the question to ask.
- Do not mark Met from code that merely exists; show where it implements the behaviour or what you observed running.
- On a running app, test only environments you are authorized to use; ask before actions that create, change, or delete real data.
- Read-only: do not edit code or tests.
