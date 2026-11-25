---
name: testing-cli-tools
description: "Automates tests for command-line tools: exit codes, stdout/stderr assertions, flags and arguments, environment variables, stdin input, idempotent re-runs, and output snapshots — via `node:child_process` (spawnSync/execFile), `Bun.spawn`, or a thin wrapper module. Use when the product under test is a CLI (installer, migration runner, codegen, build tool), when a test must verify exact terminal output, or when CI steps are shell scripts that deserve tests."
argument-hint: "CLI under test, its interface (args/env/stdin), and the runner (node:test, bun test, Vitest, Playwright)"
user-invocable: true
---

# Testing CLI Tools

A CLI's contract is: **arguments + env + stdin in → stdout/stderr + exit code + filesystem effects out**. All five are testable without a terminal. The discipline: invoke the CLI as a subprocess (never import its internals to "test faster" — you would be testing a different program), assert on all outputs, and isolate the filesystem with a temp dir per test.

## When to Use

- the product is a CLI: installer, codegen, migration runner, build/lint tool
- CI steps are shell scripts that keep breaking silently
- "the command prints the right thing but exits 1" class of bugs
- snapshot-testing CLI output (help text, report formats)

## Harness pattern

```ts
import { spawnSync } from 'node:child_process';   // or Bun.spawn / execFile promisified

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runCli(args: string[], opts: { env?: Record<string, string>; input?: string; cwd?: string } = {}): CliResult {
  const res = spawnSync(process.execPath, ['dist/cli.js', ...args], {
    encoding: 'utf8',
    cwd: opts.cwd ?? fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-')),
    env: { ...process.env, ...opts.env },
    input: opts.input,
    timeout: 10_000,
  });
  return { code: res.status, stdout: res.stdout, stderr: res.stderr };
}
```

- **Run the built artifact** (`dist/cli.js`), not the TS source — tests must cover what ships. (Exception: fast unit tests of arg parsing may import the parser directly; keep those separate.)
- **Temp cwd per test** (`fs.mkdtempSync`) — filesystem effects stay isolated; assert created files inside it.
- **Timeout on every spawn** — a hung CLI must fail the test, not the pipeline.
- Bun projects: `Bun.spawn(['bun', 'run', 'cli', ...args])` with the same result mapping.

## What to assert

| Surface | Assertion style |
| --- | --- |
| exit code | `expect(res.code).toBe(0)`; for failures assert the *specific* code, not just non-zero |
| stdout | exact match for stable output; `toContain` for paths/timestamps; snapshot for help/report text |
| stderr | errors go to stderr, not stdout; assert the message, redact secrets |
| args/flags | required-flag missing → code 2 + usage on stderr; unknown flag rejected |
| env vars | behavior changes with env (`NO_COLOR`, `CI`, custom config path); test with and without |
| stdin | pipe input (`input:` option), assert it was consumed correctly |
| filesystem effects | files created/updated/deleted in the temp cwd — assert content, not just existence |
| idempotency | run twice, second run is a no-op with same exit code and no duplicated side effects |

## Red Flags

- asserting only exit code 0 — a CLI can succeed while printing garbage
- tests that depend on the developer's cwd, env, or globally installed binary — always temp cwd + explicit env
- no timeout on spawn — one hang blocks CI until the job timeout
- snapshot tests of output containing absolute paths/timestamps — normalize before snapshot (replace tmpdir, dates)
- shelling out through `shell: true` with string interpolation — injection + flaky quoting; pass args as array
- testing src via ts-node instead of the built dist — ships a different program than users run

## Related Skills

- `testing-with-bun` - Bun-native spawn/test runner for CLI suites
- `writing-unit-tests` - when part of the CLI is pure logic worth unit-testing directly
- `test-data-factories` - generating input files for CLI runs
- `mocking-network-and-time` - freezing time/pinning TZ for deterministic output snapshots
- `automating-ci-test-pipelines` - running the CLI test suite in CI on the built artifact
- `unslop-tests` - assertions must prove behavior (no exit-code-only tests)

## Definition of Done

- every documented flag/env/stdin path has at least one subprocess test
- success and failure paths assert exit code + the right stream carries the message
- filesystem effects are asserted in an isolated temp cwd
- re-running the command is proven idempotent where the CLI claims it
- the suite runs against the built artifact with a per-spawn timeout, green in CI
