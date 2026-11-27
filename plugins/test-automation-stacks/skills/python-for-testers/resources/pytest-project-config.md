# pytest project config for testers

One `pyproject.toml` carries the whole local gate. Copy this as the starting point for a new Python test project.

```toml
[project]
name = "app-tests"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "pytest",
  "pytest-cov",
  "pytest-xdist",        # parallel runs: pytest -n auto
  "pytest-rerunfailures", # CI-only retry policy, reported as flakes
  "pytest-playwright",
  "playwright",
  "httpx",
]

[project.optional-dependencies]
dev = ["mypy", "ruff"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra --strict-markers"
markers = [
  "slow: long-running tests, skipped in CI smoke (-m 'not slow')",
  "flaky: known-flaky, quarantined with owner and reason",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "SIM"]

[tool.mypy]
strict = true
python_version = "3.11"

[tool.coverage.run]
source = ["src"]
```

## The four-command gate

Same locally and in CI — none replaces another:

```bash
ruff check .            # lint
ruff format --check .   # format
mypy .                  # types (strict)
pytest -n auto          # tests
```

## Conventions that map from this collection's JS/TS rules

- **Strict types** = `mypy --strict` over `src` + `tests` (the counterpart of `tsc --noEmit` with `strict` + `noUncheckedIndexedAccess`). Do not exclude `tests/` from mypy.
- **Lint/format** = `ruff check` + `ruff format` (the counterpart of Biome). Pin the ruff version in dev deps — a floating formatter reformats twice.
- **Retries are CI-only and reported**: `pytest-rerunfailures` with `--reruns 2` in CI only, never locally; rerun-passed tests are flakes and get reported, not silently green. Quarantine = the `flaky` marker with an owner and reason in the test docstring — no silent skips.
- **Markers mirror the JS tag taxonomy**: declare every marker in `pyproject.toml` (`--strict-markers` fails on typos, like an unknown tag).
- **Fixtures over globals**: shared setup lives in `conftest.py` as fixtures, not module-level mutable state.
- **Fake clocks**: `freezegun` (or `pytest-freezegun`) for time, `respx` for mocking httpx — the counterpart of `mocking-network-and-time`.
