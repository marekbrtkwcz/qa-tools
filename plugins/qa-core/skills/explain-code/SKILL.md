---
name: explain-code
description: "Explains the selected code, the active file, or a pasted snippet: purpose, control flow, patterns, risks, and what a tester should verify, adapted to a developer, tester, or non-technical audience. Use when you need to understand unfamiliar code before testing or reviewing it. To turn the code into a table of test cases with coverage status, use the derive-test-cases-from-code command."
argument-hint: "[audience]"
disable-model-invocation: true
---

# Analyze and explain code

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `audience`: developer, tester, or non-technical (default: tester)

# Task

Analyze and explain the target code. Priority order for the target:

1. The current selection: the code the user selected or pasted
2. The active file: the file the user is working on
3. Code pasted or referenced in the request.

If none of these yields a target, **pause and ask me to pick one**: specific file, selection, PR, diff, folder, or paste a snippet. Then continue.

Optional: adapt the depth and vocabulary to the audience `<audience>`.

# Methodology

Use the read and search tools to understand the code, its context, and its callers before explaining. Do not explain code in isolation when its behavior depends on surrounding modules.

Then provide an explanation covering:

- **Purpose** - what it does and why it exists
- **How it works** - control flow, key data, and important state transitions
- **Key components** - main functions, classes, or blocks and their roles
- **Patterns and practices** - notable patterns, idioms, or anti-patterns
- **Testing perspective** - inputs and edge cases, error paths, side effects, external dependencies, and the behaviors most worth testing
- **Risks and improvements** - potential bugs, unclear contracts, and concrete suggestions

# Output format

- Use clear headings for the sections above and bullet points for clarity.
- Include minimal, focused code snippets when suggesting changes.
- Prefer concise bullets over long prose.
- If the analysis spans multiple files, list the impacted files and why.
- End with a short **What to test first** list when the testing perspective surfaced risks.

# Critical

- Do not output the code itself unless it's a minimal snippet for illustration.
- This is a read-only analysis: never create, edit, or delete files, and never run commands.
- If behavior cannot be determined from the code alone, say so explicitly instead of guessing.
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
