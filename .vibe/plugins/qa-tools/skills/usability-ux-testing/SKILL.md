---
name: usability-ux-testing
description: Load this skill when evaluating usability and user experience beyond functionality — heuristic evaluation (Nielsen's 10), cognitive walkthrough, task-based user testing, and consistency checks. Covers error prevention and recovery, feedback and system status, user control, accessibility-adjacent UX (distinct from a11y-testing which is WCAG compliance), and reporting findings with severity. Use before/after releases and when analytics show drop-off. Not a substitute for a11y-testing or security-testing.
user-invocable: true
---

# 👤 Usability / UX Testing

Usability testing answers: **can a real user accomplish their goal without friction, confusion, or mistakes?** It is distinct from `accessibility-testing` (WCAG compliance for people with disabilities) and from functional testing (does it work) — here we test whether it works *well for humans*.

Use it when: a flow is new or redesigned, analytics show drop-off or rage clicks, support tickets mention confusion, or before a major release.

## 🚫 When NOT to use

- WCAG 2.x conformance audits → `accessibility-testing`
- "Does the button do what the backend says" → functional/E2E tests
- Legal accessibility requirements → a11y + `privacy-compliance-testing` where relevant

## 🃏 Method 1 — Heuristic evaluation (Nielsen's 10)

One or more evaluators walk the flow and flag violations. Fast, cheap, catches most issues:

1. **Visibility of system status** — is the user always told what is happening (loading, saved, error)?
2. **Match between system and real world** — labels, icons, metaphors users understand; no jargon
3. **User control and freedom** — easy undo/redo, clear exit from flows, no trap doors
4. **Consistency and standards** — same action = same result everywhere; platform conventions followed
5. **Error prevention** — confirmations before destructive actions, constraints that make invalid input impossible, not just detectable
6. **Recognition over recall** — options visible, not buried in memory; defaults sensible
7. **Flexibility and efficiency of use** — shortcuts for power users (keyboard, gestures) without hurting novices
8. **Aesthetic and minimalist design** — no irrelevant information competing for attention
9. **Help users recognize, diagnose, and recover from errors** — plain-language error messages that say what happened and what to do next (never "Error 500")
10. **Help and documentation** — searchable, task-focused, concise; present when needed

## 🚶 Method 2 — Cognitive walkthrough

For each task, ask at every step: *"Would a user know this action is available? Would they know it leads to their goal? Would they understand the feedback?"* Best for first-time-user experience of a specific task (e.g. "first checkout").

## 🧑 Method 3 — Task-based testing with real users

- 5 users find most usability problems (Nielsen). Recruit representative users, not teammates
- Give tasks as goals, not steps: "Buy this and apply the discount" — not "click X, then Y"
- Observe silently; note where they hesitate, misclick, re-read, or give up. Ask "what are you thinking?" only after the session
- Time-on-task and success rate per task are the countable outputs

## 📋 Severity and reporting

Rate each finding: **cosmetic / minor / major / catastrophic** (catastrophic = task cannot be completed). Report with: finding, heuristic violated, where in the flow, screenshot/recording, severity, suggested first fix. Order by severity, one decision per finding — shape with `communicating-quality-findings`.

## 🔁 Close the loop

- Findings that reveal real confusion should become exploratory charters (`exploratory-testing`) and, where repeatable, scripted tests
- Re-test after fixes with the same tasks — measure time-on-task improvement, not just "fixed"
