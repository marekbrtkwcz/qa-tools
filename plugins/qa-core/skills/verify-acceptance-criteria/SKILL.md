---
name: verify-acceptance-criteria
description: Checks implementation evidence (code, PR, screenshots, API responses, or a running app) against acceptance criteria and marks each criterion Met, Partial, Not Met, or Untestable, with cited evidence and a sign-off summary. Use when a story is ready for review or sign-off, or when someone asks whether a feature does what was agreed. To review the criteria themselves before implementation, use the review-requirements command; to map requirements to existing tests, use the map-requirements-coverage command.
argument-hint: "[criteria] [evidence]"
disable-model-invocation: true
---

# Verify acceptance criteria

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `criteria`: acceptance criteria, user story, or ticket text (or a file path)
- `evidence`: what to check against: PR or diff, code paths, a running URL, screenshots, or API responses

## Who does the work

Hand this task to the `test-planner` agent (`test_planner` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `verifying-acceptance-criteria` skill is installed, load it before starting.

Verify whether the implementation in <evidence> satisfies the acceptance criteria in <criteria>.

## Inputs to collect

| Input | If missing |
| --- | --- |
| Acceptance criteria: <criteria> | Ask for them and stop until you have them |
| Implementation evidence: <evidence> | If the workspace has uncommitted changes or a branch ahead of `main`, use that diff and say so; otherwise ask |
| Environment under review | Ask only if a running URL is involved |

## Steps

1. **Normalize the criteria** into atomic items with stable IDs (`AC-1`, `AC-2`, …). Split compound criteria ("user can edit and delete") into separate items.
2. **Verify each item** against the evidence:
   - code or diff: find the code path that implements it, and any test that asserts it
   - running URL: exercise the behaviour with Playwright and record what you saw
   - screenshots or API responses: compare them with the expected result
3. **Assign a status**: Met (evidence shows the behaviour), Partial (some cases or conditions missing), Not Met (evidence contradicts it or no implementation found), Untestable (the criterion is too vague to check, or the needed evidence is unavailable). Cite the evidence for every status.
4. **Summarize** what is ready, what needs follow-up, and what needs clarification.

## Output

Return Markdown only:

```markdown
# Acceptance verification: <story>
Evidence checked: <PR/branch/URL/screenshots> · Environment: <env>

| ID | Criterion | Status | Evidence | Notes |
| AC-1 | … | Met | `src/cart/total.ts:42`, test `cart.spec.ts` "updates total" | |

## Sign-off summary
Met n · Partial n · Not Met n · Untestable n
Verdict: ready / not ready, because …

## Next step
```

End with one next step: fix (which items), clarify requirements (which questions), add tests (which items have no test), or re-verify later (what evidence is missing).

## Guardrails

- Do not invent product rules. A criterion that needs a rule nobody stated is Untestable, with the question to ask.
- Do not mark an item Met from code that merely exists; show where it implements the behaviour, or what you observed running.
- On a running app, test only environments you are authorized to use, and ask before actions that create, change, or delete real data.
- Read-only: do not edit code or tests.
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
