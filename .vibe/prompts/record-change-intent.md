---
description: Ensure a high-risk change carries a recorded reason — check commit trailers / ADRs / intent register for the range, classify each high-risk change (covered / undeclared / malformed / restated-diff / waived), and DRAFT an Intent trailer for the author to confirm (never commit it yourself). Argument: git range (default main..HEAD). See knowledge playwright-conventions (commit trailers) and quality-governance. For the full scope+coverage+intent gate use /scope-change-gate.
---

# Record the intent behind a change

Make sure this change carries a recorded, readable reason. Range: command argument (default `main..HEAD`).

## Inputs

| Input | Required | Notes |
|---|---|---|
| Change range | ✅ | e.g. `main..HEAD`, `HEAD~1..HEAD` |
| Why the change was made | ⬜ | if known, it becomes the rationale instead of a draft |
| Where rationale lives here | ⬜ | commit trailers, `docs/adr/`, issue tracker, `.qa/intent.md` |

## Steps

1. **Find the high-risk surface** in the range: new public exports, new endpoints, modified auth, schema/migration changes, removed guards/validation/tests, new external dependencies or calls, contract changes, `critical-path` modules. If none — say so and stop; no rationale is required.
2. **Look for existing rationale** in all four places:
   - `git log <range> --format='%(trailers:key=Intent,valueonly)'`
   - `git log <range> --format='%(trailers:key=Intent-Ref,valueonly)'`
   - an ADR under `docs/adr/` this change implements
   - a `.qa/intent.md` register entry covering the touched paths
3. **Classify each high-risk change**: covered / undeclared / malformed (quote the failing rule and corrected form) / restated-diff (rationale that only says what the diff says) / waived by a path-scoped waiver.
4. **Draft what is missing** — from the diff, branch name, linked ticket, surrounding code — answering: **why now** (trigger), **what constrained the shape**, **what was rejected** (the alternative someone will propose in six months).
5. **Hand the draft over** clearly marked as a draft, with the exact command to apply:

   ```bash
   git commit --amend --trailer "Intent: <rationale>"
   git commit --amend --trailer "Intent-Ref: ADR-0042"
   ```

## Rules

- Intent is **why, not what** — the diff already says what. `refactor: extract computeRefund` is a restated diff.
- **A human confirms it** — you draft, the author confirms or rewrites; a generated rationale nobody read is intent theatre. Never commit one as final.
- Report malformed separately from missing. Reject filler ("implements the ticket" carries nothing) — the test: would this help someone changing this code in six months?
- Only high-risk surface needs a record; say explicitly when a change needs nothing.
- Do not fetch tickets or URLs — validate reference shape only (offline-safe).
- **Never amend or rewrite commits yourself** — print the command; warn when commits are already pushed (amending rewrites history).

## Output

1. High-risk surface found, with the rule that made each item high-risk — or a clear "none, no rationale required"
2. Existing rationale and what it covers
3. Per change: covered / undeclared / malformed / restated / waived
4. Drafted rationales (marked as drafts) with the `git commit --amend --trailer` command for each
5. Squash-merge note: where the trailer must live to survive, and how to verify after merge
