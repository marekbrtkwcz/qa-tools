---
description: Explore a web app (and optionally its API) via Playwright MCP, map features to risk, and produce a risk-prioritized test plan saved to .qa/test-plan.md with stable scenario IDs (P1–P3) that feed /manual-test-cases and test generation. Arguments: baseUrl (required), apiBaseUrl, environment (default stage; prod is read-only), user roles, scope, risk areas. For a quick light plan use the test-planning skill instead. See skill test-planning.
---

# Create test plan

If the `test-planning` skill is available, load it. Can delegate to the `qa-tools:ui-test-planner` / `qa-tools:qa-strategist` agents.

Prepare a risk-prioritized test plan for the web app at the URL given as the first command argument and, if given, its API at the second.

## Inputs

| Input | If missing |
|---|---|
| Web app URL | ask and stop until you have it |
| API base URL | plan web + exploratory only |
| Environment | assume stage and say so |
| User roles | infer from the UI, list as assumptions |
| Scope | cover what exploration finds, mark scope unconfirmed |
| Risk areas | derive from business impact and say so |

Before interacting with forms or data, confirm write actions are safe in this environment. In production, explore read-only.

## Steps

1. **Explore with Playwright MCP** (shipped by qa-tools in `mcp.json`): key user flows, roles, forms, states. If an API URL was given, read its docs/OpenAPI spec if available, note main endpoints and the auth model; send only safe GET requests unless writes were confirmed.
2. **Map features to risk** (high/medium/low) from business impact and failure likelihood; state the reason for each high rating.
3. **Build the plan**: scope, assumptions, out-of-scope; prioritized scenarios per feature (happy path, negative, boundary, permission); API scenarios when applicable (contract, auth, error handling); suggested test level and automation candidates; open questions.
4. **Show the plan and ask for feedback** — apply changes and ask again; stop when confirmed or after three rounds, listing what is still open.

## Output — save to `.qa/test-plan.md`

```markdown
# Test plan: <app name>
Environment: <env> · Date: <date> · Explored: <pages/flows visited>

## Scope and assumptions
## Risk map
| Area | Risk | Why |
## Scenarios
| ID | Area | Scenario | Type | Priority | Level | Automate? |
## API scenarios
## Open questions
```

Use stable scenario IDs (e.g. `CHK-003`) and priority tags `P1`–`P3` so the plan can feed `/manual-test-cases` and test generation.

## Guardrails

- Explore only apps you are authorized to test.
- Do not create, delete, or pay for anything; no load or security probes without explicit confirmation.
- Do not invent product rules — anything unconfirmed by exploration goes under open questions.
