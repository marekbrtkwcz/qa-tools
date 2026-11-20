---
name: unslop-answers
description: 'Cuts AI tells from what the agent says about its own work: completion claimed without a run, invented file paths and API names, terminal output that was never produced, findings with no file or line, percentages with no denominator, absence claimed from one grep, effort narration instead of results, buried blockers. Use whenever reporting a result, a fix, a review finding, a test outcome, a coverage or flake number, a root cause, or a release recommendation — and when the request mentions "prove it", "did you actually run it", "be specific", "no fluff". Must always apply to answers about your own work.'
user-invocable: true
---

# 🧹 Unslop Answers

Cut AI tells from what you say about your own work.

Two failure modes cost very differently. An unreadable answer wastes a reader's minute. An unearned answer costs them a day, because they act on it: they ship on "tests pass", they close the bug on "fixed", they plan around a config option that does not exist. Fluency makes it worse — an answer with no evidence reads better than one full of commands and denominators, because nothing in it is qualified.

**One rule: every claim is evidenced, quantified, or marked unverified.** Every pattern below is a way of noticing where that rule broke.

## 🎯 When to Use

Always, on any answer about work you did. Explicitly when:

- reporting a fix, a result, a root cause, or a review finding
- writing a bug report, a PR description, a commit body, or a release recommendation
- quoting a number: coverage, pass rate, flake rate, timing, defect count
- claiming something is absent: no other callers, no other failures, no regressions
- the request says "prove it", "did you run it", "be specific", "no fluff", "stop hedging"
- an earlier answer of yours turned out to be wrong and the reason needs finding

Scope: what you say — chat replies, reports, findings, plans, docs, commit messages. Test code goes to `unslop-tests`; a product LLM feature's output goes to `llm-testing` (groundedness).

## 🪜 The Evidence Ladder

For every load-bearing claim, get as far down this ladder as is cheap, then say where you stopped:

0. You asserted it. Worth nothing.
1. You reasoned about it and it sounds right. Still worth nothing — and it is the rung most answers stop at while sounding like rung 4.
2. You pointed at a real `file:line` that you opened.
3. You showed the code or config that makes it true.
4. You ran the command and pasted its actual output.
5. You ran it against the broken state and the fixed state, and pasted both.

Rung 4 is the point of the exercise and is usually one command. Rung 5 is what "fixed" means. Two rules keep the ladder honest: **name your rung** when you stopped short ("not run" is a complete answer), and **never round up** — rung 1 reported as rung 4 is the most expensive thing in this skill.

## ⚡ Fast Pass

Six checks, under a minute, before sending anything:

1. **Did I claim it works?** Name the command and paste what it printed, or write "changed, not run".
2. **Is every path, symbol, flag, option, and quote one I actually saw?** Anything from memory gets opened and checked, or dropped.
3. **Does every finding carry a `file:line`?**
4. **Does every number carry its denominator and its window?**
5. **Did I do less than was asked?** Say which part and why, in the first two lines, not the last bullet.
6. **Would this paragraph read identically on a different project?** Then it says nothing about this one. Cut it.

## 📊 Severity Tiers

- **Tier 1 — the answer is a lie.** States as done/verified/fixed something that was not, or contains a fabricated specific. The reader acts on it and loses time or ships.
- **Tier 2 — the answer misleads.** True but framed so the reader draws the wrong conclusion: numbers without meaning, uncounted plurals, buried blockers, borrowed authority.
- **Tier 3 — the answer wastes time.** Effort theater, restating the request, style tells. Annoying, not dangerous.

Rank every finding; report Tier 1 above Tier 3.

## 🔎 Patterns to Detect and Fix

**Unearned claims (T1):** completion claimed with nothing run ("fixed", "should work" — state the command and output, or write "changed, not run"); green claimed from a partial run (say which tests ran and how many passed, from the summary line); "verified" with no artifact (give command, environment, output); fix asserted without seeing red (break the behavior, watch it fail, restore, watch it pass); root cause asserted from one reading (call it a hypothesis until it reproduces); absence claimed from a narrow search ("no other callers" is only as wide as the search — state the pattern and paths); silent recovery (first command failed, answer mentions only the second); someone else's word taken as a result (attribute "the subagent reports…" or re-run and paste the summary line).

**Fabrication (T1):** invented API/matcher (check the installed version's types, not memory); invented path or symbol (open every reference before citing it); invented flag or config key; output that was never produced (never put a paraphrased paste in a code block — paste verbatim or describe in prose); invented issue/doc/version; numbers from nowhere ("about 40% faster" — measure or drop).

**Findings nobody can act on (T2):** finding with no location; uncounted plural ("several issues" — give the count or say you did not count); advice with no defect behind it; severity with no impact; recommendation with no next step; "looks good" without saying what was read in full, sampled, skipped.

**Numbers without meaning (T2):** percentage with no denominator/tool/paths; delta with no baseline; rate with no window (runs + period); single-run timing presented as the value; metric answering a different question (pass rate as the answer to "ready to ship?").

**Borrowed authority (T2):** unnamed source ("best practice", "the docs recommend" — link or cut); convention as the reason ("the Playwright way" — name the failure it prevents); invented consensus ("most teams").

**Scope loss (T1):** part of the ask dropped in silence (state it in the first two lines); blocker buried in the last bullet; scope widened without saying (drive-by edits folded into "the fix"); assumption not surfaced.

**Effort theater (T3):** process narration ("I read X, then searched Y"); counting instead of concluding; self-praise adverbs ("carefully", "thoroughly"); restating the request; summarizing what is directly above.

**Confidence miscalibration (T2):** hedges on a measured fact ("may possibly be around 80%" when you ran the tool); certainty on the unrun ("definitely fixes it" on code never executed); flat confidence — mark the guesses.

**Style tells that damage a report (T3):** puffery in a title; fancy ways to say "is" ("serves as", "boasts"); "not just X, but Y"; rule of three; bold labels restating their own line; a table for two facts; emoji status markers as claims (a green tick is a claim with no evidence — in this repo emojis are a style convention, never evidence); sycophancy and apology loops; generic conclusion ("much healthier place" — say which numbers moved); filler ("it is important to note that").

## 🚩 Red Flags

- "Fixed", "works", or "passes" with no command and output in the same answer.
- A code block of terminal output with no matching tool call in the transcript.
- A `file:line`, API, flag, or version the transcript never opened or printed.
- A percentage or rate with no denominator, window, or tool.
- A skipped part of the request that the first two lines do not mention.
- "No other…" claims backed by a single search, or by none.
- "Definitely" on code that was not run, or "may possibly" on a number that was measured.

## 📋 Report Format

For anything longer than a couple of lines:

- **Result.** What is true now, one or two lines. The blocker goes here, not below.
- **Evidence.** Commands and their output. Real pastes only.
- **Findings.** Tier 1 first, each with `file:line` and what it costs. Then Tier 2 and Tier 3, grouped, one line each.
- **Unverified.** Claims that stopped below rung 4, with the reason. Never folded into the findings.
- **Not done.** Skipped, sampled, or blocked, and why.

## 🤥 Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The change is trivial, it obviously works" | Trivial changes break on typos and wrong imports. Run the narrowest command that exercises it, or write "changed, not run". |
| "I ran it earlier" | A run from before the last edit says nothing about the code now. Re-run, or name which run and which edits came after. |
| "The subagent said the tests pass" | That is its claim, not your evidence. Attribute it, or run it yourself and paste the summary line. |
| "Paraphrasing the output is close enough" | A code block reads as a real paste and the reader will grep for it. Paste verbatim, or describe in prose outside a code block. |
| "Admitting I didn't run it looks incomplete" | "Not run" costs the reader one command; a false "verified" costs a shipped defect. |
| "One grep found nothing, so there are no other callers" | Dynamic calls, string keys, and generated code escape a literal grep. State the pattern and paths searched. |

## ✅ Definition of Done

The answer is ready when:

- every claim a reader would act on has its command and pasted output beside it, or carries its rung and the reason it stopped there
- every `file:line`, API, flag, option, link, and version was opened or printed earlier in the transcript
- every code block of output matches a run captured in the transcript
- every number carries its denominator, its window, and its tool
- every finding has a `file:line` and a stated cost
- skipped, sampled, or blocked work is stated in the first two lines, with the reason
- Tier 1 findings appear above Tier 3 findings
- every claim of absence names the search behind it
- every result relayed from a tool or subagent is attributed to it or re-verified with output

## 🔗 Related Skills

- `unslop-tests` — the same discipline applied to test code: use it on the tests, use this on what you say about them
- `llm-testing` — groundedness/hallucination checks for LLM product features
- `qa-best-practices` — bug reporting format this skill keeps honest
- `quality-gates` — where an unearned "green" costs the most
