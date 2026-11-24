---
name: auditing-mobile-accessibility
description: 'Audits mobile app accessibility against WCAG 2.2 applied to native apps: screen-reader support (TalkBack/VoiceOver), touch target sizes, dynamic type and zoom, contrast, focus order, and gesture alternatives. Use when a mobile app needs an a11y audit or sign-off, when VoiceOver/TalkBack reading order is broken, or when accessibility requirements are contractual.'
argument-hint: 'The app build under test, the target platforms (iOS/Android) and OS versions, and the screen-reader tools available'
user-invocable: true
---

# Auditing Mobile Accessibility

Use this skill when the product is a native mobile app. `auditing-accessibility` covers web pages with axe-core; this is the mobile counterpart — screen readers, touch targets, and platform-specific behaviour cannot be checked by a web scanner.

## When to Use

- a mobile app needs an accessibility audit or contractual sign-off
- VoiceOver/TalkBack reads elements in the wrong order or skips them
- tap targets are too small, gestures have no alternative, or text is cut off at large font sizes
- a new OS version changed accessibility behaviour

## Operating Principles

- **Test with the real screen reader.** TalkBack (Android) and VoiceOver (iOS) on real devices or emulators; automated scanners catch only part.
- **WCAG 2.2 criteria mapped to mobile.** Focus order, target size (24×24 CSS px minimum, 44pt guidance), contrast 4.5:1, resize text to 200% without loss.
- **Every gesture needs an alternative.** Swipe-to-delete must have a button alternative; pinch-zoom must not be disabled.
- **Dynamic type is a layout requirement.** Test at the largest accessibility font size — truncation and overlap are defects.
- **Automate what can be automated** (accessibility scanner on CI builds), verify the rest manually with the screen reader.

## Workflow

### Phase 1: Scope

- platforms, OS versions, and the screens/flows in scope (critical flows first)
- tools: platform accessibility inspector (Android Studio / Xcode Accessibility Inspector), screen readers

### Phase 2: Automated pass

- run the platform accessibility scanner on the build; collect violations (missing labels, small targets, contrast)

### Phase 3: Manual screen-reader pass

Work through `./resources/mobile-a11y-checklist.md`:

- every interactive element reachable and correctly labelled in focus order (TalkBack/VoiceOver swipe through)
- actions completable with the screen reader only
- touch targets ≥ minimum size; spacing adequate
- contrast and non-text contrast meet thresholds
- dynamic type: layout holds at largest size; zoom to 200% (mobile) without loss of content
- gestures have alternatives; animations can be reduced (reduce motion setting honoured)
- modals/sheets trap and release focus correctly; error messages announced

### Phase 4: Report

- findings mapped to WCAG 2.2 success criteria with platform, OS, screen, and recording; prioritized remediation; stakeholder summary
- sign-off evidence recorded via `attesting-manual-verification`

## Resource Map

- `./resources/mobile-a11y-checklist.md` - the per-criterion manual check matrix. Read during Phase 3.

## Related Skills

- `auditing-accessibility` - the web counterpart (axe-core, keyboard, WCAG mapping)
- `mobile-app-testing` - Maestro/Appium flows and device setup for the audit
- `visual-regression-mobile` - font-scale and theme variants of the same screens
- `attesting-manual-verification` - recording the audit as sign-off evidence

## Definition of Done

This skill is complete when:

- automated scanner pass ran on the target builds with violations collected
- manual screen-reader pass covered focus order, labels, actions, targets, contrast, dynamic type, gestures, focus trapping on critical flows
- every finding maps to a WCAG 2.2 criterion with platform/OS/screen evidence
- remediation priorities and the stakeholder summary produced; audit attested
