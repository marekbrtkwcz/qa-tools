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
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
