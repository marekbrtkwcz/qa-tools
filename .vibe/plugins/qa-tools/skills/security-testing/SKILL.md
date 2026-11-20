---
name: security-testing
description: Load this skill when testing application security. Covers OWASP Top 10 testing, XSS/CSRF checks, authentication/authorization testing, secrets scanning, and dependency vulnerability checks.
user-invocable: true
---

# Security Testing

## 🛡️ OWASP Top 10 — test focus areas

### 1. Injection (XSS)
```typescript
test('search input is sanitized against XSS', async ({ page }) => {
  await page.goto('/search');
  await page.getByLabel('Search').fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: 'Search' }).click();
  // Script should be rendered as text, not executed
  const alertDialog = page.getByRole('alert');
  await expect(alertDialog).toHaveCount(0); // no JS alert fired
});
```

### 2. Broken Authentication
- Test session expiry
- Test that tokens can't be reused after logout
- Test password requirements enforcement
- Test brute-force protection (rate limiting on login)

### 3. Sensitive Data Exposure
- Check that API responses don't leak passwords, tokens, PII
- Verify HTTPS is enforced (no HTTP fallback)
- Check that error messages don't reveal stack traces

### 4. CSRF
- Verify state-changing requests (POST/PUT/DELETE) require CSRF token
- Test that requests without token are rejected

### 5. Security Misconfiguration
- Check for default credentials
- Verify debug mode is off in production
- Check security headers: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`

## 📦 Automated dependency scanning
```bash
npm audit                    # known vulnerabilities in deps
npx better-npm-audit audit   # more detailed
```

## 🔑 Secrets scanning
```bash
git secrets --scan          # scan repo for leaked secrets
trufflehog git file://.     # deep secrets scan
```

## 🔒 Security test checklist
- [ ] XSS: inputs sanitized, CSP header set
- [ ] Auth: sessions expire, tokens invalidated on logout
- [ ] AuthZ: users can't access other users' data (IDOR check)
- [ ] HTTPS enforced everywhere
- [ ] No secrets in client-side code or git history
- [ ] Dependencies have no critical vulnerabilities
- [ ] Rate limiting on sensitive endpoints
- [ ] Security headers present and correct
