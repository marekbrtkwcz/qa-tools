---
description: Explore a site via Playwright MCP and record the network traffic behind 3–5 core user flows — method, URL, status, key headers/bodies per action, first-party vs third-party separated, secrets redacted. Argument: URL (authorized sites only, read-only). Output: .qa/website-requests-exploration-summary.md with an endpoint table and the best candidates for API tests or page.route mocks. Use when you need to know which API calls sit behind the UI (before API tests, mocks, HAR setup). Without network needs use /playwright-explore-website.
---

# Explore a website and gather network requests

Explore the website at the URL given as the command argument, exercise its core functionality, and record the network traffic behind each user action. If no URL, ask and stop. Login → ask for a test account, do not guess credentials. Use the Playwright MCP tools (qa-tools `mcp.json`).

## Steps

1. Navigate to the URL with the Playwright MCP tools.
2. Pick **3–5 key features or user flows**; say which and why.
3. For each flow record: user actions step by step; UI elements with user-facing locators (`getByRole`/`getByLabel`/`getByText`, `getByTestId` when ambiguous); the network requests each action triggered — method, URL, status, relevant query params, headers that matter (content type, auth scheme, caching), and request/response bodies trimmed to the fields that matter; the observed outcome.
4. **Separate first-party API calls from third-party traffic** (analytics, ads, CDNs) — list third-party hosts once, not per flow.
5. Close the browser, then write the file.

## Output — `.qa/website-requests-exploration-summary.md`

```markdown
# Network exploration: <site>
Date: <date> · Flows explored: <n> · API base URL(s): <…>

## <Flow name>
Steps: 1. … 2. …
| Step | Method | URL | Status | Purpose | Notes |
Request/response samples: …
Observed: …

## Endpoints seen
| Method | Path | Used by flows | Auth | Notes |

## Third-party hosts
## Not explored
```

End with the endpoints that are the best candidates for API tests or `page.route` mocks in UI tests.

## Guardrails

- Explore only sites you own or are authorized to test; read-only by default — no form submits creating real records, messages, purchases, or deletions without explicit confirmation.
- Do not replay, fuzz, or load-test captured endpoints — this command only observes.
- **Redact secrets before writing**: tokens, cookies, `Authorization`/`Set-Cookie` values, API keys, personal data → `<redacted>`.
- Stop after 5 flows (or earlier if blocked); list what was not explored.
