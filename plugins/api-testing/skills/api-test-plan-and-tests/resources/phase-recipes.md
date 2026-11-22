# Phase recipes: API test plan and test generator

Detailed step-by-step recipes for the four phases of the `api-test-plan-and-tests` command. Open the phase you are about to run and follow it; the SKILL.md keeps only the phase goals and checkpoints.

## Phase 1 – Discover API and project stack

1. **Parse API definition**:
   - If an OpenAPI/Swagger file or URL is provided:
     - Fetch URLs with the web tools, or search and read local files.
     - Identify:
       - Base URL(s)
       - Available paths & methods
       - Schemas for requests/responses
       - Auth mechanisms (e.g. API keys, OAuth, JWT)
   - If a Postman collection is provided:
     - Inspect folders/requests, variables, and auth setup.
   - If only a textual description is available:
     - Extract endpoints, methods, parameters, and key flows from the text.

2. **Inspect the codebase to detect stack**:
   - Search the codebase to detect existing API tests or frameworks, for example:
     - Node: Playwright API, Supertest, Jest, Vitest, Mocha.
     - .NET: HttpClient + test framework.
     - Java: Rest Assured, JUnit/TestNG.
   - Prefer **reusing the project's existing test stack** rather than introducing a new one.

3. **Summarize findings**:
   - Briefly list:
     - Detected API endpoints and groupings (e.g. Auth, Orders, Users).
     - Detected test framework(s) and runner (e.g. Jest + npm scripts).
     - Any auth and environment variables that tests must handle.

Ask user to confirm or correct the summary before proceeding to planning.

## Phase 2 – Design a risk-based API test plan

1. **Define scope and priorities**:
   - Classify endpoints into:
     - Tier 1 – Business critical / money flows / auth.
     - Tier 2 – Important but less risky.
     - Tier 3 – Low-risk / informational.
   - Consider:
     - Data integrity, security, and privacy risks.
     - External dependencies (third-party APIs).

2. **Design test suites**:
   - Propose the following suites with example coverage:
     - **Smoke**: 5–10 key checks that must always pass (e.g. health, login, basic CRUD happy path).
     - **Regression**: broader CRUD, edge cases, error handling, pagination, filtering, idempotency.
     - **Negative & robustness**: invalid payloads, missing/invalid auth, boundary values.
     - **Contract/schema tests**: request/response shape validation against OpenAPI or schema.
   - For each suite, list:
     - Goals
     - Representative endpoints
     - Example test ideas

3. **Non-functional and cross-cutting concerns**:
   - Mention:
     - Basic performance checks (latency thresholds).
     - Security checks (auth enforcement, sensitive fields leaks).
     - Observability (logging correlation IDs, error responses).

4. **Output**:
   - Produce a concise **API Test Plan** in markdown, including:
     - Scope, assumptions, risks, and suites.
     - Mapping from endpoints → suites.
     - Suggested execution frequencies (on PR, nightly, release).
   - Save it to `.qa/api-test-plan.md`.

Pause and let the user optionally adjust the plan. Incorporate their feedback before generating code.

## Phase 3 – Generate example automated tests

1. **Choose framework based on project**:
   - If existing API tests are found:
     - Match their framework and style (naming conventions, folder structure, assertions).
   - If none is found:
     - Propose a reasonable default based on language:
       - Node.js: Playwright API test or Supertest + Jest/Vitest.
       - Other stacks: pick a common, idiomatic choice and briefly justify.

2. **Select representative test cases**:
   - From the API test plan, select a small but meaningful subset:
     - 2–3 smoke tests from Tier 1 endpoints.
     - 1–2 negative tests.
     - 1 contract/schema validation example, if feasible.

3. **Generate tests**:
   - Create or extend appropriate test files using the edit tools.
   - Follow existing project patterns for:
     - Test file naming
     - Setup/teardown (fixtures, beforeAll/afterAll)
     - Base URL configuration (env vars, config files)
   - Ensure:
     - Tests are deterministic.
     - No secrets are hard-coded (use env vars/placeholders).
     - Clear, meaningful assertions.

4. **Explain how to run the tests**:
   - Search the codebase to detect relevant npm/yarn/pnpm scripts or test runners.
   - If needed, add or update a test script (with user confirmation).
   - Summarize:
     - How to install dependencies (if new).
     - Which command(s) run the new tests.

## Phase 4 – Run and iterate

1. **Run tests**:
   - Execute the relevant test command in the terminal.
   - Read the test output for failures.

2. **Debug and fix**:
   - For each failure:
     - Identify root cause: environment/config vs. test bug vs. app bug.
     - Prefer minimal fixes that keep tests reliable and readable.
   - Re-run, up to 3 fix attempts per test. Stop when the selected tests pass, when a failure is an app defect (report it with the request and response), or when you hit an environment limitation; report each.
   - Never make a test pass by loosening an assertion, accepting any status code, or adding retries.

3. **Summarize and hand off**:
   - Provide:
     - Final API Test Plan (link/description of where it lives if saved to a file).
     - Paths of created/updated test files.
     - Commands to run the tests locally and in CI.
     - Suggested next steps (e.g. expand coverage to more endpoints, add contract tests, add performance baseline).
