---
name: testing-file-uploads-and-exports
description: 'Tests file handling end to end: uploads (multipart and chunked, file type and size validation, virus scanning, storage and retrieval, permissions on the stored file) and exports (CSV/Excel/PDF generation, data correctness and encoding, large volumes, async export jobs with download links). Use when users upload or download files, when an export contains wrong or mangled data, or when a large upload fails or times out.'
argument-hint: 'Upload endpoint(s) and export feature(s) in scope, allowed file types and size limits, and the storage backend'
user-invocable: true
---

# Testing File Uploads and Exports

Use this skill when files cross the API boundary in either direction. Upload bugs are about validation and storage; export bugs are about data correctness in a rendered format. Both fail silently in the happy-path UI test: a file "uploads" but is stored unreadable, an export "works" but mangles encoding.

## When to Use

- users upload files (avatars, documents, imports)
- exports generate CSV/Excel/PDF/JSON downloads
- large files fail, time out, or corrupt
- wrong file types are accepted, or valid files are rejected
- exported data is wrong, truncated, or mis-encoded (accents, separators, formulas)
- async export jobs (queued, then downloaded via link) are in scope

## Operating Principles

- **Validate on the server, never trust the client.** Extension, MIME, and magic bytes checked server-side; size limits enforced before the body is fully read where possible.
- **Stored ≠ uploaded.** After upload, retrieve the file and compare bytes (hash), not just the 200 response.
- **Exports are data tests in a format costume.** Verify row/field counts and values against the source data; then verify the format (CSV dialect, Excel types, PDF rendering).
- **CSV/Excel injection is a finding.** Cells starting with `=`, `+`, `-`, `@` must be escaped or the file opens as a formula in Excel.
- **Large files need a strategy.** Chunked/resumable upload for big files; async export with a polling/download link for big exports; both need status and failure states tested.
- **Permissions apply to files too.** A file uploaded by user A must not be downloadable by user B (`testing-api-security` IDOR rules apply to file ids).

## Workflow

### Phase 1: Map the file surface

- upload endpoints: allowed types, size limits, per-user quotas, virus-scan step, storage location
- export features: formats, filters applied, async vs sync, download link expiry and auth

### Phase 2: Upload checks

Work through `./resources/file-handling-checklist.md`:

- valid file of each allowed type: 2xx, stored, retrievable byte-identical (hash compare), correct metadata
- disallowed extension / MIME / magic bytes: rejected with a clear error, nothing stored
- file over the size limit: rejected early (413 or documented code), no partial file stored
- chunked upload: resume after interruption completes correctly; duplicate chunks do not corrupt
- virus-scan step: EICAR test file rejected and reported
- filename handling: path traversal (`../../`), weird unicode, very long names — stored safely under a generated name
- permissions: uploader can read; other users get 403/404

### Phase 3: Export checks

- export with known dataset: row/field counts match, values match source, filters applied correctly
- encoding: UTF-8 with BOM for Excel-opening CSVs; accents, emoji, RTL text intact
- CSV dialect: separator, quoting, line endings per the declared format; formula-injection escaping
- Excel: cell types (dates as dates, numbers as numbers, not strings), sheet limits, no formula injection
- PDF: renders, page count sane, content present (spot-check text extraction)
- large export: async job → status polling → download link works, expires, and requires auth; failure state surfaces an error, not a hang
- empty result set export: produces a valid empty file with headers, not a 500

### Phase 4: Automate and report

Automate uploads via multipart API tests and downloads via response parsing (`api-playwright-test-developer`); compare hashes and parsed export content in assertions. Defects go to `reporting-bugs` with the file sample (sanitized), endpoint, and observed behaviour.

## Resource Map

- `./resources/file-handling-checklist.md` - upload and export check matrices. Read during Phases 2–3.

## Related Skills

- `api-playwright-test-developer` - multipart upload and download in Playwright API tests
- `testing-api-security` - IDOR on file ids, path traversal, upload abuse
- `testing-abuse-limits` - oversized uploads as resource exhaustion
- `testing-database-state` - file metadata rows after upload
- `handling-sensitive-test-data` - uploaded test files must be synthetic

## Definition of Done

This skill is complete when:

- every allowed type uploads and retrieves byte-identical; disallowed type/MIME/content rejected; oversize rejected early with nothing stored
- chunked upload resumes correctly; EICAR rejected; filenames sanitized; cross-user access denied
- exports verified for data correctness, encoding, CSV dialect, formula-injection escaping, and format-specific rules
- async export lifecycle (queued → ready → download → expired link) tested including failure states
- empty export produces a valid file; large export completes or fails cleanly
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |
