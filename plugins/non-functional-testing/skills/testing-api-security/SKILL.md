---
name: testing-api-security
description: 'Runs an OWASP API Security Top 10 focused test pass against REST or GraphQL endpoints: authorization on every object and function, authentication and token handling, input validation, rate limiting, mass assignment, and sensitive data exposure, all verified at the API layer rather than through the UI. Use when an API needs a dedicated security check, when endpoints exist that the UI hides, or when a security review needs systematic API coverage. For whole-application security testing use testing-application-security.'
argument-hint: 'API base URL and spec or route list, written authorization to test, roles and tokens in scope, and whether the environment is production'
user-invocable: true
---

# Testing API Security

Use this skill when the question is "does the API itself enforce what it claims", checked request by request instead of through the UI. A UI that hides a button proves nothing; every check here runs against the raw endpoint.

This is the API-specialised counterpart of `testing-application-security`. Use that skill for whole-application security testing (sessions, UI behaviour, tenant boundaries); use this one when the scope is the API surface: endpoints, methods, objects, tokens, and payloads.

**Everything in this skill runs after the authorization gate in Phase 0.** Testing a system you are not authorized to test is not a testing activity.

## When to Use

- an API exposes endpoints the UI never links to
- a security review needs systematic per-endpoint API coverage
- object-level or function-level authorization needs checking (IDOR/BOLA, GraphQL field permissions)
- token, key, or session handling of the API needs verification
- mass assignment, excessive data exposure, or injection needs checking at the payload level
- rate limiting, abuse limits, or webhook signature verification are in scope

## Operating Principles

- **Authorization first, always.** Written permission naming system, environment, scope, and window. No exception.
- **The API is the boundary, the UI is a rumour.** Every check runs against the endpoint directly.
- **Observe, do not exploit.** Confirm with the minimum request that demonstrates the finding, then stop.
- **Systematic beats clever.** A complete method-by-endpoint matrix finds more than an inventive payload.
- **Never in production without explicit written approval**, and never with real customer data.
- **Report through the security disclosure path**, not the public bug tracker.

## Workflow

### Phase 0: The authorization gate

Nothing runs until this is complete. Reuse the gate from `testing-application-security` (`./resources/scope-and-authorization-gate.md` in that skill) and record: written authorization, environment (staging by default), scope (hosts, endpoints, accounts), prohibited actions, time window, contact, and the synthetic-data rule. A missing line is a blocking condition.

### Phase 1: Inventory the API surface

- every endpoint and method, from the OpenAPI/GraphQL schema, a route dump, or observed traffic
- every object type the API returns or mutates, and the identifier scheme per object
- every role and the token/key format each role uses
- input channels: query params, headers, body fields, file uploads, webhooks

Record the inventory as the base for the check matrix.

### Phase 2: Run the OWASP API Security Top 10 checks

Work through `./resources/api-top10-checklist.md`. For each category, record per endpoint: the check, the request that proves it, and pass/fail/unknown. The categories:

1. **Broken object-level authorization (BOLA/IDOR)** — change an object ID in the request; a different user's record must not come back. Check collection and item endpoints, and every method on each.
2. **Broken authentication** — token expiry, token revocation, weak credentials, missing re-authentication on sensitive operations.
3. **Broken object property-level authorization (mass assignment)** — send extra fields in a write payload; the server must ignore or reject fields the role may not set.
4. **Unrestricted resource consumption** — missing or weak rate limiting, unbounded page sizes, expensive queries without pagination limits.
5. **Broken function-level authorization** — every method on every endpoint against every role; admin functions reachable by non-admin tokens.
6. **Mass assignment / business flow abuse** — replay, reorder, or skip steps of a multi-step flow.
7. **Security misconfiguration** — verbose error messages, default credentials, unnecessary HTTP methods enabled, missing security headers, CORS wildcards.
8. **Improper inventory management** — old API versions still reachable, debug endpoints exposed, undocumented endpoints.
9. **Unsafe consumption of APIs** — third-party responses trusted without validation; SSRF-shaped input fields.
10. **Insufficient logging and monitoring** — security-relevant events (failed auth, IDOR attempts) that produce no log entry.

### Phase 3: Verify sensitive data exposure

- responses must not include fields the caller does not need (over-fetching)
- error responses must not leak stack traces, SQL, or internal identifiers
- tokens and secrets must not appear in URLs, logs, or response bodies

### Phase 4: Report

Use the finding report template from `testing-application-security` (`finding-report-template.md` in that skill). Each finding: endpoint, method, role used, the minimal proving request, severity, and the security disclosure path. State where testing stopped and what remains unknown.

## Resource Map

- `./resources/api-top10-checklist.md` - the per-category check matrix with proving-request recipes for REST and GraphQL. Read during Phase 2.

## Related Skills

- `testing-application-security` - whole-application security testing, including the shared authorization gate and finding report template
- `testing-abuse-limits` - when the focus is rate limiting and resource consumption under load
- `testing-api-contracts` - which finds undocumented response fields, a common data-exposure path
- `testing-auth-flows` - for functional correctness of login and token lifecycle, not its security
- `api-playwright-test-developer` - when the checks should be automated as API tests
- `handling-sensitive-test-data` - for the synthetic accounts and data used during testing
- `reporting-bugs` - for non-security defects found along the way; security findings use the disclosure path

## Definition of Done

This skill is complete when:

- written authorization exists and was obtained before any probing; the environment is non-production or separately approved
- only synthetic accounts and data were used
- every endpoint and method was checked against every in-scope role at the API layer
- all ten OWASP API Security Top 10 categories were run and recorded as pass/fail/unknown per endpoint
- every confirmed finding stopped at the minimum demonstration
- findings went through the security disclosure path with data redacted
- the report states where testing stopped and what remains unknown
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
