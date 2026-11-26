---
name: testing-documentation
description: 'Tests docs and onboarding the way its audience consumes it: follows setup and onboarding steps verbatim in a clean environment and records every step that fails, misleads, or assumes undocumented knowledge - READMEs, quick-starts, runbooks, and the product''s own error messages. Produces a per-step findings table with quoted doc lines and actual results. Use when a repo is about to onboard new people, docs must be re-verified after a big change, or docs are suspected of lagging behind the product. Test-suite docs: documenting-test-suites. API schema conformance: testing-api-contracts.'
argument-hint: 'The doc artifact to verify, its intended audience, and how clean an environment is available'
user-invocable: true
---

# Testing Documentation

Use this skill to test documentation as a product: a new user follows it word for word in a clean environment, and every place where reality disagrees with the doc becomes a finding with evidence.

Documentation is the highest-leverage manual test surface in most repos: it is the first thing every newcomer executes, it breaks silently on every code change that touches setup, and nobody notices until the next hire loses a day to it. This skill is how that gets noticed before the next hire.

## When to Use

- A repo or product is about to onboard new people and docs must work for them
- Docs must be re-verified after a big change
- User-facing docs are suspected to lag behind the product
- Testing documentation as a product: following it word for word in a clean environment

## When NOT to Use

- Writing or restructuring docs for a test suite - `documenting-test-suites` owns that deliverable; this skill only verifies what docs claim against reality.
- API response conformance to OpenAPI - `testing-api-contracts`.
- Verifying that a doc's *content* matches requirements (was the right thing documented) - `review-requirements`; here the question is whether documented steps actually work.
- API reference generation - generated references drift less when generated well; this skill targets hand-written prose paths.
- Internal UX or copy style - out of scope; only readability of error states as the final fallback doc of the product is in scope (step 5).

## Procedure

### 1. Frame the pass

- Pick **one artifact** and read its own claim about the audience and time: a README quick-start promising "running in 5 minutes", a runbook promising "restore from backup", an onboarding guide promising "your first test case".
- Write down both before starting: what would a clean environment mean for you (fresh clone, fresh container, fresh account - state upfront), and the maximum time you will give the doc's promise before considering it misleading.
- Environment hygiene: residual state matters more here than anywhere else - run in the cleanest environment available, otherwise every step that relies on prior configuration will pass and later fail on a real newcomer's machine.

### 2. Follow verbatim

- Execute the doc as written, no shortcuts, no consulting internal knowledge: **copy-paste every command; trust every path; assume nothing extra exists.**
- Never fix silently. When a step fails and you know the fix, that is the finding's content - do not fix and continue; note the exact quote, then continue (a fix applied silently hides the finding from the next reader).
- Note the doc location (section, line) for every step, not just failures - the report needs the step count as denominator ("steps 1-14: 11 passed, 2 broken, 1 misleading").
- When a step cannot be attempted (prerequisite not provided by the doc or your environment), mark it SKIPPED with the reason.

### 3. Classify each failure

- **Broken** - the step's command or action errors; evidence: the exact error output. Swapped args, changed flags, renamed paths.
- **Misleading** - the step executes but teaches a wrong mental model, or looks right and silently produces something else other than claimed ("test suite green" while 0 tests collected). Evidence: the actual vs. the documented outcome.
- **Missing** - a prerequisite, version constraint, or config value the doc needed but never stated; the newcomer gets an error whose fix lives only in tribal knowledge. Evidence: the error that resulted.
- **Outdated** - content still true of an old version but false of the current one (old flags, old URLs, renamed things). Evidence: current-behavior proof.
- **Audience mismatch (internal)** - step requires knowledge or access the stated audience cannot have (internal hostnames, credentials, jargon); evidence: the step plus the audience definition from step 1.

### 4. Record per failing step

For each finding: doc location + quoted line, what you did, actual result with evidence (error output verbatim, screenshot), classification (step 3), and the smallest fix hint (a suggestion, so the docs owner can fix fast - not a rewrite).

### 5. Error-message readability (the product's last doc)

The product's own error messages are the documentation users actually read on their worst day. Trigger the errors the doc warns about (or that occurred naturally), and check each message carries: **what happened, likely cause, what to do next**. Name findings that are just codes or blame-the-user prose ("invalid input" with no field named). Do not judge tone beyond that; this is triage, not copywriting.

### 6. Report and route

One table (template below), findings ordered by how early in the doc they block a newcomer (a broken step 2 outranks a broken step 14 - victims decrease with depth), then:

- broken/misleading/missing items → the docs repo as issues or PRs (each has a quoted line; PRs are often smaller than the discussion to write) - via `handling-sensitive-test-data` rules if screenshots capture real data
- error-message findings → `reporting-bugs` tickets for the product
- runbook/ops findings → `tech-debt-analysis` items when the fix is structural (the runbook was wrong for years, not a typo)

## Report template

```markdown
# Documentation test: <artifact> for <audience>
Date: <date>   Clean env: <what was fresh>   Doc promise: <"running in 5 min"?>   Actual: <time>
Steps: 1-<n>   Verdicts: <x passed, y broken, z misleading, w missing, v outdated, u skipped>

| # | Doc location | Quoted line | Actual result | Class | Fix hint |
|---|--------------|-------------|---------------|-------|----------|
| 4 | README "Setup" | `npm run bootstrap` | ENOENT script | Broken | script renamed to `setup` in 0.9 |
| 7 | README "First test" | "you will see 3 passing" | 0 tests collected | Misleading | collector ignores *.spec.ts by default |
```

## Decision Rules

**Prefer a fresh container/VM over your daily environment when:** any doubt exists about leftover config - the pass is only as good as its environment is newcomer-like.

**Prefer full runs when:** ever possible - complete runs, even with failures, produce verdict percentages; stopping after a failing step is only justified when the environment becomes unusable.

**Prefer PRs over issues when:** the fix is mechanical (typos, renamed commands) - the issue thread costs the docs owner more than a review.

**Prefer measuring the doc's promise when:** the doc states a time or outcome ("5 minutes", "you will see...") - comparisons like "promised 5 min, took 43" are the strongest findings a doc can get.

**When time-boxed:** cover the doc's primary path first; appendices, troubleshooting and FAQ sections second; a verified primary path is the finish line, a verified appendix is a bonus.

## Related Skills

- `documenting-test-suites` - writing the docs this skill then verifies
- `testing-api-contracts` - the API-reference counterpart (spec conformance, not prose)
- `reporting-bugs` - for product-side findings (error states)
- `manual-release-testing` - the release pass that shares the clean-environment discipline; install docs fail there too
- `handling-sensitive-test-data` - screenshots and outputs may contain real data
- `tech-debt-analysis` - for structurally stale docs, not typos

## Definition of Done

- [ ] Artifact, audience, and environment cleanliness recorded before the run
- [ ] Every step executed verbatim or marked SKIPPED with reason
- [ ] Each failing step has: location, quoted line, actual result, evidence, class, fix hint
- [ ] Findings routed: docs fixes vs. product bugs vs. debt items
- [ ] The doc's own promise (time, outcome) checked and reported against
- [ ] A newcomer-blocking step 1-3 cannot remain unreported at pass end

## Example prompts

- `/testing-documentation test the README quick-start as a new developer, fresh clone`
- `/testing-documentation verify the onboarding guide still works after the 2.0 migration`
- `/testing-documentation run through the restore-from-backup runbook and time it`
- `/testing-documentation check whether our error messages tell a lost user what to do next`
