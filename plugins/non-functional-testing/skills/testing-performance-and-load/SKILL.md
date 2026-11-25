---
name: testing-performance-and-load
description: 'Designs and runs performance and load tests: workload modelling from real traffic, thresholds tied to SLOs, warmup and ramp shapes, percentile-based analysis, and lightweight CI perf checks with k6 or Artillery. Use when a feature has latency or throughput requirements, when "it feels slow" needs to become a number, when a launch needs to know how many concurrent users the system can handle, or when a performance result needs interpreting rather than just collecting.'
argument-hint: 'System under test, the concern (latency, throughput, capacity, endurance), real traffic data if available, and the SLO or target if one exists'
user-invocable: true
---

# Testing Performance and Load

Use this skill when a system's speed or capacity is in question and the answer needs to be a number someone can act on.

Most performance testing produces numbers nobody uses. The two causes are always the same: **a workload that does not resemble reality**, and **a result reported as an average**. A test that hammers one endpoint with a flat 500 virtual users tells you how the system responds to something that will never happen, and a mean response time of 200ms is compatible with one user in twenty waiting four seconds.

## When to Use

- a feature has a stated latency or throughput requirement
- "the app feels slow" needs to become a measurement
- a launch, campaign, or migration needs a capacity check
- a performance regression is suspected between two releases
- a performance result exists and needs interpreting
- a CI check should catch obvious regressions before they ship

## Operating Principles

- **Model the workload before writing the script.** Test shape comes from real traffic: which endpoints, in what ratio, with what think time, at what concurrency.
- **Percentiles, never averages.** Report p50, p95, p99. The mean describes nobody's experience and hides the tail entirely.
- **A threshold without an SLO is a guess.** Derive the number from what users need or what the business promised, and say which.
- **One variable per run.** Comparing two runs that differ in load, data volume, and code changes tells you nothing about any of them.
- **Environment differences invalidate the number, not just weaken it.** A result from a quarter-size environment is a shape, not a capacity.
- **Find the bottleneck, do not just report the symptom.** "p95 is 3 seconds" is an observation; "p95 is 3 seconds because the product query has no index on `category_id`" is a finding.

## Workflow

### Phase 0: Name the question

Different questions need different tests. Pick one per run.

| Question | Test type | Shape |
| --- | --- | --- |
| Is it fast enough under normal load? | Load test | Steady state at expected concurrency |
| Where does it break? | Stress test | Ramp until failure |
| Does it survive a sudden surge? | Spike test | Step change up, then down |
| Does it degrade over hours? | Soak test | Steady load for 4 to 24 hours |
| Did this release make it slower? | Regression comparison | Identical shape, two builds |
| How much capacity do we have? | Capacity test | Ramp to the SLO breach point |

A test that tries to answer all six answers none. If "it is slow" is all you have, start with a load test at expected concurrency and let the result narrow the question.

### Phase 1: Model the workload

The phase that decides whether the result means anything. Work through `./resources/workload-model.md`.

From real traffic where possible:

- **Endpoint mix**: the actual ratio, from access logs or analytics. Reads usually outnumber writes by an order of magnitude, and synthetic tests usually get this wrong.
- **Concurrency**: derived from throughput and think time, not guessed. `concurrent users ≈ arrival rate × session duration`.
- **Think time**: real users pause. A test with zero think time is a different system entirely.
- **Data distribution**: most requests hit a small hot set. A test with uniformly random ids has a cache hit rate nothing like production.
- **Session shape**: users log in, browse, and act. A test that only calls the checkout endpoint skips the state that makes checkout slow.
- **Peak profile**: daily peak, weekly peak, and the campaign or event shape if there is one.

When real traffic is unavailable, state the assumptions explicitly and mark the result as assumption-dependent. An assumed workload is workable; an unstated one is not.

### Phase 2: Set thresholds from the SLO

Each threshold traces to something: a user need, a documented SLO, a competitor benchmark, or a current baseline you intend to hold.

`./resources/thresholds-and-slos.md` covers deriving them. The shape:

```js
thresholds: {
  'http_req_duration{name:checkout}': ['p(95)<800', 'p(99)<2000'],
  'http_req_failed': ['rate<0.001'],
  'checkout_completed': ['count>0'],
}
```

Rules:

- **per-endpoint, not global.** A global p95 mixes a health check with a report export and describes neither.
- **include an error rate threshold.** A fast 500 is not a pass, and a load test with no error threshold will report one as success.
- **include at least one business-outcome counter.** "Requests succeeded" is not the same as "orders were created", and a test that never completes a checkout can look perfect.

### Phase 3: Prepare the environment

Record every difference from production before running anything. The differences bound what the result can claim.

- **Sizing**: instance count, CPU, memory, relative to production
- **Data volume**: a database with 2,000 rows and one with 4 million behave differently, and the difference is not linear
- **Data shape**: long-lived accounts, large carts, deep histories
- **Caches**: cold or warm, and warmed how
- **Dependencies**: real, stubbed, or rate-limited. A stubbed dependency that responds in 1ms removes the queueing that production has.
- **Network**: the load generator's location relative to the system
- **Autoscaling**: enabled or fixed, and with what policy

Then decide where the load generator runs. A generator on the same machine as the system under test competes with it for CPU, and the result measures the contention.

### Phase 4: Warm up, then measure

- **Warmup**: run at low load until JIT compilation, connection pools, and caches settle. Exclude the warmup from the results, and say how long it was.
- **Ramp**: reach target load over minutes, not instantly, unless the spike is the subject.
- **Steady state**: long enough for the metric to stabilize. Ten minutes is usually the minimum for anything meaningful.
- **Ramp-down**: watch for errors during the descent; connection pool problems often surface here.

Monitor the system, not only the client. Client-side response times tell you something is slow; server CPU, memory, database connections, queue depth, and GC pauses tell you why. A run with no server-side observation produces a symptom and no cause.

### Phase 5: Analyze

Report distributions.

- **p50** is the typical experience
- **p95** is the experience of a noticeable minority
- **p99** is where the timeouts and abandonments live
- **max** is one data point, and it is usually a GC pause or a cold start

Look for the shapes in `./resources/perf-report-template.md`:

- **the knee**: throughput plateaus while response time climbs; that is the capacity limit
- **the sawtooth**: periodic latency spikes, usually GC or a cache expiry
- **the drift**: response time climbing over a soak; usually a leak or unbounded growth
- **the cliff**: sudden failure past a threshold, usually a pool or a connection limit

Correlate every latency feature with a server-side metric before naming a cause. A hypothesis without a correlating metric is a guess, and performance work built on a guessed bottleneck is expensive.

### Phase 6: Report and act

Use `./resources/perf-report-template.md`. It requires:

- the workload model, so the reader can judge whether it resembles reality
- environment differences from production, stated up front
- results as percentiles per endpoint, with the error rate
- the bottleneck, with the evidence for it
- what the result does **not** tell you
- a recommendation

Add a lightweight CI check when there is something worth protecting: a short run at modest load, thresholds set generously enough not to be flaky, and a comparison against the last release. Recipes in `./resources/k6-recipes.md`. Its job is catching an order-of-magnitude regression, not measuring capacity.

## k6 Browser and k6 Cloud (Grafana)

Two extensions matter when the load test must include what a real browser does, or when results must be visible to the whole team:

- **k6 Browser** (`k6/x/browser`, Chromium inside the k6 test) — use when the scenario needs real page rendering, login through the UI, or Web Vitals during load, not just HTTP calls. Keep browser VUs low (they are expensive): a few browser VUs driving full user journeys plus many HTTP VUs for the raw load. Browser metrics (LCP, INP, CLS per iteration) come from the same run and feed `testing-web-performance` budgets.
- **k6 Cloud / Grafana Cloud k6** — push runs to the cloud (`k6 cloud script.js` or CI with a token) for long runs, distributed execution, and dashboards: results, thresholds, and alerts visualized in Grafana next to the app's metrics, so a load run can be correlated with backend telemetry. CI pattern: run locally for the fast gate, stream the nightly/long run to Cloud for trends and alerting (`automating-ci-test-pipelines`).
- The k6 MCP server (see the `qa-mcp` bundle) covers writing, validating, and running scripts from the agent — use it instead of hand-writing boilerplate.

## Common Failure Modes

- reporting the average, which describes nobody and hides the tail
- a flat load with no think time and no ramp, which no real traffic resembles
- uniformly random test data, giving a cache behaviour production never has
- testing one endpoint in isolation when the slowness comes from contention between several
- no error rate threshold, so a run that returned 500s at speed is reported as a pass
- a test that never completes a business transaction while every request succeeds
- results from an environment a quarter the size, presented as capacity
- no warmup, so the first minute's cold-start latency poisons the percentiles
- naming a bottleneck from client-side numbers alone
- a CI perf gate so tight it flakes, then gets disabled and never re-enabled

## If k6 (or Artillery) is not installed

The load tool is the instrument; without it there are no load numbers, and none may be invented.

1. **Install it - it is one command, not a project milestone.** k6: `brew install k6` (macOS), `choco install k6` (Windows), `sudo apt install k6` (Linux with the Grafana repo), or zero-install via Docker: `docker run --rm -i grafana/k6 run - < script.js`. Artillery: `npm i -D artillery` where a Node project already exists.
2. **If installation is not possible right now, degrade the claim, not the output.** A single-request latency check (`curl -w` timing or one API call) may be run and reported as *single-user latency, not load*. Browser tabs opened in parallel are not a load test and must not be presented as one.
3. **Never** present capacity numbers, VU counts, or percentile tables that no tool actually produced - quotes in the report name the tool and version that ran (`k6 run --vus 50 --duration 5m`, with output pasted).

## Resource Map

- `./resources/workload-model.md` - deriving the endpoint mix, concurrency, think time, and data distribution from real traffic, with a worked example
- `./resources/thresholds-and-slos.md` - deriving thresholds from SLOs, percentile choice, error budgets, and per-endpoint targets
- `./resources/k6-recipes.md` - k6 scripts for load, stress, spike, and soak shapes, plus the CI regression check, a k6 Browser journey example, k6 Cloud streaming, and an Artillery equivalent
- `./resources/perf-report-template.md` - report structure, the four curve shapes and what each means, and a worked example

## Related Skills

- `assessing-release-readiness` - when a performance result feeds a go/no-go decision
- `analyzing-quality-metrics` - when performance should be trended across releases rather than measured once
- `testing-api-contracts` - when the endpoints under load also need shape verification
- `designing-test-data` - when the load test needs a realistic hot set and data distribution
- `handling-sensitive-test-data` - when load test data is derived from production traffic
- `automating-ci-test-pipelines` - for running the CI regression check and storing its history
- `k6-load-testing` - the hands-on k6 layer: script anatomy, scenarios, thresholds, MCP runs, CI gate
- `tech-debt-analysis` - when the bottleneck is structural rather than a single query

## Definition of Done

This skill is complete when:

- the question is one of load, stress, spike, soak, regression, or capacity, and only one
- the workload model states endpoint mix, concurrency, think time, and data distribution, with its source or its assumptions
- thresholds are per-endpoint and each traces to an SLO, a user need, or a stated baseline
- an error rate threshold and at least one business-outcome counter are included
- environment differences from production are recorded before the run
- warmup is excluded from the results and its duration stated
- results are reported as percentiles, never as averages
- every latency finding is correlated with a server-side metric before a cause is named
- the report says what the result does not tell you
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
