# Test automation

Unit/component/E2E test automation for JS/TS (plus Robot Framework for keyword-driven suites): TDD, Playwright, mocking, visual regression, flaky tests, CI pipelines, migration. This bundle writes tests; test design lives in `qa-core`, contracts and gates in `quality-gates`.

## Conventions

- Quick vs standard pairs: `writing-unit-tests-quick` / `test-driven-development-quick` are the compact forms of `writing-unit-tests` / `test-driven-development` — pick quick for one small function or fix, standard for legacy code, doubles or a full suite review. Same split for `code-review` vs `code-review-advanced`.
- `unslop-tests` applies to any test code this bundle produces: no tests that pass without proving anything.
- Browser work needs the Playwright MCP server from the `qa-mcp` plugin; live console/network/performance debugging uses the Chrome DevTools MCP from the same bundle (`debugging-with-chrome-devtools-mcp`); load tests run through the k6 MCP (`k6-load-testing`).
- Version control is plural in real teams: `git-for-testers` owns git workflows (bisect, hooks, blame, clone speed); when the working copy is an SVN checkout, the same workflows run through `svn-for-testers` and its git↔svn command map - the git-shaped skills (`diagnosing-test-failures` bisect, diff-based selection, intent recording) name their SVN equivalents inline, so do not improvise translations.
- Bun is a first-class runtime here: unit/integration suites can run on `bun test` (`testing-with-bun`), E2E on `bunx playwright test`; lint/format/type gates stay Biome + `tsc --noEmit` regardless of runner (`static-code-analysis-typescript`).
- Python is a supported alternative language for test automation: when the suite runs on pytest (Python team, Python product code, legacy Python suite), port the conventions via `port-suite-to-python-java` instead of rewriting them per language — the same unslop/flake/CI rules apply, mapped to pytest equivalents.
- Robot Framework is deliberately in the canon (PL/EU teams run real keyword-driven suites, so requests like "make it in robot" must not misroute): `robot-framework-automation` owns it — Resources are its reuse unit, tags filter smoke from regression, `robocop`/`robotidy` are its lint/format pair, and Browser Library embeds Playwright so selector discipline is shared with the JS/TS skills. It is not a Playwright replacement: a whole-suite move to Playwright is `migrating-tests-to-playwright`'s deliberate path, and porting conventions to pytest/JUnit/NUnit stays with `port-suite-to-python-java`.

## Evidence and enforcement

Pinned by `evals/test-automation.cases.jsonl` (quick/standard pair routing) and the repo's build gates (`test-file-guard`, `red-test-deletion-guard` hooks wired via `npm run check`).
