## Patterns to Detect and Fix

### Unearned claims (T1)

1. **Completion claimed, nothing run.** "Fixed", "should work now", "this resolves it". State the command and its output, or write "changed, not run".
2. **Green claimed from a partial run.** One file ran, or the run was cut short, or the suite errored on collection and printed nothing. Say which tests ran and how many passed, from the summary line.
3. **"Verified" with no artifact.** Verified means a reader can repeat it. Give the command, the environment, and what it printed.
4. **Fix asserted without seeing red.** A test edited until it passed, with nothing confirming it fails against the bug. Break the behaviour, watch it fail, restore, watch it pass.
5. **Root cause asserted from one reading.** "The race is in the click handler" with no reproduction. Call it a hypothesis until it reproduces on demand, and say what would confirm it.
6. **Absence claimed from a narrow search.** "No other callers", "nothing else uses this", "no other tests affected". An absence claim is only as wide as the search behind it. State the search.
7. **Silent recovery.** The first command failed, the second worked, the answer mentions only the second. The failure was information.
8. **Someone else's word taken as a result.** A subagent or a tool reported success and you passed it on unchecked. Attribute it, or verify it yourself.

### Fabrication (T1)

9. **Invented API.** A method, option, or matcher that does not exist in the installed version. Check the version in `package.json` and the actual types, not memory.
10. **Invented path or symbol.** A `file:line` that resolves to nothing, or a function that was renamed two commits ago. Open every reference before citing it.
11. **Invented flag or config key.** A CLI switch or a config option that reads plausibly and silently does nothing.
12. **Output that was never produced.** Reconstructed or paraphrased terminal output formatted as a paste. If you did not capture it, do not put it in a code block.
13. **Invented issue, doc, or version.** A plausible ticket number, a spec section, a "since 1.42". Link what exists or say what you could not find.
14. **Numbers from nowhere.** "About 40% faster", "roughly 200 tests", "most of the suite". Measure it or drop the sentence.

### Findings nobody can act on (T2)

15. **Finding with no location.** "Error handling could be improved." Where.
16. **Uncounted plural.** "Several issues", "a few places", "many tests". Give the count, or say you did not count.
17. **Advice with no defect behind it.** "Consider adding tests", "you may want to validate this". Name the input that breaks, or drop it.
18. **Severity with no impact.** "High" attached to nothing a user would notice. Say what happens, to whom, how often.
19. **Recommendation with no next step.** A finding that ends without saying what to do or who decides.
20. **Cleared without saying what was checked.** "Looks good" over a diff you skimmed. State what you read in full, what you sampled, and what you skipped.

### Numbers without meaning (T2)

21. **Percentage with no denominator.** "80% coverage" of what, measured by which tool, over which paths.
22. **Delta with no baseline.** "Coverage improved", "it is faster". Both values or neither.
23. **Rate with no window.** A flake rate or pass rate needs the number of runs and the period.
24. **Single-run timing.** One measurement presented as the value. Give the run count, the spread, and the machine, or call it one observation.
25. **Metric answering a different question.** A pass rate offered as the answer to "is this ready to ship".

### Borrowed authority (T2)

26. **Unnamed source.** "Best practice", "the docs recommend", "the standard requires". Link the section or cut the sentence.
27. **Convention as the reason.** "This is the Playwright way." Name the failure the convention prevents.
28. **Invented consensus.** "Most teams", "it is generally agreed", "the community has moved to".

### Scope loss (T1)

29. **Part of the ask dropped in silence.** Three things were requested, two were done, the answer reads as complete.
30. **Blocker buried.** The thing that stops the reader is the last bullet, under the summary.
31. **Scope widened without saying.** Refactors and drive-by edits folded into "the fix", so the reader cannot review what they asked for.
32. **Assumption not surfaced.** A choice was made for the reader and never named, so it looks like a fact about the code.

### Effort theater (T3)

33. **Process narration.** "I read X, then searched Y, then considered Z." The reader wants the conclusion.
34. **Counting instead of concluding.** "Reviewed 14 files across 3 packages" as the headline. Volume is not a finding.
35. **Self-praise adverbs.** "Carefully", "thoroughly", "comprehensively". Either the evidence shows it or the word is doing the work alone.
36. **Restating the request.** The first paragraph tells the reader what they just asked.
37. **Summarising what is directly above.** A closing paragraph repeating the three bullets above it.

### Confidence miscalibration (T2)

38. **Hedges on a measured fact.** "It may possibly be the case that coverage could be around 80%" when you ran the tool.
39. **Certainty on the unrun.** "This definitely fixes it" on code that was never executed.
40. **Flat confidence.** Everything delivered in one register, so the reader cannot separate what you measured from what you guessed. Mark the guesses.

### Style tells that damage a report (T3)

The full list is in `./resources/style-tells.md`. These are the ones that do real damage in QA output.

41. **Puffery in a title.** "Critical issue undermining the robustness of the checkout experience" instead of "Checkout submits twice on double click".
42. **Fancy ways to say is.** "Serves as", "stands as", "boasts", "features". Use "is" or "has".
43. **Not just X, but Y.** State the point.
44. **Rule of three.** Three causes because three feels finished. Use the number you found.
45. **Bold labels restating their own line.** "**Performance:** Performance improved." Write the sentence.
46. **A table for two facts.** Structure heavier than the content it carries.
47. **Emoji status markers.** A green tick is a claim with no evidence attached.
48. **Sycophancy and apology loops.** "Great question", "you are absolutely right", a paragraph of regret. Answer, or correct and move on.
49. **Generic conclusion.** "This puts the suite in a much healthier place." Say which numbers moved.
50. **Filler and fancy synonyms.** "It is important to note that" gets deleted. "Utilize" becomes "use". "In order to" becomes "to".

