---
name: derive-quality-contract
description: Derives which testing practices are MUST, SHOULD, or COULD for this project from its risk profile, team maturity, and product surfaces, then reports a PRESENT/PARTIAL/MISSING/WAIVED gap matrix and an ordered remediation plan. Use when a team asks what testing it should be doing, when setting up quality gates for a new or inherited repository, or when the contract must be rebuilt after a change in risk. To audit what existing gates have stopped enforcing, use the audit-quality-debt command. For the full step-by-step derivation workflow, use deriving-a-quality-contract; this is its one-command gap-matrix form.
argument-hint: "[repoPath] [criticality]"
disable-model-invocation: true
---

# Derive a quality contract

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `repoPath`: repository or package path (default: workspace root)
- `criticality`: who is harmed by a defect and how badly, e.g. "internal tool" or "handles payments"

## Who does the work

Hand this task to the `quality-contract-architect` agent (`quality_contract_architect` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `deriving-a-quality-contract` skill is installed, load it before starting.

Derive this project's quality contract and report the gap between the contract and reality.

Use the `deriving-a-quality-contract` skill for the catalog, the profiles, the maturity model and the detection signals. Do not invent a practice list.

## Inputs to collect

| Input | Required | Notes |
| --- | --- | --- |
| Repository | ✅ | The workspace, or a path: `<repoPath>` |
| How critical is this system | ✅ | Who is harmed by a defect, and how badly: `<criticality>` |
| Regulatory or contractual exposure | ⬜ | Finance, health, public sector, SOC2, GDPR-heavy |
| Rollback speed | ⬜ | Can a bad release be undone in minutes, or not at all |
| Team experience with testing | ⬜ | Read from the repo if not supplied |
| Known out-of-scope areas | ⬜ | Practices already ruled out, and by whom |

If the criticality answer is missing, **ask for it before resolving anything**. It sets the profile, and the profile sets every requirement level in the contract.

## Steps

1. **Detect the triple.** Stack and tooling from manifests and CI. Product surfaces (`web-ui`, `http-api`, `wire-schema`, `ai-llm`, `data-store`, `library`, `cli`) with the evidence for each, and which are confidently absent. Maturity from the repo as it is, not from the team's ambition.
2. **Propose the profile** with the one sentence that justifies it, then **stop and confirm the triple with me** before continuing.
3. **Resolve the contract.** Drop practices whose required surface is absent (record as N/A with the reason). Defer practices above the current maturity (record as next level). Label the rest MUST / SHOULD / COULD.
4. **Detect current state** per practice: PRESENT (configured *and* enforced), PARTIAL, MISSING, WAIVED, or UNKNOWN. Quote a path, a dependency, or a CI step with a line number for every state.
5. **Grade the gap.** MUST + MISSING is a blocker and is not waivable. Order everything else by risk × effort.
6. **Write the artifacts** to `.qa/quality-contract.md`, plus `.qa/quality-contract.yaml` if gate tooling will read it.

## Rules

- **Configured is not verified.** A test runner in `package.json` proves the practice exists, not that recent changes were tested. Say which you measured.
- **Catch the fake gates.** `continue-on-error: true`, `|| true`, `|| echo "non-blocking"`, a lint step that only warns and never fails (eslint without `--max-warnings 0`, `biome ci` without `--error-on-warnings`), a job that is not a required check, a threshold set below the current value. Each is PARTIAL, and quote the line.
- **Never mark a manual practice PRESENT from tooling.** Code review, exploratory testing, UAT, accessibility, observability readiness are attested or unattested - with a date and a name, or nothing.
- **Use UNKNOWN.** Where you cannot determine a state, say so and say what you would need. Do not collapse it into MISSING.
- **No aspirational profiling.** An unsatisfiable contract gets ignored, which is worse than an honest `standard`.
- In a monorepo, derive per package if the packages differ in criticality, and say so.

## Output

1. The triple, with the evidence and one-sentence justification per axis.
2. Blockers - MUST practices in state MISSING - on their own lines.
3. The contract table: practice, level, tool, exit criterion, owner.
4. The gap matrix: practice, level, state, evidence, verdict.
5. Gap summary as counts: `n blockers · n to fix · n to attest · n unknown · n ok`.
6. The remediation plan, ordered, each item starting with a command I can run today.
7. What the contract does not cover: N/A practices, deferred practices, everything UNKNOWN.
8. The re-derivation trigger - what change should cause this contract to be rebuilt.
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
