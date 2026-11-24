# Web performance checklist

## Budgets (good thresholds)

| Metric | Good | Needs work | Poor |
| --- | --- | --- | --- |
| LCP | ≤ 2.5 s | 2.5–4 s | > 4 s |
| INP | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS | ≤ 0.1 | 0.1–0.25 | > 0.25 |

## Measurement protocol

- lab: Lighthouse/Playwright trace, median of 5 runs, fixed throttled profile (e.g. slow 4G, mid-tier mobile)
- field: RUM/CrUX p75 when available
- record per page: CWV, total bundle size, per-chunk sizes, waterfall

## Regression analysis (on budget breach)

| Symptom | Likely cause | Check |
| --- | --- | --- |
| LCP regressed | big/late image, render-blocking CSS/JS, slow API | LCP element in trace; waterfall start times |
| INP regressed | long JS tasks on interaction | long tasks list, main-thread blocking |
| CLS regressed | late-loading content without reserved space | layout shift sources in trace |
| Bundle grew | new dependency, unminified import, duplicated lib | bundle analyzer diff |
