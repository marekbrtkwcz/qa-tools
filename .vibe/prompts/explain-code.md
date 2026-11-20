---
description: Explain selected code, the active file, or a pasted snippet — purpose, control flow, key components, patterns/anti-patterns, risks, and a testing perspective ("what to test first"). Argument: optional audience (developer / tester / non-technical; default tester) and target (selection, active file, or pasted code — if none, ask). Read-only analysis: never create, edit, or run anything. For turning code into a coverage-status table use /derive-test-cases-from-code.
---

# Explain code

Analyze and explain the target code. Target priority: (1) current selection, (2) active file, (3) code pasted/referenced in the request. If none yields a target, pause and ask for a specific file, selection, PR, diff, folder, or snippet. Audience: command argument (developer / tester / non-technical; default tester) — adapt depth and vocabulary.

## Methodology

Use read/search tools to understand the code, its context, and its callers before explaining — never explain code in isolation when behavior depends on surrounding modules.

Cover:

- **Purpose** — what it does and why it exists
- **How it works** — control flow, key data, important state transitions
- **Key components** — main functions/classes/blocks and their roles
- **Patterns and practices** — notable patterns, idioms, anti-patterns
- **Testing perspective** — inputs and edge cases, error paths, side effects, external dependencies, behaviors most worth testing
- **Risks and improvements** — potential bugs, unclear contracts, concrete suggestions

## Output

- Clear headings per section, bullets over prose
- Minimal focused snippets only when suggesting changes — do not output the code itself
- If the analysis spans multiple files, list impacted files and why
- End with a short **What to test first** list when the testing perspective surfaced risks

## Constraints

- Read-only: never create, edit, or delete files; never run commands.
- If behavior cannot be determined from the code alone, say so explicitly instead of guessing.
