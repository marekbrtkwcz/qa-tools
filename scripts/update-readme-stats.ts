#!/usr/bin/env node
/**
 * P2.2: Update README.md statistics automatically
 *
 * Updates ONLY the counts in the bundle table and the "Razem:" line
 * Preserves all existing descriptions and formatting
 *
 * Usage:
 *   node scripts/update-readme-stats.ts [options]
 *
 * Options:
 *   --dry-run      Show what would be changed without writing
 *   --check        Verify stats are up-to-date (exit 1 if not)
 *   --quiet        Only output errors
 */

const { readFileSync, writeFileSync, existsSync, readdirSync, statSync } = require('node:fs');
const { resolve, relative, join } = require('node:path');
const { parse } = require('yaml');

const DRY_RUN = process.argv.includes('--dry-run');
const CHECK_MODE = process.argv.includes('--check');
const QUIET = process.argv.includes('--quiet');

const BUNDLES_PATH = resolve(__dirname, '../bundles.yaml');
const README_PATH = resolve(__dirname, '../README.md');
const EM_DASH = '—';

interface BundleConfig {
  skills?: string[];
  agents?: string[];
  knowledge?: string[];
  hooks?: string[];
}

type Bundles = Record<string, BundleConfig>;

interface BundleCounts {
  skills: number;
  agents: number;
  knowledge: number;
  hooks: number;
}

interface Counts {
  plugins: number;
  skills: number;
  agents: number;
  knowledge: number;
  hooks: number;
  visibleSkills: number;
  perBundle: Record<string, BundleCounts>;
}

function log(message: string): void {
  if (!QUIET) console.log(message);
}

function loadBundles(): Bundles {
  if (!existsSync(BUNDLES_PATH)) {
    throw new Error(`bundles.yaml not found at ${BUNDLES_PATH}`);
  }

  const content = readFileSync(BUNDLES_PATH, 'utf-8');
  return parse(content) as Bundles;
}

function loadReadme(): string {
  if (!existsSync(README_PATH)) {
    throw new Error(`README.md not found at ${README_PATH}`);
  }
  return readFileSync(README_PATH, 'utf-8');
}

function countFromBundles(bundles: Bundles): Counts {
  const counts: Counts = {
    plugins: Object.keys(bundles).length,
    skills: 0,
    agents: 0,
    knowledge: 0,
    hooks: 0,
    visibleSkills: 0,
    perBundle: {},
  };

  for (const [bundleName, bundleConfig] of Object.entries(bundles)) {
    counts.perBundle[bundleName] = {
      skills: bundleConfig.skills ? bundleConfig.skills.length : 0,
      agents: bundleConfig.agents ? bundleConfig.agents.length : 0,
      knowledge: bundleConfig.knowledge ? bundleConfig.knowledge.length : 0,
      hooks: bundleConfig.hooks ? bundleConfig.hooks.length : 0,
    };

    counts.skills += counts.perBundle[bundleName]!.skills;
    counts.agents += counts.perBundle[bundleName]!.agents;
    counts.knowledge += counts.perBundle[bundleName]!.knowledge;
    counts.hooks += counts.perBundle[bundleName]!.hooks;
  }

  // Count visible skills from source
  try {
    const srcPath = resolve(__dirname, '../src/skills');

    if (existsSync(srcPath)) {
      const skillDirs = readdirSync(srcPath).filter((d: string) => {
        const path = resolve(srcPath, d);
        return statSync(path).isDirectory();
      });

      for (const skillDir of skillDirs) {
        const skillMdPath = resolve(srcPath, skillDir, 'SKILL.md');
        if (existsSync(skillMdPath)) {
          const content = readFileSync(skillMdPath, 'utf-8');
          const frontmatterMatch = content.match(/^---[\s\S]*?---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[0];
            if (frontmatter.includes('disable-model-invocation: true')) {
              // disabled
            } else {
              counts.visibleSkills++;
            }
          } else {
            counts.visibleSkills++;
          }
        }
      }
    }
  } catch {
    counts.visibleSkills = counts.skills;
  }

  return counts;
}

function updateReadme(readme: string, counts: Counts, bundles: Bundles): { updated: string; changes: string[] } {
  let updated = readme;
  const changes: string[] = [];

  // Find the table section and update each bundle row
  const tableStart = updated.indexOf('| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |');

  if (tableStart >= 0) {
    // Find the end of the table
    let tableEnd = updated.indexOf('\n\nRazem:', tableStart);
    if (tableEnd < 0) {
      tableEnd = updated.indexOf('\n\n', tableStart + 100);
    }
    if (tableEnd < 0) {
      tableEnd = updated.length;
    }

    const tableSection = updated.substring(tableStart, tableEnd);
    let newTableSection = tableSection;

    // For each bundle, update its row in the table
    for (const [bundleName, bundleConfig] of Object.entries(bundles)) {
      const bundleCounts = counts.perBundle[bundleName]!;

      // Create regex to match the bundle's row
      // The row format is: | `bundleName` icon | skills | agents | knowledge | hooks | description |
      const rowRegex = new RegExp(
        `(|s*\`${bundleName}\`s*[^|]*)\\|\\s*(\\d+|${EM_DASH})\\s*\\|\\s*(\\d+|${EM_DASH})\\s*\\|\\s*(\\d+|${EM_DASH})`,
        'g',
      );

      const skills = bundleCounts.skills;
      const agents = bundleCounts.agents;
      const knowledge = bundleCounts.knowledge || EM_DASH;
      const hooks =
        bundleCounts.hooks > 0 ? '✅ ' + (bundleConfig.hooks ? bundleConfig.hooks.join(', ') : '') : EM_DASH;

      // Replace the numbers in the row
      newTableSection = newTableSection.replace(rowRegex, `$1| ${skills} | ${agents} | ${knowledge} | ${hooks}`);
    }

    if (newTableSection !== tableSection) {
      updated = updated.substring(0, tableStart) + newTableSection + updated.substring(tableEnd);
      changes.push('Updated bundle table counts');
    }
  }

  // Update "Razem:" line
  const newRazem = `Razem: **${counts.plugins} pluginów**, **${counts.skills} skilli**, **${counts.agents} subagentów**, **${counts.knowledge} knowledge**, **${counts.hooks} quality-gate hooki**.`;

  const razemMatch = updated.match(/^Razem:[^\n]+$/m);
  if (razemMatch) {
    updated = updated.replace(razemMatch[0], newRazem);
    changes.push('Updated "Razem:" line');
  }

  // Update visible skills count if present
  const visibleMatch = updated.match(/widocznych dla modelu (\d+)/);
  if (visibleMatch) {
    const newVisibleText = `widocznych dla modelu ${counts.visibleSkills}`;
    updated = updated.replace(visibleMatch[0], newVisibleText);
    changes.push(`Updated visible skills count to: ${counts.visibleSkills}`);
  }

  return { updated, changes };
}

function verifyReadme(readme: string, counts: Counts, bundles: Bundles): string[] {
  const issues: string[] = [];

  for (const bundleName of Object.keys(bundles)) {
    const bundleCounts = counts.perBundle[bundleName]!;

    // Try to find the row for this bundle
    const rowRegex = new RegExp(`\\\`${bundleName}\\\`.+?\\|\\s*(\\d+|${EM_DASH})\\s*\\|\\s*(\\d+|${EM_DASH})`);
    const match = readme.match(rowRegex);

    if (match) {
      const skillsStr = match[1]!;
      const agentsStr = match[2]!;
      const skillsInReadme = skillsStr === EM_DASH ? 0 : parseInt(skillsStr, 10);
      const agentsInReadme = agentsStr === EM_DASH ? 0 : parseInt(agentsStr, 10);

      if (skillsInReadme !== bundleCounts.skills) {
        issues.push(`  ❌ ${bundleName}: skills ${skillsInReadme} (README) != ${bundleCounts.skills} (bundles.yaml)`);
      }
      if (agentsInReadme !== bundleCounts.agents) {
        issues.push(`  ❌ ${bundleName}: agents ${agentsInReadme} (README) != ${bundleCounts.agents} (bundles.yaml)`);
      }
    } else {
      issues.push(`  ❌ ${bundleName}: bundle not found in README table`);
    }
  }

  const razemMatch = readme.match(/Razem:\s*\*\*(\d+)\s*plugin/);
  if (razemMatch) {
    const pluginsInReadme = parseInt(razemMatch[1]!, 10);
    if (pluginsInReadme !== counts.plugins) {
      issues.push(`  ❌ Total plugins: ${pluginsInReadme} (README) != ${counts.plugins} (bundles.yaml)`);
    }
  }

  const skillsMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*skilli/);
  if (skillsMatch) {
    const skillsInReadme = parseInt(skillsMatch[1]!, 10);
    if (skillsInReadme !== counts.skills) {
      issues.push(`  ❌ Total skills: ${skillsInReadme} (README) != ${counts.skills} (bundles.yaml)`);
    }
  }

  const agentsMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*subagent/);
  if (agentsMatch) {
    const agentsInReadme = parseInt(agentsMatch[1]!, 10);
    if (agentsInReadme !== counts.agents) {
      issues.push(`  ❌ Total agents: ${agentsInReadme} (README) != ${counts.agents} (bundles.yaml)`);
    }
  }

  const knowledgeMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*knowledge/);
  if (knowledgeMatch) {
    const knowledgeInReadme = parseInt(knowledgeMatch[1]!, 10);
    if (knowledgeInReadme !== counts.knowledge) {
      issues.push(`  ❌ Total knowledge: ${knowledgeInReadme} (README) != ${counts.knowledge} (bundles.yaml)`);
    }
  }

  const hooksMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*quality-gate/);
  if (hooksMatch) {
    const hooksInReadme = parseInt(hooksMatch[1]!, 10);
    if (hooksInReadme !== counts.hooks) {
      issues.push(`  ❌ Total hooks: ${hooksInReadme} (README) != ${counts.hooks} (bundles.yaml)`);
    }
  }

  const visibleMatch = readme.match(/widocznych dla modelu (\d+)/);
  if (visibleMatch) {
    const visibleInReadme = parseInt(visibleMatch[1]!, 10);
    if (visibleInReadme !== counts.visibleSkills) {
      issues.push(`  ❌ Visible skills: ${visibleInReadme} (README) != ${counts.visibleSkills} (calculated)`);
    }
  }

  return issues;
}

function main() {
  try {
    log('📊 Loading bundles.yaml...');
    const bundles = loadBundles();

    log('📊 Counting assets...');
    const counts = countFromBundles(bundles);

    log(`   Plugins: ${counts.plugins}`);
    log(`   Skills: ${counts.skills}`);
    log(`   Agents: ${counts.agents}`);
    log(`   Knowledge: ${counts.knowledge}`);
    log(`   Hooks: ${counts.hooks}`);
    log(`   Visible skills: ${counts.visibleSkills}`);

    if (CHECK_MODE) {
      log('\n🔍 Verifying README.md stats...');
      const readme = loadReadme();
      const issues = verifyReadme(readme, counts, bundles);

      if (issues.length === 0) {
        log('✅ All README stats are up-to-date!');
        process.exit(0);
      } else {
        console.error('\n❌ README stats are OUT OF DATE:\n');
        issues.forEach((i) => {
          console.error(i);
        });
        console.error('\n💡 Run: node scripts/update-readme-stats.ts');
        process.exit(1);
      }
    }

    log('\n📝 Updating README.md...');
    const readme = loadReadme();
    const { updated, changes } = updateReadme(readme, counts, bundles);

    if (updated === readme) {
      log('✅ README.md is already up-to-date!');
      return;
    }

    if (DRY_RUN) {
      console.log('\n--- DRY RUN (no files written) ---\n');
      console.log('Changes to be made:');
      changes.forEach((c) => {
        console.log(`  ${c}`);
      });
      console.log('\n--- END DRY RUN ---\n');
      return;
    }

    writeFileSync(README_PATH, updated, 'utf-8');

    log('✅ README.md updated successfully!');
    changes.forEach((c) => {
      log(`   ${c}`);
    });
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

// Export functions for unit testing
if (require.main === module) {
  main();
}

module.exports = {
  loadBundles,
  loadReadme,
  countFromBundles,
};
