---
name: qa-best-practices
description: Load this skill for general QA best practices — bug reporting, code review of tests, flaky test stabilization, quality gates, and release readiness.
user-invocable: true
---

# QA Best Practices

## Bug report essentials
Every bug report must include:
1. **Title** — concise, describes the problem
2. **Environment** — browser, OS, app version, env (staging/prod)
3. **Steps to reproduce** — numbered, minimal
4. **Expected vs actual result**
5. **Evidence** — screenshot, video, console logs, network HAR
6. **Severity** — blocker / critical / major / minor / trivial
7. **Reproducibility** — always / sometimes / once

## Flaky test stabilization
Common causes and fixes:
| Cause | Fix |
|---|---|
| Race conditions | Use `expect` auto-retry instead of `waitForTimeout` |
| Unstable selectors | Switch to role/label-based selectors |
| Shared state | Make tests independent, use fresh data |
| Network timing | Wait for specific network response |
| Animation timing | Wait for element to be stable (`toBeVisible`) |

## Test code review checklist
- [ ] Tests are independent and can run in any order
- [ ] Names clearly describe what is being tested
- [ ] No hardcoded waits (`waitForTimeout`)
- [ ] Assertions are specific (not just "exists")
- [ ] Negative cases are covered
- [ ] Test data is isolated per test
- [ ] No commented-out code
- [ ] Cleanup after tests that create data

## Quality gates
Before release, verify:
- All automated tests pass on main branch
- No open blocker/critical bugs
- Regression scope executed and passed
- Performance benchmarks within thresholds
- Accessibility audit done for changed UI
