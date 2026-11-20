---
description: Scope and gate a change before merge — tag the diff by file AND hunk, resolve relevant quality practices, verify changed-line coverage and recorded intent, return severity-ranked findings (BLOCK/warn/nudge/info) with remediation briefs. Argument: base ref to diff against (default main; HEAD for uncommitted). Read-only — findings and briefs only, no fixes. For only drafting missing rationale use /record-change-intent; for a manual retest pack use /regression-scope. See skills quality-gates + knowledge quality-governance; can delegate to qa-tools:change-gate-reviewer.
---

# Scope and gate this change

Review the change between the base ref (command argument, default `main`; `HEAD` for uncommitted work) and HEAD: scope it, verify it, return actionable findings.

See skills `quality-gates` and knowledge `quality-governance`; can delegate to `qa-tools:change-gate-reviewer`.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Base ref | ✅ | command argument, e.g. `main` |
| Coverage artifact | ⬜ | path to LCOV/Cobertura or the command producing it |
| Quality contract | ⬜ | `.qa/quality-contract.md` if it exists — otherwise run against escalation defaults and label the result un-contracted |

## Steps

1. **Pin the diff**: `git diff <base>...HEAD --name-status` and `git log <base>..HEAD --oneline`. Confirm the ref resolves and the diff is non-empty. List what you excluded from tagging.
2. **Tag the files** by path: `source`, `test`, `config`, `infra`, `public-api`, `schema`, `auth`, `critical-path`, `db-migration`, `ai`, `secret-suspect`, `generated`.
3. **Tag the hunks** by reading added AND removed lines: `new-public-export`, `new-endpoint`, `modified-auth`, `secret-like-string`, `sql-string`, `exec-call`, `db-migration`, `modified-error-handling`, `modified-request-schema`, `added-dependency`, `modified-prompt`, `new-external-call`, `removed-test`, `removed-validation`, `loosened-type`, `removed-guard`, `disabled-check`.
4. **Resolve relevant practices** from the tags, intersect with the contract; record which tag triggered each practice.
5. **Verify coverage** on changed lines if an artifact exists; group uncovered lines and classify each (untested logic / integration / defensive / instrumentation / unreachable / hard to reach). No artifact = INFO + "produce one", never a coverage figure.
6. **Check intent** if any escalation tag is present: `Intent:`/`Intent-Ref:` trailer, ADR link, or module register entry covering this surface.
7. **Report with severity.**

## Rules

- Read the hunks, not just paths — a `new-endpoint` in a pre-existing file is invisible to path tagging. Read removals too: deleted tests, removed validation, loosened types, new `continue-on-error` are risk-increasing edits reviews miss.
- Escalate on any auth, secret, SQL, exec, migration, or removed-guard signal — there is no small auth change.
- Every finding carries a brief: practice, severity, touched lines, repo conventions (runner, naming, location, style, mocking — read from the repo), what needs covering, acceptance criteria, concrete first step.
- State what is out of scope and why; name the blind spots of tag grammar (config-driven behaviour, data-shape risk, blast radius through shared packages).
- Do not fix anything — findings and briefs only.

## Output

```
Verdict: BLOCK · n block · n warn · n nudge · n info
Scope:   n files · tags: …
Relevant: …
Out of scope: … (with reasons)

<severity>  <practice>  <file>  <one-line action>
…

Flags: removed tests, removed guards, disabled checks
Blind spots: …
```

Then full briefs, BLOCK first, and the exact command to re-verify once addressed.
