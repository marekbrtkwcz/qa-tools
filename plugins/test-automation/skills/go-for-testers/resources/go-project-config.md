# Go project config for testers

One `.golangci.yml` plus a `Makefile` carries the whole local gate. Copy this as the starting point for a Go test project; the same commands run in CI.

## go.mod (toolchain pin)

```go
module github.com/acme/app-tests

go 1.22
```

Dependencies: `go get <pkg>` then **always** `go mod tidy` — an untidied `go.mod` fails CI. In a monorepo, a `go.work` file at the root joins the modules so test helpers work across repos without `replace` hacks.

## .golangci.yml

```yaml
version: "2"

linters:
  default: standard      # go vet's set plus basics
  enable:
    - staticcheck        # the real analysis pass
    - errcheck           # unchecked errors — the silent test bug
    - govet
    - ineffassign
    - unused
    - thelper            # missing t.Helper() in assertion helpers
    - paralleltest       # parallel tests sharing state / missing t.Parallel
    - testifylint        # testify misuse (require vs assert, parent-bound assert.New)
  exclusions:
    presets:
      - comments         # keep the gate about code, not comment style

formatters:
  enable:
    - gofmt
    - goimports
```

Tune the set once as a team; a linter list that churns per PR is worse than a short stable list.

## Makefile (the local gate, mirrored by CI)

```makefile
.PHONY: test lint race integration

fmt:            ## fail on unformatted files
	gofmt -l . && test -z "$$(gofmt -l .)"

lint:           ## the CI lint gate
	golangci-lint run

test:           ## unit suite, no cache, race on
	go test -race -count=1 ./...

cover:          ## coverage of touched packages
	go test -coverprofile=cover.out ./... && go tool cover -func=cover.out

integration:    ## long suites behind the build tag
	go test -race -count=1 -tags=integration ./...

shuffle:        ## order-dependence sweep (nightly)
	go test -race -count=1 -shuffle=on ./...
```

`make test` is what a developer runs before pushing; CI runs the same targets with `gotestsum` for readable logs:

```bash
gotestsum --format pkgname -- -race -count=1 ./...
```

## CI wiring notes

- **`-race -count=1` are non-negotiable** — the race detector is the tool's gift to testers, and the test cache silently turns CI into a replay of local results.
- **Unit vs integration split**: integration packages sit behind `//go:build integration` and run in a separate job with `-tags=integration` — if no job carries the tag, that coverage is dead; grep the workflows for it.
- **Shuffle nightly**: `-shuffle=on` in a scheduled job catches order dependence before it becomes a flaky-workflow story.
- **Coverage gate on the diff**, not the repo: compute per-package coverage and fail only when the packages touched by the change regress.
- **Timeout**: pass `-timeout 10m` (or per-suite) — a hung test that eats the CI hour is worse than a red one.
