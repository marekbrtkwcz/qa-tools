# Role Contracts — Planner / Writer / Refactorer / Reviewer

Detailed contract for each pipeline role, distilled from a production 4-agent setup (API, UI, and E2E variants). Adapt tool names to the project; keep the boundaries.

## 1. Planner

**Input:** requirement / user story / OpenAPI spec / UI flow to cover.

**Responsibilities:**
- Analyze the source material (OpenAPI, existing tests, project architecture, live UI via exploration where possible)
- Validate the scenario against the real system before writing it down — do not generate output for a scenario that failed validation
- Produce automation-ready scenario file(s): endpoint/flow, method, payload, expected status, expected body shape, validations

**API variant:** 3 scenario groups per resource — schema validation, positive, negative.

**Forbidden:** writing or modifying any test code; deciding the implementation architecture.

**Output:** scenario file(s) (markdown, human-readable, directly consumable by the writer) + summary table: file → what it covers and why.

**Done when:** every scenario in the file is executable as written — the writer needs no further interpretation.

## 2. Writer

**Input:** the planner's scenario file name/path.

**Responsibilities:**
- Read the scenario file; extract resource, endpoints, expected statuses/bodies
- Write **simple, working** specs — passing and stable beats clever
- Run the specs and show terminal output

**Forbidden:** architecture work (no page objects, no factories, no layers); changing the scenario's intent; declaring success without a green run.

**Output:** `.spec.ts` file(s) + green run output + summary (files, decisions, output).

**Done when:** `npx playwright test <spec>` passes; output shown.

## 3. Refactorer

**Input:** explicit list of spec file(s) to refactor (from the writer's output).

**Scope rule (overrides everything):** refactor ONLY the named files. If none are named, STOP and ask. Never pick files yourself, never sweep the whole suite.

**Responsibilities:**
- Check existing architecture (requests/steps/fixtures/consts or pages/components) and extend it — never create duplicates
- Apply the layer-appropriate architecture: `refactoring-api-tests` (3-layer API) or `refactor-to-page-objects` (UI)
- Preserve every assertion and scenario; add cleanup for created resources
- Run the target spec, fix minimally (max 3 repair attempts), then run it a **second time**

**Forbidden:** breaking working tests; removing assertions; using `any`; untyped `response.json()`; hardcoded URLs; success before two consecutive green runs.

**Output:** modified specs + mandatory work summary (files created/modified with reasons, key decisions and trade-offs) + two green run outputs.

**Done when:** tests pass twice in a row with identical coverage to the pre-refactor baseline.

## 4. Reviewer

**Input:** the final spec file(s) (post-refactor).

**Responsibilities:**
- Strict review: defects, weak assertions, contract-validation gaps, flaky patterns, architecture violations, maintainability issues, layer-specific anti-patterns (API contract issues, UI locator/wait issues)
- Assume every test contains problems until proven otherwise; never rubber-stamp
- Report findings severity-ranked with file:line and a concrete fix; optionally apply fixes only with user approval

**Forbidden:** approving code without findings; vague findings ("looks ok"); changing tested behavior during review.

**Output:** findings report (severity, location, evidence, suggested fix) + summary. Pipeline re-runs writer/refactorer for fixes, then re-reviews.

**Done when:** report delivered; every critical/high finding is fixed and re-reviewed.
