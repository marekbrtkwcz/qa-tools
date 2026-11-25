---
name: reporting-bugs
description: 'Turns rough tester notes, screenshots, console output, or observed behavior into a reproducible bug report with severity, evidence, and follow-up guidance. Use when logging a bug or crash, triaging intermittent issues, or rewriting vague defect notes, and applies even when the user only describes what went wrong and asks to write it up for developers or a tracker such as Jira. To find the root cause of a failing test or defect, use diagnosing-test-failures.'
argument-hint: 'Observed behavior, expected behavior, steps, environment, evidence, and any reproduction notes'
user-invocable: true
---

# Reporting Bugs

Use this skill to turn messy observations into bug reports that developers can actually act on.

## When to Use

- write a bug report from rough notes or screenshots
- normalize findings from exploratory testing
- triage an intermittent or hard-to-reproduce issue
- rewrite a vague defect description into a developer-ready report
- capture product, accessibility, or automation defects in a consistent format

## Reporting Rules

- **Observation first** - describe what happened before discussing why it may have happened.
- **Reproduction beats opinion** - a calm, reproducible report is worth more than a dramatic summary.
- **Evidence should travel with the bug** - attach logs, screenshots, recordings, payloads, or selectors when available.
- **Severity follows impact** - grade the issue by user or business impact, not by frustration level.
- **Unknowns stay visible** - if confidence is low, say so clearly instead of bluffing.

## Workflow

### Phase 0: Gather the raw material

Collect what exists today:

- short summary of the problem
- environment and build details
- preconditions or setup state
- reproduction steps or triggering actions
- actual result
- expected result
- evidence such as screenshots, traces, logs, payloads, or timestamps

If critical pieces are missing, ask only for what is needed to make the report actionable.

### Phase 1: Normalize the reproduction story

Reduce the issue to a clean sequence:

1. starting state
2. user action or system trigger
3. observable result
4. expected result

If the issue is intermittent, capture the pattern explicitly:

- `always`
- `sometimes`
- `seen once`
- `not reproduced yet`

### Phase 2: Classify the issue

Record the metadata that routes it:

- **Category** - functional, data, auth, performance, accessibility, automation, or integration
- **Severity** - use `./resources/severity-matrix.md`
- **Confidence** - confirmed, likely, or suspected
- **Reproducibility** - always, intermittent, once, or unknown

State a root cause only when the evidence shows it. Suspicions, yours or the user's, go in a separate **Notes / Hypothesis** section, labelled as unconfirmed.

### Phase 3: Build the report

Use `./resources/bug-report-template.md` when possible.

The report includes:

- clear title with the broken behavior and surface
- environment block
- preconditions
- numbered steps to reproduce
- actual vs expected result
- severity with short justification
- evidence list
- missing evidence or follow-up questions if the report is still incomplete

### Phase 4: Add next-step guidance

When useful, end with one or more of these:

- suggested retest focus after the fix
- related areas that may also be affected
- test coverage that should be added or updated
- evidence still needed to confirm the defect fully

## Common Failure Modes

- reporting a symptom without a trigger
- skipping expected behavior and forcing the developer to guess the contract
- writing severity with no business or user impact explanation
- mixing multiple bugs into one ticket

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "It's obviously a race in the handler, I'll put that as the cause" | An unconfirmed cause sends the developer to the wrong place. Report the observation; put the theory under Notes / Hypothesis. |
| "I saw it once, the steps are probably these" | Reconstructed steps that do not reproduce waste the first hour of triage. Mark reproducibility `seen once` and list only the steps you actually took. |
| "This feels critical, I'll mark it High" | Severity grades user or business impact. Pick it from the severity matrix and write the one-line impact that justifies it. |
| "Expected behavior is obvious" | The developer may hold a different contract. State the expected result and where it comes from: spec, ticket, or previous behavior. |
| "The screenshot says it all" | Screenshots lose build, environment, and timing. Add the build, the environment, and a timestamp or log line next to it. |

## Red Flags

- A cause stated in the summary or title with no evidence cited for it.
- Steps to reproduce with no starting state, or with reproducibility left blank.
- A severity with no impact sentence.
- No expected result, or "should work" as the expected result.
- More than one broken behavior in a single report.
- Title wording that grades the bug ("critical", "major issue") instead of naming the broken behavior and where it occurs.

## Resource Map

- `./resources/bug-report-template.md` - default structure for the final bug report
- `./resources/severity-matrix.md` - impact-based severity rubric

## Related Skills

- `designing-functional-tests` - when the defect needs new manual coverage or regression updates
- `auditing-accessibility` - when the report is centered on WCAG or assistive-technology failures
- `requirements-test-coverage-mapper` - when a bug reveals a larger coverage gap against stated requirements
- `diagnosing-test-failures` - when the root cause is not yet known, or a failing test must be classified as app defect, test bug, or environment before reporting

## Definition of Done

This skill is complete when:

- the report states build and environment, preconditions, numbered steps, actual and expected results, with no reference to the chat it came from
- reproducibility is one of `always`, `sometimes`, `seen once`, or `not reproduced yet`, and steps not personally performed are marked as reported
- severity names its row in the severity matrix and gives a one-line user or business impact
- every evidence item is listed by file name, link, or log excerpt, and missing evidence is listed as a follow-up question
- any suspected cause sits under Notes / Hypothesis, not in the title or summary
- the report covers one broken behavior and is in the template's format, ready to paste
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
