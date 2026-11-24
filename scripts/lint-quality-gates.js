#!/usr/bin/env node
/**
 * lint-quality-gates.js — structural lint for the quality-gates bundle.
 *
 * Three invariants are checked statically:
 *
 * 1. assessing-release-readiness must keep its NO-GO conditions: a go
 *    recommendation is only valid with no expired waivers and no open
 *    blocking findings. The behavioural half lives in
 *    evals/quality-gates.cases.jsonl (safety-release-no-go-with-expired-waiver).
 * 2. governing-quality-waivers must require an expiry date and an owner on
 *    every waiver, so silent skips cannot accumulate forever.
 * 3. The three one-command/full skill pairs must cross-reference each other
 *    in their descriptions, so activation cannot collide between them.
 *
 * Usage: node scripts/lint-quality-gates.js
 * Exit 0 = pass, 1 = violations. Wire into CI as part of `npm run check`.
 */
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_DIR = path.join(__dirname, '..', 'src', 'skills');

const violations = [];

function skillText(name) {
  const file = path.join(SKILLS_DIR, name, 'SKILL.md');
  if (!fs.existsSync(file)) {
    violations.push(`${name}: SKILL.md not found`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

// 1. release readiness keeps the NO-GO gate
const rr = skillText('assessing-release-readiness').toLowerCase();
if (rr && !/(no-go|blocking|do not ship|not ready)/.test(rr)) {
  violations.push('assessing-release-readiness: no NO-GO / blocking condition — a go could be recommended over open blockers');
}
if (rr && !/expired/.test(rr)) {
  violations.push('assessing-release-readiness: does not check for expired waivers before recommending go');
}

// 2. waivers require expiry and owner
const gw = skillText('governing-quality-waivers').toLowerCase();
if (gw && !/expir/.test(gw)) {
  violations.push('governing-quality-waivers: no expiry requirement — waivers could live forever');
}
if (gw && !/owner/.test(gw)) {
  violations.push('governing-quality-waivers: no owner requirement — nobody is accountable for the skip');
}

// 3. one-command/full pairs cross-reference each other
const PAIRS = [
  ['derive-quality-contract', 'deriving-a-quality-contract'],
  ['record-change-intent', 'recording-change-intent'],
  ['scope-change-gate', 'scoping-change-relevance'],
];
for (const [short, long] of PAIRS) {
  const shortDesc = (skillText(short).match(/^description:\s*(.+)$/m) || [])[1] || '';
  const longDesc = (skillText(long).match(/^description:\s*(.+)$/m) || [])[1] || '';
  if (short && long) {
    if (!shortDesc.includes(long)) {
      violations.push(`${short}: description does not name its full-form sibling ${long} — activation collision risk`);
    }
    if (!longDesc.includes(short)) {
      violations.push(`${long}: description does not name its one-command form ${short} — activation collision risk`);
    }
  }
}

if (violations.length) {
  console.error('⛔ quality-gates lint FAILED:');
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log(
  '✅ quality-gates lint: release-readiness keeps NO-GO + expired-waiver check; waivers require expiry and owner; 3 skill pairs cross-linked',
);
