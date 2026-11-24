---
name: manual-release-testing
description: 'Plans and runs the manual part of release validation: fresh install, upgrade from supported older versions, rollback, data migration, configuration drift, and the first-run smoke of the deployed release. Produces a dated release checklist with per-item verdicts, evidence, and blockers. Use when preparing or gatekeeping a release from a tester standpoint, when an installer or upgrade path is about to ship untested, or when rollback must be proven to work before sign-off. For the overall go/no-go recommendation use assessing-release-readiness; for designing the broader test plan use designing-functional-tests.'
argument-hint: 'Product, release version, supported upgrade paths, and environments available'
user-invocable: true
---

# Manual Release Testing

Use this skill when a release has to be validated the way a user or operator will actually meet it: by installing it, upgrading to it, migrating data into it, and - if the release must be reversible - rolling it back.

Automated gates answer "is the code correct". This skill answers the questions automation structurally cannot: does the installer work on a machine that was never ours, does the upgrade preserve yesterday's data, does rollback really restore a working system, and what does a first-time run look like without our internals knowledge.

## When to Use

- Preparing or gatekeeping a release from a tester standpoint: fresh install, upgrade from supported older versions, rollback, data migration
- An installer or upgrade path is about to ship untested
- Rollback must be proven to work before sign-off
- Configuration drift between environments needs checking

## When NOT to Use

- The release decision itself (defect risk, exit criteria, go/no-go) - that is `assessing-release-readiness`; this skill is one of its inputs.
- Designing what to test broadly, before a release is near - `designing-functional-tests` or `create-test-plan`.
- A regression sweep of features - `regression-scope`; here features only appear as smoke steps.
- Deployment automation correctness (the pipeline's own behavior) - `automating-ci-test-pipelines`; here the pipeline's output is the product under test.

## Evidence model

Every checklist item ends with a verdict and evidence, not a feeling:

- ✅ PASS - the expected result happened; evidence is the captured log line, screenshot, or command output
- ❌ FAIL - the expected result did not happen; the evidence quotes the actual result, and the deviation goes to `reporting-bugs`
- 🚧 BLOCKED - the item could not be attempted (environment missing, earlier step failed); evidence names the blocker
- SKIPPED with reason - a deliberate, written decision, never a silent absence (same standard `governing-quality-waivers` applies to checklists as to any other gate)

The checklist file cites the environment, versions, and date, so the run can be cited later by `assessing-release-readiness` or recorded by `attesting-manual-verification` as a dated attestation.

## Procedure

### 1. Inventory the release surface

From the release notes / changelog / commit range, list what actually ships and what it touches:

- the artifact to install (installer, package, image, store build)
- data migrations, schema changes, required indexes or background jobs
- new or removed configuration: env vars, flags, secrets, service endpoints
- changed prerequisites: OS version, runtime, database version, storage layout
- removed or renamed anything an upgrader could depend on

Then write down the **supported upgrade paths** (typically N-1, sometimes N-2) exactly as the release docs promise them. A path nobody tests is a promise made in writing that nobody verified.

### 2. Build the checklist

One file, `.qa/release-checklist-<version>-<date>.md`, with a section per release surface (template below). Every item is a step small enough to have one expected result and one piece of evidence. Assign each item an owner if several people run the release pass.

### 3. Fresh install on a clean environment

Install on the cleanest environment available (fresh VM/container, new account):

- before anything else, snapshot or note the baseline (ports free, directories absent) - leftover state from previous runs hides installer bugs
- run the documented install path, not the internal one; follow docs verbatim (if the docs are a deliverable, `testing-documentation` owns that pass - here just record mismatches)
- verify the product starts, first-run flow is reachable, logs are clean of errors
- if an uninstaller ships: uninstall, verify no leftovers (files, services, ports, scheduled tasks)

Expected results and the evidence to capture: startup log tail, first-run screenshot before and after, directory listing after uninstall.

### 4. Upgrade from the oldest supported baseline

- prepare the baseline environment with data that exercises the migration (realistic `designing-test-data` fixtures: records that are old, incomplete, boundary-heavy)
- export a data snapshot before upgrading (this doubles as the rollback input for step 6)
- run the upgrade exactly as documented for that path
- after upgrade: migration reports sane, data spot checks (counts, samples, boundary rows), then the section-5 smoke

Any documented supported path that gets no run here must be labeled SKIPPED with a reason before release, not discovered missing afterwards.

### 5. First-run smoke

A short scripted pass over the deployed release:

- the core path the release exists for (the feature list from step 1)
- the critical legacy paths that must not have regressed (pick with `regression-scope`).
- configuration actually applies: set a new option, verify the visible effect; break it on purpose, verify failure is loud and actionable (not a silent default)

Keep it a smoke, not a regression suite: each step binary, evidence a screenshot or log line.

### 6. Rollback (when the release must be reversible)

- restore per the documented rollback procedure using the pre-upgrade snapshot from step 4
- verify the system is usable: old version reads the data, no half-migrated state errors, users can work
- record **how long rollback took**, measured: "rollback is ready" is a duration, and `assessing-release-readiness` cannot call it green without one
- if rollback is documented as "restore from backup, then reinstall previous version", test exactly that, with the backup that a customer (not the development laptop) would actually have

### 7. Report

Report blockers first, as `communicating-quality-findings` prescribes: the verdict counts per section, then ❌/🚧 findings with evidence quoted, then the release recommendation is stated as a recommendation (the go/no-go itself belongs to `assessing-release-readiness`). The verdict summary line per section:

```
Install:    6 ✅ / 1 ❌ (install order doc mismatch) / 0 🚧
Upgrade:    9 ✅ / 2 ❌ / 1 🚧 (staging DB version too old)
Rollback:   5 ✅ / 0 ❌ / 0 🚧 (14 min measured)
Smoke:      11 ✅ / 1 ❌
Config:     4 ✅ / 3 ❌ (BREAKING: removed flag used silently)
```

The triple status and dates make the checklist citable evidence for later, not a checklist that goes stale.

## Checklist template

```markdown
# Release checklist: <version> - <date>
Environment: <os/runtime/db versions>   Runner: <name>   Start/End: <times>

## Install (fresh)
- [ ] #1 <step> - expected: <result> - verdict: ✅/❌/🚧/SKIPPED - evidence: <link/quote>
- [ ] ...

## Upgrade from <N-x> (data: <fixture set>)
- [ ] #1 export pre-upgrade snapshot -> <path> - verdict: ...
- [ ] ...

## Rollback (input: <snapshot>)
- [ ] #1 ... duration measured: <m>

## Smoke of the deployed release
- [ ] #1 ...

## Config and prerequisites
- [ ] #1 ...
```

## Decision Rules

**Test N-1 always when:** any migration or removed config exists; the release announcement names it as supported.

**Test N-2 when:** customers on N-2 are a supported population or a migration spans two versions' schema.

**Prefer BLOCKED over quiet FAIL when:** the environment defeats the step - a BLOCKED with a named blocker is fixable the same day; a FAIL chased into environment noise wastes the analyst afternoon.

**Prefer a second platform only when:** the installer touches OS-specific machinery (services, registry, drivers); otherwise one representative platform is enough for a manual pass and the platform matrix belongs to automation.

**Record time for rollback when:** the release must be reversible - no duration, no rollback claim in the report.

Budget guard: if the checklist cannot be finished in the time available, cut from the bottom of each section (leave step 3-6 core items in) and record what was cut as SKIPPED with reasons. A checklist with honest skips beats a checklist that silently did not run.

## Related Skills

- `assessing-release-readiness` - the consumer of this checklist; this skill produces evidence, that one makes the call
- `regression-scope` - picking the legacy smoke steps
- `testing-documentation` - when install/setup docs themselves are in scope
- `reporting-bugs` - writing up each ❌ finding
- `attesting-manual-verification` - recording the pass as a dated attestation
- `designing-test-data` - the migration-fixture set for step 4

## Definition of Done

- [ ] Release surface inventory lists artifact, migrations, config deltas, and prerequisites
- [ ] Every documented upgrade path is either run or labeled SKIPPED with reason
- [ ] Checklist file exists with per-item verdicts and evidence
- [ ] Rollback either measured (with duration) or explicitly out of scope with a stated reason
- [ ] Blockers reported first; each ❌ has a quoted actual result
- [ ] The report states what a release decision-maker should read next (usually `assessing-release-readiness`)

## Example prompts

- `/manual-release-testing plan and run the manual release pass for 2.4.0 on Windows and Linux`
- `/manual-release-testing build the upgrade checklist from 1.9: what data fixtures do I need`
- `/manual-release-testing prove the rollback path works and measure how long it takes`
- `/manual-release-testing fresh-install checklist for the Docker image release`
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
