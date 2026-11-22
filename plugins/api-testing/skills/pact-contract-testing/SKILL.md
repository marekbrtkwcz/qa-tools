---
name: pact-contract-testing
description: 'Builds consumer-driven contract tests between services: consumer tests against a mocked provider writing pact files, provider verification replaying them against real endpoints, publishing to a broker, and gating deploys with can-i-deploy. Use when services owned by different teams must stay compatible, when schema or OpenAPI validation is not enough because the consumer decides what compatibility means, when a breaking provider change must be caught before deploy, or when broker tags and deployment records confuse people. For schema or OpenAPI response validation use testing-api-contracts.'
argument-hint: 'The consumer and provider services and their teams, what an integration break has cost before, whether a broker exists, and what the deploy gate may block'
user-invocable: true
---

# Pact Contract Testing

Make the consumer decide what "compatible" means, and prove it before either side deploys.

A schema answers "is this response shape valid". It cannot answer "does the consumer still work", because the consumer depends on a narrowing of the schema: the three fields it actually reads, the status code it branches on. Consumer-driven contracts pin exactly that narrowing: the consumer's tests write a pact (a JSON record of the interactions it relies on), and the provider is continuously required to satisfy every published pact. A provider change that breaks a consumer fails in CI, not in production at 2 a.m.

## When to Use

- two services owned by different teams talk over an API, and integration tests between them are slow, coupled to both deploy timelines, or nonexistent
- the provider team keeps breaking consumers they did not know existed; or the consumer team is afraid to upgrade because nobody knows what the provider may change
- schema/OpenAPI validation is already in place and the question "but will our consumers survive this change?" is still open - contracts are the answer to that narrower question
- a Pact broker is running (or about to be) and `can-i-deploy` needs to be wired into the deploy pipeline
- a breaking change crossed every schema check and the retro says "we need contract tests" - start here, not with a carpal integration E2E suite

## When NOT to Use

- the job is validating a response against a schema or OpenAPI spec, catching unknown fields and type drift: `testing-api-contracts` - that is schema validation, not a pact between negotiating parties
- one team owns both services and they deploy together: a (fast) integration test covers it; contracts pay off when ownership or deployment is split - agree explicitly, per pair, who deploys independently
- writing full end-to-end system tests: `api-playwright-test-developer`; a pact is a unit-level pin, deliberately cheap
- deciding where contract tests sit in the architecture: `designing-test-automation-architecture` places the layer; this skill builds it

## The Model (in one pass)

- **Consumer test**: the consumer unit-tests its client against a *mock provider* (generated from the DSL). The pact file is the *output* of these tests, one file per consumer per provider.
- **Provider verification**: the provider replays every expected request in the pact against its real endpoints (not mocks) and checks each actual response satisfies the consumer's expectation. State handlers set up fixture data per state ("an order O-1 exists").
- **Broker**: stores pact files + verification results as a matrix: consumer version x provider verification. Tags and branches describe *where* code is; deployment records describe *where software runs*.
- **can-i-deploy**: asks the matrix "does a conversation exist between what I am about to deploy and what is already in the target environment?" A red answer blocks the deploy. This is the entire payoff of the mechanism - the broker is bookkeeping for this one question.

## Operating Principles

- **Contract for what the consumer uses, nothing more.** An expectation that restates the whole payload makes the pact a frozen schema copy - every provider change breaks it, and the provider team turns verification failures into noise. Idempotent generated clients really do consume the whole payload (matching rules mitigate this); a hand-written consumer tests the fields it reads.
- **Matching rules are the negotiation.** Type matchers (`like()`, `eachLike()`) let providers add fields freely; exact matchers pin values only when the consumer branches on the value. Choosing matchers is the design work of a pact, not configuration detail.
- **Provider verification runs in the provider's CI**, against real provider code and against pacts fetched from the broker. Consumer team fixes consumer tests; provider team owns the verification pipeline.
- **The pact is a conversation, so changes flow through it.** A consumer needing a change: publish WIP/mark pending pacts, the broker webhook triggers provider verification, and the provider's answer (verified or not) is visible before either merge - not negotiated in a meeting.
- **Versions are git SHAs, environments are environments.** Broker versions = the consumer/provider's real commit SHA; tags map to branches or environment names. Inventing internal version schemes here is how can-i-deploy starts lying.
- **State handlers are fixture code and rot like it.** List every state the pacts need and keep handler fixtures maintained; a verification that passes because its state handler no-ops is a green light with no traffic behind it.

## Procedure

1. **Pick one consumer flow that matters.** One consumer, one provider, the highest-pain interaction (the one an outage retro mentioned). Do not contract-test the whole API surface - that is the schema copy anti-pattern from the principle above.
2. **Write the consumer test.** Mock provider from the DSL, describe the request the client really sends and the response fields it really reads, with matchers chosen deliberately. Run: consumer tests pass and the pact file lands on disk.
3. **Publish to the broker.** Local dev is `--publish-contract-info none`; CI publishes with the commit SHA as the version, and the consumer CI tags the branch. If no broker exists yet: `./resources/broker-and-deploy-gates.md` has the one-command docker-compose and token bootstrap - get it standing before step 4, because unpublished pacts verify nothing.
4. **Wire provider verification.** Fetch pacts for the provider from the broker, spin up the real app (test config, seeded by state handlers), run verification, publish results back. Verify deliberately against one red case first: change an expectation in a sandbox consumer and confirm the provider pipeline actually fails.
5. **Gate deploys with can-i-deploy.** Both pipelines ask the broker before deploying; the consumer may only deploy to an environment when its pact is verified by the provider version there (and vice versa for breaking provider changes). Then record the deployment in the broker with the environment - the answer to the *next* can-i-deploy depends on those records existing.
6. **Grow by pair, not by platform.** Add a second consumer/provider pair only when the first pair's pipeline is green twice and someone other than its author has run it. The cost of contract testing is per conversation, and the value only appears once the can-i-deploy answer is trusted.

## Resource Map

- `./resources/broker-and-deploy-gates.md` - read when standing up the broker or wiring gates: docker-compose bootstrap, the can-i-deploy decision table per deploy direction, webhook config that makes provider verification pull-based, and the state-handler checklist

## Related Skills

- `testing-api-contracts` - schema/OpenAPI validation, the *other* contract discipline; they compose - schema catches shape drift, pacts catch contract breakage
- `api-playwright-test-developer` - system-level API tests; the layer pacts deliberately avoid duplicating
- `designing-test-automation-architecture` - where the contract layer sits relative to unit/integration/E2E
- `automating-ci-test-pipelines` - the pipelines that run publication, verification and gates
- `handling-sensitive-test-data` - consumer fixtures and state-handler seed data follow its rules

## Definition of Done

- at least one consumer flow is pact-tested end to end: consumer tests green, pact published, provider verification green in the provider's own CI - all three demonstrated with pasted runs
- every expectation uses matchers chosen on purpose; no pact restates the provider's full payload, and any that does is flagged as such
- provider verification was proven capable of failing: a deliberately broken expectation produced a red verification, with output pasted
- `can-i-deploy` runs in both deploy pipelines as a blocking check and returns a provable red answer for an unverified pair - demonstrated once with the same deliberate break
- broker versions are git SHAs and each deployed environment has a recorded deployment
- each side's team knows which pipeline they own (consumer publishes pacts / provider verifies theirs - the state-handler fixtures) without asking
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
