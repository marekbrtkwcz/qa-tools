---
name: api-testing
description: "API test automation with Playwright and contract testing. Three distinct jobs, three skills:"
display_name: "API testing"
icon: book
---
# API testing

API test automation with Playwright and contract testing. Three distinct jobs, three skills:

| Skill | Use when |
|---|---|
| `api-playwright-test-developer` | writing/reviewing Playwright API tests (request fixture, uploads, webhooks, hybrid UI+API) |
| `testing-api-contracts` | the API has a published OpenAPI/JSON Schema — validate responses, diff spec versions for breaking changes |
| `pact-contract-testing` | services owned by different teams — consumer-driven pact files, broker, provider verification, can-i-deploy |

## Evidence and enforcement

Pinned by `evals/api-testing.cases.jsonl` (schema vs pact vs Playwright routing and the pair-split contract case).

## Beyond REST

- **SOAP / XML (legacy enterprise):** same testing ideas as REST (contract, status, negative cases) but the contract is a **WSDL** and payloads are XML envelopes, usually sent via POST. Validate requests/responses against the WSDL, assert on XML structure (not string match), and mind namespaces. Use an XML-aware client (e.g. `soap` npm package) instead of hand-built strings.
- **GraphQL:** `testing-graphql-apis` — queries/mutations, schema introspection, error envelope.
- **gRPC:** `testing-grpc-apis` — protobuf contracts, status codes differ from HTTP.
- **API fundamentals for onboarding:** `api-concepts-for-testers` (REST, HTTP methods, status codes, JSON, request/response anatomy).
