# Session management checklist

Run at the HTTP layer. Record: check, request/cookie used, expected, observed.

## Cookie attributes

| Check | Expected |
| --- | --- |
| Session cookie flags | Secure + HttpOnly + SameSite=Lax|Strict |
| Session id in URL | never (check Referer/log leak paths) |
| CSRF token on state-changing requests | present, validated server-side |

## Lifecycle

| Check | Expected |
| --- | --- |
| Login rotates session id | pre-login id invalid after login |
| Privilege change rotates id | old id invalid |
| Logout | server-side invalidation; old id → 401 |
| Idle timeout | expires after configured idle period, enforced server-side |
| Absolute timeout | expires at absolute limit regardless of activity |
| Concurrent sessions | per documented policy (allow N / kick oldest) |

## Fixation / theft-shaped

| Check | Expected |
| --- | --- |
| Pre-login session id reuse after login | rejected |
| Copied cookie after logout | rejected |
| Session id entropy | long, non-sequential, unguessable |
