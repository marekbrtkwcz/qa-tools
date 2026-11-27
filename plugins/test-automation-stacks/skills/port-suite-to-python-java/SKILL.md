---
name: port-suite-to-python-java
description: 'Ports this collection''s test conventions to pytest, JUnit 5 and NUnit instead of rewriting each skill per language: the TDD loop, fixture and page-object layering, unslop checks, fake clocks, retries and quarantine, naming, and visual baselines, each mapped to the closest runner equivalent. Use when a JS/TS suite must move to Python, Java or C#, when a pytest, JUnit or NUnit suite needs the same quality bar the JS skills describe, or when house rules must translate to a non-JS suite. For porting a browser suite to Playwright still in TypeScript use migrating-tests-to-playwright.'
argument-hint: 'The source suite or conventions being ported, the target language and runner, why the port happens, and how much of the suite is behavior-preserving translation vs deliberate redesign'
user-invocable: true
---

# Port a Suite to Python, Java or C#

Port the conventions, not the syntax.

This collection's skills are written against JS/TS runners, but nearly everything they say is a convention about behavior: tests prove things, retries are reported, fixtures stay honest, the clock does not leak. When a suite moves to pytest, JUnit 5 or NUnit, the mistake to avoid is rewriting each skill's guidance per language until it drifts. This skill is the translation layer: it maps each convention to the closest runner equivalent, names what the target cannot express, and makes the gap a decision instead of a silent quality drop.

## When to Use

- an existing JS/TS Playwright, Vitest or Jest suite is being ported to pytest, JUnit 5/Selenium, or NUnit
- a Python, Java or C# suite is being written or reviewed and must meet the bar that `writing-unit-tests`, `unslop-tests`, `stabilizing-flaky-tests` or `test-driven-development` describe
- a reviewer fluent in JS runners must judge a pytest/JUnit/NUnit suite and needs the house rules translated, not softened

## When NOT to Use

- the target is still TypeScript on Playwright: `migrating-tests-to-playwright` (Cypress/Selenium/WebDriverIO in, Playwright out - that is a framework migration, not a language port)
- the ask is *which layer* should test what, fixtures vs page objects vs helpers in the abstract: `designing-test-automation-architecture` decides; this skill only spells the decision out in the target runner
- the port is an excuse to rewrite behavior: a redesign wants product decisions, which no port skill supplies

## Operating Principles

- **One convention at a time.** Porting "the suite" fails; porting "the retry-with-flake-reporting convention" to `pytest.mark.flaky(reruns=2)` (or recording that no equivalent exists) succeeds and reviews well. Each mapping lands with a pasted run.
- **The convention outranks the runner.** If the target runner cannot express the rule (e.g. no built-in retried-pass distinction), say so and design the smallest explicit mechanism for it - do not drop the rule because the runner is silent.
- **Parity is the gate.** Ported tests prove the same behavior as the source tests: same scenarios, same failure modes. Dropped tests are a list with reasons, never a smaller number with no explanation.
- **Retry and quarantine keep their honesty rules.** Wherever the collection says "retries are CI-only and reported" (`automating-ci-test-pipelines`, `stabilizing-flaky-tests`), the same sentence must be true in the target: quarantine lists exist in every runner, as markers/labels - what must not exist is skipping with no record.
- **Do not fake JS idioms.** A pytest suite with a `pageObjects.js`-shaped class hierarchy is a museum. Use the target's native fixture mechanism and record the translation decision (jsdoc → docstrings, vitest fixture injection → pytest fixtures/JUnit extensions, and so on).

## Procedure

1. **Inventory the source conventions.** List which collection skills' rules the source suite actually follows: TDD flow, layering (fixtures/page objects), unslop tells, clock/time mocking, retry/quarantine policy, naming, visual baselines. Each row of this list is one porting unit; conventions the source never followed are out of scope - the port is not the moment to bolt them on (raise them separately instead).
2. **Fix the runner and its plugin set.** pytest: `pytest-cov`, `pytest-xdist`, `pytest-rerunfailures` or the built-in retry approach; JUnit 5: params/extensions + Surefire/Gradle config; NUnit: Retry/TestCaseSource + adapters. Pin versions; a port on floating plugin versions ports twice.
3. **Port one convention at a time, starting from the most load-bearing.** Layering first (fixtures/page objects - everything hangs on it), then the test bodies, then policy conventions (retry/quarantine/clock). Use `./resources/convention-mappings.md` as the mapping table; where the table says "no equivalent", design the explicit mechanism and write the decision down in the same table.
4. **Keep the parity list as you go.** Source test -> target test, one line, done. Anything with no target gets a reason. Run the count at each step; the list is the review artifact, and the DoD polices it below.
5. **Port the policies, not just the tests.** CI-only retries with flake reporting, `conftest.py`/base-extension invariants (timeout defaults, fake clock), marker/label taxonomy mirroring the JS tag taxonomy, quarantine markers with owner and reason. A language port that drops the flake-reporting policy was a net quality loss even with all tests translated.
6. **Prove the port, both colors.** Target suite green on the same behavior set as source; then break one deliberately ported behavior in the application and confirm a ported test fails - a port that never failed red proves nothing about what it preserved.

## Resource Map

- `./resources/convention-mappings.md` - read when a specific convention needs its runner spelling: the pytest / JUnit 5 / NUnit equivalents of this collection's rules (TDD loop, unslop tells, fixture layering, fake clock, retries and quarantine, naming, visual baselines), with a "no equivalent" column that is respected rather than glossed over

## Related Skills

- `migrating-tests-to-playwright` - the sibling skill for ports that stay in TypeScript; read its staging-slice approach even when the port changes language
- `writing-unit-tests` - the convention list being translated; read what the house rules say before mapping them to a new runner
- `test-driven-development` - the red-green loop is this skill's first mapping row when the target team practices test-first
- `unslop-tests` - what the JS spellings detect; the mappings table carries the same tells in pytest/JUnit/NUnit syntax
- `stabilizing-flaky-tests` - quarantine and retry policies, whose honesty rules must survive the port
- `test-reports-and-artifacts` - the report/evidence conventions, translated alongside the tests

## Definition of Done

- every source convention in the inventory has a target equivalent, or a recorded "no equivalent" with the explicit mechanism built for it - no row is blank
- the parity list accounts for every source test: ported, merged, or dropped-with-reason; counts appear in the handover
- a deliberately broken application behavior made a ported test fail - red proof pasted, not asserted
- retry and quarantine policies are expressed in the target and are visibly reported (e.g. a rerun counter in the summary or report), not silent
- the suite runs on CI for the target language with the same pass/fail evidence conventions as before (`test-reports-and-artifacts`)
- tool and plugin versions are pinned
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
