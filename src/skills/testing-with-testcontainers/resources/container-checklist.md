# Container-per-dependency checklist

Run per dependency in the suite. Record: dependency, image tag, wait strategy, scope, result.

## Runtime verification (once per environment)

| Check | Docker | Podman |
| --- | --- | --- |
| Daemon reachable | `docker ps` | `podman ps` |
| Testcontainers client connects | default | `DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock` (rootless) or `unix:///run/podman/podman.sock` (rootful); socket enabled via `systemctl [--user] enable --now podman.socket` |
| Trivial container starts and is removed | `testcontainers/ryuk`-style hello-world passes | same — Testcontainers uses the Docker API over the Podman socket |

## Per-dependency setup

| Check | How |
| --- | --- |
| Image pinned | explicit tag, no `:latest` |
| Scope correct | suite scope (shared, read-mostly) vs test scope (mutating) — record which and why |
| Wait strategy set | Postgres: `Wait.forListeningPort` + SQL; Kafka: log strategy; HTTP: `Wait.forHttp` |
| Smoke interaction passes | one real query/publish/HTTP call after startup, before tests |
| Connection details via config | host/mapped port/credentials injected via env or test config |
| Teardown removes container | `afterAll` stop; verify `podman ps -a` / `docker ps -a` shows none leaked after run |

## Common dependencies

| Dependency | Module / image | Wait strategy |
| --- | --- | --- |
| PostgreSQL | `PostgreSQLContainer` (testcontainers) | built-in SQL wait |
| MySQL | `MySQLContainer` | built-in |
| Kafka | `KafkaContainer` (or GenericContainer + log) | log "started" / broker registered |
| RabbitMQ | `RabbitMQContainer` | built-in |
| Redis | `RedisContainer` / GenericContainer | PING via port |
| AWS (S3/SQS/SNS) | localstack `LocalStackContainer` | `Wait.forHttp("/health")` or log |
| HTTP stub | WireMock `WireMockContainer` | `Wait.forHttp` |
| Anything else | `GenericContainer` with exposed ports + wait | per image docs |

## CI

| Check | How |
| --- | --- |
| Runtime only, no services installed | CI image has docker or podman socket |
| Image cache | pull cache between runs (see automating-ci-test-pipelines) |
| No leaked containers | teardown on failure; runner cleanup as backstop |
