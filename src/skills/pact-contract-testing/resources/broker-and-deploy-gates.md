# Broker Setup and Deploy Gates

Read when standing up the broker or wiring `can-i-deploy` into pipelines. Commands are shapes against the pact-foundation CLI family (the `pact-cli` container, the `pact-broker` broker-client commands such as `can-i-deploy` and `record-deployment`, and the per-language bindings' own CLIs); resolve exact image tags and token flags to the versions in use, and pin them in the pipeline like any other dependency.

## One-command broker (docker-compose)

```yaml
services:
  pact-broker:
    image: pactfoundation/pact-broker:<pinned version>
    ports: ["9292:9292"]
    environment:
      PACT_BROKER_DATABASE_URL: postgres://brokero:pw@db/broker
      PACT_BROKER_BASIC_AUTH_USERNAME: ""
      PACT_BROKER_ENABLE_PUBLIC_READ: "false"
  db:
    image: postgres:<pinned version>
    environment: { POSTGRES_USER: brokero, POSTGRES_PASSWORD: pw, POSTGRES_DB: broker }
    volumes: ["pact-db:/var/lib/postgresql/data"]
volumes: { pact-db: {} }
```

- Persist the `pact-db` volume - a broker that forgets its matrix forgets every deployment record, and can-i-deploy answers from an empty history.
- Auth: a read token for CI consumers + a write token for publishing (per-environment tokens in mature setups). Tokens are CI secrets, never committed.
- After bring-up: publish one sandbox consumer/provider pair and confirm the matrix renders, including a recorded verification. A broker nobody has published to is a status page.

## can-i-deploy decision table

Ask this once per deploy direction, in the pipeline that deploys.

| Deploying | Verify with | Blocking question |
|---|---|---|
| consumer to env E (no provider change) | provider versions **recorded as deployed in E** | is my pact's conversation verified by what already runs there? |
| provider to env E (probably breaking) | consumer versions **recorded as deployed in E**, or broader: all consumer `main`-branch tags | will the consumers that live in E survive my change? |
| both move together (paired release) | the specific counterpart version being deployed | do the two exact versions about to run have a verified conversation? |

Mechanics notes:

- Post-deploy, every side records the deployment against the environment (`record-deployment`, or `record-release` for non-environment release models). Miss this and the next can-i-deploy on either side loses its ground truth - the table above reads deployment records, not intentions.
- Pairwise/system-mode can-i-deploy (multiple contracts participating in one release) exists for platform releases; most teams need the table above for months before they need it.
- Fail closed: a broker outage makes can-i-deploy fail; that is the correct default. Turning the gate into a warning is a waiver - see `governing-quality-waivers` for recording it.

## Webhooks: make provider verification pull-based

Consumer publishes -> broker webhook -> provider CI verifies -> results land on the matrix, without the consumer team telling anyone:

1. Webhook on `contract_published` (and `contract_requiring_verification_published` for WIP/pending pacts) targeting the provider verification workflow.
2. The webhook body carries consumer name + version; the provider pipeline template against those consumes pacts for exactly that consumer version.
3. Provider verification workflow publishes results back with the pact's consumer version - loop closed.
4. Test it by publishing a sandbox pact and watching the pipeline fire; do not trust webhook config that has never fired.

## State-handler checklist (provider side)

An untested state handler is a verification result nobody should trust:

- every provider's state handler no-ops loudly when the state is unknown (fails with "no handler for state: X"), not silently passes
- handler and fixture naming matches the states consumer pacts declare exactly - states are part of the contract, drift both ways breaks verification meaning
- fixture data is created per verification run and torn down after; handlers sharing a DB between tests reproduce (and hide) order dependence
- no handler reaches production systems or production-shaped data; `handling-sensitive-test-data` applies to what it seeds
- verification runs against the real app started in test config (with its real routing/middleware) - an app stub "for verification speed" verifies nothing and converts the whole matrix into fiction

## Failure meanings (paste these next to the gate)

| Gate failure | Meaning | First move |
|---|---|---|
| verification missing for recorded deployed consumer | provider change breaks what lives in E | look at the verification errors, verify locally against the named consumer version |
| verification failed (not missing) | real contract breakage | diff actual vs expected response; matchers or provider behavior changed |
| no deployment records for E | record-keeping hole, matrix is blind for that env | record the current deployed version once, by hand |
| consumer pact not found | consumer never published / wrong provider name | check the pacticipant pair matches by name exactly (`Consumer` is not `consumer`) |
