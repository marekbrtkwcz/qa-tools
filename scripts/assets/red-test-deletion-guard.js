#!/usr/bin/env node
/**
 * qa-tools > test-automation hook: red-test-deletion-guard
 *
 * The agentic green-by-amnesia failure mode: a suite is red, and instead
 * of fixing the product the agent makes it green by deleting the failing
 * test file or stripping its assertions. This guard blocks the two
 * deterministic shapes of that pattern:
 * - BLOCK: bash commands that delete or move test files (rm, git rm, mv,
 * git mv) when the command targets a test path, and file edits whose
 * old_string asserts and whose new_string carries no assertion at all
 * (the assertion was deleted, not changed) in a test-named file.
 * - WARN: never-blocking near misses - in-place bash mutations of test
 * files (sed/perl/dd/tee, same subset as test-file-guard), deletion-like
 * commands with looser syntax (rimraf, Remove-Item), and edits that
 * reduce assertions without removing them all.
 *
 * Escape hatch (same pardon model as test-file-guard): a write or command
 * that carries the word "waiver" is downgraded to a warning - a visible,
 * deliberate removal stays possible (requirement changed, test moved to
 * another file), a silent one does not. Deletes are also denied as data
 * via the structured-response JSON on stdout (exit code 0), and the
 * script always exits 0: a guard bug fails open.
 *
 * Honesty: this gate cannot see test-run state, so it fires on the shape
 * of the change, not on the suite being red. A removal that happens to
 * coincide with a red run is exactly what the review conversation (the
 * deny message points there) is for.
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
    fs.appendFileSync(path.join(pluginDataDir(), 'red-test-deletion-guard.log'), `${line}\n`);
  } catch (_e) {
    /* ignore write failures */
  }
}

// Test-file name classes: JS/TS (.test/.spec.[jt]sx?), Go (*_test.go),
// Python (test_*.py, *_test.py), Robot Framework (*.robot), plus test
// directories (tests/, test/, e2e/, __tests__/).
const TEST_FILE =
  /\.(?:test|spec)\.[jt]sx?$|\.robot$|_test\.go$|_test\.py$|(^|[\\/])test_[^\\/]*\.py$|(^|[\\/])(?:tests?|e2e|__tests__)[\\/]/i;

// Loose matcher for bash mode (anchors never fire mid-command); warn-only
// contexts only, where a false hit costs a warning, not a deny.
const TEST_FILE_BASH =
  /\.(?:test|spec)\.[jt]sx?\b|\.robot\b|_test\.go\b|_test\.py\b|\btest_[^\s"'|;&]*\.py\b|\b(?:tests?|e2e|__tests__)\//i;
// Deletion directories also count: removing "tests/" or "e2e/" as a whole
// removes every test inside without naming a single test file. The trailing
// slash is required on purpose: a bare "test" token at the end of a command
// is "npm test", not a tree - false positives cost trust in the gate.
const TEST_TREE = /(?:^|[\s"'=])(?:[^\s"';&|]*[\\/])?(?:tests?|e2e|__tests__)[\\/][^\s"']*$/;

const PARDON = /\bwaiver\b/i;

// A command token that removes or relocates files. Matched at a command
// start or after a chain separator only, so "npm run rm-artifacts" or a
// flag-like "--rm" never fires the delete branch (word boundary alone
// would: \brm\b matches "rm" inside "rm-artifacts").
const _CHAIN = /(?:^|&&|\|\||[;&])\s*/y;
const BASH_DELETE = [
  {
    re: commandStartToken(/git\s+rm\b/),
    why: 'git rm on a test file deletes the test from the repo',
  },
  {
    re: commandStartToken(/git\s+mv\b/),
    why: 'git mv on a test file relocates it out of the suite',
  },
  {
    re: commandStartToken(/(?:[a-z]-[a-z]\s+)*rm\b/),
    why: 'rm on a test file deletes the test',
  },
  {
    re: commandStartToken(/(?:[a-z]-[a-z]\s+)*mv\b/),
    why: 'mv on a test file relocates it out of the suite',
  },
  {
    re: commandStartToken(/unlink\b/),
    why: 'unlink deletes the test file',
  },
];

// Deletion-shaped but with looser syntax: warn, do not block.
const BASH_DELETE_SOFT = /\brimraf\b|\bRemove-Item\b|\bdel\s+/i;

// In-place write primitives (same deliberate subset as test-file-guard):
// they can gut a test file's body without deleting the file.
const BASH_WRITE =
  />>?|\btee\b|\btruncate\b|\bsed\b[\s\S]{0,40}?-[a-z]*i[a-z]*\b|\bperl\b[\s\S]{0,40}?-pi\b|\bdd\b[\s\S]{0,40}?of\s*=/;

function commandStartToken(re) {
  return new RegExp(`(?:^|&&|\\|\\||[;&])(?:\\s|[a-z]-[a-z]\\s)*${re.source}`, re.flags);
}

// Assertion shapes per language: JS/TS expect()/assert(...), Python's bare
// `assert x == y` statement (no parens - a paren-only pattern was blind to
// idiomatic pytest), Go's t.Error/t.Fatal/t.Fail family, and Robot's
// `Should ...` library keywords at line start.
const ASSERTION_PATTERNS = [
  /\b(?:expect|assert)(?:\.[a-zA-Z]+)?\s*\(/g,
  /^[ \t]*assert[ \t]+\S/gm,
  /\bt\.(?:Error|Fatal|Fail)(?:f|Now)?\s*\(/g,
  /^[ \t]*Should[ \t]+\S+/gm,
];
function countAssertions(text) {
  let n = 0;
  for (const re of ASSERTION_PATTERNS) {
    const m = text.match(re);
    if (m) n += m.length;
  }
  return n;
}

/**
 * Same payload contract as test-file-guard: write_file uses {path, content},
 * edit uses {file_path, old_string, new_string}, bash carries {command}.
 * Here the decisive text differs per shape: the delete branch needs the
 * command; the assertion branch needs old_string (what was there) and
 * new_string (what will be there).
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
  if (typeof input.command === 'string' && input.command) return { bash: true, command: input.command };
  if (typeof input.old_string === 'string' && typeof input.new_string === 'string') {
    return { filePath, edit: true, oldString: input.old_string, newString: input.new_string };
  }
  return null;
}

const info = classify(raw);
if (!info) process.exit(0);

const stamp = new Date().toISOString();
const block = [];
const warn = [];

if (info.bash) {
  const command = info.command;
  const targetsTests = TEST_FILE_BASH.test(command) || TEST_TREE.test(command.trim());
  // rm/mv on ordinary paths is everyday work: stay silent unless the
  // command targets a test path. Then deletes block, near-misses warn.
  if (targetsTests) {
    const pardoned = PARDON.test(command);
    for (const d of BASH_DELETE) {
      if (!d.re.test(command)) continue;
      if (pardoned) {
        const note = `${d.why} — annotated with a waiver; keep the waiver dated and owned`;
        if (!warn.includes(note)) warn.push(note);
      } else if (!block.includes(d.why)) {
        block.push(d.why);
      }
    }
    if (BASH_DELETE_SOFT.test(command) && !pardoned) {
      const w =
        'deletion-shaped command on a test path (rimraf/Remove-Item/del) — if this deletes tests, that belongs in the review conversation, not in a shell one-liner';
      if (!warn.includes(w)) warn.push(w);
    }
    if (BASH_WRITE.test(command)) {
      const w =
        'in-place bash edit of a test file bypasses the file-tool gates — use the file tools for test files, or edit the product code if that is what you meant';
      if (!warn.includes(w)) warn.push(w);
    }
  }
} else if (info.edit) {
  const isTestFile = TEST_FILE.test(info.filePath);
  const name = path.basename(info.filePath);
  const oldAssertions = countAssertions(info.oldString);
  const newAssertions = countAssertions(info.newString);
  const pardoned = PARDON.test(info.newString) || PARDON.test(info.oldString);
  if (isTestFile && oldAssertions > 0 && newAssertions === 0) {
    const why = `edit removes every assertion from ${name} without adding one back - making a suite green by deleting assertions is the failure mode this gate exists for`;
    if (pardoned) {
      const note = `${why} — waived (visible removal accepted); keep the waiver dated and owned in the trace`;
      if (!warn.includes(note)) warn.push(note);
    } else {
      block.push(why);
    }
  } else if (isTestFile && newAssertions < oldAssertions && !pardoned) {
    const w = `edit shrinks assertions in ${name} (${oldAssertions} -> ${newAssertions}) - make sure behavior moved, not coverage`;
    if (!warn.includes(w)) warn.push(w);
  }
}

const scope = info.bash ? '(bash command)' : path.basename(info.filePath || 'unknown');
if (block.length) {
  logLine(`[red-test-deletion-guard] ${stamp} BLOCK ${scope}: ${block.join('; ')}`);
}
if (warn.length) {
  logLine(`[red-test-deletion-guard] ${stamp} WARN ${scope}: ${warn.join('; ')}`);
}

if (block.length) {
  const notes = warn.length ? ` Also noted (not blocking): ${warn.join('; ')}.` : '';
  process.stdout.write(
    `${JSON.stringify({
      decision: 'deny',
      reason:
        `red-test-deletion-guard ${scope}: ${block.join('; ')}. ` +
        'A red suite is fixed in the product or by a registered waiver, not by removing the test. ' +
        'If this removal is deliberate (requirement changed, test moved), redo the change with a waiver annotation ' +
        '(e.g. "waiver: owner=<you> until=<date> ticket=<id>") and it will pass with a warning.' +
        notes,
    })}\n`,
  );
} else if (warn.length) {
  process.stdout.write(
    `${JSON.stringify({
      decision: 'allow',
      system_message: `red-test-deletion-guard ${scope}: ${warn.join('; ')}`,
    })}\n`,
  );
}
process.exit(0);
