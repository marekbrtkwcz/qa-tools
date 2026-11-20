---
name: attesting-manual-verification
description: 'Records human verification — code review, exploratory sessions, UAT, accessibility passes, UX and observability reviews — as dated, attributed attestations in a register, so human-centric practices stay in the quality contract without pretending to be automated checks. Use when recording that a manual pass was done, by whom and against which build, as sign-off evidence, when sign-off evidence is scattered across chats and tickets, when a gap matrix must distinguish "attested" from "passed", or when an audit asks who verified what and when. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# ✍️ Attesting Manual Verification

Some practices have no signal. No tool can prove a human explored the product, that a business owner accepted the feature, that a screen reader user completed the flow, or that a reviewer understood the change. Two bad things happen as a result: the practice gets dropped from the contract because it cannot be automated, or a tool-shaped proxy gets reported as a pass — branch protection counted as "code review done".

An attestation is the honest third option: **a dated, attributed statement that a named human verified something, with the evidence attached.** It is weaker than a machine check and stronger than an assumption — and it must never be presented as either.

## 🎯 When to Use

- a quality contract contains `manual-attestation` practices: code review, exploratory testing, UAT, manual accessibility, UX review, observability readiness, groundedness review (see the `quality-governance` knowledge entry)
- a gap matrix shows a human practice whose honest state is neither PRESENT nor MISSING
- release sign-off evidence lives in chat threads and closed tickets
- an audit or handover asks who verified what, against which build
- a team wants credit for real manual work that no tool can see

## 🧭 Operating Principles

- **An attestation names a person, not a process.** "Reviewed by @maria on 2026-08-19" is an attestation. "We do code review" is a policy.
- **It is scoped to a build or change range.** An attestation with no scope drifts forward forever and quietly covers work nobody looked at.
- **Evidence, or it is an opinion.** Session notes, a charter, a recording, a defect list, a sign-off message. A link is fine; nothing is not.
- **Never derive an attestation from tooling.** Branch protection requiring one approval is evidence of a *process*, not of a specific change being understood.
- **Absence is a state, not a failure.** "Unattested" is reportable and honest — not the same as "not done", and not a blocker unless the contract says so.
- **Findings from an attested practice cap below blocking.** A gate that blocks on an unprovable property gets switched off, and then nothing is recorded at all.
- **Attest before merge, not after release.** An attestation collected at sign-off time is a memory exercise.
- **An expired attestation is unattested.** A UAT sign-off from three releases ago does not cover this build.

## 🔄 Workflow

### Phase 1: Identify what needs attesting

From the quality contract, list every practice whose verification type is `manual-attestation`. For each, establish before anybody signs anything:

- **What counts as done** — the exit criterion, in words a verifier can act on
- **Who can attest** — a role, then a name. A tester attests exploratory testing; a business owner attests UAT; the author cannot attest their own review
- **What scope one attestation covers** — a release, a feature, a change range, a specific flow

### Phase 2: Do the work, then record it

The attestation is the *record*, never the work. Run the practice with its own skill (`test-planning` for exploratory charters, `accessibility-testing` for a11y passes, `requirements-traceability` for acceptance evidence, `qa-best-practices` for review), then record the outcome.

Every entry carries:

| Field | Rule |
| --- | --- |
| `practice` | the contract practice name, not free text |
| `scope` | build, version, or commit range — never "current" |
| `attested_by` | a named person, not a team alias |
| `date` | when the verification happened, not when it was typed up |
| `evidence` | link or path to notes, charters, defect lists, recordings |
| `outcome` | what was found, including "nothing" — an empty finding list is a result |
| `limitations` | what this verification did **not** cover |
| `expires` | next build, next release, or a date |

`limitations` is what makes an attestation trustworthy: "Explored checkout on Chrome desktop only; no mobile, no Safari, no guest flow" tells a release manager exactly how much weight the record carries.

### Phase 3: Record it where it survives

Two mechanisms, and they compose:

- **A register file** — `.qa/attestations.md`, next to the quality contract. Best for release-scoped practices (UAT, exploratory sessions, accessibility passes, observability reviews). Optional machine-readable copy under `attestations:` in the contract YAML if gate tooling reads it.
- **A commit trailer** — `Comprehension-Attested-by: <name>` for change-scoped attestation of understanding, read from `git log`. Travels with the change.

Never use a PR comment as the record: squash-merge discards it.

Register shape (worked example):

```markdown
# Attestation Register — <project>
**Current scope:** release 2026.08 (build `a3f91c2`)

| Practice | Scope | Attested by | Date | Outcome | Limitations | Expires | State |
|---|---|---|---|---|---|---|---|
| `exploratory-testing` | build `a3f91c2` | @piotr | 2026-08-19 | 3 defects (QA-441/442/443) | Chrome desktop only; no mobile/Safari/guest | next release | ATTESTED |
| `manual-accessibility` | checkout flow | @maria | 2026-07-02 | 1 AA contrast issue open | Keyboard+NVDA only; no VoiceOver | release 2026.07 | **STALE** |
| `code-review` | merged PRs | — | — | — | branch protection is a process, not a record | — | UNATTESTED |
```

### Phase 4: Report the state

In the gap matrix, a `manual-attestation` practice has three honest states:

| State | Meaning |
| --- | --- |
| **ATTESTED** | a valid, in-scope, unexpired attestation exists — cite it |
| **UNATTESTED** | the practice is contracted, no record covers this scope |
| **STALE** | a record exists but its scope or expiry has passed |

Never PRESENT, never PASSED — those words imply a machine verdict this practice cannot produce. For release decisions, list explicitly which contracted human practices have no record at all; that list is usually the most useful sentence in a go/no-go pack.

## ⚠️ Common Failure Modes

Deriving attestation from tooling (branch protection ≠ review done); team-alias attestation ("@qa-team verified" means nobody did); unscoped records; no limitations field (a partial check becomes an implied full one); attesting at sign-off time; self-attestation on review; blocking on unattested work (the register empties within a month); a register nobody reads — attestations need a consumer (release pack, gap matrix).

## ✅ Definition of Done

- every `manual-attestation` practice in the contract has a stated exit criterion, an eligible attester role, and a scope unit
- each record names a person, a scope, a date, evidence, an outcome, limitations, and an expiry
- no attestation has been derived from tooling or from the existence of a process
- the gap matrix reports ATTESTED / UNATTESTED / STALE, never PRESENT or PASSED
- unattested contracted practices are listed explicitly for the release decision
- findings from unattested work are capped below blocking, and that ceiling is stated

## 🔗 Related Skills

- `quality-gates` + `quality-governance` knowledge — where practices are marked `manual-attestation` and waivers live (a human practice that will not happen at all is a waiver, not an absent attestation)
- `test-planning` — exploratory charters to do the work this skill records
- `accessibility-testing` — manual a11y passes
- `requirements-traceability` — acceptance-criteria evidence a UAT attestation points at
- `qa-best-practices` — code review of tests and code
