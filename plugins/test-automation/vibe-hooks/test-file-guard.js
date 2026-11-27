#!/usr/bin/env node
/**
 * qa-tools > test-automation hook: test-file-guard
 *
 * A pre_tool quality gate inspired by awesome-agents-for-quality's
 * "unslop-tests" invariant: "A test that cannot fail proves nothing. No
 * tautological assertions, no mock-only tests, no hardcoded waits, no retries
 * used as a fix."
 *
 * Severity model (Vibe hooks wire protocol):
 * - BLOCK: test.only()/it.only()/fit() (focused run) and it.skip()/xit()/
 *   describe.skip() (silenced tests) in a file whose name says it is a test
 *   file (.test/.spec, *_test.go, test_*.py, *_test.py, *.robot, tests/,
 *   e2e/, __tests__). Zero false positives, so it
 *   is denied via the structured-response JSON on stdout:
 *   {"decision": "deny", "reason": "..."} with exit code 0. A committed
 *   .only() silently runs a subset; a committed .skip() silently disables
 *   the test. The skip family has an escape hatch: an annotated skip (the
 *   write also contains the word "waiver", e.g. a dated owner+expiry
 *   comment) is downgraded to a warning - a visible, deliberate quarantine
 *   is legitimate practice; a silent one is not.
 * - WARN: hardcoded waits, tautological assertions, always-pass constructs,
 *   and bash writes aimed at test files (the file-tool gates cannot see
 *   heredoc/tee/sed writes, so they get a pointed warning instead of a
 *   denial - bash command parsing is too unreliable to block on) — never
 *   blocking; surfaced as {"decision": "allow", "system_message": "..."}
 *   and appended to $PLUGIN_DATA/test-file-guard.log.
 *
 * The script always exits 0: a guard bug fails open (Vibe prints a warning,
 * the gated action proceeds) instead of blocking someone's edit.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch (_e) {
  process.exit(0); // no stdin -> nothing to guard, stay silent
}

function pluginDataDir() {
  try {
    const env = process.env.PLUGIN_DATA;
    if (env) {
      fs.mkdirSync(env, { recursive: true });
      return env;
    }
  } catch (_e) {
    /* ignore */
  }
  return require('node:os').tmpdir();
}

function logLine(line) {
  try {
    fs.appendFileSync(path.join(pluginDataDir(), 'test-file-guard.log'), `${line}\n`);
  } catch (_e) {
    /* ignore write failures */
  }
}

// Test-file name classes: JS/TS (.test/.spec.[jt]sx?), Go (*_test.go),
// Python (test_*.py, *_test.py), Robot Framework (*.robot), plus test
// directories (tests/, test/, e2e/, __tests__/).
const TEST_FILE =
  /\.(?:test|spec)\.[jt]sx?$|\.robot$|_test\.go$|_test\.py$|(^|[\\/])test_[^\\/]*\.py$|(^|[\\/])(?:tests?|e2e|__tests__)[\\/]/i;

// In bash commands a test path is embedded mid-command, so TEST_FILE's
// anchors ($ for the extension, ^ or a slash before the directory) never
// fire. The loose matcher trades precision for recall - it is only used in
// warn-only bash mode, where a false hit costs a warning, not a deny.
const TEST_FILE_BASH =
  /\.(?:test|spec)\.[jt]sx?\b|\.robot\b|_test\.go\b|_test\.py\b|\btest_[^\s"'|;&]*\.py\b|\b(?:tests?|e2e|__tests__)\//i;

// Blocking smells: focused-run filters and silenced tests. `pardonable`
// skips are downgraded to a warning when the same write carries a waiver
// annotation - a deliberate quarantine stays possible, a silent one does not.
const PARDON = /\bwaiver\b/i;
const BLOCK = [
  {
    re: /\b(?:test|it|describe|context)\.only\s*\(/,
    why: '.only() focused test: a committed .only() silently runs a subset and skips every other test in the file',
  },
  {
    re: /\b(?:fit|fdescribe)\s*\(/,
    why: 'focused test (fit()/fdescribe()): runs only a subset, easy to commit by accident',
  },
  {
    re: /\b(?:test|it|describe|context)\.skip\s*\(/,
    why: 'skipped test (it.skip()/test.skip()/describe.skip()): a committed skip silently disables the test',
    pardonable: true,
  },
  {
    re: /\b(?:xit|xdescribe)\s*\(/,
    why: 'skipped test (xit()/xdescribe()): silently disabled, easy to commit by accident',
    pardonable: true,
  },
  {
    re: /\bt\.Skipf?\s*\(/,
    why: 'skipped test (Go t.Skip/t.Skipf): a committed skip silently disables the test',
    pardonable: true,
  },
  {
    re: /@(?:pytest\.mark\.skip(?:if)?|unittest\.skip\w*)\b|\bpytest\.skip\s*\(/i,
    why: 'skipped test (pytest.mark.skip/skipif, pytest.skip, unittest.skip): silently disabled',
    pardonable: true,
  },
  {
    // Robot's BuiltIn Skip keyword: a line starting with "Skip" inside a
    // .robot file. File-scoped: the same words in JS/Python prose are not it.
    re: /^[ \t]*Skip[ \t]+\S+/m,
    why: 'skipped test (Robot Framework Skip keyword): skips the rest of the test case',
    pardonable: true,
    file: /\.robot$/i,
  },
];

// Warning smells: logged and surfaced, never blocking on their own.
const WARN = [
  {
    re: /waitForTimeout\s*\(\s*\d+\s*\)/,
    why: 'hardcoded wait: waitForTimeout() — prefer a deterministic condition',
  },
  {
    re: /(?:cy\.wait|Thread\.sleep)\s*\(\s*\d+\s*\)/,
    why: 'hardcoded sleep — prefer a deterministic condition',
  },
  {
    re: /\btime\.sleep\s*\(/i,
    why: 'hardcoded sleep (Python time.sleep) — prefer a deterministic condition',
  },
  {
    re: /\btime\.Sleep\s*\(/,
    why: 'hardcoded sleep (Go time.Sleep) — prefer a deterministic condition',
  },
  {
    // Robot's Sleep keyword (BuiltIn/OperatingSystem), file-scoped like Skip.
    re: /^[ \t]*Sleep[ \t]+\S+/m,
    why: 'hardcoded sleep (Robot Sleep keyword) — prefer Wait Until ... conditions',
    file: /\.robot$/i,
  },
  {
    re: /expect\s*\(\s*true\s*\)\s*\.\s*toBe\s*\(\s*true\s*\)/,
    why: 'tautological assertion: expect(true).toBe(true) proves nothing',
  },
  {
    re: /\.toHaveLength\s*\(\s*0\s*\)\s*;?\s*\/\/.*pass/i,
    why: 'suspicious always-pass construct',
  },
];

/**
 * Extract the target file path and the about-to-be-written text from a
 * pre_tool payload. write_file uses {path, content}; edit uses
 * {file_path, new_string}. old_string is not scanned: it is the text being
 * removed, and warning on it would flag the very code the edit removes.
 * A bash payload has {command} and no path: the guard switches to warn-only
 * bash mode (the command may write test files the file gates never see).
 */
function classify(rawText) {
  let payload = null;
  try {
    payload = JSON.parse(rawText);
  } catch (_e) {
    return null;
  }
  const input = payload?.tool_input;
  if (!input || typeof input !== 'object') return null;
  const filePath =
    typeof input.path === 'string' ? input.path : typeof input.file_path === 'string' ? input.file_path : null;
  if (!filePath) {
    if (typeof input.command === 'string' && input.command) return { bash: true, command: input.command };
    return null;
  }
  const texts = [];
  if (typeof input.content === 'string') texts.push(input.content);
  if (typeof input.new_string === 'string') texts.push(input.new_string);
  if (!texts.length) return null;
  return { filePath, texts };
}

// Bash write primitives that create or rewrite a file. Deliberately a
// subset (redirection, tee, in-place editors): listing files is harmless.
const BASH_WRITE =
  />>?|\btee\b|\btruncate\b|\bsed\b[\s\S]{0,40}?-[a-z]*i[a-z]*\b|\bperl\b[\s\S]{0,40}?-pi\b|\bdd\b[\s\S]{0,40}?of\s*=/;

const info = classify(raw);
if (!info) process.exit(0);

const stamp = new Date().toISOString();

/**
 * Bash mode: a command that writes into a test file bypasses the file-tool
 * gates entirely. The command string cannot be parsed reliably enough to
 * deny on, so this is a pointed warning, never a block.
 */
if (info.bash) {
  const reasons = [];
  if (BASH_WRITE.test(info.command) && TEST_FILE_BASH.test(info.command)) {
    reasons.push(
      'bash write to a test file bypasses test-file-guard — use the file tools for test files so the gate can check them',
    );
  }
  for (const b of BLOCK) {
    // file-scoped patterns (e.g. Robot keywords) have no path to check in a
    // bare command string - skip them here rather than guess
    if (b.file) continue;
    if (b.re.test(info.command) && !reasons.includes(b.why)) reasons.push(b.why);
  }
  for (const w of WARN) {
    if (w.file) continue;
    if (w.re.test(info.command) && !reasons.includes(w.why)) reasons.push(w.why);
  }
  if (reasons.length) {
    logLine(`[test-file-guard] ${stamp} WARN (bash): ${reasons.join('; ')}`);
    process.stdout.write(
      `${JSON.stringify({
        decision: 'allow',
        system_message: `test-file-guard (bash command): ${reasons.join('; ')}`,
      })}\n`,
    );
  }
  process.exit(0);
}

const isTestFile = TEST_FILE.test(info.filePath);
const blockFindings = [];
const warnFindings = [];

for (const text of info.texts) {
  const pardoned = PARDON.test(text);
  for (const b of BLOCK) {
    if (b.file && !b.file.test(info.filePath)) continue;
    if (!b.re.test(text)) continue;
    if (b.pardonable && pardoned) {
      const note = `${b.why} — annotated skip (waiver present) accepted as a visible quarantine; keep the waiver dated and owned`;
      if (!warnFindings.includes(note)) warnFindings.push(note);
      continue;
    }
    if (!blockFindings.includes(b.why)) blockFindings.push(b.why);
  }
  for (const w of WARN) {
    if (w.file && !w.file.test(info.filePath)) continue;
    if (w.re.test(text) && !warnFindings.includes(w.why)) warnFindings.push(w.why);
  }
}

// A focused-run filter outside a test-named file is suspicious but not
// certain (it may be a test file with an unusual name) — warn, do not block.
let block = blockFindings;
if (blockFindings.length && !isTestFile) {
  warnFindings.push(
    `blocked smell outside a test-named file (${path.basename(info.filePath)}) — if this is a test file, the name should say so`,
  );
  block = [];
}

const name = path.basename(info.filePath);
if (block.length) {
  logLine(`[test-file-guard] ${stamp} BLOCK ${name}: ${block.join('; ')}`);
}
if (warnFindings.length) {
  logLine(`[test-file-guard] ${stamp} WARN ${name}: ${warnFindings.join('; ')}`);
}

if (block.length) {
  const notes = warnFindings.length ? ` Also noted (not blocking): ${warnFindings.join('; ')}.` : '';
  const skipHint = block.some((b) => b.includes('skipped test'))
    ? ' For a deliberate quarantine, annotate the skip with a waiver comment (e.g. "waiver: owner=<you> until=<date>") and save again.'
    : '';
  process.stdout.write(
    `${JSON.stringify({
      decision: 'deny',
      reason: `${name}: ${block.join('; ')}. Remove the focused-run filter or silent skip before saving.${skipHint}${notes}`,
    })}\n`,
  );
} else if (warnFindings.length) {
  process.stdout.write(
    `${JSON.stringify({
      decision: 'allow',
      system_message: `test-file-guard on ${name}: ${warnFindings.join('; ')}`,
    })}\n`,
  );
}
process.exit(0);
