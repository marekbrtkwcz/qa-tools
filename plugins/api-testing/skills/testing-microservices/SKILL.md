---
name: testing-microservices
description: 'Tests a system of microservices as a system: inter-service contracts, end-to-end flows across service boundaries, distributed tracing verification, cross-service data consistency, service virtualization for isolated testing, and failure propagation between services. Use when a bug only appears when two or more services interact, when a deploy of one service must be verified against its consumers, or when local testing of one service needs its dependencies stubbed.'
argument-hint: 'The services and flows in scope, how they are deployed (compose/k8s), and which contracts already exist'
user-invocable: true
---

# Testing Microservices

Use this skill when the unit of failure is not one service but the interaction between services. Individual services may pass their own tests while the system fails: a contract drifted, a trace breaks mid-flow, an event arrives before the row it references, a retry amplifies load downstream. This skill covers the seams.

Per-service API testing stays with `testing-grpc-apis` / `api-playwright-test-developer`; pairwise contracts with `pact-contract-testing` / `contract-testing-graphql`; event flows with `testing-event-driven-systems`.

## When to Use

- a defect only reproduces when services A and B both run
- deploying one service requires knowing which consumers it breaks
- a user flow crosses three or more services and needs end-to-end verification
- local or CI testing of one service needs its dependencies virtualized
- traces are incomplete or inconsistent across a request flow
- cross-service data ends up inconsistent (order without payment, event without row)

## Operating Principles

- **Test the seams, not just the boxes.** Every service boundary (HTTP, gRPC, events) is a place where assumptions can silently diverge; each seam gets a contract or a schema check.
- **One service's deploy is a system event.** Verify consumers before/after via contract verification (`pact-contract-testing` can-i-deploy), not by hoping.
- **Virtualize for isolation, verify against real for confidence.** Stub dependencies for fast local tests; run a composed environment (compose / test namespace) for flow tests.
- **Follow the request, not the service.** Distributed tracing is the map; a flow that loses trace context mid-way is a finding.
- **Consistency across services is eventual — assert the convergence, not the instant.** Poll downstream state until it matches, with a timeout (`testing-event-driven-systems`).

## Workflow

### Phase 1: Map the system

- services, their boundaries (REST/gRPC/events), and which service owns which data
- the user flows that cross boundaries; pick the critical few for end-to-end tests
- existing contracts, schemas, and topic definitions per seam
- deployment topology for tests: full compose vs per-service with virtualized dependencies

### Phase 2: Contract coverage per seam

Work through `./resources/microservices-checklist.md`:

- every HTTP/gRPC seam has consumer-driven contract verification in CI (`pact-contract-testing`, `contract-testing-graphql`, `testing-api-contracts` for schema)
- every event topic has a schema and a compatibility rule (`testing-event-driven-systems`)
- can-i-deploy gate on the provider before deploy

### Phase 3: End-to-end flow tests

- per critical flow: drive the entry point, assert the user-visible outcome, and verify each service's side effect (`testing-database-state`, events published)
- assert the trace spans the whole flow with one trace id and no missing segments
- failure injection at one seam (`resilience-smoke-testing`): the flow degrades per contract, no cascading failure

### Phase 4: Service virtualization for isolated tests

- when testing service X alone, stub/vmock its dependencies at the boundary (recorded responses or schema-valid fakes)
- keep virtualized tests fast and local; keep a smaller composed suite as the truth check so stubs cannot drift from reality (contract tests are the drift guard)

### Phase 5: Cross-service consistency

- per flow, define the eventual-consistency pairs (e.g. order created → payment event → invoice row)
- assert convergence: poll until downstream state matches, within a timeout; record convergence time
- duplicate/out-of-order events across services: final state still correct

### Phase 6: Report

Findings classify as: contract break, trace break, consistency break, cascade failure, virtualization drift. File via `reporting-bugs`; feed release decisions via `assessing-release-readiness`.

## Resource Map

- `./resources/microservices-checklist.md` - the seam-by-seam and flow-by-flow check matrix. Read during Phases 2–5.

## Related Skills

- `pact-contract-testing` / `contract-testing-graphql` - pairwise consumer-provider contracts
- `testing-event-driven-systems` - event seams, DLQ, eventual consistency
- `resilience-smoke-testing` - fault injection at seams
- `testing-with-testcontainers` - composed test environments
- `test-environment-provisioning` - standing up the multi-service test environment
- `testing-database-state` - side-effect verification per service
- `assessing-release-readiness` - go/no-go with system-level evidence

## Definition of Done

This skill is complete when:

- every service seam has a contract or schema check running in CI, with can-i-deploy gating provider deploys
- the critical cross-service flows have end-to-end tests asserting outcome, side effects, and trace continuity
- one seam's fault was injected and the flow degraded per contract
- isolated service tests use virtualized dependencies guarded by contract tests against drift
- eventual-consistency pairs were asserted by polling to convergence within a timeout
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
