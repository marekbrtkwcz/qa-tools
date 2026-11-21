---
name: email-testing
description: 'Load this skill when testing transactional emails (verification, password reset, order confirmation) via a test mailbox API — Mailpit (local, /api/v1) or Mailosaur. Covers waiting for arrival with expect.poll (never waitForTimeout), asserting recipient/subject/body, extracting links and tokens, attachments, cleanup, and negative cases where no email should be sent.'
user-invocable: true
---

# ✉️ Email Testing

Transactional emails are part of the user flow: register → verify → login. Test them against a **catch-all test mailbox** (Mailpit locally, Mailosaur in CI), waiting with `expect.poll` — never `waitForTimeout`.

## 🎯 When to Use

- flows that send email: signup verification, password reset, notifications, receipts
- you need to assert content and extract action links / OTP codes from the body
- agents: `qa-tools:email-test-planner` / `-writer` / `-refactor` / `-code-reviewer`

## 📬 Mailpit (local) Example

```typescript
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025'; // only from env

async function findEmail(request, to: string, subjectIncludes: string) {
  let found;
  await expect.poll(async () => {
    const res = await request.get(`${MAILPIT}/api/v1/messages?query=${encodeURIComponent(to)}`);
    const msgs = (await res.json()).messages ?? [];
    found = msgs.find((m) => m.Subject.includes(subjectIncludes));
    return Boolean(found);
  }, { timeout: 15_000 }).toBe(true);
  return found;
}

test('should send verification email with working link when user registers', async ({ request, page }) => {
  await page.goto('/register');
  await page.getByLabel('Email').fill('marek@example.com');
  await page.getByRole('button', { name: 'Sign up' }).click();

  const msg = await findEmail(request, 'marek@example.com', 'Verify');
  const full = await request.get(`${MAILPIT}/api/v1/message/${msg.ID}`);
  const body = (await full.json()).Text;

  expect(msg.To[0].Address).toBe('marek@example.com');
  expect(msg.Subject).toContain('Verify');
  const link = body.match(/href="(http[^"]+)"/)[1]; // extract verification link
  await page.goto(link);                              // use it for real
  await expect(page.getByText('Email verified')).toBeVisible();
});
```

## 📋 What to Assert

- **Arrival**: message appears within a timeout — via `expect.poll`, not `waitForTimeout`.
- **Envelope**: `To` (exact address), `Subject`, sender.
- **Body**: contains the expected text, the action link, or the OTP/token — extract and **use** the link/code in the flow.
- **Attachments** (invoice PDF): present, correct filename, non-empty.
- **No-email negative case**: trigger an invalid action and assert the mailbox stays empty for that recipient (poll a short fixed window via `expect.poll` returning count, then assert 0 — do not sleep).
- **Cleanup**: `DELETE /api/v1/messages` (Mailpit) in `afterEach` so tests stay independent.

## 🔄 Mailosaur (CI) Notes

- API: `GET https://api.mailosaur.com/api/v2/messages?server={serverId}` with basic auth (`api` key from env `MAILOSAUR_API_KEY`).
- Same pattern: poll → find by recipient/subject → fetch full message → extract link (`Html.Links` or regex on body) → assert.
- Server ID from env (`MAILOSAUR_SERVER_ID`), never hardcoded. Never send real user data — test addresses only (`*@sandbox.mailosaur.net`).

## ❌ Common Pitfalls

- `waitForTimeout(5000)` "to wait for the email" — flaky by design; poll the mailbox instead.
- Asserting only that *some* email arrived — check recipient and subject.
- Extracting the link with a fragile regex — prefer the structured fields (`Html.Links` in Mailosaur).
- Leaving messages in the mailbox between tests — clean up in `afterEach`.
- Sending to real addresses — test mailboxes only.

## 🧹 Conventions

- `request` fixture for mailbox API + `page` for the UI trigger; names `should <result> when <condition>`; selectors `getBy*`; assertions `await expect(...)` / `expect.poll`.
