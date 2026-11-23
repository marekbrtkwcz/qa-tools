## Common Failure Modes

- **Tautological assertion** - the expected value is recomputed the way the code computes it, so the test can never disagree with the code
- **Testing the mock** - every collaborator is stubbed, so the test only proves the stubs were called
- **Verifying through a side channel** - checking the database or internal state directly instead of observing through the interface
- **Multi-assert sprawl** - one test verifying five unrelated behaviors, so a failure says nothing specific
- **Hidden nondeterminism** - real clock, real randomness, real network, or locale-dependent formatting
- **Sleeping instead of controlling time** - a real delay that makes the suite slow and still flaky under load
- **Loop-hidden cases** - many cases inside one test, so the failure never says which input broke
- **Coverage theater** - calling code without asserting anything meaningful in order to move a percentage
- **Restating the implementation** - the test reads as a line-by-line echo of the function body
- **Over-mocking internals** - substituting collaborators the unit legitimately owns, which freezes the current design
- **Silently correcting legacy behavior** - changing what the code does while claiming to only add tests
- **Secrets or real personal data in fixtures** - committed once, present in history forever

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "The test fails, so I'll set the expected value to what the code returns" | That turns a specification into a snapshot of whatever the code does, bug included. Confirm the output against the spec first; if they disagree, report the defect. |
| "I'm confident this test would catch a regression" | It has never been seen failing. Break the behavior, run the test, quote the red, restore, quote the green. |
| "Coverage shows the line is hit, so it's tested" | Coverage proves the line ran, not that any assertion would notice it change. Use the mutation check as the proof. |
| "Mocking this internal helper keeps the test simple" | It couples the test to today's design and breaks on the next refactor. Test through the outer module's interface; double only clock, randomness, network, storage. |
| "A retry or a longer timeout is fine for now" | Containment leaves the race in the product and the suite reporting green. Reproduce, classify, fix the cause, and prove it with repeated runs. |
| "I'll mark it skip and file a ticket" | Unowned skips are coverage silently removed. A skip lands only with an issue link and an owner, and the report names it. |
| "A small tweak to the production code will make this testable" | That smuggles a design change into a test change. Raise the finding, ask, and make it a separate change. |

## Red Flags

- An expected value matches the observed output exactly and no spec, example, or worked calculation is cited for it.
- The only assertion is truthy, defined, "does not throw", or a whole-object snapshot.
- The diff mocks a module that lives in this repository.
- A real `sleep`, an unpinned clock, or unseeded randomness appears in a test.
- `skip`, `only`, or a commented-out test without an issue link.
- A flake "fix" that only raises a retry count or a timeout.
- Production files change in a diff described as "adding tests".
- The report says "all green" with no command and counts, or claims a mutation check without quoting the failure it produced.

