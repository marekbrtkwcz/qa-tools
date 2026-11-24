---
name: visual-regression-mobile
description: 'Runs visual regression testing on mobile apps: screenshot baselines per device, OS version, locale, and orientation; masking of dynamic content; approval workflow for baseline updates; and flaky-proof capture (animations off, deterministic state). Use when mobile UI regressions escape to production, when a new device or OS version joins the test matrix, or when screenshots fail on every device but pass locally. For functional flow automation (Maestro/Appium) use mobile-app-testing; for native-app accessibility use auditing-mobile-accessibility.'
argument-hint: 'The app under test, the device matrix (models, OS versions), locales and orientations in scope, and where baselines are stored'
user-invocable: true
---

# Visual Regression Mobile

Use this skill when a pixel-level change in a mobile app must be caught before release. This is the mobile counterpart of `running-visual-regression-tests` — same discipline (baselines, masking, reviewed updates), different capture pipeline (emulator/simulator/device farm instead of a browser).

## When to Use

- styling regressions on mobile escape to production
- a new device, OS version, screen density, or locale joins the matrix
- screenshots pass on one device and fail on all others (capture or font-rendering difference)
- baselines are being updated without anyone looking at the diff
- dark mode, dynamic type (font scaling), and RTL variants need their own baselines

## Operating Principles

- **Deterministic capture first.** Animations off, fixed clock, seeded data, animations/transitions disabled in the test build; a screenshot of a moving UI is a flake by construction.
- **Baseline per variant.** Device × OS × locale × orientation × theme (light/dark) × font scale is a separate baseline; never share baselines across variants.
- **Mask what is dynamic.** Avatars, timestamps, ads, carousels — mask or stub them; everything else must match.
- **Updates are reviewed, not auto-accepted.** A baseline update is a diff review: someone must look at what changed and why before accepting.
- **Store baselines with the code or in versioned storage**, never on a single machine; CI must be able to fetch them.

## Workflow

### Phase 1: Define the capture matrix

- devices/emulators and OS versions in scope, screen densities, locales, orientations, themes, font scales
- per screen/flow: the states to capture (empty, loaded, error, long content)
- choose the capture tool: Maestro/Appium screenshots (`mobile-app-testing`), or platform-native (XCUITest/Espresso) for finer control

### Phase 2: Make capture deterministic

Work through `./resources/mobile-capture-checklist.md`:

- disable animations and transitions (developer settings / test build flag)
- fix the clock and seed data; stub network to recorded responses where content varies
- wait for idle (no spinners, no skeleton loaders) before capture — wait on state, not on sleep
- set status bar, battery, and notification banners to fixed values

### Phase 3: Capture, compare, triage

- run the capture on the matrix; compare against baselines with a per-pixel or perceptual threshold
- triage every diff: intended change (update baseline after review), environment difference (font rendering, density — fix capture), or a real regression (file via `reporting-bugs`)
- record the matrix result: per device/locale, pass/diff/fail counts

### Phase 4: Baseline update workflow

- updates go through review: the diff image is attached, the reason is stated, and only then is the baseline replaced
- store the previous baseline alongside for one cycle to spot flapping

### Phase 5: CI

- run the visual suite on a fixed device-farm/emulator image; cache baselines; publish diff images as artifacts on failure (`test-reports-and-artifacts`)

## Resource Map

- `./resources/mobile-capture-checklist.md` - determinism checklist and per-variant matrix template. Read during Phases 1–2.

## Related Skills

- `running-visual-regression-tests` - the web/browser version of this discipline
- `mobile-app-testing` - Maestro/Appium flows and device setup used for capture
- `testing-internationalization` - locale and RTL variants of the same screens
- `test-reports-and-artifacts` - publishing diff images as CI artifacts
- `stabilizing-flaky-tests` - when captures fail intermittently

## Definition of Done

This skill is complete when:

- the capture matrix covers device × OS × locale × orientation × theme with separate baselines
- captures are deterministic (animations off, fixed clock, seeded data, idle-waited)
- dynamic regions are masked and everything else matches within threshold
- every baseline update was reviewed with the diff attached
- CI runs the visual suite on a pinned environment and publishes diff artifacts
- regressions found are filed with device, variant, and diff image
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
