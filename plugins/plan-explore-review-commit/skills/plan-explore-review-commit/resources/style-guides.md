# Style guides for plan-explore-review-commit

Templates the orchestrator and subagents fill in: plan, phase-complete, plan-complete and git commit message. Referenced from SKILL.md; keep the anchors (<plan_style_guide> etc.) stable.

<plan_style_guide>

```markdown
## Plan: {Task Title (2-10 words)}

{Brief TL;DR of the plan - what, how and why. 1-3 sentences in length.}

**Phases {3-10 phases}**
1. **Phase {Phase Number}: {Phase Title}**
    - **Objective:** {What is to be achieved in this phase}
    - **Files/Functions to Modify/Create:** {List of files and functions relevant to this phase}
    - **Tests to Write:** {Lists of test names to be written for test driven development}
    - **Steps:**
        1. {Step 1}
        2. {Step 2}
        3. {Step 3}
        ...

**Open Questions {1-5 questions, ~5-25 words each}**
1. {Clarifying question? Option A / Option B / Option C}
2. {...}
```

**Important rules for writing plans:**
- DON'T include code blocks, but describe the needed changes and link to relevant files and functions.
- NO manual testing/validation unless explicitly requested by the user.
- Each phase should be incremental and self-contained.
- Steps should include: write tests first, run failing tests, write minimal code, run tests to pass, refactor.
- AVOID having red/green processes spanning multiple phases for the same implementation.

</plan_style_guide>

<phase_complete_style_guide>

```markdown
## Phase {Phase Number} Complete: {Phase Title}

{Brief TL;DR of what was accomplished. 1-3 sentences in length.}

**Files created/changed:**
- File 1
- File 2
- File 3
...

**Functions created/changed:**
- Function 1
- Function 2
- Function 3
...

**Tests created/changed:**
- Test 1
- Test 2
- Test 3
...

**Review Status:** {APPROVED / APPROVED with minor recommendations}

**Git Commit Message:**
{Git commit message following git_commit_style_guide}
```

</phase_complete_style_guide>

<plan_complete_style_guide>

```markdown
## Plan Complete: {Task Title}

{Summary of the overall accomplishment. 2-4 sentences describing what was built and the value delivered.}

**Phases Completed:** {N} of {N}
1. Phase 1: {Phase Title}
2. Phase 2: {Phase Title}
3. Phase 3: {Phase Title}
...

**All Files Created/Modified:**
- File 1
- File 2
- File 3
...

**Key Functions/Classes Added:**
- Function/Class 1
- Function/Class 2
- Function/Class 3
...

**Test Coverage:**
- Total tests written: {count}
- Test result of the last run: {passed / failed counts and the command}

**Recommendations for Next Steps:**
- {Optional suggestion 1}
- {Optional suggestion 2}
...
```

</plan_complete_style_guide>

<git_commit_style_guide>

```text
fix/feat/chore/test/refactor: Short description of the change (max 50 characters)

- Concise bullet point 1 describing the changes
- Concise bullet point 2 describing the changes
- Concise bullet point 3 describing the changes
...
```

DON'T include references to the plan or phase numbers in the commit message. The git log/PR will not contain this information.

</git_commit_style_guide>
