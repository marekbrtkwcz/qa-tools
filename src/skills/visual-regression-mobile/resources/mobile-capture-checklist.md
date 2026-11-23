# Mobile capture determinism checklist

Run before every capture run. Record per item: done / N/A, and the mechanism used.

## Determinism

| Check | How |
| --- | --- |
| Animations/transitions off | developer options "Animator duration scale = off" or test-build flag |
| Fixed clock | fake time in test build or recorded responses |
| Seeded data | fixture data with fixed content; stub network to recorded HAR where content varies |
| Wait for idle | wait until no spinner/skeleton/loading indicator, not a fixed sleep |
| Status bar fixed | fixed time, battery level, no notifications |
| Location/GPS fixed | mock location to a fixed coordinate |

## Variant matrix

One baseline per cell that applies:

| Dimension | Examples |
| --- | --- |
| Device / screen density | Pixel 8 (xxhdpi), iPhone 15 (3x), small Android (hdpi) |
| OS version | min supported, current, one in between |
| Locale | default + one RTL + one long-string locale (de) |
| Orientation | portrait, landscape where supported |
| Theme | light, dark |
| Font scale | default, largest accessibility size |

## Triage rules for diffs

| Diff cause | Action |
| --- | --- |
| Intended UI change | review diff, update baseline, state reason |
| Font rendering / density difference | fix capture environment (same image, same fonts), never update baseline to match a broken env |
| Dynamic content not masked | add to mask list, re-run |
| Real regression | file via reporting-bugs with device, variant, diff image |
