#!/usr/bin/env node
/**
 * Lint: eval case suites (evals/*.cases.jsonl) are statically valid and covered.
 *
 * The live A/B run (baseline vs candidate against a model) is an operator step
 * that CI cannot do. This lint is the static half: a suite that violates the
 * case schema, references a renamed asset, loses twin-pair coverage, or drifts
 * away from the README suite table fails CI instead of waiting for a run that
 * may never happen.
 *
 * Checks:
 *   1. Suite file name matches a bundle in bundles.yaml
 *   2. Per case: required fields, category/risk enums, non-empty criteria,
 *      kebab-case unique ids
 *   3. asset / expect_active / expect_inactive exist in the collection
 *      (bundle skills + agents - renaming an asset fails here)
 *   4. Activation hygiene: the prompt never contains the asset name -
 *      a prompt that names its own asset tests nothing about routing
 *   5. Every command+skill twin pair (from lint-command-skill-pairs) has at
 *      least one case asserting the split: expect_active on one side of the
 *      pair and expect_inactive on the other
 *   6. evals/README.md "Suites" table: per-suite case counts match reality
 *
 * Usage: node scripts/lint-eval-suites.ts (wired into npm run check)
 */

interface BundleConfig {
  skills?: string[];
  agents?: string[];
  knowledge?: string[];
}

type Bundles = Record<string, BundleConfig>;

interface EvalCase {
  id: string;
  category: string;
  risk: string;
  asset: string;
  prompt: string;
  turns?: string[];
  criteria: string[];
  must_not?: string[];
  expect_active?: string;
  expect_inactive?: string[];
  context?: Record<string, string>;
  notes?: string;
}

interface TwinPairRef {
  command: string;
  skill: string;
  bundle: string;
}

const CATEGORIES = [
  'activation-positive',
  'activation-negative',
  'collision',
  'contract',
  'behavioural',
  'safety',
  'persistence',
];

const RISKS = ['low', 'medium', 'high'];

function isKebabCase(id: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function collectAssetNames(bundles: Bundles): Set<string> {
  const names = new Set<string>();
  for (const config of Object.values(bundles)) {
    for (const skill of config.skills ?? []) names.add(skill);
    for (const agent of config.agents ?? []) names.add(agent);
  }
  return names;
}

function validateCase(obj: Record<string, unknown>, suite: string): string[] {
  const issues: string[] = [];
  const id = typeof obj.id === 'string' ? obj.id : '';
  const where = ` [${suite}] ${id || '(missing id)'}`;

  if (!id) issues.push(`  ❌${where}: missing id`);
  else if (!isKebabCase(id)) issues.push(`  ❌${where}: id must be kebab-case`);

  if (typeof obj.category !== 'string' || !CATEGORIES.includes(obj.category)) {
    issues.push(`  ❌${where}: category must be one of ${CATEGORIES.join(', ')}`);
  }
  if (typeof obj.risk !== 'string' || !RISKS.includes(obj.risk)) {
    issues.push(`  ❌${where}: risk must be one of ${RISKS.join(', ')}`);
  }
  if (typeof obj.asset !== 'string' || obj.asset === '') {
    issues.push(`  ❌${where}: missing asset`);
  }
  if (typeof obj.prompt !== 'string' || obj.prompt.trim() === '') {
    issues.push(`  ❌${where}: missing prompt`);
  }
  if (!isStringArray(obj.criteria) || obj.criteria.length === 0) {
    issues.push(`  ❌${where}: criteria must be a non-empty array of strings`);
  }
  if (obj.must_not !== undefined && !isStringArray(obj.must_not)) {
    issues.push(`  ❌${where}: must_not must be an array of strings`);
  }
  if (obj.turns !== undefined && !isStringArray(obj.turns)) {
    issues.push(`  ❌${where}: turns must be an array of strings`);
  }
  if (obj.expect_active !== undefined && typeof obj.expect_active !== 'string') {
    issues.push(`  ❌${where}: expect_active must be a string`);
  }
  if (obj.expect_inactive !== undefined && !isStringArray(obj.expect_inactive)) {
    issues.push(`  ❌${where}: expect_inactive must be an array of strings`);
  }

  if (
    typeof obj.prompt === 'string' &&
    typeof obj.asset === 'string' &&
    obj.asset !== '' &&
    obj.prompt.toLowerCase().includes(obj.asset.toLowerCase())
  ) {
    issues.push(`  ❌${where}: prompt contains the asset name - activation hygiene (see case-file-schema.md)`);
  }

  if ((obj.category === 'activation-positive' || obj.category === 'collision') && obj.expect_active === undefined) {
    issues.push(`  ❌${where}: ${obj.category} case without expect_active - the routing assertion is the point`);
  }

  return issues;
}

function checkAssetReferences(obj: Record<string, unknown>, suite: string, assets: Set<string>): string[] {
  const issues: string[] = [];
  const id = typeof obj.id === 'string' ? obj.id : '(?)';

  if (typeof obj.asset === 'string' && !assets.has(obj.asset)) {
    issues.push(`  ❌ [${suite}] ${id}: asset '${obj.asset}' does not exist in the collection`);
  }
  if (typeof obj.expect_active === 'string' && !assets.has(obj.expect_active)) {
    issues.push(`  ❌ [${suite}] ${id}: expect_active '${obj.expect_active}' does not exist in the collection`);
  }
  if (Array.isArray(obj.expect_inactive)) {
    for (const name of obj.expect_inactive) {
      if (typeof name === 'string' && !assets.has(name)) {
        issues.push(`  ❌ [${suite}] ${id}: expect_inactive '${name}' does not exist in the collection`);
      }
    }
  }

  return issues;
}

function checkTwinCoverage(pairs: TwinPairRef[], cases: EvalCase[]): string[] {
  const issues: string[] = [];
  for (const pair of pairs) {
    const covered = cases.some(
      (c) =>
        (c.expect_active === pair.skill && (c.expect_inactive ?? []).includes(pair.command)) ||
        (c.expect_active === pair.command && (c.expect_inactive ?? []).includes(pair.skill)),
    );
    if (!covered) {
      issues.push(
        `  ❌ twin pair ${pair.command} <-> ${pair.skill} [${pair.bundle}]: no case asserts the split - add a collision case with the pair in expect_active vs expect_inactive`,
      );
    }
  }
  return issues;
}

function parseReadmeSuiteTable(content: string): Map<string, number> {
  const rows = new Map<string, number>();
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|\s*(\d+)\s*\|/);
    const suite = match?.[1] ?? '';
    if (suite !== '') rows.set(suite, Number(match?.[2] ?? '0'));
  }
  return rows;
}

function checkReadmeCounts(table: Map<string, number>, actual: Map<string, number>): string[] {
  const issues: string[] = [];
  for (const [suite, count] of actual) {
    const documented = table.get(suite);
    if (documented === undefined) {
      issues.push(`  ❌ suite '${suite}' (${count} cases) has no row in evals/README.md "Suites" table`);
    } else if (documented !== count) {
      issues.push(`  ❌ README says suite '${suite}' has ${documented} cases, the file has ${count}`);
    }
  }
  for (const suite of table.keys()) {
    if (!actual.has(suite)) {
      issues.push(`  ❌ README lists suite '${suite}' but evals/${suite}.cases.jsonl does not exist`);
    }
  }
  return issues;
}

const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('yaml');
const { findTwinPairs, isCommandSkill } = require('./lint-command-skill-pairs.ts');

const ROOT = path.resolve(__dirname, '..');
const EVALS_DIR = path.join(ROOT, 'evals');
const BUNDLES_PATH = path.join(ROOT, 'bundles.yaml');
const README_PATH = path.join(EVALS_DIR, 'README.md');

function main() {
  const bundles = parse(fs.readFileSync(BUNDLES_PATH, 'utf-8')) as Bundles;
  const assets = collectAssetNames(bundles);
  const suites = new Map<string, EvalCase[]>();
  const issues: string[] = [];
  let totalCases = 0;

  const files = fs.readdirSync(EVALS_DIR).filter((f: string) => f.endsWith('.cases.jsonl'));
  for (const file of files) {
    const suite = file.replace('.cases.jsonl', '');
    if (!(suite in bundles)) {
      issues.push(`  ❌ suite file ${file}: no bundle named '${suite}' in bundles.yaml`);
    }

    const seen = new Set<string>();
    const cases: EvalCase[] = [];
    const rawLines = fs.readFileSync(path.join(EVALS_DIR, file), 'utf-8').trim().split(/\r?\n/);
    rawLines.forEach((line: string, i: number) => {
      let obj: Record<string, unknown>;
      try {
        obj = JSON.parse(line) as Record<string, unknown>;
      } catch (e) {
        issues.push(`  ❌ [${suite}] line ${i + 1}: invalid JSON (${e instanceof Error ? e.message : String(e)})`);
        return;
      }
      const shapeIssues = validateCase(obj, suite);
      issues.push(...shapeIssues);
      const id = typeof obj.id === 'string' ? obj.id : '';
      if (id !== '') {
        if (seen.has(id)) issues.push(`  ❌ [${suite}] ${id}: duplicate id in suite`);
        else seen.add(id);
      }
      issues.push(...checkAssetReferences(obj, suite, assets));
      if (shapeIssues.length === 0) cases.push(obj as unknown as EvalCase);
    });
    suites.set(suite, cases);
    totalCases += cases.length;
  }

  const pairs = findTwinPairs(bundles, isCommandSkill);
  const allCases = [...suites.values()].flat();
  issues.push(...checkTwinCoverage(pairs, allCases));
  const counts = new Map<string, number>([...suites].map(([suite, cases]) => [suite, cases.length]));
  issues.push(...checkReadmeCounts(parseReadmeSuiteTable(fs.readFileSync(README_PATH, 'utf-8')), counts));

  if (issues.length > 0) {
    console.error(`❌ Eval suites: ${issues.length} issue(s)\n`);
    for (const issue of issues) {
      console.error(issue);
    }
    process.exit(1);
  }

  console.log(`🧪 Eval suites: ${suites.size} suites, ${totalCases} cases`);
  for (const [suite, cases] of suites) {
    console.log(`  ✅ ${suite}: ${cases.length} cases`);
  }
  console.log(`  ✅ all assets referenced in cases exist in bundles.yaml`);
  console.log(`  ✅ twin pair split coverage: ${pairs.length}/${pairs.length}`);
  console.log('  ✅ README "Suites" table counts match the case files');
}

if (require.main === module) {
  main();
}

module.exports = {
  CATEGORIES,
  RISKS,
  collectAssetNames,
  validateCase,
  checkAssetReferences,
  checkTwinCoverage,
  parseReadmeSuiteTable,
  checkReadmeCounts,
};
