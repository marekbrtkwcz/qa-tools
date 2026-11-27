#!/usr/bin/env node
/**
 * Lint: no foreign-host leaks in the built plugins/ tree.
 *
 * The collection is native Vibe CLI (Agent Plugins 1.0): generated SKILL.md,
 * agent TOML and knowledge must not instruct the model to run things
 * "in Codex" / "in Claude Code" / "in Copilot" - those hosts do not exist
 * for a Vibe user and the instructions would misroute.
 *
 * Exempt by design:
 *   - plugins/authoring/  - the authoring bundle teaches creating assets
 *     FOR Copilot / Claude Code / Codex, so host names are its content
 *   - running-evals.md    - a cross-host comparison table (the skill's topic)
 *
 * The pack driver skills keep their multi-host text in src/ on purpose
 * (upstream source); scripts/build.ts rewrites it via rewritePackSkill, so
 * this lint scans the BUILT plugins/, where the rewrite must have landed.
 *
 * Usage: node scripts/lint-host-leaks.ts (wired into npm run check)
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PLUGINS_DIR = path.join(ROOT, 'plugins');

const EXEMPT_DIRS = new Set(['authoring']);
const EXEMPT_FILES = new Set(['running-evals.md']);

// "Copilot" only capitalized: lowercase `copilot-instructions.md` is a
// legitimate filename example, not a foreign-host instruction.
const LEAK = /\bin Codex\b|`\$[a-z0-9-]+` in Codex|Claude Code|Copilot's agent dropdown|in Copilot\b|Copilot CLI/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(md|toml|json)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function main(): void {
  if (!fs.existsSync(PLUGINS_DIR)) {
    console.error('⛔ lint-host-leaks: plugins/ missing - run npm run build first');
    process.exit(1);
  }
  const issues: string[] = [];
  for (const pack of fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })) {
    if (!pack.isDirectory() || EXEMPT_DIRS.has(pack.name)) continue;
    for (const file of walk(path.join(PLUGINS_DIR, pack.name))) {
      if (EXEMPT_FILES.has(path.basename(file))) continue;
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line: string, i: number) => {
        if (LEAK.test(line)) {
          issues.push(`  ❌ ${path.relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
        }
      });
    }
  }
  if (issues.length) {
    console.error(`⛔ lint-host-leaks FAILED: ${issues.length} foreign-host mention(s) outside the authoring bundle:`);
    for (const issue of issues) console.error(issue);
    process.exit(1);
  }
  console.log('✅ lint-host-leaks: no Codex/Claude Code/Copilot instructions outside plugins/authoring/');
}

if (require.main === module) {
  main();
}

module.exports = { LEAK, EXEMPT_DIRS, EXEMPT_FILES };
