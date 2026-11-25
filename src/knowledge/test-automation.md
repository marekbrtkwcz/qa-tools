# Test automation

Unit/component/E2E test automation for JS/TS: TDD, Playwright, mocking, visual regression, flaky tests, CI pipelines, migration. This bundle writes tests; test design lives in `qa-core`, contracts and gates in `quality-gates`.

## Conventions

- Quick vs standard pairs: `writing-unit-tests-quick` / `test-driven-development-quick` are the compact forms of `writing-unit-tests` / `test-driven-development` — pick quick for one small function or fix, standard for legacy code, doubles or a full suite review. Same split for `code-review` vs `code-review-advanced`.
- `unslop-tests` applies to any test code this bundle produces: no tests that pass without proving anything.
- Browser work needs the Playwright MCP server from the `qa-mcp` plugin; live console/network/performance debugging uses the Chrome DevTools MCP from the same bundle (`debugging-with-chrome-devtools-mcp`); load tests run through the k6 MCP (`k6-load-testing`).
- Bun is a first-class runtime here: unit/integration suites can run on `bun test` (`testing-with-bun`), E2E on `bunx playwright test`; lint/format/type gates stay Biome + `tsc --noEmit` regardless of runner (`static-code-analysis-typescript`).

## Evidence and enforcement

Pinned by `evals/test-automation.cases.jsonl` (quick/standard pair routing) and the repo's build gates (`test-file-guard`, `red-test-deletion-guard` hooks wired via `npm run check`).
