---
name: creating-prompts
description: "Creates reusable commands the user starts on purpose (`/name`, `$name` in Codex): one job, declared inputs with hints, ask-when-missing behaviour, a concrete output and location, verification step, and guardrails - as a Copilot `.prompt.md`, a Claude Code user-run skill or command, a Codex skill with implicit invocation off, or this collection's source format. Use when a team keeps re-typing the same request, a workflow needs a fixed entry point that routes to an agent, or an existing prompt produces vague output. For know-how the agent should pick up on its own, use `creating-skills`."
argument-hint: "Command goal, the agent it should hand to, the inputs it needs, and the output it must produce"
user-invocable: true
---

# Creating Prompts and Commands

A prompt file (Copilot) or command (Claude Code, this collection) is a task the user starts deliberately. It says **what to do now**; it does not define who the agent is (that is an agent) or teach a reusable method (that is a skill). Every host has this concept; only Copilot has a dedicated file type for it. Claude Code and Codex express it as a skill the model may not start on its own.

## Where you are writing

| Writing for | Source | Inputs | Check |
| --- | --- | --- | --- |
| **This collection** | `src/skills/<name>/SKILL.md` — a command is a skill with `disable-model-invocation: true` (never auto-triggers), an `argument-hint: "[what the user passes]"` and a description that speaks to the user, not the router | The command-specific placeholders the body uses, spelled out in the body's first lines | Add it to one bundle in `bundles.yaml`; `npm run check` |
| **A user's project** | The host's format, see [Per-host summary](#per-host-summary) | The host's own placeholder syntax | Run it once with inputs and once without |

The build turns each command in this collection into a skill folder per host, sets `disable-model-invocation: true`, and adds `agents/openai.yaml` with `policy.allow_implicit_invocation: false` for Codex, so commands never compete with real skills for automatic triggering.

## What makes a good command

- **One job.** Split a command that launches two unrelated outcomes.
- **Inputs declared with hints**, and defaults where a sensible one exists ("default: workspace root").
- **Ask when missing.** State which inputs are required and what to ask; stop if they stay missing.
- **Flow: why → context → inputs → actions → output → verification.** Numbered steps, each with something checkable.
- **Concrete output.** Format and, if saved, the path ("write `docs/test-plans/<feature>.md` using this template").
- **Guardrails.** What it must never do; a confirmation step before edits, deletes or many-file writes; a dry-run or preview for bulk changes.
- **A stop condition** for any loop ("stop after 3 attempts and report").
- **Routes, does not redefine.** Hand off to an agent with `agent:` and to skills by name. Do not paste a persona ("Act as a senior…") or copy a skill's content.
- **Ends with one next action** for the user.

## Workflow

### 1. Decide it is a command

Use a command when the user should choose when it runs. If the agent should pick it up from context, write a skill (`creating-skills`). If it needs a standing role with tool limits, write an agent (`creating-custom-agents`) and, optionally, a command that starts it.

### 2. Define the contract

Settle: the one job, the agent that does the work (if any), the inputs with hints and defaults, the output and its location, how the result is verified, and what is forbidden. Done when each input has a hint and the output has a format.

### 3. Write it

Start from [`resources/prompt.template.prompt.md`](resources/prompt.template.prompt.md) and see [`resources/prompt.example.prompt.md`](resources/prompt.example.prompt.md). For this collection, use the command source format above; for a user's project, the host's format from [`resources/host-prompt-formats.md`](resources/host-prompt-formats.md) (read it when writing for a user's project).

### 4. Validate

- Run [`resources/prompt-quality-checklist.md`](resources/prompt-quality-checklist.md).
- This collection: `npm run check` passes; any agent the command names by name is in the same bundle.
- A user's project: run the command once with every input and once with none; the second run must ask, not guess.

## Per-host summary

| | GitHub Copilot | Claude Code | OpenAI Codex |
| --- | --- | --- | --- |
| File | `.github/prompts/<name>.prompt.md` | `.claude/skills/<name>/SKILL.md` with `disable-model-invocation: true`, or `.claude/commands/<name>.md` | `.agents/skills/<name>/SKILL.md` plus `agents/openai.yaml` with `policy.allow_implicit_invocation: false` |
| Run | `/name` | `/name` | `$name` |
| Inputs | `${input:name:placeholder}`, `${selection}`, `${file}`, `argument-hint` | `argument-hint`; command files also take `$ARGUMENTS` | Taken from the user's message; no placeholder syntax |
| Route to an agent | `agent:` frontmatter | Say which agent to hand the task to in the body | Say which agent to spawn in the body |
| Limit tools | `tools:` | `allowed-tools:` | Not available per command |

For Codex, OpenAI's own migration guide turns Claude Code commands into skills, so a skill the model may not start on its own is the equivalent used here.

## Common Failure Modes

- a command that reads like a system prompt or persona
- required inputs missing, so the output is generic every time
- several unrelated outcomes behind one command
- tools overridden "just in case"
- no output location, so results vanish into the chat
- a host-specific placeholder (`${input:…}`, `$ARGUMENTS`) in a command meant for every host

## Resource Map

- [`resources/prompt.template.prompt.md`](resources/prompt.template.prompt.md): scaffold in Copilot format, with notes for the other hosts. Read when starting.
- [`resources/prompt.example.prompt.md`](resources/prompt.example.prompt.md): a finished review command. Read when unsure about inputs or output.
- [`resources/host-prompt-formats.md`](resources/host-prompt-formats.md): the same command in Copilot, Claude Code, Codex and this collection's source format. Read when writing for a user's project.
- [`resources/prompt-quality-checklist.md`](resources/prompt-quality-checklist.md): final review. Read before handing off.

## Related Skills

- `creating-skills`: for know-how the agent should apply on its own
- `creating-custom-agents`: for the agent a command hands its work to
- `creating-orchestration-packs`: when the command starts a multi-agent workflow
- `testing-agent-skills`: to regression-test a command's output

## Definition of Done

- The command starts one workflow and says what it produces and where.
- Every input has a hint; required inputs have an ask-and-stop rule.
- Steps are numbered, the result is verified, and loops have a cap.
- Guardrails cover every edit, delete or bulk write.
- It routes to agents and skills by exact name instead of copying them.
- This collection: `npm run check` passes with no warning for the command. A user's project: the file is where the host reads it, and a run without inputs asked for them.
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
