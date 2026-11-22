# Baseline Policy

Fill this in once and keep it with the visual tests. Most permanently-red visual suites are red because one of these questions was never answered.

---

## Generation environment

- **Baselines are generated in**: [container image, pinned by digest]
- **CI compares in**: [must be the same image]
- **Command to generate**: `[exact command]`
- **Laptop generation**: not permitted / permitted for [which subset]

The rule that matters: **baselines are generated in the same image that compares them.** A baseline produced on macOS and compared on a Linux runner differs on every text pixel, and no threshold fixes it honestly.

### Generating in a container

```bash
docker run --rm \
  -v "$(pwd):/work" -w /work \
  -e CI=true \
  mcr.microsoft.com/playwright:v1.56.0-noble \
  npx playwright test --grep @visual --update-snapshots
```

Pin the image tag to the same Playwright version as `package.json`. A browser version bump changes rendering, so treat it as a planned baseline refresh, not a surprise.

## Platform axes

Every axis multiplies the number of baseline files and the review burden. Add one only when the axis has produced a real defect.

| Axis | Values covered | Rationale |
| --- | --- | --- |
| Browser | [chromium] | [Firefox and WebKit rendering differences never caused an incident] |
| Viewport | [1280x720, 390x844] | [desktop and mobile layouts diverge] |
| Theme | [light, dark] | [dark theme tokens shipped separately] |
| Locale | [en-US] | [pl-PL text length overflow is covered by two specific snapshots, not the whole suite] |

Rule of thumb: total baselines = snapshots x browsers x viewports x themes x locales. Four axes at two values each is 16 files per snapshot. Justify each multiplication.

## Storage

- **Location**: [in repository under `tests/visual/__screenshots__` / hosted service]
- **Approximate size today**: [MB]
- **Growth policy**: [what triggers pruning]
- **Git LFS**: [yes / no]

In-repo storage is simpler to reason about and inflates clone size. A hosted service adds a dependency and gives a review UI. Either is fine; an undocumented choice is not.

## Update authority

- **Who may update baselines**: [role or team]
- **Required in the pull request**: rendered before-and-after images for every changed baseline
- **Bulk updates**: [prohibited / permitted only for a declared browser or design-system bump, with a named approver]

The failure this prevents: `--update-snapshots` run across the suite to clear a red build, which converts a regression into a baseline.

### Permitted bulk-update events

- Playwright or browser version bump
- Intentional design system release
- Font stack change

Each of these gets its own pull request that changes only baselines, so the diff is reviewable as a single intentional act.

## Refresh cadence

- **Browser image bump**: [quarterly / on Playwright release]
- **Full baseline audit**: [twice a year] - delete snapshots that have never failed and never caught anything

## i18n, RTL and pseudo-localization

Localization is not "the same page with longer labels". Three specific regressions live only in localized builds, and each has a cheapest place to catch it:

| Risk | Cheapest place to catch it | Visual test's role |
| --- | --- | --- |
| Long strings overflow their containers (German, Polish, Finnish) | Component snapshot of the translated template - one snapshot per risky component | Snapshot with the longest-shipping locale, not all locales |
| RTL mirroring breaks layout (icons, chevrons, margins, progress direction, truncated side) | Component snapshots under `dir="rtl"` | Direction is its own axis: an RTL baseline set, smallest surfaces first |
| Wrong language file loaded / missing translation keys | Assertion (visible text key) | Not a visual problem |

Rules of thumb:

- **Direction is an axis like theme.** An RTL build is a different picture - same thresholds compare a mirrored layout against an LTR baseline and either always fail or, worse, silence real mirroring bugs. LTR and RTL never share baselines.
- **Two snapshot sets beat N**: default locale + direction, and the longest-string locale + direction, covers the overflow and mirroring classes. A baseline per supported locale is cost with no additional defect class caught.
- **Pseudo-localization is a test-data trick, not a baseline axis**: render the default template under `dir="rtl"` with pseudo-localized strings (accented, padded ~30% longer - libraries or a small fixture generator do this) to find overflow and mirroring *before* translators deliver; keep the real-locale small set for release checks.
- Setting the direction in the test, not in a separate build: `await page.goto('/'); await page.evaluate(() => document.documentElement.dir = 'rtl')` or a query param your app supports - record which mechanism the suite uses, in the same place the locale axis is recorded.

## Retention and artifacts

- **CI diff artifacts kept for**: [days]
- **Uploaded on**: failure only
- **Contains**: expected, actual, diff, plus the trace

## Coverage record

What this suite has actually caught. Keep it honest; it is the argument for continuing to pay for the suite.

| Date | Snapshot | What it caught |
| --- | --- | --- |
| [YYYY-MM-DD] | `checkout-summary.png` | [total row collapsed at 1280px after a grid change] |

If this table is empty after two quarters, the suite is a cost with no demonstrated benefit. Either the coverage is aimed at the wrong surfaces or visual testing is not the right tool here. Say so rather than letting it drift.
