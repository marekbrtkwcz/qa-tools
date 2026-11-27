# Convention Mappings: pytest / JUnit 5 / NUnit

Read when a specific convention needs its runner spelling. Rows map one collection convention to the closest runner equivalent; the "gap" column names what the target cannot express natively - respect it, do not let a translation hide it. Snippets are shapes: fit names and paths to the project.

## The TDD loop

| Convention (JS phrasing) | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| red before green: watch the new test fail for the right reason | run the single test (`pytest path::test_name`), confirm it fails with the expected assertion | run the method/class (`gradle test --tests` / IDE), same check | `dotnet test --filter`, same check |
| revert to green cycle-by-cycle | `git checkout -- <file>` same as JS | same | same |
| cycle log on long sessions | session notes file, unchanged by runner | same | same |

No gaps here: the loop is runner-independent by design.

## Naming and readability

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| test name states behavior under failure: `guest_cannot_see_basket` | snake-case function names, allowed to be long sentences | `@DisplayName` for sentences, method name short - `@DisplayName` is what appears in reports | `TestCase` naming conventions; NUnit has no display-name attribute - name the method for the sentence |

## Fixture and layering (fixtures, page objects, helpers)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| setup/teardown per test | `@pytest.fixture` + dependency injection into the test signature | `@BeforeEach`/`@AfterEach`, or an `Extension` for shared logic | `[SetUp]`/`[TearDown]` |
| setup/teardown per file/suite | fixture in `conftest.py`, or `scope="module"/"session"` | `@BeforeAll`/`@AfterAll`, or a class-level extension | `[OneTimeSetUp]`/`[OneTimeTearDown]` in a `[SetUpFixture]` class |
| page objects (per `designing-test-automation-architecture`: a page object is a class, not a helper bag) | plain classes in `pages/`, constructed with the page fixture, one per fixture-injected page | plain classes taking the driver/page in the constructor | plain classes taking `IPage`/driver; for Playwright-dotnet, pages built from `IPage` factory fixtures |
| shared user fixtures (e.g. authenticated context, per `testing-auth-flows`) | fixture returning a session-scoped storage state; parallel-unsafe fixtures must opt out of `xdist` distribution | a base extension writing storage state; suite order matters in JUnit - state the order rule out loud | suite fixture: `SetUpFixture` with storage state; TestCaseSource for per-role data |

Gap column: pytest fixtures compose by injection (closest to vitest); JUnit 5 and NUnit attach by inheritance/attribute - a "helper bag" temptation returns under the new name of "base class". Keep the page-object rule as written; it survives translation directly.

## Fake clock, time and timezone (per `mocking-network-and-time`)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| freeze the clock, never sleep | `freezegun` (`@freeze_time("2026-11-01 10:00:00")`) or injected clock object | inject a `Clock` into the unit under test (no freezegun equivalent for statics on par - inject instead); `java.time.Clock.fixed(...)` | inject `ISystemClock`/`TimeProvider` into the unit under test |
| fixed timezone for the test run | `TZ` env var in CI, or freezegun's `tz_offset` | `-Duser.timezone=...` in the runner JVM args | set `TimeZoneInfo` in fixture when injecting; when relying on ambient culture, set `CultureInfo` explicitly instead |
| travel time mid-test (tick the scheduler) | `freezegun`'s `tick()`, or an injected fake clock | injected fake `Clock` advanced by hand | injected fake `TimeProvider` advanced by hand |

Gap: JS runners let tests sometimes date the *framework's* timers globally; in Java/C# the honest answer is a wider refactor toward injection - flag the refactor cost before the ported test starts sleeping for real. Sleeping in the ported test is the failure to name out loud.

## Assertions and unslop tells (per `unslop-tests`)

| Tell | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| tautological assertion | `assert result == result` survives any linter - the unslop review is manual in all three (see the skill's checklists) | same | same |
| value compares with itself / `assertTrue(True)`-style | same manual rule; note these frameworks reopen the static-import `assertTrue` door that vitest lacks | same | same |
| vague failure output | `assert x == y, "basket total after discount"` - the message param exists, use it | `assertEquals(expected, actual, "basket total after discount")` - JUnit silently yields clean diffs on the first two args even without the message | `Assert.That(actual, Is.EqualTo(expected), "basket total after discount")` |
| swallowed exception (`try/except: pass`) | code review; `pytest.raises` narrows the exception type - bare `Exception` is the tell to flag | JUnit's `assertThrows` scopes the exception exactly - untested catches in code are manual review | `Assert.Throws<T>`; also, Python typing against raw `except Exception:` is code-level |
| hard wait instead of an event | Python `time.sleep` in tests is the direct spell; Playwright-Python re-uses `expect` (auto-waiting) unchanged | Java Playwright `assertThat`-auto-wait API = same rule; selenium waits = `WebDriverWait`-with-lambda | Playwright-dotnet `Expect` auto-waits; selenium = `WebDriverWait` |

## Parametrized tests and data kits (per `writing-unit-tests` boundary cases / `designing-test-data`)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| one scenario, many datasets | `@pytest.mark.parametrize([...], [...])` | `@ParameterizedTest` + `@ValueSource`/`@CsvSource`/`@MethodSource` | `[TestCase(...)]` per row, or `[TestCaseSource(nameof(...))]` for complex sets |
| data lives in a fixtures file, not inline | `conftest.py` fixture or a `load_cases()` helper consuming JSON/YAML | `@MethodSource` returning a stream from the same files | `TestCaseSource` property from the same files |
| boundaries first | same rule; parametrize boundaries as named rows so failures say "boundary: empty list", not "test[12]" | same; use `@CsvFileSource`/method names for readable case titles | same; NUnit `TestName` on TestCaseSource rows for readable titles |

## Retry and quarantine (per `stabilizing-flaky-tests`, `automating-ci-test-pipelines`)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| `retries: CI ? 2 : 0` - rerun only in CI, report the rerun | `pytest-rerunfailures` with reruns set via CI env var; the plugin prints "RERUN" per attempt to stdout, and flaked tests are reflected in the summary | no built-in retry in-stock JUnit 5 - use the retry extension pattern (a `TestExecutionExceptionHandler`/extension) or a runner-level retry in Surefire/Gradle config; **gap**: a green-on-retry is invisible in plain JUnit XML - emit reruns to the report explicitly (see `test-reports-and-artifacts`) | `[Retry(n)]` on the test - restrict via an environment check so local runs do not silently rerun; NUnit reports the retry count in the result XML |
| quarantine with owner + reason + expiry (per `governing-quality-waivers`) | `@pytest.mark.quarantine(reason="...", owner="...", until="2026-12-01")` + deselect in CI via marker expression + an inventory command that lists quarantined tests | JUnit 5 `@Disabled("quarantine: reason | owner | until")` (or a custom annotation) + a documented list in the repo | `[Ignore("quarantine: reason | owner | until")]` + same documented list |
| the two layers must exist as buttons - make the quarantine visible, don't paste over it | CI prints quarantined tests each run (pytest: `--markers`- query in CI script) | CI greps the list of disabled-with-reason tests from the report (or keeps it as a checked-in manifest diffed at runtime) | NUnit result XML has skipped-with-reason; CI surface prints it |

Gap column honored: JUnit's green-on-retry invisibility is the row that gets overlooked most. A port that "handles it" by raising the Surefire rerun count in silence has skipped a convention, not translated it.

## Visual baselines (per `running-visual-regression-tests`)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| same image per baseline-name, masked dynamic regions, update as a reviewed step | Playwright-Python's built-in screenshot assertions (`expect(page).to_have_screenshot(...)`) - same native snapshot machinery as the TS runner | Playwright-Java screenshot assertions; or `pixelmatch-java` for standalone diffs - same masking/baseline rules | Playwright-dotnet `ToHaveScreenshotAsync()` |

Rule from the source skill kept verbatim: baselines are committed, updates are an explicit reviewed run, per-environment needs animate masking the same way. The runner changes; none of those sentences does.

## Running and reporting in CI (per `test-reports-and-artifacts`, `automating-ci-test-pipelines`)

| Convention | pytest | JUnit 5 | NUnit |
|---|---|---|---|
| one line to run locally, no IDE | `pytest` (plus defaults in config file) | `mvn test` / `gradle test` | `dotnet test` |
| merged report; JUnit XML out | `--junitxml=report.xml`; parallel: `pytest-xdist` (deselect nothing, it scales by `-n`) | Surefire writes JUnit XML per module - a merge step matters here; parallel: JUnit 5 parallel config | NUnit3 adapter + `dotnet test` writes TRX; convert TRX to JUnit XML when Xray/TestRail is downstream (see `test-management-integration`) |
| trace/video/screenshot on failure | Playwright-Python config unchanged in shape: `trace: "retain-on-failure"`, etc. | Playwright-Java same keys in code config | Playwright-dotnet same |
| suite-level exclusion list with each excluded test's reason named | covered by the quarantine row above | same | same |
