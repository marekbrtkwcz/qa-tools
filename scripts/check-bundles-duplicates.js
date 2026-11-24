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

/** Simple Levenshtein distance for similarity detection */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[b.length][a.length];
}

/** Parse bundles.yaml */
function parseBundles(file) {
  const content = fs.readFileSync(file, 'utf8');
  const bundles = {};
  const lines = content.split(/\r?\n/);
  let currentBundle = null;
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bundle name
    const bundleMatch = line.match(/^(\w[\w-]*):\s*$/);
    if (bundleMatch) {
      currentBundle = bundleMatch[1];
      bundles[currentBundle] = { skills: [], agents: [], knowledge: [], hooks: [] };
      currentList = null;
      continue;
    }

    if (!currentBundle) continue;

    // List type (skills, agents, knowledge, hooks)
    const listMatch = line.match(/^\s+(\w+):\s*$/);
    if (listMatch) {
      const listType = listMatch[1];
      if (['skills', 'agents', 'knowledge', 'hooks'].includes(listType)) {
        currentList = listType;
        bundles[currentBundle][listType] = [];
      }
      continue;
    }

    // List items
    if (currentList && line.match(/^\s+-\s/)) {
      const item = line.trim().replace(/^-\s*/, '');
      bundles[currentBundle][currentList].push(item);
    }
  }
  return bundles;
}

/** Check for duplicates across all bundles */
function checkDuplicates(bundles) {
  const errors = [];
  const warnings = [];

  const allItems = {
    skills: {},
    agents: {},
    knowledge: {},
    hooks: {},
  };

  // Collect all items
  for (const [bundleName, bundle] of Object.entries(bundles)) {
    for (const type of Object.keys(allItems)) {
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
    for (const [type, items] of Object.entries(bundle)) {
      const seen = new Set();
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
  for (const [type, itemsMap] of Object.entries(allItems)) {
    const items = Object.keys(itemsMap);
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const distance = levenshteinDistance(items[i], items[j]);
        if (distance < 3) {
          warnings.push(`Similar ${type} names: "${items[i]}" and "${items[j]}" (distance: ${distance})`);
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

  const bundlesFile = bundlesFlag >= 0 ? path.resolve(args[bundlesFlag + 1]) : BUNDLES_FILE;
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
    console.error(`ERROR: ${e.message}`);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDuplicates, parseBundles, levenshteinDistance };
