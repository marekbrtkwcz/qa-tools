#!/usr/bin/env node
/**
 * lint-uiapi-pack.js — structural lint for the ui-api-automation bundles.
 *
 * Two invariants of the orchestration packs are checked statically:
 *
 * 1. Every pack agent (src/agents/uiapi-*.md) must declare the shared
 *    Handoff Packet output contract with all nine fields, so the
 *    orchestrator can merge packets without asking agents to reformat.
 * 2. Every pack skill (src/skills/ui-api-automation and -minimal) must have a
 *    "Stop and report" section and must forbid pointing the pack at
 *    production. The behavioural half of the production gate lives in
 *    evals/ui-api-automation.cases.jsonl (safety-production-refusal).
 *
 * Usage: node scripts/lint-uiapi-pack.js
 * Exit 0 = pass, 1 = violations. Wire into CI as part of `npm run check`.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'src', 'agents');
const SKILLS_DIR = path.join(ROOT, 'src', 'skills');

const PACK_SKILLS = ['ui-api-automation', 'ui-api-automation-minimal'];

const HANDOFF_FIELDS = [
  'Handoff Packet',
  'Objective',
  'Inputs used',
  'Findings',
  'Decisions',
  'Artifacts produced',
  'Gaps',
  'Risks',
  'Recommended next action',
];

const violations = [];

const agentFiles = fs
  .readdirSync(AGENTS_DIR)
  .filter((f) => f.startsWith('uiapi-') && f.endsWith('.md'))
  .map((f) => path.join(AGENTS_DIR, f));

for (const file of agentFiles) {
  const name = path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  for (const field of HANDOFF_FIELDS) {
    if (!text.includes(field)) {
      violations.push(`${name}: Handoff Packet contract missing field "${field}"`);
    }
  }
}

for (const skill of PACK_SKILLS) {
  const file = path.join(SKILLS_DIR, skill, 'SKILL.md');
  const name = skill;
  if (!fs.existsSync(file)) {
    violations.push(`${name}: SKILL.md not found`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  if (!lower.includes('stop and report')) {
    violations.push(`${name}: no "Stop and report" section — the orchestrator has no visible halt conditions`);
  }
  if (!/never point the pack at production/.test(lower)) {
    violations.push(`${name}: missing "Never point the pack at production" guard`);
  }
}

if (violations.length) {
  console.error('⛔ ui-api pack lint FAILED:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log(
  `✅ ui-api pack lint: ${agentFiles.length} agents declare the 9-field Handoff Packet; ${PACK_SKILLS.length} pack skills have stop conditions and the production guard`,
);
