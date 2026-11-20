---
name: test-driven-development
description: Load this skill when building new behavior or fixing a bug test-first — driving the implementation through red-green-refactor cycles instead of writing tests after the code. Covers choosing the seam (public interface) to drive, inner vs double (outside-in) loop, minimal implementation strategies (fake it / obvious / triangulation), refactoring only under green, bug reproduction with a failing regression test, and when to step out of the loop with a named substitute check. Complements unit-testing (the quality bar for each test) — use that skill when tests are added to code that already exists.
user-invocable: true
---

# Test-Driven Development

TDD is a **design technique that produces tests as a by-product**, not a coverage technique. The loop's value is the pressure it puts on the interface: code that is hard to test first is usually code that is hard to use. Judge a session by whether the design got clearer and every change was verified — not by the coverage number.

Framework-agnostic: detect the runner/assertion style the project already uses before the first cycle (vitest/jest/…). If nothing exists yet, ask which runner to target before writing a test.

## The seam

A **seam** is the public boundary the test observes behavior through — the interface a real caller would use. Tests live at seams, never against internals. Name the seam before the first test; if you cannot name it, you are not ready to write the test. Agree the seams up front so testing effort lands on critical paths, not on every edge case.

## Choosing the loop shape

| Situation | Loop shape |
| --- | --- |
| Single unit's logic, interface known | **Inner loop** — unit-level red-green-refactor |
| Feature crossing several units | **Double loop** — one failing acceptance test held red on the outside, inner unit cycles until it goes green. Say explicitly that the outer test stays red, so a red suite is not mistaken for broken work |
| The interface itself is the open question | Write the call you wish existed as the first test; let it define the shape |
| Behavior depends on a real boundary (DB, HTTP, browser) | Drive the owned logic with unit cycles; verify the boundary in integration coverage separately |

## The loop

### Red

1. Write **one** failing test for the next behavior on the test list (the list is a queue, smallest/most central first — never batch all tests up front).
2. Run it and read the real output. Quote it.
3. Confirm it fails on the **missing behavior** — not a typo, missing import, or broken fixture. A mechanical failure is not red; fix it and run again.
4. If it passes immediately, stop: the behavior exists or the test asserts nothing.
5. Trace the expected value to the spec, a worked example, or a known-good literal — never a value imported from the module under test.

### Green

Write the simplest thing that passes, by confidence: **obvious implementation** (you know how it works) → **fake it** (return a constant; a queued test must force the real logic) → **triangulation** (second test with different data the constant cannot satisfy). Then run the **full suite**, not just the new test.

Substitute only what you do not own — clock, randomness, network, storage (see `mocking`). Mocking your own module means the seam is wrong; say so instead.

### Refactor

Under green only, one change at a time, suite run after each: remove duplication, fix names, split what grew — in tests as well as code. Structure only, never behavior. If a refactor goes red, revert it rather than debugging forward. Commit at green.

## The rules

1. **Red before green** — no production code without a failing test demanding it.
2. **Evidence, not assertion** — run the tests and quote the real output; never claim red/green unseen.
3. **Minimal implementation** — only what the current test demands, no speculative branches.
4. **One slice at a time** — one behavior, one test, one implementation.
5. **Refactor only under green**, never mixed into the green step.
6. **Drive the public seam**, never private methods.
7. **Assert against an independent source of truth**, never a value the implementation hands you.
8. **Reach green by changing the code, not the test** — if an assertion must change, the spec changed; name it and get it confirmed.
9. **Match step size to confidence** — repeated failure to reach green means the step was too big; revert to last green and split.

## Bugs: reproduce first

1. Write a test that fails **because of the bug**, at a seam reaching the real failure path.
2. Confirm the failure matches the reported symptom.
3. Shrink it until every remaining element is load-bearing.
4. Fix the code until it passes; re-check the original scenario.
5. Keep the test as the regression guard. Stage the failing test **before** the fix, so history reads red then green.

## When to step out

Stepping out is not skipping verification — name the closest check you can actually run (script, type check, manual repro, output comparison), run it before and after, and quote the output in place of the red-green pair. Step out when:

- the behavior needs a real network/DB/browser to prove (integration work — drive owned logic with unit cycles)
- the change is a pure rename or mechanical migration
- there is no independent source of truth to assert against (config, wiring, straight delegation)
- the design is too open to express as an assertion — spike, throw the spike away, then cycle

Prefer no test to a bad test, but never a silent skip.

## Example cycle (vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { totalPrice } from './cart';

describe('totalPrice', () => {
  it('should apply percentage discount when coupon is valid', () => {
    // Arrange
    const cart = { items: [{ price: 100, qty: 2 }], coupon: { type: 'percent', value: 10 } };
    // Act
    const result = totalPrice(cart);
    // Assert
    expect(result).toBe(180);
  });
});
```

Red: run `npx vitest run cart.spec.ts` → assertion fails, `expected 200 to be 180`. Green: minimal `if (coupon?.type === 'percent') ...` → full suite green. Refactor: extract `applyCoupon` under green.

## Red flags

- A production file was edited before any failing-test output appears.
- A new test passes on its first run and work continues anyway.
- The quoted "red" is a syntax/import/fixture error, not an assertion.
- The change that turns the suite green also edits an expected value, adds a skip, or deletes a test.
- The diff mocks a module that lives in this repository.
- Green is claimed from the single new test without full-suite output.
- The fix and its regression test land together, with no earlier red run on the bug.

## Related skills

- `unit-testing` — the quality bar each test the loop produces must meet (AAA, determinism, boundary cases); use it when tests are added to existing code
- `mocking` — what may be substituted (clock, randomness, network, storage) and how
- `test-data-management` — designing inputs and boundary values before the cycles start
- `test-planning` — when the behavior belongs in functional/E2E coverage instead of unit cycles

## Checklist

- [ ] Seam and loop shape stated and confirmed before the first test
- [ ] Test list is a queue; one behavior per cycle
- [ ] Every production change preceded by quoted red output naming the missing behavior
- [ ] Expected values trace to spec / worked example / literal
- [ ] Full suite run and quoted after each green and each refactor
- [ ] Only owned-nothing doubles in the diff; every fake has a listed test that will remove it
- [ ] No existing assertion weakened, skipped, or deleted
- [ ] Each bug fix has a regression test whose red run on unfixed code is quoted
- [ ] Step-outs (if any) name the substitute check and its before/after output
