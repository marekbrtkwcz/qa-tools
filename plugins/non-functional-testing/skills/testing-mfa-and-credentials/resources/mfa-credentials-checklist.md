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

## WebAuthn / passkeys (virtual authenticator drive)

| Check | Expected |
| --- | --- |
| Enrolment binds credential to account | credential visible server-side after create() (CDP virtual authenticator) |
| Usernameless sign-in | credentials.get() with the resident key lands in the account without typing a username |
| Credential of another RP rejected | no credential for this origin - ceremony fails, no session |
| User verification enforced | server rejects UV=false attempts where the flow requires it |
| Passkey removal | requires re-authentication with a remaining factor |
| All passkeys removed | account still recoverable via the reset path, not locked out |
| Conditional UI | code path present and callable; the autofill surface itself is a manual check |
| Cross-device (hybrid) | allowed/blocked per policy - transport regular expression checked |

## Recovery

| Check | Expected |
| --- | --- |
| Reset token single-use + expiring | use or expiry invalidates |
| Reset invalidated by password change | old token dead |
| Reset token entropy | unguessable |
| Reset rate limits | per account and per IP |
