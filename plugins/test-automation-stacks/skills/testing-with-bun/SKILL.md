---
name: testing-with-bun
description: "Runs and writes tests with the Bun runtime: `bun test` and the Jest-compatible `bun:test` API (describe/it/expect, mock.module, snapshots), bunfig.toml preload and coverage, watch mode, when to pick `bun test` over `node --test` or Vitest, and running Playwright under Bun (`bunx playwright test`). Use when a TS project uses Bun as its runtime/package manager and the test suite should run on it, or when suite speed is the bottleneck. For lint/format/type gates under Bun, use static-code-analysis-typescript."
argument-hint: "Current test runner and pain point (speed, config, compatibility)"
user-invocable: true
---

# Testing with Bun

Bun is a runtime, package manager, and test runner in one binary. This skill covers the **test-runner** role only; lint/format/type-check under Bun are covered by `static-code-analysis-typescript` (Biome + `tsc --noEmit` behave identically under Bun).

## When to Use

- "run our tests with Bun" / "migrate Jest or Vitest tests to `bun test`"
- "the suite is slow to start or run — can Bun help?"
- "Playwright tests under Bun: `bunx playwright test`"
- "configure preload/mocks globally for the suite" (`bunfig.toml`)
- deciding between `bun test`, `node --test`, and Vitest for a new project

## Choosing a runner

| Runner | Pick when |
| --- | --- |
| `bun test` | project already on Bun; Jest-style API wanted with zero config; fastest startup and execution for unit/integration tests |
| `node --test` | zero-dependency Node project, no extra runtime; native TS via type stripping on Node >= 24 |
| Vitest | need the Vitest ecosystem (workspace projects, UI mode, coverage via v8/istanbul, plugins), or the team already knows it |

Bun's test runner is **not** a reason to rewrite a green Vitest suite. Adopt it for new suites or when measured startup/run time is the bottleneck.

## Core workflow

1. **Run the suite:** `bun test` (discovers `*.test.ts` / `*.spec.ts`). Watch: `bun test --watch`. One file: `bun test path/to/file.test.ts`.
2. **API:** `import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'` — Jest-compatible (`expect(...).toBe`, `toHaveBeenCalledWith`, etc.), so most Jest tests run unchanged. TypeScript works natively — no loader, no build step.
3. **Module mocks:** `mock.module('module-name', () => ({ ... }))` — hoisted like `jest.mock`; restore with `mock.restore()` in `afterEach`.
4. **Snapshots:** `expect(x).toMatchSnapshot()`; update with `bun test --update-snapshots`.
5. **Coverage:** `bun test --coverage` (reports per-file line/function coverage; thresholds via `--coverage-threshold` if needed).
6. **Global setup (preload):** `bunfig.toml` at repo root:
   ```toml
   [test]
   preload = ["./test/setup.ts"]
   ```
   `test/setup.ts` registers global mocks, a DOM (`happy-dom` via `GlobalRegistrator`), fake timers, or test data builders. Keep it idempotent.
7. **Playwright under Bun:** install once with `bun add -D playwright` + `bunx playwright install`, then run tests with `bunx playwright test` (or keep `bun test` for unit tests and Playwright's own runner for E2E — mixing runners in one repo is fine if each suite has one runner).

## Rules

- **One runner per suite.** Do not split a single suite between `bun test` and Vitest; the mock/preload semantics differ subtly.
- **Same test-quality bar:** `bun test` does not excuse weak assertions — `unslop-tests` applies in full (no tautologies, no mock-only tests, no swallowed errors).
- **Type-check separately:** Bun strips types without checking them. Keep `tsc --noEmit` in CI as the type gate; `bun test` is the behavior gate.
- **Pin the binary:** `bun --version` in CI logs; behavior differs across Bun versions more than across Node LTS lines.
- **Playwright needs its browsers:** `bunx playwright install --with-deps chromium` on CI images; Bun does not replace that step.
- **Lockfile:** commit `bun.lock`; use `bun install --frozen-lockfile` in CI.

## Red Flags

- rewriting a passing Vitest/Jest suite to Bun for speed without a measured baseline (measure first: `time bun test` vs current runner on the same machine)
- `mock.module` leaks between tests because there is no `mock.restore()` — shared mutable mocks are the classic Bun flake source
- assuming `bun test --coverage` numbers are comparable to Vitest v8 coverage — they are not; pick one and trend it (`analyzing-quality-metrics`)
- running E2E Playwright specs through `bun test` instead of `playwright test` — you lose retries, sharding, trace viewer, and the reporter contract CI expects

## Related Skills

- `static-code-analysis-typescript` - Biome + `tsc --noEmit` under Bun (lint/format/type gates)
- `bootstrap-test-suite` - scaffolding the first suite (runner choice included)
- `writing-unit-tests` / `writing-unit-tests-quick` - the assertion quality bar, runner-agnostic
- `mocking-network-and-time` - what to fake and how, including MSW handlers that work under any runner
- `unslop-tests` - test anti-patterns; applies to `bun:test` code identically
- `test-data-factories` - deterministic fixtures for `bun test` suites
- `automating-ci-test-pipelines` - CI jobs running `bun test` with cache on `bun.lock`

## Definition of Done

- the suite runs green with one command (`bun test`, or `bunx playwright test` for E2E) on a clean clone
- `bunfig.toml` preload exists if global setup is needed, and mocks are restored between tests
- `tsc --noEmit` still passes — Bun strips types, it does not check them
- coverage is reported from one chosen tool and wired into the quality metrics
- CI runs the suite with `bun install --frozen-lockfile` and logs the Bun version
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
