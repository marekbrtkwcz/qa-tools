# CHANGELOG

Wszystkie istotne zmiany tego projektu są dokumentowane tutaj. Format zbliżony do [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); wydanie kolekcji = tag `vx.y.z` na historii gita. Wersje per-bundle w `bundles.yaml` są podbijane w tym samym wydaniu (`node scripts/build.ts --set-version x.y.z`), więc `plugin.json` każdego pluginu ma wersję kolekcji.

## [Unreleased]

### ✅ Dodane

- knowledge `automation-tester-essentials` (test-automation, **P13**): skondensowana lista "co powinien wiedzieć tester automatyzujący" wyciągnięta z kursów UI+API — każdy punkt = wiedza + problem, któremu zapobiega + skill; cross-link z learning-path

- `api-concepts-for-testers` (api-testing, **P12**): podstawy REST/HTTP dla testera — zasoby, metody + idempotentność, kody statusów, JSON, 6 zasad REST, anatomia request/response, gdzie pasuje SOAP; resources: glossary + HTTP quick-reference; w knowledge api-testing sekcja "Beyond REST" (SOAP/WSDL, GraphQL, gRPC)

- knowledge `automation-tester-learning-path`: mapowanie 1:1 kursu Playwright UI (moduł po module) na skille kolekcji (**P11**)

- `git-for-testers` (test-automation, **P10**): wiedza i problemy gitowe dla testera — cykl życia plików, `git bisect run` przy łamaniu testów, hooki (Husky/.git/hooks) i ich testowanie, worktree, płytkie klony w CI, blame/log -L

- `api-request-response-logging` (api-testing, **P9**): logger requestów/response API przez fixture `request` + Proxy (wzorzec z pwapi-logger), ale zero-dep (ANSI zamiast chalk), env-gated, z redakcją sekretów i wariantem attach-on-failure do artefaktów CI + gotowy fixture w resources

- 4 skille + ścieżka onboardingu (**P8**)
  > - `testing-cli-tools` (test-automation): exit codes, stdout/stderr, flagi/env/stdin, idempotentne uruchomienia, snapshot outputu przez subprocess
  > - `testing-idempotency-and-retries` (api-testing): idempotency keys, at-least-once, duplikaty, double-submit, retry storm
  > - `testing-scheduled-jobs` (test-automation): cron, fake time, strefy czasowe/DST, missed runs, nakładanie się (locking)
  > - `testing-database-migrations` (qa-core): up/down, rollback, backfill batchowany, expand/contract, rolling deploy
  > - knowledge `automation-tester-learning-path` (test-automation): ścieżka 30-60-90 przez kolekcję (prework → piramida → E2E → non-functional/gates → ways of working)

- prework dla zespołu: 2 skille wyrównujące poziom (**P7**)
  > - `typescript-for-testers` (test-automation): podstawy TS pod testy — typy, uniony, gwardy, `Partial`/`satisfies`, `noUncheckedIndexedAccess`, typowanie fixtures/factories/Page Objectów/API clientów/mocków + resources (cheatsheet, wzorce, tsconfig dla testów)
  > - `ai-concepts-for-testers` (ai-quality): słownik koncepcji AI dla testera (LLM, RAG, agenci, MCP, guardrails, evals) + mapa koncepcja→skill + glossary

- 7 nowych skillów dla testera automatyzującego (**P6**)
  > - `testing-with-bun` (test-automation): `bun test` / `bun:test` API, `bunfig.toml` preload, coverage, wybór bun vs `node --test` vs Vitest, Playwright pod Bunem
  > - `k6-load-testing` (non-functional-testing): anatomia skryptu k6, scenariusze i thresholds, uruchomienie przez CLI i k6 MCP z `qa-mcp`, bramka CI
  > - `debugging-with-chrome-devtools-mcp` (test-automation): konsola/sieć/wydajność/pamięć przez Chrome DevTools MCP przy debugowaniu flaky i wydajności
  > - `testing-email-and-notifications` (api-testing): catch-all SMTP (Mailpit/Mailosaur), polling API maila, magic linki/OTP, test mode SMS/push
  > - `testing-feature-flags` (test-automation): kontrola stanu flagów per test, stany on/off/default, kill switch, cleanup
  > - `testing-offline-and-pwa` (test-automation): service worker, `setOffline`/route abort, manifest PWA, push
  > - `monorepo-affected-tests` (test-automation): `--affected` (Nx/Turbo), mapowanie ścieżek na projekty Playwright, fallback pełnej suity
  > - ulepszenia istniejących: knowledge `test-automation.md` (Bun + MCP jako first-class), cross-linki `k6-load-testing` i `debugging-with-chrome-devtools-mcp` w `testing-performance-and-load` i `diagnosing-test-failures`

- migracja `scripts/` na TypeScript + Bun w kolekcji (**A+B**)
  > - scripts/*.js → scripts/*.ts (33 pliki; hooki w scripts/assets/ zostają CJS .js — Vibe odpala je przez `node vibe-hooks/<name>.js`); runtime: Node ≥ 24 z natywnym type stripping (bez loadera/buildu), `engines.node: ">=24"`, CI na Node 24
  > - tsconfig.json (strict + noUncheckedIndexedAccess, noEmit) + `npm run typecheck` (`tsc --noEmit`); biome.json rozszerzony o override dla `**/*.ts` (noExplicitAny + useNodejsImportProtocol = error)
  > - devDependencies: typescript, @types/node; package.json scripts wskazują `.ts`
  > - Bun w treściach kolekcji: static-code-analysis-typescript (bun install/bunx/bun run, setup-bun w CI), bootstrap-test-suite (bun add -D, bunx playwright, Playwright jako Node-tool), automating-ci-test-pipelines (recepta oven-sh/setup-bun + cache na bun.lock), README sekcja MCP (bunx/pnpm dlx mają ten sam cold-start co npx vs 10 s handshake)

- automatyzacja CHANGELOG i statystyk README (**P2**) (d798621)
  > P2: Automatyzacja zadań konserwacyjnych:
  > - generate-changelog.js: automatyczne generowanie CHANGELOG z commitów
  > (konwencja conventional commits, obsługa tagów, kategoryzacja zmian)
  > - update-readme-stats.js: aktualizacja i walidacja statystyk w README
  > (liczba pluginów, skilli, agentów, knowledge, hooków, widocznych skilli)
  > - package.json: nowe skrypty npm (changelog, readme:stats, p2)
  > - Nowe zależności: yaml (parser YAML), conventional-changelog (przyszłe użycie)
  > 
  > Wszystkie skrypty zintegrowane z npm run check i npm run p2.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🐛 Naprawione

- krytyczne bramki walidacji (CHANGELOG, duplikaty, Biome) (**P1**) (b3497ac)
  > - check-changelog.js: walidacja formatu CHANGELOG + spójność z README
  > (sprawdza nagłówki, daty, dokumentację zmian w bundles.yaml, liczniki)
  > - check-bundles-duplicates.js: detekcja duplikatów w bundles.yaml
  > (blokuje duplikaty skilli/agentów/knowledge/hooków między bundlami)
  > - package.json: dodano nowy skrypt do npm run check
  > - Poprawki Biome w lint-*.js (template literals zamiast +)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🔄 Zmienione

- rozszerzone słowniki emotek (10→64) w 8 kategoriach (372f87e)
  > - Core Testing Status, Findings and Issues, Quality & Metrics,
  > Process & Workflow, Automation & Infrastructure, Security & Compliance,
  > Performance & Load, Orchestration and Agents
  > - Zaktualizowany README z podsumowaniem i przykładami
  > - CHANGELOG: nowy wpis w [Unreleased]
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- fill 5 coverage gaps + live eval run protocol (b645edb)
  > New skills:
  > - testing-observability (non-functional-testing): verify logs/metrics/traces/
  > alerts actually work; request-id correlation, cardinality, alert fired on purpose
  > - data-pipeline-testing (non-functional-testing): schema drift, freshness/volume
  > SLAs, idempotent re-runs, boundary-record transforms
  > - test-impact-analysis (quality-gates): minimal confidence set from coverage
  > data per diff; uncovered risky lines = BLOCK; complements scoping-change-relevance
  > - release-notes-from-diff (quality-gates): changelog entries derived from the
  > diff, breaking first, security without exploit detail
  > - pentest-secrets-and-credentials (pentesting): secrets in repos/CI/images/bundles
  > under charter; secret = finding (type/location/rotation), never used or printed
  > 
  > Evals: +1 blocking safety case (pentesting: secret-is-finding-not-key),
  > +2 nft, +2 quality-gates cases; suite counts updated (18/10/9).
  > evals/README: live model run protocol (operator step with EVAL_MODEL, not CI);
  > gate = 100% on safety cases.
  > 
  > README counts: nft 21, pentesting 11, quality-gates 19; total 178 skills, 135 visible.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- close structural gaps + 2 new skills (flaky-test-policy, selector-strategy) (5a8d5d8)
  > - 11 command-skills got Definition of Done + Related Skills (analyze-test-results,
  > explain-test-failure, fix-tests, migrate-tests-to-playwright, playwright-explore-website(-requests),
  > playwright-generate-test, refactor-to-page-objects, stabilize-flaky-tests, tech-debt-audit, test-generator)
  > - new skill flaky-test-policy: retry-as-CI-concession-not-fix, owned+expiring quarantine,
  > flake rate as a merge gate; links to governing-quality-waivers
  > - new skill selector-strategy: locator priority order (testid > role > label > text > CSS),
  > self-healing only on allowlisted volatile regions with per-heal logging
  > - agents test-automation-expert / playwright-automation-engineer-ts now point to
  > automation-backlog-planner (qa-core) as the source of the automation backlog
  > - bundles.yaml + README counts (48->50 skills, 171->173 total, 130 visible)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- documentation map in README + documentation rules in CONTRIBUTING (ee1f1e3)
  > - README: new 'Mapa dokumentacji' section - one tree of where every kind of
  > documentation lives (README/CONTRIBUTING/CHANGELOG/evals/knowledge/skills/agents/.qa)
  > and the rule 'docs live next to the asset, no separate docs/'
  > - CONTRIBUTING: Documentation section - bundle knowledge folder is required
  > (enforced by check), skill self-documents in SKILL.md + resources, user-facing
  > changes get a CHANGELOG entry, README counts in the same commit as bundles.yaml
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-bundle links: qa-core/api-testing/non-functional-testing reachable from 5 more skills (39f6b56)
  > - testing-auth-flows -> handling-sensitive-test-data (test accounts, secrets, storageState)
  > - playwright-generate-test -> designing-functional-tests + automation-backlog-planner + test-generator (where the scenario comes from)
  > - hybrid-ui-api-testing -> api-test-plan-and-tests (planning the API half from the spec)
  > - verifying-change-coverage -> tracing-requirements-to-code (execution coverage vs requirement traceability)
  > - pentest-web-application / pentest-api -> testing-application-security (QA-scope variant without a full pentest charter)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-link qa-core design and backlog agents (da177a6)
  > - api-test-plan-and-tests: new Related Skills section - designing-functional-tests
  > and test-planner (plan from wider feature context), automation-backlog-planner
  > (which API scenarios automate first), api-playwright-test-developer (stack patterns)
  > - api-playwright-test-developer: add handling-sensitive-test-data next to
  > designing-test-data (secrets/PII never in API test files)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add automation-backlog-planner agent + eval suite (8b27454)
  > - New agent automation-backlog-planner: turns test plans, handoff packs and
  > exploratory candidates into a prioritized automation backlog with
  > per-item automate/manual/park decisions, P0-P2 priorities, CI-budget
  > trade-off, and handoff to test-automation-expert / playwright-automation-engineer-ts
  > - designing-functional-tests: Automation candidacy section (manual-first rule,
  > candidacy criteria) + Related Skills links to the two automation agents
  > - beyond-codegen knowledge: stage 1.5 row for the backlog planner
  > - evals/qa-core.cases.jsonl: first qa-core suite (5 cases) - activation vs
  > design/implementation collisions, CI-budget contract, blocking safety case
  > (no blind automation of exploratory/subjective findings)
  > - README agent counts updated (qa-core 4->5, total 44)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- close OWASP gaps and cross-link neighbors (750c0f5)
  > - SKILL.md Phase 2: point to the executable authz matrix recipe (Playwright
  > request context) and api-playwright-test-developer for regression automation
  > - Phase 3: anti-CSRF token check (SameSite as mitigation, not substitute) and
  > JWT-specific checks (alg:none, pinned key, kid, claim re-check after role change)
  > - Phase 4: stored XSS and SSRF candidate surfaces (pointer to A10)
  > - Phase 5: security audit trail (pointer to A09)
  > - Related Skills: api-playwright-test-developer, security-regression-smoke,
  > testing-abuse-limits, pentest-rules-of-engagement
  > - owasp-test-angles: CSRF checks (A01), stored XSS (A03), JWT checks (A07)
  > - finding-report-template: optional CVSS vector next to the severity table
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- test-automation and mobile-testing suites (4 + 3 cases) (e6b36fd)
  > test-automation pins the quick/standard pair routing; mobile-testing
  > pins flow automation vs visual regression vs a11y routing to
  > non-functional-testing. All eight remaining bundles now have eval
  > coverage (qa-mcp is MCP-only, nothing to eval).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-link functional vs visual vs a11y skills (e421925)
  > mobile-app-testing and visual-regression-mobile now name each other and
  > auditing-mobile-accessibility; mobile-app-testing description shortened
  > from 723 to under the 600-char routing-signal threshold.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- test-automation knowledge: shorten first paragraph under the 297-char slice limit (a788221)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- knowledge folders for test-automation, api-testing and mobile-testing (2d3fd72)
  > Each bundle now ships a short knowledge doc: scope and routing (quick vs
  > standard pairs, schema vs pact vs Playwright API, Maestro vs visual
  > regression vs mobile a11y) plus evidence pointers. README table and
  > totals updated (12 knowledge).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- api-testing suite (4 cases) - schema vs pact vs Playwright API tests (640311a)
  > Activation for testing-api-contracts, pact-contract-testing and
  > api-playwright-test-developer, plus a contract case keeping the
  > schema/pact pair distinguishable in ambiguous requests.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- testing-api-contracts names pact-contract-testing in its description (dff5602)
  > The OpenAPI/schema skill mentioned 'consumer-driven contract checks' in
  > its own scope while pact-contract-testing owns that; now the description
  > routes pact/broker/can-i-deploy work to the right skill (the reverse
  > link already existed).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- ai-quality suite (5 cases) incl. blocking adversarial-without-authorization safety case (a7e855f)
  > Guardrails activation, routing to testing-llm-features and
  > reviewing-ai-output-groundedness, the guardrails pair split, and a
  > risk=high safety case: adversarial testing without written authorization
  > must be refused.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- lint-ai-quality.js wired into lint-all-packs (762817c)
  > Seventh pack lint: testing-llm-guardrails must keep the adversarial suite
  > and its written-authorization gate (adversarial testing is security
  > testing), and the test-llm-guardrails/testing-llm-guardrails pair must
  > cross-reference each other. Behavioural half goes to
  > evals/ai-quality.cases.jsonl.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-link test-llm-guardrails and testing-llm-guardrails (f622978)
  > The two guardrail skills overlap in scope (trust boundaries / adversarial
  > corpus vs full runtime-validation suite) but neither description named
  > the other - activation collision risk. Now both directions are linked.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- bundle description states the security boundary (31562b8)
  > The description now says QA-scope security runs only after an
  > authorization gate and that full pentests belong to the pentesting
  > bundle - the boundary is visible before install, not only inside the
  > skill.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- security skill names the pentesting bundle; scoping-change-relevance description shortened (cd3065f)
  > testing-application-security now explicitly routes full authorized
  > pentests to pentest-rules-of-engagement, and its description is back
  > under the routing-signal threshold (411 chars, build warn gone).
  > scoping-change-relevance description shortened from 734 to 454 chars,
  > keeping all three cross-references.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- bundle knowledge + README counts; shorten two auditor descriptions (0c6603c)
  > New knowledge folder: QA-scope security vs pentesting boundary, a11y
  > skill routing table, command-only decision for perf/security skills,
  > evidence pointers. README table and totals updated (9 knowledge).
  > quality-debt-auditor / tech-debt-auditor descriptions shortened back
  > under the 300-char build limit while keeping the mutual cross-reference.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- non-functional-testing suite (7 cases) incl. blocking no-authorization security case (e256ded)
  > a11y trio disambiguation, performance/load activation, QA-scope security
  > vs full pentest routing to the pentesting bundle, WCAG-mapped findings
  > contract, and a risk=high safety case: probing before written
  > authorization must be refused.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- lint-nft-pack.js wired into lint-all-packs (cfd9569)
  > Sixth pack lint: testing-application-security must keep its
  > authorization gate (Phase 0 refusal statement), and the three
  > overlapping web a11y skills must cross-reference each other in their
  > descriptions. Behavioural half of the security gate goes to
  > evals/non-functional-testing.cases.jsonl.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-link the three overlapping web a11y skills (86cf101)
  > auditing-accessibility now names a11y-webpage-audit (quick single-URL),
  > a11y-audit-deep-dive (deep multi-page/release) and
  > auditing-mobile-accessibility (native apps); the two a11y-* commands
  > reference auditing-accessibility back. Activation cannot collide between
  > the three web a11y entry points anymore.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- planner uses the shared plan-directory convention (2560b49)
  > basics-planner now writes plans to the directory named in AGENTS.md, or
  > plans/ by default - the same convention as plan-explore-review-commit,
  > so plans from both packs land in one place.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- orchestration-basics knowledge: full routing table + evidence section (7a1e900)
  > 'What this pack does not do' now routes every adjacent job to its bundle
  > (perc, ui-api, pentesting, quality-gates, non-functional-testing), and a
  > new Evidence section points to the pack's eval suite and lint.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- orchestration-basics suite (5 cases) incl. blocking no-implementation safety case (63263ac)
  > Activation for analysis+plan, negatives routing implementation to
  > plan-explore-review-commit and test automation to ui-api-automation, the
  > STOP-gates/execution-card contract, and a risk=high safety case: the
  > pack must refuse to write implementation code and hand off instead.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- lint-basics-pack.js wired into lint-all-packs (be893ae)
  > The basics pack now has the same static guard as the other four packs:
  > all 3 basics agents must declare a ## Deliverable contract, and the pack
  > skill must keep its STOP gates and the 'does not implement code'
  > boundary. Behavioural half of the no-code boundary goes to
  > evals/orchestration-basics.cases.jsonl.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Deliverable contract in all 3 basics agents (1e21f05)
  > basics-explorer already had a hard <results> output contract; planner and
  > analyst now declare a ## Deliverable section too (file path + fixed
  > summary bullets), so the orchestrator can merge all three mechanically.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- lint-all-packs.js wraps the four pack lints in check/lint (e0764e3)
  > check and lint now call one script that runs lint-pentest-charter,
  > lint-uiapi-pack, lint-perc-pack and lint-quality-gates in order; adding a
  > fifth bundle lint is a one-line change again.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- quality-gates diff-coverage BLOCK contract case (suite now 8) (17d6f42)
  > The escalation rule (changed lines below threshold + high-risk tag =
  > blocking finding, escalated by risk not by line count) is now a pinned
  > contract case; verifying-change-coverage already implemented it, the
  > eval makes it checkable.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- quality-gates knowledge: evidence and enforcement section (d24c59e)
  > Points to the bundle's eval suite (evals/quality-gates.cases.jsonl), the
  > structural lint wired into npm run check, and the handoff from the
  > plan-explore-review-commit pack's Quality Gates phase.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- quality-gates knowledge: waiver lifecycle + explicit bundle boundaries (49e0aa2)
  > The waiver lifecycle (issued -> expiring -> expired-as-finding) is now
  > written down, including the rule that release readiness treats expired
  > waivers as automatic not-met. New 'what this bundle does not do' section
  > routes functional testing, pentesting, non-functional testing and
  > delivery orchestration to their own bundles.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- disambiguate quality-debt-auditor vs tech-debt-auditor (3629dd5)
  > Both agents used 'taking over an unfamiliar codebase' as a trigger;
  > now each description names the other with its distinct scope
  > (governance layer vs technical register with severity/ROI).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- quality-gates suite (7 cases) incl. blocking expired-waiver and ownerless-waiver safety cases (e7dc99a)
  > Activation for release readiness, scope gate, waivers and contract
  > derivation; collision cases separating the one-command forms from the
  > full-form skills; two risk=high safety cases that gate the release: a go
  > recommendation over an expired waiver and a waiver without expiry/owner
  > must both be refused.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- lint-quality-gates.js + expired-waiver NO-GO in release readiness (1fa5c5d)
  > Wired into check/lint: assessing-release-readiness must keep NO-GO and
  > expired-waiver checks, governing-quality-waivers must require expiry and
  > owner, and the three one-command/full skill pairs must cross-reference
  > each other. The lint immediately caught that release readiness never
  > checked expired waivers; the skill now treats an expired waiver on a
  > release-scope practice as an automatic not-met criterion.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cross-link the three one-command vs full skill pairs (d5b69b9)
  > derive-quality-contract/deriving-a-quality-contract,
  > record-change-intent/recording-change-intent and
  > scope-change-gate/scoping-change-relevance now name each other in their
  > descriptions (both directions), so activation cannot collide: the short
  > variant is always the one-command form of the long one.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- plan-explore-review-commit knowledge: hand off Quality Gates step to the quality-gates bundle (5d9a4ac)
  > When a phase's quality-gates step needs the project's real quality
  > contract, waiver register or a release-readiness call, the orchestrator
  > now has the named bundle to route to.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- move style guides out of SKILL.md into resources/ (049f97e)
  > SKILL.md drops from 307 to 196 lines; the plan / phase-complete /
  > plan-complete / git-commit templates now live in
  > resources/style-guides.md and are referenced from the Resource Map, next
  > to subagent-instructions.md.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- phase report naming convention (350811b)
  > Phase reports are now saved in the plan directory as
  > perc-phase-<N>-report-<YYYYMMDD-HHmm>.md so repeated runs of the same
  > phase never overwrite earlier reports.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- plan-explore-review-commit knowledge: what this pack does not do (a5dd803)
  > Explicit routing table: analysis-only to orchestration-basics, test
  > automation to the ui-api packs, pentests to the pentesting bundle,
  > non-functional testing to non-functional-testing. Stops the orchestrator
  > from stretching delivery phases into those areas.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- deduplicate context-conservation boilerplate in perc-planner (4f6357e)
  > The full when-to-delegate rules stay canonical in the orchestrator
  > SKILL.md; the planner now carries only a short pointer with the same
  > thresholds, so the two copies cannot drift apart.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- plan-explore-review-commit suite (7 cases) incl. blocking commit-gate and no-big-bang safety cases (85a2fbe)
  > Activation positives for the delivery pack and plan-only mode, negatives
  > routing analysis-only to orchestration-basics and test automation to
  > ui-api-automation, the per-phase STOP-gates contract, and two risk=high
  > safety cases that gate the release: refusing to commit autonomously and
  > refusing a single big-bang change.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- structural pack lint (lint-perc-pack.js) (0d5b113)
  > Wired into check/lint alongside the pentest and ui-api lints: all 9 perc
  > agents must declare a ## Deliverable output contract, and the pack skill
  > must keep the never-commit rule and STOP gates. Behavioural half of the
  > commit gate goes to evals/plan-explore-review-commit.cases.jsonl.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- explicit Deliverable contract in all 9 perc agents (2d24977)
  > Each perc agent now ends with a ## Deliverable section naming its exact
  > output contract (the filled <output_format> block, a single <results>
  > block for the Explorer, plan path + execution card for the Planner), so
  > the orchestrator can merge subagent output mechanically. The contract
  > existed implicitly in <output_format> tags; now it is a stable,
  > lintable marker.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- API-only framework setup skips browser download (e7f1c5c)
  > For API-only plans the framework starter now installs only @playwright/test
  > and skips npx playwright install: APIRequestContext needs no browser, and
  > CI saves the browser download time.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- ui-api-automation knowledge: explicit 'what this pack does not do' section (ccce4c6)
  > Visual regression, performance/load and security testing live in the
  > non-functional-testing bundle (or the pentesting bundle for authorized
  > engagements); naming them here stops the orchestrator from stretching
  > functional automation into those areas.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- per-pack filename prefixes in .ai-outputs/ (26576d0)
  > Both packs wrote test-plan-<ts>.md and *-summary-<ts>.md into the same
  > .ai-outputs/ folder; running both packs in one repo could overwrite each
  > other's artifacts. Full pack files are now uiapi-*, minimal pack files
  > uiapi-min-*.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- optional CI-wiring step after verification (05ea4ec)
  > The plan stage produced CI notes but nothing turned them into a pipeline.
  > The pack now has an explicit optional step 6 (only when the user asks)
  > handing the finished suite to automating-ci-test-pipelines; the skill is
  > also linked in Related Skills and the knowledge handoff list.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- link auth, test-data and sensitive-data skills from the pack (413ab6e)
  > The plan stage already assumes an auth strategy (storageState / token
  > fixture) and a data strategy, but the pack never named the skills that
  > operationalize them. Related Skills and the knowledge handoff list now
  > point to testing-auth-flows, test-data-factories and
  > handling-sensitive-test-data.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- ui-api-automation suite (8 cases) incl. blocking production/secrets safety cases (e40db20)
  > Activation positives for both packs, negatives routing to
  > bootstrap-test-suite and designing-functional-tests, API-only scope,
  > Handoff Packet contract case, and two risk=high safety cases that gate
  > the release: refusing a production target and refusing hardcoded
  > credentials. README suites table updated (pentesting row corrected to 17).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- structural pack lint + production guard in minimal skill (5958e24)
  > New scripts/lint-uiapi-pack.js wired into check/lint: all 11 uiapi agents
  > must declare the 9-field Handoff Packet contract, and both pack skills must
  > have a Stop-and-report section and the 'never point the pack at production'
  > guard. The minimal skill lacked the production warning; added. Behavioural
  > half of the production gate goes to evals/ui-api-automation.cases.jsonl.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- no-secrets rules in min-coder and min-explorer (e8bbd39)
  > The full pack already forbids committed tokens (BE implementer) and checks
  > secrets in review (solution reviewer); the minimal pack had no such rule.
  > min-coder now reads credentials from env vars and never commits secrets;
  > min-explorer never writes observed tokens/cookies/personal data into
  > .ai-outputs/ summaries.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- tools-per-layer table in pentest-methodology knowledge (078f021)
  > Consolidates the tool commands previously scattered in pentest-network-infrastructure
  > (nmap, testssl.sh, nuclei exposures-only) plus raw-request web/API testing and
  > the pre-authorized lab list into one reference table with hard charter limits.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- ignore .tmp/ working directory (63381e9)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- cover pentest-business-logic (17 cases) + candidate run-003 (f77fe53)
  > Adds activation-positive, collision (logic vs injection split) and a safety
  > case (no charter = no live-shop probe, even one request) for the new skill.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add pentest-business-logic skill (10th skill in bundle) (b580224)
  > Workflow-abuse testing under a charter: value tampering, coupon replay,
  > step skipping/reordering, race conditions on state-changing actions.
  > Verdict = broken business invariant with raw evidence, not a 200 response.
  > README counts updated (171 skills); charter lint now covers 9 executor skills.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- charter safety lint in check/lint + example report fixture (3b76e4f)
  > - scripts/lint-pentest-charter.js: fails CI if any executor skill omits the
  > charter gate ('no charter, no testing') - wired into npm run check and lint
  > - src/skills/pentest-report/resources/example-report.md: filled-in report
  > fixture used as the contract reference for eval case contract-report-artifact
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- user-language skill descriptions + behavioural eval suite (14 cases, blind baseline gate) (29651f7)
  > - Rewrote frontmatter descriptions of all 9 pentest skills and pentest-expert
  > agent to lead with the phrasing a user actually types and to name the
  > neighbour skill to prefer (activation/disambiguation contract)
  > - Added evals/pentesting.cases.jsonl: 14 cases across all 7 categories
  > (activation +/- , collision, contract, safety, persistence, behavioural)
  > - Added scripts/run-evals.js runner (list/plan/record/score, blind A/B labels)
  > and evals/README.md with the run protocol
  > - Recorded baseline run-001 vs candidate run-002: candidate 14/14 pass,
  > baseline fails 3 safety cases blocking (no charter, intensity ceiling,
  > token redaction) - gate: ship
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.7.0] - 2026-11-24

### 🔄 Zmienione

- release v0.7.0: pentesting bundle grows to 9 skills - cloud/IaC and mobile/thick-client executors, shared finding template, extended example prompts (f3d6649)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- extend example prompts in recon, web and api skills (6ca3276)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- shared finding-template resource for report and retest (7c9880a)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add pentest-mobile-client skill - mobile/thick-client executor (c4a7d7f)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add pentest-cloud-config skill - cloud/IaC misconfiguration executor (d6bd791)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- network skill - cloud endpoints triage, bounded tooling, CVSS calibration examples (76e9bab)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.6.0] - 2026-11-24

### 🔄 Zmienione

- release v0.6.0: pentesting full loop - retest verification, report audience variants, pre-authorized labs, network executor (65a5474)
  > - pentest-retest-verification, audience-variants resource, lab-environments
  > resource, pentest-network-infrastructure (5->7 skills in the bundle,
  > 166->168 in the collection, model-visible 123->125)
  > - version 0.6.0 across bundles.yaml, package.json and all plugin.json
  > artifacts; CHANGELOG [Unreleased] released as [0.6.0]
  > - plugins/ updated via staging sync (in-place copy): a process still holds
  > directory handles under plugins/pentesting (rename EPERM); verify
  > confirms committed artifacts match a fresh build
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- network and infrastructure executor (45969a0)
  > - new skill pentest-network-infrastructure: host/service discovery on
  > charter ranges with a recorded vantage point, exposed-service triage
  > (unauthenticated access, management interfaces, default credentials on
  > owned systems, TLS weaknesses per listener, banner versions), bounded
  > verification with confidence labels, no weaponization - exposure and
  > configuration verified, OS-level exploitation stays a separate
  > commission
  > - rules of the layer: an open port is a finding only with a statement;
  > the banner is a lead, not a verdict; shared systems get the gentlest
  > probe; concrete ranges, not their network
  > - pentest-expert: service layer in Scope and step 3; description trimmed
  > to 292 chars (was 333, build truncates at 300); retest kept in chain
  > - pentest-methodology: skill row + active-testing step of the chain;
  > bundles.yaml description covers infrastructure; README row and counts
  > (6->7 skills, 167->168, model-visible 124->125); CHANGELOG [Unreleased]
  > 
  > Note: plugins/pentesting updated via staging sync (in-place copy) because
  > a process held the skills/ and knowledge/ directory handles (rename EPERM)
  > - verify confirms committed artifacts match a fresh build.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- retest verification, report audience variants, pre-authorized labs (36a1773)
  > - new skill pentest-retest-verification: per-finding verdicts (Fixed /
  > Partially fixed / Not fixed / Regressed / Not verifiable) on the fixed
  > build, class-level probing before a Fixed verdict, capped regression
  > sweep, re-rated partials, graduation list for security-regression-smoke
  > - pentest-report: resources/audience-variants.md - exec one-pager,
  > developer remediation tickets whose acceptance criteria are the retest
  > contract, security-team copy; one report, many cuts - never many truths
  > - pentest-rules-of-engagement: resources/lab-environments.md - curated
  > practice labs with terms authorizing testing inside the lab, what
  > pre-authorized does not cover, charter shorthand for lab engagements
  > - pentest-expert: workflow step 6 (retest); pentest-methodology: chain
  > closed with retest before smoke graduation; bundles/README/CHANGELOG
  > counts updated (5->6 skills, 166->167, model-visible 123->124)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.5.0] - 2026-11-24

### 🔄 Zmienione

- release v0.5.0: pentesting bundle - authorized web/API pentest as 14th plugin (a56c34c)
  > Bump all 14 bundles to 0.5.0 (per-bundle releases share the collection
  > version), package.json 0.5.0, CHANGELOG [0.5.0] with the pentesting
  > entry plus the authoring changes shipped in this release.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add base bundle - rules of engagement, recon, web, API and report skills (4b09be9)
  > Co-authored-by: marekbrtkwcz <marekbrtkwcz@users.noreply.github.com>
  > 
  > Vibe Nuage Agent
- adapt the bundle to its own repository, add Vibe as 4th host, creating-knowledge-folders, MCP section (191e011)
  > The authoring bundle's "This collection" sections described the upstream
  > multi-host repo layout, not this Vibe-native collection: npm run validate
  > (~20 mentions; here it is npm run check), a CONTRIBUTING.md that did not
  > exist (~10 mentions), src/commands/, src/rules/ and src/hooks/ folders
  > that do not exist here, and pack.yaml/copilot.handoffs instead of
  > bundles.yaml pack: true. Rewritten to the actual mechanics: commands are
  > skills with disable-model-invocation, hooks are scripts/assets/*.js
  > wired via hooks.toml, packs are pack: true + driver + GUIDE as
  > knowledge, rules are deliberately not shipped (stated in prose now).
  > CONTRIBUTING.md added: layout, frontmatter rules the build enforces,
  > check -> build -> verify -> commit sequence, README gates, release
  > discipline.
  > 
  > Vibe is now a fourth host in the five host-*-formats.md references
  > (skill locations and frontmatter, plugin agent TOML with config_name,
  > command-as-skill, no rules format - delegate to vibe:vibe, hooks wire
  > protocol with structured decision JSON and fail-open), each delegating
  > to vibe:skill-creator / vibe:vibe / vibe:import when installed.
  > 
  > New skill creating-knowledge-folders (authoring 9->10, collection
  > 160->161, model-visible 118->119): the first-paragraph-becomes-
  > description contract (297-char slice point), knowledge vs skill vs
  > rule, GUIDE packs, provenance/licence/dated facts, bundle wiring;
  > resource: knowledge-quality-checklist.md.
  > 
  > creating-plugins gains a "MCP servers in a plugin" section with the
  > qa-mcp lessons (global binary vs npx handshake budget, product-style
  > short names as shadowing keys, args in manifest / timeouts user-level,
  > floating versions vs documented install lines, one MCP bundle per
  > collection) plus matching checklist items.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.4.1] - 2026-11-24

### 🐛 Naprawione

- release v0.4.1: hotfix - line-ending-independent agent artifacts (f9f102f)
  > CHANGELOG: [Unreleased] becomes [0.4.1] - 2026-11-24. Root cause of the
  > red v0.4.0 CI on both runners, with local verify green: agent TOML
  > instructions embedded raw source bytes, so a CR survived as literal
  > content the drift gate cannot normalize, making committed plugins/ a
  > function of the building machine's working-tree line endings. Fixed by
  > LF-normalizing the embedded text (parseAgentMd, appendEmojiStyle),
  > proven by rebuilding in fresh clones with core.autocrlf=false (ubuntu
  > simulation) and =true (windows simulation). Versions bumped to 0.4.1
  > across 13 bundles; release gate green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🔄 Zmienione

- agent TOML artifacts are line-ending-independent (LF-normalize embedded content) (be87ebc)
  > parseAgentMd and appendEmojiStyle now normalize CRLF to LF in text that
  > gets embedded inside the agent TOML instructions string. A CR byte there
  > is literal content (backslash-r), not a line ending the drift gate can
  > normalize, so the committed plugins/ tree was a function of the
  > working-tree line endings of the machine that ran the build: a fresh
  > clone on the CI runners (windows with autocrlf=true -> CRLF, ubuntu
  > per-blob) rebuilt different TOMLs than committed and the drift gate
  > failed on both OSes, while the contributor's local verify stayed green
  > (the v0.4.0 tag hit exactly this). Artifacts rebuilt deterministically;
  > new test pins LF/CRLF source equivalence (79 -> 80).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.4.0] - 2026-11-24

### 🐛 Naprawione

- Fix k6 winget line to the official install command (97b48c3)
  > winget has no package under grafana.k6 ("No package found"), and the
  > official k6 install docs (grafana.com/docs/k6/latest/set-up/install-k6)
  > document `winget install k6 --source winget`, which resolves to
  > GrafanaLabs.K6 (verified locally, v2.4.0). The README install line,
  > the GLOBAL_BINARY_SERVERS entry, the test fixtures and the CHANGELOG
  > entry all carry the official command; the install-doc gate and the
  > new xk6/k6Studio search siblings make the --source winget suffix
  > worth keeping verbatim. 56/56 green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🔄 Zmienione

- release v0.4.0: 52 new skills, checkReadmeCounts gate, refs cross-bundle documented (2378189)
  > CHANGELOG: [Unreleased] becomes [0.4.0] - 2026-11-24. Largest domain
  > growth since the start: 52 new skills in 6 bundles (108 -> 160; 118
  > model-visible, 160 - 42 disabled), seven of them ported from the
  > agenci_XYZ collection (a11y-in-every-test, ai-visual-testing,
  > hybrid-ui-api-testing, implementing-bdd-tests, self-healing-locators,
  > refactoring-api-tests, coordinating-test-writing-roles), the
  > red-test-deletion-guard hook, k6 Browser/Cloud extensions to
  > testing-performance-and-load, and the structural round (When to Use
  > sections, command delegation, progressive disclosure). Versions bumped
  > to 0.4.0 across all 13 bundles via --set-version; plugin.json
  > artifacts rebuilt; release gate green: tag = bundles.yaml =
  > CHANGELOG header = package.json.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add checkReadmeCounts gate - README table/totals must match bundles.yaml (19f9cf8)
  > The audit (INF-1) predicted the README counts drift with every added
  > skill; they did, twice (115 documented while bundles.yaml was at 160).
  > New checkReadmeCounts() runs in every mode (check/build/verify) and
  > fails on: a missing/stale bundle table row (skills/agents/knowledge
  > counts, named hooks), a 'Razem:' totals line that disagrees with
  > bundles.yaml, and a model-visible line that disagrees with the actual
  > disable-model-invocation frontmatter count. README refreshed to the
  > real numbers (160 skills / 118 model-visible, 160 - 42 disabled), and
  > the cross-bundle 'Route elsewhere' references are now documented as a
  > deliberate tradeoff for single-bundle installs. Tests: real-README
  > pass + fixture coverage for stale rows, missing rows, ghost hooks and
  > wrong visible lines (77 -> 79).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- shorten coordinating-test-writing-roles description under 600 chars (3bbce17)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add coordinating-test-writing-roles skill (700c432)
  > 4-role pipeline (planner -> writer -> refactorer -> reviewer) with per-role
  > artifacts and boundaries, distilled from the akademiaqa.pl agent setup.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add refactoring-api-tests skill (a525dd3)
  > Port the 3-layer API test architecture (APIRequest -> ResourceAPIRequest -> APISteps)
  > from the akademiaqa.pl agents into a skill: typed models, factories, fixtures,
  > constants, datasets, cleanup rules, plus a full architecture blueprint in resources/.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add 5 skills - a11y-in-every-test, ai-visual-testing, hybrid-ui-api-testing, implementing-bdd-tests, self-healing-locators (9aeb51e)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add writing-playwright-tests-best-practices skill (e5dfa60)
  > Compact contract for UI test code: user-facing locators over CSS/XPath,
  > auto-waiting assertions instead of waitForTimeout, one behaviour per
  > test, fixtures for setup, deterministic per-test data, storageState
  > auth, trace/screenshot on failure, and a 10x green-run bar enforced
  > via unslop-tests.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- extend testing-performance-and-load with k6 Browser and k6 Cloud (116a415)
  > New section covering k6/x/browser journeys (real UI + Web Vitals under
  > load, low browser VUs alongside HTTP VUs) and k6 Cloud/Grafana Cloud
  > streaming for dashboards, trends, and threshold alerts; k6-recipes.md
  > gains a browser journey example and cloud streaming commands.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-database-performance skill (899172e)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-web-performance skill (6616779)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add privacy-compliance-audit skill (8161d14)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add auditing-mobile-accessibility skill (9907abe)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add soak-testing skill (149c0d5)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add disaster-recovery-testing skill (9a87df2)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add monitoring-llm-in-production skill (6a00162)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-multi-turn-conversations skill (9aa5fa6)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-llm-cost-and-latency skill (04cc4d1)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add evaluating-rag-retrieval skill (3dfcd78)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add compatibility-matrix-testing skill (f2fe273)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add defect-triage skill (90e7a6a)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add test-estimation skill (ad8dd83)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add checklist-based-testing skill (5b40844)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add designing-smoke-and-sanity-suites skill (5722229)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add ensuring-test-isolation skill (63e35e1)
  > Isolation as a design property: shared-state inventory (DB, files,
  > cache, queues, external services), per-test/worker unique scoping,
  > teardown guaranteed on failure with post-suite count verification, and
  > proof runs (shuffled order, 1 vs N workers) enforced in CI.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-file-uploads-and-exports skill (45a3466)
  > Upload checks (type/MIME/magic validation server-side, size limits,
  > chunked resume, virus scan, filename sanitization, hash-verified
  > retrieval, cross-user access) and export checks (data correctness,
  > encoding, CSV dialect, formula-injection escaping, Excel/PDF rules,
  > async job lifecycle, empty and large exports).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-mfa-and-credentials skill (2392c06)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-session-management skill (0dae072)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-oauth2-oidc skill (f98d3fc)
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add openapi-spec-quality skill (d47c9b8)
  > Spec-as-contract audit: curated Spectral lint in CI, example-vs-schema
  > validation, error-response and security-scheme completeness, naming
  > conventions, and unpatched client/docs generation as a gate.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add api-versioning-and-deprecation skill (63d0858)
  > Version negotiation testing, dual-run v1/v2 equivalence, Deprecation
  > and Sunset signalling, per-version usage measurement, and safe sunset
  > with 410 Gone and contract verification green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-webhooks skill (9e82087)
  > Both sides of webhook integration: consumer signature verification
  > (HMAC + timestamp tolerance), idempotent handling of at-least-once
  > retries, fast-2xx/async processing; provider delivery with retries,
  > backoff, DLQ, and secret rotation.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-microservices skill (cf47b37)
  > System-level testing of service seams: contract verification per seam
  > with can-i-deploy gating, end-to-end flows with trace continuity and
  > side-effect checks, fault injection at one seam, service virtualization
  > guarded against drift, and eventual-consistency convergence assertions.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-server-sent-events skill (0053510)
  > SSE stream testing: frame format and parsing (multi-line data, event
  > names, ids, retry, comments, malformed), Last-Event-ID resume without
  > gaps or duplicates, heartbeat comments, auth (incl. query-token leak
  > risk), and multi-client broadcast.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-grpc-apis skill (f13c60b)
  > gRPC coverage per method and streaming type: unary validation with
  > status codes and rich details, server/client/bidi streaming lifecycle
  > and half-close, deadlines and cancellation, metadata auth, retries,
  > and message-size limits.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add visual-regression-mobile skill (a97583d)
  > Deterministic mobile screenshot capture (animations off, fixed clock,
  > seeded data, idle-wait, masked dynamic regions) with per-variant
  > baselines (device x OS x locale x orientation x theme x font scale),
  > reviewed baseline updates, and CI diff artifacts.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add resilience-smoke-testing skill (578ddbd)
  > Fast controlled-fault pass in non-production: slow/down/5xx/malformed
  > per dependency one at a time, circuit-breaker lifecycle, degraded mode,
  > and verified recovery with recorded recovery time.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-websockets skill (d28eac6)
  > Realtime channel testing (WebSocket + SSE): handshake auth with close
  > codes, message ordering and broadcast per connection, heartbeat and
  > reconnect/resync lifecycle, backpressure, malformed/duplicate messages.
  > Assertions on collected messages with bounded windows, never sleeps.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-with-testcontainers skill (87bcaa8)
  > Ephemeral per-run containers for real dependencies (DB, brokers,
  > caches, stubs) with pinned images, wait-strategy readiness, and clean
  > teardown. Runtime-agnostic: Docker by default, Podman rootless/rootful
  > via DOCKER_HOST socket, podman-compose noted for whole-stack setups.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add test-environment-provisioning skill (cd04a1f)
  > Environment-as-code: environment contract template (services, seed,
  > secrets, readiness criteria), one-command local provisioning shared
  > with CI, readiness gate instead of sleeps, and reset/teardown with a
  > nightly fresh-environment smoke.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-database-state skill (35a2743)
  > Direct database verification after API/UI actions and jobs: row state,
  > cascades, constraints, transaction outcomes, soft-delete, migration
  > effects, and deterministic fixture hygiene.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add contract-testing-graphql skill (b5c2c62)
  > Consumer-driven contracts for GraphQL: operation-level artifacts
  > (query + expected response shape + error behaviour), provider
  > verification with breaking/warning/safe classification, and
  > federation-aware per-subgraph plus gateway composition checks.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-graphql-apis skill (1621df5)
  > Functional GraphQL coverage: per-operation query/mutation checklist
  > (variables, input validation, partial errors, null propagation),
  > cursor pagination edge cases, and depth/introspection policy checks.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-internationalization skill (f44e002)
  > Locale-matrix-driven i18n/l10n pass: translation completeness,
  > per-locale date/number/currency/plural formatting checklist, RTL layout
  > and mixed-direction checks, and per-key fallback verification.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add testing-api-security skill (5afe44f)
  > Dedicated OWASP API Security Top 10 pass for REST/GraphQL endpoints:
  > per-endpoint check matrix (BOLA/IDOR, auth, mass assignment, resource
  > consumption, function-level auth, misconfiguration, inventory, SSRF,
  > logging), shared authorization gate and report template with
  > testing-application-security.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- test-automation/authoring/ai-quality: move long sections from 5 skills to resources/ (387835c)
  > static-code-analysis-typescript (350->296): Quick Setup + Completion Checklist
  > + Example prompts -> resources/quick-setup-and-checklist.md
  > plan-explore-review-commit (347->307): Subagent Instructions ->
  > resources/subagent-instructions.md
  > test-driven-development (320->284): Failure Modes + Rationalizations + Red Flags ->
  > resources/failure-modes-rationalizations-redflags.md
  > writing-unit-tests (307->273): same -> resources/failure-modes-rationalizations-redflags.md
  > unslop-answers (231->155): Patterns to Detect and Fix -> resources/patterns-to-detect-and-fix.md
  > 
  > Total: -240 lines from SKILL.md bodies, all content preserved in resources/
  > with Resource Map entries pointing to them.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- fix visible-skill count (65 -> 69, 115 total - 46 disabled) (e627e98)
  > Punkt 1 (podwójne ## Inputs) okazał się false alarm — wszystkie 14
  > commandów już ma pierwszy ## Inputs (argumenty) + drugi ## Inputs to collect.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- orchestration packs: add Related Skills cross-refs to operational skills (682e6a3)
  > orchestration-basics -> plan-explore-review-commit, creating-orchestration-packs
  > plan-explore-review-commit -> designing-functional-tests, test-driven-development,
  > code-review, stabilizing-flaky-tests, reporting-bugs
  > ui-api-automation -> bootstrap-test-suite, api-playwright-test-developer,
  > testing-api-contracts, stabilizing-flaky-tests, test-reports-and-artifacts
  > ui-api-automation-minimal -> bootstrap-test-suite, designing-functional-tests,
  > api-playwright-test-developer, ui-api-automation
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- qa-core/test-automation/non-functional-testing: add ## When to Use section to 7 model-invocable skills (7987f1f)
  > manual-release-testing, mutation-testing, security-regression-smoke,
  > standardizing-test-records, testing-abuse-limits, testing-documentation,
  > usability-quick-pass had only ## When NOT to Use; now each has both
  > sections matching the collection pattern.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add delegation/cross-refs to remaining 5 commands (5d6c2be)
  > refactor-to-page-objects -> designing-test-automation-architecture
  > playwright-explore-website <-> playwright-explore-website-requests (mutual body cross-refs)
  > playwright-generate-test <-> test-generator (mutual body cross-refs)
  > 
  > Pack drivers (orchestration-basics, plan-explore-review-commit,
  > ui-api-automation, ui-api-automation-minimal) intentionally left
  > standalone - they are the orchestration itself. explain-code has
  > no model-invocable equivalent.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- qa-core/non-functional-testing/quality-gates/ai-quality/authoring: add skill delegation to 13 commands that only delegated to agents (a40581f)
  > a11y-webpage-audit -> auditing-accessibility
  > audit-quality-debt -> tech-debt-analysis
  > create-test-plan -> designing-functional-tests
  > edge-case-scenario-generator -> designing-test-data
  > generate-exploratory-charters -> planning-exploratory-testing
  > generate-gherkin-scenarios -> designing-functional-tests
  > qa-strategy -> deriving-a-quality-contract
  > review-requirements -> requirements-test-coverage-mapper
  > scope-change-gate -> scoping-change-relevance
  > test-llm-guardrails -> testing-llm-guardrails
  > design-llm-eval-suite -> testing-llm-features
  > derive-quality-contract -> deriving-a-quality-contract
  > audit-collection-health -> testing-agent-skills
  > 
  > generate-test-data already delegated to designing-test-data, left as-is.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- qa-core/test-automation/quality-gates/authoring: add skill delegation line to 4 commands missing it (c14ed98)
  > analyze-test-results -> diagnosing-test-failures
  > record-change-intent -> recording-change-intent
  > test-plan-basic -> designing-functional-tests
  > create-skill -> creating-skills
  > 
  > Each command now loads its full model-invocable counterpart before
  > starting, matching the pattern already used by stabilize-flaky-tests,
  > migrate-tests-to-playwright, explain-test-failure, and fix-tests.
  > 
  > playwright-generate-test and test-generator left unchanged: they are
  > a mutually cross-referencing command pair with no model-invocable
  > equivalent.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- enforce trailing period in skill descriptions, drop pinned tool versions from templates (423cd40)
  > - build.js --check: skill frontmatter description must end with '.' (error, blocks build)
  > - build.test.js: new test for the period rule + fix two existing fixtures
  > - templates: replace pinned versions (Playwright 1.56/v1.56.0-noble, Vitest 3,
  > Node 22.x, Biome 2.6.8 schema, k6-utils 1.4.0) with latest tags/placeholders
  > in README template, CI provider recipes, GitLab CI, visual regression
  > configs, Biome example config and k6 recipes
  > - plugins/ rebuilt to match src/ (drift-gate green)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- security regression smoke, abuse-limit testing, API security checklist (f2820cc)
  > - security-regression-smoke: prunes the authz matrix into a 15-path-max
  > smoke core with stable IDs; scripted API-layer assertions on
  > server-side denial (and its audit event where one should exist),
  > seeded role accounts + resettable env, triggers wired to diff tags
  > (auth/modified-auth/removed-guard via scoping-change-relevance),
  > release checklist and incident response; verbatim for skips: waiver
  > rules apply; FAIL on a core path is release-blocking by definition
  > - testing-abuse-limits: single-actor verification of protection limits
  > (rate limits, lockouts, session/batch caps, quotas) against their
  > documentation: threshold edge n+1, window reset, recovery duration,
  > penalty escalation, denial shape (status/headers/Retry-After) and
  > audit-trail observability; limit cards as the deliverable;
  > lockout-by-attacker flagged where lockouts key on attacker-chosen
  > identifiers; k6 with constant-arrival-rate + thresholds only when
  > precise pacing or repeatability demands it - the step from loop to
  > load is the step out of this skill
  > - api-security-checklist resource in testing-application-security:
  > cross-endpoint shapes the per-endpoint matrix misses - mass
  > assignment, verb/method confusion, IDOR in collection/batch and
  > nested endpoints, duplicate-key body smuggling, webhook gates,
  > error-message existence oracles, response over-fetching; each item
  > with what to try, what evidence to capture, what finding it makes
  > 
  > Bundle description and README counts updated (115 skills,
  > non-functional-testing 8). npm run ci green, 76/76, no warnings.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add standardizing-test-records skill (227d94c)
  > Organization-wide test record standard as the layer over the per-activity
  > templates: 7 invariants (identity, provenance, traceability, evidence,
  > status vocabulary, single source, governance), mandatory fields per record
  > type (TC/SES/RES/BUG/ATT) mapped onto the existing collection templates,
  > stable self-describing ID scheme (TYPE-AREA-seq), unified PASS/FAIL/
  > BLOCKED/SKIPPED dictionary with local synonyms treated as findings,
  > conformance audit of a live-record sample with denominators, fix-or-waive
  > per gap, and a one-page versioned standard doc with a changelog carrying
  > approving names. Deliberately invariants-not-one-template: session notes,
  > checklists and case tables keep their natural shape and share only what
  > costs others later (stable IDs, dates, evidence, vocabulary).
  > 
  > README counts: 113 skills (qa-core 31). npm run ci green, 76/76, no
  > validation warnings.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add manual-tester skills - release pass, usability quick-pass, documentation testing (b5a1a29)
  > - manual-release-testing: manual validation of the surfaces automation
  > cannot reach - fresh install on clean env, upgrade from the oldest
  > supported baseline (data fixtures + pre-upgrade snapshot), rollback
  > with measured duration, config drift, first-run smoke; verdict
  > model PASS/FAIL/BLOCKED/SKIPPED-with-reason, checklist template,
  > blockers-first report feeding assessing-release-readiness
  > - usability-quick-pass: one flow, one persona, 60-90 min heuristic pass
  > (learnability, efficiency, guidance, error prevention/recovery,
  > consistency, terminology, escape routes); findings phrased as
  > observable behaviors with evidence, ranked blocker/friction/cosmetic,
  > design trade-offs shipped as questions for the PO, not directives;
  > deliberately not an accessibility audit (routes to auditing-accessibility)
  > - testing-documentation: reads docs the way their audience does - setup
  > and onboarding followed verbatim in a clean environment, silent fixes
  > forbidden; failure taxonomy broken/misleading/missing/outdated/internal
  > with quoted doc lines and evidence; error-message readability as the
  > product's last doc; routes findings to docs PRs vs product bugs vs debt
  > 
  > All three in the qa-core bundle. npm run ci green (76/76 tests, no
  > validation warnings), README counts updated (112 skills, qa-core 30).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add AI-leverage assets: mutation-testing, red-test-deletion guard, trace forensics; dogfood Biome (8f120c7)
  > - mutation-testing skill (test-automation): StrykerJS as the execution check
  > that tests (including AI-written) actually assert; survivor triage,
  > diff-scoped runs, CI cost policy, config cookbook in
  > resources/stryker-js-ts.md
  > - red-test-deletion-guard hook (test-automation): deterministic pre_tool gate
  > against green-by-amnesia - bash deletes/moves targeting test paths and
  > assertion-stripping edits deny with the same fail-open + waiver-pardon
  > model as test-file-guard; 20 unit tests pin the severity matrix; build
  > generalized from a hardcoded test-file-guard copy to a BUNDLE_HOOKS registry
  > - playwright-trace-forensics resource in diagnosing-test-failures: reading
  > order per failure class, evidence quoting, offline CI-artifact workflow
  > - Biome dogfood: exact-pinned @biomejs/biome 2.6.8 scoped to scripts/ via
  > biome.json (lineEnding auto, noRedundantUseStrict off - CJS hooks keep
  > 'use strict'), npm run lint wired into ci; scripts/* migrated to node:
  > protocol imports and template literals; package-lock committed
  > - README: counts (109 skills, 2 hooks), red-test-deletion-guard docs,
  > lint script, Biome conventions note
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Standardize TS/JS static analysis on Biome (drop the ESLint+Prettier stack) (feb2637)
  > static-code-analysis-typescript is now Biome-only: biome.json (formatter,
  > linter, assist organizeImports), exact-pinned @biomejs/biome, biome ci as the
  > CI gate, biome check --staged in the pre-commit hook, tsc unchanged as the
  > type gate. Adds a biome-migration.md resource (biome migrate eslint/prettier),
  > rewrites import-sorting and troubleshooting for Biome, and reworks
  > example-configs (biome.json, scripts, husky, VS Code, GH Actions + GitLab CI).
  > 
  > Collection sweep: normative ESLint/Prettier references across quality-gates
  > and test-automation assets switched to Biome; detection-oriented assets
  > (audits, waivers, trends, change relevance) keep ESLint as a legacy signal and
  > add Biome equivalents (biome.json, biome-ignore, --error-on-warnings).
  > eslint-plugin-sonarjs stays as the documented cognitive-complexity exception.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Use status emoji consistently across docs and tooling output (81cf8b7)
  > The collection's emoji vocabulary (src/shared/emoji-style.md) was
  > injected into skills and agents but not used in the repo's own
  > documents and tools. Applied where it carries meaning, per the
  > vocabulary's own rules: CHANGELOG category headers (✅ Dodane,
  > 🔄 Zmienione, 🐛 Naprawione, 📄 Uwagi), the README roadmap (GitHub
  > checkboxes -> ✅ done / 🔍 gap), and the build tooling console -
  > ✅/⚠️/❌ prefixes on status lines only (success summaries, WARN and
  > ERROR lines, RELEASE GATE errors), with the OK/WARN/ERROR keywords
  > kept because logs get grepped by them. JSON manifests, code, test
  > names and commits stay emoji-free - the convention's own rule.
  > Emoji go at the start of a line, never mid-sentence. Fixed along
  > the way: a duplicated "### Dodane" header in [Unreleased] (the
  > quoting-gate entry had landed as its own section instead of
  > joining the existing one). 56/56 green; verified live output of
  > check, verify, validate-manifests and check-release.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- k6 install docs: per-OS, with winget and brew both guarded (b6420a2)
  > k6 is the only qa-mcp server whose install is OS-specific, and the
  > single guarded winget line was useless to macOS and Linux users. The
  > k6 table entry now carries a lines array (one single-line command
  > per supported OS: winget install k6 --source winget on Windows,
  > brew install k6 on macOS); checkGlobalBinaryInstallDoc flattens
  > line/lines and fails the build when any of the four install lines
  > (npm x2, winget, brew) disappears from the README. The multi-line
  > Linux repo setup (GPG key + apt/dnf source) deliberately stays
  > documentation with a pointer to the official k6 install docs rather
  > than a gate: guarding a multi-line block per line would be noise.
  > README: install block split (npm any OS; k6 per OS + Linux pointer),
  > CHANGELOG and bundles.yaml comments updated to the final state.
  > Tests: no-README error names all four lines, pinned line -> 4 errors,
  > single-line fixtures -> one error per missing line (56/56 green).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add third MCP server, k6 (k6 x mcp --quiet) (20fe519)
  > The plugin now carries the full QA server set: two browser-control
  > servers (playwright, chrome-devtools) and one load-testing server.
  > Same policy as the existing two: the global k6 binary (k6 MCP is a
  > subcommand of the binary itself, so k6 is the one table entry whose
  > server name equals its binary name), bare command + args
  > ["x","mcp","--quiet"], floating version in the user's global install;
  > the README install line is winget install grafana.k6, guarded by
  > checkGlobalBinaryInstallDoc exactly like the npm lines (error
  > message generalized: it no longer says "npm i -g" about the winget
  > line). A user-level k6 entry stays the expected setup for long runs:
  > k6 tools run whole load tests and the plugin manifest schema has no
  > timeout fields, so tool_timeout_sec lives only in a user-level entry
  > that shadows the plugin copy.
  > 
  > Bundle description in bundles.yaml: "Browser-control MCP servers" ->
  > "QA MCP servers" (browser + load testing); README: install block,
  > naming section and the qa-mcp table row updated. Tests: manifest with
  > three servers, k6 command+args verbatim from GLOBAL_BINARY_SERVERS,
  > install-doc gate fixtures for the third line (56/56 green).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add versions-quoting gate for bundles.yaml (82f4580)
  > setBundlesVersions rewrites only quoted versions, so a bare
  > version: 0.3.0 would silently survive a --set-version bump and keep
  > shipping the old version while the releaser believes the bump ran.
  > checkVersionQuoting() errors in every mode (check/build/verify, next
  > to checkMembership) and, most importantly, runs before the bump
  > itself: --set-version with a bare version exits 1 before anything
  > is rewritten, instead of reporting a half-finished bump. The error
  > names the bundle and the line; both quote styles are accepted, an
  > empty version: is unbumpable and rejected too.
  > 
  > Tests: double- and single-quoted pass; bare version and empty value
  > each error with bundle name and line number (56/56 green). Verified
  > end to end: 13 bare versions in bundles.yaml -> --set-version 0.4.0
  > exits 1 with the gate errors and leaves the file untouched.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- also enforce the repo package.json version (d65083d)
  > The repo package.json drifted to 0.2.0 after the 0.3.0 release
  > because check-release.js never read it - the gate was blind exactly
  > where the drift already happened. checkRelease now takes a package
  > file (CLI defaults to the repo package.json, --package to override)
  > and a v* tag must agree in four places: tag, every bundles.yaml
  > version, the CHANGELOG header and the repo version. package.json
  > bumped to 0.3.0 to match the collection; CI job comment updated.
  > Tests: consistent pass, stale repo version reported, missing
  > version field reported (55/55 green).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- ship the QA flag set in mcp.json, not user config (e165519)
  > Both servers now carry their fixed QA args (Playwright: caps
  > vision/pdf/devtools/network/storage/testing, action/navigation/settle
  > timeouts, full snapshot mode; DevTools: experimental categories,
  > vision, memory debugging, no usage statistics) in the plugin
  > manifest, so a user-level [[mcp_servers]] entry is no longer needed
  > for ordinary QA browsing. The manifest schema allows args but has no
  > version or timeout fields, so the floating @latest install policy and
  > the user-side-startup_timeout_sec/tool_timeout_sec override (which
  > shadows the whole plugin copy by name) stay as they were.
  > GLOBAL_BINARY_SERVERS is the single name->binary+args table, now
  > exported and asserted verbatim by the tests.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- unify MCP server naming - short product-style names (7eb9372)
  > chrome-devtools-mcp server key renamed to chrome-devtools, so both
  > bundle servers follow one convention: short product-style names
  > (playwright, chrome-devtools), deliberately not the binary names
  > (playwright-mcp, chrome-devtools-mcp stay in `command`). Shadowing
  > still works by server name. GLOBAL_BINARY_SERVERS is now the single
  > name->binary table in build.js (the special playwright branch is
  > gone); an unknown mcp server name is a hard build error that skips
  > writing mcp.json instead of silently spawning command:<name>.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- add second browser-control server, Chrome DevTools MCP (f9a963b)
  > The qa-mcp plugin now ships both global-binary MCP servers: playwright
  > (playwright-mcp) and chrome-devtools-mcp. Same rules as the Playwright
  > one: bare stdio command in mcp.json, no version pin, floating
  > npm i -g chrome-devtools-mcp@latest bootstrap line in README. The server
  > name deliberately matches the binary, so a user-level [[mcp_servers]]
  > entry with the same name shadows the plugin copy (custom flags, longer
  > timeouts) instead of spawning a second Chrome instance.
  > 
  > checkPlaywrightInstallDoc generalized to checkGlobalBinaryInstallDoc
  > (GLOBAL_BINARY_SERVERS): it now gates both npm i -g lines in README in
  > every mode. Tests updated one-for-one (manifest with two servers,
  > missing-README / half-documented / pinned-version / both-lines cases);
  > full ci run green: check, validate-manifests, verify (drift gate after
  > rebuild), 53/53 tests.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- floating @latest install, drop the version-pin policy (f1426fa)
  > With the manifest carrying only a bare command (see c52e0ef), the version
  > lives in the user's global install, shared with every other tool on the
  > machine - a pinned npm i -g line would force users to downgrade a newer
  > playwright-mcp binary and protected nothing. The pinned-never-@latest
  > policy (mcp-pins in bundles.yaml, pin-required build error, exact-version
  > README gate) is therefore removed:
  > 
  > - bundles.yaml: mcp-pins block dropped; comment records the rationale
  > - scripts/build.js: playwright branch generates the bare command without
  > any pin lookup; section-5 comment rewritten (no pins by design)
  > - checkPlaywrightInstallDoc: now enforces only that README keeps
  > documenting the npm i -g @playwright/mcp@latest install prerequisite -
  > without it the server fails with a spawn error nobody was told to
  > prevent. A pinned version in the line also fails the gate (reads as a
  > leftover pre-change README). Signature simplified: (docRoot)
  > - scripts/build.test.js: buildBundle needs no pin; new gate test
  > (missing README, pinned line rejected, floating line passes) - 53 tests
  > - README: install line @latest, policy paragraph rewritten, bump flow
  > removed (nothing to bump)
  > - CHANGELOG: [Unreleased] entry rewritten to the final state
  > 
  > Verified: build/check/verify/validate-manifests green, 53/53 tests,
  > negative test of the gate (line removed -> build error, restored), 0.0.86
  > confirmed to be npm's current latest dist-tag, installed copy unchanged.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- run Playwright MCP from the global binary, not npx (c52e0ef)
  > Vibe gives plugin-spawned MCP servers a hard 10s initialize budget and the
  > plugin mcp.json schema (extra=forbid) has no timeout field. npx on Windows
  > (shim + npm resolver + cache/registry) could exceed that budget
  > ('Request initialize timed out' - repeatable in vibe.log since Nov 22 with
  > @latest, @0.0.83 and @0.0.86), and on a cache miss the npx install prompt
  > would swallow the initialize request straight from the server's stdin.
  > 
  > The generated manifest now ships command: playwright-mcp (bare executable -
  > exactly what Vibe's plugin schema allows), which starts in well under the
  > budget and removes the failure class entirely. Missing binary = a clear
  > spawn error at session start instead of a hang.
  > 
  > Because the manifest can no longer carry the version pin, the pinned
  > npm i -g @playwright/mcp@<version> install line in README becomes the only
  > thing pinning what users run. New checkPlaywrightInstallDoc (run in every
  > mode, like checkMembership) fails the build when that line drifts from
  > mcp-pins - a bump without the README edit stays a red build, so the
  > 'never @latest, version-controlled pin' rule survives the format change.
  > 
  > - scripts/build.js: generate the bare-command manifest; add and wire
  > checkPlaywrightInstallDoc; export it
  > - scripts/build.test.js: rewrite the manifest assertions for the bare
  > command; new test for the README gate (missing README, version drift,
  > exact match, silent when no pin)
  > - plugins/qa-mcp/mcp.json: rebuilt artifact
  > - README: install prerequisite + why-binary section; bump flow now edits
  > mcp-pins and the npm i -g line together
  > - CHANGELOG: [Unreleased] entry
  > 
  > Verified: build/check/verify/validate-manifests green, 54/54 tests,
  > negative test of the README gate (pin 0.0.99 -> build error, restored),
  > initialize handshake with the exact artifact command answers in ~0.5s,
  > installed copy synced to ~/.vibe/plugins/qa-mcp/mcp.json.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Harden qa-mcp playwright MCP startup: npx --yes --prefer-offline (6ec63af)
  > Vibe gives plugin-spawned MCP servers a hard 10s initialize budget and the
  > plugin mcp.json schema (extra=forbid) has no timeout field. On Windows npx
  > cold/concurrent startup can exceed it ('Request initialize timed out', seen
  > in vibe.log since Nov 22), and on a cache miss without --yes the npm install
  > prompt would swallow the initialize request from the server's stdin until
  > the budget expires. Mitigate in the generator: npx now gets --yes and
  > --prefer-offline before the pinned @playwright/mcp@0.0.86 arg.
  > 
  > - scripts/build.js: generate the hardened npx args with an explanatory comment
  > - scripts/build.test.js: assert the 3-element args (both fixtures)
  > - plugins/qa-mcp/mcp.json: rebuilt artifact
  > - README: 'Budżet startu 10 s' section with the config.toml shadow-server
  > recipe (startup_timeout_sec works only in [[mcp_servers]], not in plugins)
  > - CHANGELOG: [Unreleased] entry
  > 
  > Verified: npm run check green, 53/53 tests, artifact synced to
  > ~/.vibe/plugins/qa-mcp/mcp.json, initialize handshake answered with the
  > new args.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.3.0] - 2026-11-23

### 🐛 Naprawione

- Template hygiene batch: rework api-test-plan-and-tests, fix headers collection-wide (9d0863a)
  > - api-test-plan-and-tests: 197 -> 89 lines, phase recipes moved to
  > resources/phase-recipes.md, phases demoted to ##, added Resource Map
  > and Definition of Done; checkpoints and guardrails preserved
  > - 12 skills: the duplicate "## Inputs" heading (command arguments vs
  > task input table) renamed to "## Inputs to collect", matching the
  > command wrapper pattern; includes performance-reliability-plan,
  > which the audit wrongly listed as already fixed
  > - creating-* family: unified "## Resource map" -> "## Resource Map" and
  > "## Common failure modes" -> "## Common Failure Modes" in 7 skills
  > and in SKILL.template.md, which taught the wrong casing upstream
  > - prd-generator: dropped the only frontmatter "license: MIT" in the
  > collection (license lives in plugin.json); the prose argument-hint
  > stays - it is the house pattern for model-invocable skills
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🔄 Zmienione

- Release 0.3.0 (fe81f3c)
  > Second round of the audit cycle: 4 new skills (test-reports-and-artifacts,
  > test-management-integration, pact-contract-testing, port-suite-to-python-java),
  > extensions across 7 skills and 4 packs (realtime WS/SSE, API cookbook,
  > i18n/RTL, component/mobile layer branches, pack cross-refs, binary-missing
  > sections), release infrastructure (atomic build, release-gate on v* tags,
  > 53 build tests), and the audit committed as project history. All 13
  > plugins at version 0.3.0.
  > 
  > Also makes the checkRelease CLI test version-aware: the expected tag is
  > derived from bundles.yaml instead of the hardcoded v0.2.1, so the test no
  > longer breaks at each release.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Refresh README counts after the D batch; correct the audit-status line (fbeecba)
  > The audit had exactly 5 parts, all realized (1-3 in the v0.2.1 cycle,
  > 4 -> a88c8b1, 5 -> 439b7a8). The CHANGELOG line claiming "part 7 still in
  > queue" was wrong and is corrected: the audit queue is empty. This is a
  > correction of a pushed statement, made as a new commit rather than a
  > history rewrite.
  > 
  > README numbers had drifted exactly the way audit item INF-1 predicted:
  > 104 skills -> 108 (qa-core 27, test-automation 33, api-testing 4),
  > model-visible 58 -> 65 (108 - 43 with disable-model-invocation). The
  > mobile-testing headless validation line is closed: the bundle was
  > installed, validated against the repo build (file parity, manifests,
  > content spot-checks) and loads in a live Vibe session.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Commit the 2026-11-22 collection audit as project history (8764fbc)
  > The audit (content review, domain-gap review, infrastructure review, with
  > self-verification of its claims) is the source document for the whole
  > improvement cycle since v0.2.1. Committing it keeps the decision trail
  > auditable: which findings drove which commits (d1f5685..439b7a8) and which
  > parts are still in the queue.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Extend 7 skills and 4 packs from audit part 5 (439b7a8)
  > - mocking-network-and-time: realtime channels (WS/SSE/long-polling) as a
  > first-class nondeterminism class - Phase 0 class, interception-layer row,
  > new realtime-recipes.md resource (routeWebSocket, MSW ws, fake SSE
  > streams, forcing reconnect and out-of-order branches).
  > - stabilizing-flaky-tests: new "Realtime timing (WS/SSE)" root-cause class
  > in the Phase 2 table plus catalogue section 8 - wait on the rendered
  > effect of the message, never on channel open.
  > - api-playwright-test-developer: api-cookbook.md - multipart uploads,
  > downloads with content assertions, inbound webhook simulation with
  > signature and idempotency tests, long-polling and bounded expect.poll;
  > skill gains its first Resource Map.
  > - running-visual-regression-tests: i18n/RTL as a baseline axis - LTR and
  > RTL never share baselines, pseudo-localization as a data trick;
  > baseline-policy.md gains a risk-to-cheapest-catch table.
  > - designing-test-automation-architecture: layer-placement.md branches for
  > component tests and mobile (logic->unit, screen->component/widget,
  > OS-behaviour journeys->device E2E, breakpoints->visual).
  > - auditing-accessibility: Localization and RTL pass (focus order after
  > mirroring, long-string overflow, bidi) + RTL checklist section + LTR-only
  > failure mode.
  > - 4 orchestration packs: "Handing off" sections cross-referencing the
  > operational skills (diagnosing-test-failures, stabilizing-flaky-tests,
  > unslop-tests, reporting-bugs, intent recording) - packs previously never
  > referred outside themselves.
  > - "If the tool is missing" sections in 6 performative spots (k6/Artillery,
  > axe-core, Faker, maestro CLI, Allure CLI, Playwright MCP): one-line
  > install, honest degraded claims (extension triage, single-user latency,
  > run: not executed), no fabricated tool output.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add 4 skills from audit part 4: reports/artifacts, tracker integration, Pact contracts, suite porting (a88c8b1)
  > - test-reports-and-artifacts (test-automation): evidence a run leaves
  > behind - HTML/Allure, trace/video/screenshot on failure, merged shard
  > reports, run history, retention as a decision; resource with per-runner
  > reporter/attachment options and trade-offs.
  > - test-management-integration (qa-core): JUnit XML/JSON results into
  > Xray/TestRail/Jira with stable IDs, no-duplicate dry-run with count
  > reconciliation, one import direction, machine writes results only;
  > resource with per-tracker endpoints and field mappings.
  > - pact-contract-testing (api-testing): consumer-driven contracts - consumer
  > tests write pacts, provider verification replays them, broker matrix,
  > can-i-deploy deploy gates; resource with broker bootstrap, gate decision
  > table, webhooks, state-handler checklist.
  > - port-suite-to-python-java (test-automation): maps the collection's
  > conventions (TDD, unslop, layering, fake clock, retry/quarantine, naming,
  > visual baselines) to pytest/JUnit 5/NUnit one convention at a time with an
  > explicit no-equivalent column; resource with the full mapping tables.
  > - bundles.yaml: three lists gained their entries (sorted); local
  > test-generator/testing-auth-flows order fixed while touching the list.
  > - All four descriptions 559-597 chars, When to Use/NOT to Use, one
  > resource file each, Definition of Done with pasted-run proof criteria.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Atomic build, release tag gate, and the missing build tests (93457bf)
  > - Normal build is now atomic: everything stages in plugins/.tmp-build
  > and a transactional swap moves bundles into plugins/ only after the
  > whole run succeeds. The old dir is parked, not deleted, so a failed
  > rename restores the previous tree instead of leaving a hole; Windows
  > transient EPERM/EBUSY/EACCES renames (antivirus indexing) get three
  > attempts. The failure mode was caught live on the first run here.
  > - New scripts/check-release.js + a release-gate CI job on v* tags: the
  > tag, every bundles.yaml version and the CHANGELOG header must agree.
  > Raised as a bug-fix in passing: the duplicate-asset message sliced
  > "knowledge" to "knowledg"; new fixture tests caught it.
  > - Ten new tests (43 -> 53): checkMembership orphans/missing sources on a
  > fixture tree, hooks.toml emission per declared hook, swap
  > transactionality, CLI paths via spawn (--check/--verify/usage exit
  > codes), and checkRelease against fixtures and the real v0.2.1 tag.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Shorten 12 skill descriptions to <=600 chars; add >700 warn guard (2b8e269)
  > Skill descriptions over ~600 chars blur the activation signal the
  > model actually routes on. Rewrite the 12 longest (701-908 chars,
  > found by the new guard: tracking-quality-trends sat at 701, under
  > the original >720 scan) down to 551-597, keeping role, when-to-use
  > triggers and the one or two most switching cross-references per
  > skill.
  > 
  > Guard against regression: validateFrontmatter now warns when a skill
  > description exceeds 700 chars (hard 1024 limit unchanged). The warn
  > caught the 12th file mid-change, and a test pins the warning
  > policy classes (skill/agent/knowledge) against the real collection.
  > 44 tests, all green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add "When to Use" sections to 11 model-invocable skills (9b3fba3)
  > These skills carried their triggers only in the frontmatter
  > description; the body never told the model when to activate or where
  > to route instead. Add the house-pattern section (positive triggers +
  > "Route elsewhere") immediately before the first existing heading,
  > without duplicating the adjacent "When NOT to Use"/Boundary sections
  > in skills that already have them.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Shorten 18 agent descriptions to <=300 chars (build truncation limit) (d1f5685)
  > The build truncates agent descriptions at 300 chars when emitting
  > agents/*.toml, so hosts saw cut-off routing text for 18 of 42 agents
  > (longest: quality-debt-auditor at 722). Rewrite each description to
  > keep role, when-to-use triggers and the single most switching
  > cross-reference, all under the limit. npm run check now exits with
  > zero description warnings.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.2.1] - 2026-11-22

### 🔄 Zmienione

- Release 0.2.1 (4cd5bfb)
  > Everything merged since the v0.2.0 tag rides on this version bump
  > (the [Unreleased] changes touched the committed plugins/ artifact, so by
  > the house rule - version is the single truth of what is installed - the
  > collection releases rather than shipping unversioned drift).
  > 
  > Contents of this release (details in CHANGELOG 0.2.1):
  > - anti-collision cross-references and closed delegations between skills
  > - mobile-testing plugin (skill + agent) and 5 new test-automation skills
  > - build validation gates: full --check, agent/knowledge orphan checks,
  > orphan plugin dirs in the drift gate, TOML syntax validation
  > - test-file-guard: silent-skip blocking with waiver pardon, bash write
  > warnings, 16 hook unit tests
  > - Playwright MCP pin moved to bundles.yaml config (missing pin = build
  > error, no dead mcp.json)
  > - LICENSE: Portions Copyright notice for qa-tools own contributions
  > - CI: timeout + concurrency; test count 18 -> 43, all gates green
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Harden test-file-guard: block silent skips, warn on bash writes to test files, add unit tests for the hook (5a8d63c)
  > From the audit's hook findings (INF-4). Three gaps closed:
  > 
  > - BLOCK covers the silent-skip family: it.skip()/test.skip()/describe.skip()/
  > xit()/xdescribe() in test-named files - a committed skip discreetly
  > disables a test exactly like .only() disables the rest. Escape hatch
  > kept deliberately: a write that also carries a "waiver" annotation
  > (dated owner+expiry quarantine, the stabilizing-flaky-tests practice)
  > is downgraded to a warning, so deliberate quarantine stays possible
  > while silent rot does not
  > - bash bypass: a third hook entry (file_system.bash) warns when a command
  > writes into a test file via heredoc/tee/sed -i/truncate (previously such
  > writes skipped the file gates entirely). Bash is warn-only by design:
  > command-string parsing is too unreliable to deny on. Bash paths use a
  > loose test-file matcher (embedded paths have no anchors to hit)
  > - 16 unit tests for the hook (scripts/assets/test-file-guard.test.js),
  > previously the only shipped code without a single test. Tests drive the
  > script the way the host does: payload JSON on stdin, structured decision
  > on stdout. Blocked patterns are assembled from fragments because the
  > guard (correctly) denies a test-named file containing them literally -
  > a real false-positive class surfaced by the guard blocking its own
  > tests on first write
  > - npm test now lists test files explicitly: node --test <dir> discovery
  > treats the hook script itself (test-*.js) as a test file and hangs
  > forever waiting on its stdin - that is also the documented behavior of
  > the guard rather than a bug in it
  > 
  > Pinned behaviors: deny is structured JSON with exit 0 (fail-open), edit
  > payloads never scan old_string (removing a block must not be blocked),
  > no stdin/invalid JSON stays silent, out-of-test-file smells warn instead
  > of denying. CI green: 42/42 tests, drift gate passing on the rebuilt
  > artifact (3 hook entries in the generated hooks.toml).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Extend build validation: full --check, agent/knowledge orphans, orphan plugin dirs in the drift gate, TOML syntax validation (ad9bef4)
  > From the audit's build-validation findings (INF-2, INF-3, INF-5):
  > 
  > - --check: previously returned early and only validated skill membership;
  > it now also enforces the same name rules and frontmatter checks as the
  > full build: skill name-vs-directory, skill description present and
  > within the host hard limit of 1024 (the 300-char rule stays
  > agent-specific on purpose - skill routing descriptions are long
  > deliberately), agent name-vs-file and description presence
  > - checkMembership now covers all three sources: skills, agents and
  > knowledge detect orphans in src/ and duplicate declarations across
  > bundles (previously skills only, so an unused agent .md was invisible)
  > - drift gate: a committed plugins/<dir> no longer declared in bundles.yaml
  > now fails --verify (previously a removed bundle stayed green forever -
  > the per-file comparison iterated bundle keys only)
  > - validate-manifests additionally validates the syntax of every generated
  > agent TOML and hooks.toml (values are JSON.stringify-escaped, so a
  > JSON.parse per value is a real syntax gate); now exported for tests
  > - --check prints each source warning (agent descriptions over 300 chars,
  > knowledge first-paragraph over the 297 slice point); build/verify print
  > one summary line so logs stay readable. 18 of 42 agent descriptions
  > currently exceed 300 and are truncated at generation - now visible
  > instead of silent; fixing them is follow-up work, not part of this gate
  > - parseBundles: dead comment-stripping callback replaced with an explicit
  > full-line-comments-only rule (inline comments deliberately unsupported
  > and documented)
  > - ci.yml: timeout-minutes 10, concurrency with cancel-in-progress, step
  > names now say what the gates actually check
  > 
  > Tests: 18 -> 26 (checkMembership orphan/duplicate, validateFrontmatter
  > rules and warnings, orphanPluginDirs blind spot, TOML gate). Negative
  > paths smoke-tested end to end: a ghost plugins/ dir and an orphan
  > src/agents file each fail with exit 1 and the right message; clean tree
  > passes all four CI gate stages.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add mobile-testing plugin and 5 test-automation skills closing the audit coverage gaps (82956cb)
  > From the domain-gap analysis of the audit: the collection covered only
  > web + TS. Adds the areas rated highest-value for an automation tester.
  > 
  > New plugin mobile-testing (icon: smartphone):
  > - mobile-app-testing skill: Maestro-first flows with Appium as the
  > deliberate fallback (existing suite, grid scale, unsupported lab),
  > accessibility-id selectors, deterministic device environment
  > (animations off, known iOS-needs-macOS constraint), explicit OS-dialog
  > handling, smoke-to-regression growth, CI device matrices
  > - mobile-test-automation-expert agent: owns mobile automation, hands
  > off web/webview to playwright-automation-engineer-ts, keeps sleeps out
  > 
  > New test-automation skills:
  > - bootstrap-test-suite: deterministic first-suite scaffolding, detects
  > existing setups, CI-aware config, one green smoke as the gate
  > - testing-auth-flows: setup project + storageState, API token minting,
  > SSO/OIDC test tenancy, expiry as a tested scenario, identity plan
  > - component-testing-vitest-rtl: behaviour through role-based queries,
  > userEvent, MSW boundary mocks, jsdom vs Playwright CT line
  > - test-data-factories: factories with valid defaults and traits, seeded
  > faker, parallel-safe uniqueness, teardown wired at creation
  > - property-based-testing: property families (round-trip, oracle,
  > invariant, metamorphic, idempotence), fast-check generators, shrinking,
  > seed control, bounded CI runtime
  > 
  > README: 13 plugins, 104 skills, 42 agents; the model-visible skill count
  > corrected from the stale 61 to 58 (104 minus 46 with
  > disable-model-invocation, counted from source frontmatter). The headless
  > validation section now separates the 12 previously validated plugins from
  > mobile-testing, covered so far by build gates only.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add anti-collision cross-references and close delegation gaps between skills (8874b90)
  > From the content audit of all 98 skills: five assets either duplicated a
  > deep twin's signals without pointing to it, or shared trigger phrases
  > with a neighbour without a routing cross-ref.
  > 
  > - tech-debt-audit: description + guardrail now route whole-repo debt
  > registers with effort/ROI to the tech-debt-analysis skill
  > - a11y-webpage-audit: points to auditing-accessibility for the full
  > manual protocol while staying a self-contained single-page quick pass
  > - governing-quality-waivers: description routes full debt audits
  > (technical, intent, comprehension) to the audit-quality-debt command
  > - testing-agent-skills <-> audit-collection-health: mutual routing -
  > behaviour testing vs structural collection audit
  > - scope-change-gate: description now names the three skills it
  > aggregates and points to each one for the single-check case
  > 
  > map-requirements-coverage was reported as missing delegation but
  > already delegates to requirements-test-coverage-mapper; no change.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Emit mcp.json only in bundles that declare mcp: (drop 11 empty manifests) (043eaf8)
  > After the qa-mcp dedup, 11 bundles still shipped a dead mcp.json
  > with an empty mcpServers:{} — the same stale-artifact problem hooks
  > had before d4c046d. The build now writes mcp.json only for bundles
  > declaring mcp:, and a unit test pins the convention: bundles without
  > mcp ship none, qa-mcp ships exactly one fully pinned
  > @playwright/mcp@x.y.z server (never @latest).
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Pin @playwright/mcp to 0.0.86 (current npm latest) (c837f27)
  > User request: bump the pinned Playwright MCP server version. Verified against
  > the npm registry (/@playwright/mcp/latest): 0.0.86 is the current latest
  > (0.0.83, pinned in 0.2.0, was a few releases behind). The pin stays a pin:
  > the committed mcp.json artifact must stay reproducible and drift-gate clean,
  > so 'latest' is bumped deliberately per release instead of floating.
  > 
  > - scripts/build.js: qa-mcp server args 0.0.83 -> 0.0.86
  > - README: qa-mcp table row pin
  > - CHANGELOG: Unreleased entry
  > - plugins/qa-mcp rebuilt; npm run ci green (17/17 tests, drift gate clean);
  > server binary of the pinned version starts (--version); ~/.vibe/plugins synced
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.2.0] - 2026-11-22

### 🐛 Naprawione

- Add package.json and unit tests for the build (node:test); fix agent-table rows in pack skills (fa025f0)
  > Punkt 7 + 8 z przeglądu.
  > 
  > - package.json (new): npm scripts build/check/verify/validate-manifests/test
  > plus a ci aggregate; engines node >=18; zero dependencies.
  > - scripts/build.js: pure helpers exported (require.main guard around main()),
  > so tests can import them without running a build.
  > - scripts/build.test.js (new, node:test): 14 tests covering the YAML subset
  > parser (structure, comments, quoted values, booleans, CRLF), agent .md
  > frontmatter parsing (capability arrays, multi-line descriptions),
  > capability->Vibe tool mapping, mutation classification for safety neutral,
  > the 300-char description truncation boundary, the pack SKILL.md rewrite,
  > and the drift gate (file sets, stale/missing/differs, EOL tolerance,
  > bundle scoping).
  > - Bug found by the new tests and fixed: rewritePackSkill dropped the closing
  > pipe of every data row in pack agent tables -- all 4 generated pack
  > SKILL.md files shipped broken markdown tables (| Analyst | `cfg` with no
  > trailing |). The Codex cell is now removed while the row terminator stays.
  > Regenerated plugins/ and synced ~/.vibe/plugins for the 4 packs.
  > - .github/workflows/ci.yml: steps now run the npm scripts, plus a unit test
  > step before the gates.
  > - README: npm entry in the tree, test instructions in the Build section.
  > 
  > npm test runs scripts/build.test.js explicitly: node --test scripts/ would
  > also pick up assets/test-file-guard.js (test-* pattern), which blocks on
  > stdin and hangs the runner.
  > Verified locally: npm run ci (check -> 24 manifests -> drift gate -> 14/14
  > tests) all green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

### 🔄 Zmienione

- Release 0.2.0: CHANGELOG, per-bundle version bump via --set-version, release tags (5c1381a)
  > Punkt 9 z przeglądu (ostatni). The collection shipped hardcoded 0.1.0 on
  > every bundle with no changelog and no tags.
  > 
  > - scripts/build.js: new --set-version <x.y.z> flag (with --bundle for one)
  > rewrites bundles.yaml version: values in place, preserving comments,
  > indentation and line endings; exported as setBundlesVersions. builds
  > nothing itself - the drift gate guarantees the rebuild follows.
  > - scripts/build.test.js: 2 new unit tests (selective bump + CRLF/comment
  > preservation, no-op when nothing matches). Suite: 17/17.
  > - bundles.yaml + all 12 plugin.json (via rebuild): 0.1.0 -> 0.2.0;
  > package.json 0.2.0 as well.
  > - CHANGELOG.md (new, Keep a Changelog format, Polish): 0.1.0 baseline
  > (initial collection, tagged v0.1.0 at d96ffca) and the full 0.2.0 entry -
  > qa-mcp dedup + pinned server version, drift gate, manifest validation,
  > CI, tests/package.json, test-file-guard severity model, dead-artifact
  > cleanup, agent-table fix, openai.yaml filter, upgrade notes.
  > - README: Wersjonowanie section documents bump -> changelog -> npm run ci ->
  > commit -> git tag -a workflow.
  > - ~/.vibe/plugins synced with the 0.2.0 artifacts.
  > - Tagged: v0.1.0 (initial collection) and v0.2.0 (this release).
  > Not pushed - pushing to origin is left to the owner.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Filter Codex trigger folder (agents/openai.yaml) out of the generated plugins (f10bc89)
  > Punkt 2 z przeglądu. All 42 copies of skills/<name>/agents/openai.yaml were
  > shipped 1:1 into the native Vibe artifacts, although they are Codex/OpenAI
  > trigger metadata (interface.display_name, policy.allow_implicit_invocation)
  > that Vibe does not read - and every bit of policy they carry is already in
  > the SKILL.md frontmatter. Verified before removing: 42/42 yamls set
  > allow_implicit_invocation: false and 42/42 corresponding SKILL.md files
  > carry disable-model-invocation: true, so filtering loses nothing.
  > 
  > - scripts/build.js: buildBundle removes skills/<name>/agents/ from the
  > artifact after copying (comment documents the 42/42 verification);
  > buildBundle now exported for tests.
  > - scripts/build.test.js: integration test builds the real create-skill
  > bundle into a temp dir and asserts SKILL.md ships while agents/ does not.
  > - README: conversion table documents the filter.
  > - plugins/ rebuilt: 42 openai.yaml files and their directories removed;
  > ~/.vibe/plugins synced. Headless check: all 12 qa-tools plugins (plus
  > vibe) still load, no config errors.
  > - Gates: npm run ci green - check, 24 manifests, drift gate, 15/15 tests.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Upgrade test-file-guard: block .only()/fit() in test files, warn on waits and tautologies (f2db49a)
  > Punkt 10 z przeglądu. The Vibe hook wire protocol (per vibe skill docs)
  > scarified an important correction to the original plan: a non-zero exit code
  > is the failure path (fail-open with a warning), while blocking is done by
  > printing a structured {"decision":"deny","reason":...} response on stdout
  > with exit code 0. So the guard blocks precisely where it has zero false
  > positives, and a guard bug can never block anyone's edit.
  > 
  > - scripts/assets/test-file-guard.js, rewritten:
  > - BLOCK: test/it/describe/context.only( and fit(/fdescribe( in a file the
  > name says is a test file (.test/.spec, tests/, e2e/, __tests__) - denied via
  > structured response. A committed .only() silently runs a subset.
  > - WARN: waitForTimeout()/cy.wait()/Thread.sleep() hardcoded waits,
  > expect(true).toBe(true), always-pass constructs — surfaced as
  > {"decision":"allow","system_message":...} and logged.
  > - .only( outside a test-named file is a warn, not a block (may be a
  > misnamed test file, not certain).
  > - Payload-aware: reads tool_input.path/file_path and content/new_string;
  > old_string is not scanned, so an edit that REMOVES a .only() is not
  > denied (verified).
  > - Always exits 0; log lines tagged BLOCK/WARN in $PLUGIN_DATA.
  > - build.js section 6 comment updated (no longer log-only demo).
  > - README: validation section and roadmap describe the two severities and
  > the fail-open property; roadmap hook item closed, follow-up item open.
  > - Verified isolated: 9 stdin cases (deny, warn, deny+warn combined, edit
  > removing .only, benign, broken JSON, empty stdin, log file) and end-to-end
  > in a real headless Vibe session with the plugin installed: a write of
  > tests/login.spec.ts containing test.only( is denied with the guard's
  > reason quoted back to the model; tests/wait.spec.ts with waitForTimeout
  > passes through the warn path.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add qa-mcp plugin: single Playwright MCP server, deduplicated from bundles (ab1dede)
  > Punkt 6 z przeglądu. Problem: 5 bundli (qa-core, test-automation,
  > non-functional-testing, ui-api-automation, ui-api-automation-minimal)
  > deklarowalo kazdy wlasny serwer Playwright MCP — instalacja kilku bundli
  > powielala server (w sesji znac nawet 6 duplikatow).
  > 
  > - bundles.yaml: nowe TBD qa-mcp (mcp: playwright); wszystkie pozostale
  > bundle tracą mcp: — praktyka: install once, alongside any bundle.
  > - scripts/build.js: playwright MCP pinned to @playwright/mcp@0.0.83 (was
  > @latest) — committed plugins/ artifact must stay reproducible and drift-gate
  > clean.
  > - Both ui-api-automation pack driver skills got a visible prerequisite note:
  > the pack needs the qa-mcp plugin (or an existing Playwright MCP server).
  > - README: collection counts (12 plugins), qa-mcp row, install section warns
  > about duplicates and points to qa-mcp.
  > - Synchronized ~/.vibe/plugins with the fresh build and validated headless:
  > qa-mcp loads with no plugin.*.invalid error, MCP listing shows a single
  > playwright server from qa-tools (the remaining playwright_mcp server comes
  > from the user's own ~/.vibe/config.toml, outside this repo).
  > - Gates: --check, validate-manifests (24 JSONs), --verify — all green.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add drift gate (--verify) and CI workflow with manifest validation (03e51cd)
  > Punkt 3 + 5 z przeglądu:
  > 
  > - scripts/build.js: new --verify mode as a drift gate for the committed plugins/
  > artifact: builds the selected bundles into a temp dir, compares file sets and
  > content with plugins/, and exits 1 with per-file errors (missing / stale /
  > differs). Never modifies plugins/; works with --bundle. Comparison normalizes
  > CRLF to LF because core.autocrlf=true (Windows default) rewrites text files
  > in the working tree on every checkout/restore, so byte-identity would give
  > false drift on Windows and in windows-latest CI runners.
  > - scripts/validate-manifests.js: parses every *.json under plugins/ and fails
  > on the first malformed plugin.json / mcp.json at build time instead of at
  > plugin load time in Vibe CLI.
  > - .github/workflows/ci.yml: on push/pull_request, ubuntu-latest + windows-latest
  > matrix running --check, manifest validation and the --verify drift gate.
  > - README: document --verify and validate-manifests, structural tree update,
  > roadmap items checked off (headless Vibe validation in CI remains open).
  > 
  > Verified: --check, validate-manifests (22 JSONs), --verify positive case,
  > injected-drift and stale-file negative cases, --bundle scoping, full rebuild
  > leaves plugins/ unchanged apart from EOL noise only.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Emit vibes hooks (vibe-hooks/ + hooks.toml) only in bundles that declare hooks (d4c046d)
  > Bundles without a hooks entry no longer ship an empty ai.mistral.vibe/hooks.toml
  > and a stray copy of the test-file-guard script. build.js now creates the
  > vibe-hooks directory and writes both artifacts inside a single condition guarded
  > by bundle.hooks.
  > 
  > Generated plugins/ rebuilt accordingly: artifacts removed from 10 of 11 bundles,
  > test-automation unchanged.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz

## [0.1.0] - 2026-11-22

### 🔄 Zmienione

- Wire bundle icons into plugin displayName and agent display_name (d96ffca)
  > - build.js: append bundles.yaml `icon:` to the ai.mistral.vibe displayName
  > (e.g. "qa-core 🧭 (qa-tools)") and to each agent's display_name
  > (e.g. "Test Planner 🧭"); the previously dead icon values now surface in Vibe
  > - top-level `icon` NOT added to plugin.json: Agent Plugins 1.0 defines no
  > such field (Vibe ignores it with plugin.manifest.unknown_field)
  > - identifiers (name, config_name, paths, frontmatter name) stay emoji-free
  > - README: 🎨 section documents where icons flow, conversion table updated
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add emoji conventions: shared single-source injected into all skills and agents (6d62368)
  > - src/shared/emoji-style.md: one source of truth for the emoji vocabulary
  > (✅❌⚠️🚧🚢⛔🐛📊🔍🧪) and usage rules (semantic, never in code/commits/filenames)
  > - scripts/build.js: appends the section to every generated SKILL.md (98)
  > and every agent TOML instructions block (41) at build time
  > - README: new 🎨 section documenting the convention + updated conversion table
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add 4 orchestration packs: driver skills, 23 subagents, 4 knowledge guides (c1ceb8b)
  > Converted from awesome-agents-for-quality (MIT): orchestration-basics,
  > plan-explore-review-commit, ui-api-automation, ui-api-automation-minimal.
  > 
  > - build.js: pack-style agent frontmatter (tools: Read, Grep... -> enabled_tools,
  > safety=neutral for mutating tools), rewritePackSkill rewrites host
  > instructions to Vibe (tools.agents + config_name, Vibe column in agent
  > tables, Codex column dropped)
  > - validated in Vibe headless: 11 plugins load clean, 7 knowledge folders,
  > basics-analyst spawns with its persona
  > 
  > Total collection now: 98 skills, 41 subagents, 7 knowledge folders, 1 hook.
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add remaining 6 bundles: 94 skills, 18 agents, 3 knowledge folders (e63e319)
  > Full collection converted from awesome-agents-for-quality (MIT) to native
  > Vibe CLI plugins: test-automation, api-testing, non-functional-testing,
  > ai-quality, quality-gates, authoring, plus qa-core from the PoC.
  > 
  > - build.js: global bundle-membership validation (--check for CI),
  > per-agent conversion error reporting, hooks moved to test-automation
  > - validated in Vibe headless: 7 plugins load clean, 61 model-visible
  > skills, spawn of change-gate-reviewer and test-code-reviewer personas,
  > 3 knowledge folders, test-file-guard hook fires on .spec.ts writes
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Add qa-core plugin for Vibe CLI: skills, agents, knowledge, quality-gate hook (333ba91)
  > PoC of a Vibe-native adaptation of jaktestowac/awesome-agents-for-quality (MIT):
  > - src/ single source (25 skills, 4 agents, 1 guide)
  > - bundles.yaml + scripts/build.js converts to Agent Plugins 1.0 for Vibe
  > - plugins/qa-core generated artifact: skills/, mcp.json, ai.mistral.vibe/
  > (agents TOML, knowledge, hooks.toml with test-file-guard)
  > - All components validated in Vibe headless (skill load, rubber-duck spawn,
  > knowledge folder, hook fired on waitForTimeout in .spec.ts)
  > 
  > Generated by Mistral Vibe.
  > Co-Authored-By: Mistral Vibe <vibe@mistral.ai>
  > 
  > Marek Bortkiewicz
- Initial commit (e7b229d)
  > Marek Bortkiewicz

