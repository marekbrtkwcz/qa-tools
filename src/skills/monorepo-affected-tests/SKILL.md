---
name: monorepo-affected-tests
description: "Runs only the tests affected by a change in a monorepo: Nx/Turbo `--affected` filtering, mapping changed files to Playwright projects or packages via the dependency graph, CI wiring (merge-base diff, changed-file list as artifacts), tag-based scoping as a fallback, and handling shared libraries that everything depends on. Use when a monorepo's full test suite is too slow for every PR and CI should run only what the diff can break. For reasoning about blast radius in general, use analyzing-regression-scope (quality-gates)."
argument-hint: "Monorepo tooling (Nx/Turbo/none), test runner, and CI provider"
user-invocable: true
---

# Affected Tests in a Monorepo

In a monorepo, most PRs touch one package; running the whole suite wastes CI time and trains developers to ignore slow pipelines. The goal: **run exactly the tests the diff can break** — no more, no less — with a safe fallback to the full suite when the mapping is uncertain.

## When to Use

- "the full suite takes 40 min, PRs should run 5"
- "wire `--affected` into CI for our Nx/Turbo monorepo"
- "which Playwright projects do I need for a change in `libs/api-client`?"
- a shared lib changed — everything downstream must run

## Approaches, best first

1. **Tool-native affected (preferred):** Nx (`nx affected -t test`, `nx run-many -t test --projects=...`) or Turborepo (`turbo run test --filter=[HEAD^1]` / `--filter=...^...`). The tool owns the dependency graph; do not reimplement it.
2. **Playwright projects per package:** define one Playwright `project` per app/package with a `testDir`/`testMatch` scoped to it; in CI compute affected projects from changed files (`git diff --name-only origin/main...HEAD` → map path prefix → project name) and pass `--project=a --project=b`. If the diff touches `playwright.config.ts` or shared test utils, run all projects.
3. **Tag + grep fallback:** when projects are not per-package, tag tests (`test('...', { tag: '@cart' })`) and run `--grep @cart` for diffs under `**/cart/**`. Coarser, but works in any setup.
4. **Full suite as fallback:** if the changed-file → test mapping is ambiguous (shared config, codegen, migrations, lockfile), run everything. A false "affected" set that misses a break is worse than a slow green run.

## CI wiring

- Compute the base: `git fetch origin main` then `git diff --name-only origin/main...HEAD` (merge-base, not `HEAD^1` — rebases break the latter).
- Cache the dependency graph between runs (Nx Cloud or Turbo remote cache) so `--affected` is fast.
- Emit the affected project list as a CI artifact/summary line so reviewers can see what ran.
- Nightly or merge-queue job runs the **full** suite — affected runs are the PR gate, not the only signal.

## Shared libraries are the trap

A change in `libs/types` or `libs/ui-kit` affects every consumer. Both Nx and Turbo handle this via the graph — the tag/grep fallback must special-case shared paths (a `SHARED_PATHS` list in the workflow: diff matches → full run). Keep that list short and explicit.

## Red Flags

- `HEAD^1` instead of merge-base as the diff base — wrong after rebase/merge commits
- affected filtering with no full-suite backstop (nightly) — silent coverage erosion
- mapping only app dirs and forgetting e2e projects, or vice versa
- "it ran only 2 tests" on a PR that touched shared config — the fallback rule exists for exactly this
- optimizing CI time by skipping tests rather than scoping them — that is a waiver, and waivers need owner + expiry (`governing-quality-waivers`)

## Related Skills

- `analyzing-regression-scope` (quality-gates) - deciding what a change can break conceptually
- `scoping-change-relevance` (quality-gates) - diff tagging that maps to which checks a PR needs
- `test-impact-analysis` (quality-gates) - impact analysis as a tracked practice
- `automating-ci-test-pipelines` - CI structure: PR gate vs nightly, caching, merged reports from shards
- `governing-quality-waivers` (quality-gates) - if a suite is deliberately excluded from affected runs
- `designing-test-automation-architecture` - project/tag layout that makes affected mapping possible

## Definition of Done

- PR CI runs the affected subset via the tool-native mechanism (`--affected` / `--filter`) or a reviewed path→project mapping
- diff base is the merge-base against the target branch, verified on merge commits
- shared configs/libs trigger the full suite (explicit fallback list)
- a nightly/merge-queue full-suite job exists and its history is kept
- the affected list is visible in the CI summary, and the runtime saving is measured and recorded
