---
description: Audit ONE webpage for accessibility (WCAG 2.1/2.2 AA), with reproduction steps, fixes, and retest steps per issue, driven live via Playwright MCP. Argument: the URL (only a site you are authorized to test). For multi-page journeys or stakeholder-ready reporting use /a11y-audit-deep-dive. See skill accessibility-testing.
---

# A11y webpage audit (single URL)

If the `accessibility-testing` skill is available, load it before starting.

Audit the page at the URL given as the command argument and produce a structured Markdown report. If no URL is provided, ask for one and stop. If the page needs login, ask for a test account or a saved auth state — do not guess credentials. Use the Playwright MCP tools (shipped by the qa-tools plugin in `mcp.json`) to load and interact with the page.

## Scope

- WCAG 2.1/2.2 AA criteria most likely affected on a webpage: contrast, semantics, keyboard, focus, forms, reflow/zoom, motion.
- Native HTML semantics first; ARIA only where native semantics cannot do the job.
- Name violations with axe-core rule vocabulary; if tool output is available (axe, Pa11y, Lighthouse), normalize it into the report and **confirm each item on the page** rather than copying it.

## Steps — six passes, in this order

1. Static review: semantic HTML, landmarks, headings, labels
2. Keyboard pass: tab order, visible focus, keyboard traps, skip links
3. Dynamic content: dialogs, menus, live regions
4. Visual pass: contrast, zoom and reflow at 400%, motion
5. Forms and errors: labels, instructions, validation messages
6. Programmatic names, roles, and states of controls

For each issue record: description, why it matters (who is affected and how), how to reproduce, proposed fix (code snippet where useful), exact official WCAG success criterion name, and how to verify the fix. Screenshot the issue where it helps, affected element outlined.

## Output (Markdown)

- **Summary**: page URL, overall risk (High/Medium/Low), issue count by severity
- **Findings by WCAG criterion** — one block per issue with the fields above
- **Issue table**: `| ID | WCAG | Component/Selector | Severity | Description | Proposed Fix |`
- **Not checked** — anything not assessable automatically (screen reader output, cognitive load), so nobody reads the report as complete coverage

## Guardrails

- Audit only sites you own or are authorized to test.
- Do not submit forms, send messages, or change account data without explicit confirmation — inspect validation by tabbing and reading, not by creating real records.
- Report what you observed; a tool finding you could not confirm on the page is labelled unconfirmed.
- Stop after the six passes; for more pages or a full journey, hand off to `/a11y-audit-deep-dive`.

Reference: WCAG 2.2 Quick Reference — https://www.w3.org/WAI/WCAG22/quickref/
