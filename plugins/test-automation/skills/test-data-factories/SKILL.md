---
name: test-data-factories
description: 'Builds test data as code instead of literals: factory functions with composable traits, seeded Faker for deterministic runs, uniqueness strategies that survive parallel workers, and teardown that actually cleans persistent state. Use when tests fail on data collisions, when fixture literals are copy-pasted and drifted, when each test needs its own rows but the suite shares a database, or when a seed script has become the hidden second test author. For designing what data should exist (roles, boundaries, personas), use designing-test-data; for keeping personal data out of fixtures, use handling-sensitive-test-data.'
argument-hint: 'The domain entities to build, where data is created and cleaned (in-memory, API, database), the runner, and how many parallel workers share the backend'
user-invocable: true
---

# Test Data Factories

Use this skill when two tests fight over the same row, when "make a user" means a 40-line literal pasted into each spec, or when deleting the wrong test customer would be a Tuesday.

Liternals copy, copies drift, and drift means the test verifies data nobody produces. A factory is one named function per entity that makes valid data by default, takes explicit overrides, and cleans up what it created. It is the difference between a suite whose data is an asset and one whose data is archaeology.

## When to Use

- tests create their own rows via API/UI and collide when run in parallel
- the same entity literal (user, account, order) is pasted across specs with tiny unexplained differences
- a nightly run fails because yesterday's data still exists
- the team needs generated data (volume, variance) but deterministic tests (reruns)

## Operating Principles

- **One factory per entity, defaults valid.** `makeUser()` gives a working user: every call. Overrides are named arguments, distinguished from defaults at a glance.
- **Uniqueness by construction, not by luck.** Email/ID collisions are prevented by strategy (seed + counter, uuid suffix, worker-index prefix), not by `Math.random` inside a template.
- **Determinism on demand.** Seeded Faker (`faker.seed(...)`) recorded in the run proves reruns reproduce; unseeded randomness has no place where a failure needs a replay.
- **Creation through the narrowest surface that owns the data.** API for backend-owned rows, direct DB seeding only for arrange-heavy scenarios an API cannot express - and say why when DB.
- **Teardown is part of creation.** A factory that creates without cleaning is a leak; the plan says what gets deleted, truncated, or rolled back, and when.
- **No production data in factories.** Synthetic shapes that look real (per `handling-sensitive-test-data`); if the fixture came from prod, that is a separate decision with its own rules.

## Workflow

1. **Inventory the entities and their creation surfaces.** Which entities each suite needs, which are created by UI, API, seeded, or DB-direct, and where uniqueness constraints bite (emails, usernames, external IDs).
2. **Choose the isolation strategy per backend.** In-memory: factories alone. API: create per test, delete in `afterEach`/`afterAll` (or rely on per-run namespaces). Shared DB: transaction-per-test rollback where the runner supports it, else per-worker schema/namespace or truncate in hooks - one strategy, stated, not a mix chosen per file.
3. **Write the factories.** Base factory with valid defaults; trait functions for named variants (`makeAdminUser`, `makeUser({ plan: 'expired' })`); seeded `@faker-js/faker` for shape-realistic values; uniqueness from a run-prefixed counter or uuid - never a pasted increment.
4. **Wire teardown where the strategy requires it.** Track created IDs in the fixture, delete via API after the test (or the transaction/schema rollback), and make teardown failures loud in CI rather than silent accumulation.
5. **Handle the parallel question explicitly.** State the formula: how many workers, which resources they share, what makes their data disjoint. A suite that "usually" survives parallelism is a suite failing on CI only.
6. **Prove it.** Run the suite twice in a row without intervening cleanup - the second green run is the evidence teardown and uniqueness actually work. Quote both runs.

## If Faker is not installed

Seeded Faker is a dev dependency, not a system tool: `npm i -D @faker-js/faker` in the project whose tests need it. If it cannot be installed right now:

- the fallback is deterministic generators you own: a run-prefixed counter or uuid for uniqueness, small realistic pools for names, a tiny idn-free email pattern - all seeded with the run id, so reruns still reproduce
- what stays true either way: no `Math.random()`/`Date.now()` for uniqueness, no hand-pasted literal rows pasted across files - those are the reasons factories exist, not Faker-specific rules
- label the choice in the factory header (`// faker unavailable: counter+uuid strategy, seed recorded`), so the shape-realism gap (names, addresses, company strings) is visible to the next reader instead of silent

## What People Say vs What Happens

| They say | What happens | Do instead |
| --- | --- | --- |
| "It is easier to just paste the user into the spec" | Ten pastes, ten silent variants, and the eleventh test verifies a fixture that cannot exist. | One factory; variants become named traits. |
| "Math.random() in the email keeps them unique" | Collisions at scale, and a failure no one can replay. | Seeded faker + run-prefixed counter or uuid4 suffix. |
| "The DB is wiped nightly, that is our cleanup" | Runs depend on the clock; daytime reruns share yesterday's rows. | Per-test or per-run teardown; nightly wipe is defense in depth, not the strategy. |
| "We seed the DB once with everything the tests need" | Tests then implicitly depend on a script nobody wants to touch; a bad seed fails the suite hours later. | Factories give each test what it needs; a seed provides only what the environment cannot (e.g. reference data). |
| "Delete by shared name, it catches all our test rows" | It also catches rows another test was about to use - flaky deletes. | Scope teardown to IDs the run created, tracked in the fixture. |

## Red Flags

- Entity literals in specs whose only explanation is copy-paste siblings.
- Cleanup that relies on truncating a shared table while a parallel worker is mid-test.
- `Math.random()`, `Date.now()` uniqueness, or unseeded faker where reruns matter.
- A factory returning `any` (or hand-rolled shapes) the type system cannot check.
- Real personal data copied into a factory "for realism".
- Suites that pass first run and fail on rerun - the teardown signature.

## Related Skills

- `designing-test-data` - what data should exist (personas, boundaries, roles) before code builds it; `generate-test-data` is the command wrapper for that catalog
- `handling-sensitive-test-data` - keeping personal data out of fixtures and artifacts
- `writing-unit-tests` - test doubles at the module boundary, where factories live in-memory
- `stabilizing-flaky-tests` - when data collisions have already become named flakes
- `mocking-network-and-time` - when the backend itself should be faked instead of fed

## Definition of Done

This skill is complete when:

- each entity has one factory with valid defaults, named traits, and typed inputs
- uniqueness is strategy-based and stated (prefix + counter or uuid); seeded faker where rerun fidelity matters
- the isolation strategy for the backend is named (rollback, namespace, per-test delete) and applied in one place, not per file
- teardown is wired, scoped to created IDs, and its failure is visible in CI
- the parallel formula is written down: workers, shared resources, the disjointness guarantee
- two consecutive suite runs are quoted, both green, without intervening manual cleanup
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
