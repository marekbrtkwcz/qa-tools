# Mobile testing

Mobile app test automation: Maestro-first flows with Appium as the deliberate fallback, accessibility-id selectors over XPath, deterministic emulator/simulator setup, device-lab CI matrices, and animation-off / permission-dialog discipline for deterministic runs.

## Choosing a skill

- `mobile-app-testing` — functional flow automation on Android/iOS (Maestro flows, Appium fallback, device setup, CI matrices)
- `visual-regression-mobile` — screenshot baselines per device/OS/locale/orientation, masking, baseline approval workflow
- `auditing-mobile-accessibility` (in `non-functional-testing`) — native-app a11y audit (TalkBack/VoiceOver, touch targets)

Note: iOS simulator runs need macOS.

## Evidence and enforcement

Pinned by `evals/mobile-testing.cases.jsonl` (flow automation vs visual regression vs a11y routing).
