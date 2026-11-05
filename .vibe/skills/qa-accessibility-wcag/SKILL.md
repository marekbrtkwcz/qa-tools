---
name: qa-accessibility-wcag
description: Load when the user wants WCAG accessibility testing (WCAG 2.1/2.2 A/AA) of a web app — automated axe-core scans plus keyboard/focus checks in Playwright. Orchestrates agents/accessibility; setup via setups/accessibility-wcag. Separate domain from UI/API/security tests.
---

# ♿ QA Accessibility WCAG

Workflow for WCAG accessibility testing inside a Playwright project.

## ⛓️ Pipeline

1. **Plan** — `agents/accessibility/accessibility-test-planner.agent.md`: scope pages/flows, conformance level (default WCAG 2.2 AA), automated vs manual checks; save to `docs/scenarios/accessibility/`
2. **Write** — `agents/accessibility/accessibility-test-writer.agent.md`: `tests/accessibility/*.spec.ts` with `@axe-core/playwright` + keyboard checks; violations are reported as findings, never hidden
3. **Refactor** — `agents/accessibility/accessibility-test-refactor.agent.md`: shared axe config and scan helper
4. **Review** — `agents/accessibility/accessibility-test-code-review.agent.md`: coverage + no unjustified disabled rules

## 🎨 Setup

`setups/accessibility-wcag.instructions.md` — adds `@axe-core/playwright`, `tests/accessibility/`, npm script `test:a11y` to an existing Playwright project.

## 🖌️ Built-in skills

`playwright-best-practices` covers axe-core integration, keyboard testing, and accessibility patterns — load it alongside.

## 📏 Rules

- axe-core covers only part of WCAG — always combine with keyboard/focus checks; state limitations in every plan
- Never disable axe rules to make a test green; a violation is a finding
- Specs live in `tests/accessibility/`, run via `npm run test:a11y`
- Lint/format with Biome (`shared/biome.json`)
