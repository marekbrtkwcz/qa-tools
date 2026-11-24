---
name: stabilize-flaky-tests
description: Reproduces intermittently failing tests with repeated and parallel runs, classifies the root cause (timing, isolation, data, environment), fixes it, and proves stability with before/after failure rates. Use when tests pass on retry, fail only in CI, or fail under parallel workers. For tests that fail every time, use the fix-tests command.
argument-hint: "[testScope]"
disable-model-invocation: true
---

# Stabilize flaky tests

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `testScope`: known flaky test(s), or a suite scope to screen for flakiness

# Task

If the `stabilizing-flaky-tests` skill is installed, load it before starting.

Your goal is to make flaky tests deterministic - not to make them pass more often.

Target: <testScope>

Ask only for missing essentials:

- the scope, if not provided
- any CI evidence of intermittent failures (retry logs, failure history), if available

Then do the following:

1. Reproduce the flakiness: run the suspect tests repeatedly (e.g. Playwright `--repeat-each=10`) and, separately, with parallel workers, to observe both timing and isolation failures. Record the failure rate.
2. Classify each flaky test by root cause:
   - **Timing/UI** - races with rendering, animation, or network; sleeps and hardcoded waits
   - **Test isolation** - order dependence, shared state, leaked data between tests or workers
   - **Data** - non-unique or reused test data colliding across runs or workers
   - **Environment** - CI-only conditions, resource limits, external dependencies
3. Fix the root cause, not the symptom:
   - replace sleeps with web-first assertions or waits on concrete conditions (a specific response, URL, or element state); start response waits before the triggering action
   - make each test own its state: unique per-worker data, proper setup/teardown in fixtures, no shared mutable state or `beforeAll` page sharing
   - mock unstable external dependencies instead of tolerating them
   - disable animations when they interfere with interactions
4. Prove stability: rerun each fixed test repeatedly and in parallel until it passes consistently (e.g. 10+ consecutive runs). Report the before/after failure rate.
5. If a test cannot be stabilized now, quarantine it explicitly (framework annotation plus a tracking note with your diagnosis) - never delete it or hide it behind retries.

# Guardrails

- Never stabilize by increasing global timeouts, adding retries, weakening assertions, or forcing serial execution without documenting why.
- Keep each fix minimal and explain the root cause per test in the summary.

## Related Skills

- `flaky-test-policy` - the quarantine/ownership rules when a flake cannot be fixed now
- `diagnosing-test-failures` - when the failure is deterministic, not intermittent
- `unslop-tests` - retries and hardcoded waits are the classic flake masks
- `test-reports-and-artifacts` - keep trace/video on the quarantined runs for evidence

## Definition of Done

- flake reproduced under the conditions that broke it (repeated/parallel runs)
- root-cause class stated: timing, shared state, data collision, environment, order dependence, external dependency, real race
- fix proven under the same conditions; or quarantine with owner and expiry per `flaky-test-policy`
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
