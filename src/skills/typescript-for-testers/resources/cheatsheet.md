# TypeScript cheatsheet for testers

One page. Syntax → test-flavored example → the pitfall that bites in suites.

| Concept | Syntax | Test example | Pitfall |
| --- | --- | --- | --- |
| Literal inference | `const s = 'cart'` | `const route = '/cart'` → type `'/cart'` | widen with `: string` when assigning later |
| Annotation at boundaries | `function login(u: User): Promise<void>` | helper + factory signatures | annotating every local — noise |
| Interface | `interface User { id: string; email: string }` | DTOs, Page Object contracts | using `type` and `interface` interchangeably in one file |
| Union | `type Status = 'ok' | 'error'` | API result `status` | `string` instead of the union — typos compile |
| Discriminated union | `{ kind: 'ok', data: T } \| { kind: 'err', status: number }` | `if (res.kind === 'ok') res.data` | accessing `data` without narrowing |
| Type guard | `function isUser(x: unknown): x is User` | parsing API JSON | `JSON.parse` returns `any` — guard it |
| Optional chaining | `user?.address?.city` | reading nested fixture data | forgetting `strictNullChecks` lets `undefined` through |
| Nullish coalescing | `opts.timeout ?? 5000` | test options with defaults | `||` also replaces `0`/`''` — wrong default |
| Array type | `CartItem[]` | `const items: CartItem[] = []` | `arr[0].name` under `noUncheckedIndexedAccess` is an error — handle it |
| Record (map) | `Record<string, CartItem>` | items keyed by id | using arrays + `find` for lookups |
| `noUncheckedIndexedAccess` | tsconfig flag | `const first = arr.at(0); if (!first) return` | silencing with `!` — empty list is a real case |
| Generic (consume) | `Promise<User>`, `APIResponse<Cart>` | awaiting typed helpers | writing generics before you need them |
| Generic (write) | `function factory<T>(d: T): () => T` | test-data factories | `T extends object` constraints forgotten |
| Utility: Partial | `Partial<User>` | `user({ email: 'x@y.z' })` overrides | passing full objects — defeats the point |
| Utility: Pick/Omit | `Pick<User, 'id'\|'email'>` | slim DTO for assertions | duplicating fields by hand |
| Utility: Awaited | `Awaited<ReturnType<typeof getUser>>` | unwrapping promise layers | manually unwrapping `Promise<Promise<X>>` |
| `satisfies` | `cfg satisfies TestConfig` | route maps, env config | using `as` instead — loses literal checking |
| `unknown` + narrow | `const body: unknown = await res.json()` | then guard/cast once | `any` from `JSON.parse` leaking everywhere |
| async test | `test('...', async () => { await ... })` | all Playwright/Vitest tests | returning a promise without `await` — fire-and-forget flake |
| Promise assertion | `await expect(p).resolves.toBe(200)` | API status assertions | `expect(await p)` vs `resolves` confusion on rejections |
| readonly | `readonly items: CartItem[]` | fixture data nobody mutates | mutating shared fixture — cross-test pollution |

Rule of thumb: **types serve readability of the test**. If a type annotation makes the test harder to read, the annotation is wrong, not the test.
