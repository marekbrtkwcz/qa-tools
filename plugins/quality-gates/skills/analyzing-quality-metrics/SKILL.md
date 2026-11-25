---
name: analyzing-quality-metrics
description: 'Defines, computes, and interprets test and quality metrics: pass rate, flake rate, suite duration, defect escape rate, time to detect, and coverage with its caveats. Use when building a QA dashboard, reporting suite health to stakeholders, or when a coverage percentage or a bug count is being treated as a measure of quality. To track how these readings move between runs or releases, use tracking-quality-trends.'
argument-hint: 'Available data sources (CI runs, test reports, issue tracker, incidents), the audience for the report, and the decision the numbers should support'
user-invocable: true
---

# Analyzing Quality Metrics

Use this skill when someone needs numbers about testing and quality, and the numbers need to survive being acted on.

Every quality metric is a proxy. Coverage proxies for thoroughness, bug count proxies for code health, pass rate proxies for confidence. Proxies are useful until they become targets, at which point they get optimized directly and stop measuring anything. The job here is to pick proxies that resist that, define them precisely enough to be computed the same way twice, and always report the decision the number is meant to inform.

## When to Use

- a stakeholder asks for a QA dashboard or a testing status report
- a coverage percentage is being used as a quality gate
- flakiness is being discussed with no measurement behind it
- suite runtime is growing and nobody can say by how much
- release quality needs comparing across releases
- a metric has become a target and the behaviour around it has gone strange

## Operating Principles

- **Every metric names the decision it supports.** A number nobody acts on is a number nobody should collect.
- **Define before you measure.** "Flaky test" and "escaped defect" mean different things to different people; a metric computed two ways is two metrics.
- **Trend over snapshot.** A single value is noise. Direction over several releases is signal.
- **Pair every metric with its counterweight.** Speed with escape rate, coverage with mutation survival, pass rate with flake rate. A metric reported alone gets gamed alone.
- **Rates, not counts.** Ten defects means nothing without the denominator: per release, per thousand changed lines, per user.
- **State the caveat with the number.** Coverage without "this measures execution, not assertion" is a misleading number, even when it is correct.
- **Never measure individuals.** Bugs found per tester and defects introduced per developer both produce worse work and worse data.

## Workflow

### Phase 0: Find the decision

Before selecting anything, ask what will be decided differently depending on the answer:

| Decision | Metrics that inform it |
| --- | --- |
| Is this build shippable? | Pass rate on the candidate, open defect profile, coverage of the changed area |
| Where should we invest test effort? | Escape rate by area, defect density by module, coverage gaps against risk |
| Is our suite trustworthy? | Flake rate, quarantine count and age, mutation survival |
| Is our feedback loop fast enough? | Suite duration by stage, time to first failure signal, queue time |
| Is quality improving? | Escape rate trend, time to detect trend, change failure rate |

A metric that maps to no row here is a metric to drop. Collecting it costs attention and invites someone to optimize it.

### Phase 1: Define each metric precisely

Use `./resources/metric-definitions.md`. Each definition fixes:

- the formula and both its numerator and denominator
- the data source and how to extract it
- the time window
- what counts and what is explicitly excluded
- the known distortions
- the decision it supports

Two definitions worth fixing early because they are argued about most:

- **Flaky test**: a test that produced both a pass and a fail on the same commit within the window. Not "a test someone re-ran".
- **Escaped defect**: a defect found in production that a test at any level could in principle have caught. Not every production incident; a third-party outage is not an escape.

### Phase 2: Establish the baseline

Compute over the last several releases or the last quarter before showing anything. A metric introduced with no history invites a target set from a single point, which is how arbitrary thresholds are born.

Record with each baseline:

- the range and the variance, not only the average
- what was happening in the period (a large refactor, a hiring wave, a holiday freeze)
- gaps in the data and how they were handled

### Phase 3: Pair and counterweight

Never publish a metric without its counterweight.

| Metric | Counterweight | The behaviour this prevents |
| --- | --- | --- |
| Line coverage | Mutation score, or assertion density | Tests that execute code and assert nothing |
| Pass rate | Flake rate, skipped count | Skipping and quarantining to keep the bar green |
| Suite duration | Escape rate | Deleting slow tests that were catching things |
| Defects found | Escaped defects | Rewarding shallow, high-volume bug reports |
| Deployment frequency | Change failure rate | Shipping faster and worse |
| Automation percentage | Escape rate on automated areas | Automating what is easy rather than what is risky |

### Phase 4: Compute and visualize

Rules that keep a dashboard honest:

- show the trend line, not just the current value
- annotate the timeline with events: a release, a refactor, a suite migration
- show the denominator on the chart
- use the same window everywhere; a weekly flake rate next to a quarterly escape rate invites the wrong comparison
- mark data gaps as gaps rather than interpolating them
- put the caveat in the chart, not in a footnote nobody reads

`./resources/quality-report-template.md` has a report structure that holds up in front of stakeholders.

### Phase 5: Interpret

Write the interpretation next to the number. A dashboard with no narrative gets a narrative invented for it by whoever presents it.

For every notable movement, state:

- what changed
- the most plausible cause, and the competing explanation
- what would confirm which one it is
- what, if anything, should be done

Alternative explanations are not hedging. Coverage rising after a test-generation sprint and coverage rising because a large untested module was deleted look identical in the chart and mean opposite things.

### Phase 6: Check for corruption

Every quarter, run the checks in `./resources/anti-metrics.md`:

- has any metric become a target with a number attached to someone's objectives
- are tests being skipped or quarantined near the reporting boundary
- has coverage risen while mutation survival stayed flat
- are defects being reclassified rather than fixed
- is anyone's performance being measured with any of these

A corrupted metric is worse than a missing one, because it is trusted. When you find one, retire it and say why.

## Common Failure Modes

- reporting coverage as a quality number without saying it measures execution, not verification
- a bug count with no denominator and no window
- a single snapshot presented as a trend
- setting a target on a proxy, which converts it into a target and destroys it as a measure
- measuring individuals, which changes behaviour long before it changes outcomes
- pass rate reported next to a growing skip list nobody mentions
- a dashboard nobody has ever acted on, still being maintained
- comparing two periods with different definitions after a tooling change

## Resource Map

- `./resources/metric-definitions.md` - formula, source, window, exclusions, distortions, and supported decision for each metric
- `./resources/anti-metrics.md` - metrics to avoid, the Goodhart cases, and the quarterly corruption check
- `./resources/quality-report-template.md` - stakeholder report structure with a worked example

## Related Skills

- `stabilizing-flaky-tests` - when flake rate identifies which tests to fix
- `tech-debt-analysis` - when the metrics point at structural debt rather than at individual tests
- `assessing-release-readiness` - when the numbers feed a go/no-go decision
- `unslop-tests` - when coverage is high and mutation survival says the tests prove nothing
- `automating-ci-test-pipelines` - when suite duration and queue time are the metrics under pressure
- `analyzing-regression-scope` - when defect density by area should steer retest priority
- `documenting-test-suites` - when the definitions need a permanent home the team can cite

## Definition of Done

This skill is complete when:

- every reported metric names the decision it supports, and metrics that support none were dropped
- each metric has a written definition with formula, source, window, and exclusions
- a baseline with range and variance exists before any target is discussed
- every metric is published with its counterweight
- charts show trends, denominators, annotated events, and gaps marked as gaps
- each notable movement carries an interpretation with at least one competing explanation
- no metric measures an individual
- the corruption check has been run and any corrupted metric has been retired with a reason
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
