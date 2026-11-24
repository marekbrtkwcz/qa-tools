---
name: derive-test-cases-from-code
description: Reads a function, module, or diff, derives white-box test cases from its actual branches, boundaries, and error paths, and marks each as covered, partial, or missing against existing tests. Use when code exists but its tests are thin, before refactoring legacy code, or when reviewing a diff for untested paths. To derive cases from requirements instead of code, use the manual-test-cases command.
argument-hint: "[target]"
disable-model-invocation: true
---

# Derive test cases from code

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `target`: file path, folder, or diff to analyze

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `designing-functional-tests` skill is installed, load it before starting.

Your goal is to derive test cases from what the code actually does, not from what the requirements say it should do. This complements the `manual-test-cases` command, which works from requirements.

Analyze the target code. Priority order:

1. The current selection: the code the user selected or pasted
2. The active file: the file the user is working on
3. A file, folder, or diff provided in the request: <target>

If none of these yields a target, ask me to pick one before continuing.

Then do the following:

1. Map the testable surface: public functions, branches, loops, boundary conditions, error handling, side effects, and external dependencies.
2. Derive test cases for:
   - each meaningful branch and decision outcome
   - boundary values visible in the code (limits, comparisons, off-by-one risks)
   - error and exception paths, including how failures propagate
   - input validation and type/format edge cases
   - state and side effects: what must be set up and what must be verified afterwards
3. Search for existing tests covering this code and mark each derived case as **covered**, **partially covered**, or **missing**.
4. Flag testability problems you noticed: hidden dependencies, non-deterministic behavior, or logic that cannot be reached from any public entry point.
5. Prioritize the missing cases by risk.

## Output format

Return Markdown only.
Use a table: `ID | Target (function/branch) | Case | Input/Setup | Expected Result | Level (unit/integration/e2e) | Coverage | Priority`.
End with the top gaps to close first and, when relevant, which cases are good candidates for the `test-generator` command.

## Constraints

- Derive expected results from the code's actual behavior; if the code looks wrong, flag the suspicion instead of inventing a requirement.
- Do not create or edit any files - this is analysis and design only.
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
