---
name: regression-scope
description: Turns a diff, PR summary, changed files, or hotfix description into a prioritized regression scope (must, should, sample, defer) with a minimal confidence suite and retest guidance for testers. Use when deciding what to retest before a release, after a hotfix, or when a full regression run does not fit the time available. For an automated gate on a diff with coverage and intent checks, use the scope-change-gate command.
argument-hint: "[change]"
disable-model-invocation: true
---

# Analyze regression scope

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `change`: diff, PR link or summary, changed files, or release notes (default: git diff main...HEAD)

## Who does the work

Hand this task to the `qa-strategist` agent (`qa_strategist` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `analyzing-regression-scope` skill is installed, load it before starting.

Decide what must be retested after <change> and what can safely stay out of the first-pass regression pack.

## Inputs to collect

| Input | If missing |
| --- | --- |
| The change: <change> | If the workspace is a git repo, use `git diff main...HEAD --stat` and the diff itself, and say so. Otherwise ask for it and stop until you have it. |
| Critical user journeys or business flows | Infer them from the codebase, routes, and existing tests, and list them as assumptions |
| Release context (hotfix, major release, time available) | Assume a normal release and say so |

Ask at most one question at a time, and only when the answer would change the scope.

## Steps

1. **Map the change surface** into four rings: direct (changed code and its features), adjacent (callers and consumers), shared (common components, config, dependencies, schemas), and data/state (migrations, stored data, caches, sessions). Cite the file or hunk behind each item.
2. **Rate each affected area** high, medium, or low regression risk, with a one-line reason (business impact, change size, history of defects, missing tests).
3. **Check existing coverage**: for each high-risk area, find the automated tests that already cover it, so the pack does not ask testers to repeat what CI proves.
4. **Build the retest pack** in four tiers: must retest, should retest, can sample, can defer with caution.
5. **Pick the minimal confidence suite**: the smallest set of checks that would catch a broken release, with an estimated duration.

## Output

Return Markdown only:

```markdown
# Regression scope: <change>
Change: <n files, areas> · Risk: High/Medium/Low · Assumptions: <…>

## Change surface
| Ring | Area | Evidence (file/hunk) | Risk | Why |

## Retest pack
| Tier | Area / flow | What to check | Covered by automation? | Est. time |

## Minimal confidence suite
1. …

## Blind spots and open questions
## Automation candidates
```

## Guardrails

- Analysis only: do not edit code or tests, and do not run the suite unless I ask.
- Do not mark an area out of scope without a reason; "unchanged" is a reason only if nothing it depends on changed.
- Name what the diff cannot show: config-driven behaviour, feature flags, data shape, and services outside this repository.
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
