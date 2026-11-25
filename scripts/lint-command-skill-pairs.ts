#!/usr/bin/env node
/**
 * Lint: command+skill twin pairs must reference each other in their descriptions.
 *
 * A "twin pair" is a command (disable-model-invocation: true) whose name differs
 * from a model-invocable skill in the SAME bundle by exactly one word, where that
 * word is the gerund form (stabilize -> stabilizing, record -> recording,
 * verify -> verifying, migrate -> migrating). These pairs compete for the same
 * trigger, so each description must name the other - the house pattern introduced
 * by derive-quality-contract <-> deriving-a-quality-contract. A twin pair without
 * the mutual reference is two assets answering one request.
 *
 * Usage: node scripts/lint-command-skill-pairs.ts (wired into npm run check)
 */

interface TwinPair {
  command: string;
  skill: string;
  bundle: string;
}

interface BundleConfig {
  skills?: string[];
}

type Bundles = Record<string, BundleConfig>;

function isGerund(infinitive: string, gerund: string): boolean {
  // record -> recording, stabilize -> stabilizing, verify -> verifying
  if (gerund === `${infinitive}ing`) return true;
  if (infinitive.endsWith('e') && gerund === `${infinitive.slice(0, -1)}ing`) return true;
  if (infinitive.endsWith('y') && gerund === `${infinitive.slice(0, -1)}ying`) return true;
  return false;
}

function areTwinNames(command: string, skill: string): boolean {
  const c = command.split('-');
  const s = skill.split('-');
  if (c.length !== s.length) return false;
  let diffIndex = -1;
  for (let i = 0; i < c.length; i++) {
    if (c[i] === s[i]) continue;
    if (diffIndex >= 0) return false; // more than one differing word
    if (!isGerund(c[i] || '', s[i] || '')) return false;
    diffIndex = i;
  }
  return diffIndex >= 0;
}

function findTwinPairs(bundles: Bundles, isCommand: (skill: string) => boolean): TwinPair[] {
  const pairs: TwinPair[] = [];
  for (const [bundle, config] of Object.entries(bundles)) {
    const skills = config.skills || [];
    const commands = skills.filter((s) => isCommand(s));
    const modelSkills = skills.filter((s) => !isCommand(s));
    for (const command of commands) {
      for (const skill of modelSkills) {
        if (areTwinNames(command, skill)) {
          pairs.push({ command, skill, bundle });
        }
      }
    }
  }
  return pairs;
}

function checkMutualRefs(pairs: TwinPair[], getDescription: (skill: string) => string): string[] {
  const issues: string[] = [];
  for (const pair of pairs) {
    const commandDesc = getDescription(pair.command);
    const skillDesc = getDescription(pair.skill);
    if (!commandDesc.includes(pair.skill)) {
      issues.push(`  ❌ [${pair.bundle}] command ${pair.command}: description does not mention ${pair.skill}`);
    }
    if (!skillDesc.includes(pair.command)) {
      issues.push(`  ❌ [${pair.bundle}] skill ${pair.skill}: description does not mention ${pair.command}`);
    }
  }
  return issues;
}

const fs = require('node:fs');
const path = require('node:path');
const { parseBundles } = require('./check-bundles-duplicates.ts');

const ROOT = path.resolve(__dirname, '..');
const BUNDLES_PATH = path.join(ROOT, 'bundles.yaml');
const SKILLS_DIR = path.join(ROOT, 'src', 'skills');

function readFrontmatter(skillName: string): string {
  const file = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  const content = fs.readFileSync(file, 'utf-8');
  const frontmatter = content.match(/^---[\s\S]*?---/);
  return frontmatter ? frontmatter[0] : '';
}

function isCommandSkill(skillName: string): boolean {
  return readFrontmatter(skillName).includes('disable-model-invocation: true');
}

function readDescription(skillName: string): string {
  const match = readFrontmatter(skillName).match(/^description:\s*(.+)$/m);
  return match?.[1]?.trim() ?? '';
}

function main() {
  const bundles = parseBundles(BUNDLES_PATH) as Bundles;
  const pairs = findTwinPairs(bundles, isCommandSkill);

  console.log(`🧪 Lint command+skill twin pairs: ${pairs.length} pair(s) found`);
  const issues = checkMutualRefs(pairs, readDescription);

  if (issues.length > 0) {
    console.error('\n❌ Twin pairs without mutual description references:\n');
    for (const issue of issues) {
      console.error(issue);
    }
    console.error('\nFix: add one disambiguation sentence to BOTH descriptions, e.g.');
    console.error('  command: "For the full workflow, use the <skill> skill; this is its quick form."');
    console.error('  skill:   "For the quick one-command form, use the <command> command."');
    process.exit(1);
  }

  for (const pair of pairs) {
    console.log(`  ✅ ${pair.command} <-> ${pair.skill} [${pair.bundle}]`);
  }
  console.log('✅ All twin pairs reference each other in descriptions.');
}

if (require.main === module) {
  main();
}

module.exports = { isGerund, areTwinNames, findTwinPairs, checkMutualRefs, isCommandSkill };
