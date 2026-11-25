---
name: attesting-manual-verification
description: 'Records human verification - code review, exploratory sessions, UAT, accessibility passes, UX and observability reviews - as dated, attributed attestations in a register, so human-centric practices stay in the quality contract without pretending to be automated checks. Use when recording that a manual pass was done, by whom and when, as sign-off evidence, when a strategy requires verification no tool can prove, when sign-off evidence is scattered across chats and tickets, when a gap matrix needs to distinguish "attested" from "passed", or when an audit asks who verified what and when.'
argument-hint: 'The practice verified, who verified it, against which build or scope, what the evidence is, and where the register lives'
user-invocable: true
---

# Attesting Manual Verification

Use this skill when a quality practice can only be verified by a person, and the record of that verification needs to be worth something later.

Some practices have no signal. No tool can prove a human explored the product, that a business owner accepted the feature, that a screen reader user could complete the flow, or that a reviewer understood the change. Two bad things happen as a result: the practice gets dropped from the contract because it cannot be automated, or a tool-shaped proxy gets reported as a pass - branch protection counted as "code review done".

An attestation is the honest third option: **a dated, attributed statement that a named human verified something, with the evidence attached.** It is weaker than a machine check and stronger than an assumption, and it must never be presented as either.

## When to Use

- a contract contains `manual-attestation` practices: code review, exploratory testing, UAT, manual accessibility, UX review, observability readiness, groundedness review
- a gap matrix shows a human practice and the honest state is neither PRESENT nor MISSING
- release sign-off evidence lives in chat threads and closed tickets
- an audit or handover asks who verified what, against which build
- a team wants credit for real manual work that no tool can see

## Operating Principles

- **An attestation names a person, not a process.** "Reviewed by @maria on 2026-08-19" is an attestation. "We do code review" is a policy.
- **It is scoped to a build or a change range.** An attestation with no scope drifts forward forever and quietly covers work nobody looked at.
- **Evidence, or it is an opinion.** Session notes, a charter, a recording, a defect list, a screenshot set, a sign-off message. A link is fine; nothing is not.
- **Never derive an attestation from tooling.** Branch protection requiring one approval is evidence of a *process*, not of a specific change being understood. Deriving one is the failure mode this practice exists to prevent.
- **Absence is a state, not a failure.** "Unattested" is reportable and honest. It is not the same as "not done", and it is not a blocker unless the contract says so.
- **Findings from an attested practice cap below blocking.** Unattested high-risk work is worth a nudge, not a red build - a gate that blocks on an unprovable property gets switched off, and then nothing is recorded at all.
- **Attest before merge, not after release.** An attestation collected at sign-off time is a memory exercise.
- **An expired attestation is unattested.** A UAT sign-off from three releases ago does not cover this build.

## Workflow

### Phase 1: Identify what needs attesting

From the quality contract, list every practice whose verification type is `manual-attestation`. Typically: `code-review`, `exploratory-testing`, `manual-accessibility`, `uat`, `ux-review`, `observability-readiness`, `groundedness-review`.

For each, establish three things before anybody signs anything:

- **What counts as done** - the exit criterion from the contract, in words a verifier can act on
- **Who can attest** - a role, then a name. A tester attests exploratory testing; a business owner attests UAT; the developer who wrote the change cannot attest their own review
- **What scope one attestation covers** - a release, a feature, a change range, a specific flow

### Phase 2: Do the work, then record it

The attestation is the *record*, never the work. Run the actual practice with its own skill - `planning-exploratory-testing`, `auditing-accessibility`, `code-review-advanced`, `verifying-acceptance-criteria` - then record the outcome.

Use `./resources/attestation-register.md`. Every entry carries:

| Field | Rule |
| --- | --- |
| `practice` | the contract practice name, not free text |
| `scope` | build, version, or commit range - never "current" |
| `attested_by` | a named person, not a team alias |
| `date` | when the verification happened, not when it was typed up |
| `evidence` | a link or path to notes, charters, defect lists, recordings |
| `outcome` | what was found, including "nothing" - an empty finding list is a result |
| `limitations` | what this verification did **not** cover |
| `expires` | the next build, the next release, or a date |

`limitations` is the field that makes an attestation trustworthy. "Explored checkout on Chrome desktop only; no mobile, no Safari, no guest flow" tells a release manager exactly how much weight the record carries. Without it, every attestation reads as total coverage.

### Phase 3: Record it where it survives

Two mechanisms, and they compose:

**A register file** - `.qa/attestations.md`, next to the contract. Best for release-scoped practices: UAT, exploratory sessions, accessibility passes, observability reviews.

**A commit trailer** - `Comprehension-Attested-by: <name>` for change-scoped attestation of understanding, read from `git log`. Best for per-change records, because it travels with the change. Grammar in `commit-trailers.instructions.md`.

Do not use a PR comment as the record: squash-merge discards it and reviews get deleted.

### Phase 4: Report the state

In the gap matrix, a `manual-attestation` practice has three honest states:

| State | Meaning |
| --- | --- |
| **ATTESTED** | a valid, in-scope, unexpired attestation exists - cite it |
| **UNATTESTED** | the practice is contracted, no record covers this scope |
| **STALE** | a record exists but its scope or expiry has passed |

Never PRESENT, never PASSED. Those words imply a machine verdict this practice cannot produce.

Report alongside: who attested, against what scope, the stated limitations, and - for release decisions - which contracted human practices have no record at all. That last list is usually the most useful sentence in a go/no-go pack.

## Common Failure Modes

- **Deriving attestation from tooling.** Branch protection reported as code review done; a merged PR reported as reviewed. The most common and most misleading error.
- **Team-alias attestation.** "@qa-team verified" means nobody did.
- **Unscoped records.** An attestation with no build or range silently covers everything that came after.
- **No limitations field.** Turns a partial check into an implied full one.
- **Attesting at sign-off.** Reconstructing a week later produces a record of what people remember, not what happened.
- **Self-attestation on review.** The author cannot attest their own change was reviewed.
- **Blocking on unattested work.** Makes the practice a bureaucratic obstacle, and the register empties out within a month.
- **A register nobody reads.** Attestations need a consumer - the release pack or the gap matrix - or they become filing for its own sake.

## Resource Map

- `./resources/attestation-register.md` - the register format, worked entries per practice, expiry and staleness rules, and how attestations feed a release pack

## Related Skills

- `deriving-a-quality-contract` - where practices are marked `manual-attestation` and their exit criteria are set
- `planning-exploratory-testing` - do the exploratory work; this skill records it
- `auditing-accessibility` - do the accessibility pass; this skill records it
- `verifying-acceptance-criteria` - the evidence a UAT attestation points at
- `code-review-advanced` - the review whose outcome gets attested
- `assessing-comprehension-debt` - uses per-change attestation as one of its inputs
- `assessing-release-readiness` - consumes the register as release evidence
- `governing-quality-waivers` - when a human practice will not happen at all, that is a waiver, not an absent attestation

## Definition of Done

This skill is complete when:

- every `manual-attestation` practice in the contract has a stated exit criterion, an eligible attester role, and a scope unit
- each record names a person, a scope, a date, evidence, an outcome, limitations, and an expiry
- no attestation has been derived from tooling or from the existence of a process
- the gap matrix reports ATTESTED / UNATTESTED / STALE, never PRESENT or PASSED
- unattested contracted practices are listed explicitly for the release decision
- findings from unattested work are capped below blocking, and that ceiling is stated
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
