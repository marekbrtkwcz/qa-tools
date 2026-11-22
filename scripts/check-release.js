#!/usr/bin/env node
/**
 * Release consistency gate (runs in CI on every v* tag push):
 *   1. tag is v<x.y.z>
 *   2. every bundle in bundles.yaml carries exactly <x.y.z> as its version
 *      (one release = one version across the collection; plugin.json inherits it)
 *   3. CHANGELOG.md has a matching "## [x.y.z] - ..." header
 *
 * Keeps release discipline mechanical instead of relying on the
 * releaser remembering three places at once.
 * Exit codes: 0 = consistent, 1 = mismatch, 2 = usage error.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { parseBundles } = require('./build.js');

function checkRelease(bundlesFile, changelogFile, tag) {
  const errors = [];
  const m = /^v?(\d+\.\d+\.\d+)$/.exec(tag || '');
  if (!m) {
    return { errors: [`tag "${tag}" is not of the form vX.Y.Z`] };
  }
  const version = m[1];

  const bundles = parseBundles(bundlesFile);
  const names = Object.keys(bundles);
  if (!names.length) errors.push(`no bundles found in ${bundlesFile}`);
  for (const name of names) {
    const v = bundles[name].version;
    if (!v) errors.push(`bundle "${name}" has no version in bundles.yaml`);
    else if (v !== version) errors.push(`bundle "${name}" version ${v} != tag version ${version}`);
  }

  const changelog = fs.readFileSync(changelogFile, 'utf8');
  if (!new RegExp(`^## \\[${version}\\] `, 'm').test(changelog)) {
    errors.push(`CHANGELOG.md has no "## [${version}] - ..." header`);
  }
  return { errors, version, bundles: names };
}

function main() {
  const args = process.argv.slice(2);
  const tagFlag = args.indexOf('--tag');
  const tag = tagFlag >= 0 ? args[tagFlag + 1] : process.env.GITHUB_REF_NAME || '';
  const bundlesFlag = args.indexOf('--bundles');
  const changelogFlag = args.indexOf('--changelog');
  const root = path.join(__dirname, '..');
  const bundlesFile =
    bundlesFlag >= 0 ? path.resolve(args[bundlesFlag + 1]) : path.join(root, 'bundles.yaml');
  const changelogFile =
    changelogFlag >= 0 ? path.resolve(args[changelogFlag + 1]) : path.join(root, 'CHANGELOG.md');

  if (!tag) {
    console.error('usage: node scripts/check-release.js --tag vX.Y.Z');
    process.exit(2);
  }

  let result;
  try {
    result = checkRelease(bundlesFile, changelogFile, tag);
  } catch (e) {
    console.error(`ERROR reading release inputs: ${e.message}`);
    process.exit(1);
  }

  if (result.errors.length) {
    for (const e of result.errors) console.error(`RELEASE GATE: ${e}`);
    process.exit(1);
  }
  console.log(
    `Release gate OK: tag ${tag} matches version ${result.version} on ${result.bundles.length} bundle(s) and the CHANGELOG header.`
  );
}

if (require.main === module) main();

module.exports = { checkRelease };
