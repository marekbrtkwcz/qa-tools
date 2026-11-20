---
name: unit-testing
description: Load this skill when writing or reviewing unit tests and practicing TDD. Covers behavior-driven assertions through public interfaces (not implementation details), determinism, test doubles (mocks/stubs/fakes), edge and boundary cases, the AAA structure, red-green-refactor, and when a quick unit test is enough vs a full suite review.
user-invocable: true
---

# Unit Testing & TDD

Unit tests verify **one unit's behavior through its public interface** — fast, deterministic, no I/O. If a test needs a browser, network, DB, or clock, it is not a unit test (see the E2E/API/DB areas).

## Rules of a good unit test

- **Behavior, not implementation**: assert *what* the output is, not *how* it was computed. A test that breaks on every refactor is testing the implementation.
- **Deterministic**: no real time, no randomness, no shared state. Inject the clock and the RNG (`vi.useFakeTimers()`, seeded faker).
- **One behavior per test**: name says what is verified — `should <result> when <condition>` (e.g. `should return 0 when cart is empty`).
- **AAA structure** (Arrange-Act-Assert), one Act per test:

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

  it('should ignore expired coupon when date has passed', () => {
    const cart = { items: [{ price: 100, qty: 1 }], coupon: { type: 'percent', value: 50, expires: '2020-01-01' } };
    expect(totalPrice(cart)).toBe(100);
  });
});
```

## Edge & boundary cases (checklist per unit)

- empty / null / undefined input
- zero, negative, max values (boundary: `0`, `1`, `max-1`, `max`, `max+1`)
- unicode, empty string, whitespace
- error paths: thrown errors asserted with `expect(() => ...).toThrow(...)`

## Test doubles

| Double | Use for | Example |
|---|---|---|
| **Stub** | canned answers | `vi.fn().mockReturnValue(42)` |
| **Mock** | verify an interaction happened | `expect(sendMail).toHaveBeenCalledWith(...)` |
| **Fake** | working lightweight replacement | in-memory repository instead of DB |

- Prefer **fakes over mocks** for stateful collaborators (in-memory repo); use mocks only to verify a side effect was triggered.
- Never mock the unit under test. Mock at the **boundary** (I/O, clock, network).

```typescript
// fake at the boundary — repository is an interface
class InMemoryUserRepo implements UserRepo {
  private users = new Map<string, User>();
  async findById(id: string) { return this.users.get(id) ?? null; }
  async save(u: User) { this.users.set(u.id, u); }
}

it('should create user when email is unique', async () => {
  const service = new UserService(new InMemoryUserRepo());
  const user = await service.register('a@example.com');
  expect(user.id).toBeDefined();
});
```

## TDD — red, green, refactor

1. **Red**: write a failing test for the next behavior (smallest possible step).
2. **Green**: make it pass with the simplest code — no premature abstraction.
3. **Refactor**: clean up *with tests green*; never refactor and add behavior in one step.

- TDD is strongest for: business rules, edge cases, bug fixes (write the failing regression test first).
- Quick mode: for one routine function, a few solid tests are enough — don't gold-plate.

```typescript
// bug fix loop: red first
it('should reject negative quantity when adding to cart', () => {
  expect(() => addToCart(cart, { id: 'x', qty: -1 })).toThrow('quantity must be positive');
});
```

## What unit tests must NOT do

- No `await new Promise(r => setTimeout(r, ...))` — use fake timers.
- No real DB/network/filesystem — that's integration/E2E territory.
- No tautologies: `expect(result).toBeDefined()` proves nothing; assert the value.
- No swallowed errors: `try { ... } catch {}` in a test hides failures.
- No retries — a unit test must pass deterministically on first run.

## Mutation check (are my tests real?)

Break the code on purpose (flip a `>` to `>=`, return a wrong constant) — the test suite must go red. If nothing fails, the tests prove nothing. Run this for new suites and after major refactors.

## Unit vs integration vs E2E — where does a test belong?

| Level | Speed | Use for | In qa-tools |
|---|---|---|---|
| Unit | ms | pure logic, rules, edge cases | this skill |
| Integration | s | DB/ORM, queues, module boundaries | `database-testing`, `db` area |
| E2E | min | user flows in the browser | `ui`/`e2e` areas |

## Checklist

- [ ] Public interface only — no testing private methods
- [ ] Deterministic: no real clock/RNG/network, fake timers injected
- [ ] AAA + `should…when…` naming, one Act per test
- [ ] Edge cases covered (empty, zero, max, unicode, error path)
- [ ] Doubles at the boundary; fakes preferred for state
- [ ] TDD red-green-refactor for new behavior and bug fixes
- [ ] Mutation check: breaking the code turns the suite red
- [ ] No tautological assertions, no swallowed errors, no retries
