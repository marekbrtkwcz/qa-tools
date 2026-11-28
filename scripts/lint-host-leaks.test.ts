#!/usr/bin/env node
/**
 * Unit tests for scripts/lint-host-leaks.ts
 * Run: npm run test:p3 or node --test scripts/lint-host-leaks.test.ts
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { LEAK, EXEMPT_DIRS, EXEMPT_FILES } = require('./lint-host-leaks.ts');

test('LEAK: łapie wzorce Codex/Claude/Copilot w instrukcjach', () => {
  assert.ok(LEAK.test('(`test_planner` in Codex)'));
  assert.ok(LEAK.test('Run `/x` (`$x` in Codex).'));
  assert.ok(LEAK.test('run `/x` in Claude Code'));
  assert.ok(LEAK.test("pick **Orchestrator** in Copilot's agent dropdown"));
});

test('LEAK: nie łapie legitymizowanych treści', () => {
  assert.ok(!LEAK.test('spawn the agent with tools.agents and config_name'));
  assert.ok(!LEAK.test('in Vibe, run `/plan-explore-review-commit`'));
  assert.ok(!LEAK.test('the plugin configures it in Vibe'));
  assert.ok(!LEAK.test('project instruction files - `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`'));
});

test('exemptions: authoring bundle i running-evals.md są wyłączone z założenia', () => {
  assert.ok(EXEMPT_DIRS.has('authoring'));
  assert.ok(EXEMPT_FILES.has('running-evals.md'));
});

test('lint on the real tree: plugins/ outside authoring is clean (or reports every hit)', () => {
  const root = path.join(__dirname, '..', 'plugins');
  if (!fs.existsSync(root)) return; // build not run in this environment - nothing to scan
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (/\.(md|toml|json)$/i.test(e.name)) out.push(full);
    }
    return out;
  };
  const hits = [];
  for (const pack of fs.readdirSync(root, { withFileTypes: true })) {
    if (!pack.isDirectory() || EXEMPT_DIRS.has(pack.name)) continue;
    for (const file of walk(path.join(root, pack.name))) {
      if (EXEMPT_FILES.has(path.basename(file))) continue;
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line: string, i: number) => {
        if (LEAK.test(line)) hits.push(`${path.relative(root, file)}:${i + 1}`);
      });
    }
  }
  assert.deepEqual(hits, [], `host leaks outside authoring: ${hits.join(', ')}`);
});
