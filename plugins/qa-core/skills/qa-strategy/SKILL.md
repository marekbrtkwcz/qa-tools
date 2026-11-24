---
name: qa-strategy
description: Builds a scenario matrix for a feature, user story, or API spec across six lenses (happy path, boundary, negative, OWASP Top 10 security, adversarial sequences, data integrity), with an OWASP coverage table and open questions. Use when a feature handles input, auth, money, or shared data and you want its abuse cases listed before tests are written. For BDD edge cases around states and boundaries only, use the edge-case-scenario-generator command; for reviewing the requirements text itself, use the review-requirements command.
argument-hint: "[featureDescription]"
disable-model-invocation: true
---

# QA strategy - edge cases, security and attack scenarios

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `featureDescription`: feature, user story, or API spec (text, URL, or file path)

## Who does the work

Hand this task to the `qa-strategist` agent (`qa_strategist` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `deriving-a-quality-contract` skill is installed, load it before starting.

Produce a QA strategy for the feature below that names concrete ways it can be abused, broken, or exploited, before any test code is written. Prefer specific scenarios over general advice.

**If any required input is missing, ask for it before proceeding.**

---

## Inputs to collect

| Input                           | Required | Notes                                                                         |
| ------------------------------- | -------- | ----------------------------------------------------------------------------- |
| Feature / User Story / API spec | ✅       | Paste text, provide a URL, or give a file path: `<featureDescription>` |
| Authentication model            | ⬜       | Roles, token type, session mechanism                                          |
| Environment                     | ⬜       | dev / stage / prod - affects risk tolerance                                   |
| Known out-of-scope areas        | ⬜       | e.g., "skip load testing", "third-party SSO only"                             |

---

## What to produce

Work through the following steps in order:

### 1. Attack Surface Map

List every input, state transition, auth boundary, external dependency, and business rule exposed by the feature.

### 2. Scenario Matrix

For each surface, generate scenarios across **all six lenses**:

- 🔄 Happy path - one baseline scenario only
- 🔲 Boundary / Edge - min, max, off-by-one, null, overflow, Unicode
- ❌ Negative - invalid input, missing fields, wrong type, rejected transitions
- 🔐 Security - OWASP A01–A10: injection, IDOR, CSRF, auth bypass, SSRF
- ⚔️ Adversarial - race conditions, replay attacks, parameter tampering, privilege escalation
- 💥 Data Integrity - concurrent writes, partial failure, stale cache, orphaned records

Output as a table: `# | Surface | Lens | Scenario | Input/Action | Precondition | Expected Result | Risk 🔴🟠🟢`

### 3. OWASP Coverage Table

Map A01–A10 to the scenarios above. Mark each ✅ covered / ⚠️ partial / ❌ not applicable.

### 4. Blind Spots & Open Questions

List what is still unclear and must be answered before tests can be written.

### 5. Recommended Test Types

Suggest concrete tooling: unit, API, E2E, fuzzing, DAST, contract testing - matched to the findings.

---

## Guardrails

- This command designs scenarios; it does not execute attacks. Security scenarios are run later, and only against systems the team is authorized to test.
- Ground every scenario in the provided input. Where a rule is unknown, add it to Blind Spots instead of assuming behaviour.
- Mark OWASP categories as not applicable only with a one-line reason.

Return Markdown only. Stop after section 5.
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
