---
name: automation-tester-learning-path
description: "A 30-60-90 style path through this collection for a tester joining or leveling up in test automation. Each stage names the skills to learn and the artifact to produce. Driver skills of orchestration packs are marked (pack)."
display_name: "Automation tester learning path"
icon: book
---
# Automation tester learning path

A 30-60-90 style path through this collection for a tester joining or leveling up in test automation. Each stage names the skills to learn and the artifact to produce. Driver skills of orchestration packs are marked (pack).

## Stage 0 — Prework: foundations (week 1)

Goal: shared vocabulary and tooling before writing tests.

- `typescript-for-testers` (+ resources: cheatsheet, typing-test-patterns, tsconfig-for-tests) — TS for test code, strict config, no `any`
- `static-code-analysis-typescript` — Biome + `tsc --noEmit` + CI gates (the repo standard)
- `testing-with-bun` — Bun as runtime/runner when the project uses it
- `ai-concepts-for-testers` (+ glossary, concept-to-skill-map) — AI vocabulary if the product ships LLM features
- Playwright intro: `bootstrap-test-suite`, `writing-playwright-tests-best-practices`
- API basics: `api-test-plan-and-tests`, `api-playwright-test-developer`

Artifact: a green smoke suite (unit + one API + one E2E) in a scratch repo, formatted by Biome, type-checked by tsc, run in CI.

## Stage 1 — Pyramid, bottom up (weeks 2–4)

- Unit: `writing-unit-tests` / `test-driven-development` (quick variants for small fixes), `test-data-factories`, `property-based-testing`, `mutation-testing`
- Component: `component-testing-vitest-rtl`
- API: `testing-api-contracts`, `pact-contract-testing`, `testing-webhooks`, `testing-idempotency-and-retries`, `testing-graphql-apis` / `testing-grpc-apis` as applicable
- Domain edges: `testing-email-and-notifications`, `testing-scheduled-jobs`, `testing-database-migrations`, `testing-cli-tools`, `testing-feature-flags`, `testing-offline-and-pwa`

Artifact: a layered suite for one real feature with fixtures, typed helpers, and CI running each layer separately.

## Stage 2 — E2E and UI depth (weeks 5–7)

- `writing-playwright-tests-best-practices`, `selector-strategy`, `refactor-to-page-objects`, `testing-auth-flows`, `mocking-network-and-time`, `hybrid-ui-api-testing`
- Visual: `running-visual-regression-tests`, `ai-visual-testing`
- Debugging: `diagnosing-test-failures`, `stabilizing-flaky-tests`, `debugging-with-chrome-devtools-mcp`, `playwright-explore-website` (pack drivers via `qa-mcp` MCP servers)

Artifact: a stable E2E suite (trace/video on failure, zero flakes in 20 CI runs) with Page Objects.

## Stage 3 — Non-functional and gates (weeks 8–10)

- Perf/load: `testing-performance-and-load`, `k6-load-testing`, `testing-web-performance`, `soak-testing`
- A11y: `auditing-accessibility`, `a11y-in-every-test`
- Security (QA scope): `testing-application-security`, `testing-api-security`, `security-regression-smoke`
- Gates: `generating-quality-gate-workflows`, `verifying-change-coverage`, `governing-quality-waivers`, `assessing-release-readiness`

Artifact: CI with quality gates wired (lint/type/unit/API/E2E/perf-smoke/a11y-smoke), one tracked quality dashboard (`analyzing-quality-metrics`, `tracking-quality-trends`).

## Stage 4 — Ways of working (ongoing)

- Planning: `designing-functional-tests`, `create-test-plan`, `planning-exploratory-testing`, `map-requirements-coverage`
- Delivery: `automating-ci-test-pipelines`, `monorepo-affected-tests`, `test-reports-and-artifacts`
- AI-assisted QA: `ui-api-automation` (pack), `plan-explore-review-commit` (pack), `orchestration-basics` (pack), `test-llm-guardrails` when the product has LLM features
- Code quality of tests: `unslop-tests`, `code-review`, `fix-tests`

Rule of thumb: when unsure which skill applies, ask the `qa-strategist` / `test-automation-expert` agents, or grep this knowledge + skill descriptions.

## Mapping to the Playwright UI course outline

This path maps 1:1 onto a typical Playwright UI course (modules: intro → environment setup → quick start → locators vs selectors → basic actions → advanced actions → storage state → Page Object → project smoke tests → git bonus):

- **Environment setup** (Node/VSCode/Playwright, TS, Prettier/ESLint→Biome, scripts) → Stage 0: `bootstrap-test-suite`, `static-code-analysis-typescript`, `typescript-for-testers`
- **Quick start** (test structure, `beforeAll`, run modes, projects, codegen, AAA, Trace Viewer) → Stage 2: `writing-playwright-tests-best-practices`, `playwright-generate-test`, `diagnosing-test-failures`
- **Locators vs selectors** (ID/CSS/XPath/getByText, recommended selectors, filtering, tagging) → Stage 2: `selector-strategy`
- **Basic + advanced actions** (inputs, dropdowns, dynamic elements, iframes, Shadow DOM, dialogs, uploads/downloads, screenshots/video, basic auth, multi-tab, parametrized tests, cookie banner, slow tag) → Stage 2: `writing-playwright-tests-best-practices`, `testing-file-uploads-and-exports`, `test-reports-and-artifacts`, `testing-auth-flows`, `flaky-test-policy`
- **Storage state** (login once, global setup/teardown, project dependencies, `.env`) → Stage 2: `testing-auth-flows`, `handling-sensitive-test-data`, `automating-ci-test-pipelines`
- **Page Object** (base class, components, manager/factory, fixtures, logger in fixtures) → Stage 2: `refactor-to-page-objects`, `designing-test-automation-architecture`, `api-request-response-logging`
- **Project / smoke tests** (real app, cleanup after tests, attachments, headless env quirks) → Stage 3: `designing-smoke-and-sanity-suites`, `test-data-factories`, `test-reports-and-artifacts`, `diagnosing-test-failures`
- **Git bonus module** (what is git, commands, init, commit, branch, clone) → Stage 0/4: `git-for-testers`

Course logistics (quizzes, completion certificate) have no counterpart here — this collection covers the knowledge and the practical problems, not course administration.
