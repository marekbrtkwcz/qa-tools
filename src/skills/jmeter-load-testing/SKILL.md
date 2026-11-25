---
name: jmeter-load-testing
description: "Runs and maintains JMeter load tests: reading and parameterizing .jmx test plans (thread groups, samplers, controllers, assertions, CSV data sets), non-GUI CLI runs, HTML dashboard reports, and CI regression gates derived from the results file - JMeter exits 0 even when requests fail, so the gate must check the data. Use when an existing or enterprise JMeter plan must be run, fixed, or wired into CI, or when protocol breadth (JDBC, JMS, LDAP) is why JMeter is the tool. For scriptable JS load tests use k6-load-testing; for workload modelling use testing-performance-and-load."
argument-hint: "The .jmx plan (or the journey to script), target load shape, and the latency/error numbers to gate on"
user-invocable: true
---

# JMeter Load Testing

JMeter is a plan-driven load tool: the test is an XML `.jmx` file built from thread groups, samplers, controllers, and assertions — usually authored in the GUI, always run from the CLI. This skill is the hands-on JMeter layer; workload modelling and SLO derivation live in `testing-performance-and-load`, the same verdict rules as `k6-load-testing` apply.

**One thing to know before anything else: a green JMeter exit code proves nothing.** Non-GUI JMeter exits 0 even when every request errors or an assertion trips. The verdict comes from the results file, and the CI gate has to go look for it.

## When to Use

- an inherited or enterprise `.jmx` plan must be run, fixed, or wired into CI
- protocol breadth beyond HTTP is the point: JDBC, JMS, LDAP, SMTP samplers
- "run our existing JMeter suite against the release candidate"
- a non-scripting team authors load plans in the GUI (then CI runs them headless)
- a JMeter dashboard report needs interpretation

## Plan anatomy

`.jmx` is XML. The pieces that matter when reading or fixing one:

```xml
<ThreadGroup>              -- the load: how many virtual users, how fast, how long
  num_threads / ramp_time  -- or ${__P(userCount,100)} to override per run
<HTTPSamplerProxy>         -- one request: path, method, body, embedded config
<CSVDataSet>               -- parameterization: one row per iteration, delimiter, EOF policy
<GenericController|LoopController|IfController|OnceOnlyController>  -- flow
<ResponseAssertion|DurationAssertion|SizeAssertion>  -- per-request pass/fail
```

- **ThreadGroup is the load shape.** Threads = concurrent virtual users, `ramp_time` shapes the climb. Hold time comes from scheduler/loop config — check that the plan actually has a steady-state stage, not just a ramp (a plan that ramps up and stops instantly produces no usable percentiles).
- **`__P(name, default)` is the CLI seam.** A plan reading `${__P(userCount,100)}` and `${__P(ramp,60)}` runs anywhere without edits: `-JuserCount=200` overrides it for one run. Prefer plans whose knobs are properties, not hardcoded numbers.
- **CSV Data Set Config feeds realistic variation.** Users, endpoints, payloads from a CSV — with `shareMode` set deliberately: all threads share the file by default; `All threads`/`Current thread` changes what a run means.
- **Assertions are per-request quality checks** (status 200, latency under X, JSON field equals Y). They mark rows failed in the results file — which is exactly what the CI gate later greps for.
- **Logic Controllers compose steps**: `Once Only Controller` for login-once flows, `Loop Controller` for repetition, `If Controller` for conditional branches. Read them top-down like code, because they are code.

## Running

```bash
# headless run + dashboard in one shot
jmeter -n -t plan.jmx -l results.jtl -e -o report/

# parameterized run
jmeter -n -t plan.jmx -JuserCount=200 -Jramp=60 -l results.jtl -e -o report/

# dashboard only, from an existing results file (re-analysis without re-running)
jmeter -g results.jtl -o report/

# distributed: agents listed get the plan from this controller
jmeter -n -t plan.jmx -R node1:1099,node2:1099 -l results.jtl
```

- `-n` is mandatory for load runs: GUI mode adds overhead and distorts the measurement. The GUI is for authoring, never for executing load.
- `-l` results: CSV `.jtl` by default (check `jmeter.save-service` config if the machine's defaults differ). Keep it — it is the run's raw evidence.
- `-e -o report/` generates the HTML dashboard after the run. `-G`, not `-J`, sets properties on remote nodes in distributed mode.
- Distributed runs multiply clients; they do not fix a shared-staging problem, and RMI setup has its own failure modes. Single node first, cluster only with a stated reason.

## Reading the dashboard

- **Statistics table first**: sample counts and **Error %** per sampler. Error % above the plan's declared ceiling is the run verdict, not a discussion.
- **Response Time Percentiles**: p90/p95/p99 per sampler — percentile-first, same rule as k6; averages hide the tail and the dashboard shows them anyway, so name them only as context.
- **Errors section** groups failure causes — read it before theorizing; it usually separates "server rejected" from "client starved".
- A run that looks fine in Statistics but shows load collapsing mid-run usually means the client machine saturated (threads waiting on CPU/network), not that the server recovered — check the client before blaming the server.
- Correlate any latency finding with a server-side metric (APM/trace) before naming a cause.

## CI gate

JMeter will not fail the pipeline on its own. Derive the verdict from the results file:

```bash
jmeter -n -t plan.jmx -JuserCount=20 -l results.jtl -e -o report/
# gate 1: any failed row fails the build (quote the row, not just the exit code)
if grep -q ',"false"' results.jtl; then
  grep ',"false"' results.jtl | head -5
  echo "load test: assertion or sampler failures present"; exit 1
fi
# gate 2: dashboard error % ceiling, parsed from report statistics (jq over report/statistics.json)
```

- Gate on the same numbers a human would read in the dashboard: error % and the relevant percentile per key sampler — the `statistics.json` inside the report tree can be parsed for a hard threshold instead of eyeballing.
- Shape: short run (a few minutes), modest VUs, **generous thresholds vs a stored baseline** — catch order-of-magnitude regressions, not noise. Full-capacity runs stay nightly/manual.
- Store `report/` as an artifact; keep `results.jtl` for re-analysis (`jmeter -g`), archive it short-term — it is large.
- Baseline first: the first run of a plan against a new environment establishes the baseline. Thresholds invented from that same run would pass forever.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "JMeter returned success, the test passed" | Exit code 0 with a 30% error rate in the jtl. | Gate on the results file; quote the error % row. |
| "Let's ramp to 500 and stop" | 90 seconds of climbing, zero steady state, percentiles meaningless. | Ramp, hold, ramp down — the hold stage is the measurement. |
| "We need 10k threads on one machine" | The client saturates; results measure the load generator, not the app. | Scale out distributed nodes, or lower threads and state the ceiling. |
| "The GUI is simpler, run it there" | GUI overhead skews latency, and listeners eat the client. | Author in the GUI, run with `-n` headless. |
| "Use this plan I tuned in prod last year" | Hardcoded hosts, no properties, staging DNS shoots elsewhere. | Parameterize with `__P()` before any run. |

## Red Flags

- quoting VUs or percentiles no tool produced — paste real summary lines from the run
- gate that reads only the exit code — it is green when everything is red
- plan without a steady-state hold stage
- CSV data set with `shareMode` default and the run claims "unique users per thread"
- load test against shared staging with unknown neighbours, no environment note recorded

## Related Skills

- `testing-performance-and-load` - workload modelling and SLO-to-threshold derivation (this skill's parent)
- `k6-load-testing` - scriptable JS load tests; pick it when the plan is code-first and HTTP-only
- `testing-database-performance` - the DB side of the same question (efficiency of current threshold approach)
- `automating-ci-test-pipelines` - wiring the gate, artifacts, retention, history
- `tracking-quality-trends` - per-run numbers into a trend, not screenshots

## Definition of Done

- the plan was run headless with the exact command recorded, parameters stated if overridden
- verdict derived from the results file (failed rows) and the dashboard statistics (error %, percentiles), not the exit code
- a steady-state stage exists, and the environment (standalone vs staging, neighbours) is recorded
- CI gate checks the data, stores `report/` as an artifact, and compares against a stored baseline
