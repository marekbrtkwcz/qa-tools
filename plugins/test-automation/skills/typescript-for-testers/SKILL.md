---
name: typescript-for-testers
description: "TypeScript fundamentals for testers who write automated tests: types and inference, interfaces vs type aliases, generics, unions and type guards, async/Promise typing, utility types, discriminated unions, strict tsconfig, typing fixtures and Page Objects, avoiding `any`. Use when onboarding a tester to TypeScript, leveling up a team on TS in tests, or reviewing test code that fights the type system. For tooling (Biome, tsc, CI gates) use static-code-analysis-typescript; for writing the tests use writing-unit-tests or writing-playwright-tests-best-practices."
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
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
