---
name: creating-orchestration-packs
description: "Creates orchestration packs: an orchestrator plus a few narrow subagents (explore, plan, implement, review, verify) with minimal tools per role and one shared handoff-packet contract, runnable in GitHub Copilot (orchestrator agent) and in Claude Code and OpenAI Codex (orchestrator as a command). Covers the src/packs/ format and hand-written packs. Use when one agent role has grown too broad, when phases need different tools or a fresh context, when review must be independent of implementation, or when pack validation fails on a handoff target. For a single agent use creating-custom-agents."
argument-hint: "The workflow to orchestrate, the roles it needs, which steps can run in parallel, and where artifacts should be written"
user-invocable: true
---

# Creating Orchestration Packs

A pack splits one large job into roles: an orchestrator that delegates and synthesises, and subagents that each do one part and return a structured **handoff packet**. The value is the same as in a human team: a narrow scope with a clear output contract produces better work than one agent asked to do everything. The cost is coordination; a pack that costs more coordination than it saves is worse than one good agent.

## When to Use

- one agent's role has grown too broad, or phases need different tools or a fresh context
- review must be independent of implementation, or handoffs need one shared packet contract
- a pack fails validation because a handoff target does not resolve

Route elsewhere:

- a single focused role: use `creating-custom-agents`


## How the hosts run a pack

The hosts differ in one way that shapes every pack: **who may start a subagent.**

| | GitHub Copilot | Claude Code | OpenAI Codex |
| --- | --- | --- | --- |
| Orchestrator | A custom agent with the `agent` tool; the user picks it in the agent dropdown | A command (user-run skill) in the main conversation; subagents cannot start subagents | A command (`$name` skill) in the main conversation; subagents cannot start subagents |
| Subagents | `.github/agents/*.agent.md`, referenced by display name (`name`) | `.claude/agents/*.md` | `.codex/agents/*.toml`, copied in by the user |
| Wiring | `agents:` list and `handoffs:` buttons in frontmatter (VS Code) | The command names the agents to call | The command names the agents to spawn |
| Tool ceiling | The orchestrator's tool list caps what its subagents can use | Each agent's own `tools` | Each agent's sandbox settings, inherited from the session |
| Agent → agent hand-offs | Possible via `handoffs` | Results come back to the main conversation, which passes them on | Same as Claude Code |

So write orchestrator instructions that delegate **by role name** ("ask the Test Planner to…"), never by one host's tool name, and never let a subagent's instructions depend on calling another subagent.

## Where you are writing

**This collection** (see the repository's `CONTRIBUTING.md`): a pack is a bundle in `bundles.yaml` with `pack: true` —

```
bundles.yaml: <pack-name>          pack: true; skills: [<driver skill>]; agents: [<subagents>]; knowledge: [<GUIDE>]
src/skills/<driver>/SKILL.md       the user-invocable driver skill that runs the orchestration
src/agents/<agent>.md              agent frontmatter + required `title`
src/knowledge/<GUIDE>.md           how the workflow runs, step by step (shipped as knowledge)
```

- `title` is the agent's display name and must be unique in the pack; the build rewrites the host-instruction tables in the driver (`rewritePackSkill`) so each host spawns the same roles.
- The driver delegates each step to a subagent by `config_name` — in Vibe: `tools.agents` with `config_name` `<bundle>:<agent>` (e.g. `plan-explore-review-commit:perc-implementer`).
- Agent names share one namespace with every other agent in the collection, because every plugin agent spawns through one mechanism. Prefix them with a short pack name (`uiapi-test-planner`).
- The build publishes one native Vibe plugin per pack: the driver skill (user-invocable) leads the orchestration and delegates each step to a subagent by `config_name`; the GUIDE ships as the plugin's knowledge.

**A user's project:** write the files yourself per host, from [`resources/orchestration-pack.template.md`](resources/orchestration-pack.template.md). For Claude Code and Codex, the orchestrator is a user-run skill (`creating-prompts`), not an agent.

## Operating principles

- **A role earns its file.** Each agent has a scope no other agent has, or it is merged.
- **The orchestrator delegates and never implements.** Once it writes code, its context fills and the pack collapses into one agent with extra steps.
- **The reviewer did not write what it reviews.** Otherwise the review is a self-assessment.
- **Tools per role, minimal.** An explorer that cannot edit cannot damage anything.
- **One output contract for every subagent**, including a `Gaps` section. Mixed shapes make the synthesis guesswork.
- **Bounded.** Each delegation has a retry cap; the orchestrator stops and asks the user at decision points.

## Workflow

### 1. Check that a pack is justified

At least two should hold:

- the phases need different tools, and the union on one agent would be over-privileged
- a phase benefits from a fresh context
- two phases can run in parallel
- review is more useful from an agent that did not do the work
- the workflow is long enough that one agent loses the early instructions

If only one holds, write a single agent (`creating-custom-agents`).

### 2. Cut the roles

Split by what a role needs and produces, not by topic. A common cut, in this collection's capability terms:

| Role | Scope | Capabilities |
| --- | --- | --- |
| Orchestrator | Delegates, synthesises, asks the user at gates | `read`, `search`, `agent`, `todo` (+ `edit` if it writes the summary) |
| Explorer | Gathers facts, writes no product code | `read`, `search` (+ `edit` to save findings, `web` if it researches) |
| Planner | Turns findings into a prioritised plan | `read`, `search`, `edit` |
| Implementer | Writes and runs code within the plan | `read`, `search`, `edit`, `execute` |
| Reviewer | Judges the output, edits nothing | `read`, `search` |
| Runner | Runs tests, diagnoses, reports | `read`, `search`, `execute` |

An agent that saves its packet to a file needs `edit` even though it writes no product code. `agent` matters only for the Copilot orchestrator; in Claude Code and Codex the orchestrator is a command and helpers cannot delegate.

### 3. Fix the output contract

Every subagent returns the handoff packet: Objective, Inputs, Findings, Decisions, Artifacts, Gaps, Risks, Next action. Details and a worked example: [`resources/handoff-packet.md`](resources/handoff-packet.md). Agree one folder for artifacts (the packs here use `.ai-outputs/`), so nothing lands in the repository root.

### 4. Write the agents and the wiring

Start from [`resources/orchestration-pack.template.md`](resources/orchestration-pack.template.md). For Copilot wiring, list the subagents in the orchestrator's `agents` and add `handoffs` with an action label, a short prompt that references the finished work, and `send: false`. Hide subagents from the picker with `user-invocable: false`.

### 5. Validate

- This collection: `npm run check` passes (titles, references, names unique across the collection). Declare the GUIDE as the bundle's `knowledge:` entry if the flow is not obvious.
- Run [`resources/orchestration-quality-checklist.md`](resources/orchestration-quality-checklist.md).
- Run the pack on one real task in each target host. Watch for an orchestrator that starts implementing, a subagent missing a tool that reports success anyway, vague handoff prompts, two agents doing the same work, and a `Gaps` section that is always empty.

## Common Failure Modes

- an orchestrator that implements when a subagent returns something incomplete
- a handoff or `agents` entry naming a title that does not exist in the pack
- agent names that collide with another pack or a standalone agent
- every agent granted every capability
- subagent instructions that call another subagent, which breaks in Claude Code and Codex
- subagents returning free-form prose in different shapes
- a reviewer that also implements
- five agents where two would do
- an MCP prerequisite (such as Playwright) nobody documented

## Resource Map

- [`resources/orchestration-pack.template.md`](resources/orchestration-pack.template.md): a minimal pack (orchestrator + two subagents) in this collection's format, with notes for a hand-written Copilot, Claude Code or Codex version. Read when starting.
- [`resources/handoff-packet.md`](resources/handoff-packet.md): the output contract section by section, a worked example, and how it degrades. Read when writing subagent output rules.
- [`resources/orchestration-quality-checklist.md`](resources/orchestration-quality-checklist.md): pre-ship checks for naming, capabilities, wiring, contract and the live run. Read before handing off.

## Related Skills

- `creating-custom-agents`: when one agent is enough, and for writing each agent in the pack
- `creating-prompts`: for the orchestrator command in Claude Code and Codex, or an entry command
- `creating-skills`: for procedures the agents should share instead of repeating
- `creating-plugins`: for how packs are published as plugins
- `creating-instructions`: for conventions every agent should follow

## Definition of Done

- At least two of the step 1 conditions hold, and a single agent was considered.
- Every role has a scope no other role has; the reviewer does not implement.
- The orchestrator delegates only, by role name, and has stop-and-ask gates and retry caps.
- No subagent depends on calling another subagent.
- Capabilities are minimal per role; agents that run commands have `execute`, read-only roles have no `edit`.
- Every subagent returns the same packet shape, including `Gaps`; artifacts go to one agreed folder.
- This collection: the `bundles.yaml` entry has `pack: true`, one driver skill, its agents and the GUIDE as `knowledge:`, every agent has a unique `title`, agent names are prefixed and unique, and `npm run check` passes.
- The pack ran on one real task in each target host.
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
