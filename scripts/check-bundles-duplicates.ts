#!/usr/bin/env node
/**
 * Duplicates detection gate for bundles.yaml:
 *   1. No skill/agent/knowledge/hook name appears in more than one bundle
 *   2. No duplicates within a single bundle
 *   3. Warn on similar names (Levenshtein distance < 3)
 *
 * Exit codes: 0 = ok, 1 = errors found, 2 = usage error.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BUNDLES_FILE = path.join(ROOT, 'bundles.yaml');

interface BundleLists {
  skills: string[];
  agents: string[];
  knowledge: string[];
  hooks: string[];
}

type Bundles = Record<string, BundleLists>;

type ListType = keyof BundleLists;

/** Simple Levenshtein distance for similarity detection */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Wiersz po wierszu (rolling row): previous[j] = edit distance dla
  // b.slice(0, i-1) vs a.slice(0, j), current[j] = dla b.slice(0, i)
  let previous = Array.from({ length: a.length + 1 }, (_, j) => j);
  for (let i = 1; i <= b.length; i++) {
    const current = new Array<number>(a.length + 1).fill(0);
    current[0] = i;
    for (let j = 1; j <= a.length; j++) {
      const substitutionCost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      const substitution = (previous[j - 1] ?? 0) + substitutionCost;
      const insertion = (current[j - 1] ?? 0) + 1;
      const deletion = (previous[j] ?? 0) + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    previous = current;
  }
  return previous[a.length] ?? 0;
}

const LIST_TYPES: string[] = ['skills', 'agents', 'knowledge', 'hooks'];

/** Parse bundles.yaml */
function parseBundles(file: string): Bundles {
  const content = fs.readFileSync(file, 'utf8');
  const bundles: Bundles = {};
  const lines = content.split(/\r?\n/);
  let currentBundle: BundleLists | null = null;
  let currentList: ListType | null = null;

  for (const line of lines) {
    // Bundle name
    const bundleMatch = line.match(/^(\w[\w-]*):\s*$/);
    const bundleName = bundleMatch?.[1];
    if (bundleName) {
      currentBundle = { skills: [], agents: [], knowledge: [], hooks: [] };
      bundles[bundleName] = currentBundle;
      currentList = null;
      continue;
    }
    if (!currentBundle) continue;

    // List type (skills, agents, knowledge, hooks)
    const listMatch = line.match(/^\s+(\w+):\s*$/);
    if (listMatch) {
      const listType = listMatch[1];
      if (listType && LIST_TYPES.includes(listType)) {
        currentList = listType as ListType;
        currentBundle[currentList] = [];
      }
      continue;
    }

    // List items
    if (currentList && line.match(/^\s+-\s/)) {
      const item = line.trim().replace(/^-\s*/, '');
      currentBundle[currentList].push(item);
    }
  }
  return bundles;
}

/** Check for duplicates across all bundles */
function checkDuplicates(bundles: Bundles): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allItems: Record<ListType, Record<string, string>> = {
    skills: {},
    agents: {},
    knowledge: {},
    hooks: {},
  };

  // Collect all items
  for (const [bundleName, bundle] of Object.entries(bundles)) {
    for (const type of Object.keys(allItems) as ListType[]) {
      for (const item of bundle[type] || []) {
        if (allItems[type][item]) {
          errors.push(`Duplicate ${type}: "${item}" in bundle "${allItems[type][item]}" and "${bundleName}"`);
        } else {
          allItems[type][item] = bundleName;
        }
      }
    }
  }

  // Check for duplicates within a single bundle
  for (const [bundleName, bundle] of Object.entries(bundles)) {
    for (const [type, items] of Object.entries(bundle) as [ListType, string[]][]) {
      const seen = new Set<string>();
      for (const item of items) {
        if (seen.has(item)) {
          errors.push(`Duplicate ${type} within bundle "${bundleName}": "${item}"`);
        } else {
          seen.add(item);
        }
      }
    }
  }

  // Check for similar names (Levenshtein distance < 3)
  for (const [type, itemsMap] of Object.entries(allItems) as [ListType, Record<string, string>][]) {
    const items = Object.keys(itemsMap);
    for (let i = 0; i < items.length; i++) {
      const first = items[i];
      if (first === undefined) continue;
      for (let j = i + 1; j < items.length; j++) {
        const second = items[j];
        if (second === undefined) continue;
        const distance = levenshteinDistance(first, second);
        if (distance < 3) {
          warnings.push(`Similar ${type} names: "${first}" and "${second}" (distance: ${distance})`);
        }
      }
    }
  }

  return { errors, warnings };
}

/** Main function */
function main() {
  const args = process.argv.slice(2);
  const bundlesFlag = args.indexOf('--bundles');
  const warnFlag = args.indexOf('--warnings');

  const bundlesArg = bundlesFlag >= 0 ? args[bundlesFlag + 1] : undefined;
  const bundlesFile = bundlesArg !== undefined ? path.resolve(bundlesArg) : BUNDLES_FILE;
  const showWarnings = warnFlag >= 0;

  try {
    const bundles = parseBundles(bundlesFile);
    const { errors, warnings } = checkDuplicates(bundles);

    if (errors.length > 0) {
      console.error('❌ Duplicates found in bundles.yaml:');
      for (const error of errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }

    if (showWarnings && warnings.length > 0) {
      console.warn('⚠️  Similar names detected (may indicate typos):');
      for (const warning of warnings) {
        console.warn(`  - ${warning}`);
      }
    }

    console.log('✅ No duplicates found in bundles.yaml.');
    process.exit(0);
  } catch (e) {
    console.error(`ERROR: ${(e as Error).message}`);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDuplicates, parseBundles, levenshteinDistance };
