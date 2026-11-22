---
name: bootstrap-test-suite
description: 'Boots a Playwright Test (and optionally Vitest) setup from zero into a first green smoke test: detects an existing setup first, scaffolds config with CI-aware retries, trace and forbidOnly, wires scripts, tsconfig and env, writes the first smoke test, and runs it. Use when a repository or workspace has no automated tests yet, when a new repo needs the first suite scaffolded deterministically, or when a team asks "set up Playwright for us". For deciding what belongs at which layer before scaffolding, use designing-test-automation-architecture; for porting an existing Cypress/Selenium suite, use migrating-tests-to-playwright.'
argument-hint: 'Workspace root, target test type (E2E, component, unit, or all), preferred runner if any, and CI provider if known'
user-invocable: true
---

# Bootstrap a Test Suite

Use this skill when a project has no automated tests and needs its first suite standing, green, wired into scripts and ready for CI - without invented conventions that the rest of the collection then has to fight.

The characteristic failure of a bootstrap is not the missing config file, it is the accidental framework: three tries at `playwright.config.ts`, three naming schemes, the smoke test that needs manual login, and secrets pasted into a test file. Everything below is arranged so the first suite built in a repo is one a reviewer would have written.

## When to Use

- a repository has no test runner installed and the user asks for E2E or smoke coverage
- a new service or workspace inside a monorepo needs its own first suite
- an empty repo needs a deterministic "make it testable" pass before feature work starts
- a team wants Playwright plus Vitest set up together with one convention set

## Operating Principles

- **Detect before creating.** An existing `playwright.config.*`, `vitest.config.*`, or test script in `package.json` means extend, never duplicate. Say what you found and stop if the user wanted a parallel setup.
- **One convention set, stated.** File naming, folder, and selector/list-id conventions are chosen once, written down, and followed by everything the bootstrap generates.
- **CI-aware from the first line, not retrofitted.** Retries, `forbidOnly`, trace on failure and base URLs come from the thinking about where the suite will run, before the second test exists.
- **Nothing real is invented.** No fake "env" values silently committed, no credentials inline, no assumed base URL the user never gave. Missing input is asked for.
- **Green is the gate.** A bootstrap ends with a run, not with files.

## Workflow

### Phase 0: Detect and decide

1. Look for `package.json`, `playwright.config.*`, `vitest.config.*`, CI workflows, and existing `*.test.*` / `*.spec.*` files. Report what you found before creating anything.
2. Ask only for missing essentials: the base URL or app entry, whether the app runs locally (and how to start it), and the package manager (`npm` / `pnpm` / `yarn` - the commands differ).
3. Decide the scope of this bootstrap: E2E only, unit only, or both. Do not scaffold a layer nobody asked for.

### Phase 1: Install and scaffold

4. Install with the packager the repo uses, never a guess: `npm init playwright@latest` asks the right scaffolding questions; `npm i -D @playwright/test vitest` is the manual equivalent. Install browsers with `npx playwright install --with-deps` (Linux CI needs the deps; Windows needs no extra step beyond the browsers).
5. Configure `playwright.config.ts` with the decisions visible: `baseURL`, `trace: 'on-first-retry'`, `retries` set for CI and lower locally (usually 0 local / 1-2 CI in one config via env), `forbidOnly: !!process.env.CI`, `workers` conscious (local often fewer), `reporter` list locally and HTML artifact in CI, one `chromium` project first - more browsers are added deliberately, not by scaffold.
6. Scripts into `package.json` under the packager's conventions: `test`, `test:ui`, `test:headed`, plus a `pretest` or documented step that builds/serves the app if it cannot be reached without one.
7. `tsconfig` for tests: either the project's or a small `tests/tsconfig.json` - never a second full compile config that fights the app's.

### Phase 2: Env and secrets

8. Environment through `.env` or CI variables, loaded on purpose (`dotenv` or runner support), and the local example committed as `.env.example` with placeholder values only.
9. No credential ever enters a test file or config. Where the first smoke needs auth, wire `storageState` off a to-be-created setup and load `testing-auth-flows` before guessing.

### Phase 3: First smoke, then stop

10. Write exactly one smoke test against the base URL that asserts something the user confirms is true for every deploy (title, a known route's response, one element reachable without login).
11. Run it. `npx playwright test` - quote the output. If flaky on first run, do not add `waitForTimeout`; load `diagnosing-test-failures`.
12. Stop. Ends of bootstraps are where bloat begins: no page-object hierarchy, no fixture cathedral, no twelve example tests. The architecture decisions belong to `designing-test-automation-architecture` when the suite grows.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "Just scaffold a default config" | `create playwright` defaults assume no CI and no baseURL; every later test then hardcodes URLs. | Set `baseURL`, CI retries, `forbidOnly` in the first pass. |
| "Add retries now so we're safe" | Retries at zero tests hide real determinism bugs from day one. | Retries are a CI concession; fix flakes in Phase 3 or later, not at bootstrap. |
| "I'll put the test password in the config, it's just staging" | It leaks into screenshots, traces, and git history. | Env variable plus `storageState`; loading `testing-auth-flows` for the pattern. |
| "Let's generate example tests for every page while we're at it" | Twelve un-curated tests rot into a red suite nobody trusts. | One green smoke; coverage grows per `designing-functional-tests`. |
| "Skip the browsers, the CI has them" | First CI run fails at the `playwright install` step that was never checked. | Verify the install step in the pipeline recipe; load `automating-ci-test-pipelines` for wiring it. |

## Red Flags

- A bootstrap happened and no test was run (or the run was not quoted in the summary).
- Two `playwright.config.*` files, or one in the repo root and one in `tests/`.
- A hardcoded URL, credential, or account email inside a test file.
- Scaffolding in the requested packager's style while the repo uses another.
- The generated smoke passes only with `test.skip` conditions or a `waitForTimeout`.

## Related Skills

- `designing-test-automation-architecture` - layer placement and conventions once the suite has more than boots in it
- `testing-auth-flows` - storageState and setup projects when the smoke needs login
- `automating-ci-test-pipelines` - the CI wiring the bootstrap anticipates
- `diagnosing-test-failures` - when the first smoke does not pass
- `migrating-tests-to-playwright` - when "no tests" turned out to mean "Cypress already exists"

## Definition of Done

This skill is complete when:

- existing setup was detected (or its absence stated) before anything was created
- config exists with `baseURL`, CI-aware retries, `forbidOnly`, and `trace` on failure, each visible by `file:line`
- scripts work: `test` runs the suite, quoted output included
- env is loaded from variables with a committed example containing placeholders only
- exactly one smoke test exists, it asserts a user-confirmed invariant, and its run is quoted
- nothing beyond the smoke was scaffolded without being asked
