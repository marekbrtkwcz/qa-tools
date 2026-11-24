#!/usr/bin/env node
/**
 * P2.1: Generate CHANGELOG.md automatically from conventional commits
 * 
 * Usage:
 *   node scripts/generate-changelog.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be generated without writing
 *   --from <tag> Start from this tag (default: last tag)
 *   --to <tag>   End at this tag (default: HEAD)
 *   --output <file> Output file (default: CHANGELOG.md)
 */

const { execSync } = require('node:child_process');
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

const DRY_RUN = process.argv.includes('--dry-run');
const FROM_TAG = process.argv.find((a) => a.startsWith('--from='))?.split('=')[1];
const TO_TAG = process.argv.find((a) => a.startsWith('--to='))?.split('=')[1] || 'HEAD';
const OUTPUT_FILE = process.argv.find((a) => a.startsWith('--output='))?.split('=')[1] || 'CHANGELOG.md';

// Emoji map for Polish CHANGELOG
const TYPE_TO_SECTION = {
  feat: '✅ Dodane',
  feature: '✅ Dodane',
  nowy: '✅ Dodane',
  nowa: '✅ Dodane',
  dodano: '✅ Dodane',
  add: '✅ Dodane',
  added: '✅ Dodane',
  
  fix: '🐛 Naprawione',
  fixed: '🐛 Naprawione',
  naprawiono: '🐛 Naprawione',
  naprawa: '🐛 Naprawione',
  bug: '🐛 Naprawione',
  
  chore: '🔄 Zmienione',
  refactor: '🔄 Zmienione',
  refactored: '🔄 Zmienione',
  perf: '🔄 Zmienione',
  test: '🔄 Zmienione',
  tests: '🔄 Zmienione',
  docs: '🔄 Zmienione',
  documentation: '🔄 Zmienione',
  zmieniono: '🔄 Zmienione',
  
  'BREAKING CHANGE': '⚠️ BREAKING CHANGE',
  'BREAKING-CHANGE': '⚠️ BREAKING CHANGE',
};

const BREAKING_PATTERN = /BREAKING CHANGE:/i;

function getGitTags() {
  try {
    const output = execSync('git tag --sort=-version:refname', { encoding: 'utf-8', cwd: resolve() }).trim();
    return output.split('\n').filter(Boolean).filter(t => /^v?\d+\.\d+\.\d+$/.test(t));
  } catch {
    return [];
  }
}

function getCommits(fromTag, toTag) {
  const range = fromTag ? `${fromTag}..${toTag}` : toTag;
  try {
    const output = execSync(
      `git log ${range} --no-merges --pretty=format:"%h%n%s%n%b%n%an"`,
      { encoding: 'utf-8', cwd: resolve() }
    );
    return parseCommits(output);
  } catch {
    return [];
  }
}

function parseCommits(output) {
  const commits = [];
  const lines = output.split('\n');
  
  let currentCommit = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (currentCommit && currentCommit.body) {
        currentCommit.body += '\n';
      }
      continue;
    }
    
    // Check if line is a commit hash (short hash)
    if (/^[a-f0-9]{7,}$/.test(line) && line.length <= 8) {
      if (currentCommit) {
        commits.push(currentCommit);
      }
      currentCommit = { hash: line, subject: '', body: '', author: '' };
      continue;
    }
    
    if (currentCommit) {
      if (!currentCommit.subject) {
        currentCommit.subject = line;
      } else if (!currentCommit.body && line !== currentCommit.author) {
        currentCommit.body = line;
      } else if (line !== currentCommit.author) {
        currentCommit.body += (currentCommit.body ? '\n' : '') + line;
      }
    }
    
    // Check if line looks like an author (last line of commit)
    if (/^[\w\s<>@.]+$/.test(line) && line.length > 3 && line.length < 100) {
      if (currentCommit && !currentCommit.author) {
        currentCommit.author = line;
      }
    }
  }
  
  if (currentCommit) {
    commits.push(currentCommit);
  }
  
  return commits;
}

function parseCommitMessage(message) {
  const lines = message.split('\n');
  const header = lines[0];
  const body = lines.slice(1).join('\n').trim();
  
  const headerMatch = header.match(/^([\w-]+)(?:\(([^)]+)\))?:\s*(.+)$/);
  
  if (!headerMatch) {
    return { type: null, scope: null, description: header, breaking: false, body };
  }
  
  const [, type, scope, description] = headerMatch;
  const breaking = BREAKING_PATTERN.test(header) || BREAKING_PATTERN.test(body);
  
  return { type, scope, description, breaking, body };
}

function formatDate(tag) {
  try {
    const date = execSync(`git log -1 --format=%aI ${tag}`, { encoding: 'utf-8', cwd: resolve() }).trim();
    return date.split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function getLatestTag() {
  const tags = getGitTags();
  return tags[0] || null;
}

function getPreviousTag(currentTag) {
  const tags = getGitTags();
  const index = tags.findIndex(t => t === currentTag);
  return index > 0 ? tags[index + 1] : null;
}

function generateChangelog() {
  const tags = getGitTags();
  const allCommits = [];
  
  const latestTag = tags[0] || null;
  const unreleasedCommits = latestTag ? getCommits(latestTag, 'HEAD') : getCommits(null, 'HEAD');
  
  const sections = [];
  
  if (unreleasedCommits.length > 0) {
    sections.push({ version: 'Unreleased', date: null, commits: unreleasedCommits });
  }
  
  for (const tag of tags) {
    const prevTag = getPreviousTag(tag);
    const commits = getCommits(prevTag || null, tag);
    if (commits.length > 0) {
      sections.push({ version: tag.replace(/^v/, ''), date: formatDate(tag), commits });
    }
  }
  
  let changelog = '# CHANGELOG\n\n';
  changelog += 'Wszystkie istotne zmiany tego projektu są dokumentowane tutaj. Format zbliżony do [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); wydanie kolekcji = tag `vx.y.z` na historii gita. Wersje per-bundle w `bundles.yaml` są podbijane w tym samym wydaniu (`node scripts/build.js --set-version x.y.z`), więc `plugin.json` każdego pluginu ma wersję kolekcji.\n\n';
  
  for (const section of sections) {
    const versionHeader = section.date 
      ? `## [${section.version}] - ${section.date}`
      : `## [Unreleased]`;
    
    changelog += `${versionHeader}\n\n`;
    
    const sectionGroups = {
      '✅ Dodane': [],
      '🐛 Naprawione': [],
      '🔄 Zmienione': [],
      '⚠️ BREAKING CHANGE': [],
    };
    
    for (const commit of section.commits) {
      const parsed = parseCommitMessage(commit.subject + (commit.body ? '\n' + commit.body : ''));
      
      if (!parsed.type && !parsed.breaking) {
        const lowerSubject = commit.subject.toLowerCase();
        if (lowerSubject.includes('dodano') || lowerSubject.includes('nowy') || lowerSubject.includes('nowa')) {
          sectionGroups['✅ Dodane'].push({ commit, parsed });
        } else if (lowerSubject.includes('naprawiono') || lowerSubject.includes('fix') || lowerSubject.includes('bug')) {
          sectionGroups['🐛 Naprawione'].push({ commit, parsed });
        } else if (lowerSubject.includes('zmieniono') || lowerSubject.includes('zmiana') || lowerSubject.includes('refactor') || lowerSubject.includes('chore')) {
          sectionGroups['🔄 Zmienione'].push({ commit, parsed });
        } else {
          sectionGroups['🔄 Zmienione'].push({ commit, parsed });
        }
      } else {
        if (parsed.breaking) {
          sectionGroups['⚠️ BREAKING CHANGE'].push({ commit, parsed });
        } else {
          const sectionName = TYPE_TO_SECTION[parsed.type] || '🔄 Zmienione';
          sectionGroups[sectionName].push({ commit, parsed });
        }
      }
    }
    
    const sectionOrder = ['✅ Dodane', '🐛 Naprawione', '🔄 Zmienione', '⚠️ BREAKING CHANGE'];
    let hasContent = false;
    
    for (const sectionName of sectionOrder) {
      const items = sectionGroups[sectionName];
      if (items.length === 0) continue;
      
      hasContent = true;
      changelog += `### ${sectionName}\n\n`;
      
      for (const { commit, parsed } of items) {
        const scope = parsed.scope ? ` (**${parsed.scope}**)` : '';
        const breaking = parsed.breaking ? '!' : '';
        const description = parsed.description || commit.subject;
        const hash = commit.hash.substring(0, 7);
        
        const scopeStr = scope || (parsed.scope ? ` (${parsed.scope})` : '');
        const line = `- ${description}${scopeStr}${breaking} (${hash})`;
        
        if (parsed.body && parsed.body.trim()) {
          changelog += `${line}\n  > ${parsed.body.trim().replace(/\n/g, '\n  > ')}\n`;
        } else {
          changelog += `${line}\n`;
        }
      }
      changelog += '\n';
    }
    
    if (!hasContent && section.version !== 'Unreleased') {
      changelog += '_Brak zmian w tej wersji._\n\n';
    }
  }
  
  return changelog;
}

function main() {
  try {
    console.log('📝 Generating CHANGELOG...');
    
    const changelog = generateChangelog();
    
    if (DRY_RUN) {
      console.log('\n--- DRY RUN (no files written) ---\n');
      console.log(changelog);
      console.log('\n--- END DRY RUN ---\n');
      return;
    }
    
    const outputPath = resolve(OUTPUT_FILE);
    
    let finalContent = changelog;
    
    if (existsSync(outputPath)) {
      const existing = readFileSync(outputPath, 'utf-8');
      const existingHeader = existing.split('\n').slice(0, 3).join('\n');
      const newHeader = changelog.split('\n').slice(0, 3).join('\n');
      
      if (existingHeader !== newHeader && existingHeader.includes('CHANGELOG')) {
        finalContent = existingHeader + '\n' + changelog.split('\n').slice(3).join('\n');
      }
    }
    
    writeFileSync(outputPath, finalContent, 'utf-8');
    
    console.log(`✅ CHANGELOG generated at ${OUTPUT_FILE}`);
    console.log(`   Found ${getGitTags().length} tags`);
    console.log(`   Generated ${(finalContent.match(/^## \[/gm) || []).length} release sections`);
    
  } catch (error) {
    console.error('❌ Error generating CHANGELOG:', error.message);
    process.exit(1);
  }
}

// Export functions for unit testing
if (require.main === module) {
  main();
}

module.exports = {
  TYPE_TO_SECTION,
  BREAKING_PATTERN,
  getGitTags,
  getCommits,
  parseCommits,
};
