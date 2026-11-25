---
name: security-regression-smoke
description: 'Builds and runs a repeatable security smoke pack over the core of an authorization matrix: for every change touching auth, permissions, or session handling, a scripted cross-role pass proves the high-signal protection paths still hold. Produces a dated run record with per-path verdicts, plus wired triggers - run after any diff tagged auth or modified-auth. Use when access control changes merge regularly, when the one-off authz audit keeps aging, or when an incident demands evidence the core paths were recently rechecked. For the full authorization audit use testing-application-security; for scoping what else a change can break use analyzing-regression-scope.'
argument-hint: 'The authorization matrix or its source, environments with seeded role accounts, and how security changes usually arrive (PRs, releases, incidents)'
user-invocable: true
---

# Security Regression Smoke

Use this skill to turn the one-off authorization audit into something that runs in minutes after every security-relevant change - before the incident forces it.

`testing-application-security` builds the full authorization matrix once. This skill prunes that matrix to a **smoke core**: a fixed, small set of protection paths that carries most of the broken-access-control risk, scripted so it can run identically every time, and wired to triggers so it actually gets run.

A smoke pack nobody runs after changes is decoration - the whole design below optimizes for "runs in under 10 minutes, everywhere a risky change lands".

## When to Use

- Access control changes merge regularly and the one-off authz audit keeps aging
- An incident demands evidence the core protection paths were recently rechecked
- A repeatable, scripted cross-role smoke pass is needed after every auth-touching change

## When NOT to Use

- The first, full authorization audit of a system - `testing-application-security`; the smoke core is pruned *from* that matrix.
- One suspicious finding to investigate - `planning-exploratory-testing` or a security charter; the smoke pack answers "do the known-critical paths still hold".
- Capacity, rate limits, lockouts - `testing-abuse-limits`.
- Deciding what else a change can break functionally - `analyzing-regression-scope`; this pack covers protection paths only.

## Procedure

### 1. Prune the matrix to a smoke core

From the full authorization matrix (build it with `testing-application-security` first if it does not exist), select the paths with the highest broken-access-control signal:

- for each critical resource: a legitimate user's own-path (user A reads A's record) and each of its cross-role negatives (user B reads A's record, user B writes A's record, anonymous reads A's record)
- session boundaries: expired token, logged-out session, downgraded role - each against one protected endpoint
- privilege boundaries: regular user against one admin-only action, and against another tenant's data (multi-tenant systems)

Budget the core hard: **15 paths maximum**. A core that grows past that stops running after every change and becomes another aging audit with extra steps. Every path cut from the core stays in the full matrix - the core is the part that must survive every change.

Each path gets a stable ID (`SMK-AUTH-001`...), which keeps run records comparable across time (`standardizing-test-records`).

### 2. Build the environment

- pre-seeded accounts: `user-a`, `user-b`, `admin`, `anon` - same credentials every run, no interactive login flows inside the pack itself
- fixture data with known ownership: record-X owned by `user-a`, remembered by ID; batch/bulk endpoints carry a known mixed-ownership payload
- a reset script (or disposable containers) so every run starts identical - state left by yesterday's run makes verdicts lie
- an isolated environment: the pack authenticates as users and tries things; it has no business near production, and the authorization gate rules of `testing-application-security` apply to its setup too

### 3. Script the pack

One path = one mechanical check, assert **server-side denial**, never just absent UI:

- each path makes one request (or the shortest chain) with `user-b`'s token against `user-a`'s resource
- the assertion is the server verdict: `403`/`401` (or a 200 whose body provably contains no cross-user data - but prefer explicit denial, silent emptiness hides failure)
- assert the *audit trail* where one exists: the denial should produce its log event, and a path that succeeds without one is its own finding (observability gap)
- UI-level smoke of the same paths is legitimate as a *second* layer (does the UI hide what the API denies?) - but the API layer is the verdict layer

The pack is test code: hardcoded token literals, swallowed errors, and green-by-default assertions are exactly the anti-patterns `unslop-tests` exists for. Hook coverage: the file-tool guards apply to it like to any test code.

### 4. Wire the triggers

The pack earns its existence by running, not by existing. Wire it to:

- **any change tagged `auth`, `modified-auth`, or `removed-guard`** (`scoping-change-relevance` produces these tags from diffs - the pack is their natural consumer)
- release day, as a fixed item in the release checklist (`manual-release-testing`)
- post-security-incident, as the first "what still holds" answer a coordinator needs

A run takes minutes; if it takes longer, cut paths - the trigger list above only works while running the pack is cheaper than arguing whether it is needed.

### 5. Record the run

Per run: date, environment, smoke-core version, per-path verdict (✅ denied / ❌ not held / 🚧 blocked), evidence for every ❌. The run record format is the RES record type (`standardizing-test-records`); FAILs go to `reporting-bugs` with the request/response pair quoted.

A ❌ on the smoke core is release-blocking by definition - that is what putting a path in the core means.

### 6. Govern the core

- adding or removing paths from the core is a reviewed change with a version bump of the core spec (the IDs stay stable across versions; retired IDs are never recycled)
- paths skipped in a run get a reason and an owner in the record - the `governing-quality-waivers` rules apply verbatim
- **rotation**: occasionally re-run the full matrix (`testing-application-security`) - the smoke core proves the critical paths hold, only the matrix proves nothing else rotted

## Decision Rules

**Prefer explicit denial over silence when scripting assertions:** `200` with empty data passes a naive assertion while the access control is gone; require evidence of denial, or the pack lies green exactly when it matters most.

**Prefer scripted API requests over UI automation in the pack:** UI flows carry their own flakiness budget; protection paths are API-verdict questions. Add UI checks as a separate optional layer.

**Cut paths instead of skipping runs when time-boxed:** if a change needs an answer now and the pack is slow, trim the core permanently - a fast 10-path pack beats a 30-path one nobody runs.

**Investigate one-off anomalies with the charter, not with the pack:** the pack's answer vocabulary is PASS/FAIL on known paths; genuinely new suspicion needs exploration (`planning-exploratory-testing`), and boiler-plating it into the pack bloats the core.

**Evaluate logs equal to behavior:** a denial without its audit event is a finding worth filing, not a PASS with an asterisk - silently-enforced access control is invisible when it breaks.

## Related Skills

- `testing-application-security` - the full matrix the core is pruned from, and the audit to re-run on rotation
- `scoping-change-relevance` - the diff tags that trigger a run
- `analyzing-regression-scope` - what else the same change can break
- `testing-abuse-limits` - limits and lockouts, the neighbor this pack deliberately does not cover
- `standardizing-test-records` - stable IDs and the RES run record
- `reporting-bugs` / `governing-quality-waivers` - findings and skip governance

## Definition of Done

- [ ] Smoke core selected from the real matrix, 15 paths or fewer, each with a stable ID
- [ ] Environment scripted: seeded accounts, known-ownership fixtures, reset, isolation
- [ ] Every path asserts server-side denial (and its audit event where one should exist)
- [ ] Triggers wired: security tags in diffs, release checklist, incident response
- [ ] A recorded run exists with per-path verdicts and evidence for every ❌
- [ ] Governance stated: versioned core spec, IDs never recycled, skips have owners

## Example prompts

- `/security-regression-smoke prune our authz matrix into a runnable smoke pack and wire it to our PR flow`
- `/security-regression-smoke the permissions refactor merged - run the pack and report verdicts`
- `/security-regression-smoke build the pack from scratch: two user roles, one admin, multi-tenant`
- `/security-regression-smoke our audit found nothing new - set up the core so we stop paying for full audits every time`
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
