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

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
