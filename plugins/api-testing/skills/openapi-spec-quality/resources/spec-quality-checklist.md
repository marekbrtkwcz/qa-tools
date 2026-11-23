# OpenAPI spec quality checklist

Run per spec (and in CI per change). Record: check, location, result.

## Lint (Spectral or equivalent)

| Check | Rule |
| --- | --- |
| Standard + OWASP ruleset enabled | errors block, warnings reported |
| Disabled rules have waivers | dated, owned, reasoned |
| Operation IDs unique and meaningful | `operationId` present, unique |
| No `$ref` cycles | resolvable references |

## Examples and schemas

| Check | How |
| --- | --- |
| Every example validates against its schema | run a JSON Schema validator over all examples |
| Every schema has a type | no bare `{}` where shape matters |
| Required matches implementation | cross-check with testing-api-contracts findings |
| Enums complete | all values the API can return are listed |
| Nullable documented | `nullable: true` where null is possible |

## Completeness

| Check | Expected |
| --- | --- |
| Every operation | summary + description + tags |
| Responses | success + error responses with schemas |
| Security | protected operations reference a declared scheme |
| Path params | declared and used consistently |
| Components | no orphaned schemas/responses; no duplicate concepts |
| Info block | title, semver version, contact, license |

## Consumers

| Check | Expected |
| --- | --- |
| Client codegen from spec | succeeds without patches, in CI |
| Docs generation | renders operations and examples correctly |
