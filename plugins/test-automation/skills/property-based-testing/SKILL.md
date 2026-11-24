---
name: property-based-testing
description: 'Generates inputs instead of hand-picking them: property identification (invariants, round-trips, oracles, idempotence), fast-check generators and shrinking in Vitest or Jest, seed control for reproducible failures, bounded runtime, and shrunk failure cases pinned as regression examples. Use when a parser, serializer, calculator, state machine or data transform is tested with only happy-path examples, or when one function has more input combinations than any example list can honor. For cataloging edge cases by hand use edge-case-scenario-generator.'
argument-hint: 'The function or system under test, its input domain, invariants or oracles you can name, and the runner it plugs into'
user-invocable: true
---

# Property-Based Testing

Use this skill when a pure-ish unit of logic - parser, serializer, date router, price calculator, reducer, state machine - is "covered" by a handful of examples, and the next weird input is already on its way from production.

Example-first testing verifies the cases somebody imagined. Property-based testing swaps the question from "does f(2,3) = 5?" to "for every valid input, which statements must hold?" - and generates the input space, including the cases nobody imagined. Its cost is honest: properties are harder to name than examples, so this skill is also about **when not to pay it**.

## When to Use

- a function has a large or structured input space where hand-written cases sample only the middle
- the same class of bug (encoding, boundary, negative numbers, empty collections, unicode) recurs in production in different functions
- round-trip or oracle relations exist (serialize→parse, normalize idempotence, monotone reordering) that examples only gesture at
- a reducer/state machine must hold invariants across sequences of actions, not just single transitions

Not for: thin I/O wrappers, framework glue, UI, or anything whose contract is "match one golden response" - those are contract mocking (`mocking-network-and-time`, `testing-api-contracts`) or E2E territory.

## Operating Principles

- **A property is a sentence a domain expert would sign.** "parsed(serialize(x)) equals x for every valid x", "adding an item never decreases the total", "the discount never exceeds the price". If the sentence needs the implementation to state it, it is not a property yet.
- **The generator is the spec of the input domain.** What the generator can produce is what the property holds over; an under-specified generator silently shrinks the contract. Constrain via `fc.integer({ min, max })`, `fc.stringMatching`, custom combinators - never by filtering outputs after the fact (that skews the distribution).
- **Shrinking is the feature.** fast-check minimizes a failing input to the smallest counterexample; a property suite is only half-done if CI reports a failure nobody can reproduce in a one-liner.
- **Seed and report.** Each run on a seed; failures reported with the seed and the shrunk counterexample; golden failing cases then get pinned as plain examples so the regression stays visible after the fix.
- **Budget the runtime on purpose.** High `numRuns` locally, bounded in CI; a property suite that doubles CI time gets disabled - decide the budget when writing the test, not after the bill.

## Workflow

1. **Name the property before the generator.** One sentence per property; the standard families to try, in order: round-trip (inverse functions), oracle (a second, simpler implementation), invariant (state that cannot go wrong), metamorphic (input transformation with predictable output relation), idempotence (applying twice = applying once).
2. **Build generators for the domain.** Compose fast-check primitives (`fc.integer`, `fc.date`, `fc.string`, `fc.array`, `fc.record`); constrain to the documented domain; for structured or stateful cases write a custom ` Arbitrary` or an `fc.commands`-based model. State the domain boundaries you excluded and why.
3. **Write the check.** `fc.assert(fc.property(gen1, gen2, (a, b) => invariant))` in Vitest/Jest - one property per test so the failure names the broken promise, not a list.
4. **For state machines, prove against a model.** Commands (`fc.commands`) drive the real system and a simple model; the property asserts the two stay equivalent across every generated sequence.
5. **Control seeds and pin regressions.** Explicit `seed` for reproducibility; when a property fails, save the shrunk counterexample as a commented, dual-run example test beside it.
6. **Run inside a budget.** Set `numRuns` (default 100 is often right; go higher only for cheap pure functions), quote the run time in the summary, and keep the suite inside the CI budget from day one.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "Property tests replace example tests" | Failures become inscrutable shrinks; teammates lose trust and delete them. | Properties verify the space; pinned examples document and regression the known cases. |
| "Generate any string, filter to valid ones" | Filtered generators bias toward unlucky regions and slow the run. | Constrain the generator itself; document the excluded domain. |
| "Set numRuns to 10000, more is better" | CI minutes balloon; the suite gets skipped or deleted - the worst outcome. | Bound runs by what the function deserves; quote the budget. |
| "Compare against the implementation itself" | The test then only proves f agrees with f. | An oracle must be independently simple (a model, an inverse, a spec sentence). |
| "Shrink output is noise, just rerun" | The minimized counterexample was the bug report. | Pin the shrunk case as an example test before fixing. |

## Red Flags

- A "property" that is an example in a loop with one fixed input.
- A generator with `.filter()` doing the domain's work.
- Unseeded runs on a server with no seed in the failure report.
- Properties that inspect private state instead of a user-observable outcome.
- A PBT file that only runs locally because of runtime.

## Related Skills

- `edge-case-scenario-generator` - when a property cannot be named but the edge catalog can (and PBT then feeds it the cases nobody listed)
- `writing-unit-tests` - example discipline; the pinned regressions from PBT live by its rules
- `unslop-tests` - the review pass when properties hold but prove nothing observable
- `testing-api-contracts` - input-domain contract for boundary validation across service edges
- `static-code-analysis-typescript` - complements generation with typed domains via branded types

## Definition of Done

This skill is complete when:

- every property is stated as a sentence a domain expert could sign, listed in the test file or summary
- generators encode the documented input domain, constrained at the source, with excluded ranges stated
- stateful verification (where present) runs against an explicit model, not the implementation
- seeds are set, failures would report seed and shrunk counterexample, and known counterexamples are pinned as examples
- `numRuns` is chosen deliberately and the quoted runtime shows the suite inside the CI budget
- the run output is quoted with pass counts per property
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

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
