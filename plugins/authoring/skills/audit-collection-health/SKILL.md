---
name: audit-collection-health
description: "Audits a collection of skills, agents, commands, and rules as one system: inventory, conformance to the house conventions, description trigger quality, overlap between near neighbours, broken cross-references, orphaned resources, drift between sources and generated copies, and which assets have no behavioural test. Use when preparing a release of the collection, after a batch of new assets, or when assets start colliding or triggering on the wrong requests. Read-only: it reports and never fixes. For behaviour testing of individual skills (activation, collision, before/after gates), use the testing-agent-skills skill."
argument-hint: "[collectionRoot] [scope]"
disable-model-invocation: true
---

# Audit collection health

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `collectionRoot`: repository root or subfolder to audit (default: workspace root)
- `scope`: asset types or a commit range like main...HEAD (default: all assets)

## Who does the work

Hand this task to the `skill-librarian` agent (`skill_librarian` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `testing-agent-skills` skill is installed, load it before starting.

Audit the customization collection at `<collectionRoot>` as one system and return severity-ranked findings I can act on without asking a follow-up question.

Read the conventions from the collection itself before finding anything. Do not fix anything.

Behaviour cases for a single asset (activation, output contract, before/after gate) belong to the `testing-agent-skills` skill if it is installed; this audit stays structural and points to it instead of expanding into it.

## Inputs to collect

| Input | Required | Notes |
| --- | --- | --- |
| Collection root | ✅ | `<collectionRoot>` - the repository root, or a subdirectory to scope the audit to |
| Scope | ⬜ | `<scope>` - asset types to audit, or a commit range like `main...HEAD` to audit only what changed. Defaults to every asset type |
| Conventions | ⬜ | Extra house rules not written down in the collection. Anything not supplied is read from `CONTRIBUTING.md`, the validation scripts, and the counted majority pattern |

## Steps

1. **Establish the conventions.** Read `CONTRIBUTING.md` and any authoring instructions, then the validation scripts, then count the majority pattern across existing assets. Report which source each convention came from. Where the documented rule and the majority practice disagree, report both counts as INFO rather than picking one.
2. **Inventory.** Count every asset by type. List the declared name, description, and scope of each. Name anything that looks like an asset but does not parse.
3. **Check conformance.** Required frontmatter fields, folder-to-name match, naming form, house-style sections present and non-empty, body length against the collection's ceiling.
4. **Score the descriptions.** For each asset: does the description contain phrases a user would actually type, does it name a concrete trigger scenario, and for a deliberate near neighbour, does it name that neighbour and say when to prefer it.
5. **Map overlaps.** Cluster assets by shared trigger vocabulary and scope. For each cluster, say whether the pair disambiguates in both directions, one direction, or neither. Flag any asset whose scope is a strict subset of another's as a merge candidate.
6. **Verify references.** Every Resource Map path resolves; every file under `resources/` is referenced by something; every related-asset name resolves; every prompt's `agent:` target exists; every orchestration handoff resolves inside its pack.
7. **Check the pipeline.** Run the collection's validation in check or dry-run mode only. Compare source assets against vendored copies, registry entries, and generated documentation, including localized copies. Attribute what a script reported rather than presenting it as your own verification.
8. **Report the test gap.** Which assets have behavioural eval cases; which claim "always applies" or a hard scope boundary with nothing testing it; which were edited after their last recorded eval run.
9. **Report** with severity, evidence, and a first step per finding.

## Rules

- **Conventions come from the collection, never from your preferences.** Cite the source for each one - documented, script-enforced, or counted majority.
- **Count what you counted.** "41 of 50" is a finding. "Most skills" is not.
- **Open every file you cite.** Never infer an asset's contents from its name or its neighbours.
- **State the search behind an absence.** An orphan claim is only as wide as the command that looked for references, so give the command.
- **Attribute script output.** "`npm run lint` reports 18 plugin-sync errors" - not "I verified 18 plugin copies".
- **Pre-existing failures are reported as pre-existing.** If the collection's own validation already fails before this audit, say so up front and separate those findings from anything the audited change introduced.
- **Severity follows user impact.** BLOCK is broken for users; WARN degrades the collection; NUDGE is advisory. Not by how easy the fix looks.
- **Do not rank assets by quality.** Report conformance, collisions, and gaps, with evidence.
- Do not edit, create, move, or regenerate anything. No generator in write mode.

## Output

```
Collection: <root> · <counts by asset type>
Conventions read from: <sources>
Verdict: n block · n warn · n nudge · n info
Pre-existing failures: <what was already failing before this audit>

<severity>  <finding-type>  <asset:line>  <one-line action>
…

Overlap clusters: <cluster> <members> <disambiguated both ways / one way / neither>
Test gap: <n> of <n> assets have behavioural cases
Could not verify: <check> - <why> - <what would let it run>
```

Then the full findings, BLOCK first, each with: finding, severity, asset and line, evidence with counts, the convention it violates and where that convention came from, and a concrete first step.

Finish with the exact commands to re-verify, and one line stating what the audit did not cover.
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
