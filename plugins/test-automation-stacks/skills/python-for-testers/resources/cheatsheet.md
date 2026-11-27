# Python cheatsheet for testers

One page. Syntax → test-flavored example → the pitfall that bites in suites.

| Concept | Syntax | Test example | Pitfall |
| --- | --- | --- | --- |
| f-string message | `f"got {actual}, want {expected}"` | assertion messages | `str.format` or `+` — noise |
| venv | `python -m venv .venv` / `uv venv` | project-local env | installing into system Python |
| deps | `pyproject.toml` + `uv pip install -e .` | pinned test deps | floating `requirements.txt` without lock |
| annotate boundary | `def login(u: User, timeout: float = 5.0) -> None` | helpers, fixtures | annotating every local — noise |
| mutable default | `def f(items: list | None = None)` | options with defaults | `def f(items: list = [])` — shared state |
| dataclass (frozen) | `@dataclass(frozen=True) class User: id: str; email: str` | fixture records | mutable dataclass mutated across tests |
| TypedDict | `class UserDTO(TypedDict): id: str; email: str` | API JSON shapes | `dict[str, Any]` — no key checking |
| Optional | `def find(id: str) -> User \| None` | missing-record case | forgetting the `None` check — mypy strict catches it |
| TypeGuard | `def is_user(x: object) -> TypeGuard[UserDTO]` | parsing `json.loads` | `json.loads` returns `Any` — guard immediately |
| discriminated union | `kind: Literal["ok"]` vs `Literal["err"]` in TypedDicts | API result wrapper | accessing `data` without narrowing on `kind` |
| cast once | `user = cast(UserDTO, raw)` + comment | third-party untyped lib | casting at every call site instead |
| fixture | `@pytest.fixture def client(): ...` | shared httpx client | module-level mutable globals instead |
| yield fixture | `@pytest.fixture def db(): yield conn; conn.close()` | setup/teardown | `return` instead of `yield` — no teardown |
| conftest.py | shared fixtures per directory | base_url, client, auth token | duplicating the same fixture in every module |
| parametrize | `@pytest.mark.parametrize("status", [200, 201, 400])` | status-code matrix | writing three near-identical tests |
| marker | `@pytest.mark.slow` + `-m "not slow"` | skip slow in CI smoke | unregistered marker warnings — declare in pyproject |
| tmp_path | `def test_export(tmp_path: Path)` | file download assertions | writing into the repo dir |
| monkeypatch | `monkeypatch.setenv("API_URL", "http://x")` | env-dependent code | leaking env between tests — use the fixture |
| pytest-playwright | `def test(page: Page)` | browser E2E | mixing sync playwright API with async fixtures |
| httpx client | `with httpx.Client(base_url=...) as c:` | API tests | client not closed — use `with` or fixture |
| ruff | `ruff check . && ruff format --check .` | CI gate | skipping format check — diffs in review |
| mypy strict | `mypy --strict src tests` | CI gate | excluding tests from mypy |
| coverage | `pytest --cov=src --cov-report=term-missing` | CI gate | whole-repo % hiding untested new code |

Rule of thumb: **types serve readability of the test**. If an annotation makes the test harder to read, the annotation is wrong, not the test.
