# Quick Setup from Scratch


For setting up a new Playwright + TypeScript project with full static analysis:

```bash
# 1. Initialize and install core dependencies
npm init -y
npm install -D @playwright/test typescript

# 2. Install Biome (exact-pinned) and hooks
npm install -D -E @biomejs/biome
npm install -D husky lint-staged

# 3. Create biome.json (formatter + linter + assist, recommended preset)
npx biome init
# then enable the vcs block - see ./resources/example-configs.md

# 4. Initialize Husky
npx husky init
# set .husky/pre-commit to run: npx biome check --staged --write

# 5. Create tsconfig.json and add quality scripts to package.json
#    (see ./resources/example-configs.md)

# 6. For a Playwright suite, consider lint/nursery/noFloatingPromises
#    (see ./resources/example-configs.md)

# 7. CI quality gate:
#    - If .github/workflows/ already has a CI pipeline → add a quality job there
#    - If no pipeline exists → create a standalone quality workflow

# 8. Verify
npx biome check --write .   # one-time normalization, then commit
npx biome check .           # exits 0
npm run tsc:check
```

## Completion Checklist


A task using this skill is complete when:

- [ ] `@biomejs/biome` is a direct dev dependency, pinned exactly
- [ ] `biome.json` exists with formatter, linter, and assist `organizeImports` enabled, and a VCS block with `useIgnoreFile`
- [ ] No ESLint/Prettier configs, dependencies, scripts, or editor extensions remain (or the migration is explicitly scheduled)
- [ ] Script names are clear and consistent, with `check:ci` as a non-mutating aggregate
- [ ] `tsc:check` still runs and passes - Biome does not type-check
- [ ] Husky (and `lint-staged` if used) run `biome check --staged --write`
- [ ] A CI quality job exists (integrated into an existing workflow, or standalone only when none exists) and runs `biome ci`
- [ ] `.vscode/settings.json` uses the Biome extension as formatter and does not keep `source.organizeImports` on built-in ordering
- [ ] Docs (`README.md`) match the actual setup
- [ ] Verification results are recorded (`biome check`, `check:ci`, `tsc:check` all pass)


## Example prompts


- `/static-code-analysis-typescript review this repo and standardize Biome, TypeScript, Husky, and CI scripts`
- `/static-code-analysis-typescript create a modern static analysis setup for a Node + TypeScript test repository`
- `/static-code-analysis-typescript migrate this repo from ESLint and Prettier to Biome`
- `/static-code-analysis-typescript set up Biome for a Playwright project and catch missing awaits`
- `/static-code-analysis-typescript add a CI quality gate workflow for GitHub Actions`
- `/static-code-analysis-typescript audit our biome.json and explain what is missing`
