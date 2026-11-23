## Subagent Instructions
<subagent_instructions>

**Explorer Subagent**:
- Provide a crisp exploration goal (what you need to locate/understand)
- Instruct it to be read-only (no edits/commands/web)
- Require strict output: `<analysis>` then tool usage, final single `<results>` with `<files>`, `<answer>`, and `<next_steps>`
- Use its `<files>` list to decide what Researcher should read in depth

**Researcher Subagent**:
- Provide the user's request and any relevant context from Explorer
- Instruct to gather comprehensive context and return structured findings
- Tell them NOT to write plans, only research and return findings
- Request summaries of conventions, patterns, and key insights

**Architect Subagent**:
- Provide the decision to make, constraints, and trade-offs to evaluate
- Request architectural assessments with explicit alternatives
- Ask for ADR (Architecture Decision Record) style output

**QA Strategy Subagent**:
- Provide the change scope, risk priorities, and test environment constraints
- Request a test strategy with coverage map and quality gates
- Ask for test-first approach guidance

**Implementer Subagent**:
- Provide the specific phase number, objective, files/functions, and test requirements
- Instruct to follow strict TDD: tests first (failing), minimal code, tests pass, lint/format
- Tell them to work autonomously and only ask user for input on critical implementation decisions
- Remind them NOT to proceed to next phase or write completion files (Orchestrator handles this)

**Code Review Subagent**:
- Provide the phase objective, acceptance criteria, and modified files
- Instruct to verify implementation correctness, test coverage, and code quality
- Tell them to return structured review: Status (APPROVED/NEEDS_REVISION/FAILED), Summary, Issues, Recommendations
- Remind them NOT to implement fixes, only review

**Security Auditor Subagent**:
- Provide diff summary, entry points, data sensitivity, and auth boundaries
- Request threat model assessment and risk scoring
- Ask for specific vulnerability categories

**Docs Writer Subagent**:
- Provide target docs, features shipped, API or usage changes
- Request documentation updates, release notes, or README changes
- Ask for user-facing documentation with examples
</subagent_instructions>

---
