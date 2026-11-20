---
description: First look at an unfamiliar app via Playwright MCP — explore 3–5 core user flows, document steps + user-facing locators + observed behaviour, and propose test cases with stable IDs. Argument: URL (only a site you are authorized to test; read-only by default). Output: .qa/website-exploration-summary.md + .qa/proposed-test-cases.md, feeding /create-test-plan, /test-generator, /playwright-generate-test. For network traffic behind each flow use /playwright-explore-website-requests.
---

# Explore a website and propose test cases

Explore the website at the URL given as the command argument, document its core functionality, and propose test cases from observed behaviour. If no URL is provided, ask and stop. If the site needs login, ask for a test account — do not guess credentials. Use the Playwright MCP tools (shipped by qa-tools in `mcp.json`).

## Steps

1. Navigate to the URL with the Playwright MCP tools.
2. Pick **3–5 key features or user flows** representing the core functionality; say which you picked and why.
3. For each flow record: user actions step by step; UI elements with a user-facing locator each (`getByRole`, `getByLabel`, `getByText`; `getByTestId` when ambiguous; CSS only as last resort, marked as such); the observed outcome, and what you would expect if it differs.
4. Close the browser when done; write the files only after exploration is complete.

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

`.qa/proposed-test-cases.md` — per flow a table `ID | Flow | Title | Steps | Expected result | Priority | Automate?` with stable IDs (e.g. `LOGIN-01`) so cases can feed `/test-generator` or `/playwright-generate-test`.

## Guardrails

- Explore only sites you own or are authorized to test.
- Read-only by default: do not submit forms that create real records, send messages, make purchases, or delete anything without explicit confirmation.
- No load, crawling, or security probes.
- Report only observed behaviour; mark inferences as assumptions.
- Stop after 5 flows (or earlier if access is blocked); list what was not explored.
