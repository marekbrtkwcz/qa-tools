---
name: create-test-plan
description: Explores a web app (and its API, if given), maps features to risk, and produces a prioritized test plan with web and API scenarios, saved to .qa/test-plan.md. Use when starting test work on a new product or major feature, or when a plan must feed test-generator or manual-test-cases. For a quick single-pass plan from light exploration, use the test-plan-basic command.
argument-hint: "[baseUrl] [apiBaseUrl] [environment] [userRoles] [scope] [riskAreas]"
disable-model-invocation: true
---

# Generate a comprehensive test plan

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `baseUrl`: web app URL to explore (required)
- `apiBaseUrl`: API base URL (optional; web-only plan if omitted)
- `environment`: dev, stage, or prod (default: stage; prod is read-only)
- `userRoles`: main user roles, e.g. guest, customer, admin (optional)
- `scope`: features in and out of scope (optional)
- `riskAreas`: known high-risk or business-critical areas (optional)

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `designing-functional-tests` skill is installed, load it before starting.

Prepare a risk-prioritized test plan for the website at <baseUrl> and, if given, its API at <apiBaseUrl>.

## Inputs to collect

| Input | Value | If missing |
| --- | --- | --- |
| Web app URL | <baseUrl> | Ask for it and stop until you have it |
| API base URL | <apiBaseUrl> | Plan web and exploratory testing only |
| Environment | <environment> | Assume stage and say so |
| User roles | <userRoles> | Infer from the UI and list them as assumptions |
| Scope | <scope> | Cover what exploration finds and mark scope as unconfirmed |
| Risk areas | <riskAreas> | Derive from business impact and say so |

Before interacting with forms or data, confirm that write actions are safe in this environment. In production, explore read-only.

## Steps

1. Explore the application with Playwright: key user flows, roles, forms, and states. If an API base URL was given, read its docs or OpenAPI spec if available and note the main endpoints and auth model; send only safe read requests (GET) unless write actions were confirmed.
2. Map features to risk: high, medium, or low, from business impact and likelihood of failure. State the reason for each high rating.
3. Build the plan:
   - scope, assumptions, and out-of-scope areas
   - prioritized scenarios per feature: happy path, negative, boundary, permission
   - API scenarios when applicable: contract, auth, error handling
   - suggested test level and automation candidates
   - open questions and information gaps
4. Show me the plan and ask for feedback. Apply the changes, then ask again. Stop when I confirm it is complete, or after three rounds, listing what is still open.

## Output

Save the final plan to `.qa/test-plan.md` with this structure:

```markdown
# Test plan: <app name>
Environment: <env> · Date: <date> · Explored: <pages/flows visited>

## Scope and assumptions
## Risk map
| Area | Risk | Why |
## Scenarios
| ID | Area | Scenario | Type | Priority | Level | Automate? |
## API scenarios
## Open questions
```

Use stable scenario IDs (e.g. `CHK-003`) and priority tags (`P1`–`P3`) so the plan can feed the `test-generator` or `manual-test-cases` commands.

## Guardrails

- Explore only applications you are authorized to test.
- Do not create, delete, or pay for anything, and do not run load or security probes, without explicit confirmation.
- Do not invent product rules: anything you could not confirm by exploring goes under open questions.
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
