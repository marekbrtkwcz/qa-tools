#!/usr/bin/env node
/**
 * lint-all-packs.js — runs every structural pack lint in one command.
 *
 * Wraps the per-bundle lints so package.json check/lint stay readable as
 * the collection grows:
 *   - lint-pentest-charter.js   (pentesting: no charter, no testing)
 *   - lint-uiapi-pack.js        (ui-api packs: Handoff Packet + prod guard)
 *   - lint-perc-pack.js         (plan-explore-review-commit: Deliverable + commit gate)
 *   - lint-quality-gates.js     (quality-gates: NO-GO, waiver expiry/owner, pair links)
 *   - lint-basics-pack.js       (orchestration-basics: Deliverable + STOP gates + no-code boundary)
 *
 * Usage: node scripts/lint-all-packs.js
 * Exit 0 = all pass, 1 = first failing lint stops the run (its own output
 * names the violations).
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const LINTS = [
  'lint-pentest-charter.js',
  'lint-uiapi-pack.js',
  'lint-perc-pack.js',
  'lint-quality-gates.js',
  'lint-basics-pack.js',
];

for (const lint of LINTS) {
  const res = spawnSync(process.execPath, [path.join(__dirname, lint)], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`⛔ ${lint} failed — fix the violations above.`);
    process.exit(res.status || 1);
  }
}
console.log(`✅ all ${LINTS.length} pack lints passed`);
