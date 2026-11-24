---
name: review-requirements
description: Reviews a user story, PRD, or acceptance criteria for ambiguity, contradictions, missing states, and untestable statements, and returns clarifying questions plus rewritten, testable acceptance criteria. Use when a story is about to enter implementation or sprint planning, or when it keeps getting reopened because people read it differently. To check whether a finished implementation meets its criteria, use the verify-acceptance-criteria command.
argument-hint: "[requirements]"
disable-model-invocation: true
---

# Review requirements for testability

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `requirements`: user story, PRD section, acceptance criteria, or a file path

## Who does the work

Hand this task to the `qa-strategist` agent (`qa_strategist` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `requirements-test-coverage-mapper` skill is installed, load it before starting.

Your goal is to find the defects in the requirements before they become defects in the product.

Review the requirements provided: <requirements>

Ask only for missing essentials:

- the requirements text or file, if not provided
- where this feature sits in the product, if the context is unclear

Then run these review passes and report what each one finds:

1. **Testability** - can each statement be verified with a concrete check? Flag vague terms ("fast", "user-friendly", "should work"), missing measurable thresholds, and criteria that describe implementation instead of observable behavior.
2. **Ambiguity and contradiction** - statements open to multiple readings, conflicting rules, undefined terms, and unstated assumptions.
3. **Completeness of states** - error states, empty states, loading states, boundary values, and limits that the requirements never mention.
4. **Entity lifecycle** - for each object the feature creates or touches: can it be read, updated, deleted, duplicated, or orphaned, and is each transition specified?
5. **Roles and permissions** - who may perform each action, and what each other role sees or is denied.
6. **Cross-feature impact** - interactions with existing features, shared data, and concurrent use that the requirements ignore.
7. **Non-functional gaps** - performance, security, accessibility, and observability expectations that are implied but never stated.

Do not invent product decisions: where a rule is missing, produce a question for the product owner, not an assumption presented as fact.

## Output format

Return Markdown only, with:

- a verdict: ready for development / needs clarification, with a short justification
- findings grouped by review pass, each with severity (blocker / major / minor)
- a numbered list of clarifying questions, ordered by how much each answer unblocks
- rewritten acceptance criteria for the worst offenders, in a testable given/when/then or checklist form
- suggested follow-up: feed the clarified requirements into `manual-test-cases`, `generate-gherkin-scenarios`, or `map-requirements-coverage`
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
