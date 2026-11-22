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
 * - BLOCK: test.only()/it.only()/describe.only()/fit()/fdescribe() in a file
 *   whose name says it is a test file (.test/.spec, tests/, e2e/, __tests__).
 *   Zero false positives, so it is denied via the structured-response JSON
 *   on stdout: {"decision": "deny", "reason": "..."} with exit code 0.
 *   A committed .only() silently runs a subset and skips every other test.
 * - WARN: hardcoded waits, tautological assertions, always-pass constructs —
 *   never blocking; surfaced as {"decision": "allow", "system_message": "..."}
 *   and appended to $PLUGIN_DATA/test-file-guard.log.
 *
 * The script always exits 0: a guard bug fails open (Vibe prints a warning,
 * the gated action proceeds) instead of blocking someone's edit.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch (e) {
  process.exit(0); // no stdin -> nothing to guard, stay silent
}

function pluginDataDir() {
  try {
    const env = process.env.PLUGIN_DATA;
    if (env) {
      fs.mkdirSync(env, { recursive: true });
      return env;
    }
  } catch (e) {
    /* ignore */
  }
  return require('os').tmpdir();
}

function logLine(line) {
  try {
    fs.appendFileSync(path.join(pluginDataDir(), 'test-file-guard.log'), line + '\n');
  } catch (e) {
    /* ignore write failures */
  }
}

const TEST_FILE = /\.(test|spec)\.[jt]sx?$|(^|[\\/])(tests?|e2e|__tests__)[\\/]/i;

// Blocking smells: a focused-run filter in a test file runs only a subset.
const BLOCK = [
  {
    re: /\b(?:test|it|describe|context)\.only\s*\(/,
    why: '.only() focused test: a committed .only() silently runs a subset and skips every other test in the file',
  },
  {
    re: /\b(?:fit|fdescribe)\s*\(/,
    why: 'focused test (fit()/fdescribe()): runs only a subset, easy to commit by accident',
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
 */
function classify(rawText) {
  let payload = null;
  try {
    payload = JSON.parse(rawText);
  } catch (e) {
    return null;
  }
  const input = payload && payload.tool_input;
  if (!input || typeof input !== 'object') return null;
  const filePath =
    typeof input.path === 'string' ? input.path :
    typeof input.file_path === 'string' ? input.file_path : null;
  if (!filePath) return null;
  const texts = [];
  if (typeof input.content === 'string') texts.push(input.content);
  if (typeof input.new_string === 'string') texts.push(input.new_string);
  if (!texts.length) return null;
  return { filePath, texts };
}

const info = classify(raw);
if (!info) process.exit(0);

const isTestFile = TEST_FILE.test(info.filePath);
const blockFindings = [];
const warnFindings = [];

for (const text of info.texts) {
  for (const b of BLOCK) {
    if (b.re.test(text) && !blockFindings.includes(b.why)) blockFindings.push(b.why);
  }
  for (const w of WARN) {
    if (w.re.test(text) && !warnFindings.includes(w.why)) warnFindings.push(w.why);
  }
}

// A focused-run filter outside a test-named file is suspicious but not
// certain (it may be a test file with an unusual name) — warn, do not block.
let block = blockFindings;
if (blockFindings.length && !isTestFile) {
  warnFindings.push(
    `focused test outside a test-named file (${path.basename(info.filePath)}) — if this is a test file, the name should say so`
  );
  block = [];
}

const stamp = new Date().toISOString();
const name = path.basename(info.filePath);
if (block.length) {
  logLine(`[test-file-guard] ${stamp} BLOCK ${name}: ${block.join('; ')}`);
}
if (warnFindings.length) {
  logLine(`[test-file-guard] ${stamp} WARN ${name}: ${warnFindings.join('; ')}`);
}

if (block.length) {
  const notes = warnFindings.length ? ` Also noted (not blocking): ${warnFindings.join('; ')}.` : '';
  process.stdout.write(
    JSON.stringify({
      decision: 'deny',
      reason: `${name}: ${block.join('; ')}. Remove the focused-run filter before saving.${notes}`,
    }) + '\n'
  );
} else if (warnFindings.length) {
  process.stdout.write(
    JSON.stringify({
      decision: 'allow',
      system_message: `test-file-guard on ${name}: ${warnFindings.join('; ')}`,
    }) + '\n'
  );
}
process.exit(0);
