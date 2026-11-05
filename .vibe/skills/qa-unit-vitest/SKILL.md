---
name: qa-unit-vitest
description: Load when the user wants to plan, write, refactor, or review unit tests (Vitest) for TypeScript/JavaScript code with mandatory coverage thresholds. Orchestrates agents/unit. Keywords: unit tests, vitest, testy jednostkowe, coverage, mockowanie, vi.mock.
---

# 🧪 QA Unit Tests — Vitest

Workflow for unit testing TS/JS code with **Vitest** + **coverage** (mandatory, thresholds enforced).

## ⛓️ Pipeline

1. **Plan** — `agents/unit/unit-test-planner.agent.md`: read the code under `src/`, produce scenario file(s) in `docs/scenarios/unit/` (happy path / edge cases / error paths / mocks)
2. **Write** — `agents/unit/unit-test-writer.agent.md`: write working `tests/unit/*.spec.ts`, run until green, then verify coverage thresholds
3. **Refactor** — `agents/unit/unit-test-refactor.agent.md`: helpers, factories, DRY (only provided files, coverage must not drop)
4. **Review** — `agents/unit/unit-test-code-review.agent.md`: strict checklist with BEFORE/AFTER per finding

## 📌 Setup

- `setups/unit-testing-vitest.instructions.md` — dedicated project for unit-testing your own TS/JS code
- Shared: `shared/vitest.config.ts` → `vitest.config.ts`, `shared/biome.json`, `shared/tsconfig.base.json`, `shared/conventions.md`

## 📏 Rules

- **Coverage is mandatory**: `npm run coverage` (`vitest run --coverage`) must pass thresholds from `vitest.config.ts` (default 80% statements/branches/functions/lines); HTML report in `coverage/` (gitignored)
- Explicit vitest imports: `import { describe, expect, it, vi, beforeEach } from 'vitest'`
- Specs ONLY in `tests/unit/**/*.spec.ts` — never in `src/`; source under test in `src/`
- ESM everywhere: `"type": "module"`, relative imports with `.js` suffix
- Mocks: `vi.mock` / `vi.fn` / `vi.spyOn`, `vi.restoreAllMocks()` in `afterEach`; no real fs/network/timers in unit tests
- Dynamic data only via **@faker-js/faker** (`src/utils/faker.ts`) with `faker.seed()` in `beforeEach`
- Env only via singleton `src/config/env.ts` (`env.X`), never raw `process.env`
- zod for validating structures (config, payloads) inside the code under test
- Lint/format with Biome; latest dependency versions (security), lockfile committed
