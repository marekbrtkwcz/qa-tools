---
name: edge-case-scenario-generator
description: Generates risk-based Given/When/Then scenarios for one feature, weighted toward boundary values, invalid state transitions, and concurrency, and saves them to spec/edge-cases.md. Use when a feature with meaningful state (orders, payments, bookings, workflows) needs its edge cases enumerated before testing or automation. For a full .feature file from acceptance criteria, use the generate-gherkin-scenarios command; for security and adversarial lenses, use the qa-strategy command.
argument-hint: "[feature] [states]"
disable-model-invocation: true
---

# Edge Case Scenario Generator (BDD)

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `feature`: user story or feature description, or a file path
- `states`: the feature's application states, e.g. "Pending, Paid, Shipped, Cancelled" (optional; inferred if omitted)

## Who does the work

Hand this task to the `ai-architect` agent (`ai_architect` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `designing-test-data` skill is installed, load it before starting.

Generate Given/When/Then scenarios for <feature> that cover the happy path, negative input, and the edge cases most likely to reach production: boundaries, invalid state transitions, and concurrency.

## Inputs to collect

| Input | Value | If missing |
| --- | --- | --- |
| Feature or user story | <feature> | Ask for it and stop until you have it |
| Application states | <states> | Infer them from the feature and the codebase, list them as assumptions, and ask me to confirm before writing scenarios |

Example: "As a user, I want to pay for my order by credit card", with order states `Pending Payment`, `Processing`, `Paid`, `Cancelled`.

## Steps

1. **Happy path**: the single standard successful flow.
2. **Negative and validation**: invalid format, missing required fields, authentication failure, rejected input.
3. **Edge cases**:
   - boundaries and limits: minimum and maximum values, character limits, non-standard characters, type mismatch
   - concurrency: double submit, the same action in two sessions, parallel updates
   - invalid state transitions: acting on a wrong or terminal state (paying for an order that is already cancelled or shipped)
4. Give each scenario a risk rating (High/Medium/Low) and one line on why.
5. List the rules you could not infer and had to assume, so the product owner can confirm them.

## Output

Save one Markdown file to `spec/edge-cases.md` (ask before overwriting an existing file), with:

- a short header naming the feature and the states used
- scenarios grouped as Happy path / Negative / Edge cases, each with an ID, risk rating, and a Given/When/Then block:

```gherkin
# EC-04 · High · paying a cancelled order must not charge the card
Given an order in state "Cancelled"
When the user submits a valid card payment for that order
Then the payment is rejected with "Order is no longer payable"
And no charge is created
```

- an assumptions and open questions section

Aim for at least 8 scenarios, most of them negative or edge cases. Stop when every state transition and every input boundary you identified has at least one scenario, and say which ones you deliberately left out.

## Guardrails

- Write expected results from stated rules. Where a rule is unknown, write the question, not an invented behaviour.
- Generate scenarios only; do not write automation code.
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
