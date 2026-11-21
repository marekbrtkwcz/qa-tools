---
name: payment-checkout-testing
description: Load this skill when testing payment and checkout flows — payment gateway integration, 3DS/SCA, idempotency, webhooks from providers, refunds, currencies, and failure states (declined, timeout, insufficient funds). Covers mocking providers in tests (never real charges in CI), test cards per provider (Stripe etc.), webhook signature verification (webhook-testing), duplicate-submission protection, and PCI-adjacent rules (never log/store card numbers, use hosted fields/tokenization). Complements security-testing and contract-testing for the provider API.
user-invocable: true
---

# 💳 Payment & Checkout Testing

Checkout is where revenue breaks. Payment flows combine **money movement, third-party providers, async webhooks, and user trust** — a failure here is a lost sale plus a support ticket. Test the happy path and every failure state.

Use it when: integrating/changing a payment provider, modifying checkout UX, adding subscriptions/refunds, or after any provider API upgrade.

## 🚫 When NOT to use

- Generic webhook mechanics (HMAC, replay) → `webhook-testing`
- OWASP/payment security audit (PAN storage, injection) → `security-testing`
- Provider API contract drift → `contract-testing`

## 🧰 Test environment rules

- **Never charge real cards in CI/staging** — use provider test mode with official test card numbers (e.g. Stripe `4242 4242 4242 4242`, decline `4000 0000 0000 0002`, 3DS `4000 0027 6000 3184`)
- Secrets only via env vars; never in repo, logs, or test fixtures (AGENTS.md rule)
- Use the provider's webhook CLI / test events to simulate async events locally

## ✅ Core scenarios

### Happy path
- Pay with each supported method (card, wallet, BNPL if offered), verify order created, payment captured, confirmation shown, confirmation email sent (`email-testing`)
- Amount math: items + tax + shipping − discount = charged amount, in the **minor currency unit** (cents), with correct rounding per currency

### 3DS / SCA
- Card requiring authentication redirects to issuer, returns to success/failure URL, order state correct in both cases
- Frictionless vs challenged flow per card type

### Failure states (each must leave consistent state)
- **Declined** — clear user message, cart preserved, retry allowed, no order marked paid
- **Timeout / provider unreachable** — no double charge; user told to wait or retry; reconcile later
- **Insufficient funds** — distinct message from generic decline

### Idempotency & duplicates
- Double-click "Pay" / refresh on confirmation page / retried request → **exactly one charge** (idempotency key on the server; test by sending the same request twice)
- Webhook redelivery → processed once (`webhook-testing`)

### Async webhooks
- `payment_intent.succeeded`, `payment_failed`, `charge.refunded` etc. — verify signature, update order state, handle out-of-order arrival (webhook for failed payment arrives after succeeded — last-write must not corrupt state)
- Unknown/old event types → ignored gracefully, logged

### Refunds, captures, partial amounts
- Full and partial refund → order total updated, webhook received, user notified
- Auth-only then capture later (e.g. pre-order) → capture before expiry

### Currencies & locales
- Price displayed and charged in the same currency; no float math (use decimal/integer minor units); test a zero-decimal currency (JPY) and a 3-decimal one (KWD)

## 🔒 PCI-adjacent rules

- Card data must go **directly from browser to provider** (hosted fields / Elements / redirect) — never touch your server; verify your server logs and analytics contain no PAN/CVV
- Tokenization: store only the provider token, never card numbers
- Test that error pages and logs on payment failure show no card data

## 📋 Evidence

Record per scenario: provider test event used, request/response (redacted), resulting order/payment state, webhook received. Payment bugs are disputed with providers — you need artifacts.
