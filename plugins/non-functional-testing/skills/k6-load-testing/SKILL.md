---
name: k6-load-testing
description: "Writes, runs, and interprets k6 load tests: scenarios (constant/ramping VUs, arrival rates), checks and thresholds tied to SLOs, stages and ramp shapes, k6 Browser journeys, running via CLI or the k6 MCP server from the qa-mcp bundle, result analysis (percentiles, error rate), and CI regression gates. Use when a feature needs a latency/throughput number, a launch needs a concurrency answer, or a perf regression check belongs in CI. For overall performance strategy, use testing-performance-and-load."
argument-hint: "Endpoint or user journey under load, target load shape, and SLO/threshold to enforce"
user-invocable: true
---

# k6 Load Testing

k6 is a scriptable load-testing tool: tests are JavaScript (`k6/http`, `k6` core), results are percentile metrics, and pass/fail is declared in the script as **thresholds**. This skill is the hands-on k6 layer; workload modelling and SLO-to-threshold derivation live in `testing-performance-and-load`.

## When to Use

- "write a k6 script for endpoint X at N req/s"
- "run this through the k6 MCP server instead of the CLI"
- "add a k6 regression check to CI"
- "our launch needs to know how many concurrent users the checkout can handle"
- "interpret this k6 output — did it pass?"

## Script anatomy

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },  // ramp up
        { duration: '5m', target: 50 },  // steady
        { duration: '2m', target: 0 },   // ramp down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],          // latency SLO
    'http_req_duration{endpoint:checkout}': ['p(99)<1200'],
    http_req_failed: ['rate<0.01'],             // error budget
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get('https://app.example.com/api/cart', { tags: { endpoint: 'cart' } });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has items': (r) => r.json('items').length >= 0,
  });
  sleep(1);
}
```

- **Executors:** `constant-vus`, `ramping-vus`, `constant-arrival-rate`, `ramping-arrival-rate` (for req/s targets), `shared-iterations`. Pick arrival-rate when the question is throughput, VUs when it is concurrency.
- **Thresholds are the verdict:** a run "passes" only if every threshold passes. `k6 run` exits non-zero on breach — that is what makes it a CI gate.
- **Tags** (`tags: { endpoint: ... }`) are how you get per-endpoint percentiles out of one run.

## Running

- **CLI:** `k6 run script.js`; quick smoke: `k6 run --vus 10 --duration 30s script.js`; cloud: `k6 cloud script.js`.
- **Via the k6 MCP server** (qa-mcp bundle): the agent writes, validates (`k6 inspect`), and runs scripts and reads results through MCP tools — use this instead of hand-writing boilerplate when the server is installed. Long runs need `tool_timeout_sec` on the user-level MCP entry, not the plugin manifest.
- **Docker zero-install:** `docker run --rm -i grafana/k6 run - < script.js`.
- **k6 Browser** (`k6/x/browser`) for real-page journeys under load (login through the UI, Web Vitals during load); keep browser VUs low — they are expensive.

## Reading results

- Report **percentiles, never averages**: `http_req_duration` p(50)/p(95)/p(99) per endpoint via tags. Quote `max` only as a tail symptom.
- `http_req_failed` rate is the error budget check — read it next to `checks` rate.
- A green threshold list with a weird p(99) is still a pass — say so; a red threshold is a fail, no interpretation needed.
- Correlate latency findings with a server-side metric (APM/trace) before naming a cause.

## CI pattern

Short run at modest load, generous thresholds (catch order-of-magnitude regressions, not noise), compare against last release; store results for trend (`tracking-quality-trends`). Full capacity runs stay manual/nightly, streamed to k6 Cloud/Grafana for dashboards.

## Red Flags

- thresholds on `avg` — averages hide tail latency; use p(95)/p(99)
- no `http_req_failed` threshold — a fast but failing endpoint looks green
- load test against shared staging with unknown neighbours — record environment differences first
- quoting VU counts or percentiles no tool produced — name the exact command and paste real output
- ramping to a target and stopping instantly — no steady state means no usable percentiles; keep a hold stage

## Related Skills

- `testing-performance-and-load` - workload modelling, SLOs, full run strategy (this skill's parent)
- `performance-reliability-plan` (non-functional-testing) - resilience/soak planning around the load test
- `soak-testing` - long-duration stability runs
- `testing-web-performance` - Web Vitals budgets that k6 Browser metrics feed
- `automating-ci-test-pipelines` - wiring the CI perf gate, artifacts, history
- `qa-mcp` bundle - the k6 MCP server used to write/run scripts from the agent

## Definition of Done

- one script per question (load / stress / spike / soak / regression), executed with the exact command recorded
- thresholds are percentile-based, per-endpoint where it matters, and each traces to an SLO or stated baseline
- `http_req_failed` and at least one business-outcome check are in the threshold list
- the run was executed and real output is quoted (command + key lines), pass or fail
- CI gate exists for the regression shape with generous thresholds and stored history
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
