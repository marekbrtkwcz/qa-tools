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
  validateFrontmatter,
  orphanPluginDirs,
} = require('./build.js');
const { validateTomlText, validateAll } = require('./validate-manifests.js');

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

test('buildBundle: no dead mcp.json for bundles without mcp; qa-mcp ships a pinned server', () => {
  // A bundle that does not declare mcp: must not ship an placeholder
  // mcpServers:{} manifest; the one that does must pin an exact version.
  const out = tmpDir();
  const noErrors = buildBundle('authoring', { skills: ['create-skill'] }, out);
  assert.deepEqual(noErrors, []);
  assert.ok(
    !fs.existsSync(path.join(out, 'authoring', 'mcp.json')),
    'bundle without mcp: must not ship an empty mcp.json'
  );

  // The pin comes from the bundle config (bundles.yaml mcp-pins), never
  // from a constant in build.js.
  const pinned = buildBundle('qa-mcp', { mcp: ['playwright'], 'mcp-pins': ['playwright=0.0.86'] }, out);
  assert.deepEqual(pinned, []);
  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'qa-mcp', 'mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest.mcpServers), ['playwright']);
  const args = manifest.mcpServers.playwright.args;
  assert.equal(args.length, 1, 'one fully pinned npx arg, never @latest');
  assert.equal(args[0], '@playwright/mcp@0.0.86');
});

test('buildBundle: the MCP pin is version-controlled config — a playwright server without a pin is a build error', () => {
  const out = tmpDir();
  const errors = buildBundle('qa-mcp', { mcp: ['playwright'] }, out);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('no version pin'), errors[0]);
  assert.ok(
    !fs.existsSync(path.join(out, 'qa-mcp', 'mcp.json')),
    'an unpinned server must not produce a manifest at all'
  );
  // and the pin flows through end to end: a new version in the config
  // lands verbatim in the generated manifest
  const bumped = buildBundle('qa-mcp', { mcp: ['playwright'], 'mcp-pins': ['playwright=1.2.3'] }, out);
  assert.deepEqual(bumped, []);
  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'qa-mcp', 'mcp.json'), 'utf8'));
  assert.equal(manifest.mcpServers.playwright.args[0], '@playwright/mcp@1.2.3');
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
