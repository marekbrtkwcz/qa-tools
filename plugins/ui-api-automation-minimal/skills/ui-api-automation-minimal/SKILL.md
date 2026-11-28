---
name: ui-api-automation-minimal
description: "A compact UI + API pack with four helpers: explore (OpenAPI and/or Playwright MCP), plan, set up a test framework if none exists, and implement tests, each returning the same handoff packet. Pick it for a small first batch of tests or a project without a test framework; for a full suite with review and verification stages, use ui-api-automation. Runs the UI + API test automation (minimal) orchestration pack: you coordinate, the pack's agents do the work."
disable-model-invocation: true
---

# UI + API test automation (minimal)

## How to run this pack

You are the orchestrator, working in this conversation. Do the coordinating yourself and hand every step to one of the agents below:

- In Vibe, spawn the agent with `tools.agents` using `config_name` from the Vibe column.

The agents cannot call each other. Wherever the instructions below say an agent hands off to another, the result comes back to you and you pass it on. If an agent is not available, do its step yourself and say so in your summary.

| Name used below | Vibe |
| --- | --- |
| Test Coder Agent (Minimal) | `ui-api-automation-minimal:uiapi-min-coder` |
| Explorer Agent (Minimal) | `ui-api-automation-minimal:uiapi-min-explorer` |
| Test Framework Starter Agent (Minimal) | `ui-api-automation-minimal:uiapi-min-framework-starter` |
| Test Planner (Minimal) | `ui-api-automation-minimal:uiapi-min-planner` |

---

You coordinate. You don't write tests or change project files yourself; the only file you write is the summary in `.ai-outputs/`. Every other step goes to one of the agents below, by its title.

**Prerequisite — Playwright MCP**: exploring the UI side needs the Playwright MCP server. This plugin does not bundle one: install the `qa-mcp` plugin (same collection) alongside this pack, or check a Playwright MCP server is already configured in Vibe.

**Runtime note (Vibe 3.1.5)**: spawned subagents do not receive MCP connectors (children get only `file_system`/`process`/`self`). You (the main agent) run the Playwright MCP browser steps and hand the Explorer the snapshots / traffic as text; the Explorer can fall back to the Playwright CLI via `bash`.

## Before you start

Ask the user for whatever is missing:

- scope: UI tests, API tests, or both (skip the other side's exploration when only one is wanted);
- for UI: the URL of a running app in a test environment, plus test credentials if login is needed;
- for API: the OpenAPI spec as a file path or URL, plus how to authenticate;
- the target environment. Never point the pack at production.

## Workflow

1. **Explore**: ask the **Explorer Agent (Minimal)** once per side in scope, in parallel: one run for the OpenAPI spec, one for the UI through Playwright MCP.
2. **Plan**: give the **Test Planner (Minimal)** the exploration packets and summary paths. Show the user the P0 list before implementation.
3. **Set up**, only when needed: if no test framework exists, or the existing one cannot run the planned tests, ask the **Test Framework Starter Agent (Minimal)** to set one up. Otherwise skip this step.
4. **Implement**: ask the **Test Coder Agent (Minimal)** to implement the plan's tasks. Split UI and API tasks into parallel runs when both are in scope, and give each run the plan path and its task ids.
5. **Summarise**: write `.ai-outputs/uiapi-min-AUTOMATION_SUMMARY-<YYYYMMDD-HHmm>.md` (format below) and show it to the user. Never overwrite or delete earlier summaries or the agents' files in `.ai-outputs/`.

Pass the Handoff Packet template below in every delegation, together with the paths of the files the agent needs.

## Stop and report

- A required input is still missing after you asked.
- An agent reports a blocker: app unreachable, spec invalid, framework cannot be installed.
- The coder reports failing tests it could not fix within its three attempts. Report them; this pack has no review or fix loop.

## Handoff Packet

Every agent returns exactly this structure:

```markdown
### Handoff Packet
- Objective:
- Inputs used (files, URLs, commands):
- Findings:
- Decisions / Assumptions:
- Artifacts produced (file paths):
- Gaps / TODO:
- Risks (flakiness, environment, data, auth):
- Recommended next action:
```

## Summary format

```markdown
# Automation summary <date>
- Scope covered: FE / BE, features
- Files changed: list
- Tests implemented: file paths with the plan task ids
- How to run: commands and env vars
- Result of the last run: passed / failed / fixme counts
- Known limitations, assumptions and flaky points:
- Next steps: up to five items
```

## Related Skills

- `bootstrap-test-suite` - when the project has no test framework; this pack's framework-starter covers the minimal case
- `designing-functional-tests` - designing the test plan the planner agent works from
- `api-playwright-test-developer` - the standard for Playwright API test code the coder produces
- `ui-api-automation` - the full pack with review and verification stages when the minimal batch is not enough
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
