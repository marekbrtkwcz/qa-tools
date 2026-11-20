---
description: White-box derivation of test cases from actual code — branches, boundaries, error paths — each marked covered/partial/missing against existing tests. Argument: file path, folder, or diff to analyze. Analysis and design only, no files created or edited. For requirements-derived cases use /manual-test-cases. See skills unit-testing, test-planning.
---

# Derive test cases from code

If the `unit-testing` / `test-planning` skills are available, load them.

Goal: derive test cases from what the code **actually does**, not from what requirements say it should do — complements `/manual-test-cases` (which works from requirements). Target: command argument (file path, folder, or diff); if none yields a target, ask before continuing.

## Steps

1. **Map the testable surface**: public functions, branches, loops, boundary conditions, error handling, side effects, external dependencies.
2. **Derive cases for**: each meaningful branch and decision outcome; boundary values visible in the code (limits, comparisons, off-by-one risks); error/exception paths and how failures propagate; input validation and type/format edge cases; state and side effects (setup + what to verify after).
3. **Search existing tests** for this code; mark each derived case **covered / partially covered / missing**.
4. **Flag testability problems**: hidden dependencies, non-deterministic behavior, logic unreachable from any public entry point.
5. Prioritize missing cases by risk.

## Output (Markdown table)

`ID | Target (function/branch) | Case | Input/Setup | Expected Result | Level (unit/integration/e2e) | Coverage | Priority`

End with the top gaps to close first and which cases are good candidates for `/test-generator`.

## Constraints

- Derive expected results from the code's actual behavior; if the code looks wrong, flag the suspicion instead of inventing a requirement.
- Do not create or edit any files — analysis and design only.
