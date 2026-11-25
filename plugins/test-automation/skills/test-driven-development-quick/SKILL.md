---
name: test-driven-development-quick
description: 'Runs the red-green-refactor loop with a compact rule set for one small behavior or bug fix. Use for routine TDD on a single function or small change, or when the request asks to write the test first for something small. For larger features, legacy code, or a session that needs a cycle log, use test-driven-development.'
argument-hint: 'The behavior to build or bug to fix, and the test runner already used in the project'
user-invocable: true
---

# Quick TDD

A compact standard for the red-green-refactor loop: enough to keep every change verified, short enough to read in one pass.

Framework-agnostic - match whatever runner and assertion style the project already uses. If none exists, ask which runner to target before the first test.

## When to Use

1. Build one new behavior test-first.
2. Fix a bug by reproducing it with a failing test.
3. Add a small branch or rule to code that already has tests.

Escalate to `test-driven-development` when the feature spans several units, needs an outside-in double loop, enters untested legacy code, or runs long enough to need a cycle log. Use `writing-unit-tests` when the code already exists and tests are being added after the fact.

## Before the First Test

State three things:

- the **behavior** being built, in the user's vocabulary
- the **seam** - the public interface a real caller would use, which the tests observe through; name it and get it confirmed rather than assuming it
- the **test list** - the behaviors to build, smallest and most central first, worked one at a time

The list is a queue, not a batch. Writing all the tests up front verifies imagined behavior and locks in a shape nobody has validated.

Match the project's existing runner, test locations, and naming, and find the command that runs a single test file - the loop only works while observing red and green is cheap.

## The Loop

### Red

1. Write **one** failing test for the next list entry.
2. Run it and read the real output.
3. Confirm it fails on the **missing behavior** - not a typo, missing import, or broken fixture. A mechanical failure is not red: fix it and run again.
4. If it passes immediately, stop. Either the behavior exists already or the test asserts nothing.
5. Trace the expected value to the spec, a worked example, or a known-good literal. A value imported from the code or recomputed with its formula passes by construction.

### Green

Write the simplest thing that passes. Pick by confidence:

- **Obvious implementation** - you know exactly how it works
- **Fake it** - return a constant, and let a queued test force the real logic
- **Triangulation** - add a second test with different data that the constant cannot satisfy

Then run the **full suite**, not just the new test, and leave cleanup for the refactor step.

A fake is fine only while a listed test will remove it. A fake with nothing scheduled to kill it is a bug with a passing test.

Substitute only what you do not own - clock, randomness, network, storage. If getting to green needs a mock of your own module, the seam is wrong; say so instead of mocking your way through.

### Refactor

Under green only, one change at a time, running the suite after each: remove duplication, fix names, split what grew too big - in the tests as well as the code. Structure only, never behavior. If a refactor goes red, revert it rather than debugging forward.

Commit at green, then take the next entry.

## The Rules

1. **Red before green.** No production code without a failing test demanding it.
2. **Evidence, not assertion.** Actually run the tests and quote the real output. Never claim red or green unseen.
3. **Minimal implementation.** Only the code the current test demands - no speculative branches.
4. **One slice at a time.** One behavior, one test, one implementation.
5. **Refactor only under green**, and never mix it with the green step.
6. **Drive the public seam**, never private methods.
7. **Assert against an independent source of truth**, never a value the implementation hands you.
8. **Reach green by changing the code, not the test.** If an assertion has to change, the specification changed - say so and get it confirmed.
9. **Match step size to confidence.** Repeated failure to reach green means the step was too big - revert to the last green and split the behavior.

## Bugs: Reproduce First

1. Write a test that fails **because of the bug**, at a seam that reaches the real failure path.
2. Confirm the failure matches the reported symptom, not a different one nearby.
3. Shrink it until every remaining element is load-bearing.
4. Fix the code until it passes, then re-check the original scenario.
5. Keep the test - it is the regression guard. If the bug was intermittent, make the repro deterministic first and say which signal the test locks down.
6. Stage the failing test before the fix, so history reads red then green. A test written after the fix has never been seen catching the bug.

## When to Step Out

Say so and stop looping when the behavior needs a real network, database, or browser to prove (integration work), when the change is a pure rename or mechanical migration, when there is no independent source of truth to assert against (config, wiring, straight delegation), or when the design is too open to express as an assertion yet - spike first, throw the spike away, then start cycling.

Drive the loop with the fastest test that observes the behavior; browser and end-to-end coverage is written after the behavior works.

Stepping out is not skipping verification. Name the closest check you can actually run - a script, a manual repro command, an output comparison, a type check - run it before and after, and report that output in place of the red-green pair. Prefer no test to a bad test, but never a silent skip.

## Common Failure Modes

- writing all the tests first, then all the implementation
- red that fails on a missing import, so the assertion is never exercised
- stubbing modules you own until the test passes, which only proves the stubs were called
- a fake left in place because nothing was queued to generalize it
- cleanup smuggled into the green step, so a failure has two causes
- running only the new test and finding the regression several cycles later

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll write the code first and the test right after" | That test has never been seen failing. Write it, run it, quote the red, then write the code. |
| "The assertion was too strict anyway" | Loosening it to reach green changes the spec. Fix the code, or name the spec change and get it confirmed. |
| "Too small to need a test, I'll just report the fix" | Step out only for a reason above, and then run and quote a named substitute check. |

More excuses and their answers: the Common Rationalizations table in `test-driven-development`.

## Red Flags

- Production code is edited before any failing test output appears.
- The quoted "red" is an import, syntax, or fixture error.
- The change that goes green also edits an expected value, skips, or deletes a test.
- "Tests pass" is claimed with no command or full-suite output quoted.

## Related Skills

- `test-driven-development` - the full loop: double loops, legacy entry, stuck protocol, cycle log
- `writing-unit-tests` - the quality standard each test the loop produces must meet
- `writing-unit-tests-quick` - the compact version of that standard

## Definition of Done

- every production change is preceded by quoted output of an assertion failing on the missing behavior
- every expected value traces to the spec, a worked example, or a literal
- the diff doubles only clock, randomness, network, or storage, and no fake remains without a listed test to remove it
- the diff weakens, skips, or deletes no existing assertion
- each refactor step is followed by a passing suite run
- the final full-suite output is quoted, and each bug fixed has a regression test whose red run on the unfixed code is quoted
- unbuilt test-list entries are listed in the report
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
