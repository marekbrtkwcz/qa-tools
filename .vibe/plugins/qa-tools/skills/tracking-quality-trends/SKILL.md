---
name: tracking-quality-trends
description: 'Turns point-in-time quality readings into a trend: archives each run, compares it with the previous one, and reports per metric whether it is getting better or worse - practices newly present or regressed, coverage, flake rate, expiring waivers, eval scores - using limit/current/goal framing. Use when quality reporting is a series of disconnected snapshots, when a team needs to show whether a number went up or down over a quarter, between runs, or since the last release, when a number such as coverage is quoted with no baseline to compare against, or when a regression in the quality system itself should be visible. For what each metric means and how it misleads, use analyzing-quality-metrics. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 📈 Tracking Quality Trends

Use this skill when quality gets reported as a number, and nobody can say whether it is better or worse than last time.

A snapshot is almost useless on its own. "Coverage is 71%" prompts an argument about whether 71 is good. "Coverage on changed lines has moved 62 → 71 over three releases, limit 75, goal 85" prompts a decision. **Direction is the finding; the absolute value is context.**

The second thing this catches is regression in the quality *system* — a threshold lowered, a job made non-blocking, a waiver renewed for the fourth time. Those never show up in a snapshot, because a snapshot reports what is measured, not what stopped being measured.

## 🎯 When to Use

- quality reporting is a series of unconnected numbers
- a metric is quoted with no baseline and no target
- a team needs to show a quarter of improvement, or explain a quarter without it
- a contract has been re-derived and the question is what moved
- gates are being quietly weakened and nobody has noticed
- a release decision needs direction, not just current state

## 🧭 Operating Principles

- **Limit / current / goal, always three numbers.** Limit is the threshold that triggers action; current is measured; goal is the target. A metric with only a current value cannot be acted on.
- **Direction and magnitude, not just the delta.** "−3pp" needs "inside the noise band" or "third consecutive fall" beside it to mean anything.
- **Archive the run, do not recompute history.** Store each reading with its date, commit, and how it was measured. Recomputed history changes when the method changes, and then the trend is fiction.
- **A method change breaks the series.** Say so, and start a new one rather than pretending the numbers are comparable.
- **Track the quality system, not only the code.** Thresholds, gate blocking-ness, waiver counts and ages, suppression counts. A repo whose coverage rose while its threshold fell has got worse.
- **Fewer metrics, honestly measured.** Six metrics a team acts on beat twenty nobody reads. Every metric needs a named owner and an action if it crosses its limit.
- **Every metric carries its caveat.** Coverage does not prove correctness; a rising pass rate can mean weaker tests. Report the caveat inline, not in a footnote.
- **Never trend a metric that can be gamed without saying so.** Coverage, test count, and defect count all move under pressure without quality moving.

## 🔄 Workflow

### Phase 1: Fix the metric set

Start from what the contract already implies, and cap it at six to eight. Each metric needs a limit, a goal, an owner, a stated action at the limit, a caveat, and a known gaming risk — if a candidate cannot fill all of those, it is a number, not a metric.

| Metric | Limit / goal example | Caveat to print |
| --- | --- | --- |
| Diff coverage | ≥ 75% / ≥ 85% | proves execution, not assertion quality |
| Repo coverage direction | must not decrease | a big denominator absorbs new gaps |
| Flake rate | < 1% / < 0.3% | only measurable if retries are recorded |
| Suite duration (p95) | < 10 min / < 5 min | shortcuts appear when this rises |
| Contracted practices PRESENT | all MUST | PRESENT means configured and enforced |
| Blockers open | 0 / 0 | a MUST practice missing |
| Waivers: count, expired, oldest | 0 expired | count alone hides age |
| Suppressions total | trending down | includes disables, ignores, skips |
| Escaped defects | trending down | depends on consistent triage |
| Eval pass rate per capability | no regressions | per capability, never aggregated |

Each metric needs an owner and a stated action at the limit. A metric with neither is a dashboard decoration.

### Phase 2: Archive each run

```
.qa/
  quality-contract.md          # current
  trends.md                    # the report
  history/
    2026-05-02/{contract.md,metrics.json}
    2026-06-13/{contract.md,metrics.json}
    2026-08-21/{contract.md,metrics.json}
```

Each `metrics.json` records the value, the date, the commit, and **how it was measured** — the tool, the version, and the scope. That last field is what lets a future reader tell a real improvement from a method change.

```json
{
  "metric": "diff-coverage",
  "value": 71.4,
  "unit": "percent",
  "date": "2026-08-21",
  "commit": "a3f91c2",
  "method": "diff-cover 9.2.0, lcov from vitest 3.x, unit suite only",
  "scope": "packages/api, packages/web",
  "sample": "42 merged PRs this period"
}
```

The `method` and `scope` fields are what let a future reader distinguish a real change from a measurement change. Without them, the first tooling upgrade silently invalidates the whole series. When the method changes: **do not backfill** — start a new series, keep the old one visible, and mark the break in the report.

### Phase 3: Diff against the previous run

Per metric: previous, current, delta, direction, and position against limit and goal. Then, separately, the structural diff nobody else reports:

- practices that moved **into** PRESENT — real wins, name them
- practices that **regressed** out of PRESENT — the most important line in the report
- practices newly N/A or deferred — usually a contract edit, so check it was deliberate
- **thresholds that changed**, in either direction
- **gates that became non-blocking** (record a `gates` array per run: practice, blocking, changed date)
- waivers added, expired, renewed
- suppressions added and removed

A threshold quietly lowered from 75 to 60 will otherwise appear as a coverage *improvement*. Reading the config diff alongside the metric diff is what catches it, and it is the single highest-value habit in this skill.

### Phase 4: Establish the noise band

Before reporting a movement as a finding, know what movement is normal. Flake rate and suite duration move on their own; coverage moves with the size of the release; eval scores move with model variance.

Rule: **a movement inside the noise band is not a finding, and a movement in the same direction three periods running is a finding regardless of size.** Slow drift is what a threshold-based alert never catches.

### Phase 5: Report

Written to `.qa/trends.md`, with:

1. **Direction summary** — improving, flat, or degrading, with the two or three metrics driving it. Lead with this in one paragraph; if a reader stops after it, they should still have the finding.
2. **Metric table** — limit, previous, current, goal, direction, and the caveat inline
3. **Structural changes** — practices gained and lost, thresholds and gates changed (a number that improved because its threshold fell has not improved)
4. **Governance** — waiver and suppression movement
5. **Findings** — regressions, three-period drifts, limits crossed
6. **Series breaks** — where a method changed and comparison stops being valid

Then the honest closing section: **what this report cannot see.** Untracked metrics, unmeasured practices, anything where the tooling changed. A trend report that implies full visibility is the same failure as a gap matrix with no UNKNOWN state.

## 📅 Cadence

Tie it to something that already happens — a release, a sprint boundary, a monthly review. A report with no cadence gets written once and admired.

Two rules: re-derive the contract on the same cadence, and **read the previous report before writing the new one.** A trend report that does not reference its predecessor's findings is a snapshot with a date on it.

## 📊 Metric Details

### Code and test metrics

- **Diff coverage** — limit ≥ 75% / goal ≥ 85% (per profile). Measure: `diff-cover coverage/lcov.info --compare-branch=origin/main`, per PR, aggregated per period. Caveat: proves execution, not assertion quality. Gaming risk: high — assertion-free tests satisfy it; pair with a periodic assertion-quality review (`unslop-tests`). Action at limit: the diff-coverage gate blocks.
- **Repo coverage direction** — limit: must not decrease; goal: slow rise. Caveat: a large denominator absorbs new gaps. Track direction only; an absolute repo-coverage target on a legacy codebase is unreachable or meaningless.
- **Flake rate** — limit < 1% / goal < 0.3%. Measure: runs that passed only after a retry ÷ total runs. Caveat: only measurable if retries are recorded — `retries: 3` with no telemetry means flake is being hidden and the honest reading is "unknown". Gaming risk: quarantining flaky tests improves the rate without fixing anything; track the quarantine count beside it. Action at limit: stop adding tests until the suite is under control.
- **Suite duration (p95)** — limit < 10 min / goal < 5 min for the PR gate. Caveat: rising duration predicts shortcuts — skipped hooks, `--no-verify`, requests to make jobs non-blocking. Action at limit: parallelise or split before anyone proposes weakening the gate.
- **Escaped defects** — trending down. Measure: production defects ÷ total defects per period. Caveat: depends on consistent triage; a labelling change breaks the series. The most meaningful outcome metric and the slowest to move — do not read a single period.

### Contract and governance metrics

- **Contracted practices PRESENT** — all MUST PRESENT. Report as `MUST 11/12 · SHOULD 6/9 · COULD 2/7`, never as a single percentage. PRESENT means configured *and* enforced — recheck for fake gates each run.
- **Blockers open** — 0 / 0. Any non-zero value is the top line of the report.
- **Waivers: count, expired, oldest** — 0 expired, none older than 180 days. Count alone hides age; track renewals too — a waiver renewed three times is a contract change that never got made.
- **Suppressions total** — trending down. Raw count treats a whole-file `eslint-disable` the same as one inline disable; track whole-file/whole-directory suppressions as a second, smaller number. Gaming risk: low, which is part of why it is worth tracking.
- **Intent coverage on high-risk changes** — ≥ 50% / ≥ 80%. Measures presence, not quality — sample and read a few records; `Intent: refactor` filler scores well and means nothing.
- **Comprehension risk band** (`assessing-comprehension-debt`) — advisory, no limit. Measures absence of evidence, not understanding. **Never gate on it.**

### AI/LLM metrics

- **Eval pass rate per capability** — no regressions against baseline, split by capability, never aggregated. A global 89% can hide an 11-point drop in one capability. A method break happens on every model or case-set change — record both versions with the reading.
- **Eval cost and p95 latency** — per budget. A cost rise can be a quality *gain* someone paid for; read it beside the pass rate, never alone.
- **Adversarial findings open** — 0 effective findings, split into effective and latent. Track untested channels as a separate number.

### Metrics not to trend

| Candidate | Why not |
| --- | --- |
| Test count | grows by writing bad tests; says nothing about coverage of risk |
| Lines of code | not a quality property in either direction |
| Bugs found by QA | rises when the product gets worse *and* when testing gets better |
| Commits or PRs per developer | activity, not quality, and it changes behaviour the moment it is displayed |
| Story points delivered | not a quality metric, and it will be read as one |
| Aggregate "quality score" | combines incomparable things and hides every movement inside it |

The rule: **if a metric would change someone's behaviour in a way you would not want, do not display it.**

## ⚠️ Common Failure Modes

- **Hand-maintained numbers in prose.** "We have 803 tests" in a README, wrong three months later. If it is worth tracking, generate it.
- **Recomputing history.** New tool, new method, retroactively applied — the trend now shows a change that never happened.
- **Trending only code metrics.** Missing the lowered threshold and the disabled job, which are the changes that made the code metrics look better.
- **Reporting deltas without noise bands.** Every run has a finding, so nobody reads the findings.
- **Twenty metrics.** Nobody acts on any of them.
- **Aggregating what should be split.** One eval score across capabilities; one coverage number across a monorepo.
- **Celebrating a rising pass rate.** It rises when tests get weaker, too. Pair it with flake rate and assertion quality.
- **No owner per metric.** Nothing happens when a limit is crossed.

## 🔗 Related Skills

- `analyzing-quality-metrics` — metric definitions, anti-metrics, and how to interpret each honestly; this skill adds history and direction
- `deriving-a-quality-contract` — supplies the practice list, the thresholds, and the gap matrix each run diffs
- `governing-quality-waivers` — waiver count, age and expiry are tracked metrics here
- `verifying-change-coverage` — the source of the diff-coverage reading
- `assessing-comprehension-debt` — its band is a trended, advisory metric
- `llm-testing` — eval pass rate per capability, trended against a baseline
- `quality-gates` — release readiness consumes direction, not just current state

## ✅ Definition of Done

This skill is complete when:

- the metric set is six to eight metrics, each with a limit, a goal, an owner, and a stated action at the limit
- each run is archived with its value, date, commit, and measurement method
- the report shows direction per metric, not only current values
- structural changes are reported: practices gained and lost, thresholds changed, gates made non-blocking
- movements are judged against a noise band, and three-period drifts are findings regardless of size
- each metric's caveat is printed with it, not footnoted
- series breaks caused by method changes are stated, and comparison stops there
- the report names what it cannot see
