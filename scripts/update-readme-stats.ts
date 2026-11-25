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
const { resolve } = require('node:path');
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
    const bundleCounts: BundleCounts = {
      skills: bundleConfig.skills ? bundleConfig.skills.length : 0,
      agents: bundleConfig.agents ? bundleConfig.agents.length : 0,
      knowledge: bundleConfig.knowledge ? bundleConfig.knowledge.length : 0,
      hooks: bundleConfig.hooks ? bundleConfig.hooks.length : 0,
    };

    counts.perBundle[bundleName] = bundleCounts;

    counts.skills += bundleCounts.skills;
    counts.agents += bundleCounts.agents;
    counts.knowledge += bundleCounts.knowledge;
    counts.hooks += bundleCounts.hooks;
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
  // README.md bywa CRLF (Windows, core.autocrlf); wyszukiwania typu "\n\n"
  // trafiają tylko na LF, więc na wejściu normalizujemy, a na wyjściu
  // przywracamy oryginalny styl końca linii.
  const usesCrlf = readme.includes('\r\n');
  let updated = usesCrlf ? readme.replace(/\r\n/g, '\n') : readme;
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
      // counts jest budowane z tego samego zbioru bundli, więc brak wpisu
      // oznacza niespójność wejścia — traktujemy jak pusty licznik
      const bundleCounts = counts.perBundle[bundleName] ?? {
        skills: 0,
        agents: 0,
        knowledge: 0,
        hooks: 0,
      };

      // Wzorzec rzędu: | `bundleName` icon | N | N | N | hooks | Zakres |
      // Grupa 1 łapie początek rzędu z nazwą bundla, grupy 2/4/6 liczby
      // (Skille/Agenci/Knowledge), grupy 3/5/7 separatory; końcowe [^|\n]*
      // konsumuje starą komórkę Hook, żeby zamienić ją na nową, nie zdublować.
      const rowRegex = new RegExp(
        `(\\|\\s*\\\`${bundleName}\\\`\\s*[^|]*\\|\\s*)(\\d+|${EM_DASH})(\\s*\\|\\s*)(\\d+|${EM_DASH})(\\s*\\|\\s*)(\\d+|${EM_DASH})(\\s*\\|\\s*)[^|\\n]*`,
        'g',
      );

      const fmt = (value: number) => (value === 0 ? EM_DASH : String(value));
      const skills = fmt(bundleCounts.skills);
      const agents = fmt(bundleCounts.agents);
      const knowledge = fmt(bundleCounts.knowledge);
      const hooks = bundleCounts.hooks > 0 ? `✅ ${bundleConfig.hooks ? bundleConfig.hooks.join(', ') : ''}` : EM_DASH;

      // Zamień komórki rzędu; stara komórka Hook jest skonsumowana przez regex,
      // a jej spacja wiodąca/wolna wraca z replacementu (oczekiwany format
      // tabeli to równo "| N | N | N | hooks | Zakres |")
      newTableSection = newTableSection.replace(rowRegex, `$1${skills}$3${agents}$5${knowledge}$7${hooks} `);
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
  const visibleMatch = updated.match(/(\d+) skilli widocznych dla modelu/);
  if (visibleMatch) {
    updated = updated.replace(visibleMatch[0], `${counts.visibleSkills} skilli widocznych dla modelu`);
    changes.push(`Updated visible skills count to: ${counts.visibleSkills}`);
  }

  // Utrzymuj nawias "(195 − 43 z `disable-model-invocation: true`)" — obie
  // liczby muszą nadążyć za counts, inaczej linia rozjedzie się po pierwszej
  // automatycznej aktualizacji samego licznika widocznych.
  const parenMatch = updated.match(/\((\d+)\s*−\s*(\d+)\s+z\s*`disable-model-invocation: true`/);
  if (parenMatch) {
    const disabledCount = counts.skills - counts.visibleSkills;
    const newParen = `(${counts.skills} − ${disabledCount} z \`disable-model-invocation: true\``;
    if (parenMatch[0] !== newParen) {
      updated = updated.replace(parenMatch[0], newParen);
      changes.push('Updated visible-skills parenthetical');
    }
  }

  if (usesCrlf) {
    updated = updated.replace(/\n/g, '\r\n');
  }

  return { updated, changes };
}

function verifyReadme(readme: string, counts: Counts, bundles: Bundles): string[] {
  const issues: string[] = [];

  for (const bundleName of Object.keys(bundles)) {
    // counts jest budowane z tego samego zbioru bundli, więc brak wpisu
    // oznacza niespójność wejścia — traktujemy jak pusty licznik
    const bundleCounts = counts.perBundle[bundleName] ?? { skills: 0, agents: 0, knowledge: 0, hooks: 0 };

    // Try to find the row for this bundle
    const rowRegex = new RegExp(`\\\`${bundleName}\\\`.+?\\|\\s*(\\d+|${EM_DASH})\\s*\\|\\s*(\\d+|${EM_DASH})`);
    const match = readme.match(rowRegex);

    if (match) {
      const skillsStr = match[1] ?? EM_DASH;
      const agentsStr = match[2] ?? EM_DASH;
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
    const pluginsInReadme = parseInt(razemMatch[1] ?? '0', 10);
    if (pluginsInReadme !== counts.plugins) {
      issues.push(`  ❌ Total plugins: ${pluginsInReadme} (README) != ${counts.plugins} (bundles.yaml)`);
    }
  }

  const skillsMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*skilli/);
  if (skillsMatch) {
    const skillsInReadme = parseInt(skillsMatch[1] ?? '0', 10);
    if (skillsInReadme !== counts.skills) {
      issues.push(`  ❌ Total skills: ${skillsInReadme} (README) != ${counts.skills} (bundles.yaml)`);
    }
  }

  const agentsMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*subagent/);
  if (agentsMatch) {
    const agentsInReadme = parseInt(agentsMatch[1] ?? '0', 10);
    if (agentsInReadme !== counts.agents) {
      issues.push(`  ❌ Total agents: ${agentsInReadme} (README) != ${counts.agents} (bundles.yaml)`);
    }
  }

  const knowledgeMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*knowledge/);
  if (knowledgeMatch) {
    const knowledgeInReadme = parseInt(knowledgeMatch[1] ?? '0', 10);
    if (knowledgeInReadme !== counts.knowledge) {
      issues.push(`  ❌ Total knowledge: ${knowledgeInReadme} (README) != ${counts.knowledge} (bundles.yaml)`);
    }
  }

  const hooksMatch = readme.match(/Razem:[^\n]*\*\*(\d+)\s*quality-gate/);
  if (hooksMatch) {
    const hooksInReadme = parseInt(hooksMatch[1] ?? '0', 10);
    if (hooksInReadme !== counts.hooks) {
      issues.push(`  ❌ Total hooks: ${hooksInReadme} (README) != ${counts.hooks} (bundles.yaml)`);
    }
  }

  const visibleMatch = readme.match(/(\d+) skilli widocznych dla modelu/);
  if (visibleMatch) {
    const visibleInReadme = parseInt(visibleMatch[1] ?? '0', 10);
    if (visibleInReadme !== counts.visibleSkills) {
      issues.push(`  ❌ Visible skills: ${visibleInReadme} (README) != ${counts.visibleSkills} (calculated)`);
    }
  }

  const parenMatch = readme.match(/\((\d+)\s*−\s*(\d+)\s+z\s*`disable-model-invocation: true`/);
  if (parenMatch) {
    const totalInReadme = parseInt(parenMatch[1] ?? '0', 10);
    const disabledInReadme = parseInt(parenMatch[2] ?? '0', 10);
    const disabledCount = counts.skills - counts.visibleSkills;
    if (totalInReadme !== counts.skills) {
      issues.push(`  ❌ Parenthetical total: ${totalInReadme} (README) != ${counts.skills} (bundles.yaml)`);
    }
    if (disabledInReadme !== disabledCount) {
      issues.push(`  ❌ Parenthetical disabled: ${disabledInReadme} (README) != ${disabledCount} (calculated)`);
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
  updateReadme,
};
