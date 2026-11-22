#!/usr/bin/env node
/**
 * qa-tools manifest validation: parses every *.json under plugins/ to fail the
 * build early on a malformed plugin.json or mcp.json, instead of at plugin
 * load time in Vibe CLI.
 *
 * Usage: node scripts/validate-manifests.js [--dir <plugins>]
 * Exit code 1 on any parse failure. Used by CI.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dirFlag = args.indexOf('--dir');
const dir = dirFlag >= 0 ? path.resolve(args[dirFlag + 1]) : path.join(ROOT, 'plugins');

function listJsonFiles(d) {
  const out = [];
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(p));
    else if (entry.name.endsWith('.json')) out.push(p);
  }
  return out;
}

if (!fs.existsSync(dir)) {
  console.error(`No such directory: ${dir}`);
  process.exit(2);
}

const files = listJsonFiles(dir);
const bad = [];
for (const file of files) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    bad.push(`${path.relative(ROOT, file)}: ${e.message}`);
  }
}

if (bad.length) {
  console.error('ERRORS:');
  for (const b of bad) console.error('  - ' + b);
  process.exit(1);
}
console.log(`${files.length} JSON manifest(s) parse cleanly under ${path.relative(ROOT, dir) || '.'}`);
