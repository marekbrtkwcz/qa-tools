---
name: standardizing-test-records
description: 'Defines the organization-wide test record standard and brings existing records up to it: one invariants set per record type (test case, session, execution result, defect, attestation) covering stable IDs, mandatory fields, status vocabulary, and evidence rules; maps existing templates onto the invariants and audits a sample of live records. Use when test records drift between people or teams, a tracker import needs stable IDs, or per-team formats keep multiplying. Generating cases: manual-test-cases. Suite docs structure: documenting-test-suites.'
argument-hint: 'The organization scope (team, product, several teams) and the record types already in use'
user-invocable: true
---

# Standardizing Test Records

Use this skill when the way tests are written down has to be one thing instead of many: one definition of what a test case, a session, a result, a defect, and an attestation must contain - and a check that the records already written actually satisfy it.

The collection already carries per-activity templates (`manual-test-cases` table, session notes, release checklist, bug report, attestation register). This skill does not replace them; it defines the **invariants every record type must satisfy**, maps the existing templates onto them, audits a sample of live records, and publishes the result as one standard the next onboarding reads instead of asking five people.

## When to Use

- Test records drift between people or teams
- A tracker import needs stable IDs
- An audit asks what a record must contain
- Per-team formats keep multiplying

## When NOT to Use

- Generating new test cases in the established format - `manual-test-cases` and `designing-functional-tests`.
- Recording one manual pass as an attestation - `attesting-manual-verification`.
- Exporting results to a tracker - `test-management-integration` (this skill produces the stable IDs that export relies on).
- Deciding which practices the org commits to at all (testing strategy, gates) - `qa-strategy` / `deriving-a-quality-contract`; the record standard is the layer under those, saying how the resulting records are written.
- Documenting how to run a suite - `documenting-test-suites`.

## Procedure

### 1. Inventory what exists

Before defining anything, list what the org actually writes today:

- record types in use: test cases (spreadsheets? tracker? markdown?), exploratory session notes, execution results (CI reports, checklist files), defects, sign-offs
- per type: where it lives, who writes it, who reads it, and which fields it has today
- the last 10-20 records of each type (these become the audit sample in step 4) - old enough to show the drift, recent enough to still matter

Name the drift concretely: three case formats with different columns, IDs recycled after deletion, results recorded as "works" with no evidence, an attestation living in a chat message. The standard exists to kill named problems, not to standardize for its own sake.

### 2. Define the invariants

Write the invariants once, for every record type (the table below is the default; adapt the field lists, not the invariants):

| Invariant | Rule |
| --- | --- |
| Identity | Every record has one stable ID, never recycled, never renamed when moved between tools |
| Provenance | Author, date (ISO 8601), and what was tested: version/build/deployment id of the object under test |
| Traceability | Test case links to requirement/AC; result links to the case it executed; defect links to its evidence |
| Evidence | Results state facts with quoted evidence (output, log line, screenshot, step time), not adjectives ("works", "looks fine" fail this invariant by definition) |
| Status vocabulary | One shared dictionary (below); no local synonyms |
| Single source | One authoritative place per record type; copies elsewhere are pointers, not second records |
| Governance | Field and status changes go through the versioned standard document; temporary deviations through the waiver register, never silently |

### 3. Define the record types and their mandatory fields

Default per type - adjust names to the org, keep the mandatory fields:

- **TC (test case)**: id, area, title as behavior, priority, type, precondition, steps (imperative, one action per step), expected result, requirement link, automation-candidate flag. Source template: the `manual-test-cases` table.
- **SES (exploratory session)**: charter (Explore [x] with [y] to discover [z]), tester, date, timebox, build, environment, time split, chronological notes, debrief outcome. Source template: `planning-exploratory-testing`.
- **RES (execution result)**: id of the executed case/session, run date, environment, status + evidence, blocker reason when BLOCKED. Source: release checklist and CI reports.
- **BUG (defect)**: reproducible steps, actual vs expected, evidence quoted, severity, affected build. Source: `bug-report`.
- **ATT (attestation)**: who, what was verified, when, against which build - dated and attributable, or it does not exist. Source: `attesting-manual-verification`.

ID scheme: `<TYPE>-<AREA>-<sequence>` (e.g. `TC-CHCK-0147`, `SES-2025-11-12-02`, `RES-TC-CHCK-0147-RC4`). The type prefix makes an ID self-descriptive anywhere it appears, including pasted into a tracker or a chat.

### 4. Map existing templates onto the invariants

Build the conformance table: template row per record type, column per invariant, cell = satisfied / partially / missing, with the evidence quote for partial/missing cells. This is where the per-activity templates in this collection get asserted against the standard so they stay one system: session notes, checklists, and case tables either already satisfy the invariants or get one named gap each.

Only a template gap that costs someone something later deserves a change - a satisfied mapping is a stated fact (keep the table as evidence), not a rewrite invitation.

### 5. Audit the sample of live records

Take the step-1 sample and score each record against the invariants of its type. Report with denominators, per type:

```
TC:  17 checked - identity 15/17, evidence 9/17, traceability 11/17
RES: 22 checked - all with status, 6 without evidence, 2 with adjectives only
ATT:  4 of 4 dated and attributable
```

The audit result is the standard's justification paragraph: these numbers are why the org is standardizing.

### 6. Decide per gap: fix or waive

- template gap -> fix the template and record the change in the standard doc's changelog
- habitual gap (template fine, people drift) -> fix the checklist or the automation that lets the drift through; if the fix is not worth it now, a dated waiver in the `governing-quality-waivers` register, with an owner and an expiry
- no silent exceptions: a status name that persists after being removed from the vocabulary is exactly the kind of quiet drift this skill exists to prevent
- records containing personal data get classified and handled per `handling-sensitive-test-data` before any consolidation

### 7. Publish and govern

One page, one owner, versioned: `docs/test-record-standard.md` (or the tracker's own conventions page - one source, not both), containing: the invariants, the mandatory fields, the ID scheme, the status vocabulary, the source-template mapping, and a dated changelog. State who may change which section. Reference it from onboarding docs and from the suite's README; without this, a standard document is read once, rots, and drift returns within a release or two.

### 8. Verify

- a fresh record of each type created under the new standard passes all invariants - generate it with the source skill (e.g. `manual-test-cases`) and check it against the published fields
- a tracker import round-trip keeps IDs stable - run the `test-management-integration` preflight so any ID mangling shows up before the first real import, when it is still cheap
- repeat the audit on the sample from the next release: measure the movement, direction matters more than the absolute score (per `tracking-quality-trends`)

## Status vocabulary (default)

| Standard | Symbol | Meaning | Notes |
| --- | --- | --- | --- |
| PASS | ✅ | expected result observed, evidence captured | evidence is mandatory, not optional |
| FAIL | ❌ | expected result did not occur | defect follows (`reporting-bugs`) or explicit no-defect reason |
| BLOCKED | 🚧 | could not attempt or complete | names the blocker |
| SKIPPED | — | deliberately not run | a reason and owner are part of the record; unexplained skips are a silent-stop finding for `governing-quality-waivers` |

Synonyms ("done", "ok", "works on my machine", "green") are out of vocabulary - map them where they appear as a finding.

## Decision Rules

**Prefer invariants over one rigid template when:** several teams already keep different record types - invariants let each template stay natural to its activity, and force only what costs others later (identity, provenance, evidence, vocabulary).

**Prefer a tracker as the single source for cases and results when:** execution reports already leave traces a tracker can ingest; the alternative (repo files duplicated into a tracker) violates single-source and doubles the drift.

**Prefer repo files as the single source when:** sessions and checklists live with the code, are code-reviewed like code, and have no comparable tracker facility (session notes, release checklists).

**Recycle IDs never, even after deletion:** an ID that points to two different records over its lifetime makes old failures and attestations ambiguous - that breaks every later audit.

**Call it signed-off, not just published, when:** more than one team is affected - the standard's changelog carries the approving names and the date (one line per version).

## Related Skills

- `manual-test-cases`, `planning-exploratory-testing`, `manual-release-testing`, `bug-report` - the source templates this standard maps and keeps coherent
- `attesting-manual-verification` - the ATT record type
- `test-management-integration` - stable-ID export to Xray/TestRail/Jira
- `documenting-test-suites` - where the standard is referenced from a suite's README
- `governing-quality-waivers` - the only legal way to deviate
- `verify-acceptance-criteria` / `requirements-test-coverage-mapper` - the traceability lines the standard requires

## Definition of Done

- [ ] Inventory lists record types, storage, and the current drift, named concretely
- [ ] Invariants and mandatory fields published, one page, one owner, versioned, with changelog
- [ ] ID scheme defined and shown to survive a tracker round-trip
- [ ] Conformance table maps every existing template to the invariants, with evidence quotes for gaps
- [ ] Sample audit scored with denominators; every gap fixed or under a dated, owned waiver
- [ ] A fresh record of each type passes the published standard
- [ ] Follow-up audit date stated (drift returns; this skill is not one-shot)

## Example prompts

- `/standardizing-test-records our three teams write test cases in three different formats - make one standard`
- `/standardizing-test-records audit the last release's test records against our standard and report conformance`
- `/standardizing-test-records define the record standard before our first Xray import - we need stable IDs`
- `/standardizing-test-records map the session-notes and release-checklist templates onto the invariants`
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
