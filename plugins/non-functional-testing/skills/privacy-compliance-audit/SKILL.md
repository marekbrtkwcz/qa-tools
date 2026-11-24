---
name: privacy-compliance-audit
description: 'Audits a product against privacy compliance requirements (GDPR/RODO and equivalents): consent flows, data subject rights (access, deletion, portability, rectification), retention and deletion actually working, PII in logs and analytics, DPIA triggers, and vendor/processor contracts. Use when a privacy compliance review or audit is coming, when a new data processing is added, or when a DSR (data subject request) process must be verified.'
argument-hint: 'The product and processing activities in scope, the regulation(s) to audit against, the DSR process, and the environment (non-production for tests)'
user-invocable: true
---

# Privacy Compliance Audit

Use this skill when the question is "does the product actually comply with privacy law", not just "do we have a privacy policy". `handling-sensitive-test-data` keeps test data safe; this skill audits the product's compliance posture. Legal review is the authority on interpretation — this is the QA/technical evidence pass.

## When to Use

- a privacy compliance review, external audit, or DPIA is coming
- a new processing activity, vendor, or data field is added
- a data subject request (access/deletion/portability) process must be verified end to end
- PII leaks into logs, analytics, error reports, or third-party tools are suspected

## Operating Principles

- **Rights must work technically, not just be promised.** A deletion request that leaves data in backups, logs, or a vendor is a finding; test the mechanism.
- **Consent must be real.** Pre-ticked boxes, dark patterns, and consent that cannot be withdrawn are findings; verify the mechanism per processing purpose.
- **Retention must be enforced.** Data past its retention period must actually be deleted/anonymized — check the jobs, not the policy.
- **PII in telemetry is a leak.** Logs, analytics, error trackers, session replay must be checked for names, emails, ids, free-text fields.
- **Test with synthetic personal data only** (`handling-sensitive-test-data`); production data only with explicit approval and read-only checks.

## Workflow

### Phase 1: Map processing activities

- data inventory: what personal data, where stored, why (purpose), legal basis, retention period, who has access (incl. vendors/processors and their contracts)
- DPIA triggers: systematic monitoring, large-scale sensitive data, new tech — flag which activities need one

### Phase 2: Test the rights mechanisms

Work through `./resources/privacy-audit-checklist.md`:

- access request → complete export of the requester's data within the deadline
- deletion request → data gone from primary stores, backups within their cycle, logs, and vendors notified; verification that it stayed deleted
- portability → machine-readable export in a standard format
- rectification, objection, restriction → mechanisms work
- response time and identity verification of the requester per regulation

### Phase 3: Consent and transparency

- consent per purpose, granular, withdrawable as easily as given; cookie/consent manager behaviour
- privacy notice accurate: purposes, retention, rights, contact, DPO

### Phase 4: PII leak scan

- logs, error reports, analytics events, session replays, crash reports, third-party SDKs — search for emails, names, ids, IPs, free text
- data minimization: are all collected fields used?

### Phase 5: Report

- findings per requirement with evidence, severity (legal exposure), owner, and remediation; track to closure; record the audit via `attesting-manual-verification`

## Resource Map

- `./resources/privacy-audit-checklist.md` - the per-requirement check matrix. Read during Phases 2–4.

## Related Skills

- `handling-sensitive-test-data` - synthetic/anonymized data for these tests
- `testing-api-security` - access control behind the rights mechanisms
- `attesting-manual-verification` - audit sign-off evidence
- `defect-triage` - ordering compliance findings

## Definition of Done

This skill is complete when:

- the processing inventory exists with purposes, legal bases, retention, and vendors
- each data subject right was tested end to end with synthetic data, including deletion staying deleted
- consent and transparency mechanisms verified per purpose
- PII leak scan covered logs, analytics, error/crash reports, and third-party SDKs
- findings recorded with severity, owner, and deadline; audit attested
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
