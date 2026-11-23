---
name: static-code-analysis-typescript
description: 'Creates, reviews, and modernizes static code analysis setups for Node.js and TypeScript repositories using Biome: biome.json configuration, the Biome linter, formatter, and assist import organization, migration from ESLint/Prettier, tsconfig, Husky, lint-staged, package.json quality scripts, and CI quality gates with biome ci. Use when setting up or auditing linting, formatting, type-checking, commit hooks, or CI quality checks in a JavaScript or TypeScript project.'
argument-hint: 'Repository type, current tooling, and target quality gate'
user-invocable: true
---

# Static Code Analysis for TypeScript Projects

Use this skill when you need to create, review, fix, or modernize static code analysis in a Node.js + TypeScript repository.

This collection standardizes on a single-tool stack:

- `@biomejs/biome` - one binary for linting, formatting, and import organization
- `biome.json` (or `biome.jsonc`) - one configuration file for all three
- `typescript` with a strict `tsconfig.json` - Biome does not type-check, so `tsc --noEmit` remains the type gate
- `husky` (plus `lint-staged` when staged-file workflows are wanted)
- `package.json` scripts
- CI quality gates (`biome ci`)

Existing repositories that still run ESLint and/or Prettier are migrated to Biome as part of this workflow; the migration procedure is step 6.

## When to Use

Use this skill when the user asks things like:

- "set up static analysis for TypeScript"
- "set up Biome"
- "add linting and formatting to this repo"
- "review our biome.json, tsc, husky, or lint-staged setup"
- "migrate this repo from ESLint / Prettier to Biome"
- "fix package.json scripts for code quality"
- "prepare CI checks for linting and type checking"
- "standardize naming for static code analysis scripts"
- "audit whether this repo follows current best practices"
- "add a CI quality gate workflow"

## Goals

This skill should help produce a setup that is:

- explicit
- reproducible
- CI-friendly
- fast enough for local development
- strict enough to catch issues early
- easy to understand from `package.json`, `README.md`, and `biome.json`
- portable across Playwright, Cypress, and general TypeScript projects

## Recommended Outcome

A strong baseline should usually include:

- `@biomejs/biome` installed as an exact-pinned dev dependency (`npm install -D -E @biomejs/biome`, the `-E` flag) so every contributor and CI run executes the same version
- `biome.json` created with `npx biome init` - formatter, linter, and assist actions on with their recommended settings
- import organization via the assist action `source.organizeImports`
- VCS integration enabled (`vcs.enabled`, `vcs.clientKind: "git"`, `vcs.useIgnoreFile`) so Biome reuses `.gitignore`
- `typescript` as a direct dependency when `tsc` is used directly, with a strict `tsconfig.json`
- `husky` hook for local guardrails
- `lint-staged` for staged-file workflows when needed
- CI commands that cannot mutate files (`biome ci`)
- explicit Node version support in `package.json#engines`
- a CI quality gate, integrated into an existing workflow when one exists

Concrete baseline files (biome.json, package.json scripts, tsconfig, Husky hook, lint-staged config, VS Code settings, CI workflows) live in `./resources/example-configs.md`.

## Procedure

### 1. Inspect the existing setup

Check at least these files when they exist:

- `package.json`
- `biome.json` / `biome.jsonc`
- `eslint.config.*` or legacy `.eslintrc*`
- `tsconfig.json`
- `.prettierrc*` / `.prettierignore`
- `.husky/*`
- `.github/workflows/*`
- `.vscode/settings.json`
- `.vscode/extensions.json`
- `README.md`
- any existing audit or decision documents

Identify:

- whether Biome is already installed, and whether `@biomejs/biome` is pinned exactly (no `^`/`~`)
- whether `biome.json` matches the installed Biome version (the `$schema` URL carries the version)
- whether formatter, linter, and assist are all enabled, and which import sorting is active
- whether the repo still runs ESLint and/or Prettier, and in which scripts
- whether `typescript` is direct or transitive, and whether `tsc` is used as a real gate
- whether commit hooks validate the whole repo or only staged files
- whether CI enforces the same checks as local hooks
- whether VS Code `source.organizeImports` could conflict with Biome's import organizer

### 2. Classify the current architecture

Choose the current model before editing anything:

- **Model A - Biome-native**: one `biome.json` covers linting, formatting, and import organization; `tsc` covers types. The target state.
- **Model B - Legacy split**: ESLint for code quality, Prettier for formatting, an import-sort plugin on either side. A migration candidate - go to step 6.
- **Model C - Mixed or inconsistent**: Biome for some checks but ESLint still configured, overlapping scripts, or unclear responsibilities. Consolidate on Biome and remove the leftovers.

When possible, make the final state explicit in docs so the split is understandable.

### 3. Install and configure Biome

For TypeScript repositories, prefer these principles:

- install exactly pinned: `npm install -D -E @biomejs/biome`
- if no `biome.json` exists, create one with `npx biome init` (generates the config with `$schema`, recommended linter preset, formatter, and assist actions enabled)
- keep formatter, linter, and assist enabled; organizeImports belongs to `assist.actions.source.organizeImports`
- enable VCS integration so Biome reuses `.gitignore`:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
```

  Set `defaultBranch` to the repo's real default branch when using `--changed` in step 8 or CI.

- if tooling requires newer Node versions, declare them in `package.json#engines`
- ignore generated artifacts such as `playwright-report/**` and `test-results/**` (in `biome.json` overrides or the existing `.gitignore` when `useIgnoreFile` covers them)

Typical direct dev dependencies: `@biomejs/biome`, `typescript`, `husky`, and optionally `lint-staged`.

### 4. Assess import organization

- **No sorting** → leave assist `organizeImports` on (the `npx biome init` default)
- **Biome assist** → already optimal
- **`eslint-plugin-simple-import-sort` / `eslint-plugin-perfectionist`** → removed with the ESLint migration (step 6); Biome's organizer replaces them
- **`@trivago/prettier-plugin-sort-imports` / `@ianvs/prettier-plugin-sort-imports`** → removed with the Prettier migration (step 6); their custom grouping is not carried over, accept Biome's ordering
- **VS Code `source.organizeImports`** → remove if Biome's organizer is active; it conflicts

Rationale and VS Code settings are in `./resources/import-sorting.md`.

After the migration, run `npx biome check --write .` once to normalize all imports and formatting, then verify with a clean `npx biome check .`.

### 5. Normalize script naming in `package.json`

Prefer predictable script names:

- `check` → local aggregate: `biome check --write .` plus `tsc` (mutates files)
- `check:ci` → CI aggregate: `biome ci .` plus `tsc --noEmit` (cannot mutate)
- `lint` → lint only, non-mutating: `biome lint .`
- `format` → mutating formatter run: `biome format --write .`
- `format:check` → non-mutating formatting validation: `biome format .`
- `tsc:check` → `tsc --noEmit`
- `lint-staged` → entrypoint for staged-file validation

Guidelines:

- `biome ci` and the `biome lint`/`biome format` commands without `--write` never mutate files - use exactly those in CI
- provide both `check` (local, with `--write`) and `check:ci` (CI, via `biome ci`)
- running the npm script (`npm run check:ci`) in CI uses the same exact-pinned Biome version as local runs

### 6. Migrate away from ESLint and Prettier (when a legacy setup exists)

When the repo still has ESLint and/or Prettier:

1. `npx biome init` if no `biome.json` exists yet
2. `npx biome migrate eslint --write` - ports the ESLint config (flat or legacy, including `extends` and plugins; needs Node to resolve them; YAML configs are not supported) and `.eslintignore`
3. `npx biome migrate prettier --write` - ports `.prettierrc` and `.prettierignore`
4. Review the ported rules in `biome.json` (Biome ports identical rules by default; pass `--include-inspired` / `--include-nursery` deliberately, not by reflex)
5. Run `npx biome check --write .` once and commit the reformat
6. Remove `eslint`, `prettier`, their plugins and configs, their editor extensions, and the `eslint`/`prettier` scripts

Full walkthrough, caveats, and the rule-compatibility notes: `./resources/biome-migration.md`.

### 7. Validate TypeScript configuration

For `tsconfig.json`, prefer:

- `strict: true`
- `module: "ESNext"` when the project uses ESM `import`/`export` syntax (the default for modern TypeScript projects)
- `moduleResolution: "bundler"` - **required** when `module` is `"ESNext"` and TypeScript does not emit code; without it TS falls back to `"classic"` resolution which cannot resolve `node_modules`
- `noEmit: true` when TypeScript is used only for type checking
- explicit `baseUrl` / `paths` only when justified

**Common mistake:** `"module": "CommonJS"` with `"target": "ESNext"` - the project writes ESM but tells TypeScript to resolve modules as CJS. See the tsconfig notes in `./resources/example-configs.md` for the full rationale.

If the repo uses path aliases, confirm they are supported consistently by TypeScript, runtime/test tooling, and editor tooling.

**Biome does not replace tsc.** It has no type checker, so `tsc:check` stays a separate, non-negotiable gate.

### 8. Set up Husky and staged checks correctly

Recommended pattern:

- pre-commit hook runs Biome on staged files only: `npx biome check --staged --write` (or `lint-staged` with a `biome check --write` entry when the repo already uses it)
- full-project `tsc:check` may still run in pre-commit or pre-push, depending on repo size and tolerance for slower hooks

Guidelines:

- use staged-file checks for fast local feedback
- avoid whole-repo runs in pre-commit when staged-only checks are enough
- if full `tsc:check` is too slow for pre-commit, move it to pre-push or CI
- on large repos, `npx biome check --changed --write` (against `vcs.defaultBranch`) is an alternative for branch-local runs

### 9. Define CI quality gates

A minimal CI quality job should:

1. Install dependencies reproducibly (`npm ci`)
2. `npm run check:ci` - i.e. `biome ci .` (non-mutating, GitHub-style annotations on GitHub hosts) plus `tsc --noEmit`

**Pipeline discovery: add quality checks to an existing CI workflow before creating a separate one.**

1. **Search for existing workflows** - look in `.github/workflows/` for any existing CI pipeline (e.g. `playwright-e2e-tests.yml`, `ci.yml`, `test.yml`, `build.yml`)
2. **If a main pipeline exists** - add a `quality` job to that workflow, with the test job depending on it via `needs: quality`
3. **Only if NO existing pipeline is found** - create a new standalone workflow (example in `./resources/example-configs.md`)

CI principles:

- use non-mutating commands only (`biome ci` has no `--write` mode by design)
- do not rely solely on local hooks - CI is the authoritative gate
- keep CI aligned with local script names
- use `permissions: contents: read` for least-privilege
- cache `npm` dependencies for speed
- match the CI Node version to `engines.node` from `package.json`
- prefer running the pinned local Biome through `npm run check:ci`; the first-party `biomejs/setup-biome` GitHub Action is an alternative for jobs that do not install npm dependencies - pin a version instead of `latest` when you use it, or CI may drift from the repo's pin

### 10. Update documentation

Reflect the final design in docs, so the next person runs the same scripts CI runs. At minimum, update `README.md` (plus audit/report docs and `.vscode/settings.json` recommendations when relevant).

Document clearly: required Node version, what each quality script does, that linting/formatting/import organization all live in `biome.json`, what Husky runs on commit, what CI runs, and which files are ignored and why.

### 11. Verify and report

After editing, verify:

- `npx biome check .` - exits 0 after one `--write` pass
- `npm run check:ci` - passes (`biome ci .` plus `tsc`)
- the hook: `git add` a sample file and commit, then `git reset --soft HEAD~1` - the commit went through the hook cleanly

The final report should distinguish between configuration problems, dependency problems, and code-quality violations in the current codebase.

If verification hits unexpected behavior, consult `./resources/troubleshooting.md`.

## Decision Rules

**Pin the exact Biome version (`-E`) when:** always - the quick start documents `-E` so contributors and CI run one version; `biome.json` and its `$schema` are version-coupled.

**Prefer `vcs.useIgnoreFile` when:** the repo already maintains `.gitignore`; it keeps the ignored set identical to other tooling instead of maintaining a second ignore list.

**Prefer a separate `tsc:check` gate when:** always - Biome formats and lints but has no type checker; loosen it only if `typescript` is not used at all.

**Prefer `biome ci` over `biome check` in CI when:** always in a CI environment - it cannot write, integrates with runner reporting (e.g. GitHub annotations), and supports thread control.

**Prefer `--staged` in the pre-commit hook when:** the hook only needs to guard what is being committed; whole-repo checks belong in CI.

**Prefer `--changed` on large repos when:** full-project checks get slow locally; set `vcs.defaultBranch` first. Note it flags any touched file without re-linting downstream importers - full CI runs still cover the whole repo.

**Enable nursery rules when:** one specific rule is needed and documented - e.g. `lint/nursery/noFloatingPromises` in a Playwright suite, where a missing `await` lets an assertion run after the test has already passed. Nursery rules can change behavior between releases, so name the rule and the reason in `biome.json`.

**Prefer `lint-staged` when:** the repo already uses it or needs partial-staging behaviour; a plain `biome check --staged --write` hook is enough otherwise.

**Prefer a CI workflow when:** the repo is team-shared; quality enforcement should not depend on individual developer hooks; the project uses pull requests; even for solo projects, CI catches hook-bypass scenarios (`--no-verify`).

## Quick Setup and Checklist

The full quick-setup commands, completion checklist, and example prompts live in `./resources/quick-setup-and-checklist.md` - read it when starting from scratch.

## Resource Map

- `./resources/example-configs.md` - read when implementing: baseline biome.json, package.json scripts, tsconfig, Husky hook, lint-staged config, VS Code settings, and CI workflow examples
- `./resources/biome-migration.md` - read when the repo still has an ESLint and/or Prettier setup to migrate
- `./resources/import-sorting.md` - read when import order churns on save or an old import-sort plugin is still configured
- `./resources/troubleshooting.md` - read when a check fails and the cause is not obvious
- `./resources/quick-setup-and-checklist.md` - read when setting up from scratch: numbered commands, completion checklist, example prompts

## Related Skills

- `code-review-advanced` - when the static-analysis audit should be paired with a code-level review
- `tech-debt-analysis` - when lint/type findings should feed a broader debt assessment
- `creating-instructions` - when the resulting conventions should become instruction files

## Definition of Done

This skill is complete when:

- the current architecture is classified (Model A/B/C) before any edits
- dependencies, scripts, tsconfig, hooks, and CI follow the decision rules above
- linting, formatting, and import organization all live in one `biome.json`
- a legacy ESLint/Prettier setup is fully migrated away (step 6) or an explicit, dated migration is scheduled
- all verification commands pass and results are reported
- documentation matches the final setup

(Example prompts are in `./resources/quick-setup-and-checklist.md`.)
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
