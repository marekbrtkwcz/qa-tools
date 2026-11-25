# HTTP quick reference for testers

## Methods

| Method | Purpose | Idempotent | Safe | Typical success | Typical body |
| --- | --- | --- | --- | --- | --- |
| GET | read | yes | yes | 200 | representation |
| POST | create / action | no | no | 201 (Location header) | created resource |
| PUT | full replace | yes | no | 200 / 204 | updated resource |
| PATCH | partial update | not guaranteed | no | 200 / 204 | updated resource |
| DELETE | remove | yes | no | 200 / 204 | maybe confirmation |
| HEAD | headers only | yes | yes | 200 | none |
| OPTIONS | allowed methods/cors | yes | yes | 200 + Allow | none |

## Status codes to assert specifically

- `200 OK`, `201 Created` (+ `Location`), `204 No Content`
- `301/302/307/308` redirects (+ `Location`)
- `400` bad syntax, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `405` method not allowed (+ `Allow`), `409` conflict, `415` unsupported media type, `422` validation failed, `429` rate limited (+ `Retry-After`)
- `500/502/503/504` server errors — usually assert "5xx with error shape", not exact code, unless specified

## Request anatomy

```
POST /api/authors HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer <token>

{ "firstName": "Adam", "lastName": "Mickiewicz" }
```

## Response anatomy

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/authors/42
Set-Cookie: session=...; HttpOnly; Secure

{ "id": 42, "firstName": "Adam", ... }
```

## Test checklist per endpoint

1. happy path → expected status + body schema
2. auth: no token → 401; wrong role → 403
3. validation: missing field / wrong type → 400/422 with field message
4. not found: unknown id → 404; wrong method → 405
5. idempotency: repeat PUT/DELETE → same result; POST with Idempotency-Key → one effect
6. pagination/filter/sort boundaries on collections
