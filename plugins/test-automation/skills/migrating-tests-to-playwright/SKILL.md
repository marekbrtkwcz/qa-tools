---
name: migrating-tests-to-playwright
description: 'Migrates Cypress, Selenium, WebdriverIO, or Protractor suites to Playwright in staged slices, each with a parity gate before the old test is deleted. Use when porting a legacy browser suite, when deciding which tests are not worth porting, when a half-finished migration has stalled with two suites running in parallel, or when a suite migration needs a plan before anyone starts translating files.'
argument-hint: 'Source framework and suite path, test count, CI setup, and how much of the suite is currently trusted'
user-invocable: true
---

# Migrating Tests to Playwright

Use this skill when an existing browser suite is moving to Playwright and the migration needs to finish.

The characteristic failure is not a hard translation problem. It is a migration that stalls at 60 percent, leaving two suites, two CI jobs, two sets of conventions, and nobody willing to delete the old one because nobody can prove the new one covers the same ground. Everything below is arranged to prevent that: **slices with parity gates, and a deletion at the end of every slice.**

The second thing this skill insists on: a migration is the cheapest opportunity you will ever get to not port the tests that should not exist. A line-by-line translation preserves the old suite's flakiness, its weak assertions, and its coverage gaps, and adds a migration's worth of risk on top.

## When to Use

- a Cypress, Selenium, WebdriverIO, or Protractor suite is moving to Playwright
- a migration is underway and has stalled with both suites running
- someone is about to start translating files and there is no plan
- the question is which tests to port and which to drop
- a framework is being evaluated and the migration cost needs estimating

## Operating Principles

- **Slices, not a big bang.** Migrate a vertical slice, prove parity, delete the old tests in that slice, then move on. Two suites is a temporary state with a deadline, not a phase.
- **Every slice ends with a deletion.** Without it, the old suite survives forever and the migration is never done.
- **Port behaviour, not code.** The old test's intent is the requirement. Its implementation is not.
- **Triage before translating.** Tests that are flaky, redundant, or prove nothing get dropped or rewritten, not carried over.
- **Parity is measured, not asserted.** A slice is done when the new tests fail on the defects the old ones caught.
- **Adopt Playwright's model rather than emulating the old one.** A Cypress-shaped Playwright suite gets the migration cost and none of the benefit.

## Workflow

### Phase 0: Inventory and triage

This phase is done when every test in the source suite has a class; translation starts after that.

| Class | Signal | Action |
| --- | --- | --- |
| **Port** | Covers real risk, passes reliably, assertions are meaningful | Migrate |
| **Rewrite** | Covers real risk, but is flaky, over-mocked, or asserts nothing | Migrate the intent, write the test fresh |
| **Merge** | Duplicates another test's coverage | Fold into one |
| **Drop** | Tests a removed feature, or proves nothing, or is permanently skipped | Delete, with a note |
| **Defer** | Real coverage, low risk, expensive to port | Backlog, and say so out loud |

Record the counts. "We are porting 140 tests" and "we are porting 90, rewriting 20, dropping 30" are different projects with different estimates.

Run `unslop-tests` over the source suite to make the drop and rewrite decisions on evidence rather than impression. A suite where 30 percent of tests pass with the feature deleted is a suite where the migration should be a rewrite.

### Phase 1: Establish the target shape

Decide the Playwright conventions **before** the first file, or the first ten files set them accidentally.

- fixtures versus page objects, and what goes in each
- auth strategy: `storageState` set up once, not a login in every test
- data strategy: API seeding through fixtures, with teardown
- what stays real and what gets stubbed
- tags and projects
- folder layout

Use `designing-test-automation-architecture` to make these calls and record them.

Write it as a decision record; see `documenting-test-suites`. In eight months someone will ask why the migration did not just keep the old page objects.

### Phase 2: Slice the work

A slice is a **vertical journey**, not a directory. "Checkout" is a slice; "all the tests in `specs/forms/`" is not.

Order slices by:

1. **A thin one first**, to prove the toolchain, CI, reporting, and auth end to end. Two or three tests.
2. **Highest risk next**, so the most valuable coverage moves to the maintained framework earliest.
3. **Most flaky after that**, because those tests are costing time now and the rewrite pays back immediately.
4. **Everything else**, by cohesion.

For each slice record: the source tests, the target tests, the parity evidence, and the deletion commit.

### Phase 3: Translate

Per-construct mappings are in `./resources/cypress-to-playwright-map.md` and `./resources/selenium-to-playwright-map.md`, including the constructs that have no direct equivalent and need a different approach.

Rules while translating:

- **Take the assertion, question the mechanics.** Selectors, waits, and helper chains are the old framework's shape.
- **Waits become web-first assertions.** Explicit sleeps and manual wait helpers are replaced by an assertion on the condition they were waiting for. This is the single largest quality gain available in the migration.
- **Selectors become role or label locators.** A brittle CSS chain is re-targeted, not copied. If the application has no accessible name to target, that is a finding worth raising.
- **Custom commands are re-homed by what they do.** A Cypress custom command is often a fixture, sometimes a helper, and occasionally three unrelated things that should be split.
- **Write native Playwright, with no compatibility layer.** A `cy`-shaped wrapper over Playwright pays the migration cost, keeps the old model, and adds an abstraction nobody else will understand.

### Phase 4: Prove parity

The gate that makes deletion safe. For each slice, work through `./resources/parity-gate-checklist.md`. The load-bearing checks:

- every ported test's intent maps to at least one new test, recorded in a mapping table
- the new tests run green three times consecutively
- **for at least the slice's highest-risk cases, the new test fails when the behaviour is broken.** Break it deliberately and watch. A test that has never failed is a test whose value is unmeasured.
- the new suite's runtime and flake rate are recorded
- the coverage the slice deliberately dropped is listed explicitly

Without the deliberate-break check, parity means "both suites are green", which is compatible with the new suite testing nothing.

### Phase 5: Delete

Same pull request as the parity evidence, or the next one. Not "later".

- delete the source tests in this slice
- remove the source framework's config for the deleted area
- update CI so the old job stops running those tests
- update the README's coverage section

Every slice that ends without a deletion adds to the maintenance burden the migration was supposed to remove.

When the last slice lands: remove the source framework from `package.json`, delete its config, its plugins, and its CI job. A dependency left behind gets updated by a bot forever.

### Phase 6: Track and report

Keep the plan visible using `./resources/migration-plan-template.md`:

- slices done, in progress, and remaining
- tests ported, rewritten, merged, dropped, deferred
- runtime and flake rate, old suite against new
- coverage deliberately dropped, in one list
- the projected finish date, updated honestly

A stalled migration is usually a migration nobody was reporting on.

## Common Failure Modes

- translating file by file in alphabetical order, so the highest-risk coverage moves last
- porting the flaky tests unchanged, importing every problem into the new suite
- a wrapper that makes Playwright behave like the old framework
- dropping coverage silently instead of listing it
- migrating without deciding the target architecture, so the first ten files become the convention

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "Both suites are green, so we have parity" | Two green suites are compatible with the new one testing nothing. Break the highest-risk behaviour in each slice and quote the new test failing on it. |
| "Let's keep the old tests running a bit longer for confidence" | Two suites double maintenance and leave the migration permanently unfinished. Delete the slice's source tests in the same or the next pull request, once parity is shown. |
| "A straight translation is faster; we can clean up later" | Line-by-line ports carry the old waits, selectors, and weak assertions across, and later rarely comes. Translate the intent into Playwright's model now. |
| "I'll keep the sleep, it was there for a reason" | The reason was a condition it waited for. Find that condition and assert on it with a web-first assertion. |
| "Every test should be ported, dropping coverage is risky" | Porting a test that proves nothing is migration cost with no coverage. Triage first, and list every dropped test with why in one place. |
| "We'll remove the old framework once everything's moved" | Leftover dependencies, configs, and CI jobs outlive the migration. Remove them in the change that lands the last slice. |

## Red Flags

- A ported test containing `waitForTimeout`, `sleep`, or a manual polling helper.
- CSS chains or XPath copied verbatim from the source test.
- A helper module whose API mirrors `cy.*` or WebDriver calls.
- A slice marked done with no deletion commit for its source tests.
- A parity claim with green runs only, and no quoted failure on deliberately broken behaviour.
- Fewer source tests deleted or ported than the inventory classified, with no entry in the dropped-coverage list.
- The source framework still in `package.json` or CI after the final slice.

## Resource Map

- `./resources/cypress-to-playwright-map.md` - construct-by-construct mapping, including custom commands, intercepts, and the constructs with no equivalent
- `./resources/selenium-to-playwright-map.md` - Selenium and WebdriverIO mapping, waits, page objects, and grid to project matrix
- `./resources/migration-plan-template.md` - slice plan, inventory counts, progress tracking, and the report format
- `./resources/parity-gate-checklist.md` - the per-slice gate, including the deliberate-break check and the deletion step

## Related Skills

- `designing-test-automation-architecture` - to decide the target shape before the first file is translated
- `unslop-tests` - to triage the source suite so weak tests are rewritten rather than ported
- `playwright-automation-engineer-ts` agent - for how the ported tests should be written
- `mocking-network-and-time` - when the source suite's intercepts and stubs need re-expressing
- `stabilizing-flaky-tests` - for the source tests classified as rewrite because of flakiness
- `automating-ci-test-pipelines` - for the CI transition and running both suites during the overlap
- `documenting-test-suites` - to record the migration decision and the new conventions

## Definition of Done

This skill is complete when:

- the inventory classifies every source test as port, rewrite, merge, drop, or defer, with counts per class that sum to the suite total
- the target-architecture decision record exists at a stated path and predates the first translated file
- the slice plan lists vertical journeys, with the thin proving slice first and the highest-risk slice second
- a search of the new suite for fixed waits, copied CSS/XPath chains, and old-framework wrappers returns nothing, with the search quoted
- each slice has a mapping table from old test intent to new test
- each slice has three consecutive green runs quoted, and a quoted failure of its highest-risk tests on deliberately broken behaviour
- each slice links the commit or pull request that deleted its source tests
- dropped coverage is listed in one place, one line per dropped test with the reason
- after the last slice, the source framework, its config, and its CI job are gone from the repository
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
