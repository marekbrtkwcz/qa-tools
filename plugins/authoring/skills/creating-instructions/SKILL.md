---
name: creating-instructions
description: "Creates instruction files and scoped rules that agents apply automatically: repository-wide guidance (`copilot-instructions.md`, `CLAUDE.md`, `AGENTS.md`) and file-scoped rules (Copilot `.instructions.md` with `applyTo`, Claude Code `.claude/rules/` with `paths`, Codex `AGENTS.md`), plus rules in this collection's single-source format. Use when encoding project conventions, choosing how narrowly a rule should apply, splitting an overgrown instructions file, or porting rules from one tool to another. For step-by-step workflows, use `creating-skills`; for enforcement that must not depend on the model, use `creating-hooks`."
argument-hint: "Repository context, target files or folders, the conventions to encode, and which tools the team uses"
user-invocable: true
---

# Creating Instructions and Rules

Instructions are standing rules the agent reads without being asked. Every always-loaded line costs context on every turn, and every rule competes with the task for attention, so the job is to say little, scope it tightly, and make each line checkable.

All three hosts have repository-wide instructions. Copilot and Claude Code also scope rules to file patterns natively; Codex does not (it scopes by folder with nested `AGENTS.md` files), so a glob-scoped rule needs a workaround there.

## When to Use

- encoding conventions the agent should apply automatically, repository-wide or scoped to file patterns
- an instructions file has grown too broad and needs splitting or narrowing
- porting rules between hosts

Route elsewhere:

- a fixed step-by-step workflow: use `creating-skills`
- something that must hold regardless of what the model decides: use `creating-hooks`


## Where you are writing

| Writing for | Source | Scope | Check |
| --- | --- | --- | --- |
| **This collection** | — | — | — |
| **A user's project** | The host's files, see [Per-host summary](#per-host-summary) | The host's mechanism | Edit a matching file and confirm the rule was applied |

This collection ships no repository-rule assets on purpose: a rule encodes one repository's conventions, not a reusable collection — write rules for the repository you are in, and put reusable know-how into a skill (`creating-skills`) instead. A running-instance example lives in this repo's own body of rules: the build scripts (`scripts/build.js`) enforce mechanically what could otherwise only be prose.

## What makes a good rule

- **Scoped as narrowly as the content allows.** `tests/e2e/**/*.spec.ts`, not `**`. Repository-wide files hold only what matters for nearly every task.
- **Imperative and checkable.** Each bullet can be verified in a diff: "Use `getByRole` before `getByTestId`", not "write clean tests".
- **Rules, not workflows.** No step sequences or triggers; those belong in commands and skills.
- **A reason where the rule is surprising**, in the same bullet.
- **A preferred/avoided pair only where the pattern is easy to misread.**
- **Don't cache the environment.** Point at config, scripts and `--help` instead of restating them; write down the unwritten convention and why it exists.
- **Not what a tool already enforces.** If the linter or formatter catches it, leave it out, or better, move a prose rule into a lint rule or hook.
- **One topic, one file.** A deliberate override names the rule it overrides.
- **No history.** No "we used to", incident numbers, or "now works differently".

## Workflow

### 1. Frame

Settle: repository-wide or scoped; which files or folders; which tools the team uses; who installs it (one person, the team, a public collection). Collect only conventions stable enough to outlive the current task.

### 2. Gather

Read existing instructions, README, lint and formatter config, and a few representative files. Separate what tools enforce from what still needs judgment. Done when each candidate rule has an example in the codebase or a stated reason.

### 3. Choose the shape

- Applies to nearly every task → the repository-wide file.
- Applies to a file pattern → a scoped rule.
- Two audiences would inherit each other's rules → split the file.

### 4. Write

Use the templates in the resource map. Keep each rule to one or two lines; add an example pair only for non-obvious patterns.

### 5. Validate

- Run [`resources/instructions-quality-checklist.md`](resources/instructions-quality-checklist.md).
- This collection: not applicable — this collection ships no rule assets; reusable know-how goes into a skill instead (`creating-skills`).
- A user's project: open or edit one matching and one non-matching file, and confirm the rule applied to the first only. In Codex, confirm the agent followed the index to the rule file.

## Per-host summary

| | GitHub Copilot | Claude Code | OpenAI Codex |
| --- | --- | --- | --- |
| Repository-wide | `.github/copilot-instructions.md` | `CLAUDE.md` | `AGENTS.md` (nested `AGENTS.md` files apply to their subtree) |
| Scoped rule | `.github/instructions/<name>.instructions.md` | `.claude/rules/<name>.md` | No glob-scoped rules |
| Scope key | `applyTo: '<glob>, <glob>'` (one comma-separated string) | `paths:` (a YAML list of globs) | Folder placement, or an index (below) |
| Other frontmatter | `description` | none needed | none |

Codex workaround used by this collection: put each rule in `.agents/rules/<name>.md` and add a table to `AGENTS.md` that tells the agent which rule file to read before touching which files. OpenAI documents a 32 KiB combined size limit for `AGENTS.md`, another reason to keep rules out of it and indexed instead.

Formats, examples and sources: [`resources/host-instruction-formats.md`](resources/host-instruction-formats.md) (read it when writing for a user's project or porting rules between tools).

## Common Failure Modes

- `applyTo: '**'` (or an unscoped `CLAUDE.md` section) for advice that matters in one folder
- a tutorial instead of a rule set
- copying linter or formatter defaults
- several unrelated audiences in one file
- rules with no reason where the reason is not obvious
- one rule repeated in the repository-wide file and a scoped file, drifting apart

## Resource Map

- [`resources/copilot-instructions.template.md`](resources/copilot-instructions.template.md): repository-wide file scaffold, usable as `copilot-instructions.md`, `CLAUDE.md` or `AGENTS.md`. Read when writing the repository-wide file.
- [`resources/copilot-instructions.example.md`](resources/copilot-instructions.example.md): a finished repository-wide file for a test automation repository.
- [`resources/custom-instructions.template.instructions.md`](resources/custom-instructions.template.instructions.md): scoped rule scaffold. Read when writing a scoped rule.
- [`resources/custom-instructions.example.instructions.md`](resources/custom-instructions.example.instructions.md): a finished scoped rule for Playwright fixtures.
- [`resources/host-instruction-formats.md`](resources/host-instruction-formats.md): the same rule in each host's format, plus this collection's source format.
- [`resources/instructions-quality-checklist.md`](resources/instructions-quality-checklist.md): final review. Read before handing off.

## Related Skills

- `creating-skills`: for procedures and workflows that do not belong in rules
- `creating-hooks`: when a rule must be enforced, not just stated
- `creating-prompts`: for a task the user starts on purpose
- `creating-custom-agents`: when the guidance is really a role with its own tools

## Definition of Done

- Each file has one audience; repository-wide content applies to nearly every task.
- Every scoped rule matches only the files it is about.
- Every bullet is imperative and checkable; surprising rules carry a reason.
- Nothing restates lint or formatter behaviour or another rule file.
- This collection: not applicable (this collection ships no rule assets — rules encode one repository's conventions, not a collection's). A user's project: files sit where each target host reads them, and a matching edit picked up the rule.
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
