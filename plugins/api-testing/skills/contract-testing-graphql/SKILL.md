---
name: contract-testing-graphql
description: 'Builds consumer-driven contract tests for GraphQL services: consumer tests that execute operations against a mocked provider and record the response shapes, provider verification that replays them against the real schema, and federation-aware checks across subgraphs. Use when GraphQL consumers and providers are owned by different teams, when a schema change might break a client operation, or when a federated graph needs a compatibility gate before deploy.'
argument-hint: 'Consumer operations (queries/mutations) to contract, provider schema or subgraph endpoint, and the pact broker or storage location'
user-invocable: true
---

# Contract Testing GraphQL

Use this skill when the compatibility question for a GraphQL API is "will this exact operation still work against your schema" — which is decided by the consumer, not the provider. The GraphQL variant of `pact-contract-testing`: instead of HTTP interactions, the contract unit is a GraphQL operation plus the response shape it depends on.

For schema-level breaking-change detection (field removals, type changes) without a consumer, use `testing-api-contracts`. For functional correctness of operations use `testing-graphql-apis`.

## When to Use

- a GraphQL consumer and provider are owned by different teams and must stay compatible
- a schema change (field deprecation, type change, new required input) is about to ship and its blast radius over consumer operations is unknown
- a federated graph has multiple subgraphs and a subgraph change must be verified against the operations the gateway routes to it
- breaking-change detection needs to run in CI before deploy, not after

## Operating Principles

- **The operation is the contract, not the schema.** A field no consumer queries can change freely; the contract is the set of operations consumers actually execute.
- **Response shape is asserted, not the whole schema.** The consumer records which fields and which error behaviour it depends on.
- **Deprecation is not removal.** Deprecated fields still work; the contract gate must distinguish "warn" from "break".
- **Federation changes the unit.** In a federated graph the subgraph is the provider; verify per subgraph, then run a gateway-level composition check.
- **Verification runs against the real schema**, never against the mock, or the gate proves nothing.

## Workflow

### Phase 1: Identify consumer operations

- collect the operations each consumer executes: persisted queries, or the query documents from client code / traffic logs
- per consumer, record which fields of the response it reads and how it handles `errors` and nulls — this is the contract
- classify each operation: critical (payment, auth), normal, deprecated

### Phase 2: Write consumer tests

For each consumer operation:

- run the operation against a mocked provider that returns the recorded response shape
- assert the consumer handles the happy path, and the failure shapes it declared (field null, `errors` present)
- write the contract artifact: operation document + expected response shape + expected error behaviour, tagged with consumer and provider (subgraph) names

Use `./resources/contract-artifact-schema.md` for the artifact shape.

### Phase 3: Provider verification

- replay every recorded consumer operation against the real provider schema (CI job per provider/subgraph)
- the check passes when: the operation is valid against the schema, every field the consumer reads still exists with a compatible type, and required inputs are unchanged
- failures classify as: **breaking** (field removed/retyped, input required), **warning** (field deprecated), **safe** (additive)
- for federation: verify per subgraph, then verify composition (the gateway schema still composes, no entity resolution break)

### Phase 4: Gate and publish

- publish contracts to the broker (or storage) on consumer CI; run provider verification on provider CI and before deploy
- breaking verification result blocks the deploy; warnings are reported but do not block
- when a breaking change is intentional: bump the contract with a recorded reason (waiver), re-record the consumer, and verify again

## Resource Map

- `./resources/contract-artifact-schema.md` - the contract artifact fields: operation, expected response shape, error expectations, consumer/provider tags. Read during Phase 2.

## Related Skills

- `pact-contract-testing` - the REST/HTTP version of this workflow, including broker and can-i-deploy mechanics
- `testing-api-contracts` - schema-level validation and spec diffing without consumer operations
- `testing-graphql-apis` - functional tests of the operations themselves
- `testing-api-security` - field-level authorization changes as a contract concern
- `generating-quality-gate-workflows` - wiring provider verification into CI as a merge/deploy gate

## Definition of Done

This skill is complete when:

- every consumer operation is recorded as a contract artifact with its expected response shape and error behaviour
- consumer tests assert against the mock and pass
- provider verification replays all consumer operations against the real schema and passes, or each failure is classified breaking/warning/safe
- breaking results block deploy in CI; intentional breaks have a recorded waiver and a re-recorded consumer
- federation: per-subgraph verification and a gateway composition check both ran
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

Standard vocabulary (use these, in status cells, findings and headers):

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | 🚧 | blocked / in progress |
| ❌ | failed / confirmed defect | | 🚢 | release go / shipped |
| ⚠️ | risk / warning / needs attention | | ⛔ | no-go / forbidden |
| 🐛 | defect / bug | | 📊 | metrics / measurement |
| 🔍 | gap / missing coverage | | 🧪 | test / under test |

Rules:

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
