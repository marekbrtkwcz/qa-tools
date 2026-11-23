# Stryker for JavaScript and TypeScript

Read when implementing a mutation run in a JS/TS repo. StrykerJS (`@stryker-mutator/core`) is the default tool: it mutates the code under test, runs the suite per mutant, and reports the mutation score.

## Install

```bash
npm install -D -E @stryker-mutator/core
# plus the runner for your framework:
npm install -D -E @stryker-mutator/vitest-runner   # or @stryker-mutator/jest-runner
npx stryker init
```

Pin exactly (`-E`) as with any tool whose config lives in the repo (`stryker.config.json`).

## Minimal config - Vitest

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/pricing/**/*.ts"],
  "timeoutMS": 30000,
  "concurrency": 4,
  "reporters": ["html", "clear-text", "progress"]
}
```

- `mutate` is the scope decision from the skill - keep it narrow; `src/**/*.ts` on a big repo is a nightly decision, not a default
- `coverageAnalysis: "perTest"` makes Stryker run only the tests that cover each mutant - the single biggest speed lever
- `concurrency` matches the machine or CI runner; mutants run in parallel workers

## Jest

Same shape with `"testRunner": "jest"` and `@stryker-mutator/jest-runner`. Point Stryker at the same config Jest already uses in CI (`jest.config.js` is picked up by default) so mutants are judged by the one true suite, not by a divergent local setup.

## Playwright (and other E2E runners) - the `command` runner

StrykerJS has no Playwright-specific runner; the generic `command` runner treats the test command's exit code as the verdict:

```json
{
  "testRunner": "command",
  "commandRunner": { "command": "npm run test:once" },
  "coverageAnalysis": "off",
  "buildCommand": "npm run build",
  "timeoutMS": 120000,
  "mutate": ["src/lib/**/*.ts"]
}
```

- the command must exit non-zero when any test fails - so point it at the plain test script, not at a wrapper that retries or swallows failures (a `|| true` here makes every mutant survive; the fake-gate rules from `governing-quality-waivers` apply)
- with `coverageAnalysis: "off"` every mutant runs the whole suite - keep the E2E scope small (one module) or the run takes hours
- prefer mutating library code covered by the E2E suite, not page objects: mutants inside selectors and selectors' strings prove little

## Diff-scoped and incremental runs

```bash
# incremental: re-run only mutants not covered by the previous run's result
npx stryker run --incremental

# diff scope: mutate only files touched by this branch
npx stryker run --mutate $(git diff --name-only origin/main...HEAD -- 'src/**/*.ts' | tr '\n' ' ')
```

`--incremental` stores its state in an incremental file between runs (option `incrementalFile`, gitignored) - useful for per-PR jobs. The diff list feeds `mutate`, so pull requests pay only for their own changes; combine with `--concurrency` tuned to the runner's CPU budget.

## Threshold policy

```json
"thresholds": { "high": 80, "low": 65, "break": 50 }
```

- start reporting-only: `high` and `low` only tint the console score band; the run exits non-zero on `break` alone, so CI does not fail while the team is still reading the first report
- set `high` to the goal and `low` to roughly the current baseline - the band shows direction (gaining / holding / bleeding) in one glance
- if the gate's job is catching assertion stripping (a suite made green by deleting assertions), set `break` at or slightly below the real baseline: a bar above what the suite currently achieves gets disabled in the first pressure week
- revisit thresholds as a recorded decision (`governing-quality-waivers` treats quiet threshold changes like any other silent skip)

## CI job example (GitHub Actions - scheduled first)

```yaml
mutation:
  # phase 1: scheduled audit - the score lands in the trend, not in required checks
  # phase 2: diff-scoped PR gate once the baseline is trusted
  runs-on: ubuntu-latest
  timeout-minutes: 30
  steps:
    - uses: actions/checkout@v4
      with: { fetch-depth: 0 }
    - uses: actions/setup-node@v4
      with: { node-version-file: 'package.json', cache: npm }
    - run: npm ci
    - run: npx stryker run --incremental --reporters json,progress
    - uses: actions/upload-artifact@v4
      with:
        name: mutation-report
        path: reports/mutation
```

Phase 1 runs on `schedule` (nightly/weekly); phase 2 adds a `pull_request` trigger with `--mutate` from the diff. The JSON reporter feeds `tracking-quality-trends`; the HTML reporter file is the human-readable evidence to link from the report.

## Working with the report

```
----------------|---------|----------|-----------|------------|----------|
File            | % score | # killed | # timeout | # survived | # no cov |
----------------|---------|----------|-----------|------------|----------|
pricing.ts      |  83.3 % |       99 |         2 |         14 |        7 |
----------------|---------|----------|-----------|------------|----------|
```

The score alone hides the work; read the split: `survived` feeds the triage, `no coverage` is a coverage gap to fix before judging assertions, `timeout` counts as detected but deserves one look (an introduced infinite loop is a finding too).

For triage coordinates, run with `--reporters json` and read the per-mutant arrays (`killed`, `survived`, `noCoverage`, `timeout`, each with a `location`). A survivor recorded as `pricing.ts:42` in the triage note is what makes the follow-up test reviewable.
