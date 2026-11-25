---
name: testing-offline-and-pwa
description: "Tests offline behavior and PWA capabilities with Playwright: service worker registration and lifecycle, network failure simulation (`context.setOffline`, route abort), cache strategies, offline fallback pages, PWA installability (manifest, icons, start URL), and push notification permission flows. Use when the app must work offline or installable as a PWA, or when a flaky network causes intermittent UI failures."
argument-hint: "App URL, the flows that must work offline, and whether a service worker / manifest exists"
user-invocable: true
---

# Testing Offline and PWA

Modern web apps register a service worker, cache assets, and may be installable as a PWA. All of that is testable in Playwright by controlling the network from the test, not by hoping the network fails at the right moment.

## When to Use

- the app claims offline support (service worker, cache-first assets, offline fallback)
- the app is a PWA: manifest, icons, install prompt, standalone display mode
- push notification permission and delivery flows
- flaky-network bugs: UI must degrade gracefully when a request fails or hangs

## Network control in tests

- **Full offline:** `await context.setOffline(true)` — everything fails; assert the offline fallback UI appears and cached pages still render. `setOffline(false)` to restore.
- **Selective failure:** `await page.route('**/api/cart', (route) => route.abort('failed'))` — one endpoint fails, the rest work; assert the UI shows the error state and recovers on retry.
- **Slow network:** `route.fulfill` after a delay, or CDP `Network.emulateNetworkConditions` via the Chrome DevTools MCP (`debugging-with-chrome-devtools-mcp`) — assert loading skeletons/spinners, no layout shift when data arrives.
- **First vs repeat visit:** offline behavior differs between the first visit (worker not yet installed, cache empty) and repeat visits (worker controls the page). Test both — first-visit offline is the classic "works on second load only" bug.

## Service worker and cache

- assert registration: after load, a service worker is active (`navigator.serviceWorker.controller` on repeat visit, or via DevTools MCP application panel).
- assert the cache contains the expected assets (DevTools MCP → Application → Cache Storage, or evaluate `caches.keys()` in the page).
- after a new deploy (new SW version), assert the update flow: `skipWaiting` + reload gives the new version without a stuck old cache — test by registering a second SW version in the test.

## PWA installability

- manifest: fetch `/manifest.webmanifest`, assert `name`, `short_name`, `start_url`, `display: standalone`, icons with `purpose: any maskable` at 192px and 512px.
- install prompt: Chromium fires `beforeinstallprompt`; in Playwright, assert the manifest is valid and installable via DevTools MCP / Lighthouse PWA audit rather than forcing the native dialog.
- post-install: launch with standalone display and assert no browser chrome and correct start URL.

## Push notifications

- permission flow: `Notification.requestPermission()` — assert the browser prompt is shown and the app handles both grants and denials without errors.
- delivery: with a granted permission, send a test push from the backend test hook and assert the notification event fires (or use the provider's test mode, see `testing-email-and-notifications` for the channel-agnostic patterns).

## Red Flags

- testing offline by disabling Wi-Fi in CI — nondeterministic and machine-global; use `setOffline`/routes
- asserting offline works only on the second visit — first visit must fail gracefully too (nothing cached yet)
- no test for the SW update path — stale-cache bugs ship exactly there
- manifest validated by eye, not by fetch + schema assertions
- push tests that require a real device/provider account — use the provider test mode

## Related Skills

- `debugging-with-chrome-devtools-mcp` - inspecting service workers, Cache Storage, and network emulation live
- `testing-web-performance` - caching and offline behavior directly move Web Vitals on repeat visits
- `resilience-smoke-testing` (non-functional-testing) - chaos-style failure injection at the app level
- `testing-email-and-notifications` - the other notification channel (push vs mail)
- `playwright-explore-website` - exploring SW/manifest behavior through the Playwright MCP

## Definition of Done

- first-visit and repeat-visit offline behavior are both tested with controlled network failure (`setOffline`/route abort), with graceful-degradation assertions
- service worker registration, cache contents, and the SW update path are asserted
- manifest is fetched and asserted (name, start_url, display, icons 192/512), not eyeballed
- push permission grant/deny paths are covered; delivery uses a provider test mode
- no test depends on real network conditions or a real device
