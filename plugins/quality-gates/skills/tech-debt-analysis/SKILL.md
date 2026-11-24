---
name: tech-debt-analysis
description: "Analyzes technical debt in codebases, test suites, architecture, dependencies, and delivery workflows from observable signals, and produces a prioritized register and remediation roadmap with severity, risk, effort, and ROI. Use when auditing repository health, explaining slow delivery or flaky tests, planning refactoring, or deciding what to fix now versus defer. For skipped checks and expired waivers, use governing-quality-waivers; for code nobody on the team understands, use assessing-comprehension-debt."
argument-hint: "Repository scope, system type, current pain points, and desired output"
user-invocable: true
---

# Technical Debt Analysis

Use this skill when a user needs to understand the technical debt in a codebase, test suite, architecture, or delivery process.
It is designed for evidence-driven analysis that surfaces the real drivers of delivery drag, quality risk, and maintenance cost, rather than relying on intuition or vague impressions. The output is a structured report that prioritizes debt items based on severity, remediation risk, effort, and ROI, with actionable recommendations for next steps. 

## When to Use

Use this skill when the user asks for things like:

- "audit this repository for technical debt"
- "why is delivery slowing down in this codebase?"
- "identify the biggest quality risks before we refactor"
- "analyze why our tests are slow, flaky, or hard to maintain"
- "prepare a technical debt roadmap for the next quarter"
- "what should we fix now versus consciously defer?"

Typical scenarios:

- repo-wide health assessment
- module-specific debt audit
- test-suite debt analysis
- pre-migration or pre-upgrade assessment
- roadmap planning for refactoring and quality work

## Analysis Principles

- **Evidence before verdict** - observable signals come first; conclusions come second
- **Debt is a trade-off, not a moral failure** - explain the cost, not just the flaw
- **Root cause over symptom** - identify why the debt exists, not only where it hurts
- **Risk-aware, not risk-averse** - high-risk debt should be surfaced, not politely ignored
- **Incremental remediation** - prefer staged fixes with safety nets over heroic rewrites
- **Test debt is first-class debt** - unreliable tests damage delivery as much as bad production code
- **Explicit uncertainty** - if context is missing, state assumptions rather than bluffing

## Analysis Workflow

Follow these phases in order.

### Phase 0: Frame the analysis

Before scanning the codebase, clarify:

- scope: whole repository, subsystem, module, or test layer
- audience: engineering team, tech lead, QA lead, staff engineer, or management
- goal: awareness, prioritization, roadmap planning, release risk, or refactor planning
- constraints: legacy boundaries, compliance, time pressure, "no refactor now", or team capacity
- pain signals: regressions, slow CI, flaky tests, upgrade blockers, onboarding friction, or architecture sprawl

If some information is missing, infer carefully and list assumptions explicitly.

### Phase 1: Collect evidence and context

Never start by assigning debt labels from instinct.

Read the repository context first:

- README and architecture or onboarding docs
- package manifests and dependency files
- build, test, and lint scripts
- CI workflows and quality gates
- directories with concentrated complexity or churn
- TODO / FIXME / HACK markers and repeated workarounds

Use `./resources/debt-taxonomy.md` as the primary scanning lens.

When the target includes automated tests, also load `./resources/test-debt-catalogue.md`.

Capture evidence such as:

- duplication, complexity, or coupling signals
- flaky, slow, or weak tests
- dependency age, version gaps, or blocked upgrades
- fragile pipelines and noisy feedback loops
- missing ownership, docs, or operational knowledge

If no evidence exists, record an assumption or unknown - not a debt item.

### Phase 2: Turn signals into atomic debt items

Each debt item should be specific and scoped.

For every candidate item, capture:

- category
- location
- symptom
- observed evidence
- probable root cause
- risk of leaving it unfixed
- risk of fixing it now
- likely impact on quality, testing, delivery, or maintainability

Avoid vague findings such as "the code is messy" or "tests need improvement."
Each item should describe a distinct problem with a distinct consequence.

### Phase 3: Score and prioritize

Use `./resources/prioritization-matrix.md` for scoring.

Each meaningful item should be assessed using:

- **Severity** - how dangerous or costly the debt is today
- **Risk** - how risky remediation will be
- **Effort** - likely change size and coordination cost
- **ROI** - expected value of addressing it
- **Time horizon** - tactical, short-term, or strategic

Then group items into practical buckets:

- **Fix Now** - active drag or high-risk exposure
- **Fix Soon** - important, but needs some preparation
- **Accept for Now** - consciously deferred with clear rationale

Do not treat all debt as equally urgent.

### Phase 4: Design remediation options

For the top-priority items, propose the safest realistic path:

- minimal viable fix
- staged refactor plan
- containment strategy when full remediation is not viable yet

Good remediation advice includes:

- safety nets required first
- sequencing and prerequisites
- rollback or escape hatch
- how to validate improvement

Prefer reversible steps unless the user explicitly asks for a larger redesign.

### Phase 5: Produce the output

Use `./resources/technical-debt-report-template.md` for the default deliverable.

Default output modes:

- **Repository or module audit** → create `TECHNICAL_DEBT_REPORT.md`
- **Quick advisory audit** → produce a shorter inline summary, but still include top drivers, debt register highlights, and recommended priorities
- **Test debt focus** → preserve the same structure, with an explicit test-debt section and CI/test-confidence impact

If the user asks for an example of the target output, use `./resources/example-technical-debt-report.md`.

### Phase 6: Self-check before finalizing

Before delivering the report, verify:

- every important debt item has concrete evidence
- categories are used consistently
- the biggest risks are near the top
- test and quality impact are explicit, not implied
- remediation advice is incremental and believable
- deferred debt is documented consciously, not forgotten silently

## Useful Heuristics

Debt is often hiding when you see patterns like:

- repeated TODOs, FIXMEs, retries, or workaround comments in the same area
- CI or tests that fail noisily but provide little diagnosis
- abstractions that reduce duplication while increasing confusion
- outdated dependencies that block security or platform upgrades
- a feature that requires touching too many files for a small change
- onboarding that depends on tribal knowledge rather than documented flows
- tests that pass often enough to be tolerated, but not enough to be trusted

## Resource Map

- `./resources/debt-taxonomy.md` - analysis lenses, categories, and signal guide
- `./resources/prioritization-matrix.md` - scoring rubric and decision buckets
- `./resources/technical-debt-report-template.md` - standard report structure for debt audits
- `./resources/example-technical-debt-report.md` - example filled report
- `./resources/test-debt-catalogue.md` - focused anti-pattern catalogue for automated test suites

## Related Skills

- `code-review-advanced` - for reviewing a specific change instead of mapping broader debt
- `static-code-analysis-typescript` - when the main issue is linting, formatting, or TypeScript quality gates
- `requirements-test-coverage-mapper` - when the problem is coverage traceability rather than debt discovery
- `governing-quality-waivers` - when the debt is skipped tests, disabled rules, and waivers with no owner or expiry
- `assessing-comprehension-debt` - when the risk is code the team cannot explain rather than code that is hard to change
- `unslop-tests` - when test debt needs a test-by-test audit with each finding proven by execution

## Definition of Done

This skill is complete when:

- scope, audience, goal, and the assumptions made in place of missing context are stated at the top of the output
- every debt item has a location, observed evidence, a probable root cause, and the risk of leaving it and of fixing it
- items with no evidence are listed as unknowns, not as debt
- each item is scored with `./resources/prioritization-matrix.md` and placed in Fix Now, Fix Soon, or Accept for Now
- every Accept for Now item has a written rationale
- the top Fix Now items have a remediation path with the safety net that must exist first and how improvement will be measured
- test debt is reported explicitly when the scope includes tests, or its absence from scope is stated
- the report is saved as `TECHNICAL_DEBT_REPORT.md`, or delivered inline for a quick advisory audit, following `./resources/technical-debt-report-template.md`
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
