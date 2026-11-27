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
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
