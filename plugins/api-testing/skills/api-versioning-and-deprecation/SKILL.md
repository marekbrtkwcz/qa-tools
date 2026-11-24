---
name: api-versioning-and-deprecation
description: 'Manages and tests API versioning: version negotiation (path, header, media type), running old and new versions in parallel, deprecation signalling (Deprecation and Sunset headers, changelog), client migration tracking, and safe removal of a version. Use when a breaking change requires a new API version, when a deprecated version must be sunset, or when clients on old versions need to be identified before removal.'
argument-hint: 'The versioning scheme in use, the versions currently live, the deprecation policy, and the planned sunset date'
user-invocable: true
---

# API Versioning and Deprecation

Use this skill when a breaking change cannot ship in place and a version boundary is the answer. Versioning done badly means zombie versions that nobody can remove because nobody knows who still calls them. The discipline here is: signal deprecation loudly, measure usage per version, and remove only when the data says it is safe.

For detecting breaking changes between versions use `testing-api-contracts` (spec diff) and `pact-contract-testing` / `contract-testing-graphql` (consumer-driven).

## When to Use

- a breaking change requires v2 alongside v1
- a deprecated version is approaching its sunset date
- clients on old versions must be found before removal
- the versioning scheme (path vs header vs media type) is being changed or is inconsistent
- dual-running versions must return equivalent results

## Operating Principles

- **One versioning scheme, applied consistently.** Mixing `/v2/` paths with `Accept: application/vnd.x+json; version=2` headers confuses everyone; pick one per API and document it.
- **Deprecation is a signal, not a surprise.** `Deprecation` header (RFC 8594 style) with a date or version, `Sunset` header with the removal date, plus a changelog entry and direct notice to known consumers.
- **Measure before removing.** Per-version request logs (or tracing tags) tell you who still calls the old version; removal without this data breaks unknown clients.
- **Dual-run equivalence.** While two versions run, the same request to both must return semantically equivalent results — test it.
- **Removal is a deploy like any other.** Contract verification against remaining consumers must pass; the sunset date must have passed; the changelog must announce it.

## Workflow

### Phase 1: Inventory the versions

- live versions, the negotiation mechanism each client uses, and per-version usage (from logs/tracing) over a representative window
- which consumers are known, and how they will be notified

### Phase 2: Test version negotiation

Work through `./resources/versioning-checklist.md`:

- request without version → default version per design (usually latest, or oldest supported — record which)
- request with unsupported version → documented error (400/406), not a silent default
- request with deprecated-but-live version → works, and carries the deprecation signal
- header vs path vs media-type negotiation behaves identically per the chosen scheme

### Phase 3: Dual-run equivalence

- same logical request to v1 and v2: responses semantically equivalent (fields mapped, types compatible per the migration guide)
- side effects identical: one event, one row — not duplicated by dual handling

### Phase 4: Deprecation signalling

- deprecated version responses include `Deprecation` and `Sunset` headers with correct values
- changelog and docs name the sunset date, the migration path, and the breaking changes
- known consumers were notified (record when/how)

### Phase 5: Sunset

- usage of the old version is zero (or only known, notified stragglers) over the measurement window
- contract verification against remaining consumers passes
- after removal: requests to the old version get the documented "gone" response (410 Gone), not a 404 mystery
- monitor post-removal for surprise callers

## Resource Map

- `./resources/versioning-checklist.md` - negotiation, equivalence, signalling, and sunset checks. Read during Phases 2–5.

## Related Skills

- `testing-api-contracts` - spec diff between versions finds the breaking changes
- `pact-contract-testing` - can-i-deploy verifies consumers before a version is removed or changed
- `testing-microservices` - version boundaries as service seams
- `generating-quality-gate-workflows` - wiring usage measurement and contract verification into CI
- `communicating-quality-findings` - announcing deprecation to stakeholders

## Definition of Done

This skill is complete when:

- live versions and the negotiation scheme are inventoried, with per-version usage measured
- negotiation edge cases (default, unsupported, deprecated) return the documented responses
- v1/v2 dual-run equivalence was verified for responses and side effects
- deprecation headers and changelog entries exist with dates
- the sunset path ran with zero unnotified usage and contract verification green, or removal was deferred with a recorded reason
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
