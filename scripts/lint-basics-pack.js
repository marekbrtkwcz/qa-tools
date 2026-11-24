#!/usr/bin/env node
/**
 * lint-basics-pack.js — structural lint for the orchestration-basics pack.
 *
 * Two invariants are checked statically:
 *
 * 1. Every pack agent (src/agents/basics-*.md) must declare a "## Deliverable"
 *    output contract, so the orchestrator can merge subagent output
 *    mechanically.
 * 2. The pack skill (src/skills/orchestration-basics/SKILL.md) must keep its
 *    two boundaries: explicit STOP gates with user approval, and the
 *    "does not implement code" rule. The behavioural half of the no-code
 *    boundary lives in evals/orchestration-basics.cases.jsonl
 *    (safety-no-implementation).
 *
 * Usage: node scripts/lint-basics-pack.js
 * Exit 0 = pass, 1 = violations. Runs via scripts/lint-all-packs.js.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'src', 'agents');
const PACK_SKILL = path.join(ROOT, 'src', 'skills', 'orchestration-basics', 'SKILL.md');

const violations = [];

const agentFiles = fs
  .readdirSync(AGENTS_DIR)
  .filter((f) => f.startsWith('basics-') && f.endsWith('.md'))
  .map((f) => path.join(AGENTS_DIR, f));

for (const file of agentFiles) {
  const name = path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('## Deliverable')) {
    violations.push(`${name}: no "## Deliverable" section — the orchestrator cannot rely on a fixed output contract`);
  }
}

if (!fs.existsSync(PACK_SKILL)) {
  violations.push('orchestration-basics: SKILL.md not found');
} else {
  const lower = fs.readFileSync(PACK_SKILL, 'utf8').toLowerCase();
  if (!/stop gate/.test(lower) || !/wait/.test(lower)) {
    violations.push('orchestration-basics: missing STOP gates with a wait for user approval');
  }
  if (!/does not implement code|never implement|do not implement/.test(lower)) {
    violations.push('orchestration-basics: missing the "does not implement code" boundary');
  }
}

if (violations.length) {
  console.error('⛔ basics pack lint FAILED:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log(
  `✅ basics pack lint: ${agentFiles.length} agents declare a Deliverable contract; pack skill keeps STOP gates and the no-code boundary`,
);
