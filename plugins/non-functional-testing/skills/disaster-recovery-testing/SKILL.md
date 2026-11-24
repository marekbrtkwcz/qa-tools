---
name: disaster-recovery-testing
description: 'Tests disaster recovery: backup integrity and restore, failover to a secondary region, RTO/RPO measurement against targets, and the runbook itself. Use when a DR plan exists but was never exercised, when RTO/RPO targets are contractual, or before a compliance audit asks for DR evidence.'
argument-hint: 'The system and environment in scope, the DR runbook, the RTO/RPO targets, and written approval for the failover exercise'
user-invocable: true
---

# Disaster Recovery Testing

Use this skill when the question is "if the primary region dies tonight, are we back within the promised time with no data loss". A DR plan that was never executed is a hope, not a plan. Everything here runs in a controlled exercise with written approval — never an unplanned real failover.

**Requires explicit authorization for the exercise window** (same gate discipline as `testing-application-security` Phase 0): what will be failed over, when, who approves, and the rollback.

## When to Use

- a DR runbook exists but has never been exercised end to end
- RTO/RPO targets are contractual or compliance-bound and need evidence
- infrastructure changed (new region, new backup solution) since the last DR test
- a restore has never been verified, only a backup job's green status

## Operating Principles

- **Restore, not backup.** A green backup job proves nothing; a verified restore proves the backup is usable. Restore to a scratch environment and validate data.
- **Measure against targets.** RTO (time to service) and RPO (max data loss) are numbers measured in the exercise, compared to the targets.
- **Test the runbook, not just the tooling.** Follow the documented steps; deviations and unclear steps are findings — the runbook is the deliverable as much as the failover.
- **Rollback must work too.** After the exercise, fail back and verify the primary is healthy again.
- **Synthetic or masked data in the restored copy** where the restore lands somewhere less protected (`handling-sensitive-test-data`).

## Workflow

### Phase 1: Plan the exercise

- scope: what fails over (app, DB, queues, DNS), the scratch environment for restore tests
- RTO/RPO targets from the contract/runbook; measurement method (start/stop timestamps)
- approval, window, communication, rollback plan; who is on the bridge

### Phase 2: Backup and restore verification

Work through `./resources/dr-checklist.md`:

- latest backup exists, is complete, and is decryptable
- restore to scratch: schema and row counts match the source at backup time; key flows work against the restored data
- record restore duration

### Phase 3: Failover exercise

- execute the runbook step by step; time each phase; record deviations
- verify: DNS/routing switch, app healthy in secondary, writes work, monitoring/alerting live, queued jobs resume
- measure RTO from failover start to verified service; measure RPO from last replicated data vs source

### Phase 4: Fail back and close

- roll back per runbook; primary healthy; no split-brain (both sides writing)
- compare measured RTO/RPO vs targets; file gaps as defects with severity = compliance/contract impact
- update the runbook with what was unclear or wrong

## Resource Map

- `./resources/dr-checklist.md` - the restore, failover, and measurement checklist. Read during Phases 2–3.

## Related Skills

- `resilience-smoke-testing` - small controlled faults; DR is the full-scale exercise
- `testing-performance-and-load` - verifying capacity in the secondary region
- `testing-database-state` - validating restored data row by row
- `handling-sensitive-test-data` - masked data in restored copies
- `attesting-manual-verification` - recording the DR exercise as sign-off evidence

## Definition of Done

This skill is complete when:

- a restore was verified end to end (not just the backup job), with duration recorded
- a failover exercise ran per runbook with timings per phase and deviations recorded
- measured RTO/RPO compared against targets; gaps filed with owners
- fail-back verified with no split-brain
- the runbook was updated from the exercise findings
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
