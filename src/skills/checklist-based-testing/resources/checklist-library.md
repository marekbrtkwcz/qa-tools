# Starter checklist library

Adapt per product. Every item: checkable statement + expected result.

## Forms

- submit empty required field → inline error, no request sent
- invalid format (email, phone, date) → inline error naming the field
- input at min/max boundary → accepted/rejected per spec
- double-submit → second submit ignored or idempotent
- browser back after submit → no duplicate, no lost data
- autofill / password manager → works, no leak between fields

## Navigation

- every link/menu item reaches the right page, breadcrumb correct
- back/forward buttons behave
- deep link (pasted URL) → correct page or clean error
- 404 and 500 pages are branded and actionable

## Errors

- API error → user-friendly message, no stack trace
- offline/slow network → clear state, retry works
- session expired mid-action → redirect to login, data not lost

## Permissions

- UI hides what the role cannot do AND the API rejects it (`testing-api-security`)
- direct URL access to other users' resources → 403/404

## Files

- upload allowed type works; disallowed rejected (`testing-file-uploads-and-exports`)
- download of own file works; other user's → denied

## Performance feel

- main pages load within the budget on a throttled connection
- no visible layout shift on load
- spinners have a timeout state
