---
name: create-skill
description: Creates a new agent skill (a SKILL.md folder with supporting resources) for GitHub Copilot, Claude Code and OpenAI Codex, either as a contribution to this collection or in the user's own project, and validates it. Use when you want a guided, step-by-step build of one skill; for the underlying method, see the `creating-skills` skill.
argument-hint: "[capability] [target]"
disable-model-invocation: true
---

# Create a new skill

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `capability`: what the skill should do and the requests that should trigger it
- `target`: where it goes: this collection, or a project and host such as .github/skills, .claude/skills or .agents/skills (default: ask)

If the `creating-skills` skill is installed, load it before starting.

Create one new skill for <capability>, placed according to <target>. The steps below are the short form; the `creating-skills` skill has the full method.

## Steps

1. **Settle the target.** If <target> is missing, ask: "Is this a contribution to this collection, or a skill for your own project? If your project, which tools does your team use?" Do not continue until it is answered.
   - This collection: the source goes in `src/skills/<name>/`, supporting files in `resources/`, frontmatter limited to the keys in `CONTRIBUTING.md`.
   - A user's project: `.github/skills/<name>/` (Copilot), `.claude/skills/<name>/` (Claude Code), `.agents/skills/<name>/` (Codex). For several hosts, pick one location and keep frontmatter to `name` and `description`.
2. **Settle the capability.** If <capability> does not say what the skill produces and when it should trigger, ask one question at a time until it does. Then list the existing skills nearby (`ls` the skills folder) and name the closest one. If an existing skill already covers it, stop and recommend editing that skill instead.
3. **Write the name and description first.** Name: an activity in gerund form, lowercase with hyphens, max 64 characters, equal to the folder name. Description: what it does, `Use when …` with intent categories, and a routing clause for the closest neighbour. Show both to the user and wait for approval before writing files.
4. **Write the files.** Create `SKILL.md` from the `creating-skills` template: purpose, when not to use, workflow with a checkable criterion per step, output format, resource map with "read when" conditions, Related Skills, Definition of Done. Add at most the supporting files that remove ambiguity (usually one template or checklist).
5. **Verify.**
   - This collection: add the skill to exactly one bundle in `bundles.yaml`, run `npm run check`, and fix every error and every warning about the new skill. Do not run `npm run build` unless the user asks; it rewrites generated files.
   - A user's project: check the folder name matches `name`, the body is under 500 lines and every linked file exists. If the project uses Codex and an `agents/openai.yaml` is wanted, write it next to `SKILL.md`.
   - Either way: list three requests that should trigger the skill and two near-misses that should not, and say which wording in the description decides each.

## Output

Reply with:

- the files created, one path per line
- the final `name` and `description`
- the validation result (command output, or the checks above with pass/fail)
- the trigger and near-miss requests to try in a fresh session

## Guardrails

- Never edit anything under `plugins/`, `rules/` or `catalog/` in this collection; those are generated.
- Never overwrite an existing skill folder. If the name is taken, propose another.
- Never name a host in the body of a skill for this collection unless the skill is about hosts; the validator warns on it.
- Stop after two failed validation rounds and report the remaining errors instead of guessing further.

Next: start a fresh session and try the first trigger request.
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
