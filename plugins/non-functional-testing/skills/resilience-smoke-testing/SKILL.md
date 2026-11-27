---
name: resilience-smoke-testing
description: 'Runs a fast resilience smoke pass on a service or flow: dependency timeouts and slow responses, connection failures and retries, circuit-breaker behaviour, degraded-mode fallbacks, and recovery after the fault clears. Use when a launch needs a quick answer to "what happens when X is down or slow", before a full chaos engineering engagement.'
argument-hint: 'The service or flow under test, the dependencies that can be faulted, and the environment (must be non-production)'
user-invocable: true
---

# Resilience Smoke Testing

Use this skill when the question is "what happens when a dependency is slow, down, or returns garbage" — answered quickly, in a non-production environment, with controlled faults. This is a smoke pass, not a chaos engineering program; it proves the obvious failure modes are handled and surfaces the ones that are not.

For sustained load and latency thresholds use `testing-performance-and-load`; for security-shaped faults use `testing-api-security`.

## When to Use

- a release needs a quick resilience check before go/no-go
- a new dependency was added and its failure behaviour is unknown
- timeouts, retries, or circuit breakers were changed or added
- a degraded mode (cache fallback, read-only mode, queue backlog) exists and needs verification
- an incident postmortem needs a reproducible check

## Operating Principles

- **Non-production only, controlled faults.** Fault injection in production is an incident, not a test.
- **One fault at a time.** Two simultaneous faults make the result uninterpretable; full chaos matrices come later.
- **Minimum fault that proves the point.** A timeout is cheaper and safer than a kill; use the smallest fault that demonstrates the behaviour.
- **Always verify recovery.** The system must return to normal after the fault clears — a fallback that never disengages is a finding.
- **Observe, then stop.** Record latency, error rates, and user-visible behaviour; do not run faults longer than needed.

## Workflow

### Phase 1: Map the dependencies and the contract

- list every external dependency of the flow (DB, HTTP services, broker, cache, DNS)
- for each, record the expected behaviour when it is: slow (> timeout), down (connection refused), erroring (5xx), or returning malformed data
- identify the user-visible contract: what should the user see in each case (cached data, friendly error, retry message)

### Phase 2: Run the fault matrix

Work through `./resources/resilience-fault-matrix.md` per dependency, one fault at a time:

- **slow**: add latency beyond the client timeout — expect a timeout error handled gracefully, not a hung request
- **down**: block/refuse connections — expect failover, cached response, or a clear error within the timeout budget
- **5xx storm**: return errors — expect retry with backoff (verify backoff grows), then circuit breaker opens after the threshold, then half-open probe
- **malformed response**: truncated/invalid payload — expect parse error handled, not a crash
- **partial failure**: one of several calls fails — expect partial result clearly marked or the whole operation failing cleanly

### Phase 3: Verify degraded mode and recovery

- while the fault is active: degraded behaviour matches the contract (fallback data marked as stale, read-only banner, queued writes)
- after the fault clears: the system recovers automatically within a stated window; circuit breaker closes; queued writes drain; no stale fallback persists

### Phase 4: Report

Per fault: dependency, fault applied, observed behaviour, expected per contract, pass/fail, and recovery time. Findings go to `reporting-bugs`; use `assessing-release-readiness` when results feed a go/no-go.

## Resource Map

- `./resources/resilience-fault-matrix.md` - the per-dependency fault matrix: fault, how to inject it safely, expected behaviour, recovery check. Read during Phases 2–3.

## Related Skills

- `testing-performance-and-load` - sustained load, latency percentiles, capacity — the quantitative counterpart
- `testing-abuse-limits` - resource consumption under deliberate abuse
- `testing-event-driven-systems` - broker-down and consumer-lag scenarios
- `mocking-network-and-time` - injecting latency/errors in automated tests without a fault tool
- `testing-with-testcontainers` - standing up faultable dependency instances
- `assessing-release-readiness` - folding resilience results into go/no-go

## Definition of Done

This skill is complete when:

- every external dependency had slow, down, error, and malformed faults applied one at a time in a non-production environment
- timeouts, retries/backoff, circuit breaker open/half-open/close, and degraded mode were observed against the contract
- recovery after each fault was verified, with recovery time recorded
- no fault ran in production and each fault was stopped after observation
- findings include fault, observation, expected behaviour, and severity
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
