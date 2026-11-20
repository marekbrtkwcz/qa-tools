---
name: requirements-traceability
description: Load this skill when linking requirements to tests and code. Covers requirement IDs and acceptance criteria (AC) mapping, requirements-to-test coverage matrices, tracing requirements to code (PRD → AC → test → implementation), verifying acceptance criteria against a build with met/partial/missing status, and keeping the traceability matrix alive as the product evolves.
user-invocable: true
---

# Requirements Traceability

Traceability answers one question: **"how do we know this requirement is covered?"** — with a chain, not a feeling: `REQ-ID → AC-ID → test ID → code location`.

## ID scheme (stable, greppable)

- Requirements: `REQ-123` (from PRD/Jira/Linear — never renumber).
- Acceptance criteria: `REQ-123.AC-2`.
- Tests: embed the IDs in the test name or a tag, so coverage is machine-checkable:

```typescript
test('REQ-123.AC-2 should return 402 when card is declined', async ({ request }) => {
  const res = await request.post('/api/pay', { data: { card: '4000000000000002' } });
  expect(res.status()).toBe(402);
  expect((await res.json()).error).toBe('card_declined');
});
```

```yaml
# playwright.config.ts — tag mapping for reporting
// @req REQ-123
```

## Coverage matrix

One table (in `docs/traceability.md` or a spreadsheet exported to the repo), updated **in the same PR** that changes a requirement:

| REQ | AC | Test(s) | Code | Status |
|---|---|---|---|---|
| REQ-123 | AC-1, AC-2 | `checkout.spec.ts: "…402 when card declined"` | `src/payments/stripe.ts:88` | ✅ covered |
| REQ-124 | AC-1 | — | `src/payments/refund.ts` | ❌ no test |
| REQ-125 | AC-3 | `login.spec.ts: "…locks after 5 attempts"` | `src/auth/lockout.ts:12` | ⚠️ partial |

Rules:

- Every REQ must have ≥1 AC; every AC must have ≥1 test **or a documented reason** (manual-only, out of scope, automated elsewhere).
- A PR that adds/changes a REQ without touching the matrix fails review (make it a CI check: parse matrix + PR diff).
- Status values: ✅ covered / ⚠️ partial (which AC missing) / ❌ gap / 🚫 deferred (with waiver link — see `quality-gates`).

## Deriving tests from ACs (per AC, ask:)

1. **Happy path** — the AC as written.
2. **Boundary** — min/max/empty values mentioned or implied.
3. **Negative** — invalid input, missing permission, expired token.
4. **Idempotency/state** — running twice, concurrent calls.
5. **Untestable AC?** — mark it and say why (needs human judgment → manual attestation, see `quality-gates`).

## Verifying ACs against a build

For each AC, record evidence — not impressions:

| AC | Verdict | Evidence |
|---|---|---|
| REQ-123.AC-2 | ✅ met | run #4521, test green, screenshot |
| REQ-123.AC-3 | ❌ missing | bug PROJ-1234 filed, output attached |
| REQ-124.AC-1 | ⚠️ partial | works in Chrome, fails in Safari (PROJ-1235) |

- Verdicts: `met / partial / missing / untestable` — never invent behavior to make an AC "met".
- QA sign-off = every AC has a verdict + evidence link.

## Keeping it alive

- The matrix lives **in the repo**, versioned with code — not in a wiki that drifts.
- Automate the check: script greps test files for `REQ-` IDs and diffs against the matrix; CI fails on a REQ with no test and no waiver.
- When a REQ is removed, mark its row `removed in vX.Y` (don't delete — audit trail).
- Quarterly: review ⚠️/❌ rows — chronic gaps are quality debt, report them via `qa-best-practices`.

## Anti-patterns

- Matrix updated only at release time (drift guaranteed) — update in the same PR.
- "Covered" = the code exists. Coverage means a **test proves it**.
- Renumbering REQ IDs — breaks every link; use stable external IDs.
- 100% AC coverage claimed while negative paths are untested — ACs imply negatives (see checklist above).

## ✅ Checklist

- [ ] Stable ID scheme: REQ → AC → test tag → code location
- [ ] Coverage matrix in repo, updated in the same PR as requirement changes
- [ ] Every AC: happy + boundary + negative + state test, or documented reason
- [ ] CI check: REQ without test/waiver fails the build
- [ ] AC verification table with verdicts + evidence links per build
- [ ] Removed REQs kept as `removed in vX.Y` for audit
