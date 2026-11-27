---
name: testing-feature-flags
description: "Tests features behind feature flags (LaunchDarkly, Unleash, Flagsmith, or a home-grown flag endpoint): forcing flag state per test (provider API, admin override, or a stubbed flag endpoint), covering both on and off states in the matrix, cleaning up flag overrides after each test, testing the kill switch, and rollout defaults. Use when a feature ships dark or behind a flag and both states must be proven, or when flag state leaks between tests."
argument-hint: "Flag provider in use, the flags under test, and where flag state is evaluated (client, server, edge)"
user-invocable: true
---

# Testing Feature Flags

A feature flag splits behavior into two paths, and a test that always sees "on" proves nothing about "off". The discipline: **control flag state per test, and restore it after** — leaked flag state is one of the most confusing cross-test pollution sources.

## When to Use

- a feature is launching behind a flag and both states need automated coverage
- tests fail only when a flag happens to be on/off in the shared environment
- the kill switch must be proven to work (flag off = old behavior, no errors)
- rollout percentage / targeting rules need verification

## Controlling flag state

Pick the layer where the flag is evaluated:

| Flag evaluated in | Control method |
| --- | --- |
| Client (JS SDK: LaunchDarkly/Unleash client) | per-test override: `ldClient.identify({ key: 'test-user', custom: { flag: true } })`, or stub the flag endpoint with Playwright `page.route` / MSW returning a fixed flags payload |
| Server | set the flag in the provider's API for a dedicated test project/environment, or inject via env/config in the test environment |
| Edge / CDN | test the edge rule separately (header-based), keep app tests on a fixed state |

- **Dedicated test environment or project:** the safe default — flags in the test env are set by the suite, never by a human clicking in a dashboard.
- **Per-test override via API:** for provider-backed flags, set the override in `beforeEach`/fixture, delete it in `afterEach` (try/finally). Assert the cleanup ran.
- **Stubbed endpoint:** when the client fetches flags from `/api/flags`, intercept with `page.route('**/api/flags', ...)` and return exactly the flags the test needs. Fast, deterministic, no provider dependency.

## What to cover

1. **Both states, both paths:** flag on → new behavior; flag off → old behavior. Matrix over flags when interactions exist (`compatibility-matrix-testing`).
2. **Default state:** a brand-new user with no override gets the rollout default (usually off). Test it explicitly.
3. **Kill switch:** forcing the flag off mid-session (or at boot) must degrade cleanly — no half-rendered UI, no 500s, no console errors (pair with `debugging-with-chrome-devtools-mcp` for console evidence).
4. **Cleanup:** after each test, flag overrides are removed; a leaked "on" flag turns every later test into a different test silently.

## Red Flags

- tests that mutate flags in a shared environment and do not restore them — order-dependent suites
- asserting only the "on" path because that is what the feature is about — the "off" path is what users see during rollout
- hardcoding flag-on in app config for CI "to make tests pass" — that tests a configuration nobody ships
- no test for the default (no-override) state — rollout bugs live exactly there

## Related Skills

- `ensuring-test-isolation` - the general isolation rules flag overrides must follow
- `compatibility-matrix-testing` - matrix coverage when multiple flags interact
- `mocking-network-and-time` - stubbing the flag endpoint / SDK bootstrap requests
- `test-data-factories` - test users with deterministic flag targeting attributes
- `testing-auth-flows` - when flag evaluation depends on the user identity
- `debugging-with-chrome-devtools-mcp` - console/network evidence for kill-switch and half-rendered UI bugs

## Definition of Done

- every flag-gated feature has automated tests for on, off, and default (no-override) states
- flag state is controlled per test and restored in cleanup, proven by a test-order shuffle run
- the kill switch (force off) is tested with no errors in console and no broken UI
- no flag is hardcoded in the CI app config; the test environment owns flag state
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
