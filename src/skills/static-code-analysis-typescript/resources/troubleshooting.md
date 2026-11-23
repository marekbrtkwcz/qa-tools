# Troubleshooting - Static Code Analysis for TypeScript

## Imports keep re-ordering on every save

**Symptom:** imports flip between two orderings; dirty files with no edits.
**Cause:** VS Code's built-in `source.organizeImports` fights Biome's `organizeImports` assist.
**Fix:** remove `"source.organizeImports"` from `.vscode/settings.json` `editor.codeActionsOnSave` and let the Biome extension own import order. See `./import-sorting.md`.

## Import order churn right after migrating from an import-sort plugin

**Symptom:** many import-order diagnostics after switching from `simple-import-sort` or a Prettier sort plugin.
**Cause:** the old plugin grouped imports differently; Biome's organizer has its own documented order and does not port the old grouping.
**Fix:** run `npx biome check --write .` once and commit the re-sort separately from any functional change.

## Biome reports config errors after upgrading Biome

**Symptom:** diagnostics about unknown options or schema mismatch, and nothing else changed.
**Cause:** `biome.json` and the Biome binary are version-coupled; `$schema` names the version the config was written for. Major upgrades (e.g. 1.x → 2.x) changed option shapes and glob semantics (in 1.x, `*` matched path separators; in 2.x it does not).
**Fix:** run `npx biome migrate --write` (config migration) after upgrading the pinned version, re-run `npx biome check .`, and update the `$schema` URL to the new version. Keep the version exact-pinned so contributors and CI fail identically.

## `biome ci` passes locally but the npm script differs in CI

**Symptom:** local `npx biome check .` is clean; `npm run check:ci` in CI fails with different findings.
**Cause:** CI ran a different Biome version (floating install, or `setup-biome` with `version: latest`).
**Fix:** install with `-E`, run CI through the repo's pinned dependency (`npm run check:ci`), and pin a version if you use `biomejs/setup-biome@v2` instead of the npm package.

## Generated folders (playwright-report, test-results) get flagged

**Symptom:** diagnostics inside build or test artifacts.
**Cause:** they are not in `.gitignore` (or `vcs.useIgnoreFile` is off), so Biome processes them.
**Fix:** enable `vcs.enabled` + `vcs.useIgnoreFile` so Biome defers to `.gitignore`; for folders that must stay committed, add an `overrides` entry disabling the linter and formatter (see `./example-configs.md`).

## `biome check --changed` checks nothing or the wrong set

**Symptom:** no files processed, or every file processed, despite using `--changed`.
**Cause:** `vcs.defaultBranch` missing (or pointing at a branch that does not exist), so Biome cannot establish a diff baseline; note that a branch-local run never re-lints downstream importers of a changed file.
**Fix:** set `vcs.defaultBranch` to the repo's real default branch; keep whole-repo coverage in CI.

## `tsc:check` fails but `biome check` passes

**Symptom:** type errors that Biome does not surface.
**Cause:** Biome has no type checker; only some rules use lightweight type inference.
**Fix:** keep `tsc:check` as a separate gate in `check` and `check:ci` - removing it when migrating to Biome is a regression, not a cleanup.

## A nursery rule behaves differently after an upgrade

**Symptom:** findings change for one specific rule after a Minor Biome upgrade.
**Cause:** nursery rules are experimental and can change behavior between releases.
**Fix:** re-read the rule's documentation for the pinned version; if the behavior is undesired, downgrade the rule severity or remove it - and re-verify whether it still earns its place in `biome.json`.

## Pre-commit hook is slow

**Symptom:** commits take too long.
**Cause:** the hook runs whole-project checks, or `tsc:check` runs on every commit.
**Fix:** keep the hook at `biome check --staged --write` (staged files only); move `tsc:check` to pre-push or CI.
