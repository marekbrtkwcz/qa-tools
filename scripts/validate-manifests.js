#!/usr/bin/env node
/**
 * qa-tools manifest validation: parses every *.json under plugins/ to fail the
 * build early on a malformed plugin.json or mcp.json, and every generated
 * agent TOML (ai.mistral.vibe/agents/*.toml) and hooks.toml — instead of at
 * plugin load time in Vibe CLI.
 *
 * The build emits every TOML value through JSON.stringify (valid TOML
 * basic-string escaping), so a successful JSON.parse of each value side is
 * a real syntax check: it catches unterminated strings, bad escapes, and
 * mangled multi-line fences in agent instructions.
 *
 * Usage: node scripts/validate-manifests.js [--dir <plugins>]
 * Exit code 1 on any parse failure. Used by CI.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function listJsonFiles(d) {
  return listByExt(d, '.json');
}

function listByExt(d, ext) {
  const out = [];
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, entry.name);
    if (entry.isDirectory()) out.push(...listByExt(p, ext));
    else if (entry.name.endsWith(ext)) out.push(p);
  }
  return out;
}

/**
 * Validate the TOML subset the build produces: comments, `[[section]]`
 * headers, and `key = value` lines whose value must JSON.parse (string,
 * number, boolean, or array of strings).
 * Returns an array of error strings, empty when clean.
 */
function validateTomlText(text, label) {
  const errors = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    if (/^\[\[?[\w.]+\]?\]$/.test(line)) continue; // section header
    const m = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!m) {
      errors.push(`${label}:${i + 1}: not a recognizable TOML line: "${line.slice(0, 60)}"`);
      continue;
    }
    try {
      JSON.parse(m[2]);
    } catch (e) {
      errors.push(`${label}:${i + 1}: ${m[1]} value is not a parseable string/array/primitive: ${e.message}`);
    }
  }
  return errors;
}

function validateAll(dir) {
  const results = { jsonErrors: [], tomlErrors: [], jsonCount: 0, tomlCount: 0 };
  const jsonFiles = listJsonFiles(dir);
  results.jsonCount = jsonFiles.length;
  for (const file of jsonFiles) {
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      results.jsonErrors.push(`${path.relative(ROOT, file)}: ${e.message}`);
    }
  }
  const tomlFiles = listByExt(dir, '.toml');
  results.tomlCount = tomlFiles.length;
  for (const file of tomlFiles) {
    results.tomlErrors.push(...validateTomlText(fs.readFileSync(file, 'utf8'), path.relative(ROOT, file)));
  }
  return results;
}

function main() {
  const args = process.argv.slice(2);
  const dirFlag = args.indexOf('--dir');
  const dir = dirFlag >= 0 ? path.resolve(args[dirFlag + 1]) : path.join(ROOT, 'plugins');

  if (!fs.existsSync(dir)) {
    console.error(`❌ No such directory: ${dir}`);
    process.exit(2);
  }

  const results = validateAll(dir);
  const bad = [...results.jsonErrors, ...results.tomlErrors];
  if (bad.length) {
    console.error('❌ ERRORS:');
    for (const b of bad) console.error(`  - ${b}`);
    process.exit(1);
  }
  console.log(
    `✅ ${results.jsonCount} JSON manifest(s) and ${results.tomlCount} TOML file(s) parse cleanly under ${path.relative(ROOT, dir) || '.'}`,
  );
}

if (require.main === module) {
  main();
}

/* Exposed for scripts/build.test.js (node:test). No dependencies. */
module.exports = { listJsonFiles, listByExt, validateTomlText, validateAll };
