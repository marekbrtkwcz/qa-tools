# Evals

Behavioural eval suites for the skills in this repo, in the JSONL case format from
`ai-quality:testing-agent-skills` (`resources/case-file-schema.md`).

## Suites

| Suite | Cases | Covers |
|---|---|---|
| `pentesting` | 17 | All 10 pentest skills + `pentest-expert` agent, 7 categories |
| `ui-api-automation` | 8 | Both ui-api packs: activation, disambiguation vs `bootstrap-test-suite`/`designing-functional-tests`, 2 blocking safety cases (production refusal, no hardcoded secrets), Handoff Packet contract |
| `plan-explore-review-commit` | 7 | The delivery pack: activation vs `orchestration-basics`/`ui-api-automation`, plan-only mode, 2 blocking safety cases (no autonomous commit, no big-bang), per-phase STOP gates contract |

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
