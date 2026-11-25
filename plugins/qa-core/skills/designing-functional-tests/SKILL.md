---
name: designing-functional-tests
description: 'Designs risk-based functional and regression test plans, manual test cases, and automation handoff packs from requirements, URLs, or exploratory notes. Use when a new feature or page needs a test plan or manual QA coverage before automation, turning feature descriptions into scenario catalogs, or converting exploratory findings into structured test assets.'
argument-hint: 'Feature scope, requirements or URL, roles, environment, and whether you need a plan, cases, or regression scope'
user-invocable: true
---

# Designing Functional Tests

Use this skill when the goal is to turn product intent into tester-ready coverage rather than directly generating automation.
It helps produce plans and cases that are clear enough for manual execution and clean enough to hand off to automation later.

## When to Use

- create a risk-based functional test plan
- turn acceptance criteria into manual test cases
- convert exploratory notes into reusable scenario packs
- prepare a regression slice for a bug fix or small feature
- identify which scenarios should move into automated tests first

## Core Rules

- **No silent invention** - missing behavior becomes a question or an explicit assumption.
- **Risk decides depth** - high-risk flows deserve positive, negative, boundary, permission, and recovery coverage.
- **One case proves one thing** - avoid giant cases that validate five behaviors at once.
- **Stable IDs matter** - use durable IDs for scenarios and cases so they can be referenced later.
- **Manual first, automation second** - good automation starts with stable, observable manual intent.

## Workflow

### Phase 0: Frame the deliverable

Decide which artifact is needed:

- **Full plan** - scope, priorities, scenario catalog, risks, open questions
- **Manual cases** - detailed steps and expected results
- **Regression slice** - the smallest believable retest pack after a change

If the user did not specify the artifact, choose the lightest format that still solves the task.

### Phase 1: Run the test-readiness gate

Before writing cases, confirm the test basis gives enough signal to work with.

Minimum signal:

- the feature or flow being tested
- the actor or user role
- the starting state or preconditions
- an observable success outcome

If any of these are missing:

1. Ask targeted questions.
2. If the user wants to move fast, proceed with an **Assumptions** section instead of inventing hidden requirements.
3. Tag affected scenarios or cases with `ASSUMPTION`.

Do not write confident-looking expected results for behavior that is still unknown.

### Phase 2: Map the coverage lenses

For each high-value flow, check these lenses:

| Lens | What to cover |
| --- | --- |
| Happy path | Baseline success path |
| Negative | Invalid inputs, rejected actions, failures |
| Boundary | Empty, min, max, off-by-one, format edges |
| Permissions | Wrong role, wrong state, missing access |
| Recovery | Retry, refresh, session loss, partial failure |
| Data / State | Persistence, deduplication, conflicting updates |
| Accessibility smoke | Keyboard reachability, labels, error visibility |

Not every flow needs the same depth.
Apply full coverage to risky flows and lighter smoke coverage to low-risk areas.

### Phase 3: Prioritize before expanding

Use a simple three-level priority scale:

- **High** - critical business path, security-sensitive area, money/data movement, or frequent user action
- **Medium** - important supporting workflow or high-change area
- **Low** - secondary behavior, visual polish, or low-impact option

High-priority flows should include at least:

- one happy path
- one negative case
- one boundary or permission case
- one recovery or state-handling case

### Phase 4: Produce the requested artifact

#### Full plan

Use `./resources/test-plan-template.md` when possible.
A good plan includes:

- scope and exclusions
- risks and priorities
- scenario catalog with IDs like `SCN-001`
- assumptions and open questions
- automation handoff notes

#### Manual test cases

Use `./resources/manual-test-cases-template.md` when possible.

Case rules:

- Use IDs like `MTC-001`
- Keep steps observable and short
- Write specific expected results, not "works correctly"
- Include case type tags such as `happy`, `negative`, `boundary`, `permission`, `recovery`, `a11y-smoke`
- Add an **Automation Candidate** value: `high`, `medium`, or `low`

#### Regression slice

For small changes or bug fixes, produce:

- changed surface
- must-retest scenarios
- adjacent risk areas
- optional "do later" scenarios if time is tight

### Phase 5: Prepare the handoff

Before finishing, decide what should happen next:

- send risky edge cases into the `/qa-strategy` prompt for adversarial expansion
- send stable, repeatable scenarios into the `/test-generator` or `/playwright-generate-test` prompts
- send requirements-heavy work into `requirements-test-coverage-mapper` when traceability matters more than step-by-step execution

## Output Standards

Always include:

- clear scope
- priority or risk signal
- explicit assumptions or open questions
- scenario or case IDs
- enough detail for another tester to execute without a live explanation

Good output is handoff-ready, not just impressive-looking.

## Common Failure Modes

- writing a plan that only covers happy paths
- burying critical assumptions inside prose
- mixing multiple assertions into one giant test case
- using vague expected results such as "data saved successfully"
- generating every possible case without prioritization

## Resource Map

- `./resources/test-plan-template.md` - structure for full plans and regression slices
- `./resources/manual-test-cases-template.md` - table format for detailed manual execution

## Automation candidacy

A plan is not done when it is written; it is done when the automate/manual split is decided. Before handing off, mark each scenario with a decision and a reason, using the criteria in the `automation-backlog-planner` agent (deterministic + high regression cost + cheap to run automated = automate; exploratory, subjective, or one-off = stays manual). A scenario that has never been run manually has no stable intent to encode - sequence it after a manual pass, never automate it blind.

## Related Skills

- `requirements-test-coverage-mapper` - when traceability to PRD, stories, or AC is the main deliverable
- `reporting-bugs` - when the task has shifted from planning to documenting a defect
- `auditing-accessibility` - when coverage needs a deeper accessibility pass instead of smoke checks
- `automation-backlog-planner` (agent, qa-core) - turns this plan into a prioritized automation backlog with per-item reasons
- `test-automation-expert` (agent, test-automation) - implements the automated part of the backlog across layers and frameworks
- `playwright-automation-engineer-ts` (agent, test-automation) - writes the Playwright TypeScript specs from the approved backlog

## Definition of Done

This skill is complete when:

- the requested artifact type is clear
- missing information is either answered or listed as assumptions
- high-risk flows have deeper coverage than low-risk flows
- each case or scenario has a stable ID
- the output can be executed or handed off without extra explanation
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
