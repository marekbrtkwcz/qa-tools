---
name: creating-plugins
description: "Packages skills, commands, agents, hooks and MCP servers as installable plugins with a marketplace entry for GitHub Copilot, Claude Code and OpenAI Codex. In this collection plugins are generated from `bundles.yaml` by `npm run build`. Use when a group of assets should install as a unit, when adding or reshaping a bundle, when publishing a plugin from your own repository, or when CI reports generated files out of date. For the skill being packaged, use `creating-skills` first."
argument-hint: "What to bundle, the plugin name and description, the target tools, and whether this is this collection or your own repository"
user-invocable: true
---

# Creating Plugins

A plugin is a folder of agent assets with a manifest; a marketplace is a file that lists plugins so users can add the source once and install by name. All three hosts have both, with different manifest locations and fields. A skill folder is the part that ports unchanged; agents, commands, hooks and MCP config need host-specific files.

## When to Use

- a group of skills, agents, commands, hooks or MCP servers should install as one unit across hosts
- publishing a plugin from your own repository, or CI reports generated plugin files out of date
- reshaping what a bundle in this collection installs

Route elsewhere:

- authoring the skill being packaged: use `creating-skills` first


## Where you are writing

**This collection.** Plugins are generated; never edit `plugins/` by hand — and never hand-fix the README's bundle-table numbers, they are gated against `bundles.yaml` by the build (`checkReadmeCounts`).

| You change | Effect |
| --- | --- |
| `bundles.yaml`: a bundle with `icon`, `description`, `version`, `skills`, `agents`, optional `knowledge`, `hooks`, `mcp` | One **native Vibe plugin per bundle** (Agent Plugins 1.0) in `plugins/<name>/` |
| `bundles.yaml`: a bundle with `pack: true` | An orchestration-pack plugin (`creating-orchestration-packs`): the driver skill, the agents and the GUIDE (as knowledge) |
| `bundles.yaml`: hook names under `hooks:` + the script in `scripts/assets/` | `ai.mistral.vibe/hooks.toml` and `vibe-hooks/` in the plugin (`creating-hooks`) |
| `package.json` `version` | Nothing alone — one release bumps every bundle via `node scripts/build.js --set-version x.y.z` |

Users install by copying: `cp -r plugins/<name> ~/.vibe/plugins/<name>` (or `<project>/.vibe/plugins/<name>`). Every skill, command and agent belongs to exactly one bundle. Then run `npm run check`, `npm run build` and `npm run verify` (the drift gate: committed `plugins/` must match a fresh build), and commit the sources and the regenerated files together; CI re-runs all gates on ubuntu and windows and fails on drift. What the build writes per bundle is in [`resources/plugin-manifest.template.md`](resources/plugin-manifest.template.md).

**A user's own repository.** Write the manifests and marketplace files yourself, per target host, from [`resources/plugin-manifest.template.md`](resources/plugin-manifest.template.md). Keep one source for each skill and copy it into the plugin with a script, so the copies cannot drift.

## Decide the bundle

A plugin ships one capability or a small group a user reaches for together.

| Shape | Justified when |
| --- | --- |
| One skill | It stands alone |
| A skill and its quick variant | The pair covers routine and deep use of the same capability |
| Several cooperating assets | A user reaching for one reliably needs the others in the same session (a skill, the command that starts it, the agent it hands to) |

Grouping by topic is not a reason. "All the testing skills" installs fifteen descriptions that compete for the same requests, and the agent picks worse than it would from three. Before bundling, check that the skills' descriptions do not overlap; inside one plugin they collide harder, because the user installed both on purpose.

Keep a command and any agent it names (in this collection: by agent name in the command's body, in a user's repository: via the host's `agent:` key) in the same bundle; otherwise the command's hand-off fails when only one plugin is installed.

## Write the description

The plugin description is what a user reads before installing, often the only thing. Say what is inside and when to install it, in a sentence or two: "Unit tests, TDD, Playwright, mocking, visual regression, migration and test code review." beats "Testing tools". In this collection it comes from the bundle's `description` in `bundles.yaml` and is copied into every manifest and marketplace file.

## Per-host summary

| | GitHub Copilot | Claude Code | OpenAI Codex |
| --- | --- | --- | --- |
| Plugin manifest | `.github/plugin/plugin.json` | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` (OpenAI's plugin-creator); this collection's build writes `plugin.json` at the plugin root instead |
| Marketplace file | `.github/plugin/marketplace.json` | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` |
| Skills | listed in `skills: ["./skills/<name>/"]` | `skills/` folder | `skills` path in the manifest |
| Agents | listed in `agents: ["./.github/agents/"]` | `agents/` folder | Not loaded from plugins: ship TOML files for users to copy into `.codex/agents/` |
| Hooks | Not shipped in plugins by this collection; copy-in folder | `hooks/hooks.json` | `hooks` path in the manifest; this collection ships none |
| MCP servers | Users add them to their own MCP config | `.mcp.json` | `mcpServers` path (this collection writes `mcp.json`) |
| Add marketplace | `copilot plugin marketplace add <owner>/<repo>` | `/plugin marketplace add <owner>/<repo>` | `codex plugin marketplace add <owner>/<repo>` |
| Install | `copilot plugin install <plugin>@<marketplace>` | `/plugin install <plugin>@<marketplace>` | `codex plugin add <plugin>@<marketplace>`, or pick it from the plugin list |

Plugin files must be real files, not symlinks: Codex drops symlinks when it caches a plugin. Manifest fields, marketplace entry shapes and sources: [`resources/plugin-manifest.template.md`](resources/plugin-manifest.template.md).

## Workflow

### 1. Check the assets are ready

Each skill passes its own checklist (`creating-skills`) and has been used on a real task at least once. A skill still changing weekly makes every edit a release.

### 2. Shape the bundle

Apply the table above. Done when every asset has one home and no two skills in the bundle compete for the same request.

### 3. Write or generate the manifests

- This collection: edit `bundles.yaml` only, then `npm run check` and `npm run build`.
- A user's repository: write the manifest and marketplace entry for each target host from the template. The plugin `name` equals its folder name and its marketplace entry name.

### 4. Write the README

In this collection the plugin README is generated from the bundle. In a user's repository, use [`resources/plugin-readme.template.md`](resources/plugin-readme.template.md): the problem in one paragraph, what is inside (each skill and its resources, each command, each agent), install commands per host, prerequisites (MCP servers, Node.js), and related plugins.

### 5. Verify

- This collection: `npm run check`, `npm run build`, `npm run verify` all pass.
- Any repository: add the marketplace from a local path or the repository in each target host, install the plugin, start a new session, and confirm that one skill triggers and one command runs.

## MCP servers in a plugin

A plugin can ship the MCP servers its skills need. The risky part is not the manifest — it is process startup, version pinning and duplicate servers. Rules learned the hard way in this collection's `qa-mcp` bundle:

- **Run the global binary, never `npx`.** The host gives a plugin MCP server a hard startup budget (~10 s for the `initialize` handshake). `npx` can exceed it on a cache miss — and its install prompt eats the handshake — while a pre-installed global binary starts in a fraction of a second. Fail fast beats fail slow: a missing binary gives a clear spawn error instead of a hang.
- **Name the server by product, not by binary.** An entry in the user's config with the **same short name** as the plugin's server shadows the plugin copy (custom flags, longer timeouts) instead of spawning a second instance. Deliberately short, product-style names (`playwright`, `chrome-devtools`, `k6`) make that shadowing workable; name-equals-binary (`k6`) is the exception, only when the MCP is a subcommand of the tool itself (`k6 x mcp`).
- **Ship flags in the manifest, keep timeouts user-level.** The plugin manifest carries the server `command` and `args` (the flag set that makes the server useful out of the box), but startup/tool timeouts live only in the user-level entry — a long-running tool (a load test) must not inherit a short default with no override path.
- **Float versions (`@latest`), and document the one-line install.** The manifest carries a bare command, so the version lives in the user's shared global install; pinning forces a downgrade on machines that already run a newer binary. In exchange the host README must keep the install lines — this collection's build even gates them (`checkGlobalBinaryInstallDoc`).
- **One MCP plugin, not one per bundle.** If several bundles need browser control or load testing, they declare nothing individually; a single `qa-mcp`-style bundle ships the servers once, and the other bundles' skills simply reference them.

## Common Failure Modes

- editing a generated file under `plugins/` in this collection; the next build overwrites it and CI fails until then
- bundling by topic, so one plugin ships a dozen competing descriptions
- a command whose agent hand-off lives in another bundle
- a description that names the topic but not what is inside or when to install
- expecting Codex to load agents, or Copilot to start MCP servers, from a plugin
- symlinked skill folders that vanish in Codex
- one skill installed both by hand and as a plugin, so it loads twice
- different versions in a manifest and its marketplace entry (in a hand-written setup)

## Resource Map

- [`resources/plugin-manifest.template.md`](resources/plugin-manifest.template.md): manifests and marketplace entries for each host, what this collection's build writes, and sources. Read when writing or checking manifests.
- [`resources/plugin-readme.template.md`](resources/plugin-readme.template.md): README structure for a hand-written plugin. Read when publishing from your own repository.
- [`resources/plugin-packaging-checklist.md`](resources/plugin-packaging-checklist.md): pre-ship checks and a troubleshooting table. Read before publishing.

## Related Skills

- `creating-skills`: the skill has to be good before packaging matters
- `creating-custom-agents`: for agents shipped in the plugin
- `creating-prompts`: for commands shipped in the plugin
- `creating-hooks`: for hooks, which this collection ships as separate plugins
- `creating-orchestration-packs`: when the thing being packaged is a set of cooperating agents
- `generating-quality-gate-workflows`: for the CI job that checks generated files are current

## Definition of Done

- The bundle is one capability or a group used together; grouping by topic was rejected.
- Every command's agent hand-off target is in the same plugin (via `agent:` where the host supports it, or by name in the command body).
- The description says what is inside and when to install it.
- This collection: only `bundles.yaml` and `src/` were edited, every asset is in exactly one bundle, and `npm run check`, `npm run build` and `npm run verify` pass.
- A user's repository: each target host has a manifest and marketplace entry with matching name and version, skill folders are real files, and the plugin installed in a fresh session with one skill triggering and one command running.
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
