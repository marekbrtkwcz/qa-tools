# Provider Recipes

Working shapes for sharded Playwright runs with one merged report. Pin action versions and images in your repository; the major versions here are the ones current when this was written, so check them before copying.

## GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: e2e

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true

jobs:
  test:
    timeout-minutes: 25
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci

      - name: Get Playwright version
        id: pw
        run: echo "version=$(npx playwright --version | awk '{print $2}')" >> "$GITHUB_OUTPUT"

      - name: Cache browsers
        id: browser-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ steps.pw.outputs.version }}

      - name: Install browsers and OS dependencies
        if: steps.browser-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Install OS dependencies only
        if: steps.browser-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps

      - name: Run shard
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

      - name: Upload blob report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report/
          retention-days: 1

      - name: Upload failure artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.shardIndex }}
          path: test-results/
          retention-days: 7

  merge-reports:
    if: ${{ !cancelled() }}
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci

      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - run: npx playwright merge-reports --reporter=html,json ./all-blob-reports
        env:
          PLAYWRIGHT_JSON_OUTPUT_NAME: results.json

      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: |
            playwright-report/
            results.json
          retention-days: 14
```

Notes:

- `fail-fast: false` keeps the other shards running when one fails, so the merged report is complete.
- Blob artifact names must be unique per shard, or the uploads collide.
- The trace files referenced by the HTML report are included in the blob reports, so the merged report can open them.
- If the browser cache restore is not measurably faster than `npx playwright install --with-deps`, drop the cache steps or run the job in `mcr.microsoft.com/playwright:v<version>-noble` instead.

### Building once

```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: app-build, path: dist/, retention-days: 1 }
  # test: needs: build, then download-artifact app-build and start it in webServer
```

### Bun-standardized repo (GitHub Actions)

Replace `setup-node` + `npm ci` in the install step with Bun, and cache on `bun.lock` instead of `package-lock.json`:

```yaml
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      # cache: actions/cache@v4 with path ~/.bun/install/cache and key ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
```

Rules:

- One package manager per repo: if `bun.lock` is committed, do not also run `npm ci` anywhere in the pipeline.
- Playwright Test is a Node tool: jobs that execute `playwright test` still need `actions/setup-node@v4` (Bun alone is not enough to run Playwright), or run Playwright inside its official container image. Biome, `tsc`, and pure-TS scripts run natively under Bun with no build step.
- `bun test` can replace the unit-test job's runner only if the suite was written for it; Vitest runs under both runtimes, which keeps the pipeline portable.

### Path-filtered job

```yaml
on:
  pull_request:
    paths:
      - 'src/checkout/**'
      - 'tests/e2e/checkout/**'
```

On GitHub, a required check whose workflow is skipped by a path filter stays pending and blocks the merge. Coordinate with `generating-quality-gate-workflows` before making a filtered job required.

## GitLab CI

```yaml
e2e:
  image: mcr.microsoft.com/playwright:latest-noble   # match the major version in package.json
  stage: test
  parallel: 4
  variables:
    CI: "true"
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]
  script:
    - npm ci --cache .npm --prefer-offline
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    expire_in: 1 day
    paths: [blob-report/, test-results/]

merge-reports:
  image: mcr.microsoft.com/playwright:latest-noble
  stage: report
  needs: [e2e]
  when: always
  script:
    - npm ci --cache .npm --prefer-offline
    - npx playwright merge-reports --reporter=html,junit,json ./blob-report
  variables:
    PLAYWRIGHT_JUNIT_OUTPUT_NAME: results.xml
    PLAYWRIGHT_JSON_OUTPUT_NAME: results.json
  artifacts:
    when: always
    expire_in: 14 days
    paths: [playwright-report/, results.json]
    reports:
      junit: results.xml
```

`parallel: N` sets `CI_NODE_INDEX` (1-based) and `CI_NODE_TOTAL`, which map directly onto `--shard`. GitLab gathers artifacts from all parallel jobs into the `needs` consumer under the same path, so check that blob file names do not collide in your setup; the blob reporter names its files per shard by default.

## Jenkins

Declarative pipeline, same shape as the GHA recipe: shards write blob reports, one merge step produces the single HTML report. Two Jenkins-specific traps are handled explicitly below: all parallel shards share **one workspace** (blob dirs must be named per shard or they collide), and per-shard JUnit files would overwrite each other (so JUnit is emitted only by the merge step).

```groovy
// Jenkinsfile
pipeline {
  agent any
  options {
    timeout(time: 25, unit: 'MINUTES')
    disableConcurrentBuilds(abortPrevious: true)
  }
  environment {
    CI = 'true'
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }
    stage('Test') {
      parallel {
        stage('shard 1') {
          environment { PLAYWRIGHT_BLOB_OUTPUT_DIR = 'blob-1' }
          steps { sh 'npx playwright test --shard=1/4' }
        }
        stage('shard 2') {
          environment { PLAYWRIGHT_BLOB_OUTPUT_DIR = 'blob-2' }
          steps { sh 'npx playwright test --shard=2/4' }
        }
        stage('shard 3') {
          environment { PLAYWRIGHT_BLOB_OUTPUT_DIR = 'blob-3' }
          steps { sh 'npx playwright test --shard=3/4' }
        }
        stage('shard 4') {
          environment { PLAYWRIGHT_BLOB_OUTPUT_DIR = 'blob-4' }
          steps { sh 'npx playwright test --shard=4/4' }
        }
      }
    }
    stage('Merge reports') {
      environment { PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'results.xml' }
      steps {
        // single JUnit file comes from HERE, not from the shards
        sh 'npx playwright merge-reports --reporter=html,junit,json blob-1 blob-2 blob-3 blob-4'
      }
    }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: 'results.xml'
      archiveArtifacts artifacts: 'playwright-report/,blob-*/,test-results/', allowEmptyArchive: true
    }
  }
}
```

Notes:

- `junit` needs the JUnit plugin, `publishHTML` (if you prefer the rendered tab over archived artifacts) needs the HTML Publisher plugin — both are standard, but verify on your controller.
- Four shards on one agent oversubscribe the machine by design — Playwright shards are workers, not CPUs. If slots are tight, give each parallel stage its own `agent { label '<e2e>' }` and move the blob dirs with `stash`/`unstash` instead of relying on the shared workspace.
- `disableConcurrentBuilds(abortPrevious: true)` is the Jenkins equivalent of GHA's `concurrency.cancel-in-progress: true`.

## Azure Pipelines

Matrix shards publish blob reports as named pipeline artifacts; the merge job downloads them by pattern and produces the single report plus JUnit test results.

```yaml
# azure-pipelines.yml
trigger:
  - main

jobs:
  - job: shards
    displayName: Playwright shards
    pool:
      vmImage: ubuntu-latest
    timeoutInMinutes: 25
    strategy:
      matrix:
        shard1: { shardIndex: 1, shardTotal: 4 }
        shard2: { shardIndex: 2, shardTotal: 4 }
        shard3: { shardIndex: 3, shardTotal: 4 }
        shard4: { shardIndex: 4, shardTotal: 4 }
    variables:
      CI: true
    steps:
      - task: NodeTool@0
        inputs:
          versionSpec: '22.x'
      - script: npm ci
        displayName: npm ci
      - script: npx playwright install --with-deps
        displayName: Install browsers
      - script: npx playwright test --shard=$(shardIndex)/$(shardTotal)
        displayName: Run shard
      - publish: blob-report
        artifact: blob-report-$(shardIndex)
        condition: always()
      - publish: test-results
        artifact: test-results-$(shardIndex)
        condition: failed()

  - job: merge
    displayName: Merge reports
    dependsOn: shards
    condition: succeededOrFailed()
    pool:
      vmImage: ubuntu-latest
    steps:
      - task: NodeTool@0
        inputs:
          versionSpec: '22.x'
      - script: npm ci
        displayName: npm ci
      - download: current
        patterns: 'blob-report-*'
      - script: npx playwright merge-reports --reporter=html,junit,json $(Pipeline.Workspace)/blob-report-*
        displayName: Merge blob reports
        env:
          PLAYWRIGHT_JUNIT_OUTPUT_NAME: results.xml
      - task: PublishTestResults@2
        condition: succeededOrFailed()
        inputs:
          testResultsFormat: JUnit
          testResultsFiles: results.xml
      - publish: playwright-report
        artifact: playwright-report
        condition: succeededOrFailed()
      - publish: test-results
        artifact: test-results-merged
        condition: failed()
```

Notes:

- Each shard runs in its own hosted agent, so the plain `blob-report/` path is safe here — no per-shard naming needed (contrast with Jenkins above).
- `download: current` with `patterns` lands each artifact under `$(Pipeline.Workspace)/<artifact-name>`; the glob expands in the bash step, so one command merges all shards.
- `succeededOrFailed()` keeps the merge and the red-run evidence alive when a shard fails — the Azure analog of `if: ${{ !cancelled() }}` in GHA.
- Artifact retention follows the pipeline's retention policy (set it on the pipeline, not per artifact).

## Verifying the pipeline

Push a throwaway branch with these two tests, check the evidence, then delete them.

```typescript
test('pipeline check: deliberate failure', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'This heading does not exist' })).toBeVisible();
});

test('pipeline check: deliberate flake', async ({}, testInfo) => {
  // Fails on the first attempt, passes on retry: should be reported as flaky
  expect(testInfo.retry).toBeGreaterThan(0);
});
```

Expected: the job is red for the first test, the merged report shows it with a trace; the second test shows as flaky in the HTML report and is counted in `stats.flaky` of the JSON output.
