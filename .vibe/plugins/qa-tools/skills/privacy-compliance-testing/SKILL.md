---
name: privacy-compliance-testing
description: Load this skill when testing privacy and data-protection compliance — GDPR/RODO, ePrivacy cookies, CCPA. Covers consent management (no trackers before opt-in, no pre-ticked boxes), right to erasure and data export, data retention and deletion from logs/backups, PII in logs and error reports, data minimization in forms, encryption, DPIA triggers, and keeping evidence for audits. Not legal advice — pair with your DPO/legal. Complements security-testing (technical controls) and quality-gates (blocking release on compliance failures).
user-invocable: true
---

# 🔐 Privacy Compliance Testing (GDPR/RODO)

Privacy compliance testing verifies that the product **collects, stores, processes, and deletes personal data lawfully**. It is evidence-driven: every check produces an artifact (screenshot, network log, report) that an auditor or DPO can review.

> ⚠️ This skill is engineering guidance, **not legal advice**. Interpretation of GDPR/RODO belongs to your Data Protection Officer and legal counsel.

Use it when: shipping any feature touching personal data, adding a third-party tracker/analytics, changing retention, building user account deletion, or preparing for an audit.

## 🚫 When NOT to use

- Pure technical security testing (XSS, SQLi, auth) → `security-testing`
- Legal interpretation of what is "personal data" → DPO/legal

## ✅ Core check areas

### 1. Consent & cookies (ePrivacy)
- No non-essential cookies/trackers fire **before** explicit opt-in — verify in devtools Network tab on first visit
- No pre-ticked checkboxes; "reject all" is as easy as "accept all" (equal prominence, same number of clicks)
- Withdrawing consent actually stops the trackers (verify requests stop, not just the banner hides)
- Consent record kept: who, what, when, where (consent log)

### 2. Data subject rights (GDPR Art. 15–22)
- **Access/export**: user can download their data; export is complete (all systems, not just the profile page) and in a machine-readable format
- **Erasure ("right to be forgotten")**: deleting an account removes personal data from the primary DB **and** propagates to logs, backups (within retention window), caches, third-party processors, and analytics
- **Rectification**: user can correct their data and it propagates
- Test with a dedicated test account, then verify deletion via DB query or API — not just the UI saying "deleted"

### 3. Data minimization & purpose limitation
- Forms ask only for what the feature needs (no "optional" phone number that is actually required)
- Data collected for purpose A is not silently reused for purpose B (newsletter, marketing, profiling)
- Check the actual network payloads — fields sent to the server, not just fields visible in the UI

### 4. Retention
- Every data store has a documented retention period and it is enforced (scheduled job, TTL, partition rotation)
- Test: seed data with an old timestamp, run the retention job, verify deletion
- Backups: personal data in backups is deleted on rotation or encrypted with separate key handling

### 5. PII in logs, errors, and monitoring
- Application logs, error trackers (Sentry etc.), analytics, and `observability-testing` signals must not contain PII (names, emails, IPs, tokens) unless required and documented
- Test: perform actions with known test PII, then grep logs/error reports for it
- Stack traces and crash reports scrub PII

### 6. Third-party processors
- Every vendor receiving personal data (analytics, payment, email, CDN) is listed in the processor register with a DPA
- Data transfer outside EU only with adequacy decision or SCCs — flag for DPO
- Sub-processors disclosed; test that disabling a vendor in config actually stops the data flow

### 7. Security of personal data (with `security-testing`)
- Encryption in transit (TLS) and at rest for personal data stores
- Access to personal data is role-restricted and logged (who accessed what, when)
- Breach procedure: detection → containment → notification to authority within 72h → communication to data subjects

## 🧾 Evidence & audit trail

For each check, keep: what was tested, how (steps), result, artifact (screenshot/log/query output), date, tester. Store under `.qa/compliance/`. An audit asks "show me" — the answer must be a file, not a memory.

## 🚦 Release gate

In `quality-gates`, treat unresolved privacy findings as release blockers: missing consent enforcement, erasure that leaks into backups, or PII in error tracking = no-go until fixed or formally waived by DPO with expiry.
