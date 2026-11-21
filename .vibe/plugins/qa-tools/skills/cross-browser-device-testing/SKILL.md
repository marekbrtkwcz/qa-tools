---
name: cross-browser-device-testing
description: Load this skill when planning and running cross-browser and cross-device compatibility testing — building a support matrix, choosing which browser/OS/device/viewport combinations to test, running Playwright projects per combination, handling browser-specific bugs (Safari date pickers, iOS viewport quirks, Firefox privacy mode), responsive breakpoints, and deciding what NOT to test (full grid is exponential). Complements mobile-testing (mobile-specific emulation) and visual-testing (pixel diffs per browser).
user-invocable: true
---

# 🌐 Cross-Browser / Device Matrix Testing

Every browser engine renders, executes, and handles input differently. A feature that works in Chrome can break in Safari (date inputs, `100vh`), Firefox (privacy mode blocks storage), or on a small Android screen. A **support matrix** makes coverage a decision, not a guess.

Use it when: defining browser support policy, setting up CI across browsers, investigating a browser-specific bug, or before a release touching shared UI/layout code.

## 🚫 When NOT to use

- Mobile-specific emulation details (touch, notch, PWA install) → `mobile-testing`
- Visual pixel diffs per browser → `visual-testing`
- Accessibility compliance per browser → `accessibility-testing`

## 🗺️ Step 1 — Build the support matrix

Define tiers from real usage data (analytics), not wishful thinking:

| Tier | Meaning | Test depth |
|---|---|---|
| **Tier 1** (core) | browsers/devices covering ~90%+ of users | full suite in CI on every PR |
| **Tier 2** (secondary) | ~9% of users | full suite nightly, smoke on PR |
| **Tier 3** (legacy/edge) | <1% or legacy enterprise | smoke only, or manual on release; document known limitations |

Example Tier 1: Chrome+Edge (latest, latest-1), Safari (latest, latest-1), Firefox (latest), iOS Safari (latest), Android Chrome (latest). Record the matrix with the data source and review date — a matrix without a date rots.

## 🧪 Step 2 — Run it in Playwright

- One Playwright **project per combination**: `{ name: 'chromium', use: { browserName: 'chromium' } }`, `webkit`, `firefox`, plus `devices['iPhone 14']` / `devices['Pixel 7']` for mobile
- Run Tier 1 on every PR, Tier 2 nightly — parallelize with `--shard` (`ci-cd-pipelines`)
- Viewport matrix for responsive: test at breakpoints (e.g. 375, 768, 1280, 1920 px) — layout bugs live at the edges
- Do NOT test every OS × browser × version — the matrix tiers exist precisely to avoid the exponential grid

## 🐛 Step 3 — Known browser-specific traps

- **Safari/WebKit**: `input[type=date]` rendering, `100vh` includes URL bar on iOS, Intl/Date parsing differences, Intelligent Tracking Prevention blocks some storage/cookies
- **Firefox**: stricter privacy mode, different default fonts affecting layout, `devicePixelRatio` behavior
- **Chrome/Edge**: usually the reference; bugs found here are usually real app bugs
- **Mobile browsers**: no hover, tap delay, on-screen keyboard covering inputs, text zoom on rotation, safe-area insets
- When a test fails on one browser only: reproduce manually in that browser first, check console + network, then decide — app bug vs test bug vs unsupported edge

## 🔁 Step 4 — Keep the matrix honest

- Update tiers from analytics quarterly; drop Tier 3 browsers nobody uses, promote newly popular ones
- Flaky per-browser tests go to `stabilizing-flaky-tests` — a test that only fails on WebKit is still a flake until root-caused
- Document known unsupported combinations in README/user-facing docs — silence reads as a bug report
