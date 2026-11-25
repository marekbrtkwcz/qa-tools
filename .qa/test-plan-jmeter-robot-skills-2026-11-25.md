# Risk-Based Test Plan — `jmeter-load-testing` + `robot-framework-automation`

**Feature under test:** the two newest skills of the collection (P20, commit `bb2f373`) with their eval cases (P22, commit `1c0b9d2`):
- `jmeter-load-testing` (non-functional-testing) — inherited `.jmx` plans, headless runs, data-derived CI gates
- `robot-framework-automation` (test-automation) — keyword-driven suites, tags routing, pabot/rebot, Robocop

**Plan date:** 2026-11-25 · **Baseline:** HEAD `08289fd`, working tree clean

---

## 1. Goal

The two skills are routing-and-guidance assets: users (and their agents) must get the right skill firing on the right prompt, and technically correct instructions once it fires. This plan validates three claims:

1. **Routing truth** — the skills fire on "run our JMeter suite" / "make it in robot" and stay quiet on k6 / pytest-porting / BDD / migration prompts.
2. **Content truth** — the load-bearing technical claims are correct (JMeter's silent-green exit code, the results-file gate, RF teardown/tags/pabot semantics), because they end up verbatim in users' pipelines.
3. **Wiring truth** — the skills sit correctly in the collection: build parity, manifests, README counts, eval suite tables, knowledge cross-links.

## 2. Test basis

- `src/skills/jmeter-load-testing/SKILL.md`, `src/skills/robot-framework-automation/SKILL.md`
- `bundles.yaml` lines 176 and 95 (registration), `plugins/*` build output
- 5 eval cases: `evals/non-functional-testing.cases.jsonl` (`act-pos-inherited-jmx-plan`, `collide-scriptable-vs-plan`), `evals/test-automation.cases.jsonl` (`act-pos-in-robot-request`, `act-neg-python-means-pytest`, `contract-no-drive-by-library-swap`)
- `evals/README.md` run protocol (`scripts/run-evals.ts` plan/record/score)
- `.qa/collection-audit-2026.md` section D (why these skills exist) and `.qa/review-2026-11-25.md` (bug classes this feature must not reintroduce: A1 build drift, Section E designed-but-never-run evals)
- CHANGELOG `[Unreleased]` entries P20/P22 (the feature's claims)

**Actors:** collection maintainer (runs gates), the live agent session (activation behavior, `EVAL_MODEL` probe runs), a human tester on a real JMeter/Robot project (content claims).

## 3. Scope

### In scope

- The two SKILL.md assets, their frontmatter/descriptions, and their Related Skills cross-references
- Routing/activation behavior, including the designed collisions (k6, port-suite, BDD, migrating)
- Technical correctness of every load-bearing claim in both skills (tool runs against minimal local fixtures)
- Wiring: build parity, manifests, README stats, evals tables, knowledge cross-links
- The 5 P22 eval cases: static conformance (verified) **and** real protocol runs (not yet done)

### Out of scope

- The rest of P20: `testing-mfa-and-credentials` (WebAuthn), `mobile-app-testing` (RN/Flutter), document-store recipes, Jenkins/Azure recipes
- CI infrastructure changes P16–P23 themselves (the zero-dep contract is *consumed* here, not retested end-to-end)
- The eval-suite tooling (`run-evals.ts`) and `lint-eval-suites.ts` internals (P19 owns them; here only consumed)
- The v0.8.0 release/tagging process

## 4. Risk and priority map

| # | Risk area | Priority | Why it matters | Coverage notes |
|---|---|---|---|---|
| R1 | 🧪 Activation/routing in live sessions | **High** | Static gates prove structure, not behavior; a misroute ("script a load test from scratch" → jmeter instead of k6) is a user-visible wrong answer on first contact | 5 eval cases designed; 2 manual probes for uncovered pairs |
| R2 | 🐛 Content correctness of load-bearing claims | **High** | Claims like "exit code proves nothing", the `,"false"` gate grep, "teardown runs on failure", Test-Tags-vs-Force-Tags get copied into real pipelines; wrong = broken pipelines shipped by a *testing* collection | Live-tool verification against minimal fixtures, adversarial format variation |
| R3 | 📊 Eval suites designed but never run | **High** | `evals/runs/` contains only `pentesting` — the 5 new cases passed a static gate, never the protocol; the changelog claims coverage that was never executed | Real `plan`/`record`/`score` runs for both suites |
| R4 | 🔄 Wiring/regression exposure | **Medium** | The skills touch shared surfaces (README counts 197/154, evals tables, bundles lists); atoms of P15-class drift (A1) can recur silently on any future edit | Re-run gates + a post-edit rebuild drill |
| R5 | ⚠️ Routing-hygiene edges | **Medium** | robot description = 649 chars (compliant, but past the ~600 "routing signal blurs" advisory the build itself documents); nft knowledge mentions k6 ×2 but jmeter never (robot got a knowledge entry, jmeter did not) — knowledge-guided load-test prompts may steer to k6 only | Hygiene probes + one open decision each |
| R6 | 📖 Real-world applicability drift | **Low** | Version-specific claims (RF 6.1 tags, RF 7 JUnit, Browser Library) age as tools release; no in-repo fixture exists to exercise them cheaply | Version-boundary checks now; fixture recommendation |

## 5. Verified evidence baseline (run on 2026-11-25, HEAD `08289fd`)

Facts already confirmed — the scenarios below **re-use** them as regression baselines, they do not need blind re-execution:

- ✅ `npm run verify` → "Committed plugins/ matches a fresh build" (no A1-class drift)
- ✅ `npm run check` → full chain green; `lint-eval-suites`: non-functional-testing = 11 cases, test-automation = 9 cases, all assets referenced in cases exist, twin-pair split 5/5, README "Suites" table in sync
- ✅ All Related Skills names from both SKILL.md files resolve in `bundles.yaml` (13/13: `testing-performance-and-load`, `k6-load-testing`, `testing-database-performance`, `automating-ci-test-pipelines`, `tracking-quality-trends`, `port-suite-to-python-java`, `migrating-tests-to-playwright`, `python-for-testers`, `selector-strategy`, `mocking-network-and-time`, `ensuring-test-isolation`, `implementing-bdd-tests`, `unslop-tests`)
- ✅ Description widths: jmeter 580 chars, robot 649 chars; build rules: error >1024, warning >700 (robot emits no warning, sits in the advisory band above ~600)
- ✅ README: 197 skills / 154 model-visible, guarded by `checkReadmeCounts`
- ✅ `evals/README.md` points to `scripts/run-evals.ts` (earlier doc-rot fixed)
- 🔍 `evals/runs/` = `pentesting/` only → the 5 new eval cases **have never been executed** via the protocol
- 🔍 `src/knowledge/test-automation.md` routes Robot (`robot-framework-automation` own it, porting/migration disambiguated) — but `src/knowledge/non-functional-testing.md` mentions k6 twice and jmeter **never**

## 6. Scenario catalog

### Group W — Wiring & build (baseline re-runs, mostly already CI-gated)

#### SCN-001 — Build parity gate
- **Type:** happy · **Priority:** Medium
- **Preconditions:** clean tree at HEAD
- **Steps:** `npm run verify`
- **Expected:** exit 0, "Committed plugins/ matches a fresh build" — confirms both skills' built output in `plugins/` is current.
- **Notes:** ✅ verified 2026-11-25; this is the A1-drift guard for any future edit to the two skills.

#### SCN-002 — Static chain incl. eval-suite gate
- **Type:** happy · **Priority:** Medium
- **Preconditions:** SCN-001 green
- **Steps:** `npm run check`
- **Expected:** exit 0 across all subgates; eval counts nft = 11, ta = 9; twin pairs 5/5.
- **Notes:** ✅ verified 2026-11-25.

#### SCN-003 — Manifest validation
- **Type:** happy · **Priority:** Medium
- **Steps:** `npm run validate-manifests`
- **Expected:** exit 0; both skills present in their bundles' manifests, `plugin.json` versions consistent.

#### SCN-004 — User install path (README-promised flow)
- **Type:** happy · **Priority:** Medium
- **Preconditions:** a scratch Vibe config dir, not the dev machine's
- **Steps:**
  1. Follow README install instructions (`cp -r plugins/*` into a test plugins dir).
  2. List installed skills for `non-functional-testing` and `test-automation`.
- **Expected:** both new skills present, contents byte-identical to build output; the emoji-appendix build transform present in both.
- **Notes:** tests what a *user* receives, not what the repo contains; the A1 bug class escaped exactly here historically.

#### SCN-005 — README counts stable under skill edits
- **Type:** regression · **Priority:** Medium
- **Steps:** make a trivial in-scope edit (one word in the robot SKILL.md body) → `npm run build` → `npm run readme:stats:check`
- **Expected:** counts stay 197/154; revert the edit. The gate (`checkReadmeCounts`) prevents the described-in-README vs actual mismatch class.

### Group A — Activation & routing (highest user-visible risk)

#### SCN-010 — Real protocol run: non-functional-testing suite (2 new jmeter cases)
- **Type:** recovery (of designed-but-never-run coverage) · **Priority:** **High**
- **Preconditions:** Vibe session with the collection installed; `EVAL_MODEL` set per `evals/README.md`
- **Steps:**
  1. `node scripts/run-evals.ts plan non-functional-testing baseline > /tmp/plan-nft.json`
  2. `EVAL_MODEL=<model> node scripts/run-evals.ts record non-functional-testing baseline run-001 /tmp/resp-nft.json`
  3. `node scripts/run-evals.ts score non-functional-testing`
- **Expected:** `act-pos-inherited-jmx-plan` routes to `jmeter-load-testing`; `collide-scriptable-vs-plan` activates `k6-load-testing` and leaves `jmeter-load-testing` inactive; scores recorded under `evals/runs/non-functional-testing/`.
- **Notes:** 🔍 biggest gap found — the pentesting suite is the only one with recorded runs. This scenario converts the P22 claim into evidence.

#### SCN-011 — Real protocol run: test-automation suite (3 new robot cases)
- **Type:** recovery · **Priority:** **High**
- **Steps:** same protocol as SCN-010 for `test-automation`.
- **Expected:** `act-pos-in-robot-request` → `robot-framework-automation`; `act-neg-python-means-pytest` → `port-suite-to-python-java` active, robot inactive; `contract-no-drive-by-library-swap` refuses the drive-by Selenium→Browser swap and routes the decision through `migrating-tests-to-playwright` discipline (quick win = Robocop).
- **Notes:** case `act-neg-python-means-pytest` is marked risk `low` in the suite — observe whether the score justifies raising or leaving it.

#### SCN-012 — Manual probe: BDD collision (no eval case exists)
- **Type:** negative · **Priority:** **High**
- **Preconditions:** live session, collection installed; suggested prompt: *"We do BDD here. Write our checkout acceptance automation as BDD in Robot Framework."*
- **Steps:** submit the prompt; observe which assets load / what answer forms.
- **Expected:** `implementing-bdd-tests` semantics honored (BDD-as-process), robot skill may load for the *syntax* but must not present Given/When/Then as BDD-process adoption — the skill's "prefixes are stripped sugar" boundary must survive a user who *wants* the ambiguous interpretation.
- **Notes:** eval set covers k6 / pytest / library-swap collisions but not the BDD pair; open question OQ-5 proposes adding case #100.

#### SCN-013 — Manual probe: dashboard-interpretation request
- **Type:** happy · **Priority:** Medium
- **Suggested prompt:** *"Our JMeter dashboard statistics show Error % 17 on /checkout but p95 looks fine — what does that mean for the release?"*
- **Expected:** `jmeter-load-testing` activates and reads Statistics-first / Errors-before-theory discipline; `k6-load-testing` stays inactive; verdict language follows error-%-above-ceiling framing, not discussion.

#### SCN-014 — Manual probe: shared-staging warning fires
- **Type:** boundary · **Priority:** Medium
- **Suggested prompt:** *"Run the checkout .jmx plan against staging right now and tell us if we're good to ship."*
- **Expected:** the skill's red flag ("load test against shared staging with unknown neighbours, no environment note recorded") shapes the answer — the agent should ask about/probe staging occupancy rather than silently running.

### Group C — Content correctness of load-bearing claims (live-tool verification)

**Shared fixture precondition (C-group):** no `.jmx`/`.robot` fixtures exist in the repo. Build minimal local ones first: a tiny `.jmx` plan (thread group with `__P(userCount,...)` + `__P(ramp,...)` properties, a `CSVDataSet`, an assertion) against a localhost test server that can be made to 500 on demand; a 2-suite `.robot` project (smoke/regression tags, shared Resource, teardown that deletes created state) with Browser Library.

#### SCN-020 — JMeter exit-code neutrality and the gate's failed-row detection
- **Type:** happy + negative · **Priority:** **High**
- **Steps:**
  1. Point the fixture plan at an endpoint returning 500 (or an unreachable port).
  2. `jmeter -n -t plan.jmx -JuserCount=10 -l results.jtl -e -o report/`
  3. `echo $?` — record the exit code; run the skill's gate 1 verbatim (`grep -q ',"false"' results.jtl` → exit 1 quoting rows).
- **Expected:** JMeter exits **0 despite 100% failures**; `results.jtl` contains `,"false"` rows; the skill's gate fails the build quoting the actual rows.
- **Notes:** this validates the skill's central claim, the one the whole CI-gate section hangs on.

#### SCN-021 — Gate robustness boundary: non-CSV results format 🔍 suspected gap
- **Type:** boundary · **Priority:** **High**
- **Steps:**
  1. Re-run SCN-020 with the engine's XML results format (results stored as XML `.jtl` — the machine-dependent default the skill itself warns about: "check `jmeter.save-service` config").
  2. Run the skill's gate 1 verbatim against the XML file.
- **Expected (adversarial):** the grep does **not** match XML rows → the gate exits 0 while every request failed. Record whether this reproduces.
- **Notes:** if confirmed, the skill's CI-gate sample has a format hole: the "check the save-service config" caveat is easy to skip when pasting the gate verbatim (which is the skill's intended use). Fix candidate: one line forcing CSV (`-Djmeter.save...` or asserting the jtl is CSV before grepping) — file as a content defect against the skill (see OQ-4). This is exactly the "silent green" failure mode the skill exists to prevent.

#### SCN-022 — statistics.json percentiles vs dashboard
- **Type:** happy · **Priority:** High
- **Steps:** generate the dashboard from a clean run (`-e -o report/`); parse `report/statistics.json` (error %, p90/p95/p99 of the key sampler); compare to the dashboard Statistics table and Response Time Percentiles panel.
- **Expected:** values agree; the skill's "gate on the same numbers a human would read" claim holds for a jq-over-statistics.json threshold.

#### SCN-023 — `-J` property overrides and `-G` distributed seam
- **Type:** boundary · **Priority:** Medium
- **Steps:**
  1. Override `${__P(userCount,100)}` via `-JuserCount=2` — verify the run uses 2 threads (Statistics sample count reflects it).
  2. If a 2-node `-R` setup is feasible: verify `-G` sets the property on remote nodes while `-J` does not.
- **Expected:** the skill's `__P()`/`-J`/`-G` claims verified as written; if the `-R` part is not feasible, record it as a documented manual verification for an environment that has it.

#### SCN-024 — Robot teardown runs on failure
- **Type:** recovery · **Priority:** **High**
- **Steps:**
  1. Fixture: one failing case with `[Teardown]` deleting a created record (or file).
  2. Run the suite; observe teardown execution; rerun the suite.
- **Expected:** teardown executes despite the failure; the second run leaves no residual state (no leakage failures on rerun) — the skill's DoD "rerun proves no leakage".

#### SCN-025 — Tag routing: smoke subset and wip quarantine
- **Type:** happy · **Priority:** Medium
- **Steps:** `robot --include smoke` on the fixture; then `robot --exclude wip` with one case tagged `wip`.
- **Expected:** only smoke-tagged cases run; the `wip` case is skipped, not deleted — the "quarantine without deleting cases" claim.

#### SCN-026 — pabot granularity is the suite + rebot merge
- **Type:** boundary · **Priority:** Medium
- **Steps:**
  1. `pabot --processes 2 tests/` with two capability-split suites → observe split per suite, per-process `output-*.xml`.
  2. `rebot --output output.xml output-*.xml` → one merged report.
  3. Negative: same command against a single mega-suite file.
- **Expected:** 2 suites → real parallelism; mega-suite → no split (confirms "pabot has nothing to parallelize" row), rebot produces exactly one shared log/report pair.

#### SCN-027 — Browser Library getters assert
- **Type:** negative · **Priority:** Medium
- **Steps:** fixture case: `Get Text  [data-test=welcome]  ==  Actual Welcome Text` against wrong text.
- **Expected:** the case fails on the getter alone (built-in assertion), demonstrating the "explicit `Should Be Equal` next to it is redundant" claim; a control case with the redundant `Should Be Equal` shows no behavior change — the unslop link is honest.

#### SCN-028 — RF version boundaries (Test Tags / Force Tags / JUnit)
- **Type:** boundary · **Priority:** Medium
- **Steps:** on installed RF < 6.1 and ≥ 6.1: author with `Test Tags` vs `Force Tags`; on RF 7 vs older: native JUnit output vs listener requirement.
- **Expected:** the skill's version claims hold; the "check the installed version before promising it in a pipeline" guidance resolves both situations for a tester who follows it.
- **Notes:** if only one RF version is installable in the verification environment, test the ≥ 6.1 / RF 7 side live and mark the other side documented-manual (see assumption A-2).

#### SCN-029 — CSV Data Set shareMode claim
- **Type:** boundary · **Priority:** Low
- **Steps:** fixture plan with `CSVDataSet` (default shareMode, N threads, M < N rows + `recycle` off).
- **Expected:** threads share rows (a row repeats across threads) — confirms the red flag "CSV data set with shareMode default and the run claims unique users per thread" is a *real* detectable behavior, not folklore.

### Group H — Hygiene & routing-signal edges

#### SCN-030 — Knowledge asymmetry: load-test prompts steered by knowledge
- **Type:** negative · **Priority:** Medium
- **Preconditions:** session where the knowledge files mediate routing (e.g. a non-functional-testing question that reads the bundle knowledge first)
- **Steps:**
  1. Confirmed fact: `src/knowledge/test-automation.md` routes Robot; `src/knowledge/non-functional-testing.md` names k6 twice, jmeter never.
  2. Prompt: *"Which skill should I use for load testing our existing JMeter plans?"*
- **Expected:** routes to `jmeter-load-testing` (description should win). If the knowledge steering misroutes to k6, the missing knowledge entry is a confirmed routing defect, not stylistic debt (→ decision OQ-2).
- **Notes:** robot got the deliberate *"oba"* treatment (skill + knowledge entry); jmeter did not — asymmetry verified by grep.

#### SCN-031 — Description width band decision
- **Type:** a11y-smoke (routing-signal readability) · **Priority:** Low
- **Verified fact:** jmeter 580 chars (comfort), robot 649 chars — no build warning (warn >700, error >1024), but the build's own warning text says "routing signal blurs past ~600"; P18 reduced `typescript-for-testers` 749→600 to empty the WARN list.
- **Expected:** decision recorded in OQ-3: trim robot's description to ≤600 (P18-style discipline) or accept the band consciously. No gate failure either way today.

#### SCN-032 — Cross-reference integrity after edits
- **Type:** regression · **Priority:** Low
- **Steps:** after any edit to either skill or its siblings, re-grep all Related Skills names against `bundles.yaml` (13 names listed in section 5).
- **Expected:** all resolve; a renamed sibling flags here before it ships.
- **Notes:** ✅ all resolve today; there is no automated gate for this class beyond one-to-one naming conventions in other lints — it is manual for now.

### Group R — Recovery & regression drills

#### SCN-035 — Post-edit rebuild keeps the chain green
- **Type:** recovery · **Priority:** Medium
- **Steps:** edit one description word in jmeter SKILL.md → `npm run build` → `npm run verify && npm run check` → commit → revert/commit forward as appropriate.
- **Expected:** chain green at every step; no drift window opens (the P15/A1 class was *committing without rebuild* — this drill proves the workflow resists it).

#### SCN-036 — Eval-suite gate is a real gate
- **Type:** negative · **Priority:** Medium
- **Steps:** add a throwaway case to `evals/non-functional-testing.cases.jsonl` **without** updating `evals/README.md` counts; `npm run check`.
- **Expected:** `lint-eval-suites` fails (count mismatch). Then sync the README → green; remove the throwaway.
- **Notes:** proves the P19/P22 gate contract fires for exactly the mistake it exists to catch (claims-out-of-sync), rather than trusting that it does.

#### SCN-037 — Zero-dep contract respected by feature follow-ups
- **Type:** permission · **Priority:** Low (conditional)
- **Steps:** this scenario activates **only if** future work on these skills adds a script/gate: run the fast chain with `node_modules` hidden (P23 reproduction: rename/hide node_modules → `npm run check` → restore).
- **Expected:** fast gates never require `npm ci` (no `require('yaml')`-class reintroduction).
- **Notes:** the current two skills add no scripts, so today this is satisfied by construction; the drill matters for follow-ups like the SCN-021 gate-fix candidates.

## 7. Assumptions and open questions

**Assumptions (proceed on these; flagged scenarios reference them):**
- [ASSUMPTION] A-1: A live Vibe session with this collection installed is available for activation probes and the `EVAL_MODEL` protocol (SCN-010/011/012–014). If not, those scenarios degrade to desk-checks and the plan's biggest gap stays open.
- [ASSUMPTION] A-2: JMeter ≥ 5.x and Robot Framework (+ Browser Library, pabot, rebot, robocop) are installable in the verification environment; a localhost fixture app can serve both. No fixtures exist in-repo (verified), so the C-group fixture is part of test setup, not a precondition failure.
- [ASSUMPTION] A-3: "Feature" = the two skills (user-confirmed); other [Unreleased] P20 content and CI infra are out of scope per section 3.

**Open questions (decisions for the owner):**
- [OPEN] OQ-1: Will the two eval suites (SCN-010/011) get real runs, and with which `EVAL_MODEL`? This is the single highest-leverage action in the plan — the coverage is claimed in the changelog but never executed (verified: `evals/runs/` holds only pentesting).
- [OPEN] OQ-2: Should `src/knowledge/non-functional-testing.md` get a jmeter routing entry matching robot's "oba" treatment? (Tested by SCN-030 — current asymmetry is verified fact.)
- [OPEN] OQ-3: Trim robot's description 649 → ≤600 (P18 discipline) or consciously accept the advisory band? (SCN-031)
- [OPEN] OQ-4: If SCN-021's XML-format silent-green hole reproduces, fix the CI-gate sample (one explicit format guard) — defect against the *skill content*, file per `reporting-bugs`.
- [OPEN] OQ-5: Add a BDD-collision eval case (#100) covering the pair SCN-012 probes manually?
- [OPEN] OQ-6: Which RF/JMeter floors does the collection officially stand behind? (Affects how SCN-028's boundary results should be phrased in the skill: "RF ≥ 6.1" today reads as an unstated support matrix.)

## 8. Automation handoff

| Scenario ID | Automation candidate | Why | Next step |
|---|---|---|---|
| SCN-001/002/003 | high (already automated) | repo's own gates, CI-gated per P23 | keep, no work needed |
| SCN-004 | medium | repeatable script (copy + diff) but slow; catches user-side drift | add as occasional/manual drill, not CI |
| SCN-005 | high | pure regression guard, one command | keep, no work needed |
| SCN-010/011 | high | protocol exists (`run-evals.ts`); needs only a model + a decision | run once per release, store under `evals/runs/` like pentesting |
| SCN-012/013/014 | low | behavioral, judgment-scored | run manually; convert the strongest to eval cases if they expose gaps (OQ-5) |
| SCN-020/021/022 | high | deterministic tool behavior; a tiny fixture makes them repeatable after any skill edit | build the fixture once; a scripted runner is a small follow-up |
| SCN-023/029 | medium | deterministic but env-heavy (distributed nodes, shareMode semantics) | manual first; automate the single-node parts |
| SCN-024–028 | medium-high | deterministic RF behaviors; fixture is the main cost | manual now, automate the drill subset after first pass |
| SCN-035/036 | high | gate drills, commands only | keep as documented drills in CONTRIBUTING/checklists |
| SCN-037 | medium | conditional (only when scripts get added) | note in CONTRIBUTING next to the zero-dep contract |

## 9. Exit signal

The feature may be called "tested" when:

- the two suites have at least one recorded eval run each (SCN-010/011) closing the 🔍 R3 gap;
- the JMeter central claim and its gate are proven live, **including** the adversarial format boundary (SCN-020/021) — silent-green is this skill's defining risk;
- the RF teardown/tags/parallelism claims are proven on a real fixture (SCN-024–026);
- OQ-1…OQ-6 have answers recorded here or in the review notes.

Everything else in the plan is risk-ordered, not completeness-driven: low-priority scenarios (500-class formatting hygiene, shareMode folklore) can move to a later pass without weakening the release signal.
