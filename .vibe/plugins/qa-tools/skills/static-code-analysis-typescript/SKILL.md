---
name: static-code-analysis-typescript
description: 'Creates, reviews, and modernizes static analysis setups for Node.js + TypeScript repositories: ESLint flat config with typescript-eslint, tsconfig, Prettier, import sorting, Husky + lint-staged commit hooks, package.json quality scripts, and CI quality gates. Use when setting up or auditing linting, formatting, type-checking, commit hooks, or CI quality checks. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🧰 Static Code Analysis for TypeScript

For repositories that use — or should use — ESLint (flat config) + typescript-eslint, strict tsconfig, Prettier, import sorting, Husky + lint-staged, quality scripts in `package.json`, and CI quality gates.

## 🎯 When to Use

Setting up or auditing: linting, formatting, type-checking, commit hooks, GitHub Actions quality checks in a TS project.

## 🎯 Goals / Recommended Outcome

- One command runs all local checks: `npm run check` (lint + typecheck + format check)
- Pre-commit hook blocks bad commits (Husky + lint-staged: lint+format only staged files)
- CI has a required quality job (lint, typecheck, format) that fails the PR
- Config is explicit and minimal — every rule has a reason

## 🔄 Procedure

1. **Inspect the existing setup** — what is installed, which configs exist, what CI runs. Do not re-add what exists.
2. **Classify the architecture** — app / library / monorepo; this decides tsconfig project references and ESLint project service settings.
3. **Normalize dependency expectations** — single source of truth for versions; no duplicate installs of the same tool under different names.
4. **Assess import sorting** — eslint-plugin-import or prettier-plugin-sort-imports; enforce by tool, not by hand.
5. **Normalize script naming** in `package.json`: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `check` (= all).
6. **Decide formatting** — Prettier as the single formatter; ESLint formatting rules off (no double formatting).
7. **Validate tsconfig** — `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` where the codebase tolerates it; sensible `include`/`exclude`.
8. **Set up Husky + lint-staged correctly** — pre-commit runs `lint-staged` (eslint --fix + prettier --write on staged files only); hooks committed to the repo.
9. **Define CI quality gates** — a required job running `npm run check`; add to branch protection. A job not in required checks is advice with a CPU bill. Pin action versions, set `timeout-minutes`, least-privilege `permissions`.
10. **Update documentation** — one README section: the commands, what the pre-commit does, how to bypass it honestly (`--no-verify` is visible in history).
11. **Verify and report** — run every command as written; report what was added, what was already there, and what remains open.

## ⚖️ Decision Rules

- Prefer fewer, enforced rules over many, ignored ones.
- Lint must be fast enough to run on every commit (< ~10s on staged files).
- Type errors are never auto-fixed by the hook — only reported.
- `any` bans come from typescript-eslint (`no-explicit-any`), not ad-hoc comments.
- Do not introduce a second formatter or a second linter.

## ✅ Completion Checklist / Definition of Done

- [ ] `npm run check` passes on a clean clone and runs lint + typecheck + format:check
- [ ] pre-commit hook formats/lints staged files and blocks on errors
- [ ] CI quality job exists, is required in branch protection, and fails on violations
- [ ] tsconfig strict flags set; ESLint flat config with typescript-eslint
- [ ] Prettier configured; import sorting enforced by tool
- [ ] README documents the commands and the hook
- [ ] no duplicate tooling; action versions pinned; job timeouts set

## 🔗 Related Skills

- `ci-cd-pipelines` — wiring the quality job into the wider pipeline
- `quality-gates` — when lint/typecheck become release gates
- `tech-debt-analysis` — when the audit finds systemic tooling debt
- `qa-best-practices` — code review conventions on top of the enforced ones
