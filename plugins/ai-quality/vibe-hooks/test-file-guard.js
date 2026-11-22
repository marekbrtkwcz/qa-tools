#!/usr/bin/env node
/**
 * qa-tools > qa-core hook: test-file-guard
 *
 * A log-only (non-strict) pre_tool quality gate inspired by
 * awesome-agents-for-quality's "unslop-tests" invariant:
 * "A test that cannot fail proves nothing. No tautological assertions,
 *  no mock-only tests, no hardcoded waits, no retries used as a fix."
 *
 * It inspects the tool call payload for test-file writes/edits that contain
 * hardcoded waits or obvious tautological assertions. It NEVER blocks
 * (strict = false in hooks.toml); findings are logged to
 * $PLUGIN_DATA/test-file-guard.log and printed to stderr as a reminder.
 */
'use strict';

let raw = '';
try {
  raw = require('fs').readFileSync(0, 'utf8');
} catch (e) {
  process.exit(0); // no stdin -> nothing to guard, stay silent
}

function pluginDataDir() {
  try {
    const env = process.env.PLUGIN_DATA;
    if (env) {
      require('fs').mkdirSync(env, { recursive: true });
      return env;
    }
  } catch (e) {
    /* ignore */
  }
  return require('os').tmpdir();
}

const TESTY = /\.(test|spec)\.[jt]sx?$|(^|\/)(tests?|e2e)\//i;
const SMELLS = [
  { re: /waitForTimeout\s*\(\s*\d+\s*\)/g, why: 'hardcoded wait: waitForTimeout() — prefer a deterministic condition' },
  { re: /(cy\.wait|Thread\.sleep)\s*\(\s*\d+\s*\)/g, why: 'hardcoded sleep — prefer a deterministic condition' },
  { re: /expect\s*\(\s*true\s*\)\s*\.\s*toBe\s*\(\s*true\s*\)/g, why: 'tautological assertion: expect(true).toBe(true) proves nothing' },
  { re: /\.toHaveLength\s*\(\s*0\s*\)\s*;?\s*\/\/.*pass/i, why: 'suspicious always-pass construct' },
];

function* walk(value) {
  if (value == null) return;
  if (typeof value === 'string') {
    yield value;
  } else if (Array.isArray(value)) {
    for (const v of value) yield* walk(v);
  } else if (typeof value === 'object') {
    for (const v of Object.values(value)) yield* walk(v);
  }
}

let payload;
try {
  payload = JSON.parse(raw);
} catch (e) {
  payload = null;
}

const findings = [];
if (payload) {
  for (const s of walk(payload)) {
    const looksLikeTestFile = TESTY.test(s);
    for (const smell of SMELLS) {
      smell.re.lastIndex = 0;
      if (smell.re.test(s)) {
        findings.push({ looksLikeTestFile, why: smell.why });
      }
    }
  }
}

if (findings.length) {
  const line = `[test-file-guard] ${new Date().toISOString()} ${findings.length} finding(s): ${[
    ...new Set(findings.map((f) => f.why)),
  ].join('; ')}`;
  try {
    require('fs').appendFileSync(require('path').join(pluginDataDir(), 'test-file-guard.log'), line + '\n');
  } catch (e) {
    /* ignore write failures */
  }
  console.error(line);
}
process.exit(0);
