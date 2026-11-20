---
name: performance-testing
description: Load this skill when performance or load testing web applications. Covers Web Vitals (LCP, FID/INP, CLS), Lighthouse CI, k6 load tests, and performance budgets in Playwright.
user-invocable: true
---

# Performance Testing

## Core Web Vitals
| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

## Measuring Web Vitals in Playwright
```typescript
import { test, expect } from '@playwright/test';

test('homepage meets Core Web Vitals', async ({ page }) => {
  await page.goto('/');
  const vitals = await page.evaluate(() => new Promise((resolve) => {
    const entries: PerformanceEntry[] = [];
    new PerformanceObserver((list) => {
      entries.push(...list.getEntries());
      if (entries.length >= 3) resolve(entries);
    }).observe({ type: 'paint', buffered: true });
  }));
  // assert LCP, CLS values
});
```

## Performance budget in test
```typescript
test('homepage loads within budget', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  await page.getByRole('heading').waitFor();
  const loadTime = Date.now() - start;
  expect(loadTime).toBeLessThan(3000); // 3s budget
});
```

## Load testing with k6
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp up
    { duration: '1m', target: 100 },  // peak
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('https://app.example.com/api/products');
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

## Performance testing checklist
- [ ] Define budgets for key pages (load time, LCP, bundle size)
- [ ] Test on realistic network conditions (throttle to 3G)
- [ ] Measure on mobile viewport too
- [ ] Check third-party scripts impact
- [ ] Run load tests in CI on staging
- [ ] Monitor trends over time (don't just test once)
