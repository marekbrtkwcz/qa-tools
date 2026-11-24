---
name: a11y-audit-deep-dive
description: Runs a structured accessibility audit of a page, a sampled set of templates, or a user journey, with findings mapped to WCAG 2.2 criteria, manual retest guidance, and technical or stakeholder-ready output. Use when a release, compliance review, or redesign needs more than a scanner pass, or when keyboard, focus, and dynamic-state behaviour across a flow must be checked. For a quick check of one URL, use the a11y-webpage-audit command. For the full stakeholder-ready flow audit with axe-core plus manual passes, use auditing-accessibility.
disable-model-invocation: true
---

# Accessibility audit - deep dive

## Who does the work

Hand this task to the `accessibility-expert` agent (`accessibility_expert` in Codex). If that agent is not installed, do the task yourself, following the steps below.

# Task

If the `auditing-accessibility` skill is installed, load it before starting.

Your goal is to perform a structured accessibility audit that goes beyond a quick scanner pass.

Ask for the minimum context you need:

- URL or user flow to audit
- auth details if the page is protected
- audit mode: quick triage, full page, or full journey
- output mode: technical report, business summary, or both
- compliance target, defaulting to WCAG 2.2 AA

If the requested scope covers more than one page, sample unique templates and critical journeys instead of pretending every page received the same depth of review.

When a live page is available:

1. Inspect the page or flow using Playwright for keyboard, focus, and interaction checks.
2. Review semantics, forms, dynamic states, zoom/reflow risks, and WCAG 2.2 additions such as target size and focus not obscured.
3. If automated tool output is available, normalize it into the report, but do not rely on it alone.
4. Deduplicate repeated findings and prioritize by user impact.
5. Produce:
   - a short summary
   - findings mapped to exact WCAG criteria
   - an issue table when technical detail is requested
   - quick wins vs structural fixes
   - a manual retest checklist
   - a stakeholder summary when the chosen output mode requires it

## Constraints

- Use the exact official WCAG 2.2 success criterion names.
- Do not report SC 4.1.1 Parsing.
- If confidence is low because a manual or assistive-technology check could not be completed, say so explicitly.
- Audit only sites the user owns or is authorized to test. Do not submit forms, complete purchases, or change account data without explicit confirmation; use test accounts.
- Stop when every sampled page or journey step has been reviewed, or when access (auth, environment) blocks further review; list what was not reviewed.

## Output format

Return Markdown only.
Use a technical report style that is actionable for both testers and developers.
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
