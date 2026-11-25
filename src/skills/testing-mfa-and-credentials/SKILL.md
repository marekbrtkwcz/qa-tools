---
name: testing-mfa-and-credentials
description: 'Tests credential handling and multi-factor authentication: password policy enforcement, account lockout and throttling, credential-stuffing resistance, MFA enrolment and verification (TOTP, WebAuthn passkeys, SMS), MFA bypass paths, and recovery flows (password reset, backup codes). Use when login security is under review, when accounts can be brute-forced, when a reset link can be abused, or when passkey enrolment and sign-in flows need automation (CDP virtual authenticator).'
argument-hint: 'The auth endpoints in a test environment, test accounts per role, and which MFA factors are enabled'
user-invocable: true
---

# Testing MFA and Credentials

Use this skill when the question is "can an attacker get in with someone else's credentials or around the second factor". Covers password policy, lockout/throttling, MFA enrolment and bypass, and recovery flows. Rate-limit behaviour under load belongs to `testing-abuse-limits`; the broad security pass to `testing-application-security`.

**Test accounts only, synthetic data, non-production.** Credential attacks against real accounts are out of scope even in staging.

## When to Use

- MFA is being rolled out or changed (TOTP / WebAuthn / SMS)
- passkeys are being introduced: enrolment, usernameless sign-in, and recovery need automated verification
- password reset or account recovery flows exist and their token handling is unknown
- lockout / throttling behaviour needs verification
- a bypass of the second factor is suspected (e.g. endpoint that skips MFA)
- credential stuffing resistance needs a check

## Operating Principles

- **Recovery flows are attack surface.** Reset tokens: single-use, expiring, rate-limited, not guessable, and the response does not reveal whether the account exists.
- **Lockout must not be a DoS.** Locking an account after N failures is right; an attacker must not be able to lock out arbitrary users — verify the policy (per-account vs per-IP, unlock path, admin override).
- **MFA must be enforced server-side on every protected path.** A "trusted device" or step-up skip must be checked per endpoint, not assumed.
- **Backup codes are credentials.** Single-use, stored hashed, revocable, and regenerating them invalidates the old set.
- **Never test with real user credentials or real phone numbers.** Synthetic accounts only.

## Workflow

### Phase 1: Map the credential surface

- login, password reset, change password, MFA enrol/verify/disable, backup codes, account lockout endpoints
- which factors are enabled per role, and the step-up policy

### Phase 2: Password and lockout

Work through `./resources/mfa-credentials-checklist.md`:

- weak passwords rejected per policy (length, common-password list, breached-password check if used)
- password change requires the current password; reset requires a valid single-use token
- N failed logins → lockout/throttle per policy; response does not leak account existence; unlock path documented
- lockout cannot be weaponized against arbitrary accounts (verify the policy boundary)

### Phase 3: MFA

- enrolment binds the factor to the account (TOTP secret / WebAuthn credential); verification requires a valid code
- wrong code rejected; replayed code rejected (TOTP window abuse); too many attempts → throttle/lock
- MFA required on all protected endpoints — check for bypass paths (API endpoints, old sessions, "remember this device" scope)
- disable/change MFA requires re-authentication (current password or a valid second factor)
- backup codes: work once each, stored hashed, regeneration invalidates the old set

### WebAuthn and passkeys (automating the ceremony)

The WebAuthn prompt is OS-chrome the page cannot drive — typing into it is impossible from normal automation. Automate the ceremony with a **CDP virtual authenticator** instead of the real prompt:

```ts
// Playwright: a virtual authenticator replaces the platform prompt
const cdp = await context.newCDPSession(page);
await cdp.send('WebAuthn.enable');
const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
  protocol: 'ctap2',
  transport: 'internal',        // platform authenticator = the passkey profile
  hasResidentKey: true,         // passkeys are discoverable credentials
  hasLargeBlob: true,
  hasUserVerification: true,
  isUserVerified: true,         // auto-passes the biometric/PIN step
});
// enrolment: the page's navigator.credentials.create() completes without UI
// sign-in:   navigator.credentials.get() returns the stored credential
await cdp.send('WebAuthn.clearCredentials', { authenticatorId }); // reset between tests
```

- The test drives the real JS flow — only the OS sheet is virtual. Say exactly that in the notes: ceremony executed, platform prompt not exercised.
- Assertions stay server-side: after sign-in, verify the credential is bound to the account (credential list endpoint or the stored record), not just that the dashboard rendered.
- **Conditional UI** (the username field's passkey autofill, `mediation: 'conditional'`) cannot be clicked by automation either — it lives in the browser's autofill surface. Verify the code path (the `credentials.get` call is present and callable) and mark the visual autofill row as a manual check, honestly.
- Cross-device passkeys (QR / hybrid transport) are out of UI-automation scope: verify the policy level — `allowCredentials` and the transport regular expression state whether cross-device is permitted.
- `addVirtualAuthenticator` gained fields across CDP versions — if a field is rejected, check the protocol version before improvising.
- **Passkey recovery is launch-blocking surface**: removing a passkey must require re-auth with a remaining factor, and with all passkeys removed the account must still be recoverable through the reset path. A passkey-only account with a dead recovery flow is a high-severity finding, not a backlog note.

### Phase 4: Recovery flows

- reset link/token: single-use, expires, invalidated by use or by password change; not guessable
- reset does not reveal account existence (same response for known/unknown email)
- reset rate-limited per account and per IP

### Phase 5: Report

Findings through the security disclosure path (`testing-application-security`), with endpoint, attempt, and observed behaviour. Never include real credentials in reports.

## Resource Map

- `./resources/mfa-credentials-checklist.md` - password, lockout, MFA, and recovery check matrix. Read during Phases 2–4.

## Related Skills

- `testing-abuse-limits` - rate limiting and resource exhaustion under deliberate load
- `testing-oauth2-oidc` - token-based auth and JWT validation
- `testing-session-management` - session lifecycle after login
- `testing-application-security` - authorization gate and the broad pass
- `handling-sensitive-test-data` - keeping credentials and phone numbers synthetic

## Definition of Done

This skill is complete when:

- password policy enforced on set/change; reset tokens single-use, expiring, non-enumerable
- lockout/throttle matches policy and cannot be weaponized; account-existence not leaked
- MFA verified per factor (TOTP/WebAuthn/SMS as applicable): enrolment, wrong-code and replay rejection, bypass paths checked per endpoint
- backup codes single-use, hashed, revocable
- only synthetic accounts and non-production environments were used
