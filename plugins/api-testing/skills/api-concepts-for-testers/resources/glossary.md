# API glossary for testers

| Term | Meaning | Test angle / what can fail |
| --- | --- | --- |
| Resource | A noun the API exposes (`/books`) | naming, nesting depth, collection vs item |
| Endpoint | URL path + method acting on a resource | 404 vs 405 vs 400 distinctions |
| Path param | `/authors/{id}` — identifies one resource | invalid/missing id → 400/404 |
| Query param | `?page=2&limit=20&sort=title` — filter/sort/paginate | pagination boundaries, unknown params ignored or 400 |
| Request body | Payload of POST/PUT/PATCH (usually JSON) | schema violations → 400/422 |
| Header | Key-value metadata (Content-Type, Authorization, Accept) | missing/incorrect → 4xx; secrets leak in logs |
| Cookie / Set-Cookie | Server-set state in headers | session fixation, missing Secure/HttpOnly — `testing-session-management` |
| Status code | 3-digit outcome: 2xx ok, 3xx redirect, 4xx client, 5xx server | assert specific codes, not just 2xx |
| JSON | JavaScript Object Notation: objects, arrays, scalars | malformed JSON → 400; parse before asserting |
| Idempotent | Same request repeated = same effect (GET/PUT/DELETE) | POST not idempotent → duplicates on retry (`testing-idempotency-and-retries`) |
| Safe method | Does not modify state (GET, HEAD, OPTIONS) | safe methods may be cached/prefetched |
| REST | Architectural style: resources + uniform interface + stateless | "REST-ish" APIs break assumptions (sessions, POST-for-everything) |
| Stateless | Every request carries full context (auth) | server-side session state changes auth testing |
| HATEOAS | Responses contain links to next actions | rarely implemented; don't rely on it |
| Content-Type / Accept | Media type negotiation (application/json) | wrong type → 415 |
| Authorization: Bearer/JWT | Token in header proves identity | expiry, tampering, wrong audience — `testing-oauth2-oidc` |
| 401 vs 403 | Unauthenticated vs forbidden | test both; 403 after 401 = authz logic |
| 409 Conflict | State conflict (duplicate, version mismatch) | optimistic locking tests |
| 422 Unprocessable | Semantically invalid body | validation error messages per field |
| 429 Too Many Requests | Rate limited; Retry-After header | `testing-abuse-limits` |
| Redirect 3xx + Location | Moved; client follows or not | open-redirect security issue |
| WSDL / SOAP | XML contract + envelope protocol (legacy enterprise) | validate against WSDL; XML assertions |
| OpenAPI / JSON Schema | Machine-readable API/response contract | `testing-api-contracts` — breaking-change detection |
| Pagination | page/limit or cursor-based | last page, empty page, page beyond end |
| Rate limit headers | X-RateLimit-Remaining etc. | assert remaining decreases; 429 behavior |
