# Contributing to qa-tools

This collection is a set of **native Mistral Vibe CLI plugins** (Agent Plugins 1.0 format), built from single sources in `src/` into `plugins/` by `scripts/build.js`. Everything the build writes is regenerated — edit `src/` and `bundles.yaml`, never `plugins/`.

## Where things live

| Asset | Source | Consumed by the build as |
| --- | --- | --- |
| Skill (model-invoked) | `src/skills/<name>/SKILL.md` + `resources/` | `skills/<name>/` in the plugin |
| Command (user-invoked) | the same shape as a skill, with `disable-model-invocation: true` | a command is a skill that never auto-triggers |
| Agent | `src/agents/<name>.md` | `ai.mistral.vibe/agents/<name>.toml` |
| Knowledge | `src/knowledge/<name>.md` | `ai.mistral.vibe/knowledge/<name>/KNOWLEDGE.md` |
| Hook | `scripts/assets/<name>.js` (+ `<name>.test.js`) | `ai.mistral.vibe/hooks.toml` + `vibe-hooks/` in the plugin |

Every asset belongs to **exactly one bundle** — the lists in `bundles.yaml`, alphabetical. Every bundle `version:` is **quoted** (`"0.4.1"`); `--set-version` refuses to rewrite bare values, and `checkVersionQuoting` fails on them.

## Documentation

Documentation lives next to the asset it describes — there is no separate `docs/`:

- a **bundle** documents itself in `src/knowledge/<bundle>.md` (routing table, "what this bundle does not do", evidence) — required, `npm run check` enforces it;
- a **skill** documents itself in its `SKILL.md` (When to Use / Workflow / Definition of Done) plus `resources/` for templates and worked examples;
- a **user-facing change** gets a `CHANGELOG.md` entry under the current version;
- the **README table** counts are updated in the same commit as `bundles.yaml` (build gate fails otherwise).

## Frontmatter rules (enforced by `npm run check`)

**Skill `SKILL.md`:**
- `name` — equals the folder name.
- `description` — ends with a period; hard limit 1024 chars, warning past 700, and this collection's target is **≤600** (routing signal blurs past it). Include `Use when …` triggers and a routing clause that names the closest neighbour.
- Command extras: `argument-hint: "[what the user passes]"`, and `disable-model-invocation: true` so it never competes with skills for auto-triggering. Commands that should appear in the user's command menu also carry `user-invocable: true`.
- The skill body names no host unless the skill is about hosts (the validator warns).

**Agent `.md`:** `name` (equals the file name), `title`, `description` (**warn past 300** — the build silently truncates at 300 in the TOML), `capabilities` (or `tools`), optional `mcp`. The body after the frontmatter is the agent's instructions; `truncateDescription` applies to the description only.

**Knowledge `.md`:** the first non-`#` paragraph becomes the plugin's knowledge description — keep it under **297 characters** (the build's slice point; the validator warns past it).

**Hooks:** plain Node CJS in `scripts/assets/` — no dependencies, `'use strict'`, unit-tested with `node:test` in `<name>.test.js`, listed under `hooks:` in the bundle entry. The build emits one `[[hooks]]` block per matcher (`type = "pre_tool"`, `match` on `file_system.write_file` / `edit` / `bash`, `command = "node vibe-hooks/<name>.js"`, `strict = false`). A crashing hook **fails open** — this is required, not optional.

## House skill structure

Skills that the model triggers on its own carry: `## When to Use` with explicit triggers, `## When NOT to Use` (or Boundary), `## Resource Map` where each resource gets a "read when" condition (one level deep), and `## Definition of Done`. Commands carry a Workflow with checkable steps and a Guardrails section instead. Long reference material moves to `resources/` — progressive disclosure, keep bodies lean.

## Commands

```bash
npm run check    # validate sources: membership, frontmatter rules, README gates
npm run build    # regenerate plugins/ from src/ (atomic swap, all-or-nothing)
npm run verify   # drift gate: committed plugins/ must match a fresh build
npm run validate-manifests   # plugin.json / mcp.json (JSON) + agent TOML syntax
npm test         # build unit tests + hook guard tests (node:test, no deps)
npm run lint     # Biome on scripts/
npm run ci       # all of the above
```

### P2 Automation Commands

P2 (Periodic Maintenance) tasks are automated for consistency:

```bash
# Maintenance validation (runs on CI)
npm run p2              # Check CHANGELOG, README stats, and links
npm run p2:all          # Generate CHANGELOG, update README stats, validate links

# Individual maintenance tasks
npm run changelog              # Generate CHANGELOG.md from conventional commits
npm run changelog:check        # Validate CHANGELOG format and consistency
npm run readme:stats           # Update README.md statistics (bundle counts)
npm run readme:stats:check     # Validate README stats match bundles.yaml
npm run links                  # Validate all markdown links (report mode)
npm run links:check            # Validate all markdown links (CI mode, exits 1 on errors)
```

### P3 Testing Commands

P3 (Test Coverage) includes unit tests for maintenance scripts:

```bash
npm run test:p3        # Run all P3 unit tests (validate-links, generate-changelog, update-readme-stats)
npm run test:all       # Run all tests (P2 + P3)
```

## Maintenance Workflows (P2)

### CHANGELOG Generation
- **Script:** `scripts/generate-changelog.js`
- **Trigger:** Manual or CI (on tag push)
- **Input:** Git commit history (conventional commits format)
- **Output:** `CHANGELOG.md` with categorized changes
- **Types:** `feat`/`feature`/`dodano` → ✅ Dodane, `fix`/`naprawiono` → 🐛 Naprawione, `chore`/`refactor`/`docs` → 🔄 Zmienione, `BREAKING CHANGE` → ⚠️ BREAKING CHANGE
- **Validation:** `npm run changelog:check` (dry-run mode)

### README Statistics
- **Script:** `scripts/update-readme-stats.js`
- **Trigger:** Manual or CI (on release)
- **Input:** `bundles.yaml` + source directory structure
- **Output:** Updated counts in README.md bundle table
- **Validation:** `npm run readme:stats:check` (verifies counts match bundles.yaml)

### Link Validation
- **Script:** `scripts/validate-links.js`
- **Trigger:** CI (on every push/PR)
- **Scope:** All `.md` files (excluding `node_modules/`, `plugins/`, `resources/`, `.vibe/`, `.git/`)
- **Checks:**
  - Internal file links (relative paths)
  - Anchor links (`#section-id`)
  - Cross-bundle links (`bundle:skill` format)
  - External links (optional, can be skipped)
- **Validation:** `npm run links:check` (exits 1 on broken links)

## Test Coverage (P3)

### Unit Tests for P2 Scripts

All P2 maintenance scripts have comprehensive unit tests:

| Script | Test File | Coverage |
|--------|-----------|----------|
| `validate-links.js` | `validate-links.test.js` | Link extraction, validation logic |
| `generate-changelog.js` | `generate-changelog.test.js` | Commit parsing, type mapping |
| `update-readme-stats.js` | `update-readme-stats.test.js` | Bundle counting, stats validation |

### Running Tests

```bash
# Run P3 tests only
node --test scripts/validate-links.test.js
node --test scripts/generate-changelog.test.js
node --test scripts/update-readme-stats.test.js

# Or use npm scripts
npm run test:p3    # All P3 tests
npm run test:all  # All tests including P2
```

### Test Structure

Tests use Node.js built-in `node:test` framework:
- **No external dependencies** required
- **Fast execution** (~5 seconds for all 68 tests)
- **Comprehensive coverage** of edge cases
- **Integration tests** (E2E) for real-world scenarios

After editing `src/`, run `npm run check`, then `npm run build`, and commit sources and the regenerated `plugins/` **together** — CI's drift gate (`--verify`, ubuntu + windows) fails if they diverge.

## README gates

The build also enforces two README properties in every mode: the MCP install lines stay documented verbatim (`checkGlobalBinaryInstallDoc`), and the bundle-table / totals / model-visible numbers match `bundles.yaml` and the actual frontmatters (`checkReadmeCounts`). Adding a skill means updating the README numbers in the same commit — the gate will tell you exactly which.

## Releases

One release = one version for the whole collection: `node scripts/build.js --set-version x.y.z` (rewrites every bundle), a `## [x.y.z] - YYYY-MM-DD` header in `CHANGELOG.md`, the same version in `package.json`, and the tag `vx.y.z`. `scripts/check-release.js --tag vx.y.z` (CI runs it on tags) verifies all four agree.

## Provenance

`src/` content is adapted from [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, jaktestowac.pl); native assets written for this repository are house-native.
