---
name: generate-test-data
description: Designs a reusable test data catalog (valid baselines, boundaries, invalid inputs, role and state combinations) from requirements, constraints, a test plan, or the codebase, for manual and automated testing. Use when tests need concrete data sets, fixtures, or seed data, or when existing data misses boundaries and invalid cases. For the full catalog design with roles, boundaries, and state combinations, use the designing-test-data skill; this command is its quick generator form.
disable-model-invocation: true
---

# Generate test data

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `designing-test-data` skill is installed, load it before starting.

Your goal is to build a reusable test data catalog rather than a random list of sample values.

Ask only for what is missing:

- the feature, entities, or fields involved
- known constraints such as formats, limits, enums, and relationships
- whether the data is mainly for manual execution, automation, or both
- any state, role, or environment dependencies

If constraints are not fully specified, derive what you can from the provided plan, criteria, or codebase and list the rest as assumptions.

Then do the following:

1. Identify the key entities and field constraints.
2. Generate grouped data for:
   - valid baseline use
   - boundary values
   - invalid formats or rejected inputs
   - role and state combinations
   - temporal or expiry-sensitive values when relevant
3. Add setup, cleanup, and privacy notes.
4. Highlight which data sets are best suited for automation fixtures.

## Output format

Return Markdown only.
Use grouped tables with stable data-set IDs and clear purpose notes, for example:

`ID | Group | Field values | Purpose | Expected outcome | Fixture-ready?`

## Constraints

- Use synthetic data only. Never copy real customer data, real card numbers, or production records; use documented test values (e.g. payment provider test cards) and reserved domains such as `example.com`.
- Mark every value derived from an assumption rather than a stated constraint.
- Do not write fixture or seed files unless I ask; this command designs the catalog.
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
