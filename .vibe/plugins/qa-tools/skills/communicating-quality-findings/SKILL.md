---
name: communicating-quality-findings
description: 'Shapes QA output for the person who has to act on it: result and blocker in the first two lines, one decision per report, findings ordered by cost, the long artifact in a file and the decisions in the message, magnitude in countable units, every finding with a first step. Use when a report is accurate but nobody acts on it, or when retelling the same findings for a developer, a release manager, and an on-call engineer. Pairs with unslop-answers, which keeps the same report honest. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 📣 Communicating Quality Findings

Two ways a report fails. A **dishonest** one says the suite passed when it did not — that is `unslop-answers`. An **unactionable** one says everything correctly and gets skimmed, filed, forgotten — that is this skill. The second is quieter and more common, because nothing in the report looks wrong. This is not "be brief": a one-line report that omits the blocker is worse than the wall of text it replaced.

## 🎯 When to Use

- triage summary, review round-up, release recommendation, exploratory debrief
- the finding set is long enough that ordering decides what gets fixed
- the same findings retold for a different audience or decision
- a report was sent and nothing happened; "too long", "just tell me what to do", "TL;DR", "for the stakeholders"

## ⚡ Fast Pass (four checks, in order, before sending anything)

1. **Is the blocker in the first two lines?** If something stops the reader, that is line two — not a bullet, not a closing note.
2. **Did any claim lose its evidence while being shortened?** A rung marker, denominator, or "not run" line dropped for brevity goes back in. This check outranks the other three.
3. **More than one decision, or more than five things to act on?** Split the message, or move the full set to a file under `.qa/` and keep the five.
4. **Does the last line say what happens next, and who does it?**

## 👓 The Reader You Are Writing For

1. **The reader is interrupted** — below the first screen is not read on the first pass.
2. **Reading a finding is not fixing it** — a finding without a first step usually stays open.
3. **The reader arrived with one question** — ship or hold. A report answering four questions answers none first.
4. **Volume reads as noise** — forty findings in discovery order get the same treatment as zero. Ranking is the deliverable.
5. **Vague magnitude does not register** — "slow", "some flakes" land as "unknown". A countable number changes behaviour.

## 📏 Nine Rules

1. **Result and blocker in the first two lines.** Line one: what is true now. Line two: what stops the reader. Method later or never. ("Checkout suite: 3 real failures, 1 blocker. Blocker: `payment.spec.ts` cannot run in CI — missing Stripe test key in workflow secrets.")
2. **One decision per report.** Name it in the first line; a second decision becomes a second message.
3. **Order findings by cost, not discovery order.** Sections: blocks release / fix this sprint / noted — each with the cost stated per finding.
4. **The artifact goes in a file, the decisions in the message.** Matrices and queues are complete by design and do not shrink — write them to `.qa/`, keep at most five decisions in the message. Never truncate the matrix to fit chat.
5. **State magnitude in units the reader can count** — files, tests, endpoints, runs, days of history. An estimate is a guess unless something measured backs it.
6. **Every finding carries a first step** — precise enough to start without a follow-up question, small enough to start now.
7. **Restate the state of the work every turn** — position, not narrative: "3 of 7 findings fixed (F1, F2, F5). Next: F3. Blocked: none."
8. **Failures stated flat** — cause, location, effect; no alarm, no apology, no puffery in a title.
9. **Brevity never removes the evidence rung** — cutting words is allowed; cutting the difference between "I ran it" and "I read it" is not.

## 📬 Where the Output Lands

| Channel | What to do differently |
| --- | --- |
| Chat with the person doing the work | State queue position every turn; artifact goes to a file (chat is not storage) |
| PR comment | Anchor every finding to a diff line; blocking vs non-blocking unambiguous |
| Ticket / issue body | Self-contained: build, env, repro, evidence — no "as discussed"; the artifact belongs inline here |
| Team channel | First line must survive alone: decision + ask; detail in thread |
| Stand-up | Changed-since-last-time and blocked-on; no finding detail |
| Release sign-off / audit | Compression off: evidence, dates, gaps in full |

Two rules survive every channel: the blocker goes first, and no claim loses its evidence rung.

## ⚖️ Precedence (when rules conflict, the higher one wins, the shape stays)

1. **Honesty outranks shape** — `unslop-answers` wins every conflict.
2. **The artifact outranks the item cap** — regulated/audited deliverables keep every row.
3. **Destructive or irreversible action outranks brevity** — confirm first, in full sentences.
4. **"Explain this to me" outranks compression** — walkthroughs run as long as needed.
5. **The house format outranks personal shaping** — fill the required template, apply these rules inside its fields.
6. **A rule that would delete the answer loses** — 2–4 ranked options with trade-offs ARE the answer when options are requested.

## ✅ Definition of Done

- first two lines carry result and blocker
- the report answers exactly one decision; other decisions went elsewhere
- ≤5 decisions in the message; full artifact in `.qa/`
- findings ordered by stated cost, not discovery order or label alone
- every finding has a location and a first step
- every quantity is a count actually taken, with denominator and window
- no claim lost its evidence rung to make the report shorter
- skipped/sampled/blocked work appears in the first few lines
- shape fits the channel; a reader of only the first and last line knows what is true and what to do next

## 🔗 Related Skills

- `unslop-answers` — the honesty half of the pair; run it first, then shape
- `qa-best-practices` — bug report format these rules apply inside
- `quality-gates` — the go/no-go call, the highest-stakes single-decision report
- `documenting-test-suites` — the long-form counterpart, exempt from compression by precedence rule 4
- `testing-agent-skills` — check the shaping survives to turn ten and never deletes a confirmation step
