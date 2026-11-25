---
name: testing-email-and-notifications
description: "Automates tests for email, SMS, and push notifications: a catch-all SMTP (Mailpit/Mailhog locally, Mailosaur/Mailtrap in CI), polling the mail API from Playwright API tests, asserting subject/body/links/attachments, magic-link and OTP login flows, token expiry, and provider test modes (e.g. Twilio test credentials). Use when a user flow depends on a message arriving — signup confirmation, password reset, invoices, alerts — or when tests must verify notification content without a real inbox."
argument-hint: "The flow that sends the message (signup, reset, alert) and the mail provider in use"
user-invocable: true
---

# Testing Email and Notifications

Email is an API: the app hands a message to an SMTP server or a provider API, and the test asserts on what arrived. The discipline is **never use a real inbox in tests** — use a catch-all that exposes a query API.

## When to Use

- signup confirmation / email verification flows
- password reset and magic-link login (`testing-auth-flows` for the session side)
- OTP codes delivered by SMS or email
- invoices, reports, digest emails with attachments
- notification preferences (unsubscribe links must work)

## Setup options

| Provider | Where | Notes |
| --- | --- | --- |
| Mailpit / Mailhog | local + CI container (`docker run -p 1025:1025 -p 8025:8025 mailpit/mailpit`) | SMTP catch-all + web UI + REST API (`/api/v1/messages`) — default choice |
| Mailosaur / Mailtrap | CI with API key | hosted, team inboxes, good for shared CI |
| Provider test mode (Twilio test credentials, SES sandbox) | CI | for SMS/push; real messages are never sent |

Point the app at the catch-all via env vars (`SMTP_HOST`, `SMTP_PORT`) in the test environment — `test-environment-provisioning`.

## Patterns

1. **Trigger the flow** (API call or UI action) with a unique marker in the email address or a custom header: `signup+<runId>@test.local`. Uniqueness beats waiting: query for that exact recipient instead of "latest message".
2. **Poll with deadline, never sleep blindly:** Playwright `expect.poll` / `request.poll` against `GET /api/v1/messages?query=...` until the message appears or the timeout hits. Timeout = test failure with the app log attached.
3. **Assert content:** subject, sender, recipient, text/HTML body contains the expected token/link, attachment names and sizes. Extract magic links / OTP codes from the body with a regex and **use them in the next step** (click the reset link, submit the OTP) — an unexercised link is an untested link.
4. **Expiry tests:** for expiring tokens, freeze or manipulate time (`mocking-network-and-time`) or use the provider's short-TTL test mode; assert the expired token is rejected.
5. **Cleanup:** delete test messages after the run (catch-all API) so polling stays fast and CI reruns are independent.

## Red Flags

- `sleep(5000)` "to wait for the email" — flaky by construction; poll with a deadline instead
- asserting on the latest message for a shared inbox — cross-test collisions; always filter by unique recipient
- testing through a real Gmail/Yahoo inbox with credentials in CI — secrets leak and providers throttle; use a catch-all
- storing real user emails in fixtures — `handling-sensitive-test-data`; use synthetic addresses
- not testing the unsubscribe/preference link — it is part of the feature and legally relevant (`privacy-compliance-audit`)

## Related Skills

- `testing-auth-flows` - magic-link and OTP are login mechanisms; session handling lives there
- `testing-webhooks` - the sibling channel for server-to-server notifications
- `mocking-network-and-time` - freezing time for token-expiry tests
- `test-data-factories` - synthetic users with unique per-run email addresses
- `test-environment-provisioning` - wiring the catch-all container into the test environment
- `handling-sensitive-test-data` - keeping real addresses and message content out of fixtures and logs
- `api-playwright-test-developer` - the request-fixture style for polling the mail API

## Definition of Done

- every user-facing message flow has at least one automated test (trigger → poll → assert content → exercise extracted link/code)
- tests use a catch-all with a query API, unique per-run recipients, and poll-with-deadline (no blind sleeps)
- expiry/negative cases (expired token, wrong OTP) are covered
- no real inbox credentials anywhere in the repo or CI; test messages are cleaned up after runs
