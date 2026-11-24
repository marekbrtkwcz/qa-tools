# Commands and prompt files per host

Read this when a command goes into a user's own project. The same command is shown in each format: review a draft test plan and hand it to a planning agent.

## This collection (source): `src/skills/<name>/SKILL.md`

In this collection a command is a skill that never auto-triggers — the same source shape as every other skill, distinguished only by frontmatter:

```markdown
---
name: review-test-plan-gaps
description: Reviews a draft test plan for missing risks and untested integrations before implementation. Use when a plan is drafted but not yet challenged.
argument-hint: "[draft plan path] [constraints]"
disable-model-invocation: true
---

Review the draft test plan against the stated constraints. ...
<!-- ask for anything missing instead of guessing; hand off to `test-planner` by name -->
```

- A command declares `disable-model-invocation: true` (only the user starts it), an `argument-hint`, and a description addressed to the user.
- Hand-offs name agents and skills by name in the body; the named agent stays in the same bundle (`npm run check` guards bundle membership).
- The build publishes it as a regular skill folder inside the plugin, so the `SKILL.md` body is the command body — no separate prompt file per host.

## GitHub Copilot: `.github/prompts/<name>.prompt.md`

```markdown
---
description: 'Review a draft test plan for missing risks and untested integrations before implementation.'
name: 'review-test-plan-gaps'
agent: 'test-planner'
argument-hint: 'Draft plan and known constraints'
---

# Review test plan gaps

Review the draft plan `${input:draftPlan:Paste the plan or a path}` against `${input:constraints:Environments, deadlines, out-of-scope areas}`.
If the plan is missing, ask for it and stop.
...
```

| Key | Notes |
| --- | --- |
| `description` | Recommended; one actionable sentence. |
| `name` | Shown after `/`; defaults to the file name. |
| `agent` | `ask`, `edit`, `agent`, or a custom agent name. |
| `model` | Optional; defaults to the selected model. Leave it out unless it matters. |
| `tools` | Smallest set that works. Setting `tools` while the agent is `ask` or `edit` switches it to `agent`. |
| `argument-hint` | Hint shown in the chat input. |

Placeholders: `${input:name}` or `${input:name:placeholder}`, and context variables `${selection}`, `${file}`, `${workspaceFolder}`. Start the body with a `#` heading matching the intent.

## Claude Code

Preferred: a skill that only the user can start, `.claude/skills/<name>/SKILL.md`:

```markdown
---
name: review-test-plan-gaps
description: Reviews a draft test plan for missing risks and untested integrations before implementation.
argument-hint: "[draftPlan] [constraints]"
disable-model-invocation: true
---

# Review test plan gaps

Take the plan and constraints from what the user typed after the command. Ask for the plan if it is missing.
Hand the review to the `test-planner` agent if it is installed; otherwise do it yourself.
...
```

Also supported: a single file `.claude/commands/<name>.md`, where `$ARGUMENTS` holds what the user typed after the command and `argument-hint` and `allowed-tools` work as frontmatter. A skill folder has the advantage that it can carry `resources/` and that Copilot and Codex read the same folder format.

## OpenAI Codex: `.agents/skills/<name>/`

```
review-test-plan-gaps/
├── SKILL.md              same as the Claude Code skill, frontmatter limited to name + description
└── agents/
    └── openai.yaml
```

```yaml
interface:
  display_name: "Review test plan gaps"
policy:
  allow_implicit_invocation: false
```

- The user runs it as `$review-test-plan-gaps`.
- There is no input placeholder syntax; tell the agent to take inputs from the user's message and ask for missing ones.
- There is no per-command tool limit.
- To hand off, name the Codex agent to spawn (Codex agent names use underscores in this collection: `test_planner`).

## Mistral Vibe

Vibe has no separate prompt-file format: a command **is** a skill with `disable-model-invocation: true`. The user starts it; the model never races to trigger it.

- Location: any skill directory (see `creating-skills`, `resources/host-skill-formats.md` → Mistral Vibe).
- Frontmatter: `name`, `description` (addressed to the user — it lands in the help surface), `argument-hint: "[what the user passes]"`, `disable-model-invocation: true`, and `user-invocable: true` when it should appear in the command menu.
- Inputs are not declared as a map: the body says what it takes, asks when something is missing, and reads what the user typed after the command.
- Subagent hand-offs go through the orchestrator by `config_name`, not through a frontmatter `agent:` key.

## One command for every host

Write the body without host placeholders: "Take the plan from what the user typed after the command, or from the conversation; ask if it is missing." Then wrap it per host as above. That is what this collection's build does.
