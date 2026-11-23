#!/usr/bin/env node
/**
 * Unit tests for scripts/build.js and its pure helpers (drift gate included).
 * Run: npm test (node:test, no dependencies).
 *
 * These tests pin down the conventions the collection relies on:
 * the YAML subset parser behind bundles.yaml, the agent .md -> TOML conversion
 * (frontmatter shapes, tool mappings, the 300-char description limit), the
 * pack SKILL.md rewrite (3 -> 2 column agent tables), and the drift gate's
 * comparison semantics (file sets, content, EOL tolerance).
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  buildBundle,
  setBundlesVersions,
  parseBundles,
  parseAgentMd,
  toolsOf,
  isMutating,
  truncateDescription,
  rewritePackSkill,
  appendEmojiStyle,
  listFiles,
  diffTrees,
  checkMembership,
  checkGlobalBinaryInstallDoc,
  validateFrontmatter,
  orphanPluginDirs,
  swapStagedBundles,
} = require('./build.js');
const { validateTomlText, validateAll } = require('./validate-manifests.js');
const { checkRelease } = require('./check-release.js');

const REPO_ROOT = path.join(__dirname, '..');

/* ---------- setBundlesVersions (--set-version) ---------- */

test('setBundlesVersions: bumps only the selected bundles, preserving comments, values and CRLF', () => {
  const file = writeTmp(
    'bundles.yaml',
    '# collection bundles\r\nqa-core:\r\n  version: "0.1.0"\r\n  icon: X\r\n  skills:\r\n    - s\r\n\r\nother:\r\n  version: "0.9.9"\r\n'
  );
  const changed = setBundlesVersions(file, ['qa-core'], '0.2.0');
  assert.equal(changed, 1);
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes('qa-core:\r\n  version: "0.2.0"'), 'selected bundle bumped');
  assert.ok(text.includes('other:\r\n  version: "0.9.9"'), 'unselected bundle untouched');
  assert.ok(text.startsWith('# collection bundles\r\n'), 'comments and CRLF preserved');
  assert.ok(text.includes('  skills:\r\n    - s\r\n'), 'list structure preserved');
});

test('setBundlesVersions: returns 0 and writes nothing when no bundle matches', () => {
  const body = 'a:\n  version: "0.1.0"\n';
  const file = writeTmp('bundles.yaml', body);
  assert.equal(setBundlesVersions(file, ['missing'], '0.2.0'), 0);
  assert.equal(fs.readFileSync(file, 'utf8'), body);
});

/* ---------- helpers ---------- */

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qa-tools-test-'));
}

function writeTmp(name, content) {
  const dir = tmpDir();
  const file = path.join(dir, name);
  fs.writeFileSync(file, content);
  return file;
}

function writeTree(root, files) {
  // files: { 'relative/path': 'content' }
  fs.mkdirSync(root, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
}

/* ---------- buildBundle (integration, real src tree) ---------- */

test('buildBundle: Codex trigger folder (agents/openai.yaml) is not shipped in the Vibe artifact', () => {
  // create-skill is a real skill whose src folder carries agents/openai.yaml
  // (all 42 of them only set display_name / allow_implicit_invocation, and the
  // SKILL.md frontmatter already covers the invocation policy).
  const out = tmpDir();
  const errors = buildBundle('authoring', { skills: ['create-skill'] }, out);
  assert.deepEqual(errors, []);
  const skillDir = path.join(out, 'authoring', 'skills', 'create-skill');
  assert.ok(fs.existsSync(path.join(skillDir, 'SKILL.md')), 'SKILL.md must ship');
  assert.ok(
    !fs.existsSync(path.join(skillDir, 'agents')),
    'Codex/OpenAI trigger folder must be filtered from the artifact'
  );
});

test('buildBundle: no dead mcp.json for bundles without mcp; qa-mcp ships the global-binary servers', () => {
  // A bundle that does not declare mcp: must not ship an placeholder
  // mcpServers:{} manifest; the one that does runs the global binaries.
  // No version pin anywhere on purpose: the manifest schema carries only
  // the command, the version lives in the user's npm i -g install (README
  // ships floating @latest), so the manifest is identical across versions.
  const out = tmpDir();
  const noErrors = buildBundle('authoring', { skills: ['create-skill'] }, out);
  assert.deepEqual(noErrors, []);
  assert.ok(
    !fs.existsSync(path.join(out, 'authoring', 'mcp.json')),
    'bundle without mcp: must not ship an empty mcp.json'
  );

  const built = buildBundle('qa-mcp', { mcp: ['playwright', 'chrome-devtools-mcp'] }, out);
  assert.deepEqual(built, [], 'the servers need no pin: install versions float by design');
  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'qa-mcp', 'mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest.mcpServers), ['playwright', 'chrome-devtools-mcp']);
  assert.equal(manifest.mcpServers.playwright.command, 'playwright-mcp');
  // chrome-devtools-mcp keeps the server name identical to the binary, so a
  // user-level [[mcp_servers]] entry with the same name shadows the plugin
  // copy instead of spawning a second Chrome instance.
  assert.equal(manifest.mcpServers['chrome-devtools-mcp'].command, 'chrome-devtools-mcp');
  assert.ok(!('args' in manifest.mcpServers.playwright), 'bare executable: no args, no version in the manifest');
  assert.ok(!('args' in manifest.mcpServers['chrome-devtools-mcp']), 'bare executable: no args, no version in the manifest');
});

test('checkGlobalBinaryInstallDoc: the README must document both floating @latest install lines', () => {
  // The plugin runs the global playwright-mcp and chrome-devtools-mcp
  // binaries, so without a documented npm i -g prerequisite each server
  // fails with a spawn error on every machine. The gate keeps every line
  // present - and rejects a pinned version, which reads as a
  // pre-policy-change README.
  const out = tmpDir();

  // no README at all: one error naming both required install lines
  const missing = checkGlobalBinaryInstallDoc(out);
  assert.equal(missing.length, 1);
  assert.ok(missing[0].includes('npm i -g @playwright/mcp@latest'), missing[0]);
  assert.ok(missing[0].includes('npm i -g chrome-devtools-mcp@latest'), missing[0]);

  // a pinned version (the old policy) must also fail, not pass silently
  fs.writeFileSync(path.join(out, 'README.md'), 'npm i -g @playwright/mcp@0.0.86\n');
  const stale = checkGlobalBinaryInstallDoc(out);
  assert.equal(stale.length, 2, 'a pinned install line must fail the gate, and the second prerequisite is missing too');
  assert.ok(stale.some((e) => e.includes('npm i -g @playwright/mcp@latest')), 'error names the playwright line');
  assert.ok(stale.some((e) => e.includes('npm i -g chrome-devtools-mcp@latest')), 'error names the chrome-devtools line');

  // only the playwright line present: the chrome-devtools line still flagged
  fs.writeFileSync(path.join(out, 'README.md'), 'Instalacja globalna:\n\nnpm i -g @playwright/mcp@latest\n');
  const half = checkGlobalBinaryInstallDoc(out);
  assert.equal(half.length, 1, 'only one prerequisite documented: one error');
  assert.ok(half[0].includes('chrome-devtools-mcp@latest'), half[0]);

  // both floating lines, anywhere in the README: no errors
  fs.writeFileSync(
    path.join(out, 'README.md'),
    'Instalacja globalna:\n\nnpm i -g @playwright/mcp@latest\nnpm i -g chrome-devtools-mcp@latest\n'
  );
  assert.deepEqual(checkGlobalBinaryInstallDoc(out), []);
});

/* ---------- parseBundles (minimal YAML subset) ---------- */

test('parseBundles: structure, lists, quoted values, booleans, comments', () => {
  const file = writeTmp(
    'bundles.yaml',
    [
      '# top comment',
      'qa-core:',
      '  icon: X',
      '  description: "Colon: inside quotes"',
      '  version: "0.2.0"',
      '  pack: true',
      '  skills:',
      '    - a-skill',
      '    - b-skill',
      '  hooks:',
      '    - test-file-guard',
      '  mcp:',
      '    - playwright',
      '',
      'second:',
      '  icon: Y',
      '  pack: false',
      '',
    ].join('\n')
  );
  const bundles = parseBundles(file);
  assert.deepEqual(Object.keys(bundles), ['qa-core', 'second']);
  const qa = bundles['qa-core'];
  assert.equal(qa.icon, 'X');
  assert.equal(qa.description, 'Colon: inside quotes');
  assert.equal(qa.version, '0.2.0');
  assert.equal(qa.pack, true);
  assert.deepEqual(qa.skills, ['a-skill', 'b-skill']);
  assert.deepEqual(qa.hooks, ['test-file-guard']);
  assert.deepEqual(qa.mcp, ['playwright']);
  assert.equal(bundles['second'].pack, false);
});

test('parseBundles: survives CRLF line endings (Windows working tree)', () => {
  const body = [
    'a:',
    '  icon: X',
    '  skills:',
    '    - one',
    '',
  ].join('\r\n');
  const bundles = parseBundles(writeTmp('bundles.yaml', body));
  assert.equal(bundles['a'].icon, 'X');
  assert.deepEqual(bundles['a'].skills, ['one']);
});

/* ---------- parseAgentMd (frontmatter in src/agents/*.md) ---------- */

test('parseAgentMd: name/title/description, capabilities array, pack tools, body', () => {
  const md = [
    '---',
    'name: my-agent',
    'title: My Agent',
    'description: Long description',
    '  continued on the next line',
    'capabilities: [read, grep]',
    'tools: Read, Grep, Bash',
    '---',
    '',
    'Body line one.',
    '',
  ].join('\n');
  const { meta, body } = parseAgentMd(md);
  assert.equal(meta.name, 'my-agent');
  assert.equal(meta.title, 'My Agent');
  assert.equal(meta.description, 'Long description continued on the next line');
  assert.deepEqual(meta.capabilities, ['read', 'grep']);
  assert.equal(meta.tools, 'Read, Grep, Bash');
  assert.equal(body, 'Body line one.');
});

/* ---------- tool mapping (capabilities / pack tool names -> Vibe) ---------- */

test('toolsOf: maps capabilities and pack tool names, lowercases, dedupes', () => {
  assert.deepEqual(toolsOf({ capabilities: ['read'] }), ['read_file']);
  assert.deepEqual(toolsOf({ tools: 'Read, WebFetch, Bash' }), [
    'read_file',
    'web_search',
    'bash',
  ]);
  // combined, duplicates collapse in first-seen order
  assert.deepEqual(toolsOf({ capabilities: ['read'], tools: 'Read, Grep' }), [
    'read_file',
    'bash',
  ]);
  // unknown capability names map to nothing
  assert.deepEqual(toolsOf({ capabilities: ['teleport'] }), []);
  // no capabilities at all
  assert.deepEqual(toolsOf({}), []);
});

test('isMutating: edit/write/execute/bash flip safety to neutral', () => {
  assert.equal(isMutating({ capabilities: ['read', 'search'] }), false);
  assert.equal(isMutating({ capabilities: ['execute'] }), true);
  assert.equal(isMutating({ capabilities: ['edit'] }), true);
  assert.equal(isMutating({ tools: 'Bash' }), true);
  assert.equal(isMutating({ tools: 'Read' }), false);
  assert.equal(isMutating({}), false);
});

/* ---------- truncateDescription (Vibe 300-char limit) ---------- */

test('truncateDescription: short and exactly-300 strings pass through', () => {
  assert.equal(truncateDescription('short'), 'short');
  const exact = 'x'.repeat(300);
  assert.equal(truncateDescription(exact), exact);
});

test('truncateDescription: over-limit cut on a word boundary with ellipsis, never longer than 300', () => {
  const long = ('word '.repeat(60).trim()) + ' tail'; // 299 + 5 chars
  const out = truncateDescription(long);
  assert.ok(out.length <= 300, `result too long: ${out.length}`);
  assert.ok(out.endsWith('…'), 'must end with ellipsis');
  assert.ok(!/\s/.test(out.slice(0, -1).slice(-1)), 'no trailing space before ellipsis');
  assert.ok(long.startsWith(out.slice(0, -1)), 'must be a prefix of the original');
});

/* ---------- rewritePackSkill (pack SKILL.md: Claude/Codex -> Vibe) ---------- */

test('rewritePackSkill: agent table 3 columns -> 2, host bullets rewritten', () => {
  const input = [
    'Intro line.',
    '',
    '| Name used below | Claude Code | Codex |',
    '| --- | --- | --- |',
    '| Analyst | `basics-analyst` | `basics_analyst` |',
    '',
    '- In Claude Code, start the agent with your agent tool, using the name in the Claude Code column.',
    '- In Codex, spawn the agent by the name in the Codex column. Copy the files first.',
    '- Normal bullet stays.',
    '',
    'Text after.',
  ].join('\n');
  const out = rewritePackSkill(input);
  const lines = out.split('\n');
  assert.equal(lines[2], '| Name used below | Vibe |');
  assert.equal(lines[3], '| --- | --- |');
  assert.equal(lines[4], '| Analyst | `basics-analyst` |');  assert.ok(
    lines.some((l) => l === '- In Vibe, spawn the agent with `tools.agents` using `config_name` from the Vibe column.'),
    'Claude Code bullet must be rewritten to the Vibe instruction'
  );
  assert.ok(!out.includes('In Codex, spawn'), 'Codex bullet must be dropped');
  assert.ok(out.includes('- Normal bullet stays.'));
  assert.ok(out.includes('Text after.'));
});

/* ---------- appendEmojiStyle ---------- */

test('appendEmojiStyle: appends the shared convention block once, newline-safe', () => {
  const out = appendEmojiStyle('# Heading\n\nBody.');
  assert.ok(out.startsWith('# Heading\n\nBody.'));
  assert.ok(out.includes('Emoji'), 'emoji style content must be appended');
  assert.ok(!out.endsWith('\n'), 'trailing whitespace is trimmed');
});

/* ---------- listFiles / diffTrees (drift gate core) ---------- */

test('listFiles: slash-normalized, sorted, recursion-safe', () => {
  const root = tmpDir();
  writeTree(root, {
    'b.json': '1',
    'ai.mistral.vibe/agents/x.toml': '2',
    'ai.mistral.vibe/knowledge/k/KNOWLEDGE.md': '3',
    'a-z.md': '4',
  });
  assert.deepEqual(listFiles(root), [
    'a-z.md',
    'ai.mistral.vibe/agents/x.toml',
    'ai.mistral.vibe/knowledge/k/KNOWLEDGE.md',
    'b.json',
  ]);
});

test('diffTrees: identical builds produce no errors', () => {
  const files = { 'qa-core/plugin.json': '{"a":1}', 'qa-core/skills/s/SKILL.md': 'x\n' };
  const built = tmpDir();
  const committed = tmpDir();
  writeTree(built, files);
  writeTree(committed, files);
  assert.deepEqual(diffTrees(built, committed, ['qa-core']), []);
});

test('diffTrees: content difference, missing file and stale file are reported separately', () => {
  const built = tmpDir();
  const committed = tmpDir();
  writeTree(built, {
    'qa-core/same.txt': 'same',
    'qa-core/changed.txt': 'new content',
    'qa-core/fresh.txt': 'only in build',
  });
  writeTree(committed, {
    'qa-core/same.txt': 'same',
    'qa-core/changed.txt': 'old content',
    'qa-core/stale.txt': 'only in artifact',
  });
  const errors = diffTrees(built, committed, ['qa-core']);
  assert.equal(errors.length, 3);
  assert.ok(errors.some((e) => e.includes('changed.txt') && e.includes('differs')));
  assert.ok(errors.some((e) => e.includes('fresh.txt') && e.includes('missing from committed')));
  assert.ok(errors.some((e) => e.includes('stale.txt') && e.includes('stale in committed')));
});

test('diffTrees: EOL-only difference is not drift (core.autocrlf working tree)', () => {
  const built = tmpDir();
  const committed = tmpDir();
  writeTree(built, { 'qa-core/a.json': '{"x":1}\n', 'qa-core/s/SKILL.md': 'line1\nline2\n' });
  writeTree(committed, { 'qa-core/a.json': '{"x":1}\r\n', 'qa-core/s/SKILL.md': 'line1\r\nline2\r\n' });
  assert.deepEqual(diffTrees(built, committed, ['qa-core']), []);
});

test('diffTrees: non-selected bundles are not compared', () => {
  const built = tmpDir();
  const committed = tmpDir();
  writeTree(built, { 'other/stale.txt': 'x' });
  writeTree(committed, { 'other/stale.txt': 'y' }); // differs, but bundle "other" not selected
  assert.deepEqual(diffTrees(built, committed, ['qa-core']), []);
});

/* ---------- checkMembership: agents and knowledge orphans and duplicates ---------- */

test('checkMembership: the real collection is clean; duplicating an agent across bundles is an error', () => {
  const real = parseBundles(path.join(__dirname, '..', 'bundles.yaml'));
  assert.deepEqual(checkMembership(real), [], 'the real collection must have no membership errors');
  const dup = JSON.parse(JSON.stringify(real));
  dup['test-automation'].agents = [...dup['test-automation'].agents, dup['qa-core'].agents[0]];
  const errors = checkMembership(dup);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('declared in both'), `unexpected: ${errors[0]}`);
});

test('checkMembership: missing agent and knowledge sources are reported', () => {
  const real = JSON.parse(JSON.stringify(parseBundles(path.join(__dirname, '..', 'bundles.yaml'))));
  real['qa-core'].agents = [...real['qa-core'].agents, 'no-such-agent'];
  real['qa-core'].knowledge = [...real['qa-core'].knowledge, 'no-such-knowledge'];
  const errors = checkMembership(real);
  assert.equal(errors.filter((e) => e.includes('no-such-agent')).length, 1);
  assert.equal(errors.filter((e) => e.includes('no-such-knowledge')).length, 1);
});

/* ---------- validateFrontmatter ---------- */

test('validateFrontmatter: the real collection has no frontmatter errors; warnings only name skills/agents/knowledge', () => {
  const real = parseBundles(path.join(__dirname, '..', 'bundles.yaml'));
  const { errors, warnings } = validateFrontmatter(real);
  assert.deepEqual(errors, [], 'the real collection must have no frontmatter errors');
  assert.ok(Array.isArray(warnings));
  assert.ok(warnings.length === 0 || warnings.every((test_w) => test_w.startsWith('agent ') || test_w.startsWith('knowledge ') || test_w.startsWith('skill ')), 'real-collection warnings must follow the declared policy classes');
});

test('validateFrontmatter: name mismatch, missing description and over-limit skill description are errors', () => {
  const srcRoot = tmpDir();
  const longDesc = 'x'.repeat(1025);
  writeTree(path.join(srcRoot, 'skills'), {
    'good/SKILL.md': '---\nname: good\ndescription: "Valid trigger. Use when x."\n---\n\n# Good\n',
    'bad-name/SKILL.md': '---\nname: not-bad-name\ndescription: ""\n---\n\n# Bad\n',
    'long/SKILL.md': '---\nname: long\ndescription: "' + longDesc + '"\n---\n\n# Long\n',
  });
  const bundles = { b: { skills: ['good', 'bad-name', 'long'], agents: [], knowledge: [] } };
  const { errors, warnings } = validateFrontmatter(bundles, srcRoot);
  assert.equal(errors.length, 3, JSON.stringify(errors));
  assert.ok(errors.some((e) => e.includes('skill bad-name') && e.includes('!= directory name')));
  assert.ok(errors.some((e) => e.includes('skill bad-name') && e.includes('missing frontmatter description')));
  assert.ok(errors.some((e) => e.includes('skill long') && e.includes('1024')));
  assert.deepEqual(warnings, []);
});

test('validateFrontmatter: agent descriptions over 300 warn (build truncates), never error', () => {
  const srcRoot = tmpDir();
  const long = 'a'.repeat(320);
  writeTree(path.join(srcRoot, 'agents'), {
    'mine.md': '---\nname: mine\ntitle: Mine\ndescription: ' + long + '\ncapabilities: [read]\n---\n\nBody.\n',
  });
  const bundles = { b: { skills: [], agents: ['mine'], knowledge: [] } };
  const { errors, warnings } = validateFrontmatter(bundles, srcRoot);
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].includes('agent mine') && warnings[0].includes('320'));
});

test('validateFrontmatter: skill descriptions over 700 warn (routing signal), never error', () => {
  const srcRoot = tmpDir();
  const long = 'd'.repeat(750);
  writeTree(path.join(srcRoot, 'skills'), {
    'mine/SKILL.md': '---\nname: mine\ndescription: ' + long + '\n---\n\nBody.\n',
  });
  const bundles = { b: { skills: ['mine'], agents: [], knowledge: [] } };
  const { errors, warnings } = validateFrontmatter(bundles, srcRoot);
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].includes('skill mine') && warnings[0].includes('750'));
});

/* ---------- orphanPluginDirs (drift gate whole-bundle blind spot) ---------- */

test('orphanPluginDirs: a committed plugin dir missing from bundles.yaml is drift', () => {
  const committed = tmpDir();
  writeTree(committed, {
    'qa-core/plugin.json': '{}\n',
    'ghost/plugin.json': '{}\n',
  });
  assert.deepEqual(orphanPluginDirs(committed, ['qa-core', 'ghost']), []);
  const errors = orphanPluginDirs(committed, ['qa-core']);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('plugins/ghost') && errors[0].includes('not declared in bundles.yaml'));
  assert.deepEqual(orphanPluginDirs(tmpDir(), ['qa-core']), [], 'missing plugins dir is not an error');
});

/* ---------- validate-manifests: generated TOML syntax gate ---------- */

test('validateTomlText: build-emitted TOML passes; broken string and non-kv line fail with line numbers', () => {
  const clean = [
    '# comment',
    'schema_version = 1',
    'agent_type = "subagent"',
    'enabled_tools = ["read_file", "edit"]',
    'strict = false',
    '',
    '[[hooks]]',
    'name = "gate"',
  ].join('\n');
  assert.deepEqual(validateTomlText(clean, 'a.toml'), []);
  const broken = 'instructions = "line1 broken quote';
  const errs = validateTomlText(broken, 'a.toml');
  assert.equal(errs.length, 1);
  assert.ok(errs[0].includes('a.toml:1'), errs[0]);
  // a raw newline inside a TOML string (the build escapes them, but if it
  // ever stops) is flagged on both halves, so it can never pass silently
  const split = validateTomlText('instructions = "line1\nline2 tail', 'c.toml');
  assert.equal(split.length, 2);
  assert.ok(split[0].includes('c.toml:1') && split[1].includes('c.toml:2'));
  const notKv = validateTomlText('just some text\n', 'b.toml');
  assert.equal(notKv.length, 1);
  assert.ok(notKv[0].includes('not a recognizable TOML line'));
});

test('validateAll: the real plugins/ tree passes both JSON and TOML gates', () => {
  const results = validateAll(path.join(__dirname, '..', 'plugins'));
  assert.equal(results.jsonErrors.length, 0, JSON.stringify(results.jsonErrors));
  assert.equal(results.tomlErrors.length, 0, JSON.stringify(results.tomlErrors));
  assert.ok(results.jsonCount >= 13);
  assert.ok(results.tomlCount >= 42);
});

/* ---------- checkMembership: orphans and missing sources (fixture tree) ---------- */

test('checkMembership: orphan skill/agent/knowledge and missing sources are errors', () => {
  const srcRoot = tmpDir();
  writeTree(srcRoot, {
    'skills/used/SKILL.md': 'x',
    'skills/orphan-skill/SKILL.md': 'x',
    'agents/used.md': 'x',
    'agents/orphan-agent.md': 'x',
    'knowledge/used.md': 'x',
    'knowledge/orphan-knowledge.md': 'x',
  });
  const bundles = {
    a: { skills: ['used'], agents: ['used'], knowledge: ['used'] },
    b: { skills: ['ghost-skill'], knowledge: ['used'] }, // ghost has no source; used knowledge duplicated
  };
  const errors = checkMembership(bundles, srcRoot);
  assert.ok(
    errors.some((e) => e.includes('orphan-skill') && e.includes('not declared in any bundle')),
    `orphan skill reported, got: ${errors}`
  );
  assert.ok(
    errors.some((e) => e.includes('orphan-agent') && e.includes('not declared in any bundle')),
    'orphan agent reported'
  );
  assert.ok(
    errors.some((e) => e.includes('orphan-knowledge') && e.includes('not declared in any bundle')),
    'orphan knowledge reported'
  );
  assert.ok(errors.some((e) => e.includes('"ghost-skill" has no src/skills')), 'missing source reported');
  assert.ok(
    errors.some((e) => e.includes('knowledge "used" declared in both "a" and "b"')),
    'duplicate knowledge across bundles reported'
  );
});

/* ---------- hooks.toml emission ---------- */

test('buildBundle: hooks.toml emitted only for bundles that declare hooks, three matchers per hook, valid TOML', () => {
  const gated = tmpDir();
  const errors = buildBundle(
    'gated',
    { description: 'gated', version: '0.1.0', hooks: ['test-file-guard'] },
    gated
  );
  assert.deepEqual(errors, []);
  const tomlPath = path.join(gated, 'gated', 'ai.mistral.vibe', 'hooks.toml');
  assert.ok(fs.existsSync(tomlPath), 'hooks.toml emitted');
  const toml = fs.readFileSync(tomlPath, 'utf8');
  assert.equal((toml.match(/\[\[hooks\]\]/g) || []).length, 3, 'one [[hooks]] entry per matcher');
  assert.ok(toml.includes('match = "file_system.write_file"'));
  assert.ok(toml.includes('match = "file_system.edit"'));
  assert.ok(toml.includes('match = "file_system.bash"'));
  assert.ok(toml.includes('name = "test-file-guard"'), 'hook base name present');
  assert.ok(toml.includes('name = "test-file-guard-bash"'), 'bash matcher derived name present');
  assert.ok(fs.existsSync(path.join(gated, 'gated', 'vibe-hooks', 'test-file-guard.js')), 'guard script copied');

  const plain = tmpDir();
  assert.deepEqual(buildBundle('plain', { description: 'plain', version: '0.1.0' }, plain), []);
  assert.ok(
    !fs.existsSync(path.join(plain, 'plain', 'ai.mistral.vibe', 'hooks.toml')),
    'no hooks.toml without a declared hook'
  );
  assert.ok(!fs.existsSync(path.join(plain, 'plain', 'vibe-hooks')), 'no vibe-hooks dir without a declared hook');
});

/* ---------- atomic build swap ---------- */

test('swapStagedBundles: staged dirs replace destinations wholesale; leftovers cannot survive', () => {
  const staging = tmpDir();
  const out = tmpDir();
  writeTree(path.join(staging, 'b'), { 'plugin.json': '{"v":2}\n' });
  writeTree(path.join(out, 'b'), { 'plugin.json': '{"v":1}\n', 'junk.txt': 'leftover\n' });
  swapStagedBundles(staging, out, ['b']);
  assert.equal(fs.readFileSync(path.join(out, 'b', 'plugin.json'), 'utf8'), '{"v":2}\n');
  assert.ok(!fs.existsSync(path.join(out, 'b', 'junk.txt')), 'old junk must not survive the swap');
});

test('swapStagedBundles: a failed rename restores the previous tree, never leaves a hole', () => {
  const staging = tmpDir();
  const out = tmpDir();
  writeTree(path.join(out, 'b'), { 'plugin.json': '{"v":1}\n' });
  // nothing staged for "b": renaming the staged source must fail
  assert.throws(() => swapStagedBundles(staging, out, ['b']));
  assert.equal(
    fs.readFileSync(path.join(out, 'b', 'plugin.json'), 'utf8'),
    '{"v":1}\n',
    'the old bundle must be restored in place'
  );
});

/* ---------- CLI paths (--check / --verify / usage errors) ---------- */

test('CLI: --check exits 0 and reports "All bundles valid."', () => {
  const r = spawnSync(process.execPath, [path.join('scripts', 'build.js'), '--check'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('All bundles valid.'), `stdout`);
});

test('CLI: --verify exits 0 against the real committed plugins/ tree', () => {
  const r = spawnSync(process.execPath, [path.join('scripts', 'build.js'), '--verify'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('Committed plugins/ matches a fresh build.'));
});

test('CLI: usage errors exit 2 (bad --set-version, unknown --bundle)', () => {
  const badVersion = spawnSync(
    process.execPath,
    [path.join('scripts', 'build.js'), '--set-version', 'next'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.equal(badVersion.status, 2, badVersion.stderr);
  assert.ok(badVersion.stderr.includes('x.y.z'));

  const ghostBundle = spawnSync(
    process.execPath,
    [path.join('scripts', 'build.js'), '--bundle', 'ghost'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.equal(ghostBundle.status, 2, ghostBundle.stderr);
  assert.ok(ghostBundle.stderr.includes('Unknown bundle'));
});

/* ---------- release consistency gate ---------- */

test('checkRelease: tag, bundle versions and CHANGELOG header must agree', () => {
  const dir = tmpDir();
  const bundlesFile = path.join(dir, 'bundles.yaml');
  fs.writeFileSync(bundlesFile, 'a:\n  version: "0.3.0"\n  description: x\nb:\n  version: "0.3.0"\n  description: y\n');
  const changelog = path.join(dir, 'CHANGELOG.md');
  fs.writeFileSync(changelog, '# CHANGELOG\n\n## [Unreleased]\n\n## [0.3.0] - 2026-11-23\n');

  assert.deepEqual(checkRelease(bundlesFile, changelog, 'v0.3.0').errors, [], 'consistent release passes');

  const mismatched = checkRelease(bundlesFile, changelog, 'v0.2.0');
  assert.ok(mismatched.errors.some((e) => e.includes('version 0.3.0 != tag version 0.2.0')));
  assert.ok(mismatched.errors.some((e) => e.includes('"## [0.2.0]')));
  assert.ok(checkRelease(bundlesFile, changelog, 'not-a-tag').errors.length > 0, 'non-tag form rejected');

  const versionless = dir2(path.join(dir, 'nov'));
  const bundles2 = path.join(versionless, 'bundles.yaml');
  fs.writeFileSync(bundles2, 'a:\n  description: x\n');
  const missing = checkRelease(bundles2, changelog, 'v0.3.0');
  assert.ok(missing.errors.some((e) => e.includes('bundle "a" has no version')));
});

function dir2(p) {
  fs.mkdirSync(p, { recursive: true });
  return p;
}

test('checkRelease CLI: the real repo passes for its current version tag', () => {
  const bundlesText = fs.readFileSync(path.join(REPO_ROOT, 'bundles.yaml'), 'utf8');
  const versionMatch = bundlesText.match(/version:\s*"?(\d+\.\d+\.\d+)/); // mono-version: tag matches every bundle
  assert.ok(versionMatch, 'no version found in bundles.yaml');
  const tag = `v${versionMatch[1]}`;
  const r = spawnSync(
    process.execPath,
    [path.join('scripts', 'check-release.js'), '--tag', tag],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('Release gate OK'));
});
