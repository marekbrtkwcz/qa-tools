# Changelog

All notable changes to the qa-tools plugin are documented here.
Format: `MAJOR.MINOR.PATCH` (SemVer). Plugin versions are tracked in `.vibe/plugins/qa-tools/plugin.json`.

## [1.2.0] - 2026-11-20

### Added
- New `contract` pipeline (4 subagents: `contract-test-planner`, `contract-test-writer`, `contract-test-refactor`, `contract-test-code-reviewer`) for consumer-driven contract testing with Pact (matchers with examples, provider states, negative interactions, Pact Broker publishing) and OpenAPI contract validation.
- New skill `contract-testing` (11th skill).
- Validator updated: `contract` area covered by shared naming convention (no `waitForTimeout` rule — not a UI pipeline).

## [1.1.0] - 2026-11-20

### Added
- New `db` pipeline (4 subagents: `db-test-planner`, `db-test-writer`, `db-test-refactor`, `db-test-code-reviewer`) for verifying data migrations / ETL: completeness (counts, checksums, sums), field-level diff, referential integrity, idempotency, rollback validation, transformation rules, schema drift.
- New skill `data-migration-testing` (10th skill).
- `scripts/validate-plugin.py` — stdlib-only structural validator (Python 3.11+), exit 0/1 for CI.
- `examples/` — reference scenario plan (`docs/scenarios/ui/login.md`) and Playwright test (`tests/ui/login.spec.ts`) following qa-tools conventions.
- `LICENSE` (MIT), this changelog, installation docs.

### Changed
- All 28 subagents now embed shared qa-tools conventions: test naming `should <result> when <condition>`, assertion standards (`await expect(...)`, never `waitForTimeout`), selector policy (`getByRole`/`getByLabel`/`getByText`/`getByTestId`), output paths, POM structure (refactor stage only, on request), common plan format and review report template.

## [1.0.0] - 2026-11-20

### Added
- Initial release: 6 pipelines (UI, API, E2E, mobile, visual, load/k6) × 4 stages (planner, writer, refactor, code reviewer) = 24 subagents.
- 9 skills, 3 knowledge entries, 3 hooks (lint test files, typecheck after agent, QA conventions on session start).
