---
name: auditing-accessibility
description: 'Performs webpage and user-flow accessibility audits against WCAG 2.2: an automated axe-core pass, manual keyboard, screen-reader and visual checks, findings mapped to exact success criteria, prioritized remediation, and stakeholder-ready summaries. Use when auditing accessibility on a URL or flow, triaging suspected a11y issues, or producing technical findings with practical next steps. For a sign-off record of a pass already done, use attesting-manual-verification. For a quick single-URL check use a11y-webpage-audit; for a deep multi-page journey or release audit use a11y-audit-deep-dive; for native mobile apps use auditing-mobile-accessibility.'
argument-hint: 'URL or flow, scope mode, auth context if needed, and whether you want quick triage or a full audit'
user-invocable: true
---

# Auditing Accessibility

Use this skill for accessibility reviews that go beyond a quick lint-style pass.
It helps structure a full audit so findings are grounded in user impact, mapped to WCAG 2.2, and prioritized for remediation.

## When to Use

- audit a single page or end-to-end user flow for accessibility
- sample multiple templates or a high-risk journey across a product
- triage suspected accessibility issues before filing tickets
- produce a technical audit report for a team
- produce a business-facing summary for stakeholders or release leads
- create a retest checklist after accessibility fixes
- combine manual checks with Playwright or automated tool output

## Audit Principles

- **User impact over raw counts** - ten minor issues do not outweigh one blocker.
- **Automated output is a lead, not a verdict** - confirm important findings manually when possible.
- **Native semantics first** - missing semantics, labels, and keyboard access usually matter more than ARIA cleverness.
- **One finding, one problem statement** - deduplicate repeated symptoms into a single actionable issue.
- **Exact criterion names** - use the official WCAG 2.2 success criterion wording.
- **Do not report SC 4.1.1 Parsing** - it is not part of WCAG 2.2.

## Workflow

### Phase 0: Choose the audit mode

Pick the lightest mode that matches the request:

- **Quick triage** - short signal check for likely blockers and fast wins
- **Full page audit** - one page with deeper manual verification
- **Journey audit** - a user flow across multiple pages or states
- **Site sampling** - a representative pass across unique templates and critical journeys

If the user did not choose, infer the mode from the scope and explain what will be covered.

### Phase 1: Frame the scope

Clarify:

- URL or page set
- authentication or special setup
- target standard, defaulting to **WCAG 2.2 AA**
- output mode: technical report, business summary, or both
- devices or browsers that matter most
- whether the audit is browser-only or should also use code/workspace clues when available
- known high-risk components such as forms, dialogs, menus, drag-and-drop, or rich text editors

### Phase 2: Run the review passes

Start with an automated pass, then do the manual passes it cannot replace. Automated rules catch roughly a third of WCAG issues (missing names, contrast, invalid ARIA) and none of the ones about whether the flow makes sense.

```ts
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();
```

Run it per state (dialog open, error shown, logged in), not only on page load; `.include(selector)` scopes it to a component. Every violation is a lead to confirm and deduplicate in Phase 3, not a finding as is.

Then cover the page or flow through these passes:

1. **Structure and semantics** - landmarks, headings, lists, labels, names, roles
2. **Keyboard and focus** - reachability, order, focus visibility, traps, dialog behavior
3. **Forms and validation** - labels, instructions, error identification, error recovery
4. **Dynamic behavior** - menus, accordions, modals, toasts, live updates, state announcements
5. **Visual accessibility** - contrast, zoom/reflow, hidden content, motion, target size
6. **Media and alternatives** - alt text, transcripts, captions, decorative handling
7. **Localization and RTL** - `dir`/`lang` correctness, focus order after mirroring, long-string overflow, translated labels and errors (see the RTL section of `./resources/manual-a11y-checklist.md`; an LTR-only audit covers half the product when an RTL build ships)

For WCAG 2.2 work, explicitly check:

- 2.4.11 Focus Not Obscured (Minimum)
- 2.5.7 Dragging Movements
- 2.5.8 Target Size (Minimum)
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication (Minimum)

**If axe-core is not installed** (`E: Cannot find module '@axe-core/playwright'` or the equivalent): add it with `npm i -D @axe-core/playwright` - it is a dev dependency of the test project, not a system install. If packages cannot be installed right now, the browser extension pass (axe DevTools) still produces leads, but:

- label the result **extension triage**, not an automated pass - it ran on one rendering, in one browser, on whatever state the person was looking at, and those facts change the finding's weight
- the report states the tool actually used; a report that says "automated axe-core pass" when an extension was used is a fabricated method section
- the retest checklist (`./resources/manual-a11y-checklist.md`) does not need any tool and can run in full regardless

### Phase 3: Normalize findings

For each issue, capture:

- location or affected component
- user impact
- exact WCAG criterion
- severity: critical, high, medium, or low
- evidence or verification notes
- remediation direction

If a tool reports the same issue repeatedly, merge it into one finding with a broader affected scope.

### Phase 4: Produce the audit output

Use `./resources/accessibility-audit-template.md` when possible.

A complete report should include:

- scope and method
- overall risk summary
- prioritized findings
- quick wins vs structural fixes
- manual retest checklist

If the audience is not primarily developers, use `./resources/business-a11y-summary-template.md` to produce a shorter stakeholder-facing summary focused on user impact, delivery risk, and next-step decisions.

If the audit is intentionally lightweight, say so clearly and label the result as triage rather than full certification-grade review.

### Phase 5: Close the loop

Before finishing, identify:

- fixes that can be validated quickly
- findings that need human retest with assistive technology
- areas that should become automated accessibility checks later

## Multi-page Sampling Strategy

When the request covers more than one page or a larger product surface:

- include at least one representative page for each unique template or interaction pattern
- always include critical journeys such as authentication, core conversion, and error recovery when they exist
- prioritize reusable shared UI such as navigation, forms, dialogs, and account flows
- state clearly what was sampled and what was excluded

Sampling is valid when the scope is explained honestly. Do not imply full-site certification from a template sample.

## Reporting Modes

Choose the output mode that matches the audience:

- **Technical report** - for designers, developers, and testers who need concrete findings and remediation direction
- **Business summary** - for leads and stakeholders who need risk, scope, and priority without deep implementation detail
- **Both** - when the work needs a technical appendix plus a short decision-friendly summary

If the user does not specify, default to the technical report.

## Criterion Naming Rules

- Use the exact official WCAG 2.2 success criterion wording
- Keep the criterion number and title together, for example `2.4.7 Focus Visible`
- Do not paraphrase criterion titles in the main findings table

## Common Failure Modes

- relying only on automated tool output
- reporting contrast or keyboard issues without describing the user impact
- citing WCAG numbers loosely or with the wrong criterion name
- flooding the report with duplicates from repeated components
- auditing only the default LTR locale when an RTL or localized build ships, leaving mirroring and overflow findings out of the report
- calling the audit complete without a clear scope statement

## Resource Map

- `./resources/accessibility-audit-template.md` - technical report structure for findings and remediation
- `./resources/business-a11y-summary-template.md` - shorter summary for release leads, PMs, and stakeholders
- `./resources/manual-a11y-checklist.md` - portable checklist for manual verification and retest

## Related Skills

- `designing-functional-tests` - when the audit should expand into manual regression coverage
- `reporting-bugs` - when individual findings need to be split into defect tickets
- `requirements-test-coverage-mapper` - when accessibility requirements must be traced systematically across a feature set
- `attesting-manual-verification` - when the manual or assistive-technology pass must be recorded as dated sign-off evidence
- `running-visual-regression-tests` - when the concern is appearance rather than semantics or operability

## Definition of Done

This skill is complete when:

- the audit scope is explicit
- the automated pass ran on each audited state, with the tool and rule tags stated in the report
- findings are mapped to exact WCAG 2.2 criteria
- duplicates are merged into clear issues
- user impact and remediation direction are both visible
- the final output makes next steps obvious for testers and developers
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
