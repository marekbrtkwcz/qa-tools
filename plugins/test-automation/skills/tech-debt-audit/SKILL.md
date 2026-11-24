---
name: tech-debt-audit
description: Audits automated test code for anti-patterns (fragile selectors, hardcoded waits, missing or swallowed assertions, test interdependence, CI misconfiguration, credential leaks) and produces a severity-ranked debt report with line citations, fixes, and an A-F health score. Use when reviewing a test suite or test PR, or when a suite has become slow, flaky, or hard to maintain. For repository-level debt such as skipped tests, disabled lint rules, and weakened CI gates, use the audit-quality-debt command; for debt beyond test code (full codebase, architecture, dependencies), use the tech-debt-analysis skill.
argument-hint: "[targetPath]"
disable-model-invocation: true
---

# Tech debt audit - test automation code review

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `targetPath`: test file, folder, or PR diff to audit

## Who does the work

Hand this task to the `test-code-reviewer` agent (`test_code_reviewer` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `unslop-tests` skill is installed, load it before starting.

Audit the test code in `<targetPath>`. Name each anti-pattern precisely, state the harm it causes in this suite, and give a concrete fix.

If `<targetPath>` is empty, ask for it and stop. Never report on code you haven't opened.

## Steps

1. Detect the framework and read its config (`playwright.config.*`, `vitest.config.*`, `jest.config.*`, CI workflow) before judging timeouts, retries or parallelism. Framework defaults are not defects.
2. If the user named a focus ("selectors only", "security only"), limit the scan to it and say so in the report.
3. Scan for: timing and synchronisation, locators, assertions, isolation and shared state, duplication and structure, CI configuration (retries, `forbidOnly`, sharding), and security (secrets, committed session files, real PII).
4. For a large scope, read the files most likely to carry debt first (shared fixtures, helpers, config, the largest specs) and list the files you did not read.
5. Write the report in the reviewer's output format: summary line with counts and the A-F health score, findings sorted by severity, quick wins, then findings that need design work.

## Fix plan

End with the findings grouped by when to fix them:

- **Before the next release:** Critical findings (tests that cannot fail, exposed secrets or PII).
- **This sprint:** High findings (flakiness, order dependence, retries masking failures).
- **Debt backlog:** Medium findings, each with a rough effort.
- **Optional:** Low findings.

## Guardrails

- Report only; do not edit files. Fixes are snippets in the report.
- Cite a file and line for every finding, and only for code you opened.
- Mark findings that depend on context you don't have (for example `ignoreHTTPSErrors` for a self-signed test environment) as "check" rather than as defects.
- If the scope is a whole repository and the user wants a debt register with effort and ROI, stop and load the `tech-debt-analysis` skill instead (or suggest the tech-debt-auditor agent if that is preferred).

## Related Skills

- `tech-debt-analysis` (quality-gates) - the repo-wide debt register this audit feeds
- `unslop-tests` - the anti-pattern checklist for test code specifically
- `code-review-advanced` - when findings need a structured PR-level review
- `governing-quality-waivers` (quality-gates) - accepted debt becomes a dated, owned waiver, not a silent skip

## Definition of Done

- every finding has file:line, severity, and a suggested fix
- findings grouped into a prioritized register (fix now / schedule / waive)
- anything consciously left is recorded as a waiver, not left silent
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
