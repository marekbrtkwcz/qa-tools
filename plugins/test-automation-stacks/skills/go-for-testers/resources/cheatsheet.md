# Go cheatsheet for testers

One page. Syntax → test-flavored example → the pitfall that bites in suites.

| Concept | Syntax | Test example | Pitfall |
| --- | --- | --- | --- |
| run all tests | `go test ./...` | CI unit job | cached results read as green — `-count=1` |
| table-driven | `tests := []struct{ name, in, want string }{...}` | case matrix | `name` left empty — useless subtest IDs |
| subtest | `t.Run(tt.name, func(t *testing.T) {...})` | per-case failure messages | `if` special-cases per row — those are separate tests |
| run one subtest | `go test -run 'TestLogin/invalid_password'` | red-green loop on one case | over-broad `-run` regex catching neighbours |
| continue vs stop | `t.Errorf` vs `t.Fatalf` | assertion helpers | `Fatalf` from a non-test goroutine — use `t.Error` + return |
| assertion helper | `func assertOK(t *testing.T, got, want string) { t.Helper(); ... }` | shared checks | missing `t.Helper()` — failures point inside the helper |
| testify in subtests | build `assert.New(t)` inside the `t.Run` closure | testify suites | parent-bound `is` — subtest failures misattributed |
| teardown | `t.Cleanup(func() { db.Close() })` | setup/teardown | bare `defer` in a helper — skipped when helper returns early |
| file fixtures | `dir := t.TempDir()` | export/download tests | writing into the repo dir — pollutes the working copy |
| env var | `t.Setenv("API_URL", srv.URL)` | env-dependent code | under `t.Parallel` — panics by design |
| skip in smoke | `if testing.Short { t.Skip("slow") }` + `-short` | CI smoke job | unconditional `t.Skip` — coverage silently gone |
| parallel | `t.Parallel()` inside `t.Run` case | faster suites | shared package state mutated concurrently |
| poll, don't sleep | `for deadline.After(...) { if ok() { return }; time.Sleep(10ms) }` | async readiness | `time.Sleep(1s)` — the classic flake |
| inject the clock | `type Clock interface { Now() time.Time }` | time-dependent tests | monkey patching — Go has none, build the seam |
| API double | `srv := httptest.NewServer(http.HandlerFunc(handler))` | fake third-party API | mocking the client library instead of the server |
| handler white-box | `httptest.NewRecorder()` + `handler.ServeHTTP` | fast handler tests | asserting on the recorder in transport tests — use the server |
| HTTP client | `client := &http.Client{ Timeout: 5 * time.Second }` | API tests | no timeout on the client — a hung test eats the suite |
| ctx timeout | `ctx, cancel := context.WithTimeout(ctx, 2*time.Second); defer cancel()` | slow-dependency tests | creating ctx and ignoring it in the call |
| build tag | `//go:build integration` (top of file) + `-tags=integration` | separate integration job | no CI job with the tag — dead coverage |
| race detector | `go test -race ./...` | every CI run | "slow in CI" — races ship to production |
| goroutine leaks | `goleak.VerifyTestMain(m)` in `TestMain` / `defer goleak.VerifyNone(t)` | concurrency tests | no goleak — leak surfaces as an unrelated flake |
| synctest | `synctest.Test(t, func(t *testing.T){...})` (Go 1.25+) | timers, ctx deadlines | timing-based tests on real clocks — flakes |
| fuzzing | `func FuzzReverse(f *testing.F)` + `f.Add("hello")` + `-fuzz=FuzzReverse` | property-based cases | treating fuzz seeds as throwaway — crash corpus is a regression case |
| benchmark | `func BenchmarkXxx(b *testing.B)` + `b.Run` per variant, `b.Loop()` (Go 1.24+) | before/after with `benchstat` | `b.N` hand-rolled loops; comparing single noisy runs |
| example | `func ExampleAdd()` with `// Output:` comment | executable documentation | builtin `println` writes to stderr — `// Output:` compares stdout; no `// Output:` comment means never run |
| shuffle | `go test -shuffle=on ./...` | order-dependence sweep | only ever running the fixed order |
| vet / lint | `go vet ./...` + `golangci-lint run` | CI gate | format-only gate — `gofmt` is not linting |
| coverage | `go test -coverprofile=cover.out ./... && go tool cover -func=cover.out` | diff-scoped gate | whole-repo % hiding untested new code |
| CI output | `gotestsum --format pkgname` (or `go test -json`) | readable CI logs | raw `go test` noise nobody reads |
| browser E2E | `chromedp` or `playwright-go` (pick one) | user journeys | mixing both in one suite — double driver, double flake |

Rule of thumb: **the stdlib is the framework**. Every dependency added to a test suite must beat the 5-line stdlib version it replaces.
