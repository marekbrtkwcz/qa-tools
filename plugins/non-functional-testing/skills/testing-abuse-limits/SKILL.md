---
name: testing-abuse-limits
description: 'Verifies documented protection limits against real behavior with single-actor, low-volume methods: rate limits, lockouts, session/device/batch caps, quota responses - proving thresholds, recovery, and observability, not taking the system down. Produces one limit card per control (documented vs actual) and files the deltas as findings. Use when an API introduces or changes rate limits, abuse controls are claimed but never verified, or a removed rate limit leaves no record of what it protected. Load and throughput: testing-performance-and-load. Authorization: testing-application-security.'
argument-hint: 'The API or endpoint set, its documented (or claimed) limits, and the environment allowed for testing'
user-invocable: true
---

# Testing Abuse Limits

Use this skill when a system claims a protective limit - "5 failed logins lock the account", "100 requests per minute per key" - and the claim itself has never been tested.

Scope honesty first: this is **not** a DoS test. Every method here sends at most what one impatient legitimate user could send; the moment a test needs distributed sources, bandwidth, or enough volume to hurt the system, it has left the tester scope and belongs to capacity engineering (`testing-performance-and-load`). What is in scope is the control's *specification*: does the limit exist, does it trigger where documented, is denial informative, does recovery work, does breaching leave a trail.

## When to Use

- An API introduces or changes rate limits, lockouts, session caps, or quota responses
- Abuse controls are claimed but never verified against real behavior
- A review removed a rate limit and nobody can say what it protected

## When NOT to Use

- Throughput, scalability, saturation - `testing-performance-and-load`; capacity answers "how much until it bends", this skill answers "does the seatbelt buckle".
- Authorization, roles, IDOR - `testing-application-security`.
- A repeated smoke of known protection paths - `security-regression-smoke`; here each limit gets *characterized*, there.
- Incident forensics on a past breach - `diagnosing-test-failures` plus the trackers; this skill prevents, not reconstructs.

## Procedure

### 1. Inventory the limits

Collect every protection control that throttles or locks something:

- **documented**: docs, onboarding, error messages, HTTP response headers (`Retry-After`, `X-RateLimit-*`), API support pages
- **claimed in code review**: limits named in comments/issues ("we added a cap of 50 per request") that never got verified
- each control becomes a **limit card** (template below): name, scope (per user / per IP / per key / per tenant), threshold, window, denial shape (throttle? reject?), penalty (lockout duration? CAPTCHA escalation?), recovery path, and the audit event it should emit

An undocumented-but-discovered limit is already a finding: a control nobody documented cannot be operated in an incident (support cannot tell a locked-out customer what happened).

### 2. Verify the threshold, low-volume

Single actor, one origin, no concurrency unless the limit requires it:

- approach the threshold with the documented window (`n` requests at a measured pace), then send the `n+1`-st
- verify the verdict shape: correct status (`429` / `403`), informative body (limit, window, retry guidance), correct headers - **not** a silent `200` or a naked `500`
- verify the *edge*: does the counter reset at the documented window end? Does the lockout lift after the documented duration, measured with a clock, not guessed?
- where a UI wraps the same limit, check both layers: API throttled but the UI keeps firing (error spinners nobody throttles back) is a finding

Manual pace (a script, a `curl` loop) is enough for most window/threshold checks; use it before replacing it with anything heavier.

### 3. Use k6 when precision or pacing matters

When the window is tighter than a manual loop can honor (per-second buckets), or when the threshold must be asserted repeatably, use k6 (`qa-mcp`'s k6 server runs it from the agent session):

- constant-arrival executor (`constant-arrival-rate`) delivers an exact rate for a measured window, not approximations
- `thresholds` encode the *documented expectation* - e.g. the first 100 requests succeed and responses beyond the limit fail with `429` - and the run verdict is then a statement against the document, not a vibe
- keep the test tiny: this is a seatbelt check; a k6 run that loads the system is a capacity test and has left this skill

Write thresholds so the run *verifies the document*, so a doc change needs its test updated together (same commit, same review).

### 4. Verify recovery and penalty logic

- after breaching: does lockout actually lock for the documented span? Does the account-recovery flow (password reset, support unlock) bypass or respect the penalty?
- does the penalty escalate as documented (CAPTCHA after throttle, lockout after repeats)? An escalation that never escalates is a limit that only inconveniences legitimate users
- does the lockout distinguish the attacker from the victim - or does the lockout on `user-a` become a denial-of-service *against* `user-a` by anyone who knows their login? (DoS-by-lockout is an unglamorous, real finding.)

### 5. Verify observability

- breaching a limit should leave the trail it owes: an audit event, a log line with user/rate/window, an alert-worthy metric if the docs promise one
- **a silently-throttled limit hides real abuse**: nobody investigating an incident can find what the system never recorded; that is a finding of the same rank as a wrong threshold

### 6. Report

One table, one row per limit card: documented behavior, actual behavior, verdict (✅ matches / ❌ differs / 🚧 untestable here - with reason), evidence per ❌. Deltas between doc and reality split three ways:

- **code wrong** -> `reporting-bugs` (limit not enforced, penalty never applied)
- **doc wrong** -> a docs fix (`testing-documentation` routes it), never "fix the doc to match the code" without a reviewer explicitly choosing that direction
- **nothing written anywhere** -> a documentation and architecture finding at once; a control that exists only in someone's head is not a control

## Limit card template

```markdown
### Limit: <name>
Scope: <per user / per IP / per key>   Threshold: <n> per <window>
Denial shape: <status/body/headers>    Penalty: <throttle|lockout|captcha> for <duration>
Recovery: <path and duration>          Audit event: <what it should log>
Documented where: <link/quote>

Verdict: ✅/❌/🚧   Actual threshold: <measured>   Evidence: <request log excerpt>
```

## Decision Rules

**Single-actor rule, no exceptions when:** ever - the step from "one tester with a loop" to "a few workers" is the step from seatbelt check to load test, and crossing it silently changes what the environment and the authorization cover.

**Prefer a manual loop first when:** the window is generous (minutes); replace with k6 only when the window is sub-second, the check must be repeatable in CI, or the documented pace cannot be honored by hand.

**Prefer testing on a non-production environment when:** any choice exists; when only production can answer (third-party gateway, real tenant isolation), use the smallest possible overshoot (threshold minus one, plus one request), during low traffic, with the owner's written nod - never a "quick full lockout test" on prod.

**Treat the limit as a specification when:** the results are recorded - the limit card *is* the requirement the next regression run (`security-regression-smoke`) can re-verify mechanically.

**Investigate lockout-by-attacker when the lockout is on an identifier the attacker chooses:** lockouts keyed to anything an outsider can set (username, email, IP) become a denial-of-service primitive against the victim; flag it even if the documentation stays silent on the topic.

## Related Skills

- `testing-performance-and-load` - capacity, saturation, SLOs; the neighbor this skill hands off to and never confuses with
- `security-regression-smoke` - the mechanical re-verification of limits once characterized here
- `testing-application-security` - authorization, the bigger border this patrol sits behind
- `testing-documentation` - routing doc-side findings
- `reporting-bugs` - filing code-side findings
- `handling-sensitive-test-data` - request logs captured as evidence may include real user data

## Definition of Done

- [ ] Every claimed limit has a card: scope, threshold, window, denial shape, penalty, recovery, audit event
- [ ] Each threshold verified at the edge: the n+1-st request, reset behavior, recovery duration measured
- [ ] Observability checked: breaching leaves the trail the card promises
- [ ] Lockout-by-attacker risk flagged where the lockout keys on attacker-chosen identifiers
- [ ] Deltas routed: code bugs vs. doc fixes vs. control-nowhere
- [ ] No run left the tester scope: single actor, no load, authorized environment

## Example prompts

- `/testing-abuse-limits the docs claim 100 req/min per key - verify it and write the limit cards`
- `/testing-abuse-limits check failed-login lockout: threshold, escalation, recovery, and the audit trail`
- `/testing-abuse-limits write a k6 script asserting the documented rate limit on /api/search`
- `/testing-abuse-limits the review removed the batch size cap - characterize what that limit was protecting`
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
