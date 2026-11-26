---
name: creating-custom-agents
description: "Creates custom agents (subagents): a focused role with its own instructions, the fewest tools the job needs, explicit boundaries, stop conditions, and an output contract - as a Copilot `.agent.md`, a Claude Code agent file, a Codex agent TOML, or this collection's single-source format. Use when a recurring job needs its own role or tool limits, an existing agent has grown too broad, or a review step should run separately from the work it reviews. For cooperating agents with an orchestrator use `creating-orchestration-packs`; for reusable procedure without a role use `creating-skills`."
argument-hint: "Agent purpose, who invokes it, the tools it needs, and nearby agents or skills"
user-invocable: true
---

# Creating Custom Agents

A custom agent is a named role the main agent (or the user) hands work to. It runs with its own instructions and, where the host allows, its own tool limits, and returns a result. Agents exist in all three hosts; the file format and tool vocabulary differ, the design does not.

## When to Use

- a recurring job needs its own role with explicit boundaries, a stop condition, and an output contract
- an existing agent has grown too broad, or one of its roles needs the tools narrowed
- a review step should run separately from the work it reviews

Route elsewhere:

- reusable procedure without a role: use `creating-skills`
- several cooperating agents with an orchestrator: use `creating-orchestration-packs`
- a workflow the user starts on purpose: use `creating-prompts`


## Where you are writing

| Writing for | Source | Tools are declared as | Check |
| --- | --- | --- | --- |
| **This collection** | `src/agents/<name>.md` with `name`, `title`, `description`, `capabilities`, `mcp` (see the repository's `CONTRIBUTING.md`, "Agent frontmatter") | Host-neutral `capabilities`; the build writes each host's file | Add it to one bundle in `bundles.yaml`; `npm run check` |
| **A user's project** | The host's agent folder, see [Per-host summary](#per-host-summary) | That host's tool names | Run the agent on one real task |

In this collection, never pin a model and never name a host in the body; the build handles hosts.

## Decide whether an agent is the right asset

Choose an agent when the work needs at least one of: a separate context (so a long exploration does not fill the main conversation), tighter tool limits than the main agent, or an independent view (a reviewer that did not write the code). Otherwise:

- reusable procedure → a skill (`creating-skills`)
- a task the user starts on purpose → a command (`creating-prompts`)
- rules for certain files → instructions (`creating-instructions`)
- several roles in sequence → a pack (`creating-orchestration-packs`)

## What makes a good agent

- **One role, one output.** If the description needs "and also", it is two agents.
- **The description routes.** It is how the main agent decides to delegate: what the agent does, `Use when …`, and which neighbour to use instead.
- **Fewest tools.** A reviewer that never edits gets no edit tool. No tool list usually means *all* tools, which is rarely what you want.
- **Agent is WHO, skill is HOW.** Keep long procedures in a skill and tell the agent to use it by name; the agent file holds role, scope, rules and the output contract.
- **Stop conditions.** Cap retries, and say when to stop and report instead of improvising (blocked, out of scope, missing input).
- **An output contract.** The exact shape the agent returns, so the caller can act on it without re-reading the whole run.
- **No identity stub.** "You are an expert QA engineer" adds nothing on its own; a short role line is fine only when the scope, rules and output contract follow it.

## Workflow

### 1. Define the contract

From the request, or by asking one question at a time, settle:

- the job and the requests it should take, plus what it must hand off and to whom
- the tools it needs, and which powerful ones (edit, execute, web) it must not have
- what it returns, and where it writes files, if anywhere
- when it must stop and ask

Done when the role fits in two sentences and the tool list has a reason per entry.

### 2. Write the body

Start from [`resources/custom-agent.template.agent.md`](resources/custom-agent.template.agent.md). Sections, roughly: scope (owns / does not own, with hand-offs), workflow, rules with reasons, stop and ask conditions, output contract.

### 3. Write the host wrapper

The body is the same everywhere. Wrap it in the target's format: this collection's source frontmatter, or each host's native file from [`resources/host-agent-formats.md`](resources/host-agent-formats.md) (read it whenever the agent goes into a user's project).

### 4. Validate

- Run [`resources/custom-agent-quality-checklist.md`](resources/custom-agent-quality-checklist.md).
- This collection: `npm run check` passes; the agent is listed in exactly one bundle's `agents:` entry in `bundles.yaml`.
- A user's project: invoke the agent on one real task and check that it stayed in scope, used only its tools and returned the contract.

## Per-host summary

| | GitHub Copilot | Claude Code | OpenAI Codex |
| --- | --- | --- | --- |
| File | `.github/agents/<name>.agent.md` | `.claude/agents/<name>.md` | `.codex/agents/<name>.toml` (or `~/.codex/agents/`) |
| Format | Markdown + YAML frontmatter | Markdown + YAML frontmatter | TOML: `name`, `description`, `developer_instructions` |
| Tool limits | `tools:` list of aliases (`read`, `search`, `edit`, `execute`, `web`, `agent`, `todo`, `<server>/*`) | `tools:` comma-separated tool names (`Read, Grep, Glob`) | No per-agent tool list; `sandbox_mode`, a shell switch, and instructions |
| Can start other agents | Yes, with the `agent` tool | No: subagents cannot start subagents | No: subagents cannot start subagents |
| From a plugin | Loaded | Loaded | Not loaded; copy the TOML into `.codex/agents/` |

This collection's capability mapping (from `scripts/lib/hosts.js`):

| Capability | Copilot | Claude Code | Codex |
| --- | --- | --- | --- |
| `read` | `read` | `Read` | always on |
| `search` | `search` | `Grep`, `Glob` | always on |
| `edit` | `edit` | `Edit`, `Write` | told not to edit when absent |
| `execute` | `execute` | `Bash`, `PowerShell` | `[features] shell_tool = false` when absent |
| `web` | `web` | `WebFetch`, `WebSearch` | inherited |
| `agent` | `agent` | `Agent` | inherited |
| `todo` | `todo` | task tools | inherited |
| `ide` | `vscode` | none | none |

## Common Failure Modes

- a vague job ("help with testing") that overlaps every other agent
- every tool granted out of convenience, or no tool list at all
- a full workflow pasted into the agent instead of referencing a skill
- "iterate until it works" with no cap
- no output contract, so the caller cannot use the result without reading the whole run
- a model pinned in a file meant to outlive the model
- an agent that must call other agents, shipped to a host where subagents cannot

## Resource Map

- [`resources/custom-agent.template.agent.md`](resources/custom-agent.template.agent.md): body scaffold. Read when starting an agent.
- [`resources/custom-agent.example.agent.md`](resources/custom-agent.example.agent.md): a finished read-only reviewer. Read when unsure about scope or output.
- [`resources/host-agent-formats.md`](resources/host-agent-formats.md): the same agent as a Copilot, Claude Code and Codex file, with frontmatter keys. Read when writing for a user's project.
- [`resources/custom-agent-quality-checklist.md`](resources/custom-agent-quality-checklist.md): final review. Read before handing off.

## Related Skills

- `creating-orchestration-packs`: when the job needs several agents and an orchestrator
- `creating-skills`: for the procedure the agent should follow
- `creating-prompts`: for a command that starts the agent with the right inputs
- `creating-plugins`: to ship the agent in an installable plugin
- `testing-agent-skills`: to test that the agent triggers and returns its contract

## Definition of Done

- The role, what it does not own, and who it hands off to fit in one short paragraph.
- Every granted tool or capability is used by the workflow; reviewers have no edit.
- The body has stop conditions with a cap and an exact output contract.
- No model is pinned in this collection's source; in a user's project, a model is set only when the user asked.
- This collection: the agent is in one bundle and `npm run check` passes. A user's project: the file sits in the host's agent folder and handled one real task within scope.
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
