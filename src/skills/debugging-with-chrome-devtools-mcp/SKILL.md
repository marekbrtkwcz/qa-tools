---
name: debugging-with-chrome-devtools-mcp
description: "Debugs web apps and failing/flaky UI tests through the Chrome DevTools MCP server from the qa-mcp bundle: console errors and warnings, network requests/responses (status, payload, timing), performance traces and Web Vitals (LCP, INP, CLS), CPU and memory profiling, and service-worker state. Use when a Playwright test fails in a way the trace.zip does not explain, when investigating a UI performance or console error, or when reproducing a browser-only bug interactively. For classifying the failure itself, use diagnosing-test-failures."
argument-hint: "URL or failing test to investigate, and the symptom (console error, slow page, wrong request, flaky UI)"
user-invocable: true
---

# Debugging with Chrome DevTools MCP

The Chrome DevTools MCP server (qa-mcp bundle) gives the agent live Chrome DevTools Protocol access to a real browser: console, network, performance, memory, and the DOM — complementing Playwright's trace viewer. Use it for interactive diagnosis when a static artifact (trace.zip, screenshot, CI log) is not enough.

## When to Use

- a Playwright test fails but `trace.zip` shows no obvious cause — inspect the live console/network during a manual reproduction
- "the page is slow" — capture a performance trace and read LCP/INP/CLS and the long tasks
- console errors or failed requests on a page the tests do not cover
- memory growth / leak suspicion across repeated navigations
- service worker or cache state suspected (offline bugs — see `testing-offline-and-pwa`)

## Workflow

1. **Navigate** to the URL (or drive the app through the failing flow) in the MCP-controlled browser.
2. **Console first:** list console messages and exceptions. Most UI bugs announce themselves here before any network digging.
3. **Network second:** list requests with status, type, and timing; re-run the failing request and inspect headers, payload, and response body. Filter by XHR/fetch to cut noise.
4. **Performance when speed is the symptom:** start a performance trace, perform the action, stop, and read the timeline: LCP element, long tasks, layout shifts (CLS), scripting time. Correlate with `testing-web-performance` budgets.
5. **Memory when leaks are suspected:** take heap snapshots before/after N repetitions of the action and diff them.
6. **Write findings into the diagnosis record** (`diagnosing-test-failures` resources) — MCP output is evidence, quote it with secrets redacted.

## Rules

- **Reproduce in the same browser the tests use.** If CI fails on Chromium, diagnose in Chromium, not a different local browser.
- **Console + network together:** a 500 with an empty body usually has its real error in the console or in the response payload — check both.
- **Performance claims need a trace, not a feeling:** never report "the page is slow" without LCP/INP numbers from a captured trace.
- **Redact secrets** (Authorization headers, tokens in payloads) before pasting MCP output into tickets or reports — `handling-sensitive-test-data`.
- MCP is for diagnosis; the regression test still goes into the Playwright suite. A bug found via MCP without a test is a bug that returns.

## Red Flags

- diagnosing in a browser different from the CI browser and concluding "works for me"
- pasting full request/response payloads with credentials into a bug report
- treating one manual trace as a performance baseline — one trace is a sample; the CI perf gate (`k6-load-testing`, `automating-ci-test-pipelines`) is the trend
- using MCP to "fix" the app under test (changing state by hand) and then running the test green — that is not a fix, that is masking

## Related Skills

- `diagnosing-test-failures` - classifying and root-causing the failure this investigation feeds
- `playwright-explore-website` - exploring the app through the Playwright MCP when you need scripted navigation
- `testing-web-performance` - Web Vitals budgets and CI perf checks the trace numbers feed
- `testing-offline-and-pwa` - service worker / cache / offline diagnosis
- `test-reports-and-artifacts` - what CI must keep (trace, video, console log) so this debugging is possible without a local repro
- `qa-mcp` bundle - install and naming of the chrome-devtools MCP server

## Definition of Done

- the symptom was reproduced live in the CI-equivalent browser via MCP
- console and network evidence for the failing flow is captured and quoted (secrets redacted)
- if performance was the symptom: LCP/INP/CLS (or memory diff) numbers from a real trace are recorded
- the finding is written into the diagnosis record and handed to `diagnosing-test-failures` / `reporting-bugs`
- a regression test covering the found behavior was added to the suite (or a waiver with owner + expiry exists)
