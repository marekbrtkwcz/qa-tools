---
name: static-code-analysis-typescript
description: 'Creates, reviews, and modernizes static code analysis setups for Node.js and TypeScript repositories using Biome: biome.json configuration, the Biome linter, formatter, and assist import organization, migration from ESLint/Prettier, tsconfig, Husky, lint-staged, package.json quality scripts, and CI quality gates with biome ci, including Bun-based repos (bun install, bunx, bun run). Use when setting up or auditing linting, formatting, type-checking, commit hooks, or CI quality checks in a JavaScript or TypeScript project.'
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

Bun is a supported alternative runtime and package manager, not a different lint stack: `bun install` / `bun add -d` replace npm, `bunx biome ...` runs the same exact-pinned local binary, and Bun executes TypeScript natively with no build step. Biome and `tsc --noEmit` behave identically under Bun; `bun test` is a test-runner concern, not a lint one, and does not change anything below.

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
- prefer running the pinned local Biome through `npm run check:ci` (or `bun run check:ci` on a Bun repo); the first-party `biomejs/setup-biome` GitHub Action is an alternative for jobs that do not install npm dependencies - pin a version instead of `latest` when you use it, or CI may drift from the repo's pin. On Bun repos, `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile` is the install-step equivalent of `setup-node` + `npm ci`

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

**Use Bun when:** the repo already standardizes on Bun (a committed `bun.lock`) - install with `bun add -d -E @biomejs/biome` (the exact pin matters the same as with npm), and run checks via `bunx biome ci .` or the package.json scripts through `bun run`. Pick one package manager per repo and never mix lockfiles. In CI, `oven-sh/setup-bun@v2` plus `bun install --frozen-lockfile` can replace `setup-node` + `npm ci` for the install step (cache keyed on `bun.lock`) - but Node is still required wherever a Node-only tool runs, so keep `setup-node` in jobs that execute such tools.

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

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
