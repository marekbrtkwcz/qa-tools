---
name: testing-session-management
description: 'Tests session management security and behaviour: cookie flags (Secure, HttpOnly, SameSite), session fixation, concurrent sessions per user, server-side logout invalidation, idle vs absolute timeouts, and session id rotation on privilege change. Use when login works but the session lifecycle is in question, when a stolen cookie must not be usable, or when logout does not actually log out.'
argument-hint: 'The session mechanism (cookie-based, token-based, server-side store), the app URL in a test environment, and the roles in scope'
user-invocable: true
---

# Testing Session Management

Use this skill when authentication works but the session around it is weak. Most session bugs are invisible in the happy path: a cookie without `HttpOnly` readable by XSS, logout that only deletes the client cookie, a session id that survives login (fixation), no timeout. Verify at the HTTP layer, not through the UI.

## When to Use

- a new auth/session implementation is being reviewed
- logout does not invalidate the session server-side
- sessions never expire, or expire too aggressively
- concurrent logins per user behave unexpectedly
- session fixation or cookie theft is a reported concern

## Operating Principles

- **The server invalidates, the client forgets.** Logout must destroy the server-side session; deleting the cookie is not logout.
- **Cookie flags are the first line.** `Secure`, `HttpOnly`, `SameSite` on every session cookie; missing flags are findings.
- **Session id rotates on login and on privilege change.** The pre-login id must not be valid after authentication (fixation).
- **Timeouts are enforced server-side.** Idle and absolute timeouts checked by the server, not by a JS timer.
- **Test at the HTTP layer.** Cookie attributes and invalidation are invisible in the UI.

## Workflow

### Phase 1: Map the session mechanism

- cookie-based, server-side store, or stateless tokens; session id name and format; where the store lives
- expected flags, timeouts (idle/absolute), and concurrent-session policy per role

### Phase 2: Cookie attributes

Work through `./resources/session-checklist.md`:

- session cookie: `Secure`, `HttpOnly`, `SameSite` (Lax or Strict) present and correct
- no session id in URLs (leak via Referer/logs)
- CSRF token present on state-changing requests and validated server-side

### Phase 3: Lifecycle

- login rotates the session id (pre-login id invalid after login)
- privilege change (e.g. step-up auth) rotates the id again
- logout invalidates the session server-side: the same cookie/id afterwards → 401, and the server store entry is gone
- idle timeout: session expires after the configured idle period (verified server-side)
- absolute timeout: session expires at the absolute limit regardless of activity
- concurrent sessions: per design (allow N, or kick oldest) — verify the documented behaviour

### Phase 4: Fixation and theft-shaped checks

- session id from before login cannot be reused after login
- a copied session cookie works only within the timeout window and not after logout (i.e. server-side checks exist)
- session ids are unguessable (length/entropy check, not sequential)

### Phase 5: Report

Findings go through the security disclosure path (`testing-application-security`) with the cookie attributes, request, and observed behaviour.

## Resource Map

- `./resources/session-checklist.md` - the cookie-flag, lifecycle, and fixation check matrix. Read during Phases 2–4.

## Related Skills

- `testing-application-security` - the authorization gate and broader app security pass
- `testing-oauth2-oidc` - token-based counterpart of the same login
- `testing-auth-flows` - automating login in tests (storageState) without weakening these checks
- `testing-api-security` - session behaviour at the API layer

## Definition of Done

This skill is complete when:

- all session cookies carry Secure/HttpOnly/SameSite and no session id appears in URLs
- session id rotates on login and on privilege change; pre-login id is invalid afterwards
- logout invalidates server-side (old id → 401), verified at the HTTP layer
- idle and absolute timeouts enforced server-side and observed
- concurrent-session policy matches the documented design
- findings went through the security disclosure path
