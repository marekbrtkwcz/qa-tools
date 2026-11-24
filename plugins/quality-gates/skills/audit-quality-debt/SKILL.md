---
name: audit-quality-debt
description: "Audits repository-level quality debt (technical, intent, and comprehension) and inventories every silent skip: skipped tests, disabled lint rules, ts-expect-error, continue-on-error, coverage ignores, lowered thresholds, raised retries, and expired waivers. Use when a team wants to know what its CI and quality gates have quietly stopped enforcing, before a quality review, or when taking over a repository. For anti-patterns inside test code itself (selectors, waits, assertions), use the tech-debt-audit command."
argument-hint: "[repoPath]"
disable-model-invocation: true
---

# Audit quality debt and silent skips

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `repoPath`: repository or package path to audit (default: workspace root)

## Who does the work

Hand this task to the `quality-debt-auditor` agent (`quality_debt_auditor` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `tech-debt-analysis` skill is installed, load it before starting.

Audit the governance layer of this repository: what it claims to enforce, what it actually enforces, and what it has quietly stopped enforcing.

Use `governing-quality-waivers` for the silent-skip inventory, `recording-change-intent` for the intent pass, and `deriving-a-quality-contract` for the technical gap.

## Inputs to collect

| Input | Required | Notes |
| --- | --- | --- |
| Repository | ✅ | The workspace, or `<repoPath>` |
| Audit range | ⬜ | Commit range for the intent and comprehension pass - default: the last 90 days |
| Quality contract | ⬜ | `.qa/quality-contract.md` if it exists; otherwise audit against the escalation defaults and say so |
| Previous audit | ⬜ | For trend direction |

## Steps

1. **Technical debt** - gap matrix against the contract. Missing practices, partial ones, and gates that cannot fail.
2. **Silent skips** - inventory every suppression. Tests (`.skip`, `.only`, `.todo`, empty bodies, deleted specs), lint (inline and whole-file disables, rules set to off, ignore patterns), types (`@ts-expect-error`, `@ts-nocheck`, `any`, `strict: false` per package), CI (`continue-on-error`, `|| true`, `allow_failure`, schedule-only jobs, non-required checks), coverage (ignores, excludes, thresholds below current value), leniency (`retries` with no flake measurement, huge timeouts, hard waits), security (allowlists, open advisories, `--force`, `--ignore-scripts`), hooks (`--no-verify` in scripts or docs), AI gates (skipped evals, lowered eval thresholds).
3. **Waiver health** - expired, unbounded, unowned, or renewed more than twice.
4. **Intent debt** - high-risk changes in the range with no `Intent:`/`Intent-Ref:` trailer, no ADR link, no module register entry. Report malformed records separately from missing ones.
5. **Comprehension risk** - advisory band from diff size, new-branch density, and whether a human explanation accompanied the change. Report AI provenance only if `Assisted-by:` trailers are in use; otherwise "unknown".
6. **Trend** - where a previous audit exists, report direction per debt.

## Rules

- **Count, then name.** "46 suppressions, 7 explained, 0 registered" is what moves a team.
- **Quote a path and a line for every finding.** Governance findings get argued with more than code findings.
- **Comprehension findings never block.** Report the band and the unattested surface. Understanding cannot be proven by a signal, and claiming otherwise discredits the whole report.
- **Separate "not done" from "not visible".** Anything you could not assess is UNKNOWN with what you would need.
- **Every finding gets one of three outcomes:** fix, waive with reason/owner/expiry, or delete. No fourth option.
- **Do not name individuals as the problem.** Owners are for accountability on the fix.
- Do not fix anything. Report and plan.
- If the repository has no CI config, no tests, or no git history, say which passes could not run and continue with the rest.

## Output

Grouped by debt, in this order: **technical → silent skips → waivers → intent → comprehension → trend**, each with counts first and evidence beneath. Then an ordered plan, highest-hiding and lowest-effort first, each item naming the file, the fix, and who should own it.

Start the plan with the four that hide the most: whole-file disables, `|| true` in CI, coverage exclusions over logic directories, and any committed `.only`.
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
