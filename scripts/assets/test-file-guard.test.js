#!/usr/bin/env node
/**
 * Unit tests for scripts/assets/test-file-guard.js (the shipped hook).
 *
 * The hook is a standalone script with no exports by design: it talks the
 * Vibe hooks wire protocol on stdin/stdout. These tests exercise it the
 * way the host does - spawn the process, feed a pre_tool payload on
 * stdin, assert on the structured JSON decision on stdout.
 *
 * Meta note: the blocked patterns are built from fragments (see C below).
 * A test-named file containing the raw patterns would be denied by the very
 * guard it tests - string literals are indistinguishable from real use to
 * a content-scanning gate, so the patterns exist at runtime only.
 *
 * Severity model pinned here:
 * - deny (structured, exit 0): focused-run filters and the silent-skip
 *   family in test-named files
 * - deny is downgraded to allow+system_message when the write carries a
 *   waiver annotation (deliberate quarantine) or the file is not test-named
 * - bash tool input is warn-only: a write into a test file bypasses the
 *   file gates, and unreliable command parsing must never block an edit
 * - no stdin / invalid JSON / non-matching tool input -> silent exit 0
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const GUARD = path.join(__dirname, 'test-file-guard.js');

// Blocked patterns, assembled from fragments so this source file does not
// contain them literally (the guard scans this file's own name class).
const C = {
  testOnly: 'test' + '.only(',
  itOnly: 'it' + '.only(',
  fit: 'f' + 'it(',
  fdescribe: 'f' + 'describe(',
  itSkip: 'it' + '.skip(',
  testSkip: 'test' + '.skip(',
  describeSkip: 'describe' + '.skip(',
  xit: 'x' + 'it(',
  xdescribe: 'x' + 'describe(',
};

/** Run the hook the way Vibe does: payload JSON on stdin, structured JSON out. */
function runHook(payload, rawStdin) {
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'test-file-guard-test-'));
  const res = spawnSync(process.execPath, [GUARD], {
    input: rawStdin !== undefined ? rawStdin : JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, PLUGIN_DATA: pluginData },
  });
  const trimmed = (res.stdout || '').trim();
  let decision = null;
  try {
    decision = JSON.parse(trimmed);
  } catch (_e) {
    decision = null; // silence (no findings) is also a valid outcome
  }
  return { status: res.status, decision };
}

const writeFile = (p, content) => ({ tool_input: { path: p, content } });
const editFile = (p, new_string) => ({ tool_input: { file_path: p, new_string } });
const bash = (command) => ({ tool_input: { command } });

/* ---------- deny: focused-run filters (unchanged behavior) ---------- */

test('BLOCK: focused-run filter in a .spec.ts write is denied', () => {
  const { status, decision } = runHook(writeFile('src/app.spec.ts', `${C.testOnly}"one", () => {});\n`));
  assert.equal(status, 0, 'the guard always exits 0 - a hook crash must fail open');
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('.only'), decision.reason);
});

test('BLOCK: focused-run f-filter added via edit to a tests/ file is denied (exit 0)', () => {
  const { status, decision } = runHook(editFile('tests/login.ts', `${C.fit}"does login", () => {});\n`));
  assert.equal(status, 0);
  assert.equal(decision.decision, 'deny');
});

/* ---------- deny: the silent-skip family (new) ---------- */

test('BLOCK: it-skip in a .spec.ts write is denied with the waiver hint', () => {
  const { status, decision } = runHook(writeFile('src/app.spec.ts', `${C.itSkip}"broken", () => {});\n`));
  assert.equal(status, 0);
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes(C.itSkip), decision.reason);
  assert.ok(decision.reason.includes('waiver'), 'the deny reason must name the escape hatch');
});

test('BLOCK: x-prefixed skips in a .test.js write are denied', () => {
  const xit = runHook(writeFile('a.test.js', `${C.xit}"gone", () => {});\n`));
  assert.equal(xit.decision.decision, 'deny');
  assert.ok(xit.decision.reason.includes(C.xit));
  const xdescribe = runHook(writeFile('a.test.js', `${C.xdescribe}"gone", () => {});\n`));
  assert.equal(xdescribe.decision.decision, 'deny');
  assert.ok(xdescribe.decision.reason.includes(C.xdescribe));
});

test('BLOCK: describe-skip added via edit to an e2e/ file is denied', () => {
  const { decision } = runHook(editFile('e2e/smoke.ts', `${C.describeSkip}"flaky", () => {});\n`));
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes(C.describeSkip));
});

test('PARDON: a skip with a waiver annotation is allowed with a pointed warning', () => {
  const { status, decision } = runHook(
    writeFile(
      'src/app.spec.ts',
      `// waiver: owner=me until=2027-06-01 flake in CI\n${C.itSkip}"flaky login", () => {});\n`,
    ),
  );
  assert.equal(status, 0);
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('waiver'), decision.system_message);
  assert.ok(decision.system_message.includes('quarantine'));
});

test('outside a test-named file a silent skip warns instead of denying', () => {
  const { decision } = runHook(writeFile('src/index.ts', `${C.itSkip}"not a test file", () => {});\n`));
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('outside a test-named file'));
});

/* ---------- warn: quality smells (unchanged behavior) ---------- */

test('WARN: waitForTimeout in a test file allows the write with a system_message', () => {
  const { status, decision } = runHook(writeFile('src/app.spec.ts', 'await page.waitForTimeout(3000);\n'));
  assert.equal(status, 0);
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('waitForTimeout'));
});

test('WARN: tautological assertion allows the write and is named', () => {
  const { decision } = runHook(writeFile('a.test.js', 'expect(true).toBe(true);\n'));
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('tautological'));
});

test('edit payload does not scan old_string: removing the focused filter stays silent', () => {
  // the edit removes the very pattern the guard blocks; flagging it would
  // block the cleanup the guard exists to encourage. Only new_string is
  // scanned, it contains no findings, so the guard produces no output at
  // all - silence (exit 0, no JSON) is the pass-through outcome
  const { status, decision } = runHook({
    tool_input: {
      file_path: 'a.spec.ts',
      old_string: `${C.itOnly}"x", () => {});\n`,
      new_string: 'test("x", () => {});\n',
    },
  });
  assert.equal(status, 0);
  assert.equal(decision, null);
});

/* ---------- bash mode (new): warn-only ---------- */

test('BASH: heredoc write into a .spec.ts warns about the bypass, never denies', () => {
  const { status, decision } = runHook(bash(`cat > login.spec.ts <<EOF\n${C.itOnly}"x", () => {})\nEOF\n`));
  assert.equal(status, 0);
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('bypasses test-file-guard'), decision.system_message);
});

test('BASH: sed in-place against a test/ path warns; a plain ls stays silent', () => {
  const sed = runHook(bash(`sed -i 's/it(/${C.testSkip}/' tests/checkout.ts`));
  assert.equal(sed.decision.decision, 'allow');
  assert.ok(sed.decision.system_message.includes('bypasses test-file-guard'));
  const ls = runHook(bash('ls -la src/'));
  assert.equal(ls.status, 0);
  assert.equal(ls.decision, null, 'no findings must produce no output');
});

test('BASH: a command writing a non-test file stays silent', () => {
  const { decision } = runHook(bash('echo hello > README.md'));
  assert.equal(decision, null);
});

/* ---------- fail-open ---------- */

test('invalid JSON on stdin exits 0 with no output', () => {
  const { status, decision } = runHook(null, 'this is not json');
  assert.equal(status, 0);
  assert.equal(decision, null);
});

test('no stdin data at all exits 0 with no output (stdin closed immediately)', () => {
  // input: '' closes the stdin pipe at once - EOF, the same as a host that
  // fires the hook with an empty stream; a never-closing pipe must never be
  // assumed (spawn default would hang the read)
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'test-file-guard-test-'));
  const res = spawnSync(process.execPath, [GUARD], {
    input: '',
    encoding: 'utf8',
    env: { ...process.env, PLUGIN_DATA: pluginData },
  });
  assert.equal(res.status, 0);
  assert.equal((res.stdout || '').trim(), '');
});

test('tool_input without path/content/command stays silent', () => {
  const { status, decision } = runHook({ tool_input: { something: 'else' } });
  assert.equal(status, 0);
  assert.equal(decision, null);
});
