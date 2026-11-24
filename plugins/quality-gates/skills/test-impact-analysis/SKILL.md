---
name: test-impact-analysis
description: "Decides which tests to run for a given change using coverage data: maps changed code to the tests that execute it (diff coverage / static call graph), producing a minimal confidence set instead of running the whole suite. Use when the full suite is too slow for the PR gate, when total coverage looks healthy but the diff is untested, or when scoping a smoke run after a hotfix. For tag-based change classification see scoping-change-relevance."
argument-hint: "The diff or PR to analyze, the coverage data format available (LCOV/Cobertura), and the suite runtime budget"
user-invocable: true
---

# Test Impact Analysis

Running everything on every commit is the reason suites get bypassed. This skill computes the minimal set of tests that can actually catch a regression in the given diff, from coverage data - not from vibes.

## Operating Principles

- **Impact comes from execution, not from file proximity.** A test that never executes the changed lines cannot catch the change; a file-level guess over-runs.
- **Uncovered changed lines are the finding.** If the diff's risky lines have no executing test, that is a BLOCK, not a smaller test set.
- **Coverage data must be fresh.** Stale LCOV from last release maps the wrong lines; regenerate or state the age.
- **The impact set is a floor, not a ceiling.** CI can add the full suite nightly; the PR gate runs the impact set plus the always-run smoke.

## Workflow

1. **Get the diff** (`git diff main...HEAD`) and extract changed line ranges per file.
2. **Get coverage data** (LCOV/Cobertura from the last full run) and map each changed line to executing tests. Tools: `danger` + coverage, `jest --findRelatedTests`, `pytest --lf` with coverage, or a small script over the LCOV.
3. **Classify:** changed lines covered -> their tests are the impact set; changed lines uncovered -> list them as gaps; test-only changes -> run those tests.
4. **Combine with risk tags** from `scoping-change-relevance` (new endpoint, auth change, migration => add the matching smoke/regression set even if coverage is thin).
5. **Report:** impact set size, estimated runtime vs budget, uncovered risky lines (BLOCK candidates), and what the nightly full run still covers.

## Red Flags

- "the diff touches auth, run everything" - run the auth suite plus impact set, not the world
- impact set computed from coverage older than the last merge to main
- a green impact-set run presented as "the change is safe" while risky lines were uncovered
- PR gate time creeping up because the impact set silently became the full suite

## Related Skills

- `verifying-change-coverage` - the diff-coverage gate that escalates uncovered high-risk changes
- `scoping-change-relevance` - tag-based classification that complements execution-based impact
- `automating-ci-test-pipelines` - wiring the impact set as the PR job and full suite as nightly
- `analyzing-regression-scope` - blast-radius reasoning for what to retest first

## Definition of Done

- impact set computed from current coverage data, with the data's age stated
- every changed risky line is either covered by a listed test or listed as a gap
- PR gate runs impact set + smoke within the stated runtime budget
- nightly full suite still scheduled and green
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
