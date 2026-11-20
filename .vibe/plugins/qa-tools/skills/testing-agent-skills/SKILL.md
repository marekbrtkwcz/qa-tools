---
name: testing-agent-skills
description: Load this skill when testing the customization assets themselves — skills, prompts, agents, hooks, instructions — the way a product is tested: activation cases (fires when it should, stays quiet when it should not), collision cases between assets competing for the same trigger, output-contract cases, safety cases, a blind-scored weighted rubric, and a gate comparing the candidate against a recorded baseline before it ships. Use when a skill is edited and nobody knows whether behavior changed, when two skills fight over the same request, when a description is tuned for discoverability, or as a release gate for a plugin/collection. Complements plugin-authoring (structure/validation) and llm-testing (product LLM features).
user-invocable: true
---

# 🧪 Testing Agent Skills

A `SKILL.md` is a **behavioral contract executed by a model** — nothing about it is verified by frontmatter linting or a careful read. Every claim in a description ("Load this skill when…", "never…") is a testable assertion; until tested, the asset is untested code shipped to every user of the plugin.

A skill-eval failure ships a wrong *process* to every future task. A product-eval failure (see `llm-testing`) ships a wrong answer to one customer.

## 🚫 What an eval can and cannot prove

**Can prove:** activation on claimed requests and silence on adjacent ones; output satisfies a stated contract; a specific bad behavior no longer happens; candidate scores higher than baseline on the same cases, same model, same settings.

**Cannot prove:** general superiority (only these cases, this model version); correctness when criteria check shape only; anything from a single trial (one pass = one observation); causation without a baseline run under identical conditions.

Write the limits into the report — an eval claiming general improvement from six cases and one trial is the same failure as a suite claiming coverage from one green run.

## 🗂️ Case taxonomy (7 categories — most suites only write the first, and that's why they pass)

| Category | Question | Fails when |
| --- | --- | ---|
| **Activation-positive** | fires on a request it claims? | description shares no vocabulary with real requests |
| **Activation-negative** | stays quiet on adjacent requests? | description so broad it fires on everything |
| **Collision** | between competing assets, does the right one win? | two skills claim the same trigger; selection is random |
| **Contract** | output has the parts the asset promises? | required sections go missing |
| **Behavioral** | changes what the model *does*, not just says? | asset is quoted back as a summary, then ignored |
| **Safety** | confirmations, auth gates, refusals preserved? | a brevity/speed rule quietly deletes a confirmation step |
| **Persistence** | always-apply asset still applies at turn ten? | rules lapse when the topic changes |

In a large collection the real risk of a new asset is firing **instead of** something better — negative and collision cases earn their keep there.

**Smallest useful suite: 6 cases** — one per category above where applicable (activation-positive, activation-negative, collision, contract, safety, persistence). Run each 3× with and without the asset. Grow the suite from real defects found in use, not from a plan.

## 🔁 Workflow

### 1️⃣ Phase 0 — state the behavioral claim

One sentence: what does this asset make the model do that it wouldn't otherwise? If it's hard to write, the asset has no testable claim — fix the asset first. Map every frontmatter "when" clause → activation-positive case; every scope boundary → activation-negative; every "always" → persistence case.

### 2️⃣ Phase 1 — write the cases (10–20 per asset)

Per case: the prompt **in the words a real user would type** (never copying trigger phrases from the description — that tests a tautology), category + risk, pass criteria that are observable and that a second scorer would score the same way. At least one criterion per case must check **substance**, not shape ("ranks the swallowed 402 above the fixture duplication", not "includes a severity ranking").

### 3️⃣ Phase 2 — record the baseline

Run every case with the asset **disabled/absent** (for an edit: the current published version). Save responses verbatim, with model + version + settings. No baseline → every result is unattributable.

### 4️⃣ Phase 3 — run the candidate

Same cases, same model, same settings, asset enabled. **≥3 trials per case**; record all trials including disagreeing ones.

### 5️⃣ Phase 4 — score blind

Label responses A/B without revealing which is baseline; score against a weighted rubric; a second person (or a blind model judge, spot-checked by hand) scores if possible. Non-blind scoring reproduces the author's expectation.

### 6️⃣ Phase 5 — apply the gate

Candidate ships only when: no blocking findings, safety/correctness not regressed, weighted score above baseline. Winning on concision while losing on correctness does not ship.

### 7️⃣ Phase 6 — store and re-run

Commit the case file, rubric, baseline responses, and run record next to the asset (or under `evals/`). Re-run before the next edit to the asset and when the default model changes. A suite that ran once is a screenshot.

## ⚔️ Trigger collisions in a collection

Run whenever an asset is added or a description rewritten: (1) find near neighbours sharing vocabulary/triggers; (2) write one collision case per pair, phrased as a user would ask; (3) state the intended winner and why — if you can't, merge the assets or rewrite their scopes; (4) each description should name its near neighbour and when to prefer it — test that this works; (5) re-run collision cases when either side changes.

## 🚨 Failure modes (ordered by cost)

1. Suite rewritten to fit the asset (the eval version of editing a test to green — worse than untested)
2. No baseline recorded
3. Shape-only criteria
4. Judge sees the labels
5. One trial per case
6. Prompts copied from the description
7. No safety cases
8. No activation-negative cases
9. Green suite, but the tested asset isn't the shipped one (plugin copy / README / frontmatter out of sync)

## 🔗 Related skills

- `plugin-authoring` — authors and structurally validates the plugin/skills this skill then tests behaviorally
- `llm-testing` — the same eval discipline aimed at product LLM features
- `quality-gates` — where the eval gate sits next to test/coverage gates in CI
- `stabilizing-flaky-tests` — eval runs vary like model output; treat flaky eval cases the same way

## ✅ Definition of done

- [ ] Behavioral claim in one sentence; every frontmatter claim maps to ≥1 case
- [ ] Suite covers all applicable categories; always includes activation-negative + collision
- [ ] Pass criteria observable; ≥1 criterion per case checks substance
- [ ] Baseline recorded on the same cases, same model/settings
- [ ] ≥3 trials per case; disagreeing trials recorded
- [ ] Blind scoring with stated rubric weights
- [ ] Explicit gate decision: shipped, or not shipped with reason
- [ ] Case file + rubric + baseline + run record committed next to the asset
- [ ] Report states what the suite does NOT prove (case count, model, trials)
