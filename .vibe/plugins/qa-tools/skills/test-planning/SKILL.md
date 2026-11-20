---
name: test-planning
description: Load this skill when creating test plans, deriving test cases from requirements, or scoping regression. Covers scenario design, coverage mapping, and exploratory charters.
user-invocable: true
---

# Test Planning

## From requirements to test cases
1. Read each requirement/acceptance criterion
2. For each criterion, ask: "What could go wrong?"
3. Derive at least one positive and one negative case per criterion
4. Map each test case back to the requirement ID

## Scenario structure
A good test scenario has:
- **Preconditions** — required state before test
- **Steps** — numbered, one action per step
- **Expected result** — specific, verifiable
- **Test data** — concrete values to use

## Coverage mapping
| Requirement | Test Case ID | Type | Automated? |
|---|---|---|---|
| REQ-001 | TC-001 | Positive | ✅ |
| REQ-001 | TC-002 | Negative | ✅ |
| REQ-002 | TC-003 | Boundary | ❌ (manual) |

## Exploratory testing charters
Format: "Explore [target] with [resources] to discover [information]"

Example: "Explore checkout flow with expired cards to discover error handling gaps"

## Regression scoping
When scoping regression, consider:
- areas touched by the change
- areas that depend on changed code
- critical business flows
- recently flaky areas
- areas with no automation coverage
