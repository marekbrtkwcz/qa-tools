---
name: api-test-plan-and-tests
description: Creates a risk-based API test plan from an OpenAPI spec, Postman collection, or written API docs, then generates and runs a small set of example tests in the project's existing API test stack. Use when an API has little or no automated testing and you want a plan and a working starting point in one flow. For a combined web and API plan explored through the UI, use the create-test-plan command.
argument-hint: "[openApiPath] [postmanCollectionPath]"
disable-model-invocation: true
---

# API test plan and test generator

Create a **risk-based API test plan** from an OpenAPI spec, Postman collection, or written API docs, then generate and run a small set of **example automated tests** in the project's existing API test stack. Work in the four numbered phases below and stop at each checkpoint for confirmation.

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `openApiPath`: OpenAPI/Swagger file path or URL (optional if a Postman collection or docs are given)
- `postmanCollectionPath`: Postman collection file path or URL (optional)

## Who does the work

Run the phases below yourself. If the `api-playwright-test-developer` skill is installed, load it for the test-writing details; if `testing-api-contracts` is installed, load it for contract and schema validation.

# Task

Design and implement API testing in four phases: **discover** the API and the project stack, **design** a risk-based plan, **generate** example tests, **run** and iterate. The detailed recipe for each phase lives in `./resources/phase-recipes.md` - open the phase section when you start that phase.

If no API description is available from any of the inputs, ask for one and stop until you have it.

## Inputs to collect

If any of the following are missing, ask concise questions to obtain them:

1. **API description** (at least one of):
   - OpenAPI/Swagger file path (e.g. `<openApiPath>`) or URL.
   - Postman collection path (e.g. `<postmanCollectionPath>`) or URL.
   - Or a free-form textual API description.

2. **Target project context**:
   - Programming language and test framework (if known).
   - Repository path (you can infer from context, but confirm if ambiguous).
   - Preferred style: unit-level API tests (e.g. Supertest), higher-level API tests (e.g. Playwright API), or external tools (Postman/Newman).

3. **Quality goals and constraints**:
   - Main business risks or critical flows.
   - Non-functional goals (performance, security, data integrity).
   - CI environment (GitHub Actions, Azure DevOps, GitLab CI, etc.), if relevant.

Keep your questions minimal and focused; don't block on anything that you can reasonably assume from the codebase.

## Phase 1 – Discover API and project stack

Parse the API definition and detect the project's existing test stack - prefer reusing it over introducing a new one. Summarize endpoints, framework and auth, and **ask the user to confirm or correct the summary before planning**.

## Phase 2 – Design a risk-based API test plan

Tier the endpoints (1: business-critical/auth, 2: important, 3: low-risk) and propose four suites - smoke, regression, negative & robustness, contract/schema - with representative endpoints and test ideas per suite. Note non-functional concerns (latency, auth enforcement, sensitive-field leaks). Produce a concise plan with an endpoint-to-suite mapping and execution frequencies, and **save it to `.qa/api-test-plan.md`**. Pause and incorporate feedback before generating code.

## Phase 3 – Generate example automated tests

Match the project's framework and style; if none exists, propose a reasonable default and justify it. From the plan select a small subset - 2–3 smoke tests from Tier 1 endpoints, 1–2 negative tests, 1 contract/schema example if feasible. Follow existing project patterns for naming, setup/teardown and Base URL configuration; tests must be deterministic, with no hard-coded secrets and clear, meaningful assertions. Explain how to run them, adding a test script only with user confirmation.

## Phase 4 – Run and iterate

Run the tests, and for each failure identify the root cause (environment/config vs. test bug vs. app bug) and apply minimal fixes - up to 3 attempts per test. **Never make a test pass by loosening an assertion, accepting any status code, or adding retries.** Stop when the tests pass, when a failure is an app defect (report it with the request and response), or at an environment limitation. Hand off with the plan location, created file paths, run commands for local and CI, and suggested next steps.

## Style and interaction

- Be concise and **actionable-first**; state which phase you are in and what is next.
- Prefer integrating with the **existing stack** over introducing new tools; call out trade-offs (e.g. more coverage vs. runtime cost).
- Ask for confirmation at the three checkpoints: after the API & stack summary, after the initial plan, after the first batch of tests.

## Guardrails

- Send requests only to APIs and environments you are authorized to test; ask which environment to use if it is not clear.
- Do not call mutating endpoints (POST, PUT, PATCH, DELETE) against production or shared data without explicit confirmation; prefer a local or test environment and create and clean up your own test data.
- No load, fuzzing, or security probing in this command.
- Never write secrets or tokens into test files, the plan, or the summary; read them from environment variables.

## Resource Map

- `./resources/phase-recipes.md` - the detailed recipe for each phase: what to parse (OpenAPI/Postman/free text), stack detection per language, tiering rules and suite design, framework defaults, test-selection and fix-loop rules
- `.qa/api-test-plan.md` - where the produced API test plan is saved in phase 2

## Related Skills

- `designing-functional-tests` (qa-core) - when the API plan should come from a wider functional test plan of the whole feature, not only from the spec
- `test-planner` (agent, qa-core) - when the API surface is only reachable through a running app and needs exploration first
- `automation-backlog-planner` (agent, qa-core) - to decide which scenarios from this API plan get automated first and which stay manual
- `api-playwright-test-developer` - the Playwright `request`-fixture patterns when the stack is Playwright Test

## Definition of Done

- An API test plan is saved at `.qa/api-test-plan.md`, incorporating user feedback given at the phase 2 pause
- A small example set (2–3 smoke, 1–2 negative, 1 contract/schema if feasible) exists as real test files following the project's patterns
- Selected tests pass, or every remaining failure is reported as an identified app defect or environment limitation, with request and response evidence
- The run commands for local and CI are reported to the user, and no secrets appear in test files, the plan, or the summary
