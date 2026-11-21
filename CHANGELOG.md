# Changelog

All notable changes to the qa-tools plugin are documented here.
Format: `MAJOR.MINOR.PATCH` (SemVer). Plugin versions are tracked in `.vibe/plugins/qa-tools/plugin.json`.

## [1.47.0] - 2026-11-21

### 📦 Added
- New skill `tracking-quality-trends` (39 → 40 skills), from `jaktestowac/awesome-agents-for-quality`: turns quality snapshots into trends — 6–8 metrics with limit/current/goal, owner and action at the limit; per-run archive under `.qa/history/<date>/` with method/scope recorded; structural diff (practices gained/lost, thresholds changed, gates made non-blocking); noise band + three-period-drift rule; report to `.qa/trends.md` closing with what it cannot see. Includes the metric catalog (code/test, governance, AI/LLM, metrics-not-to-trend) folded into the SKILL.md.

## [1.46.0] - 2026-11-21

### 📦 Added
- New skill `assessing-comprehension-debt` (38 → 39 skills), from `jaktestowac/awesome-agents-for-quality`: measures the risk that code shipped without anyone understanding it — risk band per change/module from complexity + size + explanation present, teach-back attestation on high-risk surface (`Comprehension-Attested-by:`), optional AI-provenance via `Assisted-by:` trailers, concentration per module, trend over snapshot. Advisory by design, never blocks; includes the full risk-band rubric and the four-question teach-back protocol folded into the SKILL.md.

## [1.45.0] - 2026-11-21

### 📦 Added
- Final 2 project commands in `.vibe/prompts/` (28 → 30), from `jaktestowac/awesome-agents-for-quality`: `/playwright-explore-website` (first look at an unfamiliar app via Playwright MCP — 3–5 core flows with user-facing locators, written to `.qa/website-exploration-summary.md` + `.qa/proposed-test-cases.md` with stable IDs feeding `/test-generator` and `/playwright-generate-test`) and `/playwright-explore-website-requests` (same exploration plus per-action network capture with secrets redacted, first-party vs third-party separated, endpoint table with API-test/`page.route` mock candidates). Read-only by default, max 5 flows.

## [1.44.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (25 → 28), the analysis batch from `jaktestowac/awesome-agents-for-quality`: `/analyze-test-results` (run → failure clusters with suspected root-cause groups, flake suspects with evidence, prioritized next actions mapped to other commands), `/explain-test-failure` (single-failure diagnosis: root-cause class, failure chain, ranked falsifiable hypotheses, confidence; diagnosis only, never edits), `/explain-code` (read-only code explanation with testing perspective and "what to test first"; audience-adaptive).

## [1.43.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (21 → 25), the generation batch from `jaktestowac/awesome-agents-for-quality`: `/test-generator` (automate plan cases with case IDs in test titles, per-case run status, never weaken assertions for green), `/edge-case-scenario-generator` (BDD edge scenarios to `spec/edge-cases.md`, stage 1 of beyond-codegen — stops for human review), `/generate-test-data` (synthetic data catalog: valid/boundary/invalid/role-state, fixture-ready flags, no fixture files unless asked), `/derive-test-cases-from-code` (white-box cases from branches/boundaries/error paths, covered/partial/missing vs existing tests, analysis only).

## [1.42.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (17 → 21), the planning/requirements batch from `jaktestowac/awesome-agents-for-quality`: `/create-test-plan` (Playwright MCP exploration → risk-prioritized `.qa/test-plan.md` with stable scenario IDs P1–P3), `/map-requirements-coverage` (RTM to `.qa/requirements-coverage.md`, "touches the feature" ≠ coverage), `/review-requirements` (7 testability passes on story/PRD/ACs + clarifying questions + rewritten criteria), `/manual-test-cases` (executable case table with automation-candidate flags).

## [1.41.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (13 → 17), the quality-gate batch from `jaktestowac/awesome-agents-for-quality`: `/scope-change-gate` (file+hunk tagging of a diff, relevant practices vs contract, changed-line coverage, intent check, severity-ranked briefs, read-only), `/record-change-intent` (high-risk surface detection, rationale lookup in trailers/ADR/register, classification covered/undeclared/malformed/restated, drafted `Intent:` trailer for the author to confirm — never committed by the agent), `/derive-quality-contract` (triple detection risk × maturity × surfaces, MUST/SHOULD/COULD resolution, gap matrix with quoted evidence, `.qa/quality-contract.md` artifacts), `/audit-quality-debt` (silent-skip inventory across tests/lint/types/CI/coverage/security/hooks/AI gates, waiver health, intent + comprehension debt, trend; report-only).

## [1.40.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (11 → 13), adapted from `jaktestowac/awesome-agents-for-quality`: `/a11y-webpage-audit` (single-URL WCAG 2.1/2.2 AA audit via Playwright MCP — six ordered passes from semantics to ARIA states, axe-vocabulary findings with repro/fix/retest, "not checked" section so the report is not read as complete coverage) and `/a11y-audit-deep-dive` (multi-page/journey audit with template sampling, exact WCAG 2.2 criterion names, SC 4.1.1 excluded, quick wins vs structural fixes, manual retest checklist, technical and/or stakeholder output).

## [1.39.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (9 → 11), adapted from `jaktestowac/awesome-agents-for-quality`: `/design-llm-eval-suite` (offline eval suite: 15–25 cases per prompt template, cheapest-falsifiable scoring ladder, pinned model/`temperature: 0`/`retry: 0`, noise-band measurement, regression gate vs committed baseline in CI) and `/test-llm-guardrails` (blocking written authorization gate, trust-boundary map, deterministic guardrail tests incl. fail-closed, adversarial corpus + indirect injection through every content channel, results scored on effect not wording).

## [1.38.0] - 2026-11-21

### 📦 Added
- 7 new skills (31 → 38), adapted from `jaktestowac/awesome-agents-for-quality`: `reviewing-ai-output-groundedness` (claim-by-claim human protocol, verdict classes, citation checking, retrieval-vs-generation attribution, responsible-AI pass, attestation with limitations), `prd-generator` (discovery → measurable testable PRD schema → self-review), `tech-debt-analysis` (evidence-first register with severity/risk/effort/ROI and Fix Now/Fix Soon/Accept buckets), `documenting-test-suites` (quickstart validated on a clean clone, conventions, tag glossary, test ADRs, CI reality, honest gaps), `communicating-quality-findings` (9 rules: blocker first, one decision per report, artifact in `.qa/`, cost-ordered findings, precedence with unslop-answers), `code-review-advanced` (7 lenses, severity-ranked findings with file:line, approve/comment/request-changes), `static-code-analysis-typescript` (ESLint flat + typescript-eslint, tsconfig strict, Prettier, Husky/lint-staged, CI quality gate).

## [1.37.0] - 2026-11-21

### 📦 Added
- 3 role subagents (57 → 60), adapted from `jaktestowac/awesome-agents-for-quality` agents: `llm-feature-test-engineer` (three suites for LLM features — evals / guardrails / red team — with written authorization gate before adversarial work, pinned model, noise-band measurement, effect-scored red team, CI regression gate), `ai-architect` (two-stage Beyond Codegen: reviewed BDD scenario set first, then Playwright tests from approved scenarios via Playwright MCP), `quality-contract-architect` (derives the MUST/SHOULD/COULD quality contract from risk profile × maturity × surface, gap matrix PRESENT/PARTIAL/MISSING/WAIVED with quoted evidence, remediation plan; never derives manual-attestation states from tooling).

## [1.36.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (6 → 9), adapted from `jaktestowac/awesome-agents-for-quality`: `/qa-strategy` (six-lens scenario matrix with OWASP A01–A10 coverage table), `/regression-scope` (diff → prioritized retest pack must/should/sample/defer + minimal confidence suite, analysis-only), `/verify-acceptance-criteria` (AC verification against diff/running app/screenshots with Met/Partial/Not Met/Untestable statuses and sign-off summary; uses the Playwright MCP from `mcp.json` for live checks).

## [1.35.0] - 2026-11-21

### 📦 Added
- New knowledge entry `playwright-conventions` (7 → 8): the 8 repo rules from `jaktestowac/awesome-agents-for-quality` (e2e-playwright, page-objects, playwright-typescript, api-playwright-tests, typescript-style, commit-trailers, llm-evals, quality-gate-workflows) consolidated into one Vibe-readable guide — Vibe has no per-CLI rules directories, so knowledge replaces them.

## [1.34.0] - 2026-11-21

### 📦 Added
- New skill `attesting-manual-verification` (30 → 31), adapted from `jaktestowac/awesome-agents-for-quality`: dated, attributed attestations in a register (`.qa/attestations.md`) or `Comprehension-Attested-by:` commit trailers for human-only practices (code review, exploratory, UAT, manual a11y, UX, observability); gap-matrix states ATTESTED / UNATTESTED / STALE — never PRESENT/PASSED; never derived from tooling; findings capped below blocking; inline register template with worked entries.

## [1.33.0] - 2026-11-21

### 📦 Added
- New project commands in `.vibe/prompts/` (4 → 6), adapted from `jaktestowac/awesome-agents-for-quality`: `/stabilize-flaky-tests` (reproduce with `--repeat-each`/parallel runs, classify root cause, fix without retries or timeouts, prove with before/after failure rates, quarantine with owner what cannot be fixed) and `/tech-debt-audit` (report-only test-code audit: anti-patterns with `file:line`, severity-ranked findings, A–F health score, fix plan by release/sprint/backlog).

## [1.32.0] - 2026-11-21

### 📦 Added
- New skill `migrating-tests-to-playwright` (29 → 30), adapted from `jaktestowac/awesome-agents-for-quality`: staged migration of Cypress/Selenium/WebdriverIO/Protractor suites in vertical slices with a parity gate per slice (3× green + deliberate-break check) and a deletion of the source tests in the same PR; triage classes (port/rewrite/merge/drop/defer), inline Cypress and Selenium construct-mapping tables, waits deleted in favor of web-first assertions.

## [1.31.0] - 2026-11-21

### 📦 Added
- 2 new skills (27 → 29), adapted from `jaktestowac/awesome-agents-for-quality`: `unslop-answers` (every claim in an answer about your own work is evidenced, quantified, or marked unverified — evidence ladder rungs 0–5, severity tiers, 50 patterns, report format, red flags) and `unslop-tests` (the same discipline for test code — 40 tells from tautological assertions and mock-only tests to retries-as-fixes, Tier 1 findings proven by mutation: break the behavior, watch the test stay green, paste the output).

## [1.30.0] - 2026-11-21

### 📦 Added
- New knowledge entries (5 → 7), adapted from `jaktestowac/awesome-agents-for-quality` guides, Vibe-native: `ai-product-qa` (testing products that ship an LLM — three suites: evals / guardrails / red team, authorization gate before adversarial work, groundedness attestation with limitations) and `beyond-codegen` (two-stage AI test generation: risk-based scenarios reviewed by a human first, only then turned into test code).
- New project commands in `.vibe/prompts/`: `/playwright-generate-test` (walks one scenario live via the Playwright MCP shipped in `mcp.json`, then writes and runs a grounded spec) and `/refactor-to-page-objects` (pure structural refactor into page objects, verified against a baseline run).

## [1.29.0] - 2026-11-20

### 📦 Added
- `mcp.json` in the plugin root: Playwright MCP server (`npx -y @playwright/mcp@latest`), so plugin agents can drive a real browser.
- New knowledge entry `quality-governance` (5th): the three debts (technical / intent / comprehension) with three enforcement ceilings, quality contract, layered gates, waivers, change intent, trend-based metrics. Adapted from `jaktestowac/awesome-agents-for-quality` guides.
- Root `AGENTS.md` with repo conventions (test conventions, plugin structure, commit/version rules) as the Vibe instructions asset.

## [1.28.0] - 2026-11-20

### 📦 Added
- 5 role subagents (52 → 57 total), adapted from `jaktestowac/awesome-agents-for-quality` agents: `qa-strategist` (risk-sorted scenario matrices, testability review, regression scoping), `rubber-duck` (Socratic debugging, one evidence-anchored question at a time, never hands over the fix), `tech-debt-auditor` (evidence-backed debt register with severity/risk/effort/ROI and Now/Next/Later roadmap, report-only), `change-gate-reviewer` (per-diff review vs quality contract: tag, scope, diff-coverage, change-intent on high-risk surface, severity-ranked findings, read-only), `skill-librarian` (whole-collection audit: inventory, conformance, trigger collisions, reference integrity, source/plugin drift, behavioural-test gaps).

## [1.27.1] - 2026-11-20

### 🔄 Changed
- Extended skill `plugin-authoring` with the remaining asset types in Vibe: ⚡ prompts/slash commands (NOT a plugin component — `.vibe/prompts/` project vs `~/.vibe/prompts/` global, resolution order, built-ins win), 📜 instructions via `AGENTS.md` (startup + lazy directory-scoped discovery), and a full 🪝 hooks section (load order, types, stdin JSON payload, exit-code/stdout protocol, deny semantics, strict, limits). Inspired by jaktestowac/awesome-agents-for-quality authoring bundle.

## [1.27.0] - 2026-11-20

### 📦 Added
- New skill `testing-agent-skills` (27th), adapted from `jaktestowac/awesome-agents-for-quality`: behavioral testing of skills/prompts/agents/hooks themselves — 7-category case taxonomy (activation ±, collision, contract, behavioral, safety, persistence), 6-case minimum suite, recorded baseline (asset disabled), ≥3 trials, blind weighted scoring, ship gate vs baseline, collision-case protocol for collections, failure modes, and committed eval artifacts re-run before each edit. Complements `plugin-authoring` (static) and `llm-testing` (product features).

## [1.26.1] - 2026-11-20

### 🔄 Changed
- Deepened skill `quality-gates` (from `jaktestowac/awesome-agents-for-quality`): waivers now require what/why/who/until, MUST gates are non-waivable, expired waiver = finding, renewal needs fresh justification, plus a silent-skip inventory (test.skip, eslint-disable, ts-expect-error, continue-on-error, lowered thresholds); release readiness gains the `unverified` status, risk-based coverage, recoverability, and recommend-don't-decide; change intent must be durable+linked (Intent trailer/ADR/register, human-confirmed) on high-risk changes; new quality-metrics section (definitions, trend over snapshot, counterweights, metric names its decision).

## [1.26.0] - 2026-11-20

### 📦 Added
- New skill `designing-test-automation-architecture` (26th), adapted from `jaktestowac/awesome-agents-for-quality` and merged with the plugin's `playwright-architecture` knowledge: layer placement (lowest layer that can prove a behavior), reuse patterns (fixtures vs page objects vs helpers), data & auth strategy as the parallelism decision (storageState, per-worker accounts), folder/config/tag layout in qa-tools conventions (`tests/e2e`, `tests/api`, `fixtures/`, `pages/`, `getBy*` selectors, `expect()` only, `should...when` naming), and decision records with reversal conditions.

## [1.25.0] - 2026-11-20

### 📦 Added
- New skills `stabilizing-flaky-tests` (24th) and `diagnosing-test-failures` (25th), adapted from `jaktestowac/awesome-agents-for-quality`. Flaky: reproduce with retries off under the breaking configuration, classify root cause (timing / shared state / data collision / order / environment / external dependency / product race), fix by cause, prove on the same workers/shard, quarantine with owner+expiry. Diagnosing: preserve redacted evidence, classify (app defect / test bug / env / test data / flaky), tight red-capable loop, falsifiable hypotheses one variable at a time, resolve by class without weakening assertions.

## [1.24.0] - 2026-11-20

### 📦 Added
- New skill `test-driven-development` (23rd skill): red-green-refactor loop as a design technique — choosing the seam (public interface), inner vs double (outside-in) loop, minimal-implementation strategies (fake it / obvious / triangulation), refactor only under green, bug reproduction with a failing regression test staged before the fix, when to step out with a named substitute check, red flags. Complements `unit-testing` (quality bar per test, used when tests are added to existing code). Adapted from the `test-driven-development` / `test-driven-development-quick` skills in `jaktestowac/awesome-agents-for-quality`.

## [1.23.0] - 2026-11-20

### 📦 Added
- New skill `plugin-authoring` (22nd skill): how to build an Agent Plugins 1.0 plugin — structure, snake_case agent TOML schema (camelCase fails at runtime), skill frontmatter, hooks, structure validator + unit tests + CI, SemVer/CHANGELOG consistency, auto-release workflow, branch protection, plugin smoke-test checklist. Documents this repo as the reference implementation.

## [1.22.0] - 2026-11-20

### 📦 Added
- New skill `mocking` (21st skill): MSW (browser worker + node setupServer), Playwright `page.route` for what MSW can't reach, fault injection (500/timeout/network error), time mocking (`page.clock`, fake timers, `expect.poll` instead of `waitForTimeout`), deterministic payloads, and rules for what to mock (external/unstable only) with cleanup. The MSW section in `test-data-management` now points to `/mocking`.

## [1.21.0] - 2026-11-20

### 📦 Added
- New skill `requirements-traceability` (20th skill): stable ID chain `REQ → AC → test tag → code location`, coverage matrix kept in the repo and updated in the same PR (CI-checkable), per-AC test derivation (happy/boundary/negative/state), AC verification table with met/partial/missing verdicts and evidence links, removed-REQ audit trail.

## [1.20.0] - 2026-11-20

### 📦 Added
- New skill `unit-testing` (19th skill): behavior-through-public-interface assertions, determinism (fake timers, injected clock/RNG), AAA and `should…when…` naming, edge/boundary checklist, test doubles (stub/mock/fake — fakes preferred at the boundary), TDD red-green-refactor including bug-fix-first, mutation check (break the code, suite must go red), unit vs integration vs E2E placement table, and anti-patterns (no real I/O, no tautologies, no swallowed errors, no retries).

## [1.19.0] - 2026-11-20

### 📦 Added
- New skill `quality-gates` (18th skill): four gate levels (smoke PR / full merge / nightly / release) as required status checks, evidence-based go/no-go release readiness table with residual risk, diff coverage gate vs whole-repo coverage, regression scoping from the diff with recorded change intent, and quality waivers with owner + expiry + ticket (expired waiver = gate fails). Includes CI wiring example and a checklist.

## [1.18.0] - 2026-11-20

### 📦 Added
- New skill `llm-testing` (17th skill): testing LLM-powered features — groundedness/hallucination checks with golden eval sets and citations, prompt-injection and jailbreak resistance, guardrails and JSON-schema output validation, PII/secret canaries, determinism at temperature 0 vs schema-only at higher sampling, cost/latency/token budgets, model-version pinning, and anti-"unslop" rules for AI-generated tests and reports (no exact-text assertions, no `waitForTimeout`, findings need file:line, claimed run must reference a real run).

## [1.17.3] - 2026-11-20

### 📦 Added
- `SECURITY.md` (private vulnerability reporting, scope, safe-use rules) and `.github/PULL_REQUEST_TEMPLATE.md` (checklist: validator, tests, CHANGELOG/plugin.json bump, no secrets).
- Repo hardening via API: branch protection on `main` (required `Validate plugin` status check) and 10 topics (playwright, testing, typescript, automation, qa, api-testing, e2e-testing, accessibility, security, load-testing).

## [1.17.2] - 2026-11-20

### 📦 Added
- Issue templates `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` (environment, validator output, logs).
- Validator unit tests 10 → 15: skill frontmatter without `user-invocable`, missing `hooks.toml`, hook with unknown type, scenario plan missing the `Kroki` section, UI spec with a test name violating the `should…when…` convention.

### 🐞 Fixed
- CONTRIBUTING.md: release process now describes the automatic `release.yml` workflow (tag + GitHub Release from the CHANGELOG section); manual `gh release create` recipe kept for old tags. GitHub Release published for the existing `v1.5.0` tag.

## [1.17.1] - 2026-11-20

### 📦 Added
- Auto-release workflow `.github/workflows/release.yml`: on push to `main` it reads the newest `## [x.y.z]` entry in `CHANGELOG.md`, and if tag `v<x.y.z>` does not exist yet, creates the annotated tag and a GitHub Release with notes extracted from that CHANGELOG section (`contents: write`, idempotent, concurrency-guarded).

## [1.17.0] - 2026-11-20

### 📦 Added
- New skill `database-testing` (16th skill): direct DB testing from Playwright — schema/constraints/indexes/triggers verification, transactions and rollback isolation, concurrency (unique races, optimistic locking, deadlocks), DB side-effect assertions after UI/API actions, test DB safety guards (env-only credentials, prod refusal), concrete assertions and good/bad examples.

## [1.16.1] - 2026-11-20

### 📦 Added
- Reference examples for `i18n` (`tests/i18n/locale.spec.ts`: pl-PL heading, dd.mm.yyyy date, `document.lang`) and `versioning` (`tests/versioning/users.spec.ts`: Accept-Version v1/v2, same core fields, Deprecation/Sunset headers) plus scenario plans. Validator checks both areas; test fixture updated.

## [1.16.0] - 2026-11-20

### 📦 Added
- New `versioning` pipeline (13th area, 4 subagents: `versioning-test-planner`, `versioning-test-writer`, `versioning-test-refactor`, `versioning-test-code-reviewer`) for API versioning: backward compatibility v1/v2, `Deprecation`/`Sunset`/`Link` headers, `Accept-Version` vs path versioning, 410 Gone after sunset, per-version OpenAPI validation. Validator covers the `versioning` area (excluded from the waitForTimeout rule like other API areas).

## [1.15.0] - 2026-11-20

### 📦 Added
- New `i18n` pipeline (12th area, 4 subagents: `i18n-test-planner`, `i18n-test-writer`, `i18n-test-refactor`, `i18n-test-code-reviewer`) for localization testing: language switching, `document.lang`, RTL layout, date/currency/number formats per locale, translation-key fallbacks, long-text overflow, locale isolation per test. Validator covers the `i18n` area.

## [1.14.1] - 2026-11-20

### 📦 Added
- README `Troubleshooting` section (plugin not loading, trusted folders, snake_case schema errors, flaky-watch JUnit, CI failures).
- `examples/playwright.config.ts` now includes the JUnit reporter (`results.xml`) so the `flaky-watch` hook has data.

## [1.14.0] - 2026-11-20

### 📦 Added
- New hook `flaky-watch` (5th hook): after a `playwright test` command, parses the JUnit XML (`results.xml` / `test-results/junit.xml`) and reports tests that passed only after a retry — the flaky list to fix, not hide behind retries.

## [1.13.0] - 2026-11-20

### 📦 Added
- New skill `visual-testing` (15th skill): `toHaveScreenshot` baselines, `animations:'disabled'`/`caret:'hide'`/masks, thresholds, viewport matrix and dark mode, CI strategy (dedicated visual project, CI-generated baselines, artifact upload), Percy/Applitools comparison, pitfalls table.

## [1.12.0] - 2026-11-20

### 📦 Added
- Reference examples for `chaos` (`tests/chaos/orders-500.spec.ts`: page.route 500 fault, fallback banner assertion, unroute cleanup) and `mobile` (`tests/mobile/checkout.spec.ts`: device viewport, tap, SPA routing, no horizontal scroll at 320px) plus scenario plans. Validator checks both; test fixture updated.

## [1.11.2] - 2026-11-20

### 🔄 Changed
- README translated to English (public plugin on GitHub); stale counts fixed (44 agents, 14 skills).

## [1.11.1] - 2026-11-20

### 🔄 Changed
- `test-data-management` skill extended: MSW (Mock Service Worker) section — browser (`setupWorker`) and Node (`setupServer`) handlers, per-test overrides, `onUnhandledRequest`, interplay with `page.route`; DB seeding section — idempotent direct seeding via ORM in global setup, env-only credentials, prod-DB guard, teardown strategies.

## [1.11.0] - 2026-11-20

### 📦 Added
- `examples/ci/e2e.yml` — GitHub Actions template for the tested app: `npm ci`, `playwright install --with-deps`, `npx playwright test` with secrets from env, and `upload-artifact` with `if: always()` (HTML report + traces also on failure). Validator checks the snippet; fixture updated.

## [1.10.0] - 2026-11-20

### 📦 Added
- New `chaos` pipeline (11th area, 4 subagents: `chaos-test-planner`, `chaos-test-writer`, `chaos-test-refactor`, `chaos-test-code-reviewer`) for resilience testing: fault injection via `page.route` (500/abort/delay), timeouts, degraded dependencies, fallback assertions, unroute cleanup. Validator covers the `chaos` area.

## [1.9.0] - 2026-11-20

### 📦 Added
- New knowledge entry `reporting-and-metrics` (4th): Playwright reporters (HTML/JSON/JUnit/Allure), CI artifacts, flaky rate / pass rate / duration metrics, quality gates.
- New hook `playwright-list-spec`: after editing a `*.spec.*` file, runs `npx playwright test <file> --list` (syntax/collection check) when a playwright config exists.
- `examples/.env.example` template: `BASE_URL`, `API_TOKEN`, `TEST_USER_PASSWORD`, `OPENAPI_SPEC`.

## [1.8.0] - 2026-11-20

### 📦 Added
- Reference examples for `a11y` (`tests/a11y/login.spec.ts` + scenario plan: axe-core scan, keyboard focus) and `security` (`tests/security/comment-xss.spec.ts` + plan: XSS payload rendered as text, no dialog).
- `examples/playwright.config.ts` template: per-browser/device projects, `baseURL` from env, HTML reporter, trace on first retry.
- Validator checks the new examples (plan sections, naming, no `waitForTimeout`, AxeBuilder/getBy* for a11y, no hardcoded URLs for security, env-based baseURL in config); 2 new unit tests (10 total).

## [1.7.0] - 2026-11-20

### 📦 Added
- New skill `offline-pwa-testing` (14th skill): offline emulation (`context.setOffline`), Service Worker registration/lifecycle/update flow, Cache API strategy tests, offline fallback page, Background Sync, IndexedDB persistence, Web App Manifest validation, push subscription, pitfalls table.

## [1.6.0] - 2026-11-20

### 📦 Added
- New skill `websocket-sse-testing` (13th skill): WebSocket via `page.waitForEvent('websocket')` + `framereceived`/`framesent` with payload assertions, reconnect handling, SSE via response streaming with `expect.poll`, common pitfalls table.

## [1.5.0] - 2026-11-20

### 📦 Added
- New `security` pipeline (4 subagents: `security-test-planner`, `security-test-writer`, `security-test-refactor`, `security-test-code-reviewer`) for OWASP Top 10: IDOR/broken access control, XSS, CSRF, security headers, secrets in responses, dependency scanning. Fictitious payloads only, secrets from env. Complements the existing `security-testing` skill. Validator covers the `security` area.

## [1.4.0] - 2026-11-20

### 📦 Added
- New `a11y` pipeline (4 subagents: `a11y-test-planner`, `a11y-test-writer`, `a11y-test-refactor`, `a11y-test-code-reviewer`) for accessibility testing: axe-core scans (critical/serious = 0), keyboard navigation and focus visibility, ARIA roles/landmarks, form labels and error messages. Complements the existing `accessibility-testing` skill. Validator covers the `a11y` area.

## [1.3.0] - 2026-11-20

### 📦 Added
- New skill `mobile-testing` (12th skill): device emulation projects (`devices[...]`), touch gestures (`touchscreen.tap`, pointer events for swipe/pinch), mobile pitfalls (no hover, meta viewport, 320px layout, keyboard covering viewport), same getBy* selectors on mobile.

## [1.2.8] - 2026-11-20

### 🔄 Changed
- `typecheck-after-agent` hook: runs `tsc --noEmit` only when the agent turn touched `tests/` or `.ts` files (previously every turn in any project with tsconfig), and reports the TS error count instead of swallowing output with `|| true`.

## [1.2.7] - 2026-11-20

### 📦 Added
- API reference example: `examples/docs/scenarios/api/users.md` + `examples/tests/api/users.spec.ts` (request fixture, status/body assertions, negative case, env-only secrets).
- Validator now checks the API example too (naming, `expect(res.status())`, request fixture, no hardcoded URLs); new unit test for the hardcoded-URL case.

## [1.2.6] - 2026-11-20

### 📦 Added
- `homepage` and `repository` in `plugin.json` (allowed by the Agent Plugins 1.0.0 schema); CI badge and Development section in README.

## [1.2.5] - 2026-11-20

### 📦 Added
- `Playwright` entry-point object coverage (playwright.dev/docs/api/class-playwright): new section in `playwright-architecture` knowledge (browserType, launch/connect options, contexts, `playwright.request.newContext` for browser-less API tests, `selectors.register`, devices/errors) and `playwright.request` example in `api-testing` skill.

## [1.2.4] - 2026-11-20

### 📦 Added
- Browser-side JavaScript guidance (`page.evaluate`) in `playwright-test-writing` skill and `ui-test-writer` conventions: evaluate only when the Playwright API is insufficient, assertions always via `expect`, no `waitForTimeout` in evaluate, `locator.evaluate()` preferred, `addInitScript` for storage seeding.

## [1.2.3] - 2026-11-20

### 📦 Added
- ExtJS (Sencha) guidance in `playwright-test-writing` skill and `ui-test-writer` conventions: stable hooks (`data-ref`/`data-testid`, Ext component classes with `hasText`), never generated IDs, wait for `.x-mask` to hide via `expect` instead of `waitForTimeout`, iframe handling.

## [1.2.2] - 2026-11-20

### 📦 Added
- Framework-aware UI testing guidance: new section in `playwright-test-writing` skill (SPA routing via `toHaveURL`, re-render-safe locators, hashed CSS classes, open shadow DOM piercing, hydration waits, `data-testid` convention) plus matching rules in `ui-test-writer` (selectors must stay framework-agnostic) and `ui-test-code-reviewer` (review checklist).

## [1.2.1] - 2026-11-20

### 🐞 Fixed
- All 32 agent TOML files now use snake_case keys (`schema_version`, `agent_type`, `display_name`, `enabled_tools`, `disabled_tools`) required by the Vibe runtime's `_PluginAgentDocument` schema (`extra="forbid"`, `strict=True`). Previously the camelCase keys from the plugin-authoring docs caused "Failed to load plugin agent" validation errors on all 32 subagents.
- `scripts/validate-plugin.py` updated to check the snake_case keys, so local/CI validation matches the runtime schema.

## [1.2.0] - 2026-11-20

### 📦 Added
- New `contract` pipeline (4 subagents: `contract-test-planner`, `contract-test-writer`, `contract-test-refactor`, `contract-test-code-reviewer`) for consumer-driven contract testing with Pact (matchers with examples, provider states, negative interactions, Pact Broker publishing) and OpenAPI contract validation.
- New skill `contract-testing` (11th skill).
- Validator updated: `contract` area covered by shared naming convention (no `waitForTimeout` rule — not a UI pipeline).

## [1.1.0] - 2026-11-20

### 📦 Added
- New `db` pipeline (4 subagents: `db-test-planner`, `db-test-writer`, `db-test-refactor`, `db-test-code-reviewer`) for verifying data migrations / ETL: completeness (counts, checksums, sums), field-level diff, referential integrity, idempotency, rollback validation, transformation rules, schema drift.
- New skill `data-migration-testing` (10th skill).
- `scripts/validate-plugin.py` — stdlib-only structural validator (Python 3.11+), exit 0/1 for CI.
- `examples/` — reference scenario plan (`docs/scenarios/ui/login.md`) and Playwright test (`tests/ui/login.spec.ts`) following qa-tools conventions.
- `LICENSE` (MIT), this changelog, installation docs.

### 🔄 Changed
- All 28 subagents now embed shared qa-tools conventions: test naming `should <result> when <condition>`, assertion standards (`await expect(...)`, never `waitForTimeout`), selector policy (`getByRole`/`getByLabel`/`getByText`/`getByTestId`), output paths, POM structure (refactor stage only, on request), common plan format and review report template.

## [1.0.0] - 2026-11-20

### 📦 Added
- Initial release: 6 pipelines (UI, API, E2E, mobile, visual, load/k6) × 4 stages (planner, writer, refactor, code reviewer) = 24 subagents.
- 9 skills, 3 knowledge entries, 3 hooks (lint test files, typecheck after agent, QA conventions on session start).
