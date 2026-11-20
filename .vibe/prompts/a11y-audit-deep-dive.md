---
description: Structured accessibility deep dive beyond a scanner pass — a page, a sampled set of templates, or a user journey, mapped to exact WCAG 2.2 AA criteria with a manual retest checklist and technical and/or stakeholder-ready output. Arguments: URL or user flow, auth details if protected, audit mode (quick triage / full page / full journey), output mode (technical / business / both), compliance target (default WCAG 2.2 AA). Uses Playwright MCP. For a quick single-URL check use /a11y-webpage-audit. See skill accessibility-testing.
---

# Accessibility audit — deep dive

If the `accessibility-testing` skill is available, load it before starting. You can also delegate to the `qa-tools:a11y-test-planner` / `a11y-test-code-reviewer` pipeline agents for the report.

Goal: a structured accessibility audit that goes beyond a quick scanner pass.

Ask for the minimum context: URL or user flow, auth details if protected, audit mode (quick triage / full page / full journey), output mode (technical report / business summary / both), compliance target (default WCAG 2.2 AA).

If the scope covers more than one page, **sample unique templates and critical journeys** instead of pretending every page got the same depth — and say so in the report.

## When a live page is available (Playwright MCP from the qa-tools plugin mcp.json)

1. Inspect the page/flow with Playwright for keyboard, focus, and interaction checks.
2. Review semantics, forms, dynamic states, zoom/reflow risks, and WCAG 2.2 additions (target size, focus not obscured).
3. If automated tool output is available (axe etc.), normalize it into the report — never rely on it alone.
4. Deduplicate repeated findings; prioritize by user impact.
5. Produce: short summary · findings mapped to exact WCAG criteria · issue table (technical mode) · quick wins vs structural fixes · manual retest checklist · stakeholder summary (when that output mode is chosen).

## Constraints

- Use the exact official WCAG 2.2 success criterion names. Do not report SC 4.1.1 Parsing.
- If confidence is low because a manual or assistive-technology check could not be completed, say so explicitly.
- Audit only sites you own or are authorized to test. Do not submit forms, complete purchases, or change account data without explicit confirmation; use test accounts.
- Stop when every sampled page or journey step has been reviewed, or when access (auth, environment) blocks further review — list what was not reviewed.

## Output

Markdown only, technical report style, actionable for testers and developers.
