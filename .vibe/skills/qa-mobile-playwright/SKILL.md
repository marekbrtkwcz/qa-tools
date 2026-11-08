---
name: qa-mobile-playwright
description: Load when the user wants to plan, write, refactor, or review mobile web tests with Playwright device emulation (iPhone/Pixel devices, touch gestures, viewport, responsive breakpoints). Orchestrates agents/mobile. Keywords: mobile testing, testy mobile, device emulation, emulacja urządzeń, touch, viewport, responsive, Playwright devices.
---

# 📱 QA Mobile Playwright

Workflow for mobile web testing with Playwright device emulation + TypeScript.

## ⛓️ Pipeline

1. **Plan** — `agents/mobile/mobile-test-planner.agent.md`: validate scenario against real UI **with device emulation**, save to `docs/scenarios/mobile/`
2. **Write** — `agents/mobile/mobile-test-writer.agent.md`: write `tests/mobile/*.spec.ts` with device context
3. **Refactor** — `agents/mobile/mobile-test-refactor.agent.md`: Page Objects + mobile fixtures
4. **Review** — `agents/mobile/mobile-test-code-review.agent.md`: strict review incl. device/touch specifics

## 🧵 Setup

- `setups/mobile-playwright.instructions.md` — projekt z osobnym projektem `mobile` w playwright.config.ts (`devices['iPhone 14']` / `devices['Pixel 7']`)
- Lub pełny projekt: `setups/playwright-fullstack.instructions.md` + dopięcie projektu `mobile`

## 📏 Rules

- Device descriptor ustawia viewport/isMobile/hasTouch — NIE `page.setViewportSize()` w teście
- Gesty: `page.touchscreen.tap()`, `locator.tap()`; swipe przez mouse/touchscreen
- Osobne projekty per breakpoint (mobile/tablet/desktop) gdy layout responsywny
- Reszta reguł jak `qa-ui-playwright`: lokatory getByRole>getByLabel>..., Biome, env singleton, faker z seedem
