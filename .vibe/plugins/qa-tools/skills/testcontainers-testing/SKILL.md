---
name: testcontainers-testing
description: 'Load this skill when tests need real local dependencies — Postgres, Redis, Kafka, RabbitMQ, WireMock — via Testcontainers (Node.js) or docker compose. Covers starting containers in Playwright globalSetup, waiting for readiness with expect.poll / wait strategies (never waitForTimeout), mapped ports (never hardcoded), injecting connection strings via env into playwright.config, per-test isolation (flush/reset), and cleanup in globalTeardown / afterAll.'
user-invocable: true
---

# 🐳 Local Test Environments (Testcontainers / docker compose)

Tests that need a real Postgres/Redis/Kafka should start it **per CI job**, wait until it is *actually ready*, and tear it down afterwards. Never assume a service is "already running somewhere" — that is how flaky suites are born.

## 🎯 When to Use

- integration/DB/API tests need real infrastructure (Postgres, Redis, Kafka, RabbitMQ, Elasticsearch, WireMock)
- you are wiring `globalSetup`/`globalTeardown` in `playwright.config.ts`
- CI needs the same environment (GitHub Actions `services:` or docker-in-docker)
- agents: `qa-tools:testcontainers-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## 🚀 Testcontainers in Playwright (recommended)

```typescript
// tests/global.setup.ts
import { PostgreSQLContainer } from 'testcontainers';
import { test as setup } from '@playwright/test';

setup('start dependencies', async () => {
  const pg = await new PostgreSQLContainer('postgres:16-alpine')
    .withDatabase('shop_test')
    .withUsername('test').withPassword('test')
    .start();

  // mapped port — NEVER hardcode 5432
  process.env.DATABASE_URL = pg.getConnectionUri();
  // persist for workers: write to process.env via dotenv file or globalSetup storage
});
```

```typescript
// playwright.config.ts — pass env to workers
import { defineConfig } from '@playwright/test';
export default defineConfig({
  globalSetup: './tests/global.setup.ts',
  globalTeardown: './tests/global.teardown.ts', // containers.stop() / compose down
  use: { baseURL: process.env.BASE_URL },
});
```

Key rules:

- **Mapped ports only**: `container.getMappedPort(5432)` — parallel runs get different host ports; hardcoded ports collide.
- **Readiness, not sleep**: Testcontainers `start()` already waits for the wait strategy (log/healthcheck). For compose, poll the health endpoint with `expect.poll` / a retry loop — never `waitForTimeout`.
- **Env, not config files**: connection strings go to `process.env` (`.env.test`) consumed by `playwright.config.ts` — never hardcoded URLs/ports in specs.
- **One environment per run**: start in `globalSetup`, stop in `globalTeardown` (also on failure — `try/finally`).
- **Isolation between tests**: flush/reset state in `beforeEach`/`afterEach` (truncate tables, `FLUSHALL`, delete topics) — tests must stay independent.
- **Cleanup of test data**: entities created by a test are removed in `afterEach`.

## 🐋 docker compose alternative

```typescript
// global.setup.ts
import { execSync } from 'node:child_process';
setup('compose up', async () => {
  execSync('docker compose -f docker-compose.test.yml up -d --wait', { stdio: 'inherit' });
  // --wait blocks until healthchecks pass; then read ports from `docker compose port` if needed
});
// global.teardown.ts: execSync('docker compose -f docker-compose.test.yml down -v')
```

`docker-compose.test.yml` belongs in the repo (test-only, no secrets); CI uses the same file.

## ☁️ CI (GitHub Actions)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env: { POSTGRES_DB: shop_test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
    ports: ['5432:5432']
    options: >-
      --health-cmd "pg_isready -U test" --health-interval 5s --health-timeout 3s --health-retries 10
# then: DATABASE_URL: postgres://test:test@localhost:5432/shop_test
```

Or run Testcontainers inside the job with docker available (`runs-on: ubuntu-latest` has Docker). Service containers with healthcheck options are the cheaper default.

## 📋 Checklist

- [ ] dependencies declared in ONE place (compose file or globalSetup), started once per run
- [ ] readiness awaited via wait-strategy / healthcheck / `expect.poll` — no sleeps
- [ ] mapped ports / env-injected URLs — zero hardcoded hosts/ports in specs
- [ ] teardown in `globalTeardown` runs even when tests fail
- [ ] per-test isolation: DB flushed / keys cleaned in `beforeEach`/`afterEach`
- [ ] CI reproduces the same environment (services or compose)
- [ ] no real credentials — test-only users/passwords, committed freely

## ❌ Common Pitfalls

- `waitForTimeout(5000)` hoping Postgres is up → flaky on loaded CI. Use healthchecks.
- Hardcoded `localhost:5432` → collides with local dev DB and parallel jobs.
- Starting a container **per test** → slow suite. Start per run, reset per test.
- Forgetting teardown → leaked containers eat CI disk.
- Sharing one DB across tests without cleanup → order-dependent flakes.

## 🧹 Conventions

- Setup/teardown files: `tests/global.setup.ts` / `tests/global.teardown.ts`; specs use `process.env.*` connection strings; test names `should <result> when <condition>`; assertions via `expect(...)` / `expect.poll`.
