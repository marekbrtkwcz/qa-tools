---
name: testing-auth-flows
description: 'Automates login and authenticated sessions correctly: a Playwright setup project that logs in once and saves storageState, API-first token acquisition, refresh and expiry handling, service accounts, SSO/OAuth test tenancy, and session sharing between UI and API tests. Use when a suite logs in inside every test, login is the slowest or flakiest step, CI fails on token expiry, or tests need one identity across UI and API. For authorization rules themselves (who may see whose data) use testing-application-security; for mocking the identity provider use mocking-network-and-time.'
argument-hint: 'The application under test, how it authenticates (form, OIDC, SAML, API), whether a test account exists, and how many tests currently log in'
user-invocable: true
---

# Testing Auth Flows

Use this skill when authentication is the thing standing between the suite and green - slow logins in every test, tokens expiring mid-run, credentials in three places, or a CI job that fails auth only on Mondays.

Auth in an automated suite is an engineering problem with a small number of correct shapes and a large number of expensive wrong ones. The goal of this skill is a suite where login cost appears once in a setup project, identities are controlled and unique, and expiry is a tested condition, not a race.

## When to Use

- every test performs its own UI login and the run takes minutes before anything is verified
- the suite shares one account across parallel workers and random tests fail with one another's data
- expired session, token refresh, or "remember me" behaviour needs coverage, not just survival
- UI and API tests need the same identity without re-authenticating
- SSO/OIDC redirects behind a corporate IdP break tests that worked against local login

## Operating Principles

- **Authenticate once per run, not per test.** UI login is a browser flow through a page that can change; do it in a dedicated setup project and persist `storageState` for the rest.
- **Login code is test infrastructure.** It gets the same review bar as any fixture: selectors on stable hooks, no sleeps, and it fails loudly when the flow changes.
- **The IdP is not your system under test.** Never assert your vendor's login page in depth; walk through it or bypass it deliberately, and say which.
- **One account per worker, and say which.** Parallel tests sharing one identity collide on server-side state (sessions limits, rate limits, per-user data). The identity plan is part of the auth setup, not an afterthought.
- **Expiry is a scenario, not an incident.** A session that expires mid-run in CI and mid-test in production are the same defect class - cover it with a test, not with a retry.

## Workflow

### Phase 1: Classify the auth

1. Determine the mechanism before writing anything: plain form + cookie session, OIDC/OAuth redirect, SAML, or API-issued bearer. The shapes differ and guessing produces flaky redirects.
2. Identify what the session artifact is: cookies plus localStorage (storageState covers it), a bearer token in memory/client storage, or a header token only (storageState is then irrelevant and a token fixture is the right store).

### Phase 2: Pick the shape

3. **UI suites:** one `setup` project runs a login spec first, asserts the logged-in state, and saves `storageState` to a `.auth/` path that is gitignored. Worker- or role-specific states are separate files named per role, not overwrites.
4. **API suites:** create the token through the API where possible (request to the token endpoint with test credentials from env), keep it in the fixture, and refresh per run - not per request, not hardcoded.
5. **Mixed:** share the identity - storageState for browser tests, the same account's token for API tests, both minted in the same setup phase, so UI and API assert the same world.
6. **SSO/OIDC:** prefer a test tenant and direct credentials in CI env over scripting through live corporate SSO; where walking the IdP is unavoidable, keep the walkthrough in the setup project only, never inside feature tests.

### Phase 3: Cover the conditions

7. Add the expiry test: a session blocked (expired token or cleared state) lands the user where the product intends (re-login, redirect, error), checked as behaviour, not a screenshot of a login page.
8. Add the refresh test where the app refreshes tokens: assert a refreshed request still authorizes, and assert that a refresh failure degrades as designed.
9. Negative auth: wrong credentials, expired token against an API route, and a logged-out UI visit - each returns 401/redirect as the product promises, not a 500.

### Phase 4: Contain the blast radius

10. Credentials arrive from env (CI secrets) and are referenced by name (`AUTH_TEST_USER`), never copied into specs or reporters; `storageState` files are gitignored, and trace/screenshot publishing redacts where needed.
11. If login breaks, the failing artifact is the setup project and one file - which is the point of the whole shape.

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "Login in every test keeps them independent" | Each test pays the slowest page's cost and inherits its flakiness. | Authenticate in a setup project; per-test freshness only for the login feature itself. |
| "We all use the same QA account" | Parallel workers evict each other's sessions and trip rate limits - random failures. | One identity per worker (distinct users or distinct roles), stated in the config. |
| "The storageState can be committed, it's just staging" | A committed session is a committed credential. | `.auth/` gitignored, minted fresh each run. |
| "We'll script through the SSO portal" | The IdP's A/B tests and anti-bot heuristics create flakiness you cannot fix. | Test tenant with direct credentials, or walk the IdP only in setup. |
| "Just refresh the token before every request" | Masked expiry defects, and the refresh endpoint becomes the hidden single point of failure. | Refresh per run in setup; expiry is a tested scenario. |

## Red Flags

- Credentials, tokens, or full session JSON inside a spec file or committed to the repo.
- Login selectors (`getByText('Sign in')`) inside feature tests rather than a setup project.
- A suite that can run only sequentially because the whole team shares one account.
- `waitForTimeout` around login or redirect waits.
- No test anywhere covers expired or invalid credentials returning 401/redirect as designed.

## Related Skills

- `diagnosing-test-failures` - when an existing suite's login step is the flake
- `mocking-network-and-time` - when the identity provider itself needs stubbing in component or isolated tests
- `testing-application-security` - when the question is authorization (who may access whose data), not authentication
- `stabilizing-flaky-tests` - after the auth shape is fixed and nondeterminism remains elsewhere
- `bootstrap-test-suite` - a bootstrap that ends needing this skill wires `.auth/` and env from day one
- `handling-sensitive-test-data` (qa-core) - test accounts, secrets and storageState files: synthetic accounts only, no real credentials in the repo or CI logs

## Definition of Done

This skill is complete when:

- the auth mechanism is named and the session artifact identified before code was written
- UI login runs in a setup project and `storageState` is saved under a gitignored path, shown by `file:line`
- API tokens come from the token endpoint or fixture, refreshed per run, referenced by env name
- the identity plan is stated: which accounts exist, per what (worker/role), and how many
- expiry and invalid-credentials scenarios exist as tests and are quoted after a run
- no credential or session value appears in any file the suite commits or publishes
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
