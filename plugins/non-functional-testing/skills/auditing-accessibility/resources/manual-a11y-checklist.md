# Manual Accessibility Checklist

Use this checklist for triage, retest, or when automated tools cannot confirm a finding.

## Structure and semantics

- [ ] Page has a meaningful title
- [ ] One clear main heading exists
- [ ] Landmarks such as header, nav, main, and footer are present where appropriate
- [ ] Interactive elements have accessible names
- [ ] Form inputs have labels or equivalent accessible names

## Keyboard and focus

- [ ] Every interactive element is reachable by keyboard
- [ ] Focus order follows the visual and logical flow
- [ ] Focus is clearly visible
- [ ] No keyboard trap appears in dialogs, menus, or widgets
- [ ] Escape or equivalent closes dismissible overlays when expected

## Forms and feedback

- [ ] Required fields are identified clearly
- [ ] Error messages are visible and understandable
- [ ] Error state is announced or associated programmatically
- [ ] Success and status messages are discoverable

## Visual accessibility

- [ ] Text remains usable at zoom
- [ ] No critical content disappears at 200% to 400% zoom
- [ ] Contrast looks sufficient for text, icons, and focus rings
- [ ] Meaning is not conveyed by color alone
- [ ] Motion does not block use or overwhelm the interface

## WCAG 2.2 spot checks

- [ ] 2.4.11 Focus Not Obscured (Minimum): the focused element is not entirely hidden behind sticky headers, banners, or chat widgets
- [ ] 2.5.7 Dragging Movements: every drag interaction has a single-pointer alternative (buttons, click-to-place)
- [ ] 2.5.8 Target Size (Minimum): pointer targets are at least 24 by 24 CSS pixels, or have enough spacing
- [ ] 3.2.6 Consistent Help: help links or contact options appear in the same relative place across pages
- [ ] 3.3.7 Redundant Entry: information already entered in the same process is pre-filled or selectable
- [ ] 3.3.8 Accessible Authentication (Minimum): login does not require a cognitive test; paste and password managers work

## Localization and RTL

Run these on the RTL build and at least one non-default locale when the product ships one; an LTR-only audit is an audit of half the product.

- [ ] `<html lang>` (and `dir`) match the current language and direction
- [ ] Focus order follows the reading order in RTL - mirroring the layout must mirror the tab order, not just the pixels
- [ ] Long strings (German, Polish, Finnish) do not overflow containers, truncate buttons, or push controls off-screen
- [ ] Directional icons mirror in RTL (chevrons, arrows, progress indicators, back buttons)
- [ ] Mixed-direction text (bidi: Latin inside Arabic/Hebrew or vice versa) renders sensibly, especially in inputs and user-generated content
- [ ] Translated labels, errors, and aria messages fit their association with the right field after translation
- [ ] Screen reader announces the translated page in the right language (voice/lang switching where available)
- [ ] Target sizes still hold after translation (buttons grew, spacing shrank)

## Retest notes

- [ ] Findings verified after the fix
- [ ] Residual risk documented
- [ ] Anything still requiring assistive-technology testing is listed explicitly
