---
description: Design and implement an offline eval suite for an LLM feature — golden/edge/negative cases per prompt template, cheapest scoring that can actually fail, pinned determinism, a regression gate against a committed baseline, and the CI job. Arguments: (1) the feature and where its code lives, (2) the quality bar — what "good output" means in one or two sentences (required; without it the suite would only assert non-empty output). For injection/guardrail testing use /test-llm-guardrails. See skill llm-testing and knowledge ai-product-qa; can delegate to qa-tools:llm-feature-test-engineer.
---

# Design an LLM eval suite

Goal: build the eval suite that catches quality regressions in this LLM feature before users do.

If the `llm-testing` skill is available, load it; the `ai-product-qa` knowledge entry covers the three-suite model. You can delegate to the `qa-tools:llm-feature-test-engineer` subagent.

## Inputs

| Input | Required | Notes |
|---|---|---|
| The feature (command arg 1) | ✅ | what it does and where its code lives |
| What "good output" means (command arg 2) | ✅ | the promise to the user, 1–2 sentences |
| Prompts and model config | ⬜ | read from the repo if not supplied |
| Existing eval/test setup | ⬜ | promptfoo config, `evals/`, or nothing |
| Cost budget per run | ⬜ | affects how much judge scoring is affordable |

If the quality bar is missing, **ask for it** — without a stated promise there is nothing to assert against.

## Steps

1. **Map the surface** — prompt templates, system prompts, model id and parameters, tool definitions, retrieval config, output schema, chain structure. Each becomes a CI trigger path.
2. **Write the promise down** — the user-visible contract as a sentence; every case traces to a clause of it.
3. **Design the case set** — 15–25 per prompt template: golden (human-approved expectations), edge (empty, huge, multilingual, malformed, contradictory), negative (must refuse / not invent / not leak / not break format). One regression case per past production failure.
4. **Pick scoring per case, cheapest first**: exact match → schema → required/forbidden content → deterministic property (valid JSON, citations resolve, no invented numbers) → embedding similarity → rubric judge → human review.
5. **Implement** in promptfoo or Vitest: pin the dated model version, `temperature: 0`, fixed seeds, retrieval frozen into fixtures, `retry: 0`, response cache keyed on prompt hash + model + input + corpus version.
6. **Measure the noise band** — run the suite three times unchanged, record the spread; the gate must sit outside it.
7. **Wire the gate** — committed baseline per prompt × model; fail on cases that used to pass and now fail; trigger on prompt, model config, tool, retrieval, and lockfile changes.

## Rules

- Golden expectations are **human-approved** — never paste current model output as the expectation.
- A judge needs a rubric with a scale, a different model than the one under test, and validation against 30–50 human labels; below ~80% agreement it is noise.
- Gate on **regressions, not absolute scores**. Never `latest` as a model id. Report **per capability**, not one global number. Split retrieval from generation for RAG. Cost and latency are results — report them against budget. Never real user data in fixtures (`test-data-management`).

## Output

1. Surface map + the promise sentence
2. Case set: counts by class/capability, case files written
3. Scoring choice per case class (+ judge rubric if used)
4. Determinism checklist, confirmed item by item
5. Suite files, baseline, comparison script
6. CI job with trigger paths and fork-safe behaviour
7. First-run results per capability + cost, p95 latency, unstable cases
8. Gaps: templates with no cases, capabilities with no negative case
