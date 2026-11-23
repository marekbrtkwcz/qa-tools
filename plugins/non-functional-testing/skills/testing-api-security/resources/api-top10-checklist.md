# OWASP API Security Top 10 — check matrix

Run each category per endpoint. Record: check, proving request, result (pass / fail / unknown). "Unknown" is a valid result — it means the check could not be completed and goes into the report's "remains unknown" section.

## 1. Broken object-level authorization (BOLA / IDOR)

| Check | Proving request |
| --- | --- |
| Item endpoint returns another user's object | GET `/items/{id}` with user A's token, substituting an ID owned by user B |
| Collection endpoint leaks other users' objects | GET `/items?userId=<B>` as user A; filter must be server-side and enforced |
| Write/delete on another user's object | PUT/DELETE `/items/{id-of-B}` with user A's token — expect 403/404 |
| GraphQL field-level access | query a restricted field with a low-privilege token — expect a field error, not data |

Note: return 404 instead of 403 is acceptable (it hides existence); 200 with data is a confirmed finding.

## 2. Broken authentication

| Check | Proving request |
| --- | --- |
| Expired token rejected | call with a token past its expiry — expect 401 |
| Revoked token rejected | call after logout / token revocation — expect 401 |
| Weak credential policy | attempt registration with a trivially weak password — expect rejection |
| Sensitive operation re-authenticates | change email/password without a fresh credential prompt — flag |
| Token not leaked in URL | inspect logs/links — tokens belong in headers only |

## 3. Broken object property-level authorization (mass assignment)

| Check | Proving request |
| --- | --- |
| Extra fields ignored or rejected | POST profile update including `role: "admin"` as a normal user — role must not change |
| Read over-fetching | GET response contains fields the role should not see (compare against the spec) |

## 4. Unrestricted resource consumption

| Check | Proving request |
| --- | --- |
| Rate limiting present | repeat a cheap endpoint N times rapidly — expect 429 after a threshold |
| Bounded pagination | `?limit=100000` — server must cap or reject |
| Expensive query guard | deeply nested GraphQL query — depth/complexity limit must reject it |

## 5. Broken function-level authorization

For every endpoint × method × role: call with a token of a role that should not reach it. Admin-only endpoints called with user tokens are the classic finding. Check both the happy path and error path (a 405 vs 403 difference leaks which methods exist).

## 6. Business flow abuse

Replay a completed step, reorder steps, skip a step. Multi-step flows (signup → verify → activate) must enforce order server-side.

## 7. Security misconfiguration

| Check | Proving request |
| --- | --- |
| Verbose errors | trigger a 500 — response must not contain stack trace, SQL, or paths |
| Default credentials | try documented default accounts on auth endpoints |
| Unnecessary methods | OPTIONS on endpoints — expect only the documented verbs |
| Security headers | missing `X-Content-Type-Options`, CSP, `Strict-Transport-Security` on HTTPS |
| CORS | `Origin: https://evil.example` — must not get `Access-Control-Allow-Origin: *` with credentials |

## 8. Improper inventory management

- old versions reachable: `/v1/...` still serves after `/v2/` shipped
- debug/health endpoints exposed without auth
- endpoints present in traffic but absent from the OpenAPI spec — each is a finding (spec gap or leak)

## 9. Unsafe consumption of APIs

- fields that accept URLs (webhooks, avatars, imports) — point at internal addresses (169.254.169.254, localhost); SSRF is a confirmed finding if fetched
- third-party responses consumed without schema validation — note as a risk

## 10. Insufficient logging and monitoring

- failed authentication attempts produce a log entry you can point to
- a confirmed IDOR attempt (section 1) produces a log entry or alert — absence is a finding
- logs must not contain tokens or passwords
