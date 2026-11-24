# Instructions and rules per host

Read this when rules go into a user's own project, or when porting rules between tools. The same scoped rule is shown in each format.

## This collection: no rule assets

This collection deliberately ships no repository-rule assets: a rule encodes one repository's conventions, not a reusable collection, and exporting rules to users would push conventions onto repos that never agreed to them. Reusable know-how goes into a skill (`creating-skills`); what must hold mechanically goes into a hook (`creating-hooks`). The section below shows the source-collection `src/rules/` format for reference when porting from it.

```markdown
---
description: Playwright fixture rules for shared setup and teardown.
applyTo:
  - 'tests/**/*.spec.ts'
  - 'tests/fixtures/**/*.ts'
---

- Put shared setup in fixtures (`test.extend`), not in `beforeEach` copies across files.
- ...
```

The upstream multi-host layout (source collection) writes one rule three ways under `rules/`: `copilot/.github/instructions/<name>.instructions.md`, `claude/.claude/rules/<name>.md`, and `codex/.agents/rules/<name>.md` plus an `AGENTS.md` index. Users copy the folder for their tool into their project.

## GitHub Copilot

Repository-wide: `.github/copilot-instructions.md`, plain Markdown, no frontmatter.

Scoped: `.github/instructions/<name>.instructions.md`.

```markdown
---
description: 'Playwright fixture rules for shared setup and teardown.'
applyTo: 'tests/**/*.spec.ts, tests/fixtures/**/*.ts'
---

- Put shared setup in fixtures (`test.extend`), not in `beforeEach` copies across files.
```

- `description`: 1 to 500 characters.
- `applyTo`: one glob, or several separated by commas in one string. `'**'` applies everywhere; avoid it.
- File names: lowercase with hyphens, ending in `.instructions.md`.

## Claude Code

Repository-wide: `CLAUDE.md` at the project root (Claude Code also reads `.claude/CLAUDE.md`).

Scoped: `.claude/rules/<name>.md`, scoped with `paths`.

```markdown
---
paths:
  - 'tests/**/*.spec.ts'
  - 'tests/fixtures/**/*.ts'
---

- Put shared setup in fixtures (`test.extend`), not in `beforeEach` copies across files.
```

## OpenAI Codex

Repository-wide: `AGENTS.md` at the project root. Closer, nested `AGENTS.md` files apply to their subtree. OpenAI documents a 32 KiB combined size limit.

Codex has no glob-scoped rules. Two options:

1. **Folder scope.** If the rule maps to one folder, put it in that folder's `AGENTS.md`.
2. **Indexed rule files** (what this collection publishes). Put the rule body, without frontmatter, in `.agents/rules/<name>.md`, and add an index to `AGENTS.md`:

```markdown
## Mistral Vibe

Vibe reads guidance through plugins and project/user config, not a dedicated rules-with-globs format.

- Plugin instructions and knowledge land with the plugin (always loaded or loaded on demand — `creating-knowledge-folders` for the on-demand kind); project conventions live in plain files the repo already has (`AGENTS.md`-style) plus `.vibe/` project config, user config under `~/.vibe/`.
- There is no per-glob rule file: scope by putting the convention in the file the relevant work reads, or gate it mechanically with a pre-tool hook (`creating-hooks`).
- If the `vibe` plugin is installed, `vibe:vibe` is the source of truth for what current Vibe loads and from where; `vibe:import` ports instruction files from other CLIs.

## Quality rules

Before you create or edit a file that matches a pattern below, read the linked rule file and follow it.
Read a rule file only when a matching file is in scope.

| Files | Rule | What it covers |
| --- | --- | --- |
| `tests/**/*.spec.ts`<br>`tests/fixtures/**/*.ts` | [playwright-fixtures](.agents/rules/playwright-fixtures.md) | Playwright fixture rules for shared setup and teardown. |
```

If the project already has an `AGENTS.md`, append the index instead of overwriting the file. The index is guidance the agent follows, not a mechanism the host enforces.

## One body for several tools

- Keep repository-wide content tool-neutral and keep one copy. OpenAI's migration tooling links `CLAUDE.md` to `AGENTS.md` when the content is provider-neutral, which only works if the text names no host-only feature.
- Keep scoped rule bodies identical across hosts and change only the frontmatter (`applyTo` string, `paths` list, or none plus an index row).
