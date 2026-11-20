---
name: documenting-test-suites
description: 'Writes the documentation a test suite needs to be usable by someone who did not build it: quickstart from clone to green run, conventions, tag glossary, ownership, fixture/data rules, CI reality, honest coverage gaps, and decision records (ADRs). Use when onboarding someone into a suite, when "how do I run these" keeps being asked, or when a suite is inherited with no documentation. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 📚 Documenting Test Suites

Test documentation has one job: get a competent stranger from a fresh clone to a passing local run, then let them change something without breaking a convention they could not have known. Everything else is decoration. The discipline is knowing what **not** to write: a document that restates what the code already says goes stale within a sprint and then actively misleads.

## 🎯 When to Use

- a new joiner needs a path from clone to green and there is none
- "how do I run just the API tests" is a recurring question
- an inherited suite nobody knows why it is shaped that way
- an architecture decision will be re-argued in six months
- tags exist and their meanings live in one person's head
- fixture/seed rules only surface when you break them

## 🧭 Operating Principles

- **Write what the environment cannot tell you** — npm scripts belong in `package.json`; the reason two of them exist belongs in the README.
- **Optimize for the first hour** — the page that gets a stranger to green is the most valuable.
- **Every command is copy-pasteable and has been run** — an untested command is a broken promise.
- **Decisions get a record, not a comment** — why page objects over fixtures, why this runner, why the split.
- **Ownership is named** — an ownerless suite has no maintainer.
- **State what is not covered** — a reader assuming coverage that does not exist is worse off than one who knows the gap.

## 🔄 Workflow

### Phase 0: Name the readers

| Reader | Needs | Document |
| --- | --- | --- |
| New joiner | clone → green run | README quickstart |
| Developer adding a test | conventions, fixtures, where things go | README conventions + ADR |
| Someone debugging CI | env, secrets, artifacts, local repro | README CI section |
| Reviewer | tag meanings, PR expectations | tag glossary, contribution notes |
| Future maintainer | why the suite is like this | decision records |

One document for all five serves none — split by reader and link.

### Phase 1: Quickstart first

In order: prerequisites with exact versions → install (one command) → environment setup (which file to copy, which values, who to ask for secrets) → start dependencies → run (one command) → **expected result** (rough test count, duration, what green looks like — skipped almost always, and it is what tells a stranger their run went right) → top three troubleshooting entries. **Validation gate**: follow your own quickstart on a clean clone, fresh shell, no env vars; every place you had to know something undocumented becomes content.

### Phase 2: Conventions — only the ones a reader would get wrong
Where a new test goes by type · file/suite/title naming · locator policy and what is banned (`waitForTimeout`, CSS chains) · fixture/helper rules · data rules (seeding, cleanup, shared accounts, parallel safety) · assertion conventions · what a test PR must include. Each entry answers a question a reviewer asked more than once.

### Phase 3: Tag glossary

One row per tag: meaning, who runs it, where it runs, who may add it, and the CI filter mapping. Tags are a control surface — undocumented tags decay into personal shorthand.

### Phase 4: Decision records (test ADRs)

Per significant choice: the decision, the context that forced it, **the alternatives genuinely considered and rejected** (the load-bearing part), consequences including unhappy ones, revisit conditions. Candidates: runner choice, page objects vs fixtures, mocking policy, parallelization, environment strategy, suite splits, abandoned approaches.

### Phase 5: CI reality

Which workflows run when and against what · sharding and merged reports · where artifacts live (traces, videos, screenshots, coverage) and retention · which secrets exist and who administers them · how to reproduce a CI failure locally · retry policy and what a retried pass means.

### Phase 6: State the gaps

Areas with no coverage (and whether deliberate) · known flaky/quarantined tests with expiry dates · skipped tests and why · what the suite does not attempt to verify. This section stops the suite being trusted for more than it does, and feeds release readiness (`quality-gates`).

### Phase 7: Prune

Delete what the environment already states, steps for tools no longer used, commands not run since written, history that is not a decision record. Add a "last verified against a real run on <date> by <name>" line.

## ✅ Definition of Done

- readers named, each with a document aimed at them
- quickstart followed on a clean clone; every exposed missing assumption written down
- every command executed as written; expected result stated (count + duration)
- conventions cover only what a reader would get wrong
- every tag has meaning, runner, owner
- significant decisions have records including rejected alternatives
- coverage gaps, skips, quarantines listed honestly
- suite has a named owner; document has a last-verified date

## 🔗 Related Skills

- `designing-test-automation-architecture` — redesign the structure before documenting it
- `plugin-authoring` — when a convention should be enforced by instructions (AGENTS.md), not just written down
- `quality-gates` — consumes the coverage-gaps section
- `test-data-management` — when the data rules involve personal data
