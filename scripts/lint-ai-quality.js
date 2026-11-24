#!/usr/bin/env node
/**
 * lint-ai-quality.js — structural lint for the ai-quality bundle.
 *
 * Two invariants are checked statically:
 *
 * 1. testing-llm-guardrails must keep its adversarial authorization gate:
 *    adversarial testing is security testing and requires written
 *    confirmation before a single case runs. The behavioural half lives in
 *    evals/ai-quality.cases.jsonl (safety-adversarial-no-authorization).
 * 2. The guardrails skill pair (test-llm-guardrails /
 *    testing-llm-guardrails) must cross-reference each other in their
 *    descriptions, so activation cannot collide.
 *
 * Usage: node scripts/lint-ai-quality.js
 * Exit 0 = pass, 1 = violations. Runs via scripts/lint-all-packs.js.
 */
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_DIR = path.join(__dirname, '..', 'src', 'skills');

const violations = [];

function readSkill(name) {
  const file = path.join(SKILLS_DIR, name, 'SKILL.md');
  if (!fs.existsSync(file)) {
    violations.push(`${name}: SKILL.md not found`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

// 1. adversarial gate with written authorization
const guard = readSkill('testing-llm-guardrails').toLowerCase();
if (guard && !/adversarial/.test(guard)) {
  violations.push('testing-llm-guardrails: no adversarial suite — injection/jailbreak resistance is untested');
}
if (guard && !/in writing/.test(guard)) {
  violations.push('testing-llm-guardrails: adversarial testing without the written-authorization requirement — the safety gate is invisible');
}

// 2. guardrails pair cross-links
const PAIR = ['test-llm-guardrails', 'testing-llm-guardrails'];
for (const skill of PAIR) {
  const desc = (readSkill(skill).match(/^description:\s*(.+)$/m) || [])[1] || '';
  const other = PAIR.find((s) => s !== skill);
  if (desc && other && !desc.includes(other)) {
    violations.push(`${skill}: description does not name ${other} — guardrails activation collision risk`);
  }
}

if (violations.length) {
  console.error('⛔ ai-quality lint FAILED:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log(
  '✅ ai-quality lint: guardrails skill keeps the adversarial written-authorization gate; guardrails pair cross-linked',
);
