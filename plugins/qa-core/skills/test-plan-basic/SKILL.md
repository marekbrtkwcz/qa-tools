---
name: test-plan-basic
description: Produces a quick, single-pass test plan for a website from a short read-only exploration of its main flows, saved to .qa/basic-test-plan.md. Use when you need a starting plan for a small site, a smoke checklist, or a first pass before deeper planning. For a comprehensive, risk-prioritized plan with API scenarios and review rounds, use the create-test-plan command.
argument-hint: "[baseUrl]"
disable-model-invocation: true
---

# Generate a basic test plan

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `baseUrl`: URL of the website to plan for (must be a site you are authorized to test)

# Task

If the `designing-functional-tests` skill is installed, load it before starting.

Explore the website at <baseUrl> and write a basic test plan for its main features in one pass.

If no URL is provided, ask for one and stop until you have it. If the main features sit behind a login, ask for a test account; without one, plan only the public part and say so.

## Steps

1. Explore the site with Playwright: home page, main navigation, and up to 5 key user flows (e.g. search, sign-up, checkout, contact form). Stay read-only.
2. For each flow, note the main interactions and what a user expects to happen.
3. Write 3–6 test cases per flow: the happy path, one or two negative cases (invalid or missing input), and one boundary case where the flow has an input with limits.
4. Note what you did not explore and what you could not verify.

## Output

Save the plan to `.qa/basic-test-plan.md` (ask before overwriting an existing file):

```markdown
# Basic test plan: <site>
URL: <url> · Date: <date> · Explored: <flows>

## Scope
In scope: … · Out of scope / not explored: …

## Test cases
| ID | Flow | Title | Steps | Expected result | Priority |
| BAS-01 | Search | Search returns matching products | 1. … | … | P1 |

## Open questions
```

Then give the file path and the number of cases per flow. The plan can feed the `test-generator` command.

## Guardrails

- Explore only sites you own or are authorized to test.
- Do not submit forms that create real records, send messages, or make purchases; plan those cases without executing them.
- Write expected results only from observed behaviour or obvious conventions; put anything uncertain under open questions.
- Stop after 5 flows.
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
