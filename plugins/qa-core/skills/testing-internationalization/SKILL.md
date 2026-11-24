---
name: testing-internationalization
description: 'Tests internationalization and localization of an application: locale switching, translation completeness and quality, date, time, number and currency formatting per locale, right-to-left layouts, pluralization and gender rules, and fallback behaviour for missing translations. Use when an app ships in more than one language or locale, when a locale-specific bug is reported, or when RTL support is being added.'
argument-hint: 'Supported locales and their fallback chain, the locales in scope for this pass, and whether pseudo-localization is available'
user-invocable: true
---

# Testing Internationalization

Use this skill when a product works in more than one language or locale and "works in English" is not the same as "works everywhere". Most i18n defects are not missing translations but wrong assumptions: a date parsed the American way, a currency symbol in the wrong place, a layout that breaks when text runs right-to-left.

## When to Use

- the application supports multiple languages or locales
- a new locale or RTL language is being added
- a bug report smells locale-specific (wrong date, wrong amount, truncated label)
- translation files are community- or vendor-supplied and need verification
- pseudo-localization is used in CI and needs a manual pass on top

## Operating Principles

- **Test the locale, not the language.** `en-GB` and `en-US` differ in dates and units; `zh-CN` and `zh-TW` differ in more than script. Always test concrete locales.
- **Formatting is behaviour.** Date order, decimal separator, currency placement, and calendar system are correctness, not cosmetics.
- **Fallbacks must be deliberate.** A missing key falling back to English silently is a product decision; verify it is the intended one, per key.
- **Text expansion breaks layouts.** German and Finnish routinely need 30–50% more width than English. Check truncation, wrapping, and overflow, not just translation presence.
- **RTL is a layout direction, not a translation.** Mirroring, number direction, and mixed-direction strings need explicit checks.

## Workflow

### Phase 1: Define the locale matrix

Record for each locale in scope: language tag (BCP 47), fallback chain, and which parts of the app are translated (UI strings, emails, legal text, user-generated content — UGC is usually not translated). Confirm the matrix matches what the product actually claims to support; unsupported locales rendering half-translated UI is a finding.

### Phase 2: Translation completeness and quality

- run or inspect the translation coverage report: missing keys, untranslated segments, empty strings, keys that are the same as the source (suspicious placeholders)
- check for hardcoded strings in code and templates (search for user-facing literals outside resource files)
- verify context: strings with placeholders (`{name}`, `{count}`) render correctly with real values, including edge values (0, 1, very large numbers)
- check pluralization rules per locale (English has 2 forms, Polish 3, Arabic 6) using 0, 1, 2, 5, and a large number
- check gendered strings if the locale requires them

### Phase 3: Formatting per locale

For each locale in scope, verify with known input values (`./resources/formatting-checklist.md`):

- dates and times: order, separator, 12/24-hour clock, timezone display, relative dates ("yesterday")
- numbers: decimal and thousands separators, percent
- currencies: symbol placement, symbol vs code, negative amounts, zero
- units and measurements, if localized
- sorting and collation: diacritics, case, locale-specific alphabets

### Phase 4: Layout and RTL

- switch locale at runtime and after reload; the choice must persist and apply without a stale cache
- check truncation, wrapping, and overflow with the longest expected strings (use pseudo-localized long strings if available)
- for RTL locales: layout mirroring, text alignment, icon direction, progress direction, mixed LTR/RTL content (e.g. Latin brand names in Arabic text), numbers inside RTL text
- check that inputs accept and display RTL text correctly

### Phase 5: Fallback behaviour

- remove or break a translation key in a test environment and verify the fallback chain works per key, not just globally
- verify untranslated user-generated content is left as-is, not machine-translated or mangled

### Phase 6: Report

Findings grouped by locale and category (missing translation, wrong format, layout break, fallback bug), each with locale tag, screenshot or payload, and expected vs actual. Use `reporting-bugs` for the individual defects.

## Resource Map

- `./resources/formatting-checklist.md` - concrete values to test per locale for dates, numbers, currencies, plurals. Read during Phase 3.

## Related Skills

- `designing-functional-tests` - when i18n scenarios belong in the general functional plan
- `testing-documentation` - when user-facing docs exist per locale
- `running-visual-regression-tests` - when locale switching is part of the visual baseline set
- `testing-application-security` - locale-based header injection (`Accept-Language`) is an input-validation concern
- `reporting-bugs` - for filing the individual i18n defects found

## Definition of Done

This skill is complete when:

- the locale matrix matches the product's claimed support, per locale with its fallback chain
- every in-scope locale passed the formatting checklist for dates, numbers, currencies, and plurals
- translation coverage was checked for missing keys, placeholders, and hardcoded strings
- runtime locale switching persists and applies across the app
- RTL layout was verified for at least one RTL locale, including mixed-direction content
- fallback behaviour was verified per key, not assumed
- findings are filed with locale tag, expected vs actual, and evidence
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
