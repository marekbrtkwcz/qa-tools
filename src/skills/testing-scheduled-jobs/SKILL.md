---
name: testing-scheduled-jobs
description: "Tests cron jobs and scheduled tasks: fake time and timezones, DST transitions, missed runs (downtime catch-up), overlapping executions (locking), and idempotent re-runs of a schedule. Use when the app runs periodic work (reports, cleanups, billing cycles, reminders) and a job firing twice or never is a real bug. Pairs with mocking-network-and-time for clock control."
argument-hint: "The scheduled job, its cron expression, timezone, and what happens on missed/overlapping runs"
user-invocable: true
---

# Testing Scheduled Jobs

A scheduler's contract is: **at the right time, in the right timezone, exactly once, even after downtime**. All four clauses are testable by controlling the clock instead of waiting for it.

## When to Use

- cron expressions / interval schedulers (node-cron, Agenda, BullMQ repeatable, k8s CronJob)
- daily/weekly/monthly reports, billing cycles, cleanups, reminders
- bugs like "the job ran twice at the DST switch" or "after 3 days of downtime nothing caught up"
- verifying the cron expression itself (next N fire times), not just the job body

## Techniques

1. **Fake the clock, never sleep.** With `mocking-network-and-time`: fake timers (vi.useFakeTimers / sinon / bun mock timers), or better, make the scheduler injectable — pass a `now()` and a `schedule` interface, and drive time manually in tests. Assert the job body runs at the simulated fire time.
2. **Verify the schedule itself.** Compute the next 10 fire times of the cron expression and assert them (libraries: `cron-parser`/`croner` in tests). Catches "0 0 * * *"-meant-weekly-but-is-daily bugs that waiting would never reveal.
3. **Timezone and DST.** Jobs must be defined in an explicit timezone (usually UTC internally, local for display). Test the DST transition days: a "daily at 2:30am local" job fires once (or per policy) on the spring-forward day when 2:30 does not exist, and does not fire twice on fall-back.
4. **Missed runs / catch-up.** Simulate downtime: advance the clock past several fire times with the scheduler off, then start it. Assert the catch-up policy: run once for all missed (with a "period" parameter), skip missed, or run each — whichever the product specifies; assert the *specified* behavior, and that the job receives enough context to process the whole missed range.
5. **Overlap / locking.** A job that takes longer than its interval must not start a second concurrent run (lock/lease: DB row lock, Redis SETNX, advisory lock). Test: make the job body block, advance clock past the next fire, assert only one execution is active; release the lock, assert the next run proceeds.
6. **Idempotent re-runs.** If a run is retried (crash mid-job), the job must be idempotent — pair with `testing-idempotency-and-retries`.
7. **Observability:** every run logs start/end/duration/outcome; a missed or failed run alerts. Assert the log/metric exists for a simulated run.

## Red Flags

- tests that `sleep` until the next real fire time — slow and flaky; control the clock instead
- cron expression verified by eye, not by computing next fire times in a test
- no explicit timezone — "works on my machine" across CI servers in different TZs
- catch-up policy unstated and untested — after downtime the job silently skips or floods
- no lock — overlapping runs double-send reports or double-charge
- job body mixed with scheduling logic — separate them so the body is unit-testable without a scheduler

## Related Skills

- `mocking-network-and-time` - fake clocks, fake timers, pinned timezones (the toolbox for this skill)
- `testing-idempotency-and-retries` - safe re-runs of jobs
- `testing-event-driven-systems` - queue-based schedulers (BullMQ etc.)
- `testing-cli-tools` - if the job is invoked as a CLI (`node dist/jobs/cleanup.js`), test it as a subprocess
- `testing-observability` - job run logs, metrics, alerts
- `test-environment-provisioning` - the scheduler + DB in the test environment

## Definition of Done

- the cron expression's next fire times are asserted in a test (not eyeballed)
- job body runs at simulated fire times with a controlled clock — no real waiting
- timezone/DST behavior is tested for the transition days
- missed-run catch-up policy is implemented, stated, and tested after simulated downtime
- overlapping executions are prevented by a tested lock
- re-runs are idempotent, and run logging/alerting is asserted
