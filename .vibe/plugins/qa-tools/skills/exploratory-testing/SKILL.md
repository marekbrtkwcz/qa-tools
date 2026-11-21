---
name: exploratory-testing
description: Load this skill when running exploratory testing sessions — unscripted, learning-driven testing where test design, execution, and learning happen simultaneously. Covers session-based test management (charters, timeboxes, session notes), heuristics (SFDPOT, FEW HICCUPPS), documenting findings, and converting discoveries into automated regression tests. Complements test-planning (scripted tests) — use this when the goal is to discover unknown risks, not to verify known behavior.
user-invocable: true
---

# 🧭 Exploratory Testing

Exploratory testing is **simultaneous learning, test design, and test execution**. Unlike scripted testing, you do not follow pre-written steps — you design the next test based on what you just learned. It finds a different class of defects than automation: unknown unknowns, not known risks.

Use it when: the feature is new and requirements are vague, the area is complex or poorly covered by automats, you have a short window before release, or a bug was found and you want to probe around it.

## 🚫 When NOT to use

- Compliance/audit contexts that require documented, repeatable steps → use scripted tests (`test-planning`)
- Verifying a known acceptance criterion → scripted test is faster and provable
- Pure regression of already-covered behavior → run the existing suite

## 📋 Session-Based Test Management (SBTM)

One session = one **charter** + one **timebox** + one **session note**.

### Charter
A charter is a one-to-two-sentence mission, not a test case. It focuses the session without scripting it.

Good charters:
- "Explore the checkout flow with an expired coupon — what error states exist?"
- "Probe the search feature with unusual input: very long strings, emoji, SQL fragments, RTL text."
- "Attack the file upload: wrong types, huge files, double upload, cancel mid-upload."

Bad charters (too scripted):
- "1. Open checkout. 2. Add coupon X. 3. Click pay. 4. Expect error Y." — that is a script, write an automated test.

### Timebox
- 60–90 minutes per session is the sweet spot. Shorter for probing one area, longer for a broad sweep.
- Stop at the timebox even if "one more thing" tempts you — note it as a follow-up charter instead.

### Session note
Record during or right after the session:
- Charter and timebox used
- What you actually did (areas touched, not step-by-step)
- Bugs found (each with repro, severity, screenshot/log)
- Questions and risks discovered ("what if the payment provider times out? — untested")
- Charters for follow-up sessions
- Coverage: what parts of the feature you did NOT touch

## 🃏 Heuristics to guide exploration

- **SFDPOT** — Structure, Function, Data, Platform, Operations, Time
- **FEW HICCUPPS** — Familiarity, Explainability, Warnability, Hiccoughs (interruptions), Consistency, Undo, Presence, Progressive disclosure, Standards
- **Boundaries** — empty, null, zero, max, negative, very long, very fast, very slow
- **Interrupts** — network drop, back button, double-click, refresh mid-action, concurrent tabs
- **Data** — paste instead of type, unicode/emoji, RTL, copy from another app, stale data after server change

## 🔁 From session to regression suite

Every bug found in a session must become a **scripted automated test** before the session is "done" — otherwise the knowledge evaporates. Also promote any interesting scenario that is repeatable.

1. Write the automated test for each bug (see `diagnosing-test-failures` for triage)
2. Link session note → bug → test in the report
3. Keep the session note as evidence of what was explored

## 🛠️ Practical setup

- Screen recording or screenshots for repro steps
- Browser devtools: network tab for failed calls, console for errors, application tab for state
- Test data: use realistic data (`test-data-management`), including edge values
- One session, one note file (e.g. `.qa/exploratory/2026-11-21-checkout-charter.md`)

## 📊 Reporting

A session report answers three questions for the reader: **what did we learn**, **what did we cover**, **what is still unknown**. Use `communicating-quality-findings` for shaping the output: bugs first, then open risks, then coverage gaps. Never report "tested everything" — report what was and was not explored.
