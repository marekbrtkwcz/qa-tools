---
name: mobile-app-testing
description: "Automates mobile app testing Maestro-first, Appium as deliberate fallback: flow files as coverage unit, accessibility-id selectors, deterministic device setup, CI matrices. Use when an Android/iOS app has no coverage or runs flake on dialogs. For screenshot baselines use visual-regression-mobile; for native-app a11y use auditing-mobile-accessibility; for product test plans use designing-functional-tests."
argument-hint: 'The app under test (apk/ipa or workspace), platforms (Android/iOS), available devices or emulators, and whether CI device access exists'
user-invocable: true
---

# Mobile App Testing (Maestro-first, Appium when needed)

Use this skill when a mobile app is verified by tapping it by hand, or when a device automation attempt has already turned flaky around system dialogs, animations, or "works on my emulator".

The discipline that makes mobile automation trustworthy is almost all environment control: stable identifiers, deterministic device state, animations off, and knowing that permission dialogs come from the OS, not the app. Maestro covers this cheaply with YAML flows; Appium pays for its complexity with grid scale and suite reuse that Maestro does not have. This skill helps spend that complexity only where it is earned.

## When to Use

- an Android/iOS app has no automated tests and needs its first smoke-to-regression coverage
- device tests fail intermittently on permission dialogs, keyboards, or animation states
- the team must choose (or defend) Maestro vs Appium for a new or inherited suite
- CI needs device runs wired (Firebase Test Lab, BrowserStack, Sauce Labs, or local emulator matrix)
- an existing Appium suite is unstable and nobody knows which parts are fixable vs structural

## Operating Principles

- **Maestro first, unless a named requirement says otherwise.** Flows are readable YAML a product person can review, setup is minutes, and startup/onboarding coverage lands the same day a build does. Choose Appium for: existing Java/JS suites, needing WebDriver-level grid scale (Selenium Grid/Appium Server devices), or lab integrations Maestro does not support - and write the reason down.
- **Selectors: accessibility ids, then text, never nest XPath.** `id:` (the `accessibilityIdentifier`/`viewId` the team set) survives refactors; deep XPath survives nothing.
- **The device is part of the test environment and must be tamed.** Animations off, fixed locale/timezone where the app cares, keyboard and permission dialogs handled explicitly (`runFlow` of an onboarding sub-flow, or explicit grant-before), one stated device profile per CI job.
- **Flows are the unit of coverage.** One flow per user-visible capability, named after it (`login.yaml`, `checkout.yaml`), composed with `runFlow` - not one mega-flow passing through six screens.
- **Smoke gates deploys; regression grows per risk.** Start with install+launch+login+one core path; add flows per `designing-functional-tests` risk ranking, not per screengrab.

## Workflow

1. **Pick the harness and say why.** Default Maestro (the `maestro` CLI drives YAML flows). Appium only for a stated reason (existing suite, grid scale, unsupported lab). If the choice is pre-made by the team, record it as the constraint and proceed.
2. **Prepare the environment once, deterministically.** Android: emulator images named in scripts, `adb` on PATH, animations disabled (developer settings or `platform-tools`), permissions via `adb pm grant` where needed. iOS: simulators require macOS hardware - state this constraint in the suite docs; Windows CI runs Android in the matrix, iOS on mac runners or a device cloud.
3. **Establish stable identifiers with the team.** Ask for/Fill in `accessibilityIdentifier` (iOS) and `viewId`/`resource-id` (Android) on the screens in scope; naming flows against accessibility ids doubles as an accessibility investment. Where a screen has no ids yet, `text` selectors are the temporary bridge, marked TODO.
4. **Write the smoke flow first.** Install (apk/ipa path from env), launch, assert the home state, run login (sub-flow via `runFlow`), one core action. `maestro test login.yaml` locally, quoted output.
5. **Handle the OS-owned interruptions explicitly.** Permission dialogs via `runFlow` onboarding/grant flows; keyboards via `hideKeyboard`; system sheets not app UI - each named in the flow, never waited on with a sleep.
6. **Grow regression by risk.** Per release risk, add flows for payments, deep states, and error paths; the flow set stays the coverage catalog (`.qa/` doc or suite README) so "what does mobile automation cover" has one answer.
7. **Wire CI with device strategy stated.** Local emulator matrix (Android), macOS runners or a device cloud for iOS, cloud labs (Firebase Test Lab/BrowserStack/Sauce) when real-device matrices matter. Artifacts: video/screenshots from the lab on failure, per `automating-ci-test-pipelines`.
8. **Determinism pass.** If a flow flakes, `diagnosing-test-failures` before any `wait`-flation: device automation flakiness is nearly always environment (animations, locale, another app's dialog) or a reappearing un-tamed state.

## If the maestro CLI is missing

Flows can be authored without the CLI (they are YAML), but **no run output may exist without a run**. Before anything else: install it - `curl -fsSL "https://get.maestro.mobile.dev" | bash` (the official installer), `brew install maestro` on macOS, and check the current platform matrix in the Maestro docs before promising Windows-native runs (WSL is the usual answer where unsupported). Then `maestro --version`, quoted.

If the CLI cannot be installed right now:

- author the flows and mark the run status explicitly: `run: not executed - CLI unavailable` in the coverage doc, never a green cell
- do not substitute claimable outputs: screenshots from a manual session are evidence of a manual check, not of a flow passing
- the environment prep (step 2) and identifier work (step 3) can proceed - they are prerequisites for whatever harness ends up running, including Appium

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "Maestro is a toy, we need a real framework" | The team writes zero Appium tests for a quarter. | Maestro for the first 80% of value; Appium at grid/suite-reuse scale, reason written down. |
| "XPath finds it, it works" | Refactor of a layout breaks 40 selectors overnight. | Accessibility ids; text as a marked temporary bridge. |
| "Add sleep for the dialog" | 5s x every test = minutes, and the flow still races the dialog. | `runFlow` the permission/onboarding flow explicitly. |
| "We'll run on device X manual-model in CI later" | iOS on Linux CI fails for hours on a Monday. | State the macOS/device-cloud constraint in the plan from day one. |
| "Run every flow on every device in the matrix" | CI hours explode and the signal drowns. | Smoke on the matrix; regression on one or two named device profiles, others via risk decision. |

## Red Flags

- XPath with 3+ levels anywhere in a flow.
- Sleeps around permissions, keyboards, or launch.
- A flow longer than ~30 lines covering "the whole app".
- Device state from previous run leaking in (logged-in user not reset).
- No accessibility ids anywhere - selectors are text or coordinates.
- iOS mentioned but no macOS anywhere in the plan (silent assumption it will be fine).

## Related Skills

- `designing-functional-tests` - the risk-ranked plan the flow set implements
- `diagnosing-test-failures` - root-cause class-first on the flake before touching the flow
- `automating-ci-test-pipelines` - matrix strategy, device labs, artifacts on failure
- `testing-auth-flows` - login sub-flow design
- `mobile-test-automation-expert` agent - hands this work off when available

## Definition of Done

This skill is complete when:

- the harness choice is stated with a reason (default Maestro; Appium only with a named justification)
- the smoke flow runs locally against a named device/emulator, with the run quoted
- selectors use accessibility ids (with any text-bridge TODOs marked), and the OS interruptions are handled explicitly, not with sleeps
- the device profile(s) per CI job are stated, and the iOS/macOS constraint is written in the suite docs
- the coverage catalog lists the flows against capabilities, so "what is covered" has one canonical answer
- a CI job (or a stated plan for one) runs the smoke on each deploy
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
