---
name: compatibility-matrix-testing
description: 'Designs and runs compatibility testing: builds the support matrix (browsers, OS, devices, screen sizes, assistive tech), reduces it to a testable subset by usage and risk, executes per cell, and reports coverage gaps. Use when a release must support a defined set of environments, when "works on my machine" bugs appear, or when the support policy changes.'
argument-hint: 'The officially supported environments (from the support policy), usage analytics if available, and the features in scope'
user-invocable: true
---

# Compatibility Matrix Testing

Use this skill when the product promises to work on a defined set of browsers, OSes, and devices and that promise needs testing. The matrix is usually too big to test fully — the skill is in reducing it defensibly, not in running everything.

## When to Use

- a release targets a support policy (browsers/OS/devices list)
- environment-specific bugs are reported ("works in Chrome, broken in Safari")
- the support policy changes (drop IE, add a browser/OS version)
- responsive/adaptive layout needs coverage across screen sizes

## Operating Principles

- **Reduce by usage and risk, not by gut.** Analytics + crash reports pick the cells; the support policy caps them.
- **One matrix per feature risk, not one giant matrix.** Core flows get the full matrix; low-risk features get the reduced one.
- **Test the seams where environments differ.** Rendering, input handling, storage, network, permissions — not just "page loads".
- **Record the matrix version per run.** "Tested on Chrome" is meaningless; "Chrome 126, Windows 11, 1920×1080" is a result.
- **Assistive tech is part of the matrix** where accessibility is promised (`auditing-accessibility` for the deep pass).

## Workflow

### Phase 1: Build the support matrix

- from the support policy: browsers + versions, OS + versions, devices, screen sizes, assistive tech
- overlay usage analytics and past defect hotspots
- produce the full matrix and mark the reduced (must-test) subset with the rule used

### Phase 2: Execute per cell

Work through `./resources/compatibility-checklist.md`:

- per critical flow × per must-test cell: flow completes, layout usable, no console errors
- environment-specific seams: file upload, date input, copy/paste, notifications, storage, printing
- record exact versions per run

### Phase 3: Report gaps

- coverage table: flows × cells, tested/untested; untested high-usage cells are called out as risk
- defects filed per environment (`reporting-bugs`) with the exact cell

### Phase 4: Maintain

- matrix updates on support-policy change; usage data refreshed quarterly
- CI runs the reduced matrix on every build (`automating-ci-test-pipelines`, device farm or browser stack)

## Resource Map

- `./resources/compatibility-checklist.md` - matrix template, reduction rules, per-cell checks. Read during Phases 1–2.

## Related Skills

- `auditing-accessibility` - assistive-tech deep pass
- `running-visual-regression-tests` / `visual-regression-mobile` - pixel-level per environment
- `testing-internationalization` - locale dimension of the same matrix
- `automating-ci-test-pipelines` - running the reduced matrix in CI
- `reporting-bugs` - environment-specific defects

## Definition of Done

This skill is complete when:

- the support matrix is built from the policy + usage, with the reduced subset and the reduction rule recorded
- must-test cells were executed per critical flow with exact versions recorded
- coverage gaps (untested high-usage cells) are reported as risk
- the reduced matrix runs in CI on every build
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
