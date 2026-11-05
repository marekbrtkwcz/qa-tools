---
description: "Add WCAG accessibility testing (axe-core) to an existing Playwright + TypeScript project: @axe-core/playwright, tests/accessibility/, npm script test:a11y. Trigger: WCAG setup, accessibility setup, testy dostępności, a11y setup."
---

# ♿ Accessibility (WCAG) Setup — extends a Playwright project

Run `setups/playwright-fullstack.instructions.md` (or ui-only) first. This setup adds the accessibility layer.

## 🧵 Steps

1. Install latest: `npm i -D @axe-core/playwright`
2. Add directories (with `.gitkeep`):
   ```
   tests/accessibility/          ← *.spec.ts (axe scans + keyboard checks)
   docs/scenarios/accessibility/ ← plans from accessibility-test-planner
   ```
3. npm script: `"test:a11y": "playwright test tests/accessibility"`
4. Specs use `env.BASE_URL` z singletonu `src/config/env.ts` (z projektu bazowego) — nigdy nie hardcoduj URL
5. Default axe tags: `wcag2a`, `wcag2aa`, `wcag22aa` (adjust per target conformance level)
6. Optional: shared axe options in `src/utils/axe-config.ts`
7. Folder `scripts/` (skrypty tsx) pochodzi z projektu bazowego — patrz `shared/conventions.md`
7. Biome covers `tests/accessibility/` automatically via `shared/biome.json`

## 📌 Reminder

Automated axe scans detect only a subset of WCAG issues. Always include keyboard navigation, focus order/visibility, and label checks in the plan — see `agents/accessibility/accessibility-test-planner.agent.md`.
