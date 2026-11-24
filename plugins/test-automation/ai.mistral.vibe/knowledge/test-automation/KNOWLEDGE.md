---
name: test-automation
description: "Unit/component/E2E test automation for JS/TS: TDD loops, Playwright suites, mocking, visual regression, flaky-test stabilization, CI pipelines, reports and migration from legacy runners. This bundle writes and maintains tests; it does not design product requirements (`qa-core` for test design, `q..."
display_name: "Test automation"
icon: book
---
# Test automation

Unit/component/E2E test automation for JS/TS: TDD loops, Playwright suites, mocking, visual regression, flaky-test stabilization, CI pipelines, reports and migration from legacy runners. This bundle writes and maintains tests; it does not design product requirements (`qa-core` for test design, `quality-gates` for contracts and gates).

## Conventions

- Quick vs standard pairs: `writing-unit-tests-quick` / `test-driven-development-quick` are the compact forms of `writing-unit-tests` / `test-driven-development` — pick quick for one small function or fix, standard for legacy code, doubles or a full suite review. Same split for `code-review` vs `code-review-advanced`.
- `unslop-tests` applies to any test code this bundle produces: no tests that pass without proving anything.
- Browser work needs the Playwright MCP server from the `qa-mcp` plugin.

## Evidence and enforcement

Pinned by `evals/test-automation.cases.jsonl` (quick/standard pair routing) and the repo's build gates (`test-file-guard`, `red-test-deletion-guard` hooks wired via `npm run check`).
