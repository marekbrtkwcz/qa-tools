---
name: manual-test-cases
description: Turns a feature description, acceptance criteria, exploratory notes, or a test plan into step-by-step manual test cases with priority, expected results, and automation candidates. Use when testers need executable cases for a feature, a release, or a UAT session. To derive cases from the code itself, use the derive-test-cases-from-code command; for exploratory session charters, use the generate-exploratory-charters command. For the full risk-based pack with plans and automation handoff, use the designing-functional-tests skill; this command is its quick conversion form.
disable-model-invocation: true
---

# Generate manual test cases

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `designing-functional-tests` skill is installed, load it before starting.

Your goal is to create manual test cases that a tester can execute immediately.

Ask only for missing essentials:

- feature, story, acceptance criteria, notes, or an existing test plan
- URL or system under test if available
- target environment and roles if they affect behavior
- any explicit out-of-scope areas

If a live URL is provided, inspect the flow with Playwright to sharpen the cases. Explore only apps you are authorized to test, and do not submit forms or change data without my confirmation.

Then do the following:

1. Validate readiness. If expected behavior is unclear, list the gaps and ask targeted questions. Do not invent product rules.
2. Normalize the input into functional areas and stable scenario IDs.
3. Generate manual test cases using the skill template when available.
4. Cover positive, negative, boundary, permission, recovery, and accessibility-smoke cases for high-risk areas.
5. Mark each case with priority, case type, and automation candidate.
6. End with:
   - open questions and assumptions
   - the best candidates to pass into `test-generator` or `playwright-generate-test`

## Output format

Return Markdown only.
Use a table with these columns:

`ID | Area | Priority | Type | Preconditions | Steps | Expected Result | Automation Candidate | Notes`
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
