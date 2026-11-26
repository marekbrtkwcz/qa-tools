---
name: component-testing-vitest-rtl
description: 'Writes component tests with Vitest and Testing Library (or Playwright Component Testing for a real browser): behaviour through rendered output accessible to a user, role-based queries, userEvent over fireEvent, cleanup and query-order discipline, and a clear line between component and unit/E2E tests. Use when a component is verified by testing its props instead of what it renders, React/Vue/Svelte components need fast feedback below E2E, or a team argues what belongs at the component layer. Layer plan: designing-test-automation-architecture. Module-level doubles: writing-unit-tests.'
argument-hint: 'The component(s) under test, the framework and renderer, the behaviours to verify, and the existing runner setup if any'
user-invocable: true
---

# Component Testing (Vitest + Testing Library)

Use this skill when components are tested by touching their internals - props, state variables, private methods - or when E2E is carrying coverage that would be faster and more precise one layer down.

A component test renders the component and verifies what a user can perceive: what is on screen, what `role` and labels it exposes, what changes after interaction. Anything the user cannot perceive is an implementation detail, and asserting it makes the test break on refactors without ever catching a real regression.

## When to Use

- a React/Vue/Svelte component has no test under it and only E2E covers the flow
- existing component tests assert `props` snapshots or internal state and break on harmless refactors
- a bug report traces to component-local logic (loading states, error surfaces, conditional UI) with no test to pin it
- the team needs the component-vs-E2E split decided and written down

## Operating Principles

- **Query like a user.** Query order: accessible role, then label/placeholder/text, `data-testid` last. A query that can only find the element by nth-child is a finding about accessibility, not a technique to keep.
- **Simulate like a user.** `userEvent` over `fireEvent`: pointer sequences, focus, and keyboard state behave as in the browser. `fireEvent` is for cases userEvent cannot express, and the test says why.
- **Assert behaviour, not structure.** The component promised "disables submit while pending", not "renders a `<button disabled>` with className X".
- **One component test file per component, mock at its boundaries.** Sibling components and data fetching are mocked (MSW or props); logic inside the component stays real. Mocking children you do not own is `testing-api-contracts` territory, guarding drift with the real specification.
- **Cleanup default, render isolated.** No shared DOM state between tests; the runner cleans up automatically (Vitest with globals or explicit `cleanup`), and shared state is a flake waiting in CI.
- **jsdom by default, real browser when it must be real.** jsdom/happy-dom for speed; Playwright Component Testing when layout, focus behaviour, or browser-only APIs are the thing under test. Say which and why when both exist.

## Workflow

1. **Set up the runner if absent:** Vitest, the Testing Library bindings for the framework (`@testing-library/react` / `vue` / `svelte`), `userEvent`, plus `jsdom` (or `happy-dom`) declared as the test environment in `vitest.config.ts` - never in-repo guesswork about the DOM; note that `bootstrap-test-suite` covers the whole first-scaffolding pass if nothing exists yet.
2. **Write the accessibility map before the assertions.** List the roles, labels, and states the component is supposed to expose for the behaviours in scope. Missing roles are findings, not test impediments.
3. **Write behaviour-first cases.** Each test renders the component with props arranged for one scenario, drives it with `userEvent`, and asserts on rendered output: presence of feedback, disabled state, the announced error, the updated list. Data-driven variants via `it.each`-style loops when only inputs vary.
4. **Mock only at the boundaries.** Data fetching through MSW handlers (kept strict - unmatched requests fail the test, per `mocking-network-and-time`), sibling components with minimal stubs that preserve their rendered roles. Module-mocking the component's own files is a smell from `unslop-tests`.
5. **Cover the states users hit:** loading (skeletons that actually gate interaction), empty, error from the API (assert the human message, not the toast wrapper class), and boundary inputs - the states E2E rarely reaches cheaply.
6. **Run headless and watched.** `vitest run` for CI, `vitest` for local feedback; both in `package.json` scripts. Quote the run output.
7. **Place the results in the layer plan.** Note in the suite docs which regressions this file replaces at E2E level, and load `designing-test-automation-architecture` when the component layer grows past a handful of files.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "Snapshot the render, it catches everything" | It catches nothing a reviewer can name and fails on every intentional style change. | Assert the specific behaviours in prose above each block. |
| "Use data-testid everywhere, roles are flaky" | Roles only break when the UI actually stopped being accessible - that is signal, not noise. | Query by role/label; treat a role flake as a component finding. |
| "fireEvent('click') is the same as a user" | It skips pointer and focus semantics, so hover, focus-visible, keydown-after-focus bugs slip through. | `userEvent`; reserve `fireEvent` with a stated reason. |
| "Just module-mock the store" | The test then verifies the mock agrees with itself. | Render real, mock at the data boundary (MSW) or via props. |
| "jsdom is enough for the tooltip test" | Layout and focus behaviour differ from the real browser; the test lies confidently. | Move focus/layout-dependent cases to Playwright CT and say which suite owns them. |

## Red Flags

- Assertions on component instance internals (`wrapper.vm`, private state) or CSS class strings instead of roles and text.
- `getByTestId` where a role or label query exists (or should exist - the finding).
- No cleanup, or tests that pass only in watch mode because they reuse leaked DOM.
- MSW handlers with a catch-all passthrough; unmatched requests must fail.
- A component suite so slow it runs only on pre-commit, so nobody runs it.

## Related Skills

- `designing-test-automation-architecture` - deciding component vs unit vs E2E placement, memorably the layer that most needs a written decision
- `writing-unit-tests` - module-level logic without a DOM
- `mocking-network-and-time` - MSW handler discipline and strict unmatched requests
- `unslop-tests` - the review pass when a component suite is green but proves nothing
- `bootstrap-test-suite` - first scaffolding when no runner exists at all

## Definition of Done

This skill is complete when:

- the component's roles and labels were listed before assertions were written, and gaps are findings
- tests query by role or label, use userEvent, and assert rendered behaviour rather than implementation details
- data fetching is mocked at the MSW boundary with strict unmatched-request behaviour
- loading, empty, and error states each have at least one test asserting the user-visible outcome
- runs are quoted: `vitest run` output showing pass counts for the new suite
- the layer placement decision is stated (what this suite covers so E2E does not have to)
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
