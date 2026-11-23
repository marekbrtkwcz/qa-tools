# API Security Checklist

Read when the authorization matrix is verified at the level of single endpoints and the question is what API shapes break access control *across* endpoints - objects that travel in bulk, verbs that get overridden, fields that ride along uninvited. Each item: what to try, what evidence to capture, what finding it makes when it fails.

Authorization gate first: every item below is a probe against a real system, so the scope and written authorization rules of the main skill apply before anything is tried.

## 1. Mass assignment

**Try:** send the object-create/update payload with fields the client UI never shows - `isAdmin`, `role`, `tenantId`, `price`, `ownerId`, `verified`.

- Create `user-b`'s object while authenticated as `user-a` with `ownerId: <user-b id>` embedded
- Watch both directions: privilege fields (`role`, `flags`) and ownership fields (`ownerId`, `tenantId`)
- **Evidence:** request payload + response object as stored (fetch it back - what the API returns is what matters, not what the UI shows)
- **Finding:** server trusts the client's field list instead of an allowlist. High severity: this is privilege escalation by copy-paste.

## 2. HTTP verb and method confusion

**Try:** the same protected operation under the verbs the router accepts:

- the read you know is protected (`GET /orders/123`) under `POST`/`PUT`/`PATCH`/`DELETE` - authz often differs per verb on the same path
- method override headers and query params (`X-HTTP-Method-Override`, `_method=DELETE`) - middleware that gates `DELETE` but not the override that becomes one
- trailing-slash and case variants where routers treat paths differently than the authz rules do
- **Evidence:** the request line and the status each verb returned
- **Finding:** access control mapped to paths instead of operations; one verb gap = one operation unprotected

## 3. IDOR in collection and batch endpoints

Single-object IDOR gets checked in the matrix; the batch shapes are where it hides:

- **in responses:** `GET /orders?userId=<someone-else>` - a filter that accepts identifiers as input and returns other people's objects is an IDOR with a nicer name
- **in bulk writes:** `POST /orders/batch` carrying a mixed-ownership payload (two of mine, one of user-b's) - does the batch fail atomically, partially apply, or silently apply all
- **in nested/sub-resources:** `GET /org/<org-a>/users/<user-b>` - parent-scope checks that forget the child, or the reverse (child ok, parent enumerable)
- **in aggregation:** metrics/count endpoints that accept a scope filter and answer for scopes the caller cannot list directly
- **Evidence:** the payload/query and the response list (ids + count), screenshot-grade, before cleanup
- **Finding:** broken object-level authorization at the collection tier - same class as IDOR, easier to miss because each object alone looks fine

## 4. Ownership of identifiers you did not create

**Try:** use an identifier the API generates for *you* in a context where it belongs to *someone else*:

- reuse your own resource ID in someone else's namespace (`POST /org/<not-yours>/orders` with your orderId)
- enumerate enumerable identifiers where the system uses sequential or timestamp-derived ids (`.../invoices/1043`) - even a denied-but-scoped read on ranges answers "what IDs exist"
- **Evidence:** the sequence of requests with statuses (an existence oracle matters even without data: `403` vs `404` is a map)
- **Finding:** level-1 of the classic IDOR family; the matrix catches the direct route, this catches the indirect ones

## 5. Content-type and body smuggling

**Try:** what the parser accepts versus what the validator validated:

- same request as JSON, form-encoded, and XML - parsers disagree; validation done for one shape is frequently skipped for the other
- duplicate keys in the JSON body (`{"role": "user", "role": "admin"}`) - which one does the framework keep, and which one did the UI intend
- **Evidence:** the two request bodies + the stored/echoed response
- **Finding:** validation is parser-shaped instead of schema-shaped

## 6. Webhooks, notifications, and other outbound gates

**Try:** registers or triggers outbound by targets that should not receive:

- `POST /webhooks` with an URL on a tenant that is not the caller's - whose events does it start receiving
- notification/email triggers with another user's address embedded in an otherwise legitimate request
- **Evidence:** the registration payload + one triggered event (in a test env) with the received envelope
- **Finding:** outbound data flows carry the same object-level authorization failures as inbound ones, and are checked far more rarely

## 7. Error messages as information disclosure

**Try:** trigger error states deliberately and compare messages:

- does the missing-vs-forbidden distinction leak existence (`404` for your own missing resource vs `403` for someone else's existing one)? Consistent `404` for both is correct; a distinguishable pair is an enumeration oracle (finding it: **LOW**, but note it in the IDOR work - it fuels item 4)
- do error bodies leak stack traces, SQL fragments, internal identifiers
- do validation errors reveal the accepted format of an undocumented field
- **Evidence:** the two contrasting responses, verbatim
- **Finding:** verbosity is a data-exposure channel; route to `reporting-bugs` with the pair attached

## 8. Response field minimization

**Try:** fetch your own object with the richest role you have and read *all* fields:

- hashed passwords/secrets, internal flags, soft-deleted state, other-tenant references, e-mail of a different user in a nested include
- the same response with the least-privileged role - do privileged fields disappear? (If a field exists for admin, does admin's own-object response spread it to everyone's?)
- **Evidence:** the JSON response bodies diffed between roles
- **Finding:** response models inherited wholesale from persistence models (over-fetching) - tedious, real, and exploitable when any field is sensitive

## Working rules

- every probe uses the environment accounts from the main skill (`user-a`, `user-b`, `admin`, `anon`); never the production credentials of real people
- every finding keeps the request/response pair verbatim - API findings without the exact payload are hearsay
- cleanup beats stealth: state you created (webhook registrations, new records) gets deleted after the session, and anything not deletable gets listed in the report for the owner
- on items failing: classify by the main skill's severity table; item 1 (mass assignment) and item 3 (batch IDOR) are always HIGH until a reviewer proves otherwise
