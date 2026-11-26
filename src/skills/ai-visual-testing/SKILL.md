---
name: ai-visual-testing
description: 'Adds LLM-powered visual verification to complement pixel-based visual regression: a vision model judges whether a visual change is a real defect or acceptable (layout shift, dynamic content, font rendering), cutting false positives from screenshot diffs. Use when pixel-based visual tests produce too many false positives, dynamic content makes screenshot comparison unreliable, or when deciding which snapshot failures need human eyes. For classic pixel-diff visual regression setup, use running-visual-regression-tests.'
argument-hint: 'Screenshots or pages to verify, the baseline to compare against, and what kind of change is acceptable'
user-invocable: true
---

# AI Visual Testing

Pixel-based visual regression (screenshot diff) is precise but noisy: a one-pixel font rendering difference, a shifting ad banner, or a timestamp flags as a failure. AI visual testing uses a vision-capable LLM to judge screenshots semantically — "is this a real visual defect or acceptable variation?" — cutting false positives while keeping real regressions visible.

## When to Use

- Pixel-diff visual tests produce too many false positives to review
- Dynamic content (ads, timestamps, avatars) makes screenshots never match exactly
- You want semantic review of visual changes ("did the layout break?") not pixel comparison
- Triaging a batch of visual regression failures and need to know which are real
- Localized/RTL content where pixel diff is misleading

## When NOT to Use
- Setting up baseline screenshot infrastructure from scratch — use `running-visual-regression-tests`
- A single visual bug to report — use `reporting-bugs`
- No vision model available in the environment — pixel-diff is the fallback

## Workflow

### 1. Decide where AI review fits in the pipeline

| Stage | Role of AI |
|---|---|
| Pre-filter | Run AI on every diff, auto-approve obvious non-issues, escalate the rest to humans |
| Triage | After pixel-diff flags N failures, AI ranks them by severity/realness |
| Full replacement | Skip pixel-diff entirely for certain pages, use AI comparison only (slower, more semantic) |

Default: pre-filter. AI is best at killing obvious false positives cheaply.

### 2. Build the comparison prompt

Send the vision model two images (baseline + current) plus context:

```
Compare these two screenshots of the same page.
Baseline is the first image, current is the second.
Context: checkout page, desktop viewport, after a CSS refactor.
Question: is there a real visual defect in the current screenshot?
Ignore: dynamic timestamps, ads, cursor position, sub-pixel antialiasing.
Answer with: VERDICT (defect / no defect), CONFIDENCE (0-1),
and if defect: LOCATION and DESCRIPTION.
```

- Always include the "ignore" list — without it the model flags dynamic content
- Always ask for a structured verdict, not free text
- Done when: prompt template exists and returns structured output on a known-defect sample

### 3. Wire into the test flow (Playwright example)

```typescript
// On visual diff failure, before failing the test:
if (diffPixelRatio > threshold) {
  const verdict = await askVisionModel(baselineShot, currentShot, pageContext);
  if (verdict.verdict === 'no defect' && verdict.confidence > 0.8) {
    test.info().annotations.push({ type: 'ai-approved', description: verdict.description });
    return; // pass despite pixel diff
  }
  expect(diffPixelRatio).toBeLessThan(threshold); // real defect, fail
}
```

- Log every AI verdict with the images' paths so a human can audit the AI's judgment
- Done when: a known false-positive diff is auto-approved and a known defect still fails

### 4. Calibrate and monitor

- Run on a sample of recent visual diffs with known outcomes (real defects vs false positives)
- Measure: false-negative rate (real defects the AI approved) — this must be near zero
- If the AI approves a real defect, tighten the prompt or lower the confidence threshold
- Review AI decisions weekly; retrain the prompt when the UI changes significantly
- Done when: false-negative rate is 0 on the calibration sample

## Output

- A vision-model prompt template for visual comparison
- Integration point in the visual regression flow (pre-filter or triage)
- A log of AI verdicts with image references for auditability
- Calibration report: false-positive reduction %, false-negative count

## Resource Map

- `resources/vision-prompts.md`: prompt templates for different page types (form, dashboard, mobile), structured output schemas, calibration checklist

## Related Skills

- `running-visual-regression-tests` — the pixel-based baseline this complements
- `analyzing-quality-metrics` — measuring false-positive rate as a metric
- `testing-llm-features` — when the vision model call itself needs testing

## Definition of Done

- AI visual comparison runs on visual diff failures in at least one test
- Known false positive is auto-approved, known defect still fails
- All AI verdicts are logged with image paths
- Calibration sample shows zero false negatives
