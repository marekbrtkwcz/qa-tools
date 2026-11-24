# Compatibility matrix template and checks

## Matrix

| Dimension | Full list (support policy) | Must-test subset | Reduction rule |
| --- | --- | --- | --- |
| Browser + version | | | top usage + policy floor |
| OS + version | | | same |
| Device / screen size | | | top devices + min/max sizes |
| Assistive tech | | | policy list (screen reader, zoom) |

Record per run: cell = exact versions (e.g. "Chrome 126 / Win 11 / 1920×1080").

## Per-cell checks (per critical flow)

- flow completes end to end
- layout usable at the cell's resolution (no overflow/cutoff)
- no console errors
- environment seams: file upload, date/time input, copy-paste, notifications, local storage, printing

## Gap reporting

- flows × cells coverage table; untested high-usage cell = reported risk
