# Risk-Based Test Plan — Fast CI zero-dep (qa-tools)

- **Date:** 2026-11-25 · **Repo state explored:** `main` @ `08289fd` (P24) · **Plan owner:** QA
- **Feature under test:** the consolidated `ci.yml` fast job — zero-dependency gates on 2 OSes (P16, `14265a7`) — as changed by **P23** (`5643d56`): `lint-command-skill-pairs.ts` and `lint-eval-suites.ts` now parse `bundles.yaml` with the homegrown `parseBundles` from `check-bundles-duplicates.ts` (cross-script require) instead of `require('yaml')`.
- **Deliverable type:** full plan — priorities, scenario catalog, findings, assumptions, automation handoff.

---

## 1. Goal

On every push to `main` and every PR, the **fast** job must return the *correct* verdict — green on a valid repo state, red with a readable finding on each known-broken state — in a pristine checkout with **no `node_modules`**, on `ubuntu-latest` and `windows-latest`, within the 10-minute cap (ci.yml:21). Specific risks this plan chases:

1. nothing reintroduces third-party code into the fast chain (the exact P23 failure class: green locally, red ×2 OS in CI),
2. every gate stays able to fail — with a finding a contributor can act on,
3. the shared parser seam does not silently misparse `bundles.yaml` into a false green.

## 2. Test basis and exploration evidence

**Read in full:** `.github/workflows/ci.yml`, `package.json`, `scripts/check-bundles-duplicates.ts`, `scripts/lint-command-skill-pairs.ts`, `scripts/lint-eval-suites.ts`.
**Skimmed (relevant parts):** `scripts/build.ts` (parser, `--check`/`--verify`), `scripts/check-changelog.ts` (parser), `scripts/build.test.ts` (parser tests), the two gate test files, `scripts/validate-links.ts:98` and `scripts/update-readme-stats.ts:19` (the two surviving `require('yaml')` sites).
**Docs carrying the contract:** README.md:222, ci.yml job comments (ci.yml:9-16), commit messages P16/P23, `.qa/review-2026-11-25.md` (status notes).

**Environment facts (observed 2026-11-25):**

- local Node **v26.13.1**; CI pins **24** (ci.yml:34, ci.yml:58); `engines.node: ">=24"` is not enforced by any gate
- local `core.autocrlf=true`; repo has **no `.gitattributes`** → working-tree line endings depend on each machine
- fast chain = 4 steps: `npm test`, `npm run check` (6 gates), `npm run validate-manifests`, `npm run verify`

**Runs executed 2026-11-25 (all single runs, Windows/Git Bash):**

| Run | Condition | Result |
|---|---|---|
| Fast chain (`npm test && npm run check && npm run validate-manifests && npm run verify`) | working tree, node_modules present | ✅ exit 0, 15.2 s |
| Fast chain (same 4 steps) | **fresh clone, no `node_modules`, CRLF tree** (autocrlf checkout; `file` confirms CRLF) | ✅ exit 0, 24.7 s |
| `npm run test:p3` | working tree | ✅ 91 pass / 0 fail, 4.6 s |
| `npm test` chain detail | — | ✅ green: 99 eval cases / 12 suites, twin pairs 5/5, 15 JSON + 45 TOML manifests, drift gate `Committed plugins/ matches a fresh build` |

**Gate-sensitivity probes (executed in a disposable scratch clone, each restored and re-run green afterwards):**

| Probe | Mutation | Observed result |
|---|---|---|
| P1 — duplicate asset | appended a new bundle listing existing skill `bug-report` (LF block appended to a CRLF file — mixed EOL edge) | `check-bundles-duplicates` exit **1**: `Duplicate skills: "bug-report" in bundle "qa-core" and "weird-bundle"`; mixed EOL parsed correctly |
| P2 — invalid JSONL | `this is not json` appended to `evals/qa-core.cases.jsonl` | `lint-eval-suites` exit **1**: `[qa-core] line 7: invalid JSON (Unexpected token 'h'...)` — line-precise |
| P3 — renamed asset | `bug-report` → `bug-report-x` in `bundles.yaml` only | caught by **4 gates**: `build --check` exit 1; `check-changelog` exit 1 (`README.md: Model-visible skills count (154) != actual (155)`); `verify` exit 1 with two crisp one-liners; twin + eval gates exit 1 **via raw `node:fs` stack** (see F1); `check-bundles-duplicates` exit 0 (see F3) |
| P4 — twin mutual-ref break | removed command name from `recording-change-intent` SKILL.md description | twin gate exit **1**: `[quality-gates] skill recording-change-intent: description does not mention record-change-intent`; eval gate exit 0 (coverage is case-based, not ref-based — correct separation) |
| P5 — usage error | `--bundles missing.yaml` | exit **2** as documented (`ERROR: ENOENT...`) |
| P6 — zero-dep violation | injected `const y = require('yaml');` at top of `lint-eval-suites.ts`, no `node_modules` | exit **1** `Cannot find module 'yaml'` — the P23 signature reproduced; restored → exit 0 |

> Probe P3 initially produced “all gates green” — because the perl edit missed the CRLF line ending and mutated nothing. The lesson is written into SCN-010: every negative test must assert the mutation landed.

## 3. Scope

**In scope (6 areas)**

1. the zero-dep contract of the fast chain (all 4 steps)
2. the fast-job verdict on a valid state, on both OSes
3. fail-closed sensitivity of each gate, with readable findings
4. the `parseBundles` seam of `check-bundles-duplicates.ts`, incl. 3-parser agreement (`build.ts`, `check-changelog.ts`, gate parser) on the same `bundles.yaml`
5. cross-platform factors: CRLF trees, cross-script require path casing, Node 24 vs local 26
6. workflow mechanics that shape the verdict: concurrency cancel, 10-min timeout, matrix independence, fast↔full signal separation

**Out of scope**

- `release.yml` (tag pipeline) and `quality-gates.yml` nightly P4/P5 scripts
- full-job internals (biome ruleset, tsc config, P2 checks, P3 test contents) — only their *independence from fast* is in scope
- live model A/B eval runs (operator step by design, per `lint-eval-suites.ts` header)
- content quality of evals/skills (P22 scope), runner performance, Node < 24
- a11y-smoke lens: not applicable — no UI in this feature

## 4. Risk and priority map

| Area | Priority | Why it matters | Coverage |
|---|---|---|---|
| Zero-dep contract regression | **High** | Happened once already (P23 root cause); no machine guard exists today; local runs with `node_modules` mask it perfectly | SCN-001/002 baseline, SCN-004/005 negatives, SCN-006 guard |
| Gate parser seam (`parseBundles`, gates variant) | **High** | Verified: **zero direct unit tests** (no test file requires `check-bundles-duplicates.ts`); a silent misparse = false green on duplicates/twin/eval gates; `bundles.yaml` is high-churn (197 skills) | SCN-007/008/009 |
| Gate sensitivity (fail-closed) | **High** | A gate that cannot fail is theater — repo history has the precedent (A6: dead regex, silent skip). 6 classes verified live today; remaining classes enumerated | SCN-010 |
| Windows/CRLF | Medium-High | No `.gitattributes`; matrix exists because autocrlf drift has bitten this repo before (build.ts EMOJI_STYLE comment); parser regexes have CRLF-adjacent spots | SCN-002/011 |
| Parser multiplicity (3 parsers, 3 semantics) | Medium | `build.ts:49`, `check-changelog.ts:34`, `check-bundles-duplicates.ts:54` parse the same file with different edge semantics — future shape edits can make gates and build disagree | SCN-008 → Q2 |
| Diagnostics quality | Medium | Fail-closed but crash-form findings cost contributor time and mask the real class (F1) | SCN-015/016 |
| Workflow mechanics | Low-Medium | Cancelled duplicate runs, hung-job timeout, one OS masking the other | SCN-014 |
| Node contract drift | Low | `engines >=24`, CI 24, dev observed on 26 — unenforced | SCN-013 |

## 5. Scenario catalog

### SCN-001 — Fast chain green from a pristine checkout with zero dependencies
- **Type:** happy · **Priority:** High
- **Preconditions:** scratch `git clone` of the repo; **no `node_modules`** created at any point
- **Steps:** 1. `git clone <repo> fresh && cd fresh` — do not run `npm ci`. 2. `npm test`. 3. `npm run check`. 4. `npm run validate-manifests`. 5. `npm run verify`.
- **Expected:** all four exit 0; each gate prints its ✅ summary (99 cases/12 suites, twin pairs 5/5, 15 JSON + 45 TOML, `Committed plugins/ matches a fresh build`).
- **Notes:** OBSERVED today in a scratch clone (exit 0 chain, 24.7 s, Node 26). CI runs the equivalent on Node 24 per push. Repeatable locally in ~25 s.

### SCN-002 — Fast chain green on a CRLF working tree (windows-latest condition)
- **Type:** boundary · **Priority:** High
- **Preconditions:** checkout with `core.autocrlf=true` (or any CRLF tree), no `node_modules`
- **Steps:** as SCN-001; additionally `file bundles.yaml` confirms CRLF before running.
- **Expected:** exit 0 ×4 gates; no gate mistakes CRLF content for a content change (drift gate compares normalized content, ci.yml:17-18).
- **Notes:** OBSERVED today (clone via autocrlf, CRLF confirmed); P1 also showed an LF block appended to a CRLF file parses fine (mixed EOL tolerated). The windows runner re-executes this on every push — this scenario is the local reproduction of it.

### SCN-003 — CI wiring reality check on GitHub Actions
- **Type:** happy · **Priority:** Medium
- **Preconditions:** access to repo Actions runs
- **Steps:** 1. open the `CI` run for the latest push to `main`; 2. confirm `fast gates (zero-dep, ubuntu)` and `(windows)` plus `full gates` all green; 3. inspect the historical red run referenced by P23 notes (run `45675880550`, both fast legs red `Cannot find module 'yaml'`, full green) — repo notes, not verified in Actions by this plan.
- **Expected:** fast legs report independently (fail-fast off), full independent of fast.
- **Notes:** NOT RUN locally — this is Actions-history verification; the P23 red-run ID is carried from `.qa/review-2026-11-25.md`, not observed here.

### SCN-004 — Third-party require in a fast-chain script fails the fast job loudly
- **Type:** negative · **Priority:** High
- **Preconditions:** scratch clone, no `node_modules`
- **Steps:** 1. add `const y = require('yaml');` at the top of `scripts/lint-eval-suites.ts`; 2. run the gate; 3. remove the line, re-run.
- **Expected:** exit 1 with `Cannot find module 'yaml'`; restored → exit 0. In CI terms: fast red on both OSes while the local machine with `node_modules` stays green — the masking that makes this regression class dangerous.
- **Notes:** OBSERVED today (probe P6, both directions). The violation is loud in fast — the gap is that nothing prevents it before CI (SCN-006).

### SCN-005 — Hidden (lazy/transitive) zero-dep violation
- **Type:** negative · **Priority:** Medium
- **Preconditions:** none; mechanism from `scripts/validate-links.ts:98` — `require('yaml')` sits *inside a function*, so import-time is clean and the crash happens only when the lazy path executes
- **Steps:** 1. in a scratch clone, make a fast gate call a function from `validate-links.ts` that lazily requires `yaml`; 2. run the gate without `node_modules`.
- **Expected:** the gate fails only on the path that triggers the lazy require — a violation invisible to any snapshot check of top-level imports.
- **Notes:** NOT RUN — documented as a mechanism trap (read at validate-links.ts:98). Any guard from SCN-006 should scan full file bodies, not just the first lines.

### SCN-006 — Static zero-dep guard gate (proposed — does not exist today)
- **Type:** negative · **Priority:** High
- **Preconditions:** decision from Q1
- **Steps:** 1. implement a scanner over the fast-chain script set (build.ts, build.test.ts, lint-all-packs, check-changelog, check-bundles-duplicates, lint-command-skill-pairs, lint-eval-suites, validate-manifests, assets/*.test.js): every `require(` target must start with `node:`, `./`, or `../` — anything else fails; 2. wire it into `npm run check`; 3. fixture test: repo passes today, fixture with `require('yaml')` fails.
- **Expected:** the guard itself is zero-dep, runs in the fast job, and turns the SCN-004 class from “caught in CI” into “caught before push”.
- **Notes:** today NOTHING machine-checks the contract (verified by reading `npm run check` composition) — the contract lives only in README.md:222 and ci.yml comments. This is the plan’s top recommendation, see Q1.

### SCN-007 — Gate-parser corpus unit suite for `parseBundles` (check-bundles-duplicates variant)
- **Type:** boundary · **Priority:** High · **ASSUMPTION-tagged** (A1)
- **Preconditions:** the parser exported at `scripts/check-bundles-duplicates.ts:54`; intended semantics assumed per A1 (only expected, not spec’d anywhere — this suite *becomes* the spec)
- **Steps:** build `scripts/check-bundles-duplicates.test.ts` (node:test, `writeTmp` pattern from `build.test.ts:237`) over a corpus: bundle/list capture, scalar keys with values ignored (icon/description/version), full-line comments (inside and outside bundles), blank lines, quoted list items, empty lists, EOF bundle, CRLF, mixed EOL, **inline comments on list items**, **unknown list key with items after an existing list**.
- **Expected (per A1):** the four documented lists are captured exactly; scalar keys ignored; comments ignored. Two corpus cases pin *decision points*, because today’s code disagrees with A1: (a) `- item # note` is captured **as the whole string** (silent wrong name), (b) items under an unknown key (`commands:` after `agents:`) get appended **to the previous list** (misattribution, silent) — see `check-bundles-duplicates.ts:85-90` (`continue` without resetting `currentList`).
- **Notes:** READ from source, NOT RUN — the deciding assertions are expected to FAIL today; that is the point: they are defect-or-documentation decisions for the maintainer (Q2). Nothing in the current file contradicts A1 for the shapes actually used in `bundles.yaml` today (verified: only 4 list keys, items all 4-space `- name`).

### SCN-008 — Three-parser agreement regression radar
- **Type:** boundary · **Priority:** High
- **Preconditions:** parsers: gate variant (`check-bundles-duplicates.ts:54`), build variant (`build.ts:49`), changelog variant (`check-changelog.ts:34`, not exported today)
- **Steps:** for the real `bundles.yaml` and each SCN-007 corpus fixture: parse with all three; compare the (bundle × skills/agents/knowledge/hooks) tuples.
- **Expected:** identical tuples everywhere. Known semantic differences that today produce **no** tuple divergence on the real file, but will on future edits: build parser is generic (any key can be a list, strips quotes), gate parser is LIST_TYPES-only with the unknown-key fallback, changelog parser requires exact `    - ` (4-space) items (`check-changelog.ts` lookahead).
- **Notes:** NOT RUN — new automated test; needs a small export change in `check-changelog.ts` (or consolidation, Q2). This radar converts “three parsers drift apart silently” into a red test the moment they do.

### SCN-009 — Stats/count invariant across parsers and README
- **Type:** boundary · **Priority:** Medium
- **Steps:** 1. mutate one skill name in `bundles.yaml` only; 2. run `npm run check`.
- **Expected:** `check-changelog` flags the count drift (observed: `Model-visible skills count (154) != actual (155)`).
- **Notes:** OBSERVED today as part of probe P3. Cheap, high-value radar — the “same truth in three places” check.

### SCN-010 — Per-gate fail-closed negative matrix
- **Type:** negative · **Priority:** High
- **Preconditions:** scratch clone of HEAD (disposable); every mutation verified to have landed before the verdict is trusted (P3 lesson)
- **Steps:** for each row: mutate → run the listed gate → confirm exit 1/2 + readable finding → restore → confirm green:

| Class | Gate | Status 2026-11-25 |
|---|---|---|
| duplicate asset across bundles | check-bundles-duplicates | ✅ OBSERVED (P1) |
| duplicate within one bundle | check-bundles-duplicates | not yet probed |
| invalid JSONL line | lint-eval-suites | ✅ OBSERVED (P2) |
| renamed/missing asset in bundles.yaml (multi-gate) | build --check, check-changelog, verify, twin, eval | ✅ OBSERVED (P3) |
| twin mutual-ref break | lint-command-skill-pairs | ✅ OBSERVED (P4) |
| usage error (`--bundles` missing file) | check-bundles-duplicates | ✅ OBSERVED (P5, exit 2) |
| eval schema violations (id kebab, category/risk enum, missing criteria, missing `expect_active` on activation/collision) | lint-eval-suites | pure-fn unit tests exist (`lint-eval-suites.test.ts`, 11 tests) — CLI exit not asserted |
| prompt-contains-asset hygiene | lint-eval-suites | same — pure-fn only |
| twin-coverage hole (delete the collision case of a pair) | lint-eval-suites | `checkTwinCoverage` unit-tested; end-to-end not |
| README Suites-table drift (count mismatch / extra row / missing row) | lint-eval-suites | parse/count fns unit-tested; on real README not |
| invalid JSON manifest / malformed agent TOML via CLI | validate-manifests | `validateTomlText`/`validateAll` unit-tested in build.test.ts; CLI exit not |
| orphan src skill (exists, not in bundles) / orphan plugin dir | build --check, verify | concept OBSERVED via P3 mirror direction (verify prints both one-liners) |
| missing file crash class (bundles.yaml absent, evals dir empty, README absent) | all gates | ⚠️ currently raw stack / crash form — see SCN-016 |
- **Expected:** every gate exits non-zero with a finding naming the offending path — never a silent green on a broken state.
- **Notes:** 6 classes live-verified today; the remainder are designed from source reading (rung 2) and need one probe run each. The pure-fn coverage that exists (7 twin + 11 eval tests) is real but does not exercise `main()` wiring or process exit codes.

### SCN-011 — CRLF and mixed-EOL pinning at unit level
- **Type:** boundary · **Priority:** Medium
- **Steps:** corpus from SCN-007 rendered in LF, CRLF, and mixed variants through the gate parser; additionally pin `readDescription` (`lint-command-skill-pairs.ts:103`: `^description:\s*(.+)$`) tolerating a trailing `\r` (consumer `checkMutualRefs` uses `.includes`, so today harmless — the pin prevents a future equality/`endsWith` regression).
- **Expected:** identical tuples for LF/CRLF/mixed; description matching insensitive to `\r`.
- **Notes:** OBSERVED at chain level today (SCN-002 + P1 mixed-EOL); the unit pinning is NOT RUN. Chain-level CRLF fact from build.ts: EMOJI_STYLE normalization comment (historic autocrlf drift bite recorded there).

### SCN-012 — Cross-script require path casing (case-sensitive FS)
- **Type:** boundary · **Priority:** Medium
- **Preconditions:** fast gates cross-require as `require('./check-bundles-duplicates.ts')`, `require('./lint-command-skill-pairs.ts')` (lint-eval-suites.ts:205-206)
- **Steps:** 1. audit all cross-script require paths against on-disk casing (grep, done: all exact today); 2. probe: change one require to wrong casing → run on Windows (expect: resolves, gate green — the trap) then the ubuntu runner (expect: module-not-found).
- **Expected:** audit passes; the probe documents why the ubuntu leg of the matrix matters (Windows dev cannot see this class of breakage).
- **Notes:** AUDIT verified today via grep + ubuntu CI green on HEAD (de facto). The probe is NOT RUN. Candidate to fold into the SCN-006 guard (path casing check is cheap).

### SCN-013 — Node version parity (CI 24 vs local 26 vs engines ≥24)
- **Type:** boundary · **Priority:** Low
- **Steps:** 1. state facts: CI pins 24 (ci.yml:34, ci.yml:58), dev machine observed 26.13.1, `engines.node` not enforced by any gate; 2. watch for Node-26-only API usage in fast-chain scripts (none known; type-stripping `require()` of `.ts` is the main version-sensitive behavior).
- **Expected:** fast gates behave identically on 24 and 26 until an API drift is introduced; CI is the Node-24 source of truth.
- **Notes:** NOT RUN beyond fact-stating; mitigation is documentation/decision (Q5) rather than a gate.

### SCN-014 — Workflow mechanics smoke (concurrency, timeout, matrix, fast↔full independence)
- **Type:** recovery · **Priority:** Low
- **Preconditions:** config read from ci.yml (all values verified in source today: `cancel-in-progress: true` at ci.yml:11, `timeout-minutes: 10` at ci.yml:21 and ci.yml:50, matrix `fail-fast: false`, both jobs Node 24)
- **Steps:** 1. push twice rapidly → the superseded run shows *cancelled*, not failed, and the latest run gives the verdict; 2. any genuinely hung gate → job dies at 10 min, does not hold runners; 3. break a full-only surface (e.g. biome) → fast legs stay green (independent signals by design, ci.yml:48); 4. break an ubuntu-only condition → both legs report (fail-fast off).
- **Expected:** as stated per step.
- **Notes:** config VERIFIED by reading; the four behavioral observations are INCIDENT-WINDOW items (长期的 observation on the next real occurrences), not blocking for this feature.

### SCN-015 — Gate log truthfulness (tautological coverage line)
- **Type:** boundary · **Priority:** Low
- **Steps:** run `lint-eval-suites` on a state where twin coverage is satisfied; read the success line `twin pair split coverage: ${pairs.length}/${pairs.length}` (lint-eval-suites.ts:271).
- **Expected (desired):** the printed fraction reflects *cases actually covering pairs*. Today it always prints N/N (both operands are the same variable) — the log cannot show a coverage hole; only the separate `checkTwinCoverage` issues → exit 1 do.
- **Notes:** READ from source (not run); cosmetic, but it is the line a human reads to conclude “coverage is complete”. Fix = one variable: count distinct covered pairs.

### SCN-016 — Missing-input findings: readable finding instead of raw stack
- **Type:** negative · **Priority:** Medium
- **Preconditions:** `readFrontmatter` (`lint-command-skill-pairs.ts:92`) does an unguarded `fs.readFileSync` per listed skill
- **Steps:** 1. in a scratch clone, list a skill in `bundles.yaml` with no `src/skills/<name>/` directory; 2. run the twin gate and the eval gate.
- **Expected (desired):** exit 1 with a finding like `skill 'X' listed in bundles.yaml but missing from src/skills`. Today: exit 1 with a raw `node:fs` stack (`binding.readFileUtf8...`) — fail-closed, crash-formed (observed in probe P3).
- **Notes:** OBSERVED today. Fail-closed is confirmed (good); the fix is a try/catch in `readFrontmatter` + one fixture test. See F1.

## 6. Findings from planning probes (defect candidates, ranked by cost)

| ID | Finding | Evidence | Cost if ignored | First step |
|---|---|---|---|---|
| **⚠️ F1** | Unknown/renamed asset listed in `bundles.yaml` crashes twin and eval gates with a raw fs stack instead of a finding | `lint-command-skill-pairs.ts:92` (unguarded read); OBSERVED probe P3 | contributor debug time in CI; the crash hides the simple “asset doesn’t exist” class | wrap `readFrontmatter` in try/catch → one-line finding |
| **🔍 F2** | zero-dep contract has no machine guard; prevention is documentation-only (README.md:222) | `npm run check` composition read; probe P6 reproduced the failure class in 25 s | recurrence of P23 (fast red ×2 OS, wasted runs, confusing local-green state) | implement SCN-006 guard + wire into `npm run check` |
| **⚠️ F3** | near-duplicate asset names are advisory-only: Levenshtein<3 warnings print *only* with `--warnings`; `npm run check` runs without it (OBSERVED P3: renamed near-name exit 0) | `check-bundles-duplicates.ts` main() | a near-duplicate slips past this gate; caught today only by membership gates (build --check/verify) | decide: surface warnings in CI, or document advisory-only |
| **⚠️ F4** | eval coverage success log is self-referential (`N/N` always) | `lint-eval-suites.ts:271` | a human reads “5/5 coverage” as evidence it is not | compute covered pairs from case data |
| **🐛 F5** | doc-rot: bundles.yaml header still documents `scripts/build.js`; build is `.ts` | `bundles.yaml:3` | trivial contributor confusion | one-line comment fix |

## 7. Assumptions and open questions

**Assumptions** (each tagged into its scenarios):

- **ASSUMPTION (A1)** — intended semantics of the gate parser: 4 list keys only, scalar keys ignored, full-line comments ignored, CRLF + mixed EOL tolerated. Derived from gate docstrings and ci.yml comments; nothing pins it today — SCN-007 turns it into executable spec. [SCN-007]
- **ASSUMPTION (A2)** — `bundles.yaml` stays in the hand-maintained flat subset style (no flow collections, anchors, multi-document YAML). All three parsers are “minimal subset” by design; breaking A2 deliberately requires re-baselining SCN-007/008. [SCN-008]
- **ASSUMPTION (A3)** — the zero-dep contract covers all four fast steps including the `node --test` runner files (`build.test.ts`, `scripts/assets/*.test.js`). [SCN-001, SCN-006]

**Open questions (blocking decisions for the maintainer):**

- **[OPEN QUESTION] Q1** — adopt the SCN-006 zero-dep guard as a new `npm run check` member? (Plan recommendation: yes — it is the only High-risk area with no automated presence, and its failure class has already fired once in production-CI.)
- **[OPEN QUESTION] Q2** — consolidate the three `parseBundles` copies into one shared module (precedent exists: `check-release.ts:18` already requires the build variant), or keep three and pin agreement via SCN-008?
- **[OPEN QUESTION] Q3** — fix F1 (crash-form findings) now, or accept fail-closed-with-stack until owners of the gates agree on finding format?
- **[OPEN QUESTION] Q4** — `lint-all-packs.ts` runs in both jobs (fast via `check`, full via `lint`) — “each gate once” (P16 goal) still leaves this one duplicate; intended or cleanup candidate?
- **[OPEN QUESTION] Q5** — Node contract: pin contributor guidance (run gates on Node 24 to match CI) or leave `<engines>` advisory as today?

## 8. Automation handoff

| Scenario | Candidate | Why | Next step |
|---|---|---|---|
| SCN-006 guard | **high** | only prevention for the top-risk area; 25 s to reproduce the failure, ~30-line scanner to prevent it | `scripts/check-zero-dep.ts` + fixture pair + wire into `npm run check` |
| SCN-007 parser suite | **high** | the P23 seam has zero direct tests (verified by grep across `scripts/*.test.ts`); this suite becomes the parser spec | new `check-bundles-duplicates.test.ts` in `npm test` (fast, zero-dep), `writeTmp` pattern from `build.test.ts:237` |
| SCN-008 agreement radar | **high** | three-drift is invisible until gates lie; this makes it a red test | export `parseBundles` from `check-changelog.ts` (or consolidate per Q2), compare 3-parser tuples on real file + corpus |
| SCN-010 matrix (remaining rows) | high/medium | 6 classes verified manually today; pure-fn tests exist but CLI exits don’t | extend the two gate test files with fixture-dir cases using already-exported fns (`checkDuplicates`, `validateCase`, `checkTwinCoverage`, ...); assert process exit only where the function is not exportable |
| SCN-016/F1 | medium | one try/catch + one fixture turns a crash into a finding | patch + test in the same PR as SCN-007 suite |
| SCN-015/F4, F3, F5 | low | cosmetic but each is a one-liner | fold into next scripts PR |
| SCN-001/002 hermetic re-run | medium | turns the repo’s P23 manual verification loop into a one-command habit | optional `npm run check:hermetic` (scratch clone + chain), or skip once SCN-006 exists |
| SCN-003/013/014 | low | CI-side observation only | none proposed |

**What already exists and should not be duplicated:** `build.test.ts` 47 tests cover the *build* parser variant (structure, quotes, booleans, comments, CRLF, real-file invariants); the gate *pure functions* are covered (7 twin + 11 eval tests, run in `test:p3`, verified 91/91 today). The seam this plan adds coverage for is: the *gate* parser (SCN-007), parser agreement (SCN-008), CLI exit behavior (SCN-010), and the contract guard (SCN-006).

## 9. Exit signal

- ✅ Scope explicit; risky flows (zero-dep contract, parser seam, gate sensitivity) carry deeper coverage than low-risk areas (log cosmetics, workflow mechanics)
- ✅ Every scenario carries its evidence run: OBSERVED (ran today) vs READ (source-derived, not run) vs INCIDENT-WINDOW (observe on occurrence)
- ✅ Assumptions (A1-A3) and open questions (Q1-Q5) visible, each mapped to the scenarios that depend on the answer
- 🔍 Known gaps, stated plainly: 6 of 15 negative classes live-verified today; the rest are source-derived and need one probe each; CI-side scenarios (SCN-003, SCN-014) are observation-only from this machine
- 🚧 Plan is ready to execute; Q1 (the guard) is the first decision, because three of the High-priority scenarios are automated by it or depend on its verdict
