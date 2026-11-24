# Triage checklist

Per defect record: id, title, severity, priority, category, area, decision, owner, date/expiry.

## Severity (impact if shipped)

| Level | Meaning |
| --- | --- |
| Blocker | core flow impossible, data loss, security breach |
| Critical | major flow broken, workaround painful |
| Major | feature degraded, workaround exists |
| Minor | cosmetic or edge, no functional impact |
| Trivial | typos, polish |

## Decisions

| Decision | Requires |
| --- | --- |
| Fix now | owner + milestone |
| Fix this release | owner + release |
| Defer | owner + date (expiry) |
| Waive | reason + approver + expiry (`governing-quality-waivers`) |

## Session hygiene

- dedupe before the session
- non-reproducible defects still get a decision
- security findings → disclosure path, not this tracker
- every decision in the tracker, not in chat
