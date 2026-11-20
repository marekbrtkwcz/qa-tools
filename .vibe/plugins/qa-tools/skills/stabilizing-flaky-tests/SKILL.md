---
name: stabilizing-flaky-tests
description: Load this skill when a test fails intermittently — passes and fails on the same commit, passes locally but fails in CI, or a pipeline only goes green after a retry. Covers reproducing the flake under the configuration that broke it, classifying the root cause (timing, shared state, data collision, order dependence, environment, external dependency, or a real race in the app), fixing by cause (never by raising timeouts or adding retries), proving the fix with repeated runs, and quarantining what cannot be fixed yet with an owner and an expiry. For a test that fails on every run, see diagnosing-test-failures.
user-invocable: true
---

# 🌊 Stabilizing Flaky Tests

A flake is a defect in the feedback system: once a suite is known to lie occasionally, every red build becomes a judgement call and the first response to a real failure becomes "re-run it". The goal is a **deterministic test**, not a test that passes more often.

Retries and raised timeouts make the symptom quieter and leave the cause in place — and sometimes the cause is a race in the product that users will hit.

## 🚫 When NOT to use

- the test fails **every run** — it is broken, not flaky → see `diagnosing-test-failures`
- the instability is a pixel diff changing run to run → see `visual-testing`
- the only question is how many tests are flaky and whether it is improving → flake rate belongs to `quality-gates` metrics

## 🧭 Operating principles

- **Reproduce before fixing.** A fix for a flake you have not seen fail is a guess. Keep the failing output — it is half of the proof.
- **Classify before fixing.** Each cause has a different fix; "add a wait" applied to a data collision makes the test slower and still flaky.
- **Decide whose bug it is.** A test that races the application is a test bug. An application that races itself is a product bug the test found → bug report, not a quieter test (see `qa-best-practices`).
- **Retries are a measuring instrument, not a fix.** In CI they keep the pipeline moving and label the test `flaky`; every retried pass is an open defect.
- **Containment is visible, owned, dated.** A quarantined test has an owner, a tracking link, a diagnosis, and an expiry. A silent skip is deleted coverage.
- **Prove with the configuration that broke it.** 20 green runs with one worker prove nothing about a parallelism flake.

## 🔁 Workflow

### 1️⃣ Phase 0 — pick targets, measure baseline

- From CI history, list tests with both a pass and a fail on the same commit in the last 14–30 days (flake definition: both outcomes, same commit, same command). Rank by flake count — a short head usually produces most of the noise.
- For each target record: observed failure rate, first-seen date, failure messages (different messages from one test often mean two causes).
- No history? Screen the scope with a repeat run and say the baseline is a local sample, not CI data.

### 2️⃣ Phase 1 — reproduce

Run each applicable configuration **with retries off**, keep the output:

| Run | Exposes |
| --- | --- |
| Test alone, repeated 20–50× (`npx playwright test <file> --repeat-each=50`) | nondeterminism inside the test: timing, randomness, unawaited async |
| Test alone, once, outside its file | dependence on state another test created |
| File/suite in a different order (`--shuffle` or reordered list) | order dependence, leaked state |
| Repeated with several workers, then one (`--workers=8` vs `--workers=1`) | contention over shared data, accounts, files, ports |
| CI shard split / neighbouring tests from the failing shard | cross-test interference visible only in that grouping |
| CI-like conditions: `CI=true`, headless, CI container, throttled CPU | environment coupling, timing assumptions hidden by a fast laptop |

Stop when one configuration fails reliably enough to iterate on (~1 in 10 or better). If nothing reproduces: add diagnostics (trace on first retry, seed/order logging, console + request-failure logging), mark `cause unknown`, keep it on the flake list.

### 3️⃣ Phase 2 — classify (one primary class per test)

| Class | Signature | Typical fix |
| --- | --- | --- |
| **Timing / async** | fails under load or throttled CPU; unawaited promise, missing `await`, race with app | explicit `expect(...)` polling (`expect.poll`), never `waitForTimeout`; await the real condition |
| **Shared state** | passes alone, fails in suite | per-test isolation: fresh data per test, cleanup in `afterEach` (see `test-data-management`) |
| **Data collision** | unique constraint / duplicate key errors | unique data per run (faker + run id / uuid) |
| **Order dependence** | fails only in some orders | remove inter-test dependencies; each test sets up its own state |
| **Environment** | CI-only / one OS / one browser / after upgrade | pin versions, set `TZ`/locale explicitly, base URL from env |
| **External dependency** | third-party API slow/down | mock or stub what you do not own (see `mocking`); retry only at the boundary, with a deadline |
| **Real product race** | app state inconsistent under concurrency | bug report with the repro; do not hide it in the test |

### 4️⃣ Phase 3 — fix by cause

- timing → replace sleeps with `await expect(locator).toBeVisible()` / `expect.poll(...)` with a deadline
- shared state / order → isolate: dedicated test data, `afterEach` cleanup, no cross-test assumptions
- data collision → unique values per run
- environment → explicit config, env vars, pinned versions; diff local vs CI (`TZ`, locale, viewport, `CI=true`)
- external dependency → `page.route`/MSW with deterministic payloads (see `mocking`)
- product race → fix the app or file the bug; the test stays strict

### 5️⃣ Phase 4 — prove

- Re-run the **reproducing configuration** from Phase 1 (same workers, same shard, `CI=true`): the target must pass N consecutive runs (e.g. 50× alone, 10× full suite with the CI worker count).
- Run the **full suite** — the fix must not break others.
- Compare flake rate before/after on the same CI window; the test leaves the flake list only when the rate is 0 across it.

### 6️⃣ Phase 5 — contain what cannot be fixed yet

Quarantine = `test.skip` (or `test.fixme`) **plus**: owner, tracking issue link, diagnosis, and an expiry date in a comment. Report the quarantine list in the flake metrics. Never a silent skip; never a retry without a linked issue.

## 🚨 Red flags

- a timeout was raised to make the failure go away
- retries were added with no tracking issue
- the fix was "verified" only with `--workers=1` on a parallelism flake
- the test was skipped without owner/date
- the flake list grows while the pipeline stays green on retries

## 🔗 Related skills

- `diagnosing-test-failures` — for tests that fail on **every** run
- `mocking` — deterministic doubles for external dependencies and time
- `test-data-management` — unique, isolated data per test
- `visual-testing` — rendering determinism for screenshot flakes
- `quality-gates` — flake-rate metric and thresholds in CI

## ✅ Checklist

- [ ] Baseline flake rate recorded from CI history (or a local repeat-run sample, labelled as such)
- [ ] Flake reproduced with retries off, failing output saved
- [ ] One primary cause class assigned with cited evidence
- [ ] Fix targets the cause, not the symptom (no raised timeouts, no blanket retries)
- [ ] Proven on the configuration that broke it + full suite green
- [ ] Flake rate 0 across the comparison window before leaving the flake list
- [ ] Anything unfixable is quarantined with owner + issue + expiry, visible in metrics
