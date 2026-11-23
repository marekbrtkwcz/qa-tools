# Formatting checklist per locale

Run with fixed input values so results are comparable across runs. Record expected vs actual per cell.

## Dates and times

| Input | What to verify |
| --- | --- |
| 2026-03-04 | order (DMY vs MDY vs YMD), separator (`-` vs `/` vs `.`) |
| 14:30 / 2:30 PM | 12h vs 24h clock, AM/PM marker placement and translation |
| 2026-03-04T14:30:00+01:00 | timezone rendering: offset, abbreviation, or converted local time — must match the product's stated behaviour |
| "yesterday", "2 days ago" | relative date strings translated and grammatically correct |
| first day of week | calendars and week pickers (Sunday vs Monday start) |
| non-Gregorian calendars | if the locale uses one (e.g. fa-IR), dates must render in that calendar |

## Numbers

| Input | What to verify |
| --- | --- |
| 1234567.89 | decimal separator (`.` vs `,`), thousands separator (`,` vs `.` vs space vs none) |
| 50% | percent sign placement and spacing |
| -42 | minus sign (hyphen vs true minus), placement |

## Currencies

| Input | What to verify |
| --- | --- |
| 1234.50 USD | symbol vs code, symbol placement (before/after), spacing |
| 1234.50 EUR in de-DE vs en-US | same amount renders differently per locale — both correct |
| -9.99 | negative amount format per locale |
| 0.00 | zero renders as a formatted amount, not blank |

## Plurals and placeholders

For each pluralizable string, test with 0, 1, 2, 5, 21, 100, and a very large number:

- the correct grammatical form is used per locale's plural rules (CLDR cardinal categories)
- placeholders (`{count}`, `{name}`) are substituted, not left literal
- placeholder order differs per language (e.g. "{name} bought {count} items" vs reversed) and still renders correctly

## Sorting and collation

- sort a list containing diacritics (a, ä, á, z, ż, ø) — order must follow the locale, not byte order
- case-insensitive sort where the locale expects it
- locale-specific alphabets (e.g. Swedish ä/ö/å after z)
