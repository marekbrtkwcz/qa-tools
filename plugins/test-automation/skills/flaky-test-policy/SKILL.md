---
name: flaky-test-policy
description: "Sets the team's flake policy: when a retry is a legitimate CI concession and when it masks a bug, how quarantined tests are owned, dated and expired, and when a flake must block the merge. Use when flaky tests accumulate without owners, when a pipeline goes green only after a re-run, or when someone proposes raising a timeout as a fix. For diagnosing and fixing one flaky test, use stabilizing-flaky-tests."
argument-hint: "Current flake list or CI report, merge policy, and who owns the suite"
user-invocable: true
---

# Flaky Test Policy

A flaky test is a test that fails intermittently without a code change. Left alone, flakes train the team to re-run CI until green - which is a pipeline that cannot fail. This skill is the policy layer; `stabilizing-flaky-tests` is the per-test diagnosis.

## Operating Principles

- **A retry is a CI concession, never a fix.** Retries belong to CI config for genuinely nondeterministic environments; they must never be the reason a broken test passes locally.
- **Quarantine is owned and expiring.** A quarantined test has a named owner, a reason, and an expiry date. An unowned skip is invisible debt.
- **Fix or quarantine - never ignore.** Every flake gets one of the two, in writing. "We'll look at it later" is not a state.
- **The flake rate is a gate metric.** Track it per suite (`analyzing-quality-metrics`, quality-gates); a rising flake rate blocks merge even when the suite is green.

## Workflow

1. **Inventory.** List current flakes from CI history (`analyze-test-results` clusters flakiness suspects). For each: last 20 runs, pass rate, owner.
2. **Classify each flake** with `stabilizing-flaky-tests` root-cause classes: timing, shared state, data collision, environment, order dependence, external dependency, real race.
3. **Decide per flake:** fix now (root cause known, fix cheap), schedule (owner + date), or quarantine (owner + expiry + reason + link to issue).
4. **Write the policy down** in the repo (e.g. `docs/flaky-policy.md` or a section in the test README): retry policy in CI (how many, when), quarantine file location, expiry default (e.g. 30 days), who can extend a quarantine (suite owner only, once).
5. **Enforce:** quarantine expiry is a failing check (`governing-quality-waivers`, quality-gates - expired waiver = NO-GO). Flake rate over threshold fails CI.

## Retry policy defaults

| Layer | Retry | Why |
| --- | --- | --- |
| Local dev run | 0 | a retry locally hides the flake from the person who can fix it |
| CI PR gate | 1-2, only on tests with a known environment nondeterminism | protects merge signal without masking code flakes |
| Retry as the fix | never | if a retry makes it pass, the test was wrong, not lucky |

## Red Flags

- `retries: 3+` in local config, or a global retry that applies to all tests
- quarantined tests with no owner or no expiry date
- a PR that only touches flaky tests and adds retries/timeouts
- flake rate rising while pass rate stays 100% (green pipeline, dead signal)

## Related Skills

- `stabilizing-flaky-tests` - reproduce, classify and fix one flake
- `diagnosing-test-failures` - when the failure is deterministic
- `analyze-test-results` - cluster CI output into flake suspects
- `governing-quality-waivers` (quality-gates) - the dated, expiring waiver mechanism quarantines reuse
- `analyzing-quality-metrics` (quality-gates) - flake rate as a tracked metric with a threshold

## Definition of Done

- every current flake is fixed, scheduled, or quarantined with owner + expiry
- the written policy states retry defaults per layer and where quarantines live
- CI fails on expired quarantine and on flake-rate threshold breach
- no test in the suite relies on a retry to pass
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
