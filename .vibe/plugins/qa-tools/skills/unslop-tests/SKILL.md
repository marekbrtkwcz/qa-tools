---
name: unslop-tests
description: 'Cuts AI tells from test code: tests that pass without proving anything, tautological assertions, mock-only tests, hardcoded waits, coverage theater, vague names, swallowed errors, retries used as fixes. Use whenever test code is written, changed, or reviewed — including tests produced as a side effect of a feature task — and when the request mentions "are these tests any good", "this test always passes", "clean up these tests". Must always apply to test code.'
user-invocable: true
---

# 🧪 Unslop Tests

Cut AI tells from test code.

A generated test suite reads well, runs green, and often proves nothing. That combination is the whole problem: the suite looks like coverage, gets reviewed like coverage, and fails to notice the bug it was written for. This skill names the tells so they can be caught by sight, then proves the important ones by running code.

## 🔄 Process

1. Read the test code in scope (the files or diff the caller gives; otherwise the working diff against `main`, including uncommitted changes).
2. Scan for the patterns below. Tag each finding with its tier.
3. Fix. Preserve what the test was trying to prove; if it was trying to prove nothing, say so instead of polishing it.
4. Prove every Tier 1 finding by running code: break the behavior, watch the test, paste the output.
5. Self-audit: "which of these tests would still pass if I deleted the feature?" Fix what survives.

When auditing a whole suite rather than a diff, say how much you actually read — a sampled audit reported as full is its own kind of slop.

## 📊 Severity Tiers

- **Tier 1 — the test is a lie.** Passes while the behavior is broken, or hides a real defect. Blocks the change. Must be proven by execution, not reading.
- **Tier 2 — the test will fail for the wrong reason.** Passes today, breaks on an unrelated refactor, a slow CI machine, or another timezone. Fix now or file it.
- **Tier 3 — the test is unreadable.** Works, but its failure output tells nobody what broke. Fix while you are in the file.

Report tiers in that order.

## 🔎 Patterns to Detect and Fix

Examples use neutral `test`/`expect` pseudocode; translate to the project's runner (Playwright, Vitest, Jest, Mocha).

**Assertions that prove nothing**

1. **Tautological assertion** (T1). Expected value computed the way the code computes it, so the test cannot disagree with the code. Use a literal from an independent source: the spec, a worked example, a hand-calculated number. If you cannot write the literal without running the code, you do not yet know what the function should return.
2. **Assertion that cannot fail** (T1). `toBeDefined()`, `toBeTruthy()`, `not.toBeNull()`, `toBeGreaterThanOrEqual(0)`, `expect(true).toBe(true)`. Assert the value.
3. **Type check standing in for a behavior check** (T1). `typeof id === 'string'` — the type system already promises this. Assert what the string is.
4. **Snapshot as the only assertion** (T1). A large unread snapshot passes forever, then goes red across twenty files on one unrelated change. Assert the field that carries the behavior; keep snapshots small enough that a reviewer reads the diff.
5. **"It throws" without which error** (T2). Bare `toThrow()` passes when the function name is misspelled. Assert the error type and the load-bearing message part.
6. **try/catch that can pass silently** (T1). Assertion inside `catch` with nothing forcing the `try` to throw — the day the call stops throwing, the test goes green. Assert on the rejection directly.
7. **Unawaited async** (T1). Missing `await` on the act or the assertion: the runner reports pass, the assertion runs after nobody listens.
8. **Coverage theater** (T1). Code is called, nothing meaningful asserted, a percentage moves. Delete it or give it something to prove.
9. **Assertion on an unchecked step** (T2). Setup failure ignored; the real failure surfaces three lines later as a confusing undefined error.

**Scope and structure**

10. **God test** (T2). One test logs in, searches, checks out, opens the receipt — the first failure hides the rest and the name cannot say what broke. Split by behavior.
11. **Multi-assert sprawl** (T3). Five unrelated behaviors in one test. If the name needs "and", split it.
12. **Loop-hidden cases** (T3). `for (const c of cases) expect(...)` — the failure never says which input broke. Use the runner's parameterized API.
13. **Conditional in a test** (T2). `if (items.length) expect(...)` — a branch that can skip the assertion is a test that can pass by accident. Assert the precondition, then the behavior.
14. **Testing the library** (T3). Asserting the HTTP client parses JSON. Test your use of it, not it.
15. **Test that depends on another test** (T2). State from an earlier test, or an order the runner does not guarantee. Run the file in isolation and in reverse order to find these.

**Determinism**

16. **Hardcoded wait** (T2). `waitForTimeout(2000)`, `sleep(500)`, bare `setTimeout` in a test body. Wait for the condition, not the clock. (Project rule: assertions only via `expect()`, never `waitForTimeout`.)
17. **Real clock** (T2). `new Date()` inside the expectation. Freeze time or inject a clock — "today" breaks at midnight in some timezone.
18. **Unseeded randomness** (T2). `Math.random()`, unseeded faker, generated UUID in the assertion. Seed it and record the seed in failure output.
19. **Format-dependent assertion** (T2). Locale-formatted number, currency string, timezone-rendered date. Pin locale/timezone or assert the structured value.
20. **Retry as the fix** (T1). `retries: 3`, per-test retry, raised timeout on something that flakes. Containment, not a fix — the race is still in the product and the suite reports it as pass. Reproduce, diagnose, fix the cause (`stabilizing-flaky-tests`).

**Test doubles**

21. **Mock-only test** (T1). Every collaborator stubbed; only the stubs being called is proven. Check: if you deleted the unit under test, would it still pass?
22. **Mocking what you own** (T2). Substituting internals freezes the design and makes every refactor a test rewrite. Mock at real boundaries only: clock, network, storage, other people's services.
23. **Stub that lies** (T2). Returns a shape the real dependency never produces. Pin the shape with a contract test or generate the stub from the real schema.
24. **Assertion on the call instead of the outcome** (T2). `expect(save).toHaveBeenCalledWith(order)` as the whole test proves a call happened, not that anything is now true.

**Naming and readability**

25. **Name that describes the code** (T3). `calls getUserById`, `works correctly`, `test 1`, `happy path`. State behavior + condition: `returns null when the user is soft-deleted`. A reader should know what broke from the failure line alone.
26. **Comment restating the assertion** (T3). Delete it. Keep a comment only when it says why the number is right.
27. **Ceremonial comment blocks** (T3). `// Arrange / Act / Assert` over three one-liners — blank lines already show structure.
28. **Unnamed load-bearing value** (T3). `toHaveLength(7)` — say why seven, or derive it visibly from the input.
29. **Setup nobody reads** (T3). Twenty-field fixture where two fields matter. Use a factory with overrides.

**Data**

30. **Real credentials or personal data in fixtures** (T1). A real email, token, customer name. Committed once = in history forever. Use obviously synthetic values.
31. **Shared mutable fixture** (T2). Module-scope object mutated by several tests. Rebuild per test.
32. **Data assumed to exist** (T2). Hardcoded id from a seeded database. The test passes on one machine. Create what it needs (`test-data-management`).

**Containment and suppression**

33. **Skip with no owner** (T1). `skip`, commented-out test, deleted assertion with no issue link and no name. Coverage quietly removed.
34. **`only` left in** (T1). Silently disables the rest of the file; CI reports green.
35. **Suppressed type/lint error in a test** (T2). The suppression is usually pointing at the bug.

**Browser and end-to-end tells**

36. **Brittle locator** (T2). Long CSS/XPath chains, `nth(0)`, generated class names, copy-editable text. Use role, label, or test id (project rule: `getByRole`/`getByLabel`).
37. **`slow()` or raised timeout as a flake fix** (T1). Pattern 20 in different clothes.
38. **Screenshot or trace as the assertion** (T3). Capturing artifacts is not asserting.
39. **Asserting only on the URL** (T3). `expect(page.url()).toContain('/checkout')` proves navigation, not that checkout works.
40. **Logging in through the UI in every test** (T3). Set up the session once, outside the test (`storageState`).

## 🏆 What Good Test Code Looks Like

- **One reason to fail, and the name says which.** The failure line is the bug report.
- **The expected value came from outside the implementation** — spec, worked example, hand-computed number. Never from running the code and pasting what came out.
- **It has been seen red.** Broken on purpose, watched fail, restored.
- **The boundaries are the ones that actually break.**
- **The setup states only what matters.**
- **It survives a rename.** Restructure internals without changing behavior; the test still passes.
- **On CI failure, the output is enough to act on.** No bare "expected true, received false".

## 🧪 Prove the Tier 1 Findings

Do not hand back the reading — a test-quality writeup reads as convincing whether or not it is true. For every Tier 1 finding, climb the ladder and say where you stopped:

1. You said the test is weak. Worthless alone.
2. You pointed at the line — a real `file:line`.
3. You showed by reading that the assertion cannot tell pass from fail.
4. You broke the behavior the test claims to cover, ran the test, and it stayed green. Paste command + output.
5. You fixed the test, broke the behavior again, watched it go red; restored the code, watched it go green.

Rung 4 is the whole point and usually one edit + one command. Any Tier 1 finding not at rung 4 is marked unproven — do not round up.

Two more checks on anything you changed: **isolation check** (file alone, random order, concurrency off/on — each configuration accuses a different cause) and **refactor check** (rename internals, test must still pass).

## 📋 Report Format

Lead with what is broken, not with what you read.

- **Tier 1, proven.** The tell, `file:line`, what you broke, the command, the output showing it stayed green, and the fix.
- **Tier 1, unproven.** Same, with the reason you could not run it.
- **Tier 2 and Tier 3.** Grouped, one line each, `file:line` + tell name.
- **Cleared.** Patterns checked that this suite does not have. Short.
- **Coverage of this audit.** Which files read in full, which sampled/skipped.
- **Design findings.** Untestable seams, boundaries in the wrong place. Fixing production code is its own change, not part of a test cleanup.

## 🚩 Red Flags

- A Tier 1 finding with no `file:line`, or no pasted command/output and not marked unproven.
- A fixed test never shown red against broken behavior.
- A snapshot updated in the diff with no statement that its contents were read.
- An expected value changed to the observed output during "cleanup".
- A test deleted, skipped, or given `retries`/`slow()`/raised timeout without a line in the report.
- Production files changed in a test-cleanup diff.
- The report opens with naming nits while a Tier 1 finding sits below.
- "Audited the suite" with no list of files read.

## ✅ Definition of Done

- the report lists files read in full and files sampled or skipped
- every finding carries a tier, a pattern name, and a real `file:line`
- every Tier 1 finding has the command and pasted output showing green against broken behavior, or is marked unproven with a reason
- every fixed test has two quoted runs: red against broken behavior, green after restoring
- every touched file has quoted runs alone, in random order, and with concurrency toggled
- the diff adds no retry, raised timeout, `slow()`, or skip as a flake fix
- every deleted test is listed with the coverage it held and what now covers it
- the diff changes no production file; testability problems appear under Design findings
- the report's first section is Tier 1

## 🔗 Related Skills

- `unit-testing` — the quality bar for each test; use it to write tests, this skill to judge them
- `test-driven-development` — test-first removes several of these patterns by construction
- `test-data-management` — fixture and boundary-value design
- `stabilizing-flaky-tests` — when pattern 20/37 shows up as a real flake
- `qa-best-practices` — code review of tests; this skill is its test lens
- `unslop-answers` — the same discipline for what you say about the tests
