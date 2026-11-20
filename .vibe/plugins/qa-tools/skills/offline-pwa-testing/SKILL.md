---
name: offline-pwa-testing
description: Load this skill when testing Progressive Web Apps and offline-first behavior — Service Worker registration, lifecycle and update flow, Cache API strategies (cache-first, network-first, stale-while-revalidate), offline fallback pages, Background Sync, IndexedDB persistence, push notifications, Web App Manifest and install prompt, network throttling and offline emulation in Playwright.
user-invocable: true
---

# Testing Offline / PWA with Playwright

## ✈️ Offline emulation

```typescript
test.use({ offline: false });

test('should show offline fallback when network is down', async ({ page, context }) => {
  await page.goto('/dashboard');                    // online first — SW installs, caches fill
  await page.waitForEvent('serviceworker');         // wait for SW registration
  await context.setOffline(true);                   // go offline
  await page.reload();
  await expect(page.getByText('You are offline')).toBeVisible();
  await context.setOffline(false);
});
```

- `context.setOffline(true/false)` — per-context, affects all pages; reset in `afterEach`
- `page.route('**/*', route => route.abort())` — alternative hard-block for specific URLs
- CDP network throttling for "slow 3G" instead of full offline: `context.newCDPSession(page)` → `Network.emulateNetworkConditions`

## ⚙️ Service Worker

```typescript
test('should register service worker on first visit', async ({ page }) => {
  await page.goto('/');
  const sw = await page.waitForEvent('serviceworker');
  expect(sw.url()).toContain('sw.js');
});

test('should activate updated service worker on next load', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForEvent('serviceworker');
  // bump sw.js (deploy), then reload — new SW installs and activates
  await page.reload();
  const reg = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    return r?.active?.state; // 'activated'
  });
  expect(reg).toBe('activated');
});
```

- assert registration (`navigator.serviceWorker.getRegistration()`), `active`/`waiting` states
- update flow: new SW goes to `waiting` until old one releases clients (`skipWaiting` + `clients.claim()` or wait for tabs to close) — test the chosen strategy explicitly
- unregister in `afterEach` for isolation: `page.evaluate(() => navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())))`, plus `context.clearCookies()` and clearing caches via CDP `Storage` domain if needed

## 🗄️ Cache API strategies

Assert the strategy by observing requests while offline:

```typescript
test('should serve cached page when offline (cache-first)', async ({ page, context }) => {
  await page.goto('/products');
  await page.waitForEvent('serviceworker');
  await context.setOffline(true);
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible(); // z cache
});

test('should fall back to network-first cache when offline', async ({ page, context }) => {
  await page.goto('/api-like-page');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('cached fallback')).toBeVisible();
});
```

- cache-first: static assets → instant offline; network-first: fresh when online, cache fallback offline; SWR: render cache, update in background
- verify cache contents: `page.evaluate(async () => (await caches.keys()))` and `caches.open(name).then(c => c.keys())`

## 📄 Offline fallback page

- `page.goto('/never-visited')` while offline → app's offline.html (or `expect(page).toHaveURL(...)` fallback) — assert visible marker, not just "no crash"
- navigation preload (`self.addEventListener('fetch')` with `event.preloadResponse`) if used

## 💾 Background Sync & IndexedDB

- Background Sync: go offline, perform action (e.g. submit form) → assert queued (IndexedDB outbox), go online → `sync` event fires → assert server received it (via API check)
- IndexedDB persistence: write data offline, reload offline → data still there: `page.evaluate(() => new Promise(...))` reading the DB, or simply UI assertion after reload

## 📋 Manifest & install prompt

```typescript
test('should have valid web app manifest', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    return link ? (await (await fetch(link.href)).json()) : null;
  });
  expect(manifest.name).toBeTruthy();
  expect(manifest.icons.length).toBeGreaterThan(0);
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toMatch(/standalone|fullscreen|minimal-ui/);
});
```

- install prompt (`beforeinstallprompt`) is Chrome-only and not reliably triggerable in automation — assert manifest validity + SW instead; do NOT rely on the prompt event in tests

## 🔔 Push notifications

- assert registration: `page.evaluate(async () => (await navigator.serviceWorker.ready).pushManager.getSubscription())`
- permission: `Notification.permission` — grant via `context.grantPermissions(['notifications'])`
- receiving a push in tests requires a push service — mock at SW level or skip; assert subscription endpoint exists

## ⚠️ Common pitfalls

| Pitfall | Fix |
|---|---|
| SW from previous test still active | unregister SW + clear caches in `afterEach` |
| `offline: true` set globally in config | set per-test via `context.setOffline`, reset after |
| Asserting offline works without visiting online first | SW/cache must be populated online before going offline |
| `waitForTimeout` for SW install | `page.waitForEvent('serviceworker')` / `navigator.serviceWorker.ready` |
| Flaky cache assertions | read `caches.keys()` / request interception (`page.route`) to observe cache hits vs network |
| Install prompt test | not reliable in automation — assert manifest + SW registration |
