---
name: stabilizing-flaky-tests
description: 'Diagnoses and fixes tests that fail intermittently, by root cause - timing, shared state, data collision, environment, order dependence, external dependency, or a real race in the application - proves the fix under the conditions that broke it, and contains what cannot be fixed yet with an owned, expiring quarantine. Use when a test fails randomly or passes on retry, passes locally but fails in CI, when a pipeline goes green after a re-run, or when raising a timeout is proposed as a fix. For the quick one-command triage loop, use the stabilize-flaky-tests command. A test that fails on every run goes to diagnosing-test-failures.'
argument-hint: 'The flaky test(s) or suite, CI evidence (failure history, retry logs, traces), the runner, and how often it fails'
user-invocable: true
---

# Stabilizing Flaky Tests

Use this skill when a test produces both a pass and a fail on the same commit. The goal is a deterministic test, not a test that passes more often.

A flake is a defect in the feedback system. Once a suite is known to lie occasionally, every red build becomes a judgement call and the first response to a real failure becomes "re-run it". Retries and raised timeouts make the symptom quieter and leave the cause in place, and sometimes the cause is a race in the product that users will hit.

## When to Use

- a test passes and fails on the same commit, locally or in CI, or passes only on retry
- a pipeline goes green after a re-run, retries mask failures, or someone proposes raising a timeout to make a failure go away
- a flake list or quarantine keeps growing and needs root causes, owners and expiry dates
- a flakiness fix must be proven under the conditions that broke it


## When NOT to Use

- the test fails every run: it is broken, not flaky. Use the `fix-tests` command.
- the instability is a pixel diff that changes run to run: start with `running-visual-regression-tests`, which owns rendering determinism.
- the only question is how many tests are flaky and whether it is getting better: use `analyzing-quality-metrics`.

## Operating Principles

- **Reproduce before fixing.** A fix for a flake you have not seen fail is a guess. Keep the failing output; it is half of the proof.
- **Classify before fixing.** Each cause has a different fix. "Add a wait" applied to a data collision makes the test slower and still flaky.
- **Decide whose bug it is.** A test that races the application is a test bug. An application that races itself is a product bug that the test found. The second gets a bug report, not a quieter test.
- **Retries are a measuring instrument, not a fix.** In CI they keep the pipeline moving and label the test `flaky` in the report. Every retried pass is an open defect.
- **Containment is visible, owned, and dated.** A quarantined test has an owner, a tracking link, a diagnosis, and an expiry. A silent skip is deleted coverage.
- **Prove with the configuration that broke it.** Twenty green runs with one worker prove nothing about a parallelism flake.

## Workflow

### Phase 0: Pick the targets and measure the baseline

Start from evidence, not memory.

- From CI history, list tests with both a pass and a fail on the same commit in the last 14 or 30 days. That is the flake definition `analyzing-quality-metrics` uses; keep it, so before and after numbers compare.
- Rank by flake count. A short head of tests usually produces most of the noise; fix those first.
- For each target, record the observed failure rate, the first-seen date, and the failure messages. Different messages from one test often mean two causes.

If there is no history, screen the scope with a repeat run (Phase 1) and say the baseline is a local sample, not CI data.

### Phase 1: Reproduce

Run each configuration below that applies, with retries off, and keep the output. Each one accuses a different cause. Exact commands for Playwright, Vitest, and Jest are in `./resources/reproduction-recipes.md`.

| Run | Exposes |
| --- | --- |
| The test alone, repeated 20-50 times | nondeterminism inside the test: timing, randomness, unawaited async |
| The test alone, once, outside its file | dependence on state another test created |
| The file or suite in a different order | order dependence, leaked state |
| Repeated with several workers, then with one | contention over shared data, accounts, files, ports |
| With the CI shard split, or the neighbouring tests from the failing shard | cross-test interference that only appears in that grouping |
| CI-like conditions: `CI=true`, headless, the CI container image, throttled CPU | environment coupling, timing assumptions hidden by a fast laptop |

Stop reproducing when one configuration fails reliably enough to iterate on (roughly 1 in 10 or better). If nothing reproduces after the full table, do not close it: add diagnostics that will catch it next time (trace on first retry, seed and order logging, console and request-failure logging), mark it `cause unknown`, and keep it in the flake list.

### Phase 2: Classify

Assign one primary class per test, using the evidence from Phase 1 and the trace of a failing run.

| Class | Signature | Typical fix |
| --- | --- | --- |
| **Timing (test races the app)** | fails more under load; trace shows the action or assertion ran before the UI or data was ready; sleeps or one-shot checks in the test | wait on the condition: web-first assertions, a specific response, `expect.poll` / `toPass` |
| **Shared state / order dependence** | passes alone, fails in the file or in another order | each test builds its own state; fixture teardown; no shared `page` or module-level mutable state |
| **Data collision** | fails only with several workers or shards; duplicate-key or "already exists" errors | unique data per test or per worker; per-worker accounts |
| **Environment** | CI-only; differs by container, timezone, locale, viewport, resources | pin the variable: container image, `TZ`, locale, viewport; give the job the resources it needs |
| **External dependency** | failure correlates with a third-party or shared-environment outage | stub the boundary you do not own; see `mocking-network-and-time` |
| **Time and randomness** | fails at midnight, month end, DST, or with certain seeds | freeze the clock and timezone; seed and log the generator |
| **Realtime timing (WS/SSE)** | the assertion ran before the pushed message arrived; worse under load or slow CI; the trace shows the socket frame landing after the read | wait on the rendered effect of the message (or the frame itself), never on channel open; force the timing with a mocked channel via `mocking-network-and-time` |
| **Application race (product bug)** | the trace shows the app itself doing the wrong thing intermittently: double submit, lost update, stale cache, out-of-order responses | file a bug with the trace; mark the test as a known failure linked to the bug; do not weaken the assertion |

`./resources/root-cause-catalogue.md` has the signatures in more detail, the evidence to look for in a trace, and before/after code for each class.

When the class is unclear, write down the competing hypotheses and the run that would tell them apart, then run it. Change one hypothesis per fix, so the proof run attributes the cause.

### Phase 3: Fix the cause

Keep each fix minimal and aimed at the class:

- **Timing**: replace sleeps and one-shot reads with conditions. In Playwright: `await expect(locator).toHaveText(...)` instead of reading text and comparing; start `page.waitForResponse(...)` before the click that triggers it; `expect.poll` or `toPass` for non-DOM state. Disable animations if they intercept clicks.
- **Shared state**: move setup into a fixture with teardown after `use()`; give each test a fresh context (the default); never share a `page` across tests in `beforeAll`.
- **Data**: generate unique values per test (`testInfo.workerIndex` plus a unique suffix); create the data the test needs through the API and delete it in teardown; under sharding, include the shard identity because worker indices repeat across shards.
- **Environment**: pin it in config, not in the test body.
- **External**: stub it and add a drift guard, via `mocking-network-and-time`.
- **Application race**: report it (see `reporting-bugs`), and mark the test `test.fail()` or `test.fixme()` with the bug link so the suite tells the truth about the product.

The fix makes the test wait for, isolate, or pin the thing the class names; a raised global timeout, an added retry, a loosened assertion, or forced serial mode makes it pass without doing that. If serial mode is genuinely the design (a test that is one workflow split into steps), say so in a comment and in the record.

Bound the loop: three hypotheses or five fix attempts per test, whichever comes first. Then stop, quarantine with the diagnosis so far (Phase 5), and report what was ruled out.

### Phase 4: Prove stability

A flake is fixed when the configuration that used to fail now passes repeatedly.

- rerun with the same repeat, order, worker count, or shard grouping that reproduced it, with retries off
- run at least as many repetitions as needed to make the old failure rate visible: if it failed 1 in 10, 50 green runs is evidence, 5 is not
- run the rest of the file once to check the fix did not move the problem to a neighbour
- quote both outputs: the failing run before and the repeated green after
- remove any retry override, `slow()`, raised timeout, or quarantine that was masking this test, in the same change

### Phase 5: Contain what cannot be fixed now

When a fix is out of reach today, quarantine visibly rather than retrying silently. `./resources/quarantine-policy.md` has the full policy. The minimum per test:

- an owner (a person, not a team alias)
- a tracking issue with the Phase 2 diagnosis and the evidence so far
- an expiry date, by default 30 days, after which the test is fixed or deleted with its coverage loss stated
- a mechanism that keeps it visible: a `@quarantine` tag excluded from the blocking job and run in a non-blocking job, or `test.fixme` with the issue link

Keep the flaky test in the suite, quarantined; deleting it to get green removes the evidence that the behaviour was ever covered.

### Phase 6: Record and measure

For each test, fill in `./resources/flake-record-template.md`: class, evidence, fix, proof, or quarantine details. Then report the before and after flake rate for the scope, together with the quarantine count, because a flake rate that fell through quarantining is not an improvement. `analyzing-quality-metrics` has the definitions; `tracking-quality-trends` keeps the series.

## Common Failure Modes

- reproducing with one worker when the flake only appears with four
- waiting for a socket or stream to be open, then asserting immediately: open is transport, not readiness - the first frame has not arrived
- fixing the symptom in a helper used by forty tests, so the change cannot be reviewed or attributed
- a product race hidden by a test that now waits until the race has resolved
- quarantine with no owner or expiry, so the quarantine list becomes the place coverage goes to die
- a pass rate computed after retries, which counts every flake as a pass

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "A retry is fine for now" | A retried pass is an open defect reported as green, and "for now" has no expiry. If it cannot be fixed today, quarantine it with an owner, an issue, and a date. |
| "I ran it once after the change and it passed" | A 1-in-10 flake passes a single run 90% of the time. Run the configuration that reproduced it, retries off, enough times to make the old rate visible. |
| "The timeout was too tight anyway" | A longer timeout makes the race rarer, not gone, and slows every failure. Wait on the condition the test depends on. |
| "The assertion was too strict anyway" | If the app sometimes produces the wrong value, the assertion found a product race. File the bug and mark the test as a known failure with the link. |
| "I can't reproduce it, so it's probably fixed" | Unreproduced is unknown. Add diagnostics that capture the next failure and keep it on the flake list as `cause unknown`. |
| "I'll mark it skip and file a ticket" | A skip with no owner or expiry is deleted coverage. Quarantine it per Phase 5 so it still runs in a visible, non-blocking job. |

## Red Flags

- The diff raises a timeout, adds `retries`, `slow()`, or `serial` mode, or loosens an assertion, and the report says "fixed".
- No failing run of the target test is quoted before the fix.
- The proof is a single run, or runs with a different worker count, order, or shard than the one that failed.
- A quarantine or skip with no owner, issue link, or expiry date.
- A flaky test deleted in the diff.
- One change that addresses two or more suspected causes.
- A before-and-after flake rate reported without the quarantine count beside it.

## Resource Map

- `./resources/reproduction-recipes.md` - repeat, isolation, order, worker, shard, and CI-condition commands for Playwright, Vitest, and Jest, plus diagnostics to add when it will not reproduce
- `./resources/root-cause-catalogue.md` - per-class signatures, what to look for in a trace, and before/after fixes
- `./resources/quarantine-policy.md` - when to quarantine, the required fields, mechanisms, expiry and exit rules
- `./resources/flake-record-template.md` - per-test diagnosis record and the summary report

## Related Skills

- `stabilize-flaky-tests` - the quick one-command triage loop this skill expands into the full workflow
- `mocking-network-and-time` - when the cause is an external service, the clock, or the timezone
- `unslop-tests` - when the flaky test also proves little; retries and hardcoded waits are tells it flags
- `analyzing-quality-metrics` - the flake rate and quarantine definitions used for before and after
- `tracking-quality-trends` - to keep the flake rate as a series rather than a single reading
- `governing-quality-waivers` - when a quarantine is a waiver that needs the same owner and expiry discipline
- `automating-ci-test-pipelines` - retry reporting, trace artifacts, and the non-blocking quarantine job
- `designing-test-automation-architecture` - when the flakes come from the suite's design, such as shared accounts or a data strategy with no isolation
- `reporting-bugs` - when the flake is a race in the application
- `writing-unit-tests` - its `flaky-test-triage` resource covers the unit-level version of the same problem
- `diagnosing-test-failures` - when the test fails on every run rather than intermittently

## Definition of Done

This skill is complete when:

- every target test has a failure rate recorded before the change, labelled as CI history (with window) or a local sample (with run count)
- each test has a quoted failing run with its reproducing configuration, or is marked `cause unknown` with the added diagnostics named by `file:line`
- each test has one primary class, citing the run or trace that supports it
- each application race has a filed bug link, and the test is marked as a known failure with that link and its assertion unchanged in the diff
- the diff adds no global timeout, retry, assertion loosening, or serial mode to make a test pass
- each fix has quoted output of N green runs, retries off, under the configuration that reproduced the failure, with N large enough to expose the old rate
- every quarantined test has an owner, an issue, a diagnosis, and an expiry, and the job that still runs it is named
- the before and after flake rate is reported next to the quarantine count
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
