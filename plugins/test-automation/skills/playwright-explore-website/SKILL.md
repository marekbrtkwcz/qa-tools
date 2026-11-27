---
name: playwright-explore-website
description: Explores a website with Playwright MCP, documents 3-5 core user flows with their locators and observed behaviour, and proposes test cases for each, saved under .qa/. Use when you need a first look at an unfamiliar app before planning or automating tests. To also capture the network requests behind each flow, use the playwright-explore-website-requests command; for a full risk-prioritized plan, use the create-test-plan command.
argument-hint: "[url]"
disable-model-invocation: true
---

# Explore a website and propose test cases

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `url`: URL of the site to explore (must be a site you are authorized to test)

# Task

If the `playwright-explore-website-requests` command is what you need (network traffic behind each flow), stop and use that instead.

Explore the website at <url>, document its core functionality, and propose test cases based on observed behaviour.

If no URL is provided, ask for one and stop until you have it. If the site needs login, ask for a test account; do not guess credentials.

## Steps

1. Navigate to the URL with the Playwright MCP tools.
2. Pick **3–5 key features or user flows** that represent the site's core functionality, and tell me which ones you picked and why.
3. For each flow, record:
   - the user actions performed, step by step
   - the UI elements involved and a user-facing locator for each (`getByRole`, `getByLabel`, `getByText`; `getByTestId` where those are ambiguous; CSS only as a last resort, marked as such)
   - the observed outcome, and what you would expect if it differs
4. Close the browser when done.
5. Write the files below only after the exploration is complete.

## Output

`.qa/website-exploration-summary.md`:

```markdown
# Exploration: <site>
Date: <date> · Flows explored: <n>

## <Flow name>
Steps: 1. … 2. …
| Element | Locator | Notes |
Observed: …
Issues or surprises: …

## Not explored
```

`.qa/proposed-test-cases.md`: per flow, a table `ID | Flow | Title | Steps | Expected result | Priority | Automate?`, with stable IDs (e.g. `LOGIN-01`) so the cases can feed the `test-generator` or `playwright-generate-test` commands.

## Guardrails

- Explore only sites you own or are authorized to test.
- Stay read-only by default. Do not submit forms that create real records, send messages, make purchases, or delete anything without my explicit confirmation.
- Do not run load, crawling, or security probes.
- Report only behaviour you observed; mark anything inferred as an assumption.
- Stop after 5 flows, or earlier if the site blocks access, and list what you did not explore.

## If the Playwright MCP server is not available

This command's whole output is observed behaviour from a live browser; without the server there is nothing to observe.

- If the MCP tools are not callable (server not installed or not started), **stop and say so** - install this repo's `qa-mcp` bundle (it ships the pinned Playwright MCP server), or [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) directly, and re-run.
- A write-up produced from the app's docs, a screenshot archive, or prior knowledge is **not** exploration - it may be offered as documentation review, clearly labelled, but it must not fill in the "observed behaviour" fields of the flow documents.
- Same rule for a blocked site: an auth wall or a bot check is a finding (the flow could not be observed), not a reason to describe the flow from memory.

## Related Skills

- `playwright-explore-website-requests` - the same exploration recording network requests/responses per flow
- `designing-functional-tests` (qa-core) - turning the proposed test cases into a structured plan
- `playwright-generate-test` - generating the first test from one explored flow

## Definition of Done

- 3-5 core user flows documented with locators and observed behaviour
- each flow has proposed test cases
- exploration notes state what was NOT visited
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
