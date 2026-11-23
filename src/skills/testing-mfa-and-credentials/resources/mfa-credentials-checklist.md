# MFA and credentials checklist

Run per endpoint with synthetic test accounts only. Record: check, attempt, expected, observed.

## Password and lockout

| Check | Expected |
| --- | --- |
| Weak password on set/change | rejected per policy |
| Password change without current password | rejected |
| Reset with invalid/expired/reused token | rejected |
| N failed logins | lockout/throttle per policy |
| Lockout DoS check | cannot lock arbitrary users per policy boundary |
| Account existence leak | same response for known/unknown account |

## MFA

| Check | Expected |
| --- | --- |
| Enrolment binds factor to account | TOTP secret / WebAuthn credential registered |
| Wrong MFA code | rejected |
| Replayed TOTP code | rejected |
| Too many MFA attempts | throttled/locked |
| MFA required on every protected endpoint | no bypass path (API, old session, trusted device scope) |
| Disable/change MFA | requires re-authentication |
| Backup codes | single-use, hashed at rest, regeneration invalidates old set |

## Recovery

| Check | Expected |
| --- | --- |
| Reset token single-use + expiring | use or expiry invalidates |
| Reset invalidated by password change | old token dead |
| Reset token entropy | unguessable |
| Reset rate limits | per account and per IP |
