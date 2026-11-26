---
name: openapi-spec-quality
description: 'Audits the quality of an OpenAPI/Swagger specification itself: lint rules (Spectral or similar), valid examples, complete error responses, consistent naming, required vs optional accuracy, security scheme coverage, and documentation completeness — before the spec is used to generate clients, docs, or tests. Use when the spec is the product''s public contract, when generated clients or docs have wrong types, or when the spec has visibly diverged from what developers expect.'
argument-hint: 'OpenAPI spec file path or URL, the lint ruleset in use, and which consumers (docs, codegen, tests) depend on the spec'
user-invocable: true
---

# OpenAPI Spec Quality

Use this skill when the question is "is this spec good enough to be the contract" — not whether the implementation matches it (that is `testing-api-contracts`). A spec with invalid examples, missing error responses, and inconsistent naming produces broken generated clients, wrong docs, and tests that assert the wrong thing.

## When to Use

- the spec is published as the public API contract (docs portal, codegen, SDKs)
- generated clients or documentation show wrong types, missing endpoints, or bad examples
- a new spec is being written and needs a quality gate before review
- lint runs in CI but with rules nobody curated, or not at all
- the spec is about to be used to generate a client and nobody has read it end to end

## Operating Principles

- **Lint with a curated ruleset, not the default zoo.** Start from a standard ruleset (Spectral recommended/OWASP), then tune: every disabled rule needs a reason.
- **Examples must validate.** Every example in the spec must be valid against its own schema — an example that violates the schema trains consumers wrong.
- **Errors are part of the contract.** Every operation should document its error responses (4xx/5xx) with schemas; undocumented errors are spec gaps.
- **Naming is consistency.** camelCase vs snake_case, singular vs plural resource names, id naming — pick conventions and enforce by lint.
- **Security schemes must cover operations.** Every protected operation references a declared security scheme; global vs per-operation security is explicit.
- **The spec is read by humans too.** Descriptions on operations, fields, and parameters; no orphaned schemas; tags grouping operations logically.

## Workflow

### Phase 1: Run the linter

- run Spectral (or equivalent) with the project ruleset in CI; fail the build on errors, warn on warnings
- triage existing violations: fix, or add a dated waiver with a reason (`governing-quality-waivers`)

### Phase 2: Validate examples and schemas

Work through `./resources/spec-quality-checklist.md`:

- every `example`/`examples` value validates against its schema (run a validator, don't eyeball)
- every schema has a `type`; no `type: object` without `properties` where the shape matters
- required fields are actually required by the implementation (cross-check with `testing-api-contracts` findings)
- enums list all values the implementation can return

### Phase 3: Completeness pass

- every operation: summary + description, tags, documented responses including errors, security scheme where protected
- every path parameter appears in the path template and vice versa
- components (`schemas`, `responses`, `parameters`) are used, not orphaned; no duplicate definitions of the same concept
- info block: title, version (semver), contact, license

### Phase 4: Consumer checks

- generate a client or docs from the spec in CI; the generation must succeed without patches
- spot-check that generated types match the schemas and docs render examples correctly

### Phase 5: Keep it enforced

- lint + example validation run on every spec change in CI (`generating-quality-gate-workflows`)
- spec version bumps follow semver: breaking change = major

## Resource Map

- `./resources/spec-quality-checklist.md` - the lint, example-validation, and completeness checks. Read during Phases 2–3.

## Related Skills

- `testing-api-contracts` - validates the implementation against this spec, and diffs spec versions for breaking changes
- `generating-quality-gate-workflows` - wiring spec lint into CI as a blocking check
- `governing-quality-waivers` - dated, owned exceptions for lint rules
- `testing-documentation` - user-facing docs quality beyond the spec

## Definition of Done

This skill is complete when:

- the linter runs in CI with a curated ruleset; zero errors, warnings triaged or waived with reasons
- every example in the spec validates against its schema
- every operation documents success and error responses and references security schemes where protected
- client/docs generation from the spec succeeds unpatched in CI
- naming and structural conventions are enforced by rules, not by review memory
