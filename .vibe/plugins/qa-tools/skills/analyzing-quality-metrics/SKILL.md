---
name: analyzing-quality-metrics
description: 'Load this skill when interpreting quality metrics — coverage, pass rate, flake rate, defect counts, test counts, MTTR — what each one actually measures, how it misleads, and which are anti-metrics. Use before quoting any number in a report, before setting a threshold, and when a metric can be gamed under pressure. Pairs with tracking-quality-trends (direction over time). Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 📊 Analyzing Quality Metrics

A metric is not a fact — it is a measurement with a blind spot. This skill is the reference for what each common quality metric really says, what it hides, and how to read it honestly. Use it **before** putting a number in a report, and **before** setting a threshold on it.

## 🎯 When to Use

- a number is about to be quoted in a status report, release review, or quality gate
- someone asks "is 71% coverage good?" — the answer is never the number alone
- a threshold is being set or tightened on a metric
- a metric moved and the team needs to know whether quality actually moved
- pairing with `tracking-quality-trends`: this skill says what the metric means, that one says which way it moved

## 📏 The Metrics, Read Honestly

| Metric | What it actually measures | How it misleads | Caveat to attach |
|---|---|---|---|
| **Code coverage** | Which lines executed during tests | Says nothing about whether assertions were meaningful; easy to game with assertion-free tests | "Coverage ≠ correctness" |
| **Line vs branch vs diff coverage** | Diff coverage = coverage of *changed* lines only | Whole-repo coverage hides that the new code is untested | Always report diff coverage for a PR |
| **Pass rate** | Share of runs green | Can rise because flaky tests were deleted or weakened, not because quality improved | Report alongside flake rate and test count |
| **Flake rate** | Share of tests that pass/fail non-deterministically | A falling flake rate after quarantining may mean hiding, not fixing | Quarantine needs an owner and an expiry |
| **Test count** | Number of tests | More tests ≠ better tests; duplicates and tautologies inflate it | Count *meaningful* scenarios, not test cases |
| **Defect count / escape rate** | Bugs found in production vs in testing | Depends on reporting culture; a drop can mean fewer reports, not fewer bugs | Needs a stable reporting channel to be meaningful |
| **MTTR (mean time to repair)** | Speed of fixing once known | Hides severity mix — fast fixes of trivial bugs look great | Segment by severity |
| **Cycle time / lead time** | Speed of delivery | Can improve by skipping review, not by becoming faster | Pair with quality gates status |
| **Eval score (LLM)** | Agreement with a golden dataset | Golden set ages; score can rise while real quality falls | Re-validate the golden set periodically |

## 🚫 Anti-Metrics (never gate on these alone)

- **Raw test count** — grows without quality moving.
- **Coverage without assertion quality** — `expect(true)` counts as covered.
- **Green pipeline percentage** — a pipeline with no blocking gates is always green.
- **Defects closed per sprint** — rewards finding easy bugs, punishes hard ones.
- **Lines of test code** — pure vanity.

## ✅ Rules for Honest Reporting

- **Every number gets a denominator.** "94% pass rate" means nothing without "of 312 tests, 7 quarantined".
- **Every metric carries its caveat inline**, not in a footnote.
- **Name the gaming risk.** If a metric can move under pressure without quality moving, say so next to the number.
- **Prefer ratio metrics over totals** (flake rate, escape rate, diff coverage) — they survive suite growth.
- **Segment before concluding.** Aggregate pass rate can hide that one critical suite is red.
- **A method change breaks comparability.** If you switch coverage tools or redefine "flake", start a new series — do not plot both on one line.

## 🧪 Quick Check Before Quoting a Number

1. What does this metric actually measure?
2. What is the denominator?
3. How could this number move without quality moving?
4. Is the measurement method the same as last time?
5. What caveat goes next to it in the report?

If any answer is missing, the number is not ready to be quoted.
