---
name: typescript-for-testers
description: "TypeScript fundamentals aimed at testers who write and maintain automated tests: types and inference, interfaces vs type aliases, generics, union types and type guards, async/Promise typing, utility types (Partial, Pick, Record, Awaited), `satisfies`, discriminated unions, strict tsconfig for test code (noUncheckedIndexedAccess), typing fixtures, test-data factories, Page Objects and API clients, and avoiding `any` under Biome's noExplicitAny. Use when onboarding a tester to TypeScript, leveling up a team on TS in tests, or reviewing test code that fights the type system. For tooling (Biome, tsc, CI gates) use static-code-analysis-typescript; for writing the tests themselves use writing-unit-tests / writing-playwright-tests-best-practices."
argument-hint: "Team's current TS level and the test code that is hardest to maintain"
user-invocable: true
---

# TypeScript for Testers

This is the language-leveling skill: enough TypeScript to write tests that are readable, refactor-safe, and pass `tsc --noEmit` under a strict config. It is **not** about tooling (Biome config, CI gates — see `static-code-analysis-typescript`) and **not** about test design (see `writing-unit-tests`, `designing-test-data`). Everything here runs in a Playwright/Vitest/`bun test` context, but the concepts are runner-agnostic.

## When to Use

- onboarding a tester (manual or automation) to TypeScript
- "our test code is full of `any` and `as` casts — clean it up"
- "what does `noUncheckedIndexedAccess` change in my tests?"
- leveling up: generics, type guards, utility types in fixtures and Page Objects
- reviewing PRs where types fight the test author

## Core concepts, in the order a tester needs them

1. **Types and inference.** TS infers most things; annotate only at boundaries (function params of helpers, exported factory return types). `const x = 'cart'` is the literal type `'cart'`, not `string` — widen with `: string` when needed.
2. **Interfaces vs type aliases.** For object shapes either works; prefer `interface` for Page Object contracts and DTOs (better error messages, declaration merging), `type` for unions and mapped shapes. Be consistent per file.
3. **Union types and narrowing.** `status: 'ok' | 'error'` beats `string`. Narrow with `if (typeof x === 'string')`, `in`, or type guards (`x is Cart`). Discriminated unions (`{ kind: 'success', data } | { kind: 'error', message }`) are the tester's best friend for API results — narrow on `kind`.
4. **Optional and null safety.** `user?.address?.city`, `?? fallback`. Under `strictNullChecks`, `string | undefined` must be handled explicitly — that is the point: it kills "undefined is not an object" flakes at compile time.
5. **Arrays and records.** `CartItem[]`, `Record<string, CartItem>` (id-keyed maps), `ReadonlyArray` for data you must not mutate. Under `noUncheckedIndexedAccess`, `arr[0]` is `T | undefined` — handle it (this is the single most common strict-mode test failure).
6. **Generics, lightly.** `function makeFactory<T>(defaults: T): () => T` — you mostly *consume* generics (`Promise<User>`, `Page<LoginPage>`); write them only for factories/helpers. `Awaited<ReturnType<typeof fetchUser>>` unwraps promise layers in tests.
7. **Utility types.** `Partial<T>` (override one field of a fixture), `Pick<T, 'id' | 'email'>`, `Omit`, `Record`, `Required`. `satisfies` — assert a literal matches a type without widening: `const routes = { cart: '/cart' } satisfies Record<string, string>`.
8. **async/await and promises in tests.** `await expect(...).resolves.toBe(...)` for promise assertions; type API helpers as `Promise<User>`; never `return promise` from a test without awaiting (fire-and-forget is a flake source).
9. **Avoiding `any`.** `any` disables checking and is banned by Biome `noExplicitAny` in this collection's standard. Use `unknown` + narrowing when the shape is genuinely unknown, or a minimal interface. `as` casts are allowed only with a comment saying why the type system can't see it.

## Typing the things testers actually build

Full patterns with runnable examples are in `./resources/typing-test-patterns.md`:

- **Fixtures and test data:** type the fixture object once, derive the rest — `type User = typeof defaultUser` then `const u: User = { ...defaultUser, email: 'x@y.z' }`. Factories: `function user(overrides: Partial<User> = {}): User`.
- **Page Objects:** interface per page (`interface CartPage { add(item: CartItem): Promise<void>; total(): Promise<number> }`), class implements it, constructor takes `Page`. Never expose raw locators in the interface.
- **API clients in tests:** one typed `request` wrapper returning `Promise<APIResponse<T>>` with a discriminated union `{ ok: true, data: T } | { ok: false, status: number, body: unknown }` — assertions then narrow on `ok` instead of casting.
- **Mocks:** `mock.module`/vi.mock factories must satisfy the real module's type — use `as typeof import('./real')` sparingly, or better, type the mock factory against the interface the consumer uses.

## tsconfig for test code

Details in `./resources/tsconfig-for-tests.md`. The short version: tests inherit the app's strict config (`strict: true`, `noUncheckedIndexedAccess: true`); add `"types": ["node", "playwright/test"]` (or `bun:test`) in a `tsconfig.test.json` if the app config excludes test globals. `tsc --noEmit` over `src` + `tests` is the CI type gate — Biome formats/lints, tsc type-checks, neither replaces the other.

## Cheatsheet

`./resources/cheatsheet.md` — one-page table: concept → syntax → test example → common pitfall.

## Red Flags

- `any` everywhere "to make it compile" — replace with `unknown` + guard or a real type; if a third-party lib has no types, one `declare module` in a `types/` file, not casts at every call site
- `as unknown as X` double casts in assertions — the assertion itself is probably wrong; assert the real shape
- ignoring `noUncheckedIndexedAccess` by adding `!` — handle the `undefined` case, it is a real edge (empty list)
- test files excluded from `tsc` "because they're tests" — tests are the code most worth type-checking
- over-engineering: deep generic gymnastics in a test file — tests should be boring and readable; types serve clarity, not the other way around

## Related Skills

- `static-code-analysis-typescript` - Biome + tsc + CI setup (the tooling layer above this one)
- `writing-unit-tests` / `writing-unit-tests-quick` - the tests themselves
- `writing-playwright-tests-best-practices` - Playwright-specific patterns that lean on these types
- `test-data-factories` - factory/trait patterns that pair with `Partial<T>` typing
- `refactor-to-page-objects` - Page Object refactoring with typed interfaces
- `testing-with-bun` - Bun runs TS natively, but `tsc --noEmit` still gates types

## Definition of Done

- the tester can read and write typed fixtures, Page Objects, and API helpers without `any`
- `tsc --noEmit` passes over app + test code with `strict` and `noUncheckedIndexedAccess`
- Biome `noExplicitAny` is error-level and green
- at least one real test file was refactored from casts to proper types as the exercise
