# File upload and export checklist

Record: check, input, expected, observed, result.

## Uploads

| Check | Expected |
| --- | --- |
| Valid file, each allowed type | 2xx; retrieve → byte-identical (hash match); metadata correct |
| Disallowed extension / MIME / magic bytes | rejected, nothing stored |
| Over size limit | 413 or documented code; no partial file |
| Chunked upload resume | completes correctly; duplicate chunks harmless |
| EICAR test file | rejected by virus scan, reported |
| Path traversal / weird / long filename | stored under generated safe name |
| Cross-user download of file id | 403/404 |
| No/invalid auth on upload | 401 |

## Exports

| Check | Expected |
| --- | --- |
| Row/field counts and values | match source data exactly, filters applied |
| Encoding (UTF-8, BOM for Excel-CSV, accents/RTL) | intact |
| CSV dialect | separator, quoting, line endings per declared format |
| Formula injection (`=`, `+`, `-`, `@` cells) | escaped |
| Excel cell types (dates, numbers) | typed, not strings |
| PDF | renders; text extractable; sane page count |
| Empty result set | valid file with headers, not an error |
| Async export lifecycle | queued → ready → download → link expiry + auth |
| Failed export job | error state surfaced, no hang |
| Large export | completes within budget or fails cleanly |
