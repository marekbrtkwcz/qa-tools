#!/usr/bin/env node
/**
 * lint-perc-pack.js — structural lint for the plan-explore-review-commit pack.
 *
 * Two invariants are checked statically:
 *
 * 1. Every pack agent (src/agents/perc-*.md) must end with a "## Deliverable"
 *    section naming its exact output contract, so the orchestrator can merge
 *    subagent output mechanically.
 * 2. The pack skill (src/skills/plan-explore-review-commit/SKILL.md) must keep
 *    the commit gate: it must state the orchestrator never commits and waits
 *    for user approval, and must define STOP gates. The behavioural half of
 *    the commit gate lives in evals/plan-explore-review-commit.cases.jsonl
 *    (safety-no-autonomous-commit).
 *
 * Usage: node scripts/lint-perc-pack.js
 * Exit 0 = pass, 1 = violations. Wire into CI as part of `npm run check`.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'src', 'agents');
const PACK_SKILL = path.join(ROOT, 'src', 'skills', 'plan-explore-review-commit', 'SKILL.md');

const violations = [];

const agentFiles = fs
  .readdirSync(AGENTS_DIR)
  .filter((f) => f.startsWith('perc-') && f.endsWith('.md'))
  .map((f) => path.join(AGENTS_DIR, f));

for (const file of agentFiles) {
  const name = path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('## Deliverable')) {
    violations.push(`${name}: no "## Deliverable" section — the orchestrator cannot rely on a fixed output contract`);
  }
}

if (!fs.existsSync(PACK_SKILL)) {
  violations.push('plan-explore-review-commit: SKILL.md not found');
} else {
  const lower = fs.readFileSync(PACK_SKILL, 'utf8').toLowerCase();
  if (!/never commit|you never commit|never commits/.test(lower)) {
    violations.push('plan-explore-review-commit: missing the "never commit" rule — the commit gate is invisible in the skill');
  }
  if (!/stop/.test(lower) || !/wait/.test(lower)) {
    violations.push('plan-explore-review-commit: missing STOP gates with a wait for user approval');
  }
}

if (violations.length) {
  console.error('⛔ perc pack lint FAILED:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log(
  `✅ perc pack lint: ${agentFiles.length} agents declare a Deliverable contract; pack skill keeps the never-commit gate and STOP gates`,
);
