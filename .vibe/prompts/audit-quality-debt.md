---
description: Audit the governance layer — what the repo claims to enforce vs what it actually enforces — and inventory every silent skip (skipped tests, disabled lint rules, ts-expect-error, continue-on-error, coverage ignores, lowered thresholds, raised retries, expired waivers). Arguments: repo path (default workspace root), audit range (default last 90 days), optional previous audit for trend. Report-only. For anti-patterns inside test code use /tech-debt-audit. See knowledge quality-governance + skills quality-gates, attesting-manual-verification; can delegate to qa-tools:tech-debt-auditor.
---

# Audit quality debt and silent skips

Audit the governance layer of the repository (command argument: path, default workspace root): what it claims to enforce, what it actually enforces, what it has quietly stopped enforcing.

See knowledge `quality-governance`, skills `quality-gates` and `attesting-manual-verification`; can delegate to `qa-tools:tech-debt-auditor`.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Repository | ✅ | workspace or path |
| Audit range | ⬜ | commit range for intent/comprehension pass — default last 90 days |
| Quality contract | ⬜ | `.qa/quality-contract.md` if exists; otherwise audit against escalation defaults and say so |
| Previous audit | ⬜ | for trend direction |

## Steps

1. **Technical debt** — gap matrix against the contract; missing/partial practices; gates that cannot fail.
2. **Silent skips** — inventory every suppression: tests (`.skip`/`.only`/`.todo`, empty bodies, deleted specs), lint (inline and whole-file disables, rules off, ignore patterns), types (`@ts-expect-error`, `@ts-nocheck`, `any`, per-package `strict: false`), CI (`continue-on-error`, `|| true`, `allow_failure`, schedule-only jobs, non-required checks), coverage (ignores, excludes, thresholds below current value), leniency (retries without flake measurement, huge timeouts, hard waits), security (allowlists, open advisories, `--force`, `--ignore-scripts`), hooks (`--no-verify` in scripts/docs), AI gates (skipped evals, lowered eval thresholds).
3. **Waiver health** — expired, unbounded, unowned, or renewed more than twice.
4. **Intent debt** — high-risk changes in range with no `Intent:`/`Intent-Ref:` trailer, no ADR link, no register entry; malformed reported separately from missing.
5. **Comprehension risk** — advisory band from diff size, new-branch density, human explanation presence; AI provenance only if `Assisted-by:` trailers are in use, else "unknown".
6. **Trend** — direction per debt where a previous audit exists.

## Rules

- **Count, then name** — "46 suppressions, 7 explained, 0 registered" is what moves a team.
- Quote a path and a line for every finding — governance findings get argued with more than code findings.
- Comprehension findings never block — report the band and the unattested surface.
- Separate "not done" from "not visible" — unassessable = UNKNOWN with what you would need.
- Every finding gets one of three outcomes: fix, waive (reason/owner/expiry), or delete. No fourth option.
- Do not name individuals as the problem; owners are for fix accountability.
- Do not fix anything — report and plan. If no CI config / tests / git history, say which passes could not run and continue.

## Output

Grouped by debt in this order: **technical → silent skips → waivers → intent → comprehension → trend**, counts first, evidence beneath. Then an ordered plan (highest-hiding, lowest-effort first), each item naming file, fix, and suggested owner. Start with the four that hide the most: whole-file disables, `|| true` in CI, coverage exclusions over logic directories, any committed `.only`.
