# Tool Formats, Endpoints and Field Mappings

Read when wiring a specific tracker. Endpoints and field names change with product versions - verify the endpoint answers before the first import (a GET or a one-item POST does), and treat the tables below as the shape of the mapping, not as an API contract frozen in time.

## JUnit XML: what it can and cannot carry

| Signal | In JUnit XML? | Note |
|---|---|---|
| pass/fail/error/skip per test | yes | `<testcase>` + `<failure>`/`<error>`/`<skipped>` |
| flaky (passed on retry) | no | reads as a pass; Playwright marks retries in JSON, not in JUnit |
| duration | yes | `time` attribute (seconds) |
| attachments (screenshots, traces) | no | link out to the run's report instead |
| stable custom ID | workaround | classname + name is what importers key on - which is exactly why the ID must live inside one of them |
| environment/git SHA | workaround | `<properties>` support varies per importer |

When a "no" in this table costs the team information they actually read (typically the flaky flag), take the runner's JSON instead:

- Playwright: `--reporter json` produces per-test results with `retry` counts - convert to the tracker's input with a small script.
- pytest: JUnit XML with `junit_family=xunit1` is the most widely parsed lineage; flake needs `pytest-rerunfailures` XML overlay or the JSON equivalent for the same reason.

## Xray (Jira app)

- Import: JUnit XML through the Xray import endpoint. Cloud (`xray.cloud` REST, `/api/v2/import/execution/junit`) differs from Jira DC/Server (the `/rest/raven/1.0/import/execution/junit` lineage) - confirm which one the project runs before writing the CI step; the auth differs too (cloud: client credentials token; DC: personal access token or basic auth).
- Mapping shape: XML results are grouped into a Test Execution issue per import; tests key on `testExecutionKey` set via properties, and each `<testcase>` matches a Test issue by its definition (custom IDs go through the `test_definition` / test key convention).
- What maps well: duration, failure text, evidence URLs via custom fields. What does not: flaky flags (filtered by JUnit as noted above).
- Automated vs manual: Xray natively supports "automated" test type + linking a Test issue to a requirement - the stated relationship from the skill body maps to these links.

## TestRail

- Import shape: results go on a Test **Run** (`add_run`), then per-case results (`add_result_for_case`) - there is no "import the whole XML file" REST endpoint on the standard API; CI steps use a JUnit-XML-to-TestRail adapter (the official `trcli`, or a small script driving the REST API).
- `trcli` parses JUnit XML and matches XML `classname.name` to TestRail case's "Automated test name" custom field - which makes the stable-ID rule concrete here: the ID must be in that field, not in the visible title, or renaming breaks the match.
- What maps well: duration (`elapsed`), comments with failure text + links. Case-level flake: report the retried run as its own result comment; status stays at what the final attempt showed.
- Suite/section placement is importable; but structural reorganization is the "machine must not write what humans own" line from the skill body - let the adapter create results, never move sections.

## Jira plain (no test-management app)

- Jira can attach JUnit XML to a build/plan (e.g., via CI-app integration) for a rendered summary - that is a report surface, not coverage. If more than one team asks "what is covered", that is the moment for Xray/Zephyr, not XML parsing in Jira.

## Sample CI publish step (shape only)

```yaml
- name: Publish results to tracker
  if: always()                      # publish failures too - the failure run reaching the tracker is the whole point
  run: <adapter CLI> --format junit --input report.xml --token ${TRACKER_TOKEN}
  env:
    TRACKER_TOKEN: ${{ secrets.TRACKER_TOKEN }}
```

- Runs after the report/upload step, and links back to it (`CI_RUN_URL` as a field or comment).
- `if: always()`: the failed run is the run the tracker most needs to know about.
- Integration failing is a warning by default; making it required (a merge-blocking coverage check in the tracker) is a deliberate gate decision, not a default.

## Count reconciliation checklist (run this before the first scheduled import)

1. Exported results: count `<testcase>` (or JSON tests) about to be sent. Write the number.
2. Import dry-run: adapter reports created / updated / skipped. Write the numbers.
3. Checks: exported == created + updated + skipped. Skipped each have a reason (no ID / filtered project / sandbox).
4. Rename one test in a sandbox copy, re-import: expect update == 1, created == 0. If created == 1, ID matching is broken - stop, fix matching, do not schedule.
5. Delete nothing on the first run. Disable-and-archive first, delete after the second green scheduled run.
