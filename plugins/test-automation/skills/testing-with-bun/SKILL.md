---
name: testing-with-bun
description: "Runs and writes tests with the Bun runtime: `bun test` and the Jest-compatible `bun:test` API (describe/it/expect, mock.module, snapshots), bunfig.toml preload and coverage, watch mode, when to pick `bun test` over `node --test` or Vitest, and running Playwright under Bun (`bunx playwright test`). Use when a TS project uses Bun as its runtime/package manager and the test suite should run on it, or when suite speed is the bottleneck. For lint/format/type gates under Bun, use static-code-analysis-typescript."
argument-hint: "Current test runner and pain point (speed, config, compatibility)"
user-invocable: true
---

# Testing with Bun

Bun is a runtime, package manager, and test runner in one binary. This skill covers the **test-runner** role only; lint/format/type-check under Bun are covered by `static-code-analysis-typescript` (Biome + `tsc --noEmit` behave identically under Bun).

## When to Use

- "run our tests with Bun" / "migrate Jest or Vitest tests to `bun test`"
- "the suite is slow to start or run — can Bun help?"
- "Playwright tests under Bun: `bunx playwright test`"
- "configure preload/mocks globally for the suite" (`bunfig.toml`)
- deciding between `bun test`, `node --test`, and Vitest for a new project

## Choosing a runner

| Runner | Pick when |
| --- | --- |
| `bun test` | project already on Bun; Jest-style API wanted with zero config; fastest startup and execution for unit/integration tests |
| `node --test` | zero-dependency Node project, no extra runtime; native TS via type stripping on Node >= 24 |
| Vitest | need the Vitest ecosystem (workspace projects, UI mode, coverage via v8/istanbul, plugins), or the team already knows it |

Bun's test runner is **not** a reason to rewrite a green Vitest suite. Adopt it for new suites or when measured startup/run time is the bottleneck.

## Core workflow

1. **Run the suite:** `bun test` (discovers `*.test.ts` / `*.spec.ts`). Watch: `bun test --watch`. One file: `bun test path/to/file.test.ts`.
2. **API:** `import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'` — Jest-compatible (`expect(...).toBe`, `toHaveBeenCalledWith`, etc.), so most Jest tests run unchanged. TypeScript works natively — no loader, no build step.
3. **Module mocks:** `mock.module('module-name', () => ({ ... }))` — hoisted like `jest.mock`; restore with `mock.restore()` in `afterEach`.
4. **Snapshots:** `expect(x).toMatchSnapshot()`; update with `bun test --update-snapshots`.
5. **Coverage:** `bun test --coverage` (reports per-file line/function coverage; thresholds via `--coverage-threshold` if needed).
6. **Global setup (preload):** `bunfig.toml` at repo root:
   ```toml
   [test]
   preload = ["./test/setup.ts"]
   ```
   `test/setup.ts` registers global mocks, a DOM (`happy-dom` via `GlobalRegistrator`), fake timers, or test data builders. Keep it idempotent.
7. **Playwright under Bun:** install once with `bun add -D playwright` + `bunx playwright install`, then run tests with `bunx playwright test` (or keep `bun test` for unit tests and Playwright's own runner for E2E — mixing runners in one repo is fine if each suite has one runner).

## Rules

- **One runner per suite.** Do not split a single suite between `bun test` and Vitest; the mock/preload semantics differ subtly.
- **Same test-quality bar:** `bun test` does not excuse weak assertions — `unslop-tests` applies in full (no tautologies, no mock-only tests, no swallowed errors).
- **Type-check separately:** Bun strips types without checking them. Keep `tsc --noEmit` in CI as the type gate; `bun test` is the behavior gate.
- **Pin the binary:** `bun --version` in CI logs; behavior differs across Bun versions more than across Node LTS lines.
- **Playwright needs its browsers:** `bunx playwright install --with-deps chromium` on CI images; Bun does not replace that step.
- **Lockfile:** commit `bun.lock`; use `bun install --frozen-lockfile` in CI.

## Red Flags

- rewriting a passing Vitest/Jest suite to Bun for speed without a measured baseline (measure first: `time bun test` vs current runner on the same machine)
- `mock.module` leaks between tests because there is no `mock.restore()` — shared mutable mocks are the classic Bun flake source
- assuming `bun test --coverage` numbers are comparable to Vitest v8 coverage — they are not; pick one and trend it (`analyzing-quality-metrics`)
- running E2E Playwright specs through `bun test` instead of `playwright test` — you lose retries, sharding, trace viewer, and the reporter contract CI expects

## Related Skills

- `static-code-analysis-typescript` - Biome + `tsc --noEmit` under Bun (lint/format/type gates)
- `bootstrap-test-suite` - scaffolding the first suite (runner choice included)
- `writing-unit-tests` / `writing-unit-tests-quick` - the assertion quality bar, runner-agnostic
- `mocking-network-and-time` - what to fake and how, including MSW handlers that work under any runner
- `unslop-tests` - test anti-patterns; applies to `bun:test` code identically
- `test-data-factories` - deterministic fixtures for `bun test` suites
- `automating-ci-test-pipelines` - CI jobs running `bun test` with cache on `bun.lock`

## Definition of Done

- the suite runs green with one command (`bun test`, or `bunx playwright test` for E2E) on a clean clone
- `bunfig.toml` preload exists if global setup is needed, and mocks are restored between tests
- `tsc --noEmit` still passes — Bun strips types, it does not check them
- coverage is reported from one chosen tool and wired into the quality metrics
- CI runs the suite with `bun install --frozen-lockfile` and logs the Bun version
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
