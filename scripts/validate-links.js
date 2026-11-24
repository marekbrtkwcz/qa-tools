#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const CHECK_MODE = process.argv.includes('--check');
const DRY_RUN = process.argv.includes('--dry-run');
const QUIET = process.argv.includes('--quiet');

const REPO_ROOT = path.resolve(__dirname, '..');

function log(msg) {
  if (!QUIET) console.log(msg);
}

function err(msg) {
  console.error(msg);
}

function getAllMdFiles(dir, fileList, baseDir) {
  const files = fs.readdirSync(dir);
  fileList = fileList || [];
  baseDir = baseDir || dir;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Skip node_modules, plugins (built artifacts), and resource directories
    if (file === 'node_modules' || file === 'plugins' || file === '.vibe' || file === '.git' || file === 'resources')
      continue;

    if (stat.isDirectory()) {
      getAllMdFiles(fullPath, fileList, baseDir);
    } else if (file.endsWith('.md')) {
      fileList.push(path.relative(REPO_ROOT, fullPath));
    }
  }
  return fileList;
}

function extractLinks(content, filePath) {
  const links = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Match [text](url) and ![alt](url)
    const inlineMatch = line.match(/(!?\[[^\]]*\])\(([^)]+)\)/g);
    if (inlineMatch) {
      for (const match of inlineMatch) {
        const regex = /(!?\[[^\]]*\])\(([^)]+)\)/;
        const m = match.match(regex);
        if (m) {
          const isImage = m[1].startsWith('!');
          const text = isImage ? m[1].substring(1) : m[1];
          const url = m[2];
          links.push({
            type: isImage ? 'image' : 'inline',
            text: text.substring(1, text.length - 1), // Remove []
            url,
            line: lineNum,
            file: filePath,
          });
        }
      }
    }
  }
  return links;
}

function isRelative(url) {
  return !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('#') && !url.includes('://');
}

function isCrossBundle(url) {
  return /^[\w-]+:\w+/.test(url);
}

function loadBundles() {
  try {
    const yaml = require('yaml');
    const content = fs.readFileSync(path.join(REPO_ROOT, 'bundles.yaml'), 'utf8');
    return yaml.parse(content) || {};
  } catch {
    return {};
  }
}

function validateCrossBundle(url, bundles) {
  const parts = url.split(':');
  if (parts.length < 2) return false;

  const bundleName = parts[0];
  const ref = parts.slice(1).join(':');
  const bundle = bundles[bundleName];
  if (!bundle) return false;

  return Boolean(
    bundle.skills?.includes(ref) ||
    bundle.agents?.includes(ref) ||
    bundle.knowledge?.includes(ref) ||
    bundle.hooks?.includes(ref)
  );
}

function main() {
  try {
    const bundles = loadBundles();
    const mdFiles = getAllMdFiles(REPO_ROOT);

    if (DRY_RUN) {
      log('--- DRY RUN ---');
      log(`Would check ${mdFiles.length} markdown files`);
      log('--- END DRY RUN ---');
      return;
    }

    log(`Validating ${mdFiles.length} markdown files...`);

    const issues = [];
    const stats = {
      total: 0,
      internal: 0,
      external: 0,
      crossBundle: 0,
      broken: 0,
    };

    for (const relPath of mdFiles) {
      const fullPath = path.join(REPO_ROOT, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const links = extractLinks(content, relPath);

      for (const link of links) {
        stats.total++;

        if (isCrossBundle(link.url)) {
          stats.crossBundle++;
          if (!validateCrossBundle(link.url, bundles)) {
            issues.push({
              file: link.file,
              line: link.line,
              type: 'cross-bundle',
              msg: `Cross-bundle not found: ${link.url}`,
            });
            stats.broken++;
          }
        } else if (isRelative(link.url)) {
          stats.internal++;
          // Skip relative links that go up directories - they may point to external structure
          if (link.url.startsWith('../')) continue;

          const targetPath = path.join(path.dirname(fullPath), link.url);
          const targetExists = fs.existsSync(targetPath) || fs.existsSync(`${targetPath}.md`);
          if (!targetExists) {
            issues.push({
              file: link.file,
              line: link.line,
              type: 'internal',
              msg: `File not found: ${link.url}`,
            });
            stats.broken++;
          }
        } else if (link.url.startsWith('#')) {
          // Anchor - skip for now
        } else {
          stats.external++;
        }
      }
    }

    log(
      `Stats: ${stats.total} total, ${stats.internal} internal, ${stats.external} external, ${stats.crossBundle} cross-bundle, ${stats.broken} broken`,
    );

    if (issues.length === 0) {
      log(`All ${stats.total} links are valid!`);
      return;
    }

    err(`Found ${issues.length} issues:`);
    for (const issue of issues) {
      err(`  ${issue.file}:${issue.line} ${issue.msg} [${issue.type}]`);
    }

    if (CHECK_MODE) process.exit(1);
  } catch (err) {
    err(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Export functions for unit testing
if (require.main === module) {
  main();
}

module.exports = {
  getAllMdFiles,
  extractLinks,
  isRelative,
  isCrossBundle,
  loadBundles,
  validateCrossBundle,
};
