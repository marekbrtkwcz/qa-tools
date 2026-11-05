---
name: qa-performance-k6
description: Load when the user wants to plan, write, refactor, review, or run load/stress/performance tests with k6 (HTTP, browser, WebSocket). Delegates script work to the built-in k6 skills and agents/performance; setup via setups/performance-k6.
---

# ⚡ QA Performance k6

Workflow for performance testing with k6.

## ⛓️ Pipeline

1. **Plan** — `agents/performance/performance-test-planner.agent.md`: define executor, load profile, thresholds from SLOs, save to `docs/scenarios/performance/`
2. **Write** — `agents/performance/performance-test-writer.agent.md`: write `tests/performance/*.test.js`, smoke-run to validate
3. **Refactor/Review** — `agents/performance/performance-test-refactor.agent.md` / `performance-test-code-review.agent.md`

## 🗂️ Built-in skills (load these for script work)

- `k6` — generate/validate/review any k6 script (executors, thresholds, checks, metrics); every script must be validated by running it
- `k6-perf-test-website` — full multi-test performance suite for a website
- `k6-browser-test` — single browser journey with Web Vitals
- `k6-trend-analysis` / `k6-cloud-investigate-test` / `k6-manage` — when tests run in Grafana Cloud k6

## 🎨 Setup

`setups/performance-k6.instructions.md` — k6 is a single binary; no npm project needed for pure k6. Use Biome for any JS/TS helper files.

## 📏 Rules

- One plan = one scenario type (load / stress / spike / soak / smoke)
- Thresholds must be tied to stated SLOs — ask if SLOs are missing
- Env vars via dotenv: `.env` (gitignored) loaded with dotenv-cli (`"perf": "dotenv -e .env -- k6 run ..."`), values read through `__ENV`; never hardcode secrets in code; never test production without authorization
