# Mobile accessibility checklist (WCAG 2.2 mapped)

Record per item: platform, OS, screen, result (pass/fail), evidence.

## Screen reader (TalkBack / VoiceOver)

| Check | WCAG |
| --- | --- |
| All interactive elements reachable in logical focus order | 2.4.3 |
| Elements have meaningful labels (not "button, button") | 4.1.2 |
| Actions completable with screen reader only | 2.1.1 |
| Custom controls announce role/state | 4.1.2 |
| Modals/sheets trap and release focus; errors announced | 4.1.3 |

## Touch and layout

| Check | WCAG |
| --- | --- |
| Touch targets ≥ 24×24 dp (Android) / 44×44 pt (iOS) | 2.5.8 |
| Spacing between targets adequate | 2.5.8 |
| Contrast text ≥ 4.5:1, large text ≥ 3:1, UI components ≥ 3:1 | 1.4.3 / 1.4.11 |
| Layout holds at largest dynamic type; no truncation/overlap | 1.4.4 / 1.4.10 |
| Zoom to 200% without loss of content/function | 1.4.4 |
| Gestures have alternatives (swipe → button) | 2.5.1 |
| Motion/animation can be reduced (reduce motion honoured) | 2.2.2 |
| Dragging movements have single-pointer alternative | 2.5.7 |
