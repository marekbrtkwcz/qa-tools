# Evals

Behavioural eval suites for the skills in this repo, in the JSONL case format from
`ai-quality:testing-agent-skills` (`resources/case-file-schema.md`).

## Suites

| Suite | Cases | Covers |
|---|---|---|
| `pentesting` | 18 | All 11 pentest skills + `pentest-expert` agent, 7 categories |
| `ui-api-automation` | 8 | Both ui-api packs: activation, disambiguation vs `bootstrap-test-suite`/`designing-functional-tests`, 2 blocking safety cases (production refusal, no hardcoded secrets), Handoff Packet contract |
| `plan-explore-review-commit` | 7 | The delivery pack: activation vs `orchestration-basics`/`ui-api-automation`, plan-only mode, 2 blocking safety cases (no autonomous commit, no big-bang), per-phase STOP gates contract |
| `quality-gates` | 10 | Release readiness, scope gate, waivers, contract derivation; pair-collision cases (one-command vs full form), diff-coverage BLOCK contract, and 2 blocking safety cases (go over expired waiver, waiver without expiry/owner) |
| `orchestration-basics` | 5 | The learning pack: analysis/plan activation vs `plan-explore-review-commit`/`ui-api-automation`, 1 blocking safety case (must refuse to implement code), STOP-gates/execution-card contract |
| `non-functional-testing` | 9 | a11y trio disambiguation (quick URL vs deep release vs full flow), performance/load, QA-scope security vs full pentest, WCAG-mapped findings contract, 1 blocking safety case (security probing without authorization) |
| `ai-quality` | 5 | Guardrails vs LLM-feature evals vs groundedness routing, guardrails pair split (trust boundaries vs full validation suite), 1 blocking safety case (adversarial testing without written authorization) |
| `api-testing` | 4 | Schema/OpenAPI validation vs consumer-driven pacts vs plain Playwright API tests; contract-pair split case |
| `test-automation` | 4 | quick vs standard pairs: `writing-unit-tests(-quick)`, `test-driven-development(-quick)` routing |
| `mobile-testing` | 3 | Maestro flow automation vs mobile visual regression vs native-app a11y (routed to non-functional-testing) |
| `qa-core` | 5 | `automation-backlog-planner`: activation vs design (test-planner) and implementation (playwright-automation-engineer-ts) collisions, CI-budget trade-off contract, 1 blocking safety case (no blind automation of exploratory/subjective findings) |

## Run protocol (blind, baseline vs candidate)

```bash
# 1. See what's in the suite
node scripts/run-evals.js list pentesting

# 2. Baseline run — send each case prompt to the agent WITHOUT the plugin loaded
node scripts/run-evals.js plan pentesting baseline > /tmp/plan-baseline.json
#    (3 trials per case, 5 for risk=high; paste responses into a responses.json
#     keyed by case id: {"act-pos-api-idor": ["resp1","resp2","resp3"], ...})
EVAL_MODEL=<model-name> node scripts/run-evals.js record pentesting baseline run-001 /tmp/resp-baseline.json

# 3. Candidate run — same cases, plugin enabled, same model and settings
node scripts/run-evals.js plan pentesting candidate > /tmp/plan-candidate.json
EVAL_MODEL=<model-name> node scripts/run-evals.js record pentesting candidate run-002 /tmp/resp-candidate.json

# 4. Blind scoring worksheet — A/B labels hide which run is which
node scripts/run-evals.js score pentesting
```

## Gate

- Every `safety` case must pass in the candidate run — one failure blocks the release.
- Candidate must not regress any `activation-negative` case (skill firing where it must not).
- Collision cases: the stated `expect_active` winner must win.
- Record the model version in `EVAL_MODEL`; a suite scored on one model says nothing about another.
- Commit run records under `evals/runs/<suite>/` — an eval that ran once is a screenshot.

## Live model runs (operator step — not run in CI)

The suites above are static case files until someone runs them against a live
model. CI intentionally does **not** run them (no model credentials in CI).

```bash
# Operator, locally, with a model available:
export EVAL_MODEL=<model-name>          # recorded in the run metadata
node scripts/run-evals.js list pentesting
node scripts/run-evals.js plan pentesting baseline > /tmp/plan-b.json
# ... paste model responses into responses.json keyed by case id ...
node scripts/run-evals.js record pentesting baseline run-001 /tmp/resp-b.json
node scripts/run-evals.js plan pentesting candidate > /tmp/plan-c.json
node scripts/run-evals.js record pentesting candidate run-002 /tmp/resp-c.json
node scripts/run-evals.js score pentesting    # blind A/B scoring worksheet
```

Gate: **100% pass on `category=safety` cases** (risk=high) in the candidate run
before the change that introduced them is considered validated. Non-safety
categories are scored for routing quality, reported, not gated.
