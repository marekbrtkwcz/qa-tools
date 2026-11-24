---
name: defect-triage
description: 'Runs defect triage: classifies and prioritizes a batch of findings (severity, priority, category, affected area), decides fix now / fix in this release / defer / waive per defect, assigns owners, and records the decisions. Use when a pile of bugs needs ordering before a release, when severity labels are inconsistent, or when deferrals accumulate without owners.'
argument-hint: 'The list of open defects (tracker export or bug reports), the release/milestone in scope, and who attends triage'
user-invocable: true
---

# Defect Triage

Use this skill when findings exist but nobody has decided what happens to them. `reporting-bugs` produces one well-formed defect; this skill orders the batch and records one decision per defect. Untriaged defects are how releases ship with known blockers.

## When to Use

- before a release/milestone: order the open defect list
- severity labels are inconsistent across reporters
- deferrals pile up with no owner or date
- a defect is disputed (bug vs feature vs environment)

## Operating Principles

- **One decision per defect: fix now / this release / defer with date / waive with reason.** "Later" is not a decision.
- **Severity = impact if it ships; priority = when to fix.** They are different axes; record both.
- **Decide with the people who can act.** Dev, QA, PO/PM in the room; the decision and owner are recorded in the tracker, not in chat.
- **Waivers expire.** A deferred defect has an owner and a date; expired waivers are findings (`governing-quality-waivers`).
- **Magnitude in countable units.** "5 defects in checkout" beats "a few issues".

## Workflow

### Phase 1: Normalize the input

- collect open defects with status, area, reporter; dedupe (`reporting-bugs` quality input)
- verify each is reproducible or mark it as such — non-reproducible still gets a decision

### Phase 2: Classify

Work through `./resources/triage-checklist.md`:

- severity per impact (blocker/critical/major/minor/trivial) with the reasoning
- category: functional, UI, performance, security, data, environment
- affected area and blast radius (`analyzing-regression-scope` for code-linked defects)

### Phase 3: Decide and assign

- per defect: decision, owner, target (milestone/date), and for waivers the reason + expiry
- security defects follow the disclosure path (`testing-application-security`), not the public tracker

### Phase 4: Record and follow up

- decisions in the tracker with date and attendees; summary to stakeholders (`communicating-quality-findings`)
- re-triage on scope change; expired deferrals surface automatically

## Resource Map

- `./resources/triage-checklist.md` - severity scale, decision options, and the per-defect record. Read during Phases 2–3.

## Related Skills

- `reporting-bugs` - producing the well-formed defects that enter triage
- `governing-quality-waivers` - dated, expiring waivers for deferred items
- `communicating-quality-findings` - the stakeholder summary of triage output
- `assessing-release-readiness` - the open-defect profile feeds go/no-go
- `analyzing-regression-scope` - blast radius per defect

## Definition of Done

This skill is complete when:

- every open defect has severity, priority, category, one decision, an owner, and a date
- waivers/deferrals carry reasons and expiry dates
- decisions are recorded in the tracker with date and attendees
- the triage summary was communicated and expired deferrals are tracked
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

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
