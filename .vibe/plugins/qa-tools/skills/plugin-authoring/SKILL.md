---
name: plugin-authoring
description: Load this skill when creating, extending, or testing an AI agent plugin (Vibe CLI / Agent Plugins 1.0 format, also packaged for Copilot/Claude Code/Codex). Covers plugin structure (plugin.json, skills/, agents/, hooks.toml, knowledge/, examples/), the snake_case agent TOML schema, skill frontmatter, hooks, a structure validator with unit tests, CI validation, semantic versioning + CHANGELOG, and auto-release.
user-invocable: true
---

# Authoring Agent Plugins

This skill documents how **this repo (qa-tools)** is built — use it as the reference pattern for your own plugin.

## Structure (Agent Plugins 1.0)

```
.vibe/plugins/<name>/
├── plugin.json                 # manifest: name, version, extensions.ai.mistral.vibe.toolNamespace
├── skills/<skill>/SKILL.md     # on-demand knowledge; frontmatter: name, description, user-invocable: true
└── ai.mistral.vibe/
    ├── agents/*.toml           # subagents (snake_case keys — see below)
    ├── hooks.toml              # [[hooks]] with name/type/command
    └── knowledge/<topic>/KNOWLEDGE.md
```

Plus at repo root: `README.md`, `CHANGELOG.md`, `LICENSE`, `scripts/validate-plugin.py`, `tests/`, `examples/`, `.github/workflows/`.

## Agent TOML — the schema that actually loads

The runtime schema (`_PluginAgentDocument`) is **snake_case and forbids extra keys** — camelCase from some docs fails with 7 validation errors:

```toml
schema_version = 1
agent_type = "subagent"
display_name = "UI Test Writer"
description = "Pisze testy UI."
safety = "safe"
instructions = """..."""        # multiline; avoid backslashes (escape risk)
enabled_tools = ["read_file", "write_file", "edit", "bash"]
disabled_tools = []
```

## Skill frontmatter

```yaml
---
name: my-skill
description: One-line trigger description — when should the agent load this?
user-invocable: true
---
```

The `description` is all the agent sees until the skill loads — make it a precise trigger, not a summary.

## Hooks

```toml
[[hooks]]
name = "lint-test-file"
type = "post_tool"        # session_start | session_end | pre_tool | post_tool | ...
command = "node scripts/lint-test-file.js"
```

## The validator — enforce structure automatically

Every plugin should ship `scripts/validate-plugin.py` (stdlib only) that checks: manifest, agent TOML keys and conventions, skill frontmatter, hooks, knowledge, examples, and **version/count consistency** (`plugin.json` ↔ top `CHANGELOG.md` entry ↔ counts in README). Exit 0/1. Unit-test it with `unittest` + `tempfile` (build a minimal good plugin, break one thing per test, assert exit 1 + error message). Run both in CI on every push/PR.

## CI & release automation

- `.github/workflows/validate-plugin.yml` — validator + unit tests on push/PR to `main`.
- `.github/workflows/release.yml` — on push to `main`, read the newest `## [x.y.z]` from `CHANGELOG.md`; if tag `v<x.y.z>` doesn't exist, create annotated tag + GitHub Release with notes from that section. Idempotent, `contents: write`.
- Branch protection on `main` with the validate check required.

## Versioning & changelog

- SemVer in `plugin.json`; every change gets a `## [x.y.z] - YYYY-MM-DD` entry in `CHANGELOG.md` (### Added / Fixed / Changed).
- Validator asserts plugin.json version == top CHANGELOG entry; README bold counts (`**N subagents**`, `**N skills**`) == real file counts.

## Testing the plugin itself

- Validator unit tests: good-plugin fixture → exit 0; then one broken variant per rule → exit 1 (camelCase keys, missing frontmatter key, bad hook type, version mismatch, count mismatch, convention violations in examples…).
- Manual smoke: copy plugin into a scratch project, add folder to trusted folders, `/reload-plugins`, check `/plugins` and `/skills` list it.

## Checklist for a new plugin

- [ ] `plugin.json` with `$schema`, version 0.1.0, license, repository
- [ ] ≥1 skill with valid frontmatter, ≥1 agent with snake_case TOML
- [ ] `scripts/validate-plugin.py` + `tests/` + CI workflow
- [ ] README (EN) with install steps, structure tree, counts
- [ ] CHANGELOG.md, LICENSE (MIT), SECURITY.md, issue/PR templates
- [ ] auto-release workflow + branch protection
- [ ] `py scripts/validate-plugin.py` exits 0 before every commit
