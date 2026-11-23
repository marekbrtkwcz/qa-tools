# Environment contract template

Fill one per environment type (local, CI, ephemeral-PR). Versioned in the repo.

```yaml
environment: ci                  # local | ci | ephemeral-pr | staging-like
owner: team-qa
services:
  - name: postgres
    version: "16"
    provision: docker-compose    # docker-compose | testcontainers | external
    readiness: "pg_isready -h localhost"
  - name: kafka
    version: "3.7"
    provision: testcontainers
    readiness: "kafka-topics --list --bootstrap-server localhost:9092"
  - name: app-under-test
    version: "${GIT_SHA}"
    readiness: "GET /healthz returns 200"
database:
  migrations: "run in order from migrations/"
  seed: "scripts/seed-test-data.ts (deterministic, seed 42)"
  verify_after_seed: "SELECT count(*) FROM users WHERE role='admin' = 1"
brokers:
  topics: ["orders.created", "orders.updated"]
  queues: ["notifications"]
secrets:
  source: ci-secrets             # never committed; synthetic values for local
  keys: [API_KEY_TEST, JWT_SIGNING_KEY_TEST]
config:
  file: config/test.env          # versioned; URLs, timeouts, feature flags
reset:
  shared_env: "drop schema public cascade; re-run migrations + seed"
  ephemeral: "destroy all containers/resources after job"
smoke:
  schedule: nightly
  suite: tests/smoke.spec.ts     # must pass on a freshly provisioned env
```
