---
name: python-for-testers
description: "Python fundamentals for testers writing automated tests: venv/uv + pyproject.toml, pytest core (fixtures, conftest.py, markers, parametrize), typing with mypy --strict, dataclasses/TypedDict for fixtures and DTOs, TypeGuard narrowing, ruff lint/format gate, pytest-playwright + httpx for E2E/API. Use when onboarding a tester to Python or leveling up a team on pytest. For porting JS/TS conventions to pytest use port-suite-to-python-java; for the tests themselves use writing-unit-tests."
argument-hint: "Team's current Python level and the test code that is hardest to maintain"
user-invocable: true
---

# Python for Testers

This is the language-leveling skill: enough Python to write tests that are readable, refactor-safe, and pass `mypy --strict` plus `ruff check` in CI. It is **not** about porting conventions from JS/TS (see `port-suite-to-python-java`) and **not** about test design (see `writing-unit-tests`, `designing-test-data`). Everything here runs in a pytest context, but the language concepts are runner-agnostic.

## When to Use

- onboarding a tester (manual or automation) to Python and pytest
- "our test suite has no type hints and mypy would explode — where do we start?"
- "fixtures vs conftest — what lives where?"
- leveling up: dataclasses/TypedDict for test data, `TypeGuard` for parsing API JSON, parametrize patterns
- reviewing PRs where tests mutate shared fixtures or leak `Any`

## Core concepts, in the order a tester needs them

1. **Syntax essentials.** Indentation is the grammar; list/dict/set comprehensions; f-strings for messages (`f"expected {expected}, got {actual}"` — the assertion message that saves debugging); `with` for resource cleanup (files, DB connections, `httpx.Client`).
2. **Virtual environments and dependencies.** Every project gets its own venv (`python -m venv .venv` or `uv venv`); dependencies live in `pyproject.toml` (or `requirements.txt`); never `pip install` into system Python. `uv` is the fast modern option for both venv and installs.
3. **Functions and defaults.** `def login(user: User, timeout: float = 5.0) -> None` — annotate parameters and return at the boundary; defaults must be immutable (never `def f(opts: list = [])` — use `None` + `or []`).
4. **Data shapes: dataclasses and TypedDict.** `@dataclass(frozen=True)` for fixture records (immutable — a mutated shared fixture is cross-test pollution); `TypedDict` for API DTOs/JSON shapes, so mypy checks `resp["user"]["email"]` keys. `total=False` variants for partial payloads.
5. **Typing and mypy.** Run `mypy --strict` over `src` + `tests` — tests are the code most worth type-checking. `Any` is the Python `any`: it disables checking; use `object`/`Unknown`-style narrowing (`cast` once, with a comment, or a `TypeGuard`). `Optional[X]` / `X | None` (Python 3.10+) must be handled explicitly — that kills "None has no attribute" flakes at check time.
6. **Narrowing and guards.** `def is_user(x: object) -> TypeGuard[User]` for parsing API JSON (`json.loads` returns `Any` — guard it immediately). Discriminated unions via `Literal`: `class Ok(TypedDict): kind: Literal["ok"]` / `class Err(TypedDict): kind: Literal["err"]` — narrow on `kind`, mypy enforces it.
7. **pytest core.** Test discovery (`test_*.py` / `*_test.py`, `Test*` classes, `test_*` functions); `assert` with plain expressions (pytest rewrites them — better messages than `assertEqual`); fixtures and scopes (`function` default, `module`/`session` for expensive setup) declared in the test module or `conftest.py`; `pytest.mark.parametrize` is the counterpart of `test.each`; markers (`-m "not slow"`) configured in `pyproject.toml`.
8. **Fixtures and conftest.** `conftest.py` holds shared fixtures (client, base_url, db) — one per directory, inherited downward; `yield` fixtures for setup/teardown (`with` under the hood); `tmp_path` for file fixtures; `monkeypatch` for env/attrs. Fixture depends on fixture — that is the pytest DI system, no frameworks needed.
9. **E2E and API in tests.** Browser: `playwright` (sync or async API) + `pytest-playwright` (`page` fixture, `browser_name` parametrization). HTTP: `httpx` (sync `Client` or async `AsyncClient`) — one typed wrapper returning a tagged union `Ok[T] | Err`, assertions narrow on `kind` instead of casting.
10. **Lint/format gate.** `ruff check` + `ruff format` in CI (the Python counterpart of Biome); `pytest --cov` via `pytest-cov` for coverage. ruff formats, mypy type-checks, pytest runs — neither replaces the others.

## Configuring a test project

Details in `./resources/pytest-project-config.md`. The short version: one `pyproject.toml` with `[tool.pytest.ini_options]` (testpaths, markers, addopts), `[tool.ruff]` (line-length 100, target-version), `[tool.mypy]` (`strict = true`) and `[tool.coverage]`; `ruff check . && ruff format --check . && mypy . && pytest` is the local gate, same four commands in CI.

## Cheatsheet

`./resources/cheatsheet.md` — one-page table: concept → syntax → test example → common pitfall.

## Red Flags

- mutable default arguments (`def f(items: list = [])`) — shared state across calls, classic flake
- fixtures mutating shared module-level data — use `frozen=True` dataclasses or factory functions returning fresh objects
- `Any` from `json.loads` leaking everywhere — parse once into a TypedDict behind a `TypeGuard`
- `cast(...)` at every assertion — the assertion is probably wrong; assert the real shape
- tests excluded from mypy "because they're tests" — tests are the code most worth type-checking
- over-engineering: deep generics in a test file — tests should be boring and readable; types serve clarity, not the other way around

## Related Skills

- `port-suite-to-python-java` - maps this collection's JS/TS conventions to pytest/JUnit/NUnit (the layer above this one)
- `writing-unit-tests` / `test-data-factories` - the tests and factories themselves (runner-agnostic rules)
- `testing-with-bun` - Bun is the JS/TS fast runner; the Python equivalents here are `uv` + `pytest-xdist`
- `static-code-analysis-typescript` - the JS/TS tooling gate; the Python gate is ruff + mypy described here

## Definition of Done

- the tester can read and write typed fixtures, API helpers and pytest tests without `Any`
- `mypy --strict` and `ruff check` pass over source + test code
- pytest runs green with markers and parametrize in use, coverage via `pytest-cov`
- at least one real test file was refactored from untyped/mutable fixtures to typed ones as the exercise
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
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.
