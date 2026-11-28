#!/usr/bin/env node
/**
 * Unit tests for scripts/assets/red-test-deletion-guard.js (the shipped
 * hook that blocks green-by-amnesia: deleting test files or stripping
 * assertions to make a red suite pass).
 *
 * The hook is a standalone script with no exports by design: it talks the
 * Vibe hooks wire protocol on stdin/stdout. These tests exercise it the
 * way the host does - spawn the process, feed a pre_tool payload on
 * stdin, assert on the structured JSON decision on stdout.
 *
 * Severity model pinned here:
 * - deny (structured, exit 0): bash deletes/moves targeting a test path
 *   (rm, git rm, mv, git mv, unlink), and edits in test-named files whose
 *   old_string asserts but whose new_string carries no assertion at all
 * - deny is downgraded to allow+system_message when the write/command
 *   carries a waiver annotation (deliberate, visible removal)
 * - warn (never blocking): rimraf/Remove-Item/del on test paths, in-place
 *   bash edits of test files (sed/perl/dd/tee family), and edits that
 *   shrink assertions without removing them all
 * - rm/mv commands that target no test path stay completely silent
 * - no stdin / invalid JSON / non-matching tool input -> silent exit 0
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const GUARD = path.join(__dirname, 'red-test-deletion-guard.js');

/** Run the hook the way Vibe does: payload JSON on stdin, structured JSON out. */
function runHook(payload, rawStdin) {
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'red-test-del-guard-test-'));
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

const bash = (command) => ({ tool_input: { command } });
const edit = (file_path, old_string, new_string) => ({ tool_input: { file_path, old_string, new_string } });

/* ---------- deny: bash deletes/moves targeting test paths ---------- */

test('BLOCK: rm on a test file is denied', () => {
  const { status, decision } = runHook(bash('rm tests/checkout.test.ts'));
  assert.equal(status, 0, 'the guard always exits 0 - a hook crash must fail open');
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('rm'), decision.reason);
});

test('BLOCK: rm -rf on the whole tests tree is denied even with no test file named', () => {
  const { decision } = runHook(bash('rm -rf  tests/ '));
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('rm'), decision.reason);
});

test('BLOCK: git rm of a spec file is denied', () => {
  const { decision } = runHook(bash('git rm e2e/login.spec.ts'));
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('git rm'), decision.reason);
});

test('BLOCK: mv of a test file out of the suite is denied', () => {
  const { decision } = runHook(bash('mv src/__tests__/unit.test.js src/archive/unit.test.bak'));
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('mv'), decision.reason);
});

/* ---------- deny: multilingual test-file names (Go / Python / Robot) ---------- */

test('BLOCK: rm of Go _test.go, pytest test_*.py / *_test.py and *.robot files is denied', () => {
  for (const p of ['internal/api/handler_test.go', 'tests/test_checkout.py', 'unit/calc_test.py', 'e2e/smoke.robot']) {
    const { status, decision } = runHook(bash(`rm ${p}`));
    assert.equal(status, 0);
    assert.equal(decision?.decision, 'deny', `expected deny for ${p}`);
  }
});

test('SILENT: rm of non-test lookalikes (contest.go, latest.py, robotics.md) stays silent', () => {
  for (const p of ['internal/api/contest.go', 'scripts/latest.py', 'docs/robotics.md']) {
    const { decision } = runHook(bash(`rm ${p}`));
    assert.equal(decision, null, `expected silence for ${p}`);
  }
});

/* ---------- multilingual assertion shapes (Go bare assert / t.Fatal / Robot Should) ---------- */

test('BLOCK: edit stripping every assertion from a pytest / Go / Robot test file is denied', () => {
  const py = runHook(
    edit(
      'tests/test_checkout.py',
      'def test_checkout():\n    assert cart.total == 100\n',
      'def test_checkout():\n    cart.checkout()\n',
    ),
  );
  assert.equal(py.decision?.decision, 'deny', 'bare assert (no parens) must count as an assertion');
  const go = runHook(edit('api/handler_test.go', 'if got != 1 {\n\tt.Fatal("bad")\n}', 'if got != 1 {\n\t_ = got\n}'));
  assert.equal(go.decision?.decision, 'deny', 't.Fatal must count as an assertion');
  // Robot var ${total} held in rv: a literal "${" in a plain string trips
  // biome noTemplateCurlyInString, and a raw interpolation would not be literal
  const rv = '$' + '{total}';
  const robot = runHook(
    edit(
      'e2e/smoke.robot',
      ['Smoke', `    ${rv}=    Get Total`, `    Should Be Equal    ${rv}    100`].join('\n'),
      ['Smoke', `    ${rv}=    Get Total`].join('\n'),
    ),
  );
  assert.equal(robot.decision?.decision, 'deny', 'Robot Should Be Equal must count as an assertion');
});

test('WARN: shrinking assertions in a Python test file warns (2 -> 1), never denies', () => {
  const { decision } = runHook(
    edit(
      'tests/test_cart.py',
      'def test_cart():\n    assert a == 1\n    assert b == 2\n',
      'def test_cart():\n    assert a == 1\n',
    ),
  );
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('shrinks assertions'), decision.system_message);
});

test('SILENT: stripping a t.Error from a non-test lookalike (contest.go) stays silent', () => {
  const { decision } = runHook(edit('api/contest.go', 'if x {\n\tt.Error("bad")\n}', 'if x {\n}'));
  assert.equal(decision, null);
});

test('BLOCK is downgraded to a warning when the command carries a waiver annotation', () => {
  const { decision } = runHook(
    bash('git rm tests/deprecated.spec.ts # waiver: owner=qa until=2026-12-31 ticket=QA-101'),
  );
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('waiver'), decision.system_message);
});

/* ---------- silence: no test path, no noise ---------- */

test('SILENT: rm of a non-test path stays silent', () => {
  const { status, decision } = runHook(bash('rm src/legacy/draft.js'));
  assert.equal(status, 0);
  assert.equal(decision, null, 'everyday rm on non-test paths must not warn');
});

test('SILENT: npm run rm-artifacts does not trip the rm branch', () => {
  const { decision } = runHook(bash('npm run rm-artifacts -- --quiet'));
  assert.equal(decision, null);
});

test('SILENT: mv of two non-test files stays silent', () => {
  const { decision } = runHook(bash('mv src/utils.ts src/lib/utils.ts && npm test'));
  assert.equal(decision, null);
});

/* ---------- warn: deletion-shaped and in-place bash near misses ---------- */

test('WARN: rimraf on a test path warns, never blocks', () => {
  const { decision } = runHook(bash('rimraf __tests__/ test-results/'));
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('rimraf'), decision.system_message);
});

test('WARN: sed in-place edit of a test file warns', () => {
  const { decision } = runHook(bash("sed -i 's/x/y/' tests/app.test.ts"));
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('bypasses the file-tool gates'), decision.system_message);
});

/* ---------- deny: edits that strip every assertion from a test ---------- */

test('BLOCK: an edit that deletes the only assertion from a test file is denied', () => {
  const { status, decision } = runHook(edit('c:/repo/tests/app.test.js', 'expect(getTotal(items)).toBe(42);', ''));
  assert.equal(status, 0);
  assert.equal(decision.decision, 'deny');
  assert.ok(decision.reason.includes('assertion'), decision.reason);
  assert.ok(decision.reason.includes('waiver'), 'the deny message must teach the escape hatch');
});

test('BLOCK: replacing an assertion block with a comment (no assertion left) is denied', () => {
  const { decision } = runHook(
    edit(
      'c:/repo/e2e/checkout.spec.ts',
      "await expect(page).toHaveTitle(/Checkout/);\nexpect(await orderTotal()).toBe('$10.00');",
      '// totals checked in the order API suite',
    ),
  );
  assert.equal(decision.decision, 'deny');
});

test('BLOCK is downgraded to a warning when the edit carries a waiver annotation', () => {
  const { decision } = runHook(
    edit(
      'c:/repo/tests/app.test.js',
      'expect(getTotal(items)).toBe(42);',
      '// waiver: owner=qa until=2026-12-31 ticket=QA-404 - requirement removed',
    ),
  );
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('waiver'), decision.system_message);
});

test('WARN: an edit that shrinks (not removes) assertions warns', () => {
  const { decision } = runHook(
    edit('c:/repo/tests/app.test.js', 'expect(a).toBe(1);\nexpect(b).toBe(2);', 'expect(a + b).toBe(3);'),
  );
  assert.equal(decision.decision, 'allow');
  assert.ok(decision.system_message.includes('shrinks'), decision.system_message);
});

test('SILENT: an edit with the same assertion count in a test file stays silent', () => {
  const { decision } = runHook(edit('c:/repo/tests/app.test.js', 'expect(a).toBe(1);', 'expect(b).toBe(1);'));
  assert.equal(decision, null);
});

test('SILENT: assertion-free edits in non-test files stay silent', () => {
  const { decision } = runHook(edit('c:/repo/src/lib.ts', 'const x = compute();', ''));
  assert.equal(decision, null);
});

/* ---------- wire protocol hardening (same as test-file-guard) ---------- */

test('no stdin -> silent exit 0', () => {
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'red-test-del-guard-test-'));
  const res = spawnSync(process.execPath, [GUARD], {
    input: '',
    encoding: 'utf8',
    env: { ...process.env, PLUGIN_DATA: pluginData },
  });
  assert.equal(res.status, 0);
  assert.equal((res.stdout || '').trim(), '');
});

test('invalid JSON on stdin -> silent exit 0', () => {
  const { status, decision } = runHook(null, 'not json at all');
  assert.equal(status, 0);
  assert.equal(decision, null);
});

test('payload without tool_input -> silent exit 0', () => {
  const { status, decision } = runHook({ nope: true });
  assert.equal(status, 0);
  assert.equal(decision, null);
});

test('unexpected exception inside the guard fails open: exit 0, no denial', () => {
  // A read_file-style payload (no path/file_path, no command) must not
  // throw; anything that would throw is swallowed by the exit-0 contract.
  const { status } = runHook({ tool_input: { path: null, content: undefined } });
  assert.equal(status, 0);
});
