---
name: assessing-comprehension-debt
description: 'Measures the risk that code shipped without anyone understanding it: a teach-back attestation on high-risk changes, a risk band from changed-code complexity, diff size and whether a human explanation accompanied it, and optional AI-authorship provenance. Findings stay advisory by design. Use when an AI-assisted codebase grows faster than the team reads it, when reviews are rubber-stamped, when nobody can explain a module that ships weekly, or when leadership asks how much of the code the team can actually maintain. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🧠 Assessing Comprehension Debt

Use this skill when code is arriving faster than anyone is reading it, and every other quality signal still looks fine.

Comprehension debt is the gap between the code that exists and the code the team actually understands. Tests pass, coverage holds, lint is clean — and nobody can explain why the pricing module works. When an agent writes the implementation *and* the tests, both signals go green without a single human forming a mental model. That is the debt this skill makes visible.

**It is advisory, permanently, on purpose.** Understanding lives in people's heads and cannot be proven by any signal. What can be measured is the *risk* of comprehension debt and the *absence of evidence* of understanding. A gate that claims to measure understanding is lying, and once someone notices, every finding it ever produced loses credibility.

## 🎯 When to Use

- an AI-assisted or agent-generated codebase is growing faster than the team reads it
- reviews are fast, approvals are frequent, and nobody asks questions
- a module ships weekly and no one volunteers to explain it
- a bus-factor conversation needs evidence instead of anecdote
- a quarterly quality review should cover more than test coverage
- onboarding is slow in a codebase that looks well-tested

## 🧭 Operating Principles

- **Never blocks.** Findings cap below the project's blocking threshold. State that ceiling in the report, every time.
- **Measure absence of evidence, not understanding.** Say it in those words. The band is a proxy; treat it as a prompt for a conversation, not a score.
- **The risk band is directional, not precise.** It says "this change is the shape of one nobody understands", not "nobody understands this change".
- **AI provenance is a signal, never a penalty.** The useful figure is AI-authored *and* unattested. AI-authored and well-understood is a good outcome, and if trailers are not in use the honest answer is "unknown".
- **A human explanation lowers the band.** An `Intent:` trailer or an ADR is evidence that somebody thought about it. That is exactly the behaviour to reward.
- **Teach-back beats approval.** "I approve" is a click. "I can explain what happens when the provider retries this webhook" is comprehension.
- **Never blame individuals.** A high band on a module is a system outcome: review load, delivery pressure, tooling. Naming people converts a useful signal into something nobody will run twice.
- **Trend over snapshot.** One reading is noise. Direction over a quarter is the finding.

## 🔄 Workflow

### Phase 1: Establish scope and whether provenance exists

Pick the range: a release, a quarter, a module's history. Then check what signals are available:

```bash
git log <range> --format='%h %an %s'
git log <range> --format='%(trailers:key=Intent,valueonly)'
git log <range> --format='%(trailers:key=Assisted-by,valueonly)'
git log <range> --format='%(trailers:key=Comprehension-Attested-by,valueonly)'
git log <range> --numstat
```

If `Assisted-by:` trailers are not in use, provenance is **unknown** — report it as unknown and move on. Do not infer AI authorship from commit size, style, or timing; those inferences are wrong often enough to poison the whole report.

### Phase 2: Compute the risk band per change or module

Three inputs (rubric below): **complexity added**, **size**, **explanation present**. Bands: **high** (large, branch-heavy, no explanation), **medium** (one of the three), **low** (small, or well explained, or both).

A high band means: *if nobody understands this, we would not be able to tell.* That is all it means, and saying so plainly is what keeps the metric usable.

### Phase 3: Check teach-back attestation on high-risk surface

For changes on high-risk surface (see `recording-change-intent` rules), look for a record that a named human can explain it:

- a `Comprehension-Attested-by: <name>` trailer, author-side or reviewer-side
- an entry in the attestation register (`attesting-manual-verification`)

Status is **FULL** (attested), **NONE** (high-risk surface, no record), or **N/A** (not high-risk surface).

Where a record is missing and it matters, run the teach-back (protocol below): four questions, ten minutes, and the answers tell you more than the band ever will. The protocol's value is not the record — it is that the conversation happens.

### Phase 4: Report the picture

- **Risk bands** by module, with the inputs that produced each one
- **Attestation status** on high-risk surface, and the specific changes with none
- **Provenance**, if known: AI-authored share, and the share that is AI-authored and unattested
- **Trend** against the previous assessment, per module
- **Concentration** — comprehension debt clusters. A module where one person authored everything and nobody reviewed it is the finding, regardless of any band
- **The ceiling**, stated explicitly: these findings are advisory and do not fail the build

Then the only recommendations worth making: which specific modules deserve a teach-back session, which deserve a walkthrough written down, and which deserve a second pair of eyes on the next change.

## 📏 Risk Band Rubric

The band answers one question: **if nobody understood this change, would we be able to tell?** It is a proxy for the absence of evidence, not a measurement of understanding.

### Input 1 — complexity added

Measured on the changed code only, not the whole file.

| Signal | How to get it |
| --- | --- |
| New branches | count added `if`, `else if`, `switch` cases, ternaries, `&&`/`||` short-circuits, `catch`, loop conditions in the diff |
| Nesting depth | deepest new nesting level introduced |
| New cross-module calls | added imports and calls reaching outside the module |
| New async paths | added `await`, promise chains, event handlers, retries |
| New state | added mutable module-level or shared state |

Bands: **high** ≥ 8 new branches, or depth ≥ 4, or ≥ 5 new cross-module calls. **medium** 3–7 new branches. **low** ≤ 2.

`eslint-plugin-sonarjs` cognitive complexity gives a comparable per-function number if already configured; use it in preference to counting by hand, and record which method you used.

### Input 2 — size and reviewability

| Signal | high | medium | low |
| --- | --- | --- | --- |
| Changed lines | > 400 | 100–400 | < 100 |
| Files touched | > 15 | 5–15 | < 5 |
| Commit shape | one bulk commit | a few commits | a reviewable sequence with messages |
| Mixed concerns | refactor + feature + fix together | two of three | one concern |

Size matters because review attention does not scale with diff length. Past a few hundred lines, review becomes sampling — and a bulk commit removes even the sequence a reader could have followed.

Exclusions: generated code, lockfiles, snapshots, formatting-only changes, pure renames. A 3,000-line codegen diff is not a comprehension risk. Say what you excluded.

### Input 3 — explanation present

| Evidence | Weight |
| --- | --- |
| `Intent:` trailer naming a constraint and a rejected alternative | strong |
| `Intent-Ref:` to an ADR that discusses alternatives | strong |
| Module intent register entry covering the paths | strong |
| Substantive review discussion — questions asked and answered | moderate |
| Commit body explaining why, beyond restating the diff | moderate |
| Ticket reference only | weak |
| Nothing, or a restated diff | none |

A restated diff counts as **none**. `Intent: refactored pricing for maintainability` is filler, and treating it as explanation is how the band gets gamed.

### Combining

| Complexity | Size | Explanation | Band |
| --- | --- | --- | --- |
| high | high | none | **high** |
| high | any | none/weak | **high** |
| any | high | none | **high** |
| high | high | strong | **medium** — explained, but still a lot to hold |
| medium | medium | none | **medium** |
| high | low | strong | **low** |
| low | low | any | **low** |

Rule of thumb: two of three inputs at high, or complexity high with no explanation, gives a high band. A strong explanation moves any change down one band — which is the incentive you want.

### Worked examples

- **High band.** 640 changed lines across 18 files, one commit, `refactor: tidy up billing`, 14 new branches including three new error paths, no `Intent:` trailer. Nothing here is necessarily wrong — but if nobody understood it, no signal in the repo would say so.
- **Medium band.** 220 lines, 6 files, three commits with real messages, 5 new branches, commit body explains the constraint but names no alternative.
- **Low band.** 45 lines, 2 files, one new branch, `Intent:` trailer naming the provider's retry behaviour and the rejected queue-based approach. Small, explained, and the explanation would let a stranger change it safely.
- **False positive.** 500 lines adding 40 near-identical test cases from a table. Band says high, reality is a repetitive, obvious diff. Check before acting; note it and move on.

### Known false positives

Check these before reporting a high band: table-driven tests and fixtures, config and IaC changes, mechanical migrations (codemods), bulk renames, extracted code (moving a function raises cross-module call counts without adding anything new to understand). Each is a case where the proxy diverges from the thing. Naming the divergence in the report is what earns the metric its credibility.

### Concentration — the finding that matters more than the band

Bands describe changes. Comprehension debt lives in **modules**, and it concentrates. For each module, compute:

- distinct authors in the last 90 days — `1` is a bus-factor finding on its own
- distinct reviewers — `0` or `1` matters more than any band
- share of changes with a high band
- whether any teach-back record exists
- date of the last change by someone other than the primary author

```
src/billing/reconciliation/
  authors 1 (@maria)   reviewers 1 (@lead, avg 4 min to approve)
  high-band changes 7/9    teach-back records 0
  last change by anyone else: never
  → highest comprehension risk in the repo, regardless of individual bands
```

That block is more actionable than any per-change band, and it is the one leadership actually responds to. It also most needs the no-blame framing: single-author modules are a staffing and review-load outcome, not a personal failing.

### AI provenance, if available

Only when `Assisted-by:` trailers are in consistent use:

| Figure | Meaning |
| --- | --- |
| AI-authored share | context, not a finding |
| AI-authored **and** unattested share | the useful number |
| AI-authored with high band and no explanation | the specific stack to look at |

Never infer provenance from diff size, phrasing, or commit timing. Wrong often, and once people notice you are guessing, the trailer stops being used and the honest signal is gone. Report absence as `unknown` — not `0%`, not "no AI use".

## 🗣️ Teach-Back Protocol

Ten minutes, four questions, one person explaining a change to another. The record is a by-product; the conversation is the point.

### When to run one

- a change on high-risk surface with a **high** band and no explanation
- a module with one author and no substantive reviewer
- before a primary author goes on leave or leaves the team
- when a reviewer notices they approved something they could not now describe
- on any change an agent wrote end to end, where nobody has yet formed a mental model

Not on every change. A teach-back on a two-line fix teaches nothing and turns the practice into a ritual.

### The four questions

Ask them in order. Each probes a different kind of understanding; the second is where most sessions actually land.

1. **What does this change do, in your own words?** Not the commit message — the behaviour, from the outside, as a user or caller would see it. Strong: "A support agent can now refund part of a settled order." Weak: "It adds a partial refund endpoint" (restates the diff).
2. **Why is it shaped this way rather than the obvious way?** The constraint question — the one that separates understanding from familiarity, and the one an agent cannot answer for you. Weak answer that most often reveals real debt: "That's how the existing code does it." Worth writing down verbatim.
3. **What breaks if it goes wrong, and how would we find out?** Failure modes and detectability. Weak: "The tests would fail" — tests catch what was anticipated, the class of failure least likely to be the problem.
4. **What would you tell someone about to change this?** The maintainer question — surfaces tacit knowledge that never reaches a comment. Weak: "Read the code."

### Running the session

- **Two people, ten minutes, no slides.** Author explains, second person asks. Voice or in person; asynchronous text loses the follow-up question, which is where the value is.
- **The listener's job is to ask "why" once more than is comfortable.** Not to check answers against a key.
- **A gap found is a success, not a failure.** Half the value is the author discovering mid-sentence that they do not know why something is the way it is.
- **The reviewer can be the attester.** Reviewer-side attestation ("I can explain this change") is often more valuable than author-side, because it proves the knowledge moved.

### Recording the outcome

The record is short and honest — a `Comprehension-Attested-by: @tomek` trailer, or in the attestation register (`attesting-manual-verification`):

```yaml
- practice: comprehension-attestation
  scope: 'a3f91c2..HEAD (src/billing/refunds/**)'
  attested_by: '@tomek'
  date: 2026-08-21
  outcome: >-
    Can explain behaviour, the idempotency constraint and the failure mode.
    Gap found: no alert on refund totals - raised as OPS-77.
  limitations: 'Covers the refund path only, not the reconciliation job it feeds.'
  expires: scope-change
```

Rules:

- **Record the gaps found.** A session that found two gaps is more valuable than one that found none.
- **Never record a session that did not happen.** A fabricated attestation is worse than an unattested change — it removes the signal *and* adds a false one.
- **The attester is a person who can be asked questions later.** That is the entire mechanism.
- **`expires: scope-change`** is usually right — understanding of a module does not survive the module being rewritten.

### What follows a weak session

Not a red build. One of these, chosen deliberately: write the shape into the module intent register (`recording-change-intent`); an observability item for undetectable failure modes (probably the highest-value output of a teach-back); a second pair of eyes on the next change to that module; a refactor candidate if the code is genuinely hard to follow; `documenting-test-suites` if the suite is unusable by anyone else. Teach-back sessions most often produce **observability and documentation** work, not test work — a legitimate result no test-focused metric would ever surface.

### Anti-patterns

- **Making it an exam.** The listener is not grading; the moment it feels like assessment, answers become defensive and the signal is gone.
- **Running it after release.** Comprehension debt is cheapest to pay before merge, while the author still has the context.
- **Attesting your own work by default.** Author-side attestation records intent; reviewer-side proves the knowledge transferred.
- **Recording an attestation without the session.** The one failure that makes the whole practice worthless.
- **Skipping the record.** Then the next assessment cannot tell a well-understood module from an unexamined one.

## 🚫 What This Skill Cannot Do

Worth stating in the report, because the temptation to over-read the number is strong:

- It cannot tell you whether a person understands code. Only whether evidence exists.
- It cannot distinguish elegant-and-obvious from complex-and-opaque. A high band on genuinely well-written code is a false positive; check before acting.
- It cannot detect understanding that lives in a conversation, a diagram, or a head. Absence of a trailer is not absence of thought.
- It cannot be used for performance assessment, and using it that way guarantees the trailers become theatre.

## ⚠️ Common Failure Modes

- **Letting it block.** The single failure that discredits the whole practice.
- **Treating the band as a verdict.** "High band" is a prompt to have a conversation, not a defect.
- **Inferring AI authorship.** From commit size, from phrasing, from the hour of the day. Wrong often, and corrosive when it is.
- **Penalising `Assisted-by:`.** Teams stop using the trailer, and the one honest signal disappears.
- **Naming individuals.** Converts a system signal into a personnel matter, and the next assessment never happens.
- **Confusing approval with comprehension.** A merged PR with an approving click is not evidence of understanding.
- **Reporting one number for the repo.** Comprehension debt concentrates; an average hides exactly the module you needed to see.
- **Skipping the teach-back.** The band is the cheap proxy; the conversation is the actual value.

## 🔗 Related Skills

- `recording-change-intent` — an `Intent:` record is an input to the band, and the sibling debt this one pairs with
- `attesting-manual-verification` — where a teach-back record lives and how it expires
- `governing-quality-waivers` — the third governance record: why a check is off
- `tech-debt-analysis` — code and architecture health, as opposed to whether anyone understands it
- `documenting-test-suites` — the usual remediation when a suite is unmaintainable by anyone who did not build it
- `code-review-advanced` — where a teach-back conversation naturally belongs
- `analyzing-quality-metrics` — for trending the band honestly, with its caveats attached

## ✅ Definition of Done

This skill is complete when:

- the scope is stated and the available signals are established, with provenance marked unknown where trailers are not in use
- every change or module in scope has a band with the three inputs that produced it
- teach-back status on high-risk surface is FULL / NONE / N/A, with the specific unattested changes named
- concentration is reported, not just averages
- the trend against a previous assessment is included where one exists
- the advisory ceiling is stated explicitly in the report
- recommendations are specific sessions and walkthroughs, not "improve documentation"
- no individual is named as the cause of a band
