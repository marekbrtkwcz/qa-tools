---
name: test-environment-provisioning
description: 'Provisions and tears down test environments: defines what a test environment needs (services, databases, brokers, seed data, config, secrets), automates its setup and reset, keeps environments isolated per run or per team, and verifies an environment is actually ready before tests run. Use when tests fail because the environment was not what anyone expected, when onboarding a new environment takes days of manual steps, or when environment drift between CI and local causes false failures.'
argument-hint: 'The environment to provision (local, CI, staging-like), the services it must contain, and who owns it'
user-invocable: true
---

# Test Environment Provisioning

Use this skill when "the tests failed" actually means "the environment was wrong": missing migration, stale seed data, a service on the wrong version, a secret that expired. A test suite can only be as trustworthy as the environment it runs in, and environments drift unless provisioning is code.

## When to Use

- a new environment (local dev, CI job, ephemeral PR environment) needs to be stood up repeatably
- tests fail intermittently and the suspicion is environment state, not code
- seed data, migrations, or config must be applied in a known order before tests run
- secrets and credentials for test environments need a safe, rotatable setup
- an environment must be reset to a known state between runs
- a readiness check is needed: tests should not start until the environment is actually up

## Operating Principles

- **The environment is code.** Docker Compose, Testcontainers, IaC, or setup scripts in the repo — never a wiki page of manual steps.
- **Ephemeral beats shared.** Per-run or per-PR environments prevent cross-test contamination; where a shared environment is unavoidable, reset it to a known state before each run.
- **Seed data is part of provisioning.** Migrations, reference data, and baseline fixtures are applied in a defined order and verified.
- **Secrets never in the repo.** Test secrets come from a secret manager or CI secrets, with synthetic values for local runs.
- **Ready means ready.** A readiness check (health endpoint, DB ping, topic exists) gates the test run; a fixed sleep is not a readiness check.
- **Teardown is provisioning too.** Environments are destroyed or reset; nothing leaks between runs or accumulates cost.

## Workflow

### Phase 1: Define the environment contract

Write down what "a working test environment" means for this suite: services and versions, databases and migrations, brokers and topics, seed data, config values, secrets, and the readiness criteria. This is the artifact everything else implements. Use `./resources/environment-contract-template.md`.

### Phase 2: Automate provisioning

- local: docker-compose or Testcontainers-based setup, one command (`npm run env:up`), documented in the suite docs (`documenting-test-suites`)
- CI: environment provisioned per job or per PR (ephemeral) from the same definition as local, so drift is impossible
- apply migrations and seed data in order; verify counts and key rows after seeding

### Phase 3: Secrets and config

- test-only credentials, synthetic by default; injected via env vars or secret manager, never committed
- config differences per environment (URLs, timeouts, feature flags) live in one env file or variable set, versioned

### Phase 4: Readiness gate

- implement a readiness check per service (health endpoint, `SELECT 1`, topic/queue exists) with a timeout
- the test command runs the readiness check first and fails with a clear message naming the service that was not ready

### Phase 5: Reset and teardown

- define the reset procedure (drop/recreate schema, truncate tables, purge queues, reload seed) and run it before each suite run on shared environments
- CI ephemeral environments are destroyed after the job; verify no resources leak

### Phase 6: Keep it honest

- a scheduled job (or the CI smoke run) provisions a fresh environment from scratch and runs the smoke suite — this catches provisioning rot
- when a test failure turns out to be environmental, record it and add the missing provisioning step or readiness check

## Resource Map

- `./resources/environment-contract-template.md` - the environment contract template: services, versions, seed, secrets, readiness criteria. Read during Phase 1.

## Related Skills

- `testing-with-testcontainers` - provisioning services as containers per test run
- `automating-ci-test-pipelines` - wiring provisioning into CI jobs and caching
- `bootstrap-test-suite` - first-time environment plus suite scaffold
- `test-data-factories` - seed data as code
- `handling-sensitive-test-data` - secrets and personal data in environments
- `documenting-test-suites` - run instructions including env setup

## Definition of Done

This skill is complete when:

- the environment contract is written and versioned
- one command provisions a working environment locally and CI uses the same definition
- migrations and seed data are applied in order and verified after seeding
- secrets are injected, not committed; config differences are explicit
- a readiness check gates the test run with a clear failure message
- reset/teardown is defined and runs; fresh-environment smoke passes in CI
