# Functional Test Plan — P23: fast CI zero-dep (parseBundles swap in fast-gate lints)

Date: 2026-11-26 · Under test: commit `5643d56` (scripts/lint-command-skill-pairs.ts, scripts/lint-eval-suites.ts) · Plan basis: code read + executable sabotage harness (`.tmp/p23-harness`), baseline runs on `main` @ `08289fd`

## 1. Goal

The fast CI job (`.github/workflows/ci.yml`) runs without `npm ci` on ubuntu + windows, Node 24. That makes *zero external dependencies* a hard contract for everything in its chain: `npm test`, `npm run check`, `npm run validate-manifests`, `npm run verify`. P23 swapped `require('yaml')` for the homegrown `parseBundles()` (exported from `scripts/check-bundles-duplicates.ts:65`) inside two gates of `npm run check`:

- `lint-command-skill-pairs.ts` — command↔skill twin pairs must reference each other in descriptions (pair candidates come from bundles.yaml)
- `lint-eval-suites.ts` — eval case schema, asset existence, twin-split coverage, README counts (asset universe comes from bundles.yaml)

This plan validates that the swap (a) keeps those two gates dependency-free, and (b) does not weaken what the gates are supposed to catch — **a parse that silently reads less than the `yaml` library did is a green gate over a smaller world**, which defeats the gate's reason to exist.

## 2. Test basis

- Commit `5643d56` + its claim: "fast chain (test, check, validate-manifests, verify) exit 0 ×4 without dependencies; biome 0, tsc 0, test:p3 91/91" — reproduced locally today for suits (npm test 0 fail, test:p3 0 fail) and both gates green
- CI incident run `45675880550` (pre-fix): fast gates red ×2 OS with `Cannot find module 'yaml'` — the defect P23 exists to fix
- Real target: `bundles.yaml` — 14 bundles, 257 list items, 5 twin pairs today (`verify-acceptance-criteria↔verifying-acceptance-criteria`, `migrate-↔migrating-tests-to-playwright`, `stabilize-↔stabilizing-flaky-tests`, `test-llm-guardrails↔testing-llm-guardrails`, `record-change-intent↔recording-change-intent`)
- The repo has **three** same-named hand parsers whose disagreement is now load-bearing for CI: `build.ts:49` (rich; appends lists; strips scalar quotes), `check-changelog.ts:33` (items require exactly 4-space indent), `check-bundles-duplicates.ts:65` (P23's choice; resets lists on repeated keys; keeps item text raw)
- `check-bundles-duplicates.ts` has **no test file**; `build.test.ts` covers only build.ts's parser (naming trap: both export `parseBundles`)

## 3. Scope

### In scope

- Parser fidelity of `check-bundles-duplicates.parseBundles` on YAML-legal inputs (BOM, duplicate keys, comments, quoting, EOL, indentation)
- The zero-dep contract of the whole fast chain (no third-party `require` reachable, Node 24 type-stripping compatibility)
- Cross-gate consistency: build.ts `--check` vs the two lints vs each other on the same bundles.yaml
- Behavior on hostile/polluted bundles.yaml (crash diagnostics quality)
- The gates' output on the current real tree (baseline)

### Out of scope

- Eval case *content* quality, prompt design, twin-pair naming rules beyond parse fidelity (`isGerund`/`areTwinNames` have unit tests in `test:p3`)
- Full-job-only scripts (`update-readme-stats`, `validate-links` keep `require('yaml')` by design — they run with `npm ci`)
- GitHub Actions infra itself; `quality-gates.yml`/`release.yml` paths
- Node < 24 behavior (engines pin `>=24`; CI pins 24)

## 4. Risk and priority map

| ID | Area | Priority | Why it matters | Evidence today |
|----|------|----------|----------------|----------------|
| R1 | Silent under-parse → false green | **High** | The gates exist to catch routing drift; a parser that quietly reads less shrinks coverage while CI stays green. Twin coverage "5/5" is self-referential (counts *found* pairs), so under-parse weakens both gates consistently with no external signal | 🐛 Demonstrated twice in harness (SCN-006, SCN-007) |
| R2 | Zero-dep regression | **High** | This exact contract broke once (P17/P19 gates `require('yaml')` on a path with no `npm ci`) — nothing structural prevents round 3 | ✅ Currently clean (static inventory verified); needs a guard, though |
| R3 | Multi-parser dialect drift | **High** | One file must now satisfy 3 hand parsers with *different* behavior on valid YAML (reset vs append vs 4-space-only). Nearly all future edit shapes land here | ✅ 3-parser agreement holds on today's real file (257 items identical); wipes/dupes diverge (SCN-007) |
| R4 | Crash diagnostics on polluted items | Medium | Polluted items (inline comment, quoted name) crash both gates with ENOENT pointing at `src/skills/<name>/SKILL.md` — triage goes to the wrong file | 🐛 Demonstrated (SCN-008) |
| R5 | Node 24 strip-mode compatibility | Medium-Low | tsc cannot catch non-strippable syntax (enums/namespaces); it fails at gate runtime. Today's fast scripts are clean | ✅ grep clean (no enum/namespace in fast-path scripts) |
| R6 | OS matrix / CRLF | Low | windows-latest checkout with `core.autocrlf=true` was in the incident loop; split(/\r?\n/) handles CRLF today | ✅ Harness runs (CRLF corpus) green; no test pins cb-d-parser CRLF specifically |

## 5. Scenario catalog

> Harness: copy of `scripts/{check-bundles-duplicates,lint-command-skill-pairs,lint-eval-suites}.ts` + `src/skills` + `evals/` into a sandbox dir plus a generated `bundles.yaml` (control or sabotage variant, built from the real file by `.tmp/p23-make-variants.js` — gitignored, disposable). Evidence below is from executed runs today.

### SCN-001 — Control: current tree is green and counts are the truth
- **Type:** happy · **Priority:** High
- **Preconditions:** clean `main` @ `08289fd`, node_modules present
- **Steps:** `npm test`; `npm run test:p3`; `npm run check`
- **Expected result:** all exit 0; twin gate reports exactly the 5 known pairs; eval gate reports twin split coverage `5/5` and README counts matching
- **Evidence:** ✅ passed today (0 fail ×2 suites; 5 pairs / 5-of-5)

### SCN-002 — Zero-dep: the fast chain runs with no node_modules
- **Type:** contract · **Priority:** High
- **Preconditions:** repo without node_modules (e.g. rename it aside; restore after)
- **Steps:** `npm test`; `npm run check`; `npm run validate-manifests`; `npm run verify`
- **Expected result:** exit 0 ×4, no `Cannot find module` (any third-party require anywhere in the fast chain fails this)
- **Evidence:** ✅ per commit `5643d56` (done manually there) and per CI green post-P23; today re-proven structurally: harness gates run full logic with zero resolution into node_modules (all requires are `node:` builtins or relative `.ts` — verified by static inventory incl. transitive closure)

### SCN-003 — Zero-dep static guard: no third-party requires creep back
- **Type:** regression-gate · **Priority:** High (auto) · **Status today:** 🔍 gap — no guard exists
- **Preconditions:** none
- **Steps:** scan every script reachable from `npm test`, `npm run check`, `npm run validate-manifests`, `npm run verify` (incl. transitive `.ts`): assert `require('…')` targets only `node:*` builtins and relative `.ts`/`.js` paths
- **Expected result:** inventory assertion passes; adding `require('yaml')` to any fast script turns the check red with the file named
- **Notes:** one-off grep verified today (see plan §2); candidates to make it a permanent gate: tiny `scripts/lint-fast-dep.ts` wired into `npm run check`

### SCN-004 — Parity: all three parsers agree on the real bundles.yaml
- **Type:** contract · **Priority:** High
- **Preconditions:** node_modules present (`yaml` devDep usable as oracle)
- **Steps:** parse real bundles.yaml with `yaml.parse`, `check-bundles-duplicates.parseBundles`, `build.ts parseBundles`; compare skills/agents/knowledge/hooks per bundle
- **Expected result:** identical — any divergence means the fast gates and `build --check` see different worlds
- **Evidence:** ✅ identical today (14 bundles, 257 items each)

### SCN-005 — Parity corpus: YAML-legal edits behave predictably in *all* parsers
- **Type:** negative/boundary · **Priority:** High · **Status today:** 🔍 gap — no corpus test exists
- **Preconditions:** corpus harness (sabotage variants: BOM on/off comments, duplicate `skills:` keys, inline comments, quoted items, tab separators, 2- vs 4-space item indent, LF vs CRLF)
- **Steps:** for each corpus file, run the agreement check from SCN-004
- **Expected result:** defined *decision rule*: for every corpus input, either (a) all three parsers agree, or (b) the input is declared forbidden dialect and a new lint rejects it in `npm run check` with a clear message. No input may silently split the parsers' views.
- **Known members of class (b) from today's runs:** duplicate list keys (build appends, cb-d resets, yaml throws), quoted items (build strips scalar quotes only, cb-d keeps raw), inline comments (all three soak or skip differently), item indent shallower than 4 spaces (check-changelog.ts drops items the other two keep — pre-existing, adjacent)

### SCN-006 — BOM glued on the first bundle line must fail loudly, not silently
- **Type:** boundary · **Priority:** High · **Status today:** 🐛 DEFECT (demonstrated)
- **Preconditions:** bundles.yaml without the leading `#` comment block (plausible future edit) saved by a Windows editor as UTF-8 with BOM
- **Steps:** run both gates on the bom2 variant
- **Expected result:** gates must either parse BOM-prefixed files correctly (like pre-P23 `yaml` did) or reject the file with a clear error naming the BOM
- **Actual (today):** ❌ twin gate **exit 0 printing "4 pair(s) found"** (qa-core silently dropped, its pair unchecked — pure false negative); eval gate exit 1 but with 18 misleading issues ("no bundle named 'qa-core'", missing assets) pointing away from the BOM
- **Notes:** BOM on today's real file shape (leading comments) is harmless — **by accident of the comment block**, not by design

### SCN-007 — Duplicate list keys must fail loudly, not silently
- **Type:** negative · **Priority:** High · **Status today:** 🐛 DEFECT (demonstrated; regression vs pre-P23)
- **Preconditions:** a copy-paste edit accident leaves two `skills:` blocks in one bundle (YAML-legal)
- **Steps:** run twin gate on the wipe variant; compare with pre-P23 behavior
- **Expected result:** reject with precise location, as `yaml` did (`YAMLParseError: Map keys must be unique at line 71, column 3`)
- **Actual (today):** ❌ cb-d parser *resets* the list on second key → twin gate **exit 0 at 4 pairs** (both twins' coverage silently gone); build.ts *appends* instead (third behavior, so `build --check` stays green); eval gate red with 3 misleading asset-existence issues. Three different parse behaviors for one input class.
- **Notes:** cheapest fix path: make `parseBundles` error on a repeated list key within one bundle (~3 lines) — that restores fail-loud where `yaml` used to be loud

### SCN-008 — Polluted items must fail *at the right place*
- **Type:** negative/recovery · **Priority:** Medium · **Status today:** 🐧 DIAGNOSTIC DEFECT (demonstrated)
- **Preconditions:** an inline comment (`- stabilizing-flaky-tests # note`) or quoted item (`- "name"`) in bundles.yaml
- **Steps:** run both gates
- **Expected result:** a clear error naming bundles.yaml and the offending line (like the twin-description errors do)
- **Actual (today):** both gates **crash exit 1** with `ENOENT … src\skills\stabilizing-flaky-tests # note\SKILL.md` — the stack points at the SKILL.md lookup, not at bundles.yaml. Visible but misleading; triage goes to the wrong file.
- **Notes:** fix path: reject item names with non-`[a-z0-9-]` characters (or any `#`/quote residue) inside `parseBundles` with a bundle+line message, before anything reads SKILL.md

### SCN-009 — CRLF/LF independence (registry: windows-latest fast lane)
- **Type:** boundary · **Priority:** Medium
- **Steps:** parse the LF version and the CRLF version of the same bundles.yaml; compare outputs
- **Expected result:** identical in cb-d parser and both gates
- **Evidence:** ✅ real file (CRLF) green in harness today; build.ts's CRLF behavior has a pinned test, cb-d's does not — pin both

### SCN-010 — Type-stripping compatibility of fast-path scripts
- **Type:** regression · **Priority:** Low (failures are visible in CI, cost is triage)
- **Steps:** for each fast-path script, assert at review time that no non-strippable TS lands in the transitive closure (enums, namespaces, parameter properties); runtime proof = the gates simply run (Node 24 strips types on both OS)
- **Expected result:** fast-chain scripts run on plain `node` with no loader flags
- **Evidence:** ✅ today clean (grep + all runs under local Node 26 and CI Node 24)

### SCN-011 — Memo oracle: the 5 known pairs stay covered (optional)
- **Type:** smoke · **Priority:** Low
- **Steps:** compare the gate's found-pairs set to a pinned list of the 5 named pairs
- **Expected result:** equal; adding a real 6th pair requires updating the pin deliberately (that's the point — it forces a human look at the diff)
- **Notes:** brittle by design; keep optional

## 6. Findings (from exploration, all executable/reproducible)

1. 🐛 **Silent false negative — the high-priority class is real, not theoretical.** Two independent, YAML-legal edit shapes (BOM on first bundle line; duplicate `skills:` keys) leave the twin-pairs gate green with one pair silently unchecked (demo: exit 0, "4 pair(s) found"). Pre-P23 the `yaml` parse was loud on one of them (DUPLICATE_KEY) and tolerant on the other (BOM stripped). The eval gate goes red on the same inputs, but with error text that points at phantom missing assets/bundles, not the parse.
2. 🐛**Regression of failure mode, not just fidelity**: P23 traded "crash on parse" for "succeed on parse" — the dangerous direction for a gate. The self-referential `5/5` coverage line cannot notice.
3. 🐧 Polluted-item crashes misdirect triage (ENOENT on a SKILL.md path built from the polluted name).
4. 🔍 `check-bundles-duplicates.ts` (now a load-bearing library import for two CI gates) has no test file of its own; the existing `parseBundles` tests pin `build.ts`'s parser instead — a naming trap.
5. ✅ The zero-dep fix itself is correct for today's shape: static inventory + harness runs + green CI confirm no third-party require reachable in the fast chain.

## 7. Assumptions and open questions

- **ASSUMPTION:** the fast job never gets `npm ci` by design; if that ever changes, much of this reduces to "use `yaml` everywhere again"
- **ASSUMPTION:** `yaml` stays in devDependencies as the full-job differential oracle (SCN-004/005 need it)
- **OPEN:** should the three `parseBundles` implementations be unified (single exported parser, `build.ts`'s is already the richest)? This plan assumes **no** unification pre-ship and guards the divergence instead — unification would retire R3 wholesale
- **OPEN:** should `bundles.yaml` get an explicit dialect contract (forgiven/forgotten forms documented + linted)? SCN-005's decision rule forces this answer within one corpus run
- **OPEN:** report SCN-006/007/008 as defects now vs. bundling a single "parser hardening" change — plan treats them as defects found, fix scheduling is the owner's call

## 8. Automation handoff

| Scenario ID | Automation candidate | Why | Suggested next step |
|---|---|---|---|
| SCN-003 | high | 10-line static scan stops defect round 3 | `scripts/lint-fast-dep.ts` wired into `npm run check` |
| SCN-004/005 | high | differential oracle pins 3-parser agreement forever | new `scripts/check-bundles-duplicates.test.ts` (unit: cn-d parser on corpus) + 3-parser agreement test in `test:p3` (has node_modules) |
| SCN-007 | high | one 3-line parser change turns the demo defect into a unit test | add repeated-list-key error + test cases from `.tmp/p23-make-variants.js` wipe recipe |
| SCN-006 | high | BOM handling (strip `\uFEFF` or reject with line 1 named) + test | same file; reuse harness bom2 recipe |
| SCN-008 | medium | early name-pattern rejection with clear message | same file; keep crash-class cases as regression samples |
| SCN-009 | medium/low | cheap pin, Windows lane is permanent | CRLF twin-case next to the parser tests |
| SCN-011 | low | deliberate brittleness as oracle | optional pin test |
| SCN-001/002 | low | covered by CI itself + any release checklist | document as release smoke, no extra test |

## 9. Exit signal

P23 ships validated when: zero-dep contract holds *and is guarded* (SCN-002 + SCN-003 green), the 3-parser agreement holds on the real file (SCN-004 green), and the silent-false-negative classes are closed — either fixed with fail-loud behavior or explicitly waived in writing with SCN-006/007/008 listed as open defects with an owner. Silent under-parse of a coverage gate is the one class this plan does not allow to leave undecided.
