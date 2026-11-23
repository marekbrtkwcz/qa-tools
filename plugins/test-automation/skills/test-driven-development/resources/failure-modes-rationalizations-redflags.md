## Common Failure Modes

- **Horizontal slicing** - writing all the tests first, then all the implementation. The tests then verify imagined behavior and lock in a shape nobody has validated.
- **Failing for the wrong reason** - the red step fails on a missing import or broken fixture, and the assertion is never actually exercised.
- **Over-implementing** - adding branches, options, and abstractions the current test never demanded.
- **Fake left behind** - a hardcoded value ships because no test on the list ever forced it to generalize.
- **Refactoring in the green step** - mixing behavior change with cleanup, so a failure has two possible causes.
- **Never refactoring** - always moving to the next test, so the design debt the loop was supposed to prevent accumulates anyway.
- **Step too big** - fighting for green across many attempts instead of reverting and splitting the behavior.
- **Testing internals** - driving private methods, which makes every later refactor break the suite.
- **Tautological assertion** - the expected value is recomputed the way the code computes it, or imported from the implementation's own constants, so the test passes by construction.
- **Cycling over glue** - running the loop on config, wiring, or straight delegation, where the only possible assertion restates the code.
- **Skipping the suite run** - running only the new test and discovering the regression several cycles later.
- **Testing at an unagreed seam** - picking a boundary nobody confirmed, so the effort lands somewhere that was never the risk.
- **Treating TDD as a coverage tool** - chasing a percentage rather than using the loop to shape the interface.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll write the code first and add the test right after" | A test written after the code has never been seen failing, so nothing shows it can catch the bug. Write the test, run it, quote the red, then write the code. |
| "I know it fails, no need to run it" | Unrun tests fail on imports and fixtures, or pass already. Run it and quote a failure message that names the missing behavior. |
| "The assertion was too strict anyway" | Loosening an assertion to reach green changes the specification. Fix the code; if the spec really changed, name the change and get it confirmed before editing the test. |
| "I'll mock this module so the test goes green" | A stub of code you own proves the stub was called and freezes the design. Move the test to a seam where only the clock, randomness, network, or storage is doubled. |
| "The end-to-end test is the real proof, so I'll loop on it" | A minutes-long cycle against a feature that does not exist yet ends in blaming the test. Drive with the fastest test that observes the behavior; add browser coverage once it works. |
| "This change is too small for a failing test" | Small changes are where red costs least. If there is truly no independent source of truth, step out per Phase 6 and run a named substitute check. |
| "I'll refactor at the end" | The end-of-session cleanup is the step that disappears first. Refactor under green each cycle, or record the deferral and its owner in the closing report. |

## Red Flags

- A production file is edited before the transcript shows any test failing.
- A new test passes on its first run and the next step starts anyway.
- The quoted "red" is a syntax error, missing module, or fixture failure, not an assertion.
- An expected value is imported from the module under test or computed with its formula.
- The change that turns the suite green also edits an existing expected value, adds a skip marker, or deletes a test.
- The diff mocks a module that lives in this repository.
- Green is claimed from the single new test, with no full-suite output.
- The fix and its regression test land together, with no earlier run or commit showing the test red on the bug.
- The closing report says "tests pass" without the command and its output.

