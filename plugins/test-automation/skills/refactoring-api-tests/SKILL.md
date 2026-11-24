---
name: refactoring-api-tests
description: 'Refactors simple working Playwright API tests into a production-ready architecture: typed models, payload factories, class-based request/steps layers, fixtures for dependency injection, HTTP status and endpoint constants, datasets, and guaranteed cleanup — without changing what the tests verify. Use when API spec files use the raw `request` fixture, hardcoded URLs, raw status numbers, untyped `response.json()`, or inline payload objects. For refactoring UI tests into page objects, use refactor-to-page-objects; for writing new API tests from scratch, use api-playwright-test-developer.'
argument-hint: 'The spec file(s) or folder to refactor'
user-invocable: true
---

# Refactoring API Tests

Simple, working API tests accumulate the same problems: raw `request` fixture in every test, hardcoded URLs, magic status numbers, untyped responses, inline payloads, and created resources left behind. This skill turns them into a typed, layered, cleanup-safe architecture while preserving every assertion and scenario.

## When NOT to Use

- UI/E2E specs → use `refactor-to-page-objects`
- Writing API tests from zero → use `api-playwright-test-developer`
- The tests already use fixtures and typed layers → review with `code-review-advanced` instead

## Scope Rule

Refactor **only** the spec file(s) the user names. If no file is given, ask which one and stop. Never decide on your own, never sweep the whole `tests/` folder.

## Workflow

### 1. Baseline
Run the target spec and record the result (passed/failed per test). Do not refactor specs that already fail — list them and leave them unchanged.

### 2. Inventory the existing architecture
Read the project's `requests/`, `steps/`, `fixtures/`, `consts/` equivalents (paths may differ). Extend existing classes and fixtures; do not create duplicate files. If the 3-layer pattern does not exist yet, introduce it following `resources/api-architecture-blueprint.md`.

### 3. Refactor the spec
Replace, in this order:
1. `request` fixture → resource request/steps fixtures injected via `test.extend`
2. hardcoded base URLs → `.env` + `baseURL` in `playwright.config.ts` (never URL constants in spec files)
3. raw `response.json()` → typed `parseResponse<T>(response)`
4. raw status numbers → named HTTP status constants
5. duplicated scenario blocks → dataset arrays + `forEach`
6. inline payload objects → factory functions (`getRandomXPayload()` / `getRandomXOverridePayload(overrides)`)
7. add the `@api` tag (plus resource/smoke/regression/schema tags) to every `describe`

### 4. Add cleanup
Every resource a test creates must be deleted: `afterEach` for per-test resources, `afterAll` for `beforeAll` seeds — always through the steps class, never raw requests.

### 5. Verify
- Run the target spec: `npx playwright test <spec> --project=api`
- Fix failures with minimal changes, max 3 repair attempts per failure; revert the spec if it still fails
- Run the spec a **second time** — done only when it passes twice in a row

## Guardrails

- Never break a passing test; never remove or weaken an existing assertion
- Never use `any` or untyped `response.json()`
- Never leave a created resource without cleanup
- Never declare success before two consecutive green runs

## Output

- Files created/modified, each with the architectural reason
- Key decisions and trade-offs (e.g. why steps over raw requests for a given call)
- Baseline vs final run results, side by side

## Resource Map

- `resources/api-architecture-blueprint.md`: the full 3-layer request architecture (generic client → resource request → steps), fixtures wiring, constants, models, factories, tags, folder structure, and forbidden patterns. Read when the project lacks this architecture or a layer is missing.

## Related Skills

- `refactor-to-page-objects` — the same refactor discipline for UI specs
- `api-playwright-test-developer` — request fixture and APIRequestContext reference
- `test-data-factories` — factory design with seeded Faker
- `testing-api-contracts` — schema validation assertions to keep intact during refactor

## Definition of Done

- Target spec passes twice in a row, with the same assertions as the baseline
- No raw `request` fixture, hardcoded URLs, raw status numbers, or inline payloads remain in the refactored spec
- Every `describe` carries the `@api` tag; every created resource has cleanup
- New layers/fixtures follow the blueprint and are wired into the project fixture
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
