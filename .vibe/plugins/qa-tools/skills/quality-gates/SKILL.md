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

## Regression scoping after a change

Not every change needs the full suite — but the decision must be **derived from the diff**, not from habit:

- Map changed files → owning test suites (via CODEOWNERS or a `test-mapping.yml`).
- Hotfix to `payments/` → run payments suite + contract + E2E checkout, skip docs-only suites.
- Record the reasoning in the PR description ("change intent"): what changed, what could break, what was retested and why that's enough.

## Go / no-go release readiness

Produce an evidence-backed recommendation, with residual risk stated plainly:

| Criterion | Evidence | Status |
|---|---|---|
| Exit criteria met | test run IDs, coverage report | ✅/❌ |
| Open defects | severity profile, known-issues list | ✅/❌ |
| Diff coverage of the release branch | diff-coverage report | ✅/❌ |
| Environment parity | config diff staging vs prod | ✅/❌ |
| Rollback readiness | rollback drill done, owner named | ✅/❌ |
| Manual attestations | dated register (code review, UAT, a11y pass) | ✅/❌ |

Output format: `GO` / `NO-GO` + one-paragraph rationale + residual risk + owner of each open item. A release decided "on impressions" is a NO-GO until evidence exists.

## Quality waivers

Sometimes a gate must be bypassed — make it **visible, time-boxed, and owned**:

```yaml
# .github/quality-waivers.yml
waivers:
  - id: WAIV-2026-11-20-visual
    gate: visual-regression
    reason: "baseline fonts broken on CI runner after Chrome 131 upgrade"
    owner: "@marek"
    expires: 2026-11-27
    ticket: "PROJ-1234"
```

Rules:

- Every waiver has: reason, owner, **expiry date**, linked ticket. Expired waiver = gate fails again automatically.
- Waivers are reviewed at release readiness — a pile of open waivers is itself a NO-GO signal.
- Never waive security or data-integrity gates silently; those need explicit sign-off from the owner + security.

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

## Rules

- A gate that never fails is not a gate — test the gate itself (break a test on purpose in a sandbox branch, confirm the check goes red).
- Thresholds are **numbers with owners**, not aspirations: `p95 < 800ms (owner: @perf-team)`.
- Gate failures must be actionable: the log says *what* failed, *where*, and *how to fix or whom to ask*.
- Naming for gate-related tests/scripts: `should <result> when <condition>`.
- No secrets in gate configs; tokens via env/secrets only.

## Checklist

- [ ] 4 gate levels defined and wired as required checks
- [ ] Diff coverage gate on PRs (not just total coverage)
- [ ] Flaky-rate gate fed by JUnit/retry data
- [ ] Release readiness table produced from evidence, with residual risk
- [ ] Waiver mechanism: owner + expiry + ticket, expired = fail
- [ ] Change-intent recorded in PR (what could break, what was retested)
- [ ] Gate itself tested (sandbox red run)
