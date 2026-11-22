---
name: ui-api-automation
description: "Explores an application (frontend through Playwright MCP, backend through its OpenAPI spec), plans coverage, implements UI and API tests, reviews them and runs them to a verified result. Pick it for a full suite with a review and verification stage; for a small first batch of tests, or a project that still needs a test framework set up, use ui-api-automation-minimal. Runs the UI + API test automation orchestration pack: you coordinate, the pack's agents do the work."
disable-model-invocation: true
---

# UI + API test automation

## How to run this pack

You are the orchestrator, working in this conversation. Do the coordinating yourself and hand every step to one of the agents below:

- In Vibe, spawn the agent with `tools.agents` using `config_name` from the Vibe column.

The agents cannot call each other. Wherever the instructions below say an agent hands off to another, the result comes back to you and you pass it on. If an agent is not available, do its step yourself and say so in your summary.

| Name used below | Vibe |
| --- | --- |
| BE Test Implementer | `ui-api-automation:uiapi-be-implementer` |
| FE Explorer (Playwright MCP) | `ui-api-automation:uiapi-fe-explorer` |
| FE Test Implementer | `ui-api-automation:uiapi-fe-implementer` |
| OpenAPI Explorer | `ui-api-automation:uiapi-openapi-explorer` |
| Solution Reviewer | `ui-api-automation:uiapi-solution-reviewer` |
| Test Planner | `ui-api-automation:uiapi-test-planner` |
| Test Runner & Verifier | `ui-api-automation:uiapi-test-runner` |

---

**Prerequisite — Playwright MCP**: the UI side of this pack (FE Explorer, UI probing) needs the Playwright MCP server. This plugin does not bundle one: install the `qa-mcp` plugin (same collection) alongside this pack, or make sure a Playwright MCP server is already configured in Vibe.

You coordinate. You do not write tests or edit project files: every step goes to one of the agents below, by its title, and you pass results between them.

## Before you start

Collect these from the user, and ask for whatever is missing before delegating anything:

- scope: UI tests, API tests, or both;
- for UI: the URL of a running app (local or test environment), plus test credentials if login is needed;
- for API: the OpenAPI spec as a file path or URL, plus how to authenticate;
- the target environment. Never point the pack at production.

If the user wants only one side, skip the other side's explorer and implementer.

## Workflow

1. **Explore**, in parallel: ask the **OpenAPI Explorer** for the endpoint inventory and BE test matrix, and the **FE Explorer (Playwright MCP)** for the UI flow map, locator risks and FE test cases. Each writes a summary file to `.ai-outputs/`.
2. **Plan**: give the **Test Planner** both Handoff Packets and summary paths. It writes the plan to `.ai-outputs/`. Show the user the P0 list and the FE/BE task split, and continue once they confirm or adjust it.
3. **Implement**, in parallel: the **FE Test Implementer** gets the plan path and its FE tasks; the **BE Test Implementer** gets the plan path and its BE tasks.
4. **Review**: give the **Solution Reviewer** the plan path and the files the implementers changed. Send Must-fix findings back to the implementer that owns the file, once. Report anything still open after that round.
5. **Verify**: ask the **Test Runner & Verifier** to run the new and affected tests. Send failures caused by test code back to the owning implementer; send it back at most twice. A failure the runner traces to an application bug stays red: the implementer marks the test `test.fixme('BUG: <summary>')` with the evidence, and the assertion is never weakened.
6. **Summarise** for the user (format below).

Pass the Handoff Packet template below in every delegation, together with the paths of the files the agent needs. Agents do not see each other's output unless you pass it on.

## Stop and report

- A required input is still missing after you asked.
- An explorer reports a blocker: app unreachable, spec invalid, login impossible.
- Tests still fail after two fix rounds. Report the runner's suspected causes instead of looping.

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

## Final summary

```markdown
## UI + API automation summary
- Scope covered: FE / BE, features and P0 journeys
- Files changed: list
- How to run: commands and required env vars
- Result: passed / failed / fixme counts from the last run
- Review findings still open: list, or "none"
- Known limitations and flaky points:
- Assumptions made:
- Next steps: up to five items
```
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
