---
name: testing-graphql-apis
description: 'Designs and runs functional tests for GraphQL APIs: query and mutation behaviour against the schema, variables and input validation, error and partial-response handling, pagination, introspection exposure, and depth/complexity abuse. Use when a service exposes a GraphQL endpoint and needs systematic test coverage beyond what REST-style contract tests catch.'
argument-hint: 'GraphQL endpoint URL, schema location (SDL file or introspection), the operations in scope, and an auth token strategy if the endpoint requires one'
user-invocable: true
---

# Testing GraphQL APIs

Use this skill when the question is "does this GraphQL operation return the right data under the right conditions". GraphQL moves the failure surface from URL design to query design: one endpoint, infinite query shapes, and errors that arrive as data. REST habits (status codes per route) do not transfer.

For schema compatibility and breaking-change detection use `testing-api-contracts` or `pact-contract-testing`; for security-focused checks (field-level authorization, depth abuse as a DoS vector) use `testing-api-security`.

## When to Use

- a service exposes a GraphQL endpoint with no automated coverage
- queries return wrong, missing, or extra data (over/under-fetching)
- mutations need testing: input validation, partial failure, idempotency, side effects
- pagination, filtering, or sorting behaviour is in scope
- error handling needs verification: partial data with `errors`, null propagation
- introspection exposure needs checking in non-production environments

## Operating Principles

- **The schema is the API surface.** Every field, argument, and input type in the schema is testable surface, whether the UI uses it or not.
- **Errors come back as data.** A 200 with an `errors` array is a failure; assert on `errors`, not just `data`.
- **Test the query, not the endpoint.** The same endpoint with different selections behaves differently — coverage is per operation shape, not per URL.
- **Nullability is a contract.** A field declared non-null that returns null is a server bug; a nullable field the client assumes non-null is a client bug. Test both directions.
- **Depth has a cost.** Deeply nested queries are a functional concern (latency, N+1) as well as a security one.

## Workflow

### Phase 1: Get the schema and map the operations

- obtain the schema: SDL file in the repo, or introspection query against a non-production endpoint
- list the query, mutation, and subscription roots and the types reachable from each
- identify the operations the application actually uses (from the client code or persisted queries); test those first
- record auth requirements per field if the schema marks them

### Phase 2: Query behaviour

Work through `./resources/query-mutation-checklist.md` for each operation:

- happy path: expected fields, types, and values
- variables: valid, missing, wrong type, extra/unknown variables (must be rejected or ignored per spec)
- input validation on arguments and input objects: required fields, enums, ranges, formats (email, date, custom scalars)
- nested selections: include each level, verify no N+1-shaped latency anomaly on collections
- aliases and fragments: same field requested twice under different aliases

### Phase 3: Mutation behaviour

- valid mutation: response data and the persisted side effect (verify via a follow-up query or `testing-database-state`)
- invalid input: error message names the field; no partial write occurred
- partial failure in a multi-field mutation: which fields committed, what the `errors` array says
- idempotency: repeating the mutation does not duplicate the effect where the domain requires it
- concurrent mutations on the same object: last-write-wins vs conflict must match the documented behaviour

### Phase 4: Errors, pagination, and limits

- error shape: `errors[].message`, `path`, `extensions.code`; assert clients can handle them
- partial responses: nullable field errors leave `data` present but the field null — the client must handle it
- cursor pagination: pageInfo (hasNextPage, endCursor), stable ordering, no duplicates or gaps across pages, edge cases (empty, single item, page size larger than total)
- depth/complexity: a deeply nested or batched query gets rejected or throttled per the server's stated policy (with `testing-api-security` for the abuse angle)
- introspection: enabled where developers need it, disabled or restricted in production

### Phase 5: Automate and report

Automate the checks as API tests (see `api-playwright-test-developer`); each test asserts on both `data` and `errors`. Report defects via `reporting-bugs`, including the exact query and variables.

## Resource Map

- `./resources/query-mutation-checklist.md` - the per-operation check matrix: variables, validation, nesting, mutations, errors, pagination. Read during Phases 2–4.

## Related Skills

- `testing-api-contracts` - schema validation and breaking-change detection between schema versions
- `pact-contract-testing` - consumer-driven contracts, including a GraphQL variant
- `testing-api-security` - field-level authorization, depth abuse, and mass assignment at the API layer
- `api-playwright-test-developer` - writing the checks as automated API tests
- `testing-database-state` - verifying mutation side effects in the database
- `testing-auth-flows` - token acquisition for authenticated GraphQL calls

## Definition of Done

This skill is complete when:

- the schema was obtained and the operations in scope are listed
- every operation was tested for happy path, variable handling, and input validation
- every mutation was tested for valid input, invalid input, partial failure, and side effect
- error shape, null propagation, and partial responses were verified
- pagination was verified for correctness (no gaps/duplicates) and edge cases
- depth/complexity policy and introspection exposure were checked per environment
- the checks are automated and assert on both `data` and `errors`
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
