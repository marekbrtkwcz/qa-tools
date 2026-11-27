---
name: go-for-testers
description: "Go fundamentals for testers writing automated tests: go.mod single toolchain, table-driven tests with subtests (t.Run, t.Parallel), t.Cleanup/t.TempDir/t.Setenv, httptest fake servers, consumer-side interfaces for fakes, the -race detector and goleak, -count=1 against the test cache, stdlib fuzzing as property-based testing, golangci-lint as the CI gate, chromedp/playwright-go for browser E2E. Use when onboarding a tester to Go or leveling up a team on gotest. For the tests themselves use writing-unit-tests; for the same leveling skill in Python see python-for-testers."
argument-hint: "Team's current Go level and the test code that is hardest to maintain"
user-invocable: true
---

# Go for Testers

This is the language-leveling skill: enough Go to write tests that are readable, race-free, and pass `gofmt`, `go vet` and `golangci-lint` in CI. It is **not** about porting conventions from JS/TS (there is no Go chapter in `port-suite-to-python-java` — translate concepts, not syntax) and **not** about test design (see `writing-unit-tests`, `designing-test-data`). Go's stdlib `testing` package plus `gotest` is the whole runner: no framework to install, no plugins — the language is deliberately small and the test tooling is deliberately boring.

## When to Use

- onboarding a tester (manual or automation) to Go and gotest
- "the suite is green locally but red in CI" — usually the test cache or `-race`
- "table-driven tests — how do I structure the cases and name them?"
- leveling up: `httptest` fake servers, consumer-side interfaces for fakes, build tags for integration tests
- reviewing PRs where tests sleep instead of polling, or share package-level state

## Core concepts, in the order a tester needs them

1. **Toolchain and modules.** No virtualenv equivalent — one toolchain per machine, version pinned via `go.mod` (`go 1.22` + `toolchain` directive) or `go.work` in a monorepo. Dependencies live in `go.mod`, tidied with `go mod tidy`; never vendor by hand. `go test ./...` runs every package's tests; `go test ./internal/...` scopes to a subtree.
2. **Test anatomy.** Test code sits next to production code in `foo_test.go` — one test file per source file, named after the source file (`foo.go` → `foo_test.go`), never after the function under test: tools (`go test`, coverage, jump-to-test) and reviewers all resolve by source file. Same package for white-box, `foo_test` package for black-box; `func TestLogin(t *testing.T)` — no classes, no registration, discovery is the naming convention. Keep test functions in the order their tested functions appear in the source, so a reader can match them by position. gofmt formatting is not a style choice; CI fails on `gofmt -l .` output.
3. **Table-driven tests.** The Go counterpart of parametrize: `tests := []struct{ name, in, want string }{...}` then `for _, tt := range tests { t.Run(tt.name, func(t *testing.T) {...}) }`. The `name` field becomes the subtest ID — assert on it in CI logs (`-run 'TestLogin/invalid_password'`). One case that needs different plumbing does not fit the table: write it as a separate test.
4. **The `t` utilities.** `t.Helper()` marks assertion helpers so failures point at the caller; `t.Cleanup(func(){...})` runs even when the test panics — the counterpart of `yield`-fixture teardown; `t.TempDir()` for file fixtures (auto-removed); `t.Setenv()` for env vars (restored after, panics under `t.Parallel`); `t.Skipf` + `if testing.Short { t.Skip(...) }` for `-short` smoke runs; `-timeout` kills a hung test — check `t.Deadline()` inside long helpers.
5. **Parallelism.** `t.Parallel()` opts a test or subtest into the parallel set (`-parallel N` caps it). Package-level mutable state is the enemy: parallel tests in one package share it. Since Go 1.22 the loop variable is per-iteration, so `tt := tt` is no longer needed — but any struct captured by a parallel closure must not be mutated by other cases.
6. **Assertions.** Stdlib pattern first: `if got != want { t.Errorf("login: got %v, want %v", got, want) }` — `t.Errorf` continues the test, `t.Fatalf` stops it (only from the test goroutine; from a helper goroutine use `t.Error` + return). testify is acceptable if the team already uses it (`require` = fail-now, `assert` = continue) — pick one style per suite, never mix. One testify trap worth teaching: `is := assert.New(t)` binds the parent `t`, so reusing `is` inside `t.Run` subtests attributes every failure to the parent and the failing subtest still reports PASS — build the instance inside each subtest closure.
7. **Fakes and interfaces.** Go has no monkey patching: seams are built in. Define the interface at the consumer, not the producer (`type Clock interface { Now() time.Time }` next to the code under test), and inject a 5-line fake. `httptest.NewServer(http.HandlerFunc(...))` is the API double — a real HTTP server on a random port, no framework. Hand-rolled fakes beat heavyweight mock frameworks; reach for `testify/mock` only when the fake would encode the implementation it is testing.
8. **API and HTTP tests.** `httptest.NewRecorder()` exercises an `http.Handler` without a socket (fast, white-box); the real `http.Client` against an `httptest.NewServer` double exercises transport, headers and status codes. Long integration suites get their own package behind `//go:build integration`, run with `-tags=integration` in a separate CI job — visible and deliberate, not silently skipped.
9. **Determinism gates.** `-race` on every CI run — the race detector is Go's best tester-side tool and it is off by default. `go test` caches passing results: a green local run may be a cache hit, so CI passes `-count=1`. `-shuffle=on` exposes order dependence. Never `time.Sleep` waiting for async work: poll with a deadline (`t.Deadline`, a `for ... until` loop with short sleep) or inject the clock; pass `context.Context` with `context.WithTimeout` and actually honor cancellation in helpers. On Go 1.25+, `testing/synctest` runs goroutines, timers and ctx deadlines on a synthetic clock — time advances only when everything blocks — making timing-based tests deterministic without clock injection. For packages that spawn goroutines, `goleak.VerifyTestMain` in `TestMain` (or `defer goleak.VerifyNone(t)` per test) turns a leaked goroutine into a red test instead of a mysterious later failure.
10. **Tooling gate.** `gofmt`/`goimports` format, `go vet` (always), `staticcheck` + `golangci-lint` as the CI lint gate (the Go counterpart of Biome/ruff — one `.golangci.yml`, same command locally and in CI). Coverage: `go test -coverprofile=cover.out ./...` then `go tool cover -func=cover.out` — gate on the packages the change touched, not a whole-repo number. `gotestsum` formats CI output; `-json` feeds any reporter.
11. **Beyond unit tests — same toolchain.** Fuzzing (`func FuzzReverse(f *testing.F)` with `f.Add` seeds, `go test -fuzz=FuzzReverse`) is Go's built-in property-based testing — the stdlib counterpart of the fast-check workflow in `property-based-testing`, and a crash becomes a seed corpus entry in `testdata/`. Benchmarks (`func BenchmarkXxx(b *testing.B)`, one `b.Run` per variant so comparison tooling can name them; `b.Loop()` on Go 1.24+ instead of `b.N` loops) with `benchstat` for before/after comparisons — in-process micro-benchmarks, not load testing. `ExampleXxx` functions with an `// Output:` comment are executable documentation: `go test` fails when the example's stdout drifts.

## Browser E2E

There is no official Playwright binding for Go. `chromedp` (CDP-driven) and `playwright-go` (community bindings over the Playwright driver) are the realistic options — pick one per suite, wrap pages in the same page-object discipline as any other stack, and keep browser E2E to the journeys (`writing-playwright-tests-best-practices` for the principles; the selectors and waiting rules translate even though the API does not).

## Configuring a test project

Details in `./resources/go-project-config.md`. The short version: `go.mod` + `.golangci.yml` + a `Makefile` (or task runner) exposing `test`, `lint`, `race`, `integration`; `make test` = `gofmt -l . && go vet ./... && go test -race -count=1 ./...`, same commands in CI, `gotestsum` for readable CI logs.

## Cheatsheet

`./resources/cheatsheet.md` — one-page table: concept → syntax → test example → common pitfall.

## Red Flags

- `time.Sleep` as a wait — the Go flake generator; poll with a deadline, inject the clock, or on Go 1.25+ use `synctest`
- `assert.New(t)` created in the parent test and reused in subtests — failures attributed to the parent, subtest still PASS
- a package that spawns goroutines with no `goleak` check — the leak shows up as a flake in an unrelated test
- trusting a green `go test` run that was served from cache — CI runs `-count=1`
- `t.Setenv` inside a `t.Parallel` test — panics by design
- package-level mutable state shared by tests, mutated by tests — the parallelism killer
- a mock framework where a 5-line consumer-side interface would do
- helpers that ignore the `context.Context` — timeouts never fire, the suite hangs
- `-race` skipped in CI "because it's slow" — the race it would have caught ships to production
- integration tests behind a build tag that no CI job runs — invisible dead coverage
- one giant table-driven test with `if` special-cases per row — those rows are separate tests

## Related Skills

- `python-for-testers` - the same leveling skill for pytest/Python; the sibling, not the scope
- `port-suite-to-python-java` - porting JS/TS conventions to pytest/JUnit/NUnit (no Go chapter; translate concepts)
- `writing-unit-tests` / `test-data-factories` - the tests and factories themselves (runner-agnostic rules)
- `property-based-testing` - fast-check generators for JS/TS; Go's stdlib counterpart is fuzzing (item 11)
- `stabilizing-flaky-tests` - the fix loop for flakes this skill's Red Flags predict
- `static-code-analysis-typescript` - the JS/TS tooling gate; the Go gate is gofmt + golangci-lint described here

## Definition of Done

- the tester can read and write table-driven tests, subtests and parallel tests without shared mutable state
- `gofmt`, `go vet` and `golangci-lint` pass over source + test code; CI runs `-race -count=1`
- httptest doubles cover the API seams; integration suites run visibly behind a build tag
- at least one real test file was refactored from sleep-based waits or shared globals to polling-with-deadline and injected fakes as the exercise
