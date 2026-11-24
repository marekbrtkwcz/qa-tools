---
name: usability-quick-pass
description: 'Runs a short heuristic usability pass over one flow or screen: learnability, efficiency, guidance, error recovery, consistency, terminology, escape routes - one tester, no lab equipment, no test users. Returns friction findings ranked by how many users they block, phrased as observable behaviors with evidence and questions for the product owner. Use when a UI feature is about to ship with no UX review, when exploratory notes keep mentioning confusion or dead ends, or when a fast is-this-usable check is wanted that is deliberately not an accessibility audit. For WCAG conformance use auditing-accessibility; for functional coverage use planning-exploratory-testing.'
argument-hint: 'The flow or screen to pass over, the persona to run it as, and the timebox available'
user-invocable: true
---

# Usability Quick Pass

Use this skill to find the usability problems that block or slow real users, in about an hour, before a feature ships - and to phrase them so a product owner can act on them.

Scope honesty first: a heuristic pass by one tester is not UX research. It reliably finds blockers, friction, and dead ends (things a careful stranger trips over); it does not discover preferences, taste, or what users actually want. Findings that need opinions go to UX as questions, not verdicts.

## When to Use

- A UI feature is about to ship with no UX review
- Exploratory notes keep mentioning confusion or dead ends
- A fast is-this-usable check is wanted that is deliberately not an accessibility audit
- One flow or screen needs a heuristic pass in about an hour

## When NOT to Use

- WCAG/accessibility conformance (keyboard, screen reader, contrast) - `auditing-accessibility`.
- Functional correctness or coverage - `planning-exploratory-testing`; this pass deliberately assumes the feature works and asks whether it can be used.
- Deep UX research, card sorting, user interviews - out of skill scope; schedule real research.
- Visual regressions of existing screens - `running-visual-regression-tests`.

## Procedure

### 1. Frame the pass

- Name **one flow** end to end (e.g. "new user creates and shares their first board"), not "the app".
- Name the **persona**: new user (no context), returning occasional user, or admin. The heuristics hit differently per persona; run one at a time.
- Set the **timebox**: 60-90 minutes for one flow and persona. A heuristic pass that stretches into a day has stopped being a quick pass.
- Fresh eyes discipline: run the pass before re-reading your own functional test notes; testers who just wrote the tests cannot see the confusion they normalized.

### 2. Run the flow against the seven heuristics

Work through the flow as the persona would, keeping the heuristics as a mental checklist, and note every hit with a timestamp:

1. **Learnability** - could a first-time user finish without asking anyone? Which step needed knowledge the product did not provide?
2. **Efficiency** - where does the flow demand more actions than the task warrants (redundant fields, repeated confirmation, hunt-and-click for the obvious next step)?
3. **Guidance and feedback** - is every wait visible? Does the user know what happened after each action? Silent success is a finding too.
4. **Error prevention** - which mistakes does the UI let users make that it could have prevented (wrong format accepted, destructive action one click away with no context)?
5. **Error recovery** - when something fails, does the message name the problem, the likely cause, and the next step - or just an error code and a dead end?
6. **Consistency and terminology** - same thing called different names in different places; same action, different control; same control, different meaning.
7. **Escape routes** - can the user always get back, undo, cancel, or leave without losing work? A dead end or a modal with no exit is a blocker-class finding.

### 3. Record findings as behaviors, not opinions

Each finding is one sentence an observer could verify, with evidence:

- ❌ Blocker - the persona cannot finish the flow, or cannot escape a wrong path; evidence: screen + the exact step where the persona gave up
- ⚠️ Friction - finishable, but slower or more error-prone than it should be; evidence: the extra actions counted ("4 clicks plus 2 page reloads for the one step")
- Cosmetic - visible but does not cost the user action-effort or the ability to continue; evidence: screen

Phrase findings as behavior, not aesthetics: not "the button is ugly", but "destructive delete has no confirmation and sits beside the edit action - one mis-click loses work". Not "confusing" but "after saving, the flow shows no success state, so the persona re-clicked save twice".

### 4. Rank and deliver

Order by what it costs: blockers first, then friction ranked by how many personas hit it, then cosmetics. For each finding, either file it (`reporting-bugs` when it is arguably a defect, e.g. a dead-end modal) or hand the product owner a phrased question:

> "After adding an item, the flow returns to an empty state - the persona did not know the item saved. Is silent success intended? If not, a toast or updated list would resolve it."

Three or more blockers on one flow stops the pass early: report now, let the product decide whether the flow ships - do not keep cataloguing friction on top of a broken flow.

### 5. Report

A one-screen report (template below) is the deliverable: counts by severity, then the findings in order, then what to ask UX vs. file, then the pass boundaries (which persona, which flow, timebox kept or not). Follow `communicating-quality-findings`: blockers in the first lines, the long table in the file.

## Report template

```markdown
# Usability quick pass: <flow> as <persona>
Date: <date>   Timebox: <kept / overran because...>   Screens: <links>

## Verdict line
<N> blockers - the flow should not ship before these are resolved.

## Blockers (❌)
- <step / screen> - <observable behavior> - evidence: <screen> - ask: <question for PO>

## Friction (⚠️)
- ...

## Cosmetic
- ...

## Out of scope / follow-ups for UX research
- ...
```

## Decision Rules

**Prefer a second persona run when:** the first persona hit no blockers but flow time was dominated by decisions the second persona would make differently (admin vs. first-timer); otherwise one persona, one verdict.

**Prefer filing a bug over a UX question when:** the finding matches a defect class - dead end, data loss risk, silent failure - regardless of design intent; intent discussions slow down defect classes.

**Prefer asking UX when:** the fix is a design trade-off; the finding then ships as a question with evidence, not as a design order; spec-like UX directives from testers get overwritten by designers and rightly so.

**Write friction as direct observation when:** nobody can dispute it ("4 clicks, 2 reloads, 1 field hunted in a menu"); argumentative ones die on sight.

**When the timebox runs out:** stop, list the remaining candidate areas as follow-ups in the report, and say what matters most that was not covered. A pass that stops at its timebox and maps what is missing is worth more than one that quietly overruns and never reports its edges.

## Related Skills

- `planning-exploratory-testing` - the functional counterpart; run it first, this pass second, with fresh eyes
- `auditing-accessibility` - the conformance deep-dive this pass deliberately does not replace
- `reporting-bugs` - for defect-class findings
- `communicating-quality-findings` - delivery shape
- `prd-generator` / `review-requirements` - where a blocker means the requirement itself was silent about the UX expect

## Definition of Done

- [ ] Flow and persona named; timebox kept or overrun stated
- [ ] Every finding recorded as an observable behavior with evidence and a severity
- [ ] Findings ordered blockers → friction → cosmetic, each with an owner-side question or bug
- [ ] Findings that are design trade-offs phrased as questions for the product owner, not directives
- [ ] One-screen report exists and states what was not covered

## Example prompts

- `/usability-quick-pass run a pass over the new-user onboarding flow as a first-time user`
- `/usability-quick-pass the checkout redesign ships Friday - check if a stranger can finish it`
- `/usability-quick-pass turn yesterday's exploratory confusion notes into a ranked usability report`
- `/usability-quick-pass admin panel as occasional-admin, 60 minutes, focus error recovery`
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
