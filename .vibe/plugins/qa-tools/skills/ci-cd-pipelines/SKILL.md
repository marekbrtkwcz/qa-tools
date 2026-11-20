---
name: ci-cd-pipelines
description: Load this skill when setting up or improving CI/CD pipelines for test automation. Covers GitHub Actions, parallel test execution, test sharding, artifact handling, and flaky test management in CI.
user-invocable: true
---

# CI/CD for Test Automation

## GitHub Actions — Playwright example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
```

## Key CI principles

| Principle | Why |
|---|---|
| **Shard tests** | Run in parallel, faster feedback |
| **Fail fast** | Run unit → integration → E2E in order |
| **Retry flaky tests once** | `retries: 1` in CI only, never in prod code |
| **Upload artifacts on failure** | Screenshots, videos, traces for debugging |
| **Cache dependencies** | `npm ci` with cache — faster builds |
| **Test against production-like env** | Use staging that mirrors prod |

## Playwright config for CI
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : 'list',
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Pipeline stages
```
lint → unit tests → API tests → E2E tests (sharded) → deploy to staging → smoke tests
```

## Flaky test management in CI
- Never ignore flaky tests — quarantine them: `@flaky` tag + ticket to fix
- Track flaky rate as a metric — goal: < 1%
- Run flaky tests 10x locally to confirm before quarantining
