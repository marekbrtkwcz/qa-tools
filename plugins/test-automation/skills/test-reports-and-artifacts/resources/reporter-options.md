# Reporter and Attachment Options Per Runner

Read when a runner-specific config is needed. Config snippets are starting points, not gold answers: adjust names and paths to the project before pasting. Where a runner has no native option, the table says so instead of inventing one.

## Playwright

```ts
// playwright.config.ts
use: {
  trace: 'retain-on-failure',          // 'on' = always: slow. 'off' = the report proves nothing
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',          // 'on' is a real choice ONLY for flake hunting; it costs wall time and disk
  listReporterInCI: true,             // keeps step output in CI logs
},
reporter: process.env.CI
  ? [['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'report.json' }]]
  : [['list'], ['html', { open: 'on-failure' }]],
```

- Merge shards: `npx playwright merge-reports --reporter html .blob-report/` requires `blob` in the shard reporters; the blob report is the mergeable format, JSON is not.
- History: Playwright's HTML report is self-contained (one folder, works from `file://`) but has no trend view. Trends mean Allure (`@playwright/test` JSON → `allure-playwright` reporter) or publishing the reports with an index.
- Artifact annotation that pays off: `test.info().annotations.push({ type: 'issue', description })` and `await test.step('...', async () => {...})` — they appear in the report and the trace viewer.

## Vitest / Jest

- Vitest: `coverage` config aside, results → JUnit with `--reporter junit` (built in since 1.x, no plugin needed); HTML needs `vitest-html-reporter`-style community plugin or Allure via `allure-vitest`. Attachments: no native screenshot concept (DOM tests attach through jsdom screenshots of dubious value — prefer assertion messages).
- Jest: JUnit via `jest-junit`, HTML via `jest-html-reporters`. Flaky-vs-passed is indistinguishable in JUnit XML from Jest (a retried pass writes one `<testcase>`); if flake visibility is required, use Jest's JSON output (`--json`) or Allure.
- Trace equivalents do not exist for unit runners: the "trace" for a unit test is the assertion diff. Spend effort on assertion messages and `showDiff`, not on screenshots.

## pytest

- HTML: `pytest --html=report.html --self-contained-html` (pytest-html); `--self-contained-html` matters because a non-self-contained report breaks when CSS/JS assets are stripped by artifact download.
- Screenshots on Playwright-for-Python failure: a hook in `conftest.py` (`pytest_runtest_makereport` + `item.funcargs["page"].screenshot(...)`) attaching to the HTML report via `extras`.
- JUnit XML: `--junitxml=report.xml` — the format Xray/TestRail imports (see the test-management-integration skill).
- History: no native trend; Allure (`allure-pytest`) is the standard answer and keeps history in its results directory.

## Allure history in CI (any runner)

Allure only shows trends when the `allure-report` history directory survives between runs:

1. Reporter writes fresh raw results (e.g. `allure-results/`) every run - never cached across runs, results must not be restored (see caching rules in `automating-ci-test-pipelines`).
2. Restore only `allure-history/` from cache (or download it from the previous run's artifact).
3. `allure generate` reads history and writes it back into the report; upload the generated `allure-report/` as an artifact.
4. Publish where the team reaches it (a documentation site, a known artifact URL, Netlify-style drop). A generated report nobody can open is a retention cost, not a feature.

## Attachment Mode Trade-offs

| Mode | Cost | Use when |
|---|---|---|
| trace/video always | wall time, disk, upload time on every green run | flake hunting where failures leave no artifact |
| on-failure (`retain-on-failure`) | none on green runs | the default choice; covers the triage case |
| off | the report proves nothing | never acceptable for browser suites; acceptable for pure unit tests |

| Artifact | Retention hint |
|---|---|
| traces | the largest artifact; failures older than 2 sprints are almost never re-read - short retention is honest |
| videos | smaller than traces after compression; keep longer if flakes are the open problem |
| merged HTML report | tiny; keep as long as release disputes happen |
