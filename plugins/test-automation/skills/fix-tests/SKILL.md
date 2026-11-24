---
name: fix-tests
description: Runs the failing tests in a scope, diagnoses each failure, and fixes the root cause without weakening assertions, adding retries, or masking app defects. Use when tests fail consistently and you want them repaired. For intermittent failures, use the stabilize-flaky-tests command; to only diagnose without editing, use the explain-test-failure command.
argument-hint: "[testScope]"
disable-model-invocation: true
---

# Fix failing tests

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `testScope`: test file, folder, or suite to fix (default: the full suite)

# Task

If the `diagnosing-test-failures` skill is installed, load it before starting.

Your goal is to fix failing tests in <testScope>. If no scope is provided, run the full suite.

Do the following:

1. Identify failing tests:
   - Run the test suite (limited to the given scope) to identify which tests are failing.
   - Analyze error messages, logs, and traces to understand the root cause of each failure.
   - Classify each failure before fixing: application defect, test bug, environment/config issue, or flaky test. Rerun a failing test in isolation when you suspect flakiness - an intermittent failure needs a root-cause fix (waiting strategy, test isolation, data setup), not a retry.
2. Fix failing tests:
   - Modify the test or the code under test to address the root cause.
   - Ensure that fixes are aligned with the overall test strategy and quality standards.
3. Validate fixes:
   - Rerun the affected tests to confirm they pass.
   - For fixed flaky tests, confirm stability by repeating the run when the framework supports it (e.g. Playwright `--repeat-each=5`), not by a single green run.
   - Rerun the full scope to confirm no new failures were introduced.

If tests still fail after 3 fix iterations, stop and summarize what you found, what you tried, and what remains failing.

# Guardrails

- Never make a test pass by weakening or deleting assertions, increasing global timeouts to mask races, adding retries to hide flakiness, or skipping the test.
- Fix waits by replacing sleeps and hardcoded timeouts with condition-based waiting (web-first assertions, waiting for a specific response or state), not by tuning sleep durations.
- If the failure indicates a defect in the application code and fixing it is outside the requested scope, stop and report the defect with evidence instead of changing the test to accept the broken behavior.
- Keep each fix minimal and explain the root cause in your summary.

## Related Skills

- `diagnosing-test-failures` - the red-green reproduction loop per failure
- `stabilizing-flaky-tests` - when failures are intermittent rather than deterministic
- `unslop-tests` - review the fix for weakened assertions, retries used as fixes, swallowed errors
- `reporting-bugs` (qa-core) - when the root cause is an app defect, file it instead of patching around it

## Definition of Done

- every failure in scope has a stated root cause
- no assertion weakened, no retry or timeout raised as a fix, no app defect masked
- the affected tests re-run green, output quoted
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
