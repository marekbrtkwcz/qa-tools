---
name: requirements-test-coverage-mapper
description: 'Maps requirements (PRD, user stories, acceptance criteria) to planned test coverage via a Requirements Traceability Matrix, exposing coverage gaps, risks, test levels, prioritization, and automation candidates. Use when designing coverage from a specification, checking coverage completeness for a PRD or user story, finding missing acceptance criteria, or building a risk-based regression strategy. When the tests already exist and the matrix has to be extracted from them, verified, and kept accurate, use tracing-requirements-to-code; to check whether one build is done, use verifying-acceptance-criteria.'
argument-hint: 'PRD, user stories, or acceptance criteria to map, plus scope boundaries and known constraints'
user-invocable: true
---

# Requirements → Test Coverage Mapper (RTM)

This skill turns a PRD, user stories, acceptance criteria, and constraints into a traceability-driven test coverage plan:

- a Requirements Traceability Matrix (RTM)
- a gap & ambiguity report
- test design recommendations across levels (unit/API/UI/e2e/non-functional)
- automation candidates and CI gating suggestions

The output is designed to be used as a living artifact and single source of truth for coverage, readiness, and auditability.

## When to Use

Use this skill when you need to:

- Validate coverage completeness before/after implementation
- Convert PRD/user stories into a test plan that is traceable and reviewable
- Identify missing acceptance criteria, ambiguous requirements, or hidden scope
- Support change impact analysis when requirements evolve
- Build a risk-based regression strategy or release readiness assessment

## Operational Workflow

### Phase 0: Strategy Selection (Context First)

Classify the work to adjust rigor and output depth:

- Delivery stage: MVP / Iteration / Hardening / Release / Hotfix
- Domain risk: Low / Medium / High (payments, auth, compliance = high)
- Change surface: UI / API / Data / Infra / Cross-cutting
- AI criticality: None / Supporting / Core
- Target tooling (optional): Jira / Azure DevOps / TestRail / GitHub Issues

If unknown, mark as `TBD` and proceed with safe defaults.

### Phase 1: Discovery

Ask targeted questions where the answer would change the coverage plan. Cover these areas:

1. **Test basis source** - PRD link/text? user stories? AC? designs? (what is the "source of truth"?)
2. **Scope boundaries** - what is explicitly in/out? any non-goals?
3. **Quality attributes** - performance, security, accessibility, reliability, observability expectations?
4. **Data & environments** - test envs available, data seeding/masking rules, third-party dependencies?
5. **Release constraints** - deadline, MVP cuts, rollout type (flagged, staged, big-bang)?
6. **Definition of Done / acceptance** - who signs off and what evidence is required?

If the user cannot answer (or wants to move fast), capture the gaps as explicit assumptions in the output and proceed.

### Phase 2: Normalization (Make Requirements Traceable)

Normalize input into atomic, testable requirements:

- Split compound requirements into smaller "testable statements"
- Assign stable IDs if missing: `REQ-001`… (requirements), `US-001`… (user stories), `AC-001`… (acceptance criteria)
- Mark ambiguous statements as `NEEDS_CLARIFICATION`

### Phase 3: Coverage Design (Levels + Risks + Data)

For each requirement, propose coverage across:

- **Functional**: positive/negative, edge cases, permissions
- **Integration**: APIs, events, DB, third parties
- **UX**: key flows, accessibility, error messaging
- **Non-functional**: performance, security, reliability, observability
- **AI-specific (if applicable)**: evaluation, drift, hallucinations/failure modes, fallbacks

Use risk-based thinking: assign impact (H/M/L) and likelihood (H/M/L), and derive priority and test depth from risk.

### Phase 3b: Cross-Check the Backward Direction

The RTM table has one row per requirement, so it can only ever show requirements with no test. When tests already exist, also run the other direction: **which existing tests map to no requirement?**

An orphan test is one of three things, and they need different actions:

- an **undocumented requirement** - the behaviour matters, someone tested it, nobody wrote it down. Add it to the requirement set.
- a **test of removed behaviour** - delete it.
- a **test that proves nothing** - route it to `unslop-tests` rather than mapping it.

Report orphans classified, not counted. For a full bidirectional pass over an existing codebase, including annotation, link verification, and drift detection, use `tracing-requirements-to-code`.

### Phase 4: Produce the Output

Follow the strict output schema in `./resources/coverage-map-template.md` - document metadata, executive coverage summary, RTM table, scenario catalog, gap report, risk-based prioritization, automation/CI recommendations, and assumptions/change-impact notes, in that order.

## Quality Rules (Non-Negotiable)

### DO

- Make every requirement atomic and testable
- Use stable IDs for traceability
- Flag unknowns; don't invent constraints
- Prefer measurable outcomes and concrete expected results
- Recommend test levels intentionally (not everything must be E2E)

### DON'T

- Don't hallucinate requirements, flows, or data models
- Don't produce only UI tests (must consider unit/API/NFR)
- Don't accept ambiguous requirements without logging them as gaps
- Don't mark coverage "complete" if AC is missing or unclear

## Self-Review Checklist

Before final output:

- [ ] Every requirement has an ID and is atomic
- [ ] Every requirement maps to ≥1 scenario OR is flagged missing
- [ ] Where tests already exist, orphan tests are identified and classified
- [ ] A scenario marked `Exists` was confirmed against the actual test, not assumed from its title
- [ ] Ambiguities are captured as explicit questions
- [ ] Risk is assigned and used to prioritize
- [ ] Non-functional coverage is addressed where relevant
- [ ] Assumptions are listed explicitly

## Resource Map

- `./resources/coverage-map-template.md` - the strict output schema (RTM table, scenario catalog, gap report, prioritization tiers) with a worked example

## Related Skills

- `tracing-requirements-to-code` - when the tests already exist and the matrix must be extracted from them, verified, and kept accurate. Use this skill to plan coverage from a spec, that one to trace what was actually built.
- `prd-generator` - when requirements themselves still need to be written before mapping
- `verifying-acceptance-criteria` - when a specific build must be checked against the acceptance criteria
- `analyzing-regression-scope` - when the question is tactical retest scope after a change rather than full traceability
- `designing-functional-tests` - when RTM scenarios should expand into detailed test cases
- `assessing-release-readiness` - when the coverage gaps found here feed a go/no-go decision

## Definition of Done

This skill is complete when:

- every requirement is atomic, has a stable ID, and maps to at least one scenario or an explicit `MISSING_TEST` flag
- gaps and ambiguities are logged with concrete resolution questions
- prioritization tiers are risk-derived and actionable
- automation and CI recommendations are justified per scenario
- assumptions and change-impact notes are explicit
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
