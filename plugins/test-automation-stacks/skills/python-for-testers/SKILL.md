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
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
