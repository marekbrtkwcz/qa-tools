---
name: quality-gates
description: Load this skill when defining or enforcing quality gates. Covers go/no-go release-readiness decisions from evidence, CI gate workflows (smoke on PR, full on merge, nightly), quality-gate thresholds, diff/change coverage vs whole-repo coverage, regression scoping after a change, quality waivers with expiry and owner, and recording change intent for audit.
user-invocable: true
---

# Quality Gates & Release Readiness

A quality gate is a **rule that blocks** when evidence is missing — not a dashboard someone may look at. This skill covers designing gates, wiring them into CI, and deciding go/no-go on evidence.

## Gate levels (every repo should have all four)

| Gate | Trigger | Scope | Typical budget |
|---|---|---|---|
| **Smoke** | every PR | fast subset (unit + critical path E2E) | < 10 min |
| **Full** | merge to main | whole suite + a11y/security/contract checks | < 30 min |
| **Nightly** | schedule | load/soak, visual matrix, cross-browser, LLM evals | hours OK |
| **Release** | before tag/deploy | all of the above + manual attestations + rollback drill | — |

Rules:

- Gates must be **required status checks** (branch protection) — a check nobody is forced to pass is a suggestion.
- Gate on **evidence**, not vibes: `tests passed`, `diff coverage ≥ 80% on changed lines`, `0 critical a11y violations`, `flaky rate < 2%`, `LLM eval groundedness ≥ 95%`.
- Flaky tests must not silently pass a gate: retries allowed for *reporting*, but the flaky list is a gate input (see `flaky-watch` hook) — a PR that adds a flaky test fails review.

## Diff coverage vs whole-repo coverage

Whole-repo coverage can look healthy while the changed lines are untested. Gate on **diff coverage** (LCOV/Cobertura per changed file):

```yaml
# .github/workflows/e2e.yml — example gate step
- name: Diff coverage gate
  run: |
    npx nyc report --reporter=json-summary
    node scripts/check-diff-coverage.js --threshold 80 --base origin/main
```

- Uncovered **high-risk** changed lines (auth, payments, migrations) → blocking finding, not a warning.
- New code without any test → gate fails; no exceptions without a waiver (below).

## 🔄 Regression scoping & change intent after a change

Not every change needs the full suite — but the decision must be **derived from the diff**, not from habit:

- Map changed files → owning test suites (via CODEOWNERS or a `test-mapping.yml`).
- Hotfix to `payments/` → run payments suite + contract + E2E checkout, skip docs-only suites.

**Change intent** — tests prove a change *works*, coverage proves it was *executed*; neither records *why*. On **high-risk changes** (new public exports/endpoints, auth edits, migrations, removed guards, AI-assisted diffs) record the rationale **durably and linked**: an `Intent:` commit trailer, an ADR the commit references, or a module intent register — not only a PR description that a squash-merge discards, and not chat. The intent names the *why* and the constraint that forced the shape, and a human confirms it (an agent may draft, never finalize). Low-risk changes (typo, rename) don't need it — demanding rationale everywhere trains filler.

## 🚦 Go / no-go release readiness

Produce an evidence-backed **recommendation** (you recommend, the risk owner decides), with residual risk stated plainly. Every criterion is **met / not met / unverified** — unverified is a distinct, reportable state, not a blank:

| Criterion | Evidence | Status |
|---|---|---|
| Exit criteria met | test run IDs, coverage report | ✅/❌/❓ |
| Open defects | severity profile, known-issues list, escape rate | ✅/❌/❓ |
| Coverage against **risk** (not just %) | diff-coverage + risk map of changed areas | ✅/❌/❓ |
| Environment parity | config diff staging vs prod | ✅/❌/❓ |
| Rollback readiness | rollback drill done, owner named, feature flag if any | ✅/❌/❓ |
| Manual attestations | dated register (code review, UAT, a11y pass) | ✅/❌/❓ |

Rules:

- **Coverage is judged against risk, not percentage** — 90% coverage of low-risk code with none of the payment path is a NO-GO dressed as a GO.
- **Recoverability offsets uncertainty** — a tested rollback + feature flag tolerates more residual risk than neither.
- **Absence of evidence is a finding** ("nobody tested the migration on production-sized data") — state it, don't smooth it over.
- Output format: `GO` / `NO-GO` / `GO WITH CONDITIONS` + one-paragraph rationale + residual risk + owner of each open item. A release decided "on impressions" is a NO-GO until evidence exists.

## 📜 Quality waivers

Skipping is allowed; **silent skipping is not**. A waiver = the same skip, but visible: four fields, always — **what, why, who, until when**.

```yaml
# .github/quality-waivers.yml
waivers:
  - id: WAIV-2026-11-20-visual
    gate: visual-regression
    reason: "baseline fonts broken on CI runner after Chrome 131 upgrade; needs fake fonts, tracked in PROJ-1234"
    owner: "@marek"            # a person or named team — "the team" owns nothing
    expires: 2026-11-27        # "never" is not a date
    ticket: "PROJ-1234"
```

Rules:

- The reason names the **blocker**, not the feeling — "flaky" is not a reason.
- **MUST gates are not waivable.** If a mandatory check can't be met, the answer is: the practice is wrong, the profile is wrong, or the work isn't done — fix one of those, don't waive.
- **Expired waiver = a finding**, reported every run until renewed with a **fresh justification** (rubber-stamping the old reason is how a 90-day waiver becomes a 3-year one) or removed. Expired = the gate fails automatically.
- Waivers are reviewed at release readiness — a pile of open waivers is itself a NO-GO signal.
- Never waive security or data-integrity gates silently; those need explicit sign-off from the owner + security.
- **Inventory the silent skips** already hiding in the repo: `test.skip`/`fixme`, `eslint-disable`, `@ts-expect-error`, `continue-on-error: true`, lowered thresholds, coverage ignores — each either gets a waiver with owner+expiry or gets removed.

## CI wiring example

```yaml
# .github/workflows/quality-gate.yml
name: Quality gate
on: [pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 } # needed for diff coverage
      - run: npm ci && npx playwright install --with-deps
      - run: npx playwright test --project=chromium   # smoke suite
      - run: python scripts/check-diff-coverage.py --threshold 80
      - run: python scripts/check-flaky.py --max-rate 0.02  # from JUnit XML
```

## 📊 Quality metrics & trends

Every metric is a **proxy** — pick ones that resist being gamed, and each must name the **decision it supports** (a number nobody acts on shouldn't be collected):

- **Definitions first**: flake = pass AND fail on same commit+command; escaped defect = found in prod after merge. Compute the same way twice or it's two metrics.
- **Trend over snapshot**: flake rate, suite duration, diff-coverage, escape rate, time-to-detect — direction over several releases is the signal.
- **Pair every metric with its counterweight**: pass rate with flake rate, speed with escape rate, coverage with mutation survival. A metric reported alone gets optimized alone.
- Report the metric **and** the action it triggered, in the same place (CI gate log / release report).

## 📏 Rules

- A gate that never fails is not a gate — test the gate itself (break a test on purpose in a sandbox branch, confirm the check goes red).
- Thresholds are **numbers with owners**, not aspirations: `p95 < 800ms (owner: @perf-team)`.
- Gate failures must be actionable: the log says *what* failed, *where*, and *how to fix or whom to ask*.
- Naming for gate-related tests/scripts: `should <result> when <condition>`.
- No secrets in gate configs; tokens via env/secrets only.

## ✅ Checklist

- [ ] 4 gate levels defined and wired as required checks
- [ ] Diff coverage gate on PRs (not just total coverage)
- [ ] Flaky-rate gate fed by JUnit/retry data
- [ ] Release readiness table from evidence — met / not met / **unverified**, risk-based coverage, residual risk, recommend-don't-decide
- [ ] Waiver mechanism: what+why+who+until, MUST not waivable, expired = finding, renewal needs fresh justification, silent-skip inventory done
- [ ] Change intent on high-risk changes: durable + linked (Intent trailer / ADR / register), human-confirmed — not PR-description-only
- [ ] Metrics defined (flake/escape/duration/coverage), each with its decision, trended, paired with counterweights
- [ ] Gate itself tested (sandbox red run)
