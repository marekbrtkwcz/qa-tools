---
name: testing-with-testcontainers
description: 'Runs integration tests against real dependencies (databases, brokers, caches, third-party services) provisioned as containers per test run with Testcontainers, on Docker or Podman. Use when a test needs a real PostgreSQL/Kafka/Redis instead of a mock, when the suite must not depend on a shared environment, or when CI has no pre-installed services. Supports Podman as the container runtime (rootless, via socket or podman-compose).'
argument-hint: 'The dependencies to containerize, the test framework in use, and the container runtime available (Docker or Podman)'
user-invocable: true
---

# Testing with Testcontainers (Docker or Podman)

Use this skill when a mock would hide the behaviour under test: real SQL semantics, real broker semantics, real wire protocol. Testcontainers starts fresh dependency instances per test run and destroys them after, so tests are isolated and CI needs no pre-installed services. The runtime can be Docker or **Podman** — see Phase 1.

## When to Use

- integration tests need a real database, message broker, cache, or service (PostgreSQL, MySQL, Kafka, RabbitMQ, Redis, Elasticsearch, localstack-style AWS)
- a shared test database causes collisions and order-dependent failures
- CI has no services installed and provisioning them per job is the goal (`test-environment-provisioning`)
- a third-party dependency must be simulated locally (WireMock, localstack) instead of called for real

## Operating Principles

- **Real dependency, ephemeral instance.** One container per suite (shared across tests in it via module-scoped setup) or per test when tests mutate state; never a shared long-lived instance.
- **Wait for readiness, not for a port.** Use the container's wait strategy (log pattern, healthcheck, `Wait.forHttp`/SQL ping); a fixed sleep is flaky by construction.
- **Runtime-agnostic.** The same tests run on Docker and Podman; the only difference is how the client finds the daemon (Phase 1).
- **Clean teardown even on failure.** Containers are removed in teardown; leaked containers are CI cost and port collisions.
- **Keep images pinned.** Pin image tags; `:latest` makes failures un-reproducible.

## Workflow

### Phase 1: Pick and configure the runtime (Docker or Podman)

Testcontainers talks to the daemon over the Docker API, so with Podman you only point it at the Podman socket:

- **Docker**: default; nothing to configure.
- **Podman (rootless, recommended)**: enable the API socket and point the client at it:
  - `systemctl --user enable --now podman.socket`
  - `export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/podman/podman.sock"` (Testcontainers respects `DOCKER_HOST`; recent versions also auto-detect the Podman socket)
  - verify: `podman ps` and a trivial Testcontainers "hello-world" container start successfully
- **Podman rootful**: `sudo systemctl enable --now podman.socket`, `DOCKER_HOST=unix:///run/podman/podman.sock`
- **podman-compose** is an alternative for whole-stack setups (compose file with test services), but per-test lifecycle control is weaker than Testcontainers — prefer Testcontainers for unit/integration scope, compose for full-stack.
- record in the suite docs which runtime is expected and the one-line fallback to the other.

### Phase 2: Add the dependency per suite

- choose the module for the dependency (e.g. PostgreSQL, Kafka, GenericContainer for anything else) with a pinned image tag
- start it in module/suite setup (`beforeAll`), stop in teardown (`afterAll`), reuse across tests in the suite
- pass connection details (host, mapped port, credentials) to the app config via environment variables or test config — never hardcode
- for per-test isolation, use a fresh container or a transaction/schema rollback inside the shared container (`testing-database-state`)

### Phase 3: Wait for readiness and verify

- configure the wait strategy per dependency (Postgres: SQL ping; Kafka: log "started"; HTTP services: `Wait.forHttp("/health")`)
- after startup, assert the dependency is actually usable: run a trivial query/publish/consume before the tests execute
- record startup time; if it exceeds the CI budget, move the container to suite scope or cache the image (see `automating-ci-test-pipelines` for image caching)

### Phase 4: CI wiring

- CI needs only the runtime (Docker or Podman socket) — no service installation
- cache pulled images between runs; run the suite on a runner where rootless Podman works without sudo, or use the Docker fallback
- ensure teardown runs on failure (runner kills the job's containers, or the runtime's `--rm` semantics apply)

## Resource Map

- `./resources/container-checklist.md` - per-dependency setup, wait strategy, teardown, and Podman-vs-Docker verification steps. Read during Phases 1–3.

## Related Skills

- `test-environment-provisioning` - the wider environment contract these containers implement
- `testing-database-state` - asserting persisted state in the containerized database
- `testing-event-driven-systems` - containerized Kafka/RabbitMQ as the broker under test
- `mocking-network-and-time` - when a stub is enough and a container is overkill
- `automating-ci-test-pipelines` - image caching and CI runtime setup

## Definition of Done

This skill is complete when:

- the runtime is chosen and verified (Docker or Podman socket working with a trivial container)
- each needed dependency runs as a pinned, ephemeral container started in setup and stopped in teardown
- readiness uses the dependency's wait strategy, plus one real smoke interaction before tests run
- connection details flow through config/env, not hardcoded values
- the suite runs identically on Docker and on Podman
- CI runs the suite with only the runtime installed, and no containers leak after the run
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
