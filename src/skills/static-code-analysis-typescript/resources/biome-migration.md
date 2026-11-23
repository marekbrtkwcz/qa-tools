# Migrating a Repository from ESLint / Prettier to Biome

Read this when the repo still has an ESLint and/or Prettier setup (Model B or C). Biome can import the settings for you: the formatter matches Prettier's output in most cases, and the linter ports rules from ESLint and its popular plugins.

## Migration procedure

### 1. Install Biome alongside the old tools

```bash
npm install -D -E @biomejs/biome
```

Keep ESLint and Prettier installed until the last step - the migrate commands read their configs.

### 2. Create or locate the Biome config

```bash
npx biome init   # only if no biome.json exists
```

### 3. Import the ESLint configuration

```bash
npx biome migrate eslint --write
```

- handles both flat (`eslint.config.*`) and legacy (`.eslintrc*`) configs, including `extends` and shared/plugin configs
- migrates `.eslintignore`
- resolves plugins through Node, so run it where dependencies are installed
- YAML ESLint configs are **not** processed - convert them to JS/JSON first
- by default only rules identical to ESLint's are ported; pass `--include-inspired` and/or `--include-nursery` to pull in inspired and experimental rules too - do this deliberately, not by reflex

### 4. Import the Prettier configuration

```bash
npx biome migrate prettier --write
```

Reads `.prettierrc*` and `.prettierignore` into `biome.json`.

### 5. Review the ported config

- skim `linter.rules` in `biome.json`: every ported rule must make sense in the new rule set; a 1:1 mapping does not always exist (some ESLint options are not implemented, some rules deliberately differ)
- formatter options land as concrete `formatter`/`javascript.formatter` values - keep them, they preserve the repo's existing style
- keep `vcs.useIgnoreFile: true` so ignore parity with the old `.prettierignore`/`.eslintignore` behavior does not drift (ESLint and Prettier skip `.gitignore`d files by default; Biome does so only with VCS integration enabled)

### 6. Enable VCS integration and staged checks

Fill in the `vcs` block (see `./example-configs.md`), then one-time normalize and commit **separately**:

```bash
npx biome check --write .   # one-time reformat + import re-sort
git add -A
git commit -m "chore: migrate lint/format to Biome (mechanical reformat)"
```

Expect a diff even with a high Prettier-compatibility formatter: the remaining cases (mostly unusual files) surface now, once. Review the diff before committing - it should be whitespace/ordering only.

### 7. Remove the old stack

Remove from `package.json` and uninstall:

- `eslint` and every `eslint-*` / `typescript-eslint` package and plugin
- `prettier` and every Prettier plugin (`@trivago/...`, `@ianvs/...`, `eslint-config-prettier`, `eslint-plugin-prettier`)
- config files: `eslint.config.*`, `.eslintrc*`, `.eslintignore`, `.prettierrc*`, `.prettierignore`
- editor extension recommendations: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`

Rewire `package.json` scripts (`lint`, `format`, `check`, `check:ci`) to the Biome commands from `./example-configs.md`, and update `.husky/*` / `lint-staged` entries.

### 8. Verify

```bash
npx biome check .        # clean, non-mutating
npm run check:ci         # biome ci . + tsc both pass
grep -rIl "eslint\|prettier" package.json .vscode .husky 2>/dev/null   # no residue in wiring
```

(References to eslint in `.gitignore`d folders or unrelated docs are fine; the wiring must be clean.)

## What does not carry over

- **Custom ESLint plugin rules with no Biome equivalent** - now unresolved: enable the closest Biome rule, or drop the rule, or write a GritQL plugin; record which choice was made
- **Type-checked typescript-eslint rules** (`@typescript-eslint/no-floating-promises` and friends) - most have Biome counterparts that use Biome's own type inference instead of a `tsconfig` project service; `noFloatingPromises` lives in the `nursery` group (see `./example-configs.md`). Not every type-aware rule exists yet - check the rule list before promising parity
- **Import-sort plugin groupings** - Biome's organizer has its own documented order (see `./import-sorting.md`)
- **`--max-warnings 0`-style warnings-as-errors** - Biome equivalents: `--error-on-warnings` (CLI) or rule severities in `biome.json`

## Rollback

The migration is one commit (config + mechanical reformat) plus a dependency-removal commit. Reverting both restores the old setup exactly, provided step 6 was its own commit - keep the two commits split for exactly this reason.
