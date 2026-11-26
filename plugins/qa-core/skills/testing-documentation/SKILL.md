---
name: testing-documentation
description: 'Tests docs and onboarding the way its audience consumes it: follows setup and onboarding steps verbatim in a clean environment and records every step that fails, misleads, or assumes undocumented knowledge - READMEs, quick-starts, runbooks, and the product''s own error messages. Produces a per-step findings table with quoted doc lines and actual results. Use when a repo is about to onboard new people, docs must be re-verified after a big change, or docs are suspected of lagging behind the product. Test-suite docs: documenting-test-suites. API schema conformance: testing-api-contracts.'
argument-hint: 'The doc artifact to verify, its intended audience, and how clean an environment is available'
user-invocable: true
---

# Testing Documentation

Use this skill to test documentation as a product: a new user follows it word for word in a clean environment, and every place where reality disagrees with the doc becomes a finding with evidence.

Documentation is the highest-leverage manual test surface in most repos: it is the first thing every newcomer executes, it breaks silently on every code change that touches setup, and nobody notices until the next hire loses a day to it. This skill is how that gets noticed before the next hire.

## When to Use

- A repo or product is about to onboard new people and docs must work for them
- Docs must be re-verified after a big change
- User-facing docs are suspected to lag behind the product
- Testing documentation as a product: following it word for word in a clean environment

## When NOT to Use

- Writing or restructuring docs for a test suite - `documenting-test-suites` owns that deliverable; this skill only verifies what docs claim against reality.
- API response conformance to OpenAPI - `testing-api-contracts`.
- Verifying that a doc's *content* matches requirements (was the right thing documented) - `review-requirements`; here the question is whether documented steps actually work.
- API reference generation - generated references drift less when generated well; this skill targets hand-written prose paths.
- Internal UX or copy style - out of scope; only readability of error states as the final fallback doc of the product is in scope (step 5).

## Procedure

### 1. Frame the pass

- Pick **one artifact** and read its own claim about the audience and time: a README quick-start promising "running in 5 minutes", a runbook promising "restore from backup", an onboarding guide promising "your first test case".
- Write down both before starting: what would a clean environment mean for you (fresh clone, fresh container, fresh account - state upfront), and the maximum time you will give the doc's promise before considering it misleading.
- Environment hygiene: residual state matters more here than anywhere else - run in the cleanest environment available, otherwise every step that relies on prior configuration will pass and later fail on a real newcomer's machine.

### 2. Follow verbatim

- Execute the doc as written, no shortcuts, no consulting internal knowledge: **copy-paste every command; trust every path; assume nothing extra exists.**
- Never fix silently. When a step fails and you know the fix, that is the finding's content - do not fix and continue; note the exact quote, then continue (a fix applied silently hides the finding from the next reader).
- Note the doc location (section, line) for every step, not just failures - the report needs the step count as denominator ("steps 1-14: 11 passed, 2 broken, 1 misleading").
- When a step cannot be attempted (prerequisite not provided by the doc or your environment), mark it SKIPPED with the reason.

### 3. Classify each failure

- **Broken** - the step's command or action errors; evidence: the exact error output. Swapped args, changed flags, renamed paths.
- **Misleading** - the step executes but teaches a wrong mental model, or looks right and silently produces something else other than claimed ("test suite green" while 0 tests collected). Evidence: the actual vs. the documented outcome.
- **Missing** - a prerequisite, version constraint, or config value the doc needed but never stated; the newcomer gets an error whose fix lives only in tribal knowledge. Evidence: the error that resulted.
- **Outdated** - content still true of an old version but false of the current one (old flags, old URLs, renamed things). Evidence: current-behavior proof.
- **Audience mismatch (internal)** - step requires knowledge or access the stated audience cannot have (internal hostnames, credentials, jargon); evidence: the step plus the audience definition from step 1.

### 4. Record per failing step

For each finding: doc location + quoted line, what you did, actual result with evidence (error output verbatim, screenshot), classification (step 3), and the smallest fix hint (a suggestion, so the docs owner can fix fast - not a rewrite).

### 5. Error-message readability (the product's last doc)

The product's own error messages are the documentation users actually read on their worst day. Trigger the errors the doc warns about (or that occurred naturally), and check each message carries: **what happened, likely cause, what to do next**. Name findings that are just codes or blame-the-user prose ("invalid input" with no field named). Do not judge tone beyond that; this is triage, not copywriting.

### 6. Report and route

One table (template below), findings ordered by how early in the doc they block a newcomer (a broken step 2 outranks a broken step 14 - victims decrease with depth), then:

- broken/misleading/missing items → the docs repo as issues or PRs (each has a quoted line; PRs are often smaller than the discussion to write) - via `handling-sensitive-test-data` rules if screenshots capture real data
- error-message findings → `reporting-bugs` tickets for the product
- runbook/ops findings → `tech-debt-analysis` items when the fix is structural (the runbook was wrong for years, not a typo)

## Report template

```markdown
# Documentation test: <artifact> for <audience>
Date: <date>   Clean env: <what was fresh>   Doc promise: <"running in 5 min"?>   Actual: <time>
Steps: 1-<n>   Verdicts: <x passed, y broken, z misleading, w missing, v outdated, u skipped>

| # | Doc location | Quoted line | Actual result | Class | Fix hint |
|---|--------------|-------------|---------------|-------|----------|
| 4 | README "Setup" | `npm run bootstrap` | ENOENT script | Broken | script renamed to `setup` in 0.9 |
| 7 | README "First test" | "you will see 3 passing" | 0 tests collected | Misleading | collector ignores *.spec.ts by default |
```

## Decision Rules

**Prefer a fresh container/VM over your daily environment when:** any doubt exists about leftover config - the pass is only as good as its environment is newcomer-like.

**Prefer full runs when:** ever possible - complete runs, even with failures, produce verdict percentages; stopping after a failing step is only justified when the environment becomes unusable.

**Prefer PRs over issues when:** the fix is mechanical (typos, renamed commands) - the issue thread costs the docs owner more than a review.

**Prefer measuring the doc's promise when:** the doc states a time or outcome ("5 minutes", "you will see...") - comparisons like "promised 5 min, took 43" are the strongest findings a doc can get.

**When time-boxed:** cover the doc's primary path first; appendices, troubleshooting and FAQ sections second; a verified primary path is the finish line, a verified appendix is a bonus.

## Related Skills

- `documenting-test-suites` - writing the docs this skill then verifies
- `testing-api-contracts` - the API-reference counterpart (spec conformance, not prose)
- `reporting-bugs` - for product-side findings (error states)
- `manual-release-testing` - the release pass that shares the clean-environment discipline; install docs fail there too
- `handling-sensitive-test-data` - screenshots and outputs may contain real data
- `tech-debt-analysis` - for structurally stale docs, not typos

## Definition of Done

- [ ] Artifact, audience, and environment cleanliness recorded before the run
- [ ] Every step executed verbatim or marked SKIPPED with reason
- [ ] Each failing step has: location, quoted line, actual result, evidence, class, fix hint
- [ ] Findings routed: docs fixes vs. product bugs vs. debt items
- [ ] The doc's own promise (time, outcome) checked and reported against
- [ ] A newcomer-blocking step 1-3 cannot remain unreported at pass end

## Example prompts

- `/testing-documentation test the README quick-start as a new developer, fresh clone`
- `/testing-documentation verify the onboarding guide still works after the 2.0 migration`
- `/testing-documentation run through the restore-from-backup runbook and time it`
- `/testing-documentation check whether our error messages tell a lost user what to do next`
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
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
