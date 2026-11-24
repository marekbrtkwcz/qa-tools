---
name: testing-web-performance
description: 'Tests frontend web performance: Core Web Vitals (LCP, INP, CLS) measured in a lab and from real users, Lighthouse CI budgets, bundle size and waterfall analysis, and render-blocking resources. Use when pages feel slow, when a release regresses load time, or when Core Web Vitals budgets must be enforced in CI.'
argument-hint: 'The URLs or flows in scope, the performance budget (CWV thresholds, bundle size), and whether RUM data is available'
user-invocable: true
---

# Testing Web Performance

Use this skill when "the page loads slowly" needs to become numbers and a CI gate. Backend load testing (`testing-performance-and-load`) covers the server under many users; this skill covers what one user experiences on one page load. Both are needed — they fail for different reasons.

## When to Use

- Core Web Vitals regress after a frontend change
- a performance budget (LCP/INP/CLS, bundle size) exists or must be created and enforced in CI
- Lighthouse scores drop and nobody knows which change caused it
- bundle size grows release over release

## Operating Principles

- **Measure CWV, not just "load event".** LCP (loading), INP (interactivity), CLS (visual stability) — the three user-facing vitals; lab (Lighthouse) plus field data (RUM/CrUX) when available.
- **Budgets are gates, not reports.** A budget that never fails CI is decoration; wire it to block the PR.
- **Find the cause, not the symptom.** A slow LCP is usually one big image, render-blocking CSS/JS, or a slow API the page waits on — trace the waterfall.
- **Test the critical pages, not the whole site.** Landing, search, product/checkout, dashboard — where users feel pain.
- **Repeat measurements.** Single runs are noisy; take medians of several runs on a fixed environment.

## Workflow

### Phase 1: Define budgets and scope

- per critical page: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (good thresholds); bundle size budget per chunk
- tools: Lighthouse CI / Playwright with performance tracing; RUM if available

### Phase 2: Baseline the critical pages

Work through `./resources/web-perf-checklist.md`:

- measure CWV per page (median of 5 lab runs on a fixed throttled profile)
- record bundle sizes per chunk; waterfall per page

### Phase 3: Find regressions

- compare against baseline on every frontend change in CI; on breach, bisect to the change
- analyze: biggest LCP element and its cause (image size/format, late-discovered, render-blocking), INP long tasks (which JS), CLS (which element shifts)
- third-party scripts and fonts are common culprits — check waterfall

### Phase 4: Enforce and report

- Lighthouse CI (or equivalent) in the pipeline with budget assertions failing the build
- trend CWV and bundle size over releases (`tracking-quality-trends`); alert on drift even within budget
- report per page: CWV lab + field, bundle delta, top issues with causes

## Resource Map

- `./resources/web-perf-checklist.md` - the CWV thresholds, measurement protocol, and regression-analysis steps. Read during Phases 2–3.

## Related Skills

- `testing-performance-and-load` - server-side load testing
- `running-visual-regression-tests` - CLS-adjacent visual checks
- `automating-ci-test-pipelines` - Lighthouse CI wiring
- `tracking-quality-trends` - CWV/bundle trends over releases

## Definition of Done

This skill is complete when:

- CWV budgets defined per critical page and measured (lab median, field if available)
- CI fails the build on budget breach, with the offending resource identified
- bundle size tracked per chunk with a budget
- baseline vs current comparison produced per release with causes for regressions
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
