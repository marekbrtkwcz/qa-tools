#!/usr/bin/env node
/**
 * lint-nft-pack.js — structural lint for the non-functional-testing bundle.
 *
 * Two invariants are checked statically:
 *
 * 1. testing-application-security must keep its authorization gate
 *    (Phase 0 before any probing). The behavioural half lives in
 *    evals/non-functional-testing.cases.jsonl (safety-security-no-authorization).
 * 2. The three overlapping web-a11y skills (auditing-accessibility,
 *    a11y-audit-deep-dive, a11y-webpage-audit) must cross-reference each
 *    other in their descriptions, so activation cannot collide.
 *
 * Usage: node scripts/lint-nft-pack.js
 * Exit 0 = pass, 1 = violations. Runs via scripts/lint-all-packs.js.
 */
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_DIR = path.join(__dirname, '..', 'src', 'skills');

const violations = [];

function descriptionOf(name) {
  const file = path.join(SKILLS_DIR, name, 'SKILL.md');
  if (!fs.existsSync(file)) {
    violations.push(`${name}: SKILL.md not found`);
    return '';
  }
  const text = fs.readFileSync(file, 'utf8');
  return (text.match(/^description:\s*(.+)$/m) || [])[1] || '';
}

// 1. security authorization gate
const sec = fs.existsSync(path.join(SKILLS_DIR, 'testing-application-security', 'SKILL.md'))
  ? fs.readFileSync(path.join(SKILLS_DIR, 'testing-application-security', 'SKILL.md'), 'utf8').toLowerCase()
  : '';
if (sec && !/authorization gate/.test(sec)) {
  violations.push('testing-application-security: no "authorization gate" — probing without authorization is not blocked statically');
}
if (sec && !/not authorized to test/.test(sec)) {
  violations.push('testing-application-security: missing the "not authorized to test" refusal statement');
}

// 2. a11y trio cross-links
const A11Y = {
  'auditing-accessibility': ['a11y-webpage-audit', 'a11y-audit-deep-dive'],
  'a11y-audit-deep-dive': ['a11y-webpage-audit', 'auditing-accessibility'],
  'a11y-webpage-audit': ['a11y-audit-deep-dive', 'auditing-accessibility'],
};
for (const [skill, refs] of Object.entries(A11Y)) {
  const desc = descriptionOf(skill);
  for (const ref of refs) {
    if (desc && !desc.includes(ref)) {
      violations.push(`${skill}: description does not name ${ref} — web a11y activation collision risk`);
    }
  }
}

if (violations.length) {
  console.error('⛔ non-functional-testing lint FAILED:');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log(
  '✅ non-functional-testing lint: security skill keeps the authorization gate; 3 web a11y skills cross-linked',
);
