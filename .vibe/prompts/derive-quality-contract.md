---
description: Derive which testing practices are MUST/SHOULD/COULD for this project from its risk profile × team maturity × product surfaces, then report a PRESENT/PARTIAL/MISSING/WAIVED gap matrix and an ordered remediation plan, written to .qa/quality-contract.md (+ .yaml). Arguments: repository path (default workspace root) and criticality (who is harmed by a defect and how badly — required; missing = ask and stop). See knowledge quality-governance; can delegate to qa-tools:quality-contract-architect. For auditing what gates stopped enforcing use /audit-quality-debt.
---

# Derive a quality contract

Derive this project's quality contract and report the gap between contract and reality. Do not invent a practice list — use knowledge `quality-governance` (and skill `quality-gates`); can delegate to `qa-tools:quality-contract-architect`.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Repository | ✅ | workspace root or a path (command arg 1) |
| Criticality | ✅ | who is harmed by a defect, how badly (command arg 2) — missing = ask before resolving anything; it sets the profile, the profile sets every level |
| Regulatory/contractual exposure | ⬜ | finance, health, public sector, SOC2, GDPR-heavy |
| Rollback speed | ⬜ | minutes, or not at all |
| Team testing experience | ⬜ | read from the repo if not supplied |
| Known out-of-scope areas | ⬜ | practices already ruled out, and by whom |

## Steps

1. **Detect the triple**: stack/tooling from manifests and CI; product surfaces (`web-ui`, `http-api`, `wire-schema`, `ai-llm`, `data-store`, `library`, `cli`) with evidence each, and which are confidently absent; maturity from the repo as it is, not ambition.
2. **Propose the profile** with a one-sentence justification per axis — then **stop and confirm the triple with the user** before continuing.
3. **Resolve the contract**: drop practices whose surface is absent (N/A with reason); defer practices above current maturity (next level); label the rest MUST / SHOULD / COULD.
4. **Detect current state** per practice: PRESENT (configured AND enforced), PARTIAL, MISSING, WAIVED, UNKNOWN — quote a path, dependency, or CI step with line number for every state.
5. **Grade the gap**: MUST + MISSING = blocker, not waivable. Order the rest by risk × effort.
6. **Write the artifacts** to `.qa/quality-contract.md`, plus `.qa/quality-contract.yaml` if gate tooling reads it.

## Rules

- **Configured is not verified** — a runner in `package.json` proves existence, not that recent changes were tested; say which you measured.
- **Catch fake gates**: `continue-on-error: true`, `|| true`, ESLint without `--max-warnings 0`, non-required jobs, thresholds below current value — each is PARTIAL, quote the line.
- **Never mark a manual practice PRESENT from tooling** — code review, exploratory, UAT, a11y, observability are attested (date + name) or unattested — see `attesting-manual-verification`.
- **Use UNKNOWN** when a state cannot be determined, and say what you would need — never collapse into MISSING.
- No aspirational profiling — an unsatisfiable contract gets ignored, which is worse than an honest `standard`. In a monorepo, derive per package when criticality differs, and say so.

## Output

1. The triple, with evidence and one-sentence justification per axis
2. Blockers (MUST + MISSING) on their own lines
3. Contract table: practice, level, tool, exit criterion, owner
4. Gap matrix: practice, level, state, evidence, verdict
5. Counts: `n blockers · n to fix · n to attest · n unknown · n ok`
6. Ordered remediation plan, each item starting with a command runnable today
7. What the contract does not cover: N/A, deferred, UNKNOWN
8. Re-derivation trigger — what change should cause a rebuild
