# OAuth2/OIDC check matrix

Run per flow and per protected endpoint. Record: check, token/request used, expected, observed.

## Client-side flow

| Check | Expected |
| --- | --- |
| Authorization request has `state` + PKCE challenge | present; callback rejects mismatched/missing state |
| Token exchange with wrong code_verifier | rejected |
| ID token signature via JWKS | valid |
| ID token claims iss / aud / exp / nonce | all match expected |
| Refresh rotation | new refresh token issued, old invalidated |
| Old refresh token reused | rejected / alarmed |

## Resource-side JWT validation

| Token | Expected |
| --- | --- |
| Valid token | 200 |
| `alg: none` | 401 |
| HS256 signed with public key (alg confusion) | 401 |
| Expired exp | 401 |
| Wrong aud | 401 |
| Wrong iss | 401 |
| Unknown kid / jku header | 401 |
| Missing required scope | 403 |
| Revoked access token | 401 |

## Revocation

| Check | Expected |
| --- | --- |
| Access token revoked | subsequent calls 401 |
| Refresh token revoked | refresh grant fails |
