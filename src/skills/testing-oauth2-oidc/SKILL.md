---
name: testing-oauth2-oidc
description: 'Tests OAuth 2.0 and OpenID Connect flows as a tester: authorization code flow with PKCE, token exchange and refresh rotation, revocation, scope enforcement, and JWT validation on the resource side (signature, alg confusion, exp/aud/iss claims, JWKS/issuer checks). Use when an app acts as an OAuth client or resource server, when tokens are accepted that should be rejected, or when a login flow needs security verification beyond the happy path.'
argument-hint: 'The authorization server / IdP in the test environment, client id and secret for testing, the flows in scope, and the resource API to validate tokens against'
user-invocable: true
---

# Testing OAuth 2.0 / OIDC

Use this skill when login is delegated to an identity provider and the trust decisions live in tokens. `testing-auth-flows` covers getting a session into automated tests; this skill covers whether the tokens and the code flow are actually secure. Test against a test tenant / mock IdP — never a production identity provider.

## When to Use

- the app is an OAuth2 client (authorization code + PKCE) or a resource server validating tokens
- a token that should be rejected is accepted (wrong audience, expired, unsigned)
- refresh token behaviour is in question: rotation, reuse detection, revocation
- scope enforcement per endpoint needs verification
- after an IdP migration or JWKS rotation

## Operating Principles

- **Test both sides of the trust.** As a client: the code flow must use PKCE, validate `state`, and verify ID token claims. As a resource server: every token is untrusted input until the signature and claims check out.
- **alg confusion is a real bug class.** A server that trusts the token's `alg` header accepts `none` or HS256-with-public-key. Test it explicitly.
- **Never trust claims without checking them.** `exp`, `aud`, `iss`, `nonce` — each unchecked claim is a finding.
- **Test tenant / IdP only.** Mock IdP or test tenant; production IdP credentials are out of scope.
- **Revocation must be real.** Logout/revocation must invalidate the token at the server, not just delete a cookie.

## Workflow

### Phase 1: Map the flow

- grant types in use (authorization code + PKCE expected for SPAs/public clients), token endpoint, JWKS URI, issuer, expected scopes per endpoint
- record the expected claim values (iss, aud, exp window) for test tokens

### Phase 2: Client-side flow checks

Work through `./resources/oauth-oidc-checklist.md`:

- authorization request includes `state` and PKCE `code_challenge`; callback rejects mismatched/absent `state`
- token exchange sends `code_verifier`; wrong verifier → rejected
- ID token validated: signature via JWKS, `iss`, `aud` = client id, `exp` not expired, `nonce` matches when used
- refresh flow: rotation issues a new refresh token and invalidates the old; reuse of the old one is detected and rejected (or alarms)

### Phase 3: Resource-side JWT validation

- valid token → 200
- `alg: none` token → 401
- HS256 signed with the public RSA key (alg confusion) → 401
- expired `exp` → 401; wrong `aud` → 401; wrong `iss` → 401
- `kid` pointing to an unknown key / `jku` header → rejected (key confusion)
- missing scope → 403 on the protected endpoint
- revoked token (after revocation call) → 401

### Phase 4: Scope and revocation

- per protected endpoint: token without the required scope → 403; with it → 200
- access token revoked via the revocation endpoint → subsequent calls 401
- refresh token revoked → refresh grant fails

### Phase 5: Report

Findings go through the security disclosure path (`testing-application-security`), each with the token (redacted), the check, and expected vs observed.

## Resource Map

- `./resources/oauth-oidc-checklist.md` - client-side and JWT validation check matrix. Read during Phases 2–4.

## Related Skills

- `testing-auth-flows` - getting tokens into automated UI/API tests (storageState, API-first login)
- `testing-api-security` - the broader API security pass including token handling
- `testing-session-management` - cookie/session side of the same login
- `mocking-network-and-time` - mocking the IdP and freezing time for exp tests
- `handling-sensitive-test-data` - client secrets in test config

## Definition of Done

This skill is complete when:

- code flow uses and enforces PKCE and `state`; ID token signature and claims (iss/aud/exp/nonce) verified
- JWT validation rejects alg:none, alg-confused, expired, wrong-audience, wrong-issuer, and key-confused tokens
- scope enforcement per endpoint verified (403 without, 200 with)
- refresh rotation and reuse detection, plus access/refresh revocation, verified
- all testing ran against a test tenant or mock IdP
