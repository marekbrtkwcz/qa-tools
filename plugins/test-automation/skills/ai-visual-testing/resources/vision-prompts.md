# Vision Model Prompts for Visual Testing

## Base comparison prompt

```
Compare these two screenshots of the same page.
Image 1 = baseline (expected), Image 2 = current (under test).
Page context: {page_description}
Viewport: {viewport}
Known acceptable differences: dynamic timestamps, ads, user avatars, cursor, sub-pixel antialiasing, current date/time displays.

Question: Is there a REAL visual defect in Image 2 that a user would notice?

Respond in JSON:
{
  "verdict": "defect" | "no-defect",
  "confidence": 0.0-1.0,
  "location": "where in the image (if defect)",
  "description": "what is wrong (if defect)"
}
```

## Page-specific variants

| Page type | Extra context to include |
|---|---|
| Login / form | "Ignore: password field masking, input focus ring" |
| Dashboard / charts | "Ignore: live data refresh, chart animation mid-state" |
| E-commerce product | "Ignore: stock count, price fluctuation, personalized recommendations" |
| Mobile viewport | "Ignore: browser chrome, safe-area insets" |
| Localized / RTL | "Check: text direction, alignment, truncation in {language}" |

## Calibration checklist

- [ ] 10 known false-positive diffs → AI says "no-defect" on all
- [ ] 10 known real defects → AI says "defect" on all (zero false negatives)
- [ ] Confidence threshold set so borderline cases escalate to humans
- [ ] Verdict log captures image paths for every decision
