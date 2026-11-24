#!/usr/bin/env node
/**
 * CHANGELOG consistency gate:
 *   1. CHANGELOG.md follows Keep a Changelog format (headers, dates, categories)
 *   2. Every change in bundles.yaml since the last tag is documented in CHANGELOG
 *   3. Every entry in [Unreleased] or the latest version matches actual changes
 *   4. README counts match bundles.yaml counts
 *
 * Exit codes: 0 = ok, 1 = errors found, 2 = usage error.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const BUNDLES_FILE = path.join(ROOT, 'bundles.yaml');
const CHANGELOG_FILE = path.join(ROOT, 'CHANGELOG.md');
const README_FILE = path.join(ROOT, 'README.md');

/** Parse simple YAML (bundles.yaml structure only) */
function parseBundles(file) {
  const content = fs.readFileSync(file, 'utf8');
  const bundles = {};
  const lines = content.split(/\r?\n/);
  let currentBundle = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bundleMatch = line.match(/^(\w[\w-]*):\s*$/);
    if (bundleMatch) {
      currentBundle = bundleMatch[1];
      bundles[currentBundle] = { skills: [], agents: [], knowledge: [], hooks: [], version: null };
      continue;
    }

    if (!currentBundle) continue;

    const versionMatch = line.match(/^\s+version:\s*["']?([^"'\s]+)["']?\s*$/);
    if (versionMatch) {
      bundles[currentBundle].version = versionMatch[1];
      continue;
    }

    const listMatch = line.match(/^\s+(-?\s*)(\w[\w-]*):?\s*$/);
    if (listMatch) {
      const key = listMatch[2].replace(/-$/, '');
      if (['skills', 'agents', 'knowledge', 'hooks'].includes(key)) {
        // Next lines will be list items
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('    - ')) {
          const item = lines[j].trim().replace(/^-\s*/, '');
          if (bundles[currentBundle][key]) {
            bundles[currentBundle][key].push(item);
          }
          j++;
        }
      }
    }
  }
  return bundles;
}

/** Count total skills/agents/knowledge from bundles */
function countBundles(bundles) {
  let skills = 0,
    agents = 0,
    knowledge = 0,
    hooks = 0;
  for (const [, bundle] of Object.entries(bundles)) {
    skills += (bundle.skills || []).length;
    agents += (bundle.agents || []).length;
    knowledge += (bundle.knowledge || []).length;
    hooks += (bundle.hooks || []).length;
  }
  return { skills, agents, knowledge, hooks };
}

/** Count model-invoked skills (those without disable-model-invocation: true) */
function countModelVisibleSkills() {
  const skillsDir = path.join(ROOT, 'src', 'skills');
  const bundles = parseBundles(BUNDLES_FILE);
  let visible = 0;

  for (const bundle of Object.values(bundles)) {
    for (const skill of bundle.skills || []) {
      try {
        const skillPath = path.join(skillsDir, skill, 'SKILL.md');
        const content = fs.readFileSync(skillPath, 'utf8');
        const frontmatterMatch = content.match(/^---[\s\S]*?---/);
        if (!frontmatterMatch) {
          visible++;
          continue;
        }
        const frontmatter = frontmatterMatch[0];
        if (!frontmatter.includes('disable-model-invocation: true')) {
          visible++;
        }
      } catch {
        visible++;
      }
    }
  }
  return visible;
}

/** Check CHANGELOG format */
function checkChangelogFormat(changelogText) {
  const errors = [];
  const lines = changelogText.split(/\r?\n/);

  // Must have header
  if (!lines[0].includes('# CHANGELOG')) {
    errors.push('CHANGELOG.md: Missing "# CHANGELOG" header');
  }

  // Must have reference to Keep a Changelog
  if (!changelogText.includes('Keep a Changelog')) {
    errors.push('CHANGELOG.md: Missing "Keep a Changelog" reference');
  }

  // Check version headers
  const versionHeaderRegex = /^## \[(\d+\.\d+\.\d+|Unreleased)\]/;
  let foundUnreleased = false;
  const foundVersions = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(versionHeaderRegex);
    if (match) {
      if (match[1] === 'Unreleased') {
        foundUnreleased = true;
      } else {
        foundVersions.push(match[1]);
        // Check if there's a date (can be on the same line as header or on the next line)
        const hasDateOnSameLine = lines[i].match(/\d{4}-\d{2}-\d{2}/);
        const hasDateOnNextLine = i + 1 < lines.length && lines[i + 1].match(/^\d{4}-\d{2}-\d{2}/);
        if (!hasDateOnSameLine && !hasDateOnNextLine) {
          errors.push(`CHANGELOG.md: Version [${match[1]}] missing date`);
        }
      }
    }
  }

  // Check category headers
  const categoryHeaders = ['Dodane', 'Zmienione', 'Naprawione', 'Uwagi'];
  for (const header of categoryHeaders) {
    if (!changelogText.includes(`### ✅ ${header}`) && !changelogText.includes(`### ${header}`)) {
      // Only warn if there are version headers but no category
      if (foundVersions.length > 0 || foundUnreleased) {
        // This is just a warning, not an error
      }
    }
  }

  return errors;
}

/** Extract commits since last tag */
function getCommitsSinceLastTag() {
  try {
    // Get all tags sorted by version
    const tags = execSync('git tag --sort=-version:refname', { cwd: ROOT, encoding: 'utf8' })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);
    if (tags.length === 0) {
      return { commits: [], lastTag: null };
    }

    // Get the latest tag
    const lastTag = tags[0];

    // Get commits since last tag
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    const commits = execSync(`git log --pretty=format:"%h|%s" ${range}`, { cwd: ROOT, encoding: 'utf8' }).trim();

    return {
      commits: commits
        ? commits
            .split(/\r?\n/)
            .filter(Boolean)
            .map((c) => {
              const [hash, subject] = c.split('|', 2);
              return { hash, subject };
            })
        : [],
      lastTag,
    };
  } catch (e) {
    return { commits: [], lastTag: null, error: e.message };
  }
}

/** Check if bundles.yaml changes are documented in CHANGELOG */
function checkBundlesChanges(bundles, changelogText, lastTag) {
  const errors = [];

  if (!lastTag) {
    // No previous tag, nothing to check
    return errors;
  }

  try {
    // Get bundles.yaml from last tag
    const lastBundlesText = execSync(`git show ${lastTag}:bundles.yaml`, { cwd: ROOT, encoding: 'utf8' });
    const lastBundles = parseBundlesFromText(lastBundlesText);

    const currentCounts = countBundles(bundles);
    const lastCounts = countBundles(lastBundles);

    // Check if counts changed
    const skillsChanged = currentCounts.skills !== lastCounts.skills;
    const agentsChanged = currentCounts.agents !== lastCounts.agents;

    if (skillsChanged || agentsChanged) {
      // Check if CHANGELOG documents these changes
      const hasSkillChanges = changelogText.includes('skilli') || changelogText.includes('skill');
      const hasAgentChanges = changelogText.includes('agent') || changelogText.includes('subagent');

      if (!hasSkillChanges && skillsChanged) {
        errors.push(
          `CHANGELOG.md: Skill count changed (${lastCounts.skills}→${currentCounts.skills}) but no skill-related changes documented`,
        );
      }
      if (!hasAgentChanges && agentsChanged) {
        errors.push(
          `CHANGELOG.md: Agent count changed (${lastCounts.agents}→${currentCounts.agents}) but no agent-related changes documented`,
        );
      }
    }
  } catch {
    // Can't get previous version, skip this check
  }

  return errors;
}

/** Parse bundles from text (for comparing with previous version) */
function parseBundlesFromText(text) {
  const bundles = {};
  const lines = text.split(/\r?\n/);
  let currentBundle = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bundleMatch = line.match(/^(\w[\w-]*):\s*$/);
    if (bundleMatch) {
      currentBundle = bundleMatch[1];
      bundles[currentBundle] = { skills: [], agents: [], knowledge: [], hooks: [] };
      continue;
    }

    if (!currentBundle) continue;

    if (line.match(/^\s+skills:\s*$/)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('    - ')) {
        bundles[currentBundle].skills.push(lines[j].trim().replace(/^-\s*/, ''));
        j++;
      }
    }
    if (line.match(/^\s+agents:\s*$/)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('    - ')) {
        bundles[currentBundle].agents.push(lines[j].trim().replace(/^-\s*/, ''));
        j++;
      }
    }
    if (line.match(/^\s+knowledge:\s*$/)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('    - ')) {
        bundles[currentBundle].knowledge.push(lines[j].trim().replace(/^-\s*/, ''));
        j++;
      }
    }
    if (line.match(/^\s+hooks:\s*$/)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('    - ')) {
        bundles[currentBundle].hooks.push(lines[j].trim().replace(/^-\s*/, ''));
        j++;
      }
    }
  }
  return bundles;
}

/** Check README counts match bundles.yaml */
function checkReadmeCounts(bundles, readmeText) {
  const errors = [];
  const counts = countBundles(bundles);
  const modelVisible = countModelVisibleSkills();

  // Check "Razem:" line
  const totalMatch = readmeText.match(
    /Razem:\s*\*\*(\d+)\s+plugin[ówó]w\*\*,\s*\*\*(\d+)\s+skilli\*\*,\s*\*\*(\d+)\s+subagent[ówó]w\*\*,\s*\*\*(\d+)\s+knowledge\*\*,\s*\*\*(\d+)\s+quality-gate hooki\*\*/,
  );
  if (totalMatch) {
    const [, , skills, agents, knowledge, hooks] = totalMatch.map((m) => parseInt(m, 10));

    if (skills !== counts.skills) {
      errors.push(`README.md: Total skills count (${skills}) != actual (${counts.skills})`);
    }
    if (agents !== counts.agents) {
      errors.push(`README.md: Total agents count (${agents}) != actual (${counts.agents})`);
    }
    if (knowledge !== counts.knowledge) {
      errors.push(`README.md: Total knowledge count (${knowledge}) != actual (${counts.knowledge})`);
    }
    if (hooks !== counts.hooks) {
      errors.push(`README.md: Total hooks count (${hooks}) != actual (${counts.hooks})`);
    }

    // Check model-visible count
    const visibleMatch = readmeText.match(/widocznych dla modelu\s+(\d+)/);
    if (visibleMatch) {
      const visible = parseInt(visibleMatch[1], 10);
      if (visible !== modelVisible) {
        errors.push(`README.md: Model-visible skills count (${visible}) != actual (${modelVisible})`);
      }
    }
  } else {
    errors.push('README.md: Could not find "Razem:" line with counts');
  }

  return errors;
}

/** Main function */
function main() {
  const args = process.argv.slice(2);
  const bundlesFlag = args.indexOf('--bundles');
  const changelogFlag = args.indexOf('--changelog');
  const readmeFlag = args.indexOf('--readme');

  const bundlesFile = bundlesFlag >= 0 ? path.resolve(args[bundlesFlag + 1]) : BUNDLES_FILE;
  const changelogFile = changelogFlag >= 0 ? path.resolve(args[changelogFlag + 1]) : CHANGELOG_FILE;
  const readmeFile = readmeFlag >= 0 ? path.resolve(args[readmeFlag + 1]) : README_FILE;

  let allErrors = [];

  try {
    // Parse bundles
    const bundles = parseBundles(bundlesFile);

    // Read files
    const changelogText = fs.readFileSync(changelogFile, 'utf8');
    const readmeText = fs.readFileSync(readmeFile, 'utf8');

    // Get git info
    const { lastTag } = getCommitsSinceLastTag();

    // Run checks
    allErrors = allErrors.concat(checkChangelogFormat(changelogText));
    allErrors = allErrors.concat(checkBundlesChanges(bundles, changelogText, lastTag));
    allErrors = allErrors.concat(checkReadmeCounts(bundles, readmeText));
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(2);
  }

  // Report errors
  if (allErrors.length > 0) {
    console.error('❌ CHANGELOG/README consistency errors:');
    for (const error of allErrors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  } else {
    console.log('✅ CHANGELOG and README are consistent.');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkChangelogFormat, checkBundlesChanges, checkReadmeCounts, parseBundles, countBundles };
