---
name: playwright-explore-website-requests
description: Explores a website with Playwright MCP and records, for 3-5 core user flows, the user actions, locators, and the network requests and responses each action triggers, saved to .qa/website-requests-exploration-summary.md. Use when you need to know which API calls sit behind the UI, for example before writing API tests, network mocks, or a HAR-based setup. When network traffic is not needed, use the playwright-explore-website command.
argument-hint: "[url]"
disable-model-invocation: true
---

# Explore a website and gather network requests using Playwright MCP

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `url`: URL of the site to explore (must be a site you are authorized to test)

# Task

If you only need the UI flows without network traffic, use the `playwright-explore-website` command instead.

Explore the website at <url>, exercise its core functionality, and record the network traffic behind each user action.

If no URL is provided, ask for one and stop until you have it. If the site needs login, ask for a test account; do not guess credentials.

## Steps

1. Navigate to the URL with the Playwright MCP tools.
2. Pick **3–5 key features or user flows** that represent the site's core functionality, and tell me which ones you picked and why.
3. For each flow, record:
   - the user actions performed, step by step
   - the UI elements involved and a user-facing locator for each (`getByRole`, `getByLabel`, `getByText`; `getByTestId` where those are ambiguous)
   - the network requests each action triggered: method, URL, status, relevant query parameters, request and response headers that matter (content type, auth scheme, caching), and request and response bodies (trimmed to the fields that matter)
   - the observed outcome
4. Separate first-party API calls from third-party traffic (analytics, ads, CDNs), and list the third-party hosts once rather than in every flow.
5. Close the browser when done, then write the file below.

## Output

`.qa/website-requests-exploration-summary.md`:

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

End with the endpoints that look like the best candidates for API tests or for `page.route` mocks in UI tests.

## Guardrails

- Explore only sites you own or are authorized to test.
- Stay read-only by default. Do not submit forms that create real records, send messages, make purchases, or delete anything without my explicit confirmation.
- Do not replay, fuzz, or load-test the captured endpoints; this command only observes.
- Redact secrets before writing: replace tokens, cookies, `Authorization` and `Set-Cookie` values, API keys, and personal data with `<redacted>`.
- Stop after 5 flows, or earlier if the site blocks access, and list what you did not explore.

## Related Skills

- `playwright-explore-website` - the UI-side exploration without network recording
- `api-test-plan-and-tests` (api-testing) - when the recorded requests should become an API test plan
- `testing-webhooks` (api-testing) - when flows trigger webhook calls worth testing

## Definition of Done

- per flow: user actions, locators, and the requests/responses they trigger
- auth pattern (headers, tokens, cookies) recorded
- flows not explored are listed, not silently omitted
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
