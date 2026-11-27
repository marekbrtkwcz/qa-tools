---
name: verify-acceptance-criteria
description: Checks implementation evidence (code, PR, screenshots, API responses, or a running app) against acceptance criteria and marks each criterion Met, Partial, Not Met, or Untestable, with cited evidence and a sign-off summary. Use when a story is ready for review or sign-off, or when someone asks whether a feature does what was agreed. This is the quick verification-matrix form of the verifying-acceptance-criteria skill; to review criteria before implementation use review-requirements, and for coverage planning use requirements-test-coverage-mapper or tracing-requirements-to-code.
argument-hint: "[criteria] [evidence]"
disable-model-invocation: true
---

# Verify acceptance criteria

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `criteria`: acceptance criteria, user story, or ticket text (or a file path)
- `evidence`: what to check against: PR or diff, code paths, a running URL, screenshots, or API responses

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `verifying-acceptance-criteria` skill is installed, load it before starting.

Verify whether the implementation in <evidence> satisfies the acceptance criteria in <criteria>.

## Inputs to collect

| Input | If missing |
| --- | --- |
| Acceptance criteria: <criteria> | Ask for them and stop until you have them |
| Implementation evidence: <evidence> | If the workspace has uncommitted changes or a branch ahead of `main`, use that diff and say so; otherwise ask |
| Environment under review | Ask only if a running URL is involved |

## Steps

1. **Normalize the criteria** into atomic items with stable IDs (`AC-1`, `AC-2`, …). Split compound criteria ("user can edit and delete") into separate items.
2. **Verify each item** against the evidence:
   - code or diff: find the code path that implements it, and any test that asserts it
   - running URL: exercise the behaviour with Playwright and record what you saw
   - screenshots or API responses: compare them with the expected result
3. **Assign a status**: Met (evidence shows the behaviour), Partial (some cases or conditions missing), Not Met (evidence contradicts it or no implementation found), Untestable (the criterion is too vague to check, or the needed evidence is unavailable). Cite the evidence for every status.
4. **Summarize** what is ready, what needs follow-up, and what needs clarification.

## Output

Return Markdown only:

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

- Do not invent product rules. A criterion that needs a rule nobody stated is Untestable, with the question to ask.
- Do not mark an item Met from code that merely exists; show where it implements the behaviour, or what you observed running.
- On a running app, test only environments you are authorized to use, and ask before actions that create, change, or delete real data.
- Read-only: do not edit code or tests.
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
