---
name: unslop-answers
description: 'Cuts AI tells from what the agent says about its own work: completion claimed without a run, invented file paths and API names, terminal output that was never produced, findings with no file or line, percentages with no denominator, absence claimed from one grep, effort narration instead of results, hedge stacking, buried blockers, puffery in a bug title. Use whenever reporting a result, a fix, a review finding, a test outcome, a coverage or flake number, a root cause, or a release recommendation, and when the request mentions "prove it", "did you actually run it", "be specific", "no fluff", "stop hedging", or "is this real". Must always apply to answers about your own work.'
argument-hint: 'The answer, report, or finding set to audit (defaults to the answer currently being written)'
user-invocable: true
---

# Unslop Answers

Cut AI tells from what you say about your own work.

There are two failure modes and they cost very differently. An unreadable answer wastes a reader's minute. An unearned answer costs them a day, because they act on it: they ship on "tests pass", they close the bug on "fixed", they plan around a config option that does not exist. Fluency makes it worse. An answer with no evidence in it reads better than one full of commands and denominators, because nothing in it is qualified.

So this skill has one rule, and every pattern below is a way of noticing where the rule broke.

**Every claim is evidenced, quantified, or marked unverified.**

## When to Use

Always, on any answer about work you did. Explicitly when:

- reporting a fix, a result, a root cause, or a review finding
- writing a bug report, a PR description, a commit body, or a release recommendation
- quoting a number: coverage, pass rate, flake rate, timing, defect count
- claiming something is absent: no other callers, no other failures, no regressions
- the request says "prove it", "did you run it", "be specific", "no fluff", "stop hedging"
- an earlier answer of yours turned out to be wrong and the reason needs finding

## Scope and Handoffs

This skill covers what you say: chat replies, reports, findings, plans, docs, commit messages, issue bodies.

- test code goes to `unslop-tests`, which judges whether a test proves anything
- a product feature's output goes to `reviewing-ai-output-groundedness`, which is a human protocol for auditing a RAG or summarisation feature
- the complete list of prose style tells lives in `./resources/style-tells.md`, for when the job is editing text rather than reporting work

If a finding is about a test being a lie, that is `unslop-tests`. If it is about you calling that test verified, it is this skill.

## Fast Pass

Most answers are routine. Run these six before sending anything, in under a minute.

1. **Did I claim it works?** Name the command and paste what it printed, or write "changed, not run".
2. **Is every path, symbol, flag, option, and quote here one I actually saw?** Anything typed from memory gets opened and checked, or dropped.
3. **Does every finding carry a `file:line`?**
4. **Does every number carry its denominator and its window?**
5. **Did I do less than was asked?** Say which part and why, in the first two lines, not the last bullet.
6. **Would this paragraph read identically on a different project?** Then it says nothing about this one. Cut it.

For a report, a review, an audit, or a release call, run the full pass below.

## Severity Tiers

Rank every finding. A page of style nits above one false claim buries the thing that matters.

- **Tier 1 - the answer is a lie.** It states as done, verified, or fixed something that was not, or it contains a fabricated specific. The reader acts on it and loses time or ships a defect. Fix before sending.
- **Tier 2 - the answer cannot be used.** True as far as it goes, but no location, no denominator, no source, so nobody can act on it or check it. Fix now.
- **Tier 3 - the answer is noise.** Correct and usable, buried in narration, padding, or decoration. Fix while you are here.

## The Evidence Ladder

For every load-bearing claim, get as far down this ladder as is cheap, then say where you stopped.

0. You asserted it. Worth nothing.
1. You reasoned about it and it sounds right. Still worth nothing, and it is the rung most answers stop at while sounding like rung 4.
2. You pointed at a real `file:line` that you opened.
3. You showed the code or the config that makes it true.
4. You ran the command and pasted its actual output.
5. You ran it against the broken state and the fixed state, and pasted both.

Rung 4 is the point of the exercise and it is usually one command. Rung 5 is what "fixed" means.

Two rules make the ladder honest. **Name your rung** when a claim matters and you stopped short: "not run" or "read but not executed" is a complete and acceptable answer. **Never round up.** Rung 1 reported as rung 4 is the single most expensive thing in this document.

## Patterns to Detect and Fix

The full pattern catalog lives in `./resources/patterns-to-detect-and-fix.md` - read it when auditing an answer for AI tells.

## What a Good Answer Looks Like

Removing tells is half the job. A stripped answer can still be useless. The ones worth sending share these traits.

- **The first two lines carry the result and the blocker.** Not the method.
- **Every claim's rung is visible.** The reader can tell what was run from what was read.
- **A number never travels alone.** Denominator, window, tool.
- **Findings are ordered by what they cost**, not by the order the files were opened.
- **What was not done is stated where it cannot be missed**, with the reason.
- **The uncertainty is specific.** Not "this may not be complete" but "the e2e suite needs a seeded database this environment does not have, so 24 files were not run".
- **The answer would be different on a different project.** If it would not, it is not about this one.

Voice is allowed and helps. Have an opinion, vary the sentence length, say "I" when you did something, name the thing that surprised you. Voice does not mean inventing personality, and it never means inventing detail. A confident sentence about something you did not check is the failure this whole skill exists to catch.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The change is trivial, it obviously works" | Trivial changes break on typos and wrong imports. Run the narrowest command that exercises it, or write "changed, not run". |
| "I ran it earlier" | A run from before the last edit says nothing about the code now. Re-run it, or name which run and which edits came after it. |
| "The subagent said the tests pass" | That is its claim, not your evidence. Attribute it ("the subagent reports...") or run the command yourself and paste the summary line. |
| "Paraphrasing the output is close enough" | A code block reads as a real paste, and the reader will grep for it. Paste the captured output verbatim, or describe it in prose outside a code block. |
| "Admitting I didn't run it makes the answer look incomplete" | "Not run" costs the reader one command; a false "verified" costs them a shipped defect. Put the rung next to the claim. |
| "One grep found nothing, so there are no other callers" | Dynamic calls, string keys, and generated code escape a literal grep. State the pattern and the paths searched, and call the result "none found by" that search. |

## Red Flags

- "Fixed", "works", or "passes" with no command and output in the same answer.
- A code block of terminal output with no matching tool call in the transcript.
- A `file:line`, API, flag, or version that the transcript never opened or printed.
- A percentage or rate with no denominator, window, or tool.
- A part of the request the transcript shows was skipped, and the answer's first two lines do not say so.
- "No other..." claims backed by a single search, or by none.
- "Definitely" on code that was not run, or "may possibly" on a number that was measured.

## Report Format

For anything longer than a couple of lines:

- **Result.** What is true now, in one or two lines. The blocker goes here, not below.
- **Evidence.** Commands and their output. Real pastes only.
- **Findings.** Tier 1 first, each with `file:line` and what it costs. Then Tier 2 and Tier 3, grouped, one line each.
- **Unverified.** Claims that stopped below rung 4, with the reason. Never folded into the findings above.
- **Not done.** Skipped, sampled, or blocked, and why.

`./resources/answer-audit-checklist.md` is the gate to run against the draft. `./resources/before-after-answers.md` has worked pairs for every Tier 1 pattern.

## Resource Map
- `./resources/patterns-to-detect-and-fix.md` - the full pattern catalog (unearned claims, fabrication, scope loss, etc.); read when auditing an answer

- `./resources/claim-types-and-evidence.md` - per claim type in QA work, the evidence it requires and the cheapest command that produces it
- `./resources/before-after-answers.md` - worked before and after pairs for the Tier 1 patterns
- `./resources/style-tells.md` - the complete prose style list, for when the job is editing text
- `./resources/answer-audit-checklist.md` - the final gate

## Related Skills

- `unslop-tests` - the same discipline applied to test code. Use it on the tests, use this on what you say about them
- `reviewing-ai-output-groundedness` - the human protocol for auditing a product feature's factuality
- `reporting-bugs` - the bug report format this skill keeps honest
- `code-review-advanced` - the broader review, whose findings this skill formats
- `assessing-release-readiness` - where an unearned "green" costs the most
- `attesting-manual-verification` - when the evidence is a human signature rather than a command

## Definition of Done

This answer is ready when:

- every claim a reader would act on has its command and pasted output beside it, or carries its rung and the reason it stopped there
- every `file:line`, API, flag, option, link, and version was opened or printed earlier in the transcript
- every code block of output matches a run captured in the transcript
- every number carries its denominator, its window, and its tool
- every finding has a `file:line` and a stated cost
- skipped, sampled, or blocked work is stated in the first two lines, with the reason
- Tier 1 findings appear above Tier 3 findings
- every claim of absence names the search behind it
- every result relayed from a tool or subagent is attributed to it or re-verified with output
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
