# Playwright Trace Forensics

Read when the evidence is in a `trace.zip` from CI (or a local `--trace on` run) and the question is "what did the page actually do when the test failed". A trace is not a screenshot of the end state - it is a per-action timestamped recording: DOM snapshot, screenshot, network, console, and source per step, with a timeline. It often answers a diagnosis without re-running anything.

## Opening

```bash
# local viewer (fetched once, runs offline against the file)
npx playwright show-trace trace.zip
```

From the HTML report instead: `npx playwright show-report` → open the failed test → `Traces` tab → the trace screenshot. The hosted viewer at trace.playwright.dev also opens a local file by drag-and-drop when sharing the file is acceptable - treat traces as sensitive artifacts first (`handling-sensitive-test-data`: snapshots and HAR-like network capture can carry personal data).

If the trace does not exist, it recorded nothing: check the config's `use: { trace: ... }` (`on-first-retry` is the default and records only the first retry - a flaky test that passed on first retry leaves no trace), or force one with `npx playwright test --trace on`.

## The reading order (match it to the failure class)

1. **Jump to the red step first.** The error is anchored to one action/snapshot; open that step before the emotions of the whole timeline. The error message, its stack, and the before/after of the failing call are on the error view.
2. **Action log + timeline → timing class.** Gaps between actions show where the suite actually waited. A step that "waited" on nothing and still failed, or two actions that ran in the wrong order, is the signature of a race (see the flaky signatures in `classification-evidence.md`).
3. **Console → errors that the test never asserted on.** Walk the console messages around the red step: a 4xx/5xx logged before the misbehavior, a rejected promise nobody awaited, a framework warning - these often name the root cause before any hypothesis does.
4. **Network → request/response around the red step.** Filter to the failing interaction: check the request payload (did the test send what it believed?), the status and the response body (did the app answer what the test expected?). A network call that never fired - the step before it swallowed an error - is visible here as an absence.
5. **DOM snapshot → the selector's truth.** The snapshot at the red step is the full DOM at that moment; open it in the viewer and run the failing selector against it. Strict-mode violations, invisible duplicates, and "element was there a second later" are disprovable right here, in the browser DevTools the viewer attaches.

## Evidence to copy into the diagnosis record

Quote, do not describe:

- the failing step's copy-pastable location (test file, step name, timestamp on the timeline)
- console lines around the failure with their timestamps (deltas between steps expose the race)
- the request/response pair that misbehaved: method, URL, status, and the smallest body excerpt that shows the wrongness
- the selector that failed + one sentence of what the DOM snapshot actually contained at that moment
- a screenshot of the red step when the human question is "what did it look like"

Those quotes fill `diagnosis-record.md` the same way a stack trace does: the hypothesis table gets evidence rows with trace coordinates instead of guesses.

## Working offline from CI artifacts

- the trace is self-contained (snapshot, network, console, source): download the artifact from CI and work without a standing environment - a large class of CI-only failures is diagnosable purely from the trace (see `ci-only-failures.md`: start by comparing what the trace shows with the local run's behavior report)
- replay a single interaction mentally from the snapshots - click through the steps around the failure and verify each precondition of the failing call one by one; whatever precondition is missing in the snapshot is the lead
- attach the `trace.zip` (or its retained artifact path and retention window) to the bug report when filing one: `reporting-bugs` expects reproduction steps; a trace is reproduction evidence that survives a flaky repro

## Limits of a trace

- it records what the runner saw, with the sampling the config chose - `screenshot: off`-style config choices remove evidence channels, so an empty channel may be a config choice, not the absence of the behavior
- a trace from the first retry describes the retried execution; the original failure's cause may differ - `on-first-retry` records the retry, so compare with the HTML report's first-run error before concluding
- no trace captures why the code chose a path: after the trace names the branch, the code and `feedback-loops.md` take over for the causal loop
