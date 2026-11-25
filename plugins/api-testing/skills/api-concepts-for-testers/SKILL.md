---
name: api-concepts-for-testers
description: "REST/HTTP fundamentals for testers before they automate API tests: resources and endpoints, HTTP methods with idempotency semantics, status code classes and the codes that matter, JSON anatomy, the 6 REST constraints, request/response anatomy (headers, body, cookies), query params vs path params vs body, and where SOAP/XML fits. Use when onboarding a tester to API testing, leveling up a team on REST vocabulary, or when a test plan needs shared HTTP language. For writing the automated tests, use api-playwright-test-developer; for contract validation, testing-api-contracts."
argument-hint: "Team's current API familiarity and the API style in use (REST / SOAP / GraphQL / gRPC)"
user-invocable: true
---

# API Concepts for Testers

APIs are the surface testers automate most. This skill is the shared vocabulary and mental model — what the words mean and what can go wrong — before writing a single request. Glossary: `./resources/glossary.md`; HTTP quick reference: `./resources/http-quick-reference.md`.

## The mental model

A REST API exposes **resources** (nouns: `/authors`, `/books`) addressed by URLs, manipulated with **HTTP methods** (verbs), returning **responses** with a status code, headers, and usually a JSON body. Testing an API = choosing the right method+URL+payload per scenario and asserting status + body (+ side effects).

## Core concepts

1. **Resource & endpoint.** A resource is a thing (author, book, order); an endpoint is the URL path acting on it (`GET /authors/42`). Collection vs item endpoints: `/authors` vs `/authors/42`.
2. **HTTP methods and idempotency.** GET (read, safe+idempotent), POST (create, not idempotent), PUT (full replace, idempotent), PATCH (partial update, not guaranteed), DELETE (idempotent), HEAD/OPTIONS (metadata). **Idempotency matters for tests** because retries and redeliveries happen — see `testing-idempotency-and-retries`.
3. **Status codes.** Classes: 1xx info, 2xx success (200 OK, 201 Created, 204 No Content), 3xx redirects, 4xx client errors (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 405 method not allowed, 409 conflict, 422 unprocessable, 429 rate limited), 5xx server errors. Tests assert the *specific* code, not just 2xx.
4. **JSON.** Objects `{}`, arrays `[]`, string/number/boolean/null. Tests parse it and assert fields — never string-match the whole body.
5. **REST constraints (6).** Client-server, stateless (each request carries auth), cacheable, uniform interface (resource identification, manipulation through representations, self-descriptive messages, HATEOAS), layered system, code-on-demand (optional). A "REST API" violating statelessness (server-side sessions) changes how you test auth.
6. **Request anatomy.** Method + URL (path params `/authors/{id}`, query params `?firstName=Adam`, body for POST/PUT/PATCH), headers (Content-Type, Authorization, Accept, cookies), body. **Response anatomy:** status line, headers (Content-Type, Set-Cookie, Location, rate-limit headers), body.
7. **Auth in one paragraph.** Basic (credentials per request), Bearer/JWT (token in Authorization header — test expiry and tampering, `testing-oauth2-oidc`), session cookies (`testing-session-management`). Authentication ≠ authorization (401 vs 403) — `testing-application-security`.
8. **Query params vs path vs body.** Path identifies the resource, query filters/sorts/paginates (`?page=2&limit=20`), body carries the payload. Test boundaries: pagination, filtering, sorting.
9. **Where SOAP fits.** SOAP = XML envelopes over HTTP (usually POST) with a WSDL contract; still common in enterprise/legacy. Test it like any API (contract via WSDL, XML assertions) but with XML tooling — see note in the api-testing knowledge. GraphQL/gRPC have their own skills: `testing-graphql-apis`, `testing-grpc-apis`.

## Red Flags

- asserting only `status === 200` — assert the specific code and the body shape (`testing-api-contracts` for schema)
- "POST is just for creating" — POST is also used for actions/search in non-REST-ish APIs; test the actual contract
- treating 4xx as "test bug" — 400/401/403/404/422/429 are *expected* test cases (negative tests)
- ignoring idempotency — a retried POST double-creates unless the API handles it (`testing-idempotency-and-retries`)
- hardcoding tokens/URLs in tests — env config + secrets handling (`test-environment-provisioning`, `handling-sensitive-test-data`)
- testing only happy path — every endpoint needs negative cases (missing field, wrong type, unauthorized, not found)

## Related Skills

- `api-playwright-test-developer` - writing the Playwright API tests (request fixture, CRUD, uploads)
- `api-test-plan-and-tests` - turning endpoints into a test plan
- `testing-api-contracts` - OpenAPI/JSON Schema validation of responses
- `testing-idempotency-and-retries` - duplicates, retries, idempotency keys
- `testing-auth-flows` / `testing-oauth2-oidc` / `testing-session-management` - auth mechanisms
- `testing-application-security` / `testing-api-security` - 401/403 matrices, IDOR, OWASP API Top 10
- `api-request-response-logging` - readable request/response logs in tests
- `hybrid-ui-api-testing` - combining UI and API tests

## Definition of Done

- the team shares one vocabulary for resources/methods/status codes/JSON (`glossary.md` circulated)
- the API under test has a test plan covering each endpoint × method with positive AND negative cases
- status-code assertions are specific, body assertions are structural (schema where available)
- auth model of the API is named (basic/bearer/session/oauth) and its failure cases are in the plan
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
