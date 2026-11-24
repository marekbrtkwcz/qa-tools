---
name: checklist-based-testing
description: 'Designs and runs checklist-based testing: focused checklists per area (forms, navigation, errors, permissions, performance-feel) executed against a feature or release, with pass/fail/notes per item and a summary. Use when repeatable coverage of standard concerns is needed faster than full scenario design, when onboarding testers to an area, or when a regression pass needs breadth over depth.'
argument-hint: 'The area or feature to check, the checklists to use or adapt, and the build/environment under test'
user-invocable: true
---

# Checklist-Based Testing

Use this skill when breadth over a known set of standard concerns beats deep scenario design. A checklist encodes experience ("every form: empty submit, invalid input, back-button, double-submit") so it is not re-derived per tester. It complements scenario-based testing (`designing-functional-tests`), it does not replace it for novel features.

## When to Use

- regression passes over a stable feature where the risks are known
- onboarding: a new tester runs the area checklist and learns the concerns
- release passes where time is short and coverage must be broad (`manual-release-testing`)
- after a fix in an area, run that area's checklist

## Operating Principles

- **Checklists are living documents.** Every defect found becomes a checklist item; items that never fail get retired.
- **Every item is checkable, not a topic.** "Form validation" is a topic; "submit empty required field → inline error, no request sent" is an item.
- **Notes beat checkboxes.** A pass with no note proves little; require a one-line observation or evidence per item.
- **Checklists per area, not one giant list.** Forms, navigation, errors, permissions, uploads, exports each get their own.

## Workflow

### Phase 1: Pick or build the checklists

- reuse `./resources/checklist-library.md` templates (forms, navigation, errors, permissions, files, performance-feel), adapt to the product
- record which checklist version ran against which build

### Phase 2: Execute

- run each item on the build under test; record pass / fail / blocked / N-A plus a note or evidence (screenshot, log line)
- a fail becomes a defect via `reporting-bugs` with the checklist item referenced

### Phase 3: Summarize and feed back

- summary: items run, pass rate, defects filed, areas with most failures
- add every new defect's root concern as a checklist item; retire dead items
- feed recurring failure areas into `designing-functional-tests` as scenarios

## Resource Map

- `./resources/checklist-library.md` - starter checklists per area. Read during Phase 1.

## Related Skills

- `designing-functional-tests` - scenario-based design for novel or risky features
- `manual-release-testing` - the release pass that uses checklists
- `planning-exploratory-testing` - chartered exploration on top of checklist coverage
- `reporting-bugs` - filing the defects found

## Definition of Done

This skill is complete when:

- area checklists exist, are versioned, and every item is a checkable statement
- each execution recorded pass/fail/notes per item against a named build
- defects found were filed with the checklist item referenced
- the library was updated: new items added from defects, dead items retired
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
