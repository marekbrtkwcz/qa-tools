#!/usr/bin/env node
/**
 * Unit tests for scripts/validate-links.ts
 * Run: npm run test:p3 or node --test scripts/validate-links.test.js
 *
 * Tests cover:
 * - Markdown link extraction (inline, images)
 * - Relative vs external vs cross-bundle detection
 * - Cross-bundle validation against bundles.yaml
 * - File existence validation
 * - CLI options (--check, --dry-run, --quiet)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Import functions from validate-links.js
const {
  getAllMdFiles,
  extractLinks,
  isRelative,
  isCrossBundle,
  loadBundles,
  validateCrossBundle,
} = require('./validate-links.ts');

const REPO_ROOT = path.resolve(__dirname, '..');

/* ---------- Helper: write temp file ---------- */

function writeTmp(content: string, suffix: string = '.md') {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-links-test-'));
  const filePath = path.join(tmpDir, `test${suffix}`);
  fs.writeFileSync(filePath, content);
  return { filePath, tmpDir, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

/* ---------- extractLinks tests ---------- */

test('extractLinks: finds inline markdown links', () => {
  const content = '[text](https://example.com) and [another](http://test.com)';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].type, 'inline');
  assert.strictEqual(links[0].text, 'text');
  assert.strictEqual(links[0].url, 'https://example.com');
  assert.strictEqual(links[1].text, 'another');
  assert.strictEqual(links[1].url, 'http://test.com');
});

test('extractLinks: finds image links', () => {
  const content = '![alt text](image.png) and ![icon](icon.svg)';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].type, 'image');
  assert.strictEqual(links[0].text, 'alt text');
  assert.strictEqual(links[0].url, 'image.png');
  assert.strictEqual(links[1].type, 'image');
  assert.strictEqual(links[1].url, 'icon.svg');
});

test('extractLinks: finds mixed inline and image links', () => {
  const content = '[link](url) and ![image](img.png)';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].type, 'inline');
  assert.strictEqual(links[1].type, 'image');
});

test('extractLinks: finds links across multiple lines', () => {
  const content = `[first](link1.md)\n\n[second](link2.md)`;
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].line, 1);
  assert.strictEqual(links[1].line, 3);
});

test('extractLinks: returns empty array for no links', () => {
  const content = 'Just plain text with no links';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 0);
});

test('extractLinks: handles links with special characters', () => {
  const content = '[text with spaces](path/with spaces/file.md)';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].url, 'path/with spaces/file.md');
});

test('extractLinks: handles anchor links', () => {
  const content = '[section](#section-id) and [header](#top)';
  const links = extractLinks(content, 'test.md');

  assert.strictEqual(links.length, 2);
  assert.strictEqual(links[0].url, '#section-id');
  assert.strictEqual(links[1].url, '#top');
});

/* ---------- isRelative tests ---------- */

test('isRelative: returns true for relative paths', () => {
  assert.strictEqual(isRelative('./file.md'), true);
  assert.strictEqual(isRelative('file.md'), true);
  assert.strictEqual(isRelative('path/to/file.md'), true);
  assert.strictEqual(isRelative('../file.md'), true);
});

test('isRelative: returns false for absolute URLs', () => {
  assert.strictEqual(isRelative('https://example.com'), false);
  assert.strictEqual(isRelative('http://example.com'), false);
  assert.strictEqual(isRelative('ftp://example.com'), false);
});

test('isRelative: returns false for anchors', () => {
  assert.strictEqual(isRelative('#section'), false);
  assert.strictEqual(isRelative('#top'), false);
});

test('isRelative: returns true for protocol-relative URLs (treated as relative)', () => {
  // The script treats //example.com as relative for validation purposes
  assert.strictEqual(isRelative('//example.com'), true);
});

/* ---------- isCrossBundle tests ---------- */

test('isCrossBundle: returns true for bundle:ref format', () => {
  assert.strictEqual(isCrossBundle('test-automation:api-testing'), true);
  assert.strictEqual(isCrossBundle('qa-core:reporting-bugs'), true);
  assert.strictEqual(isCrossBundle('bundle-name:skill-name'), true);
});

test('isCrossBundle: returns false for non-cross-bundle', () => {
  assert.strictEqual(isCrossBundle('https://example.com'), false);
  assert.strictEqual(isCrossBundle('./file.md'), false);
  assert.strictEqual(isCrossBundle('#section'), false);
  assert.strictEqual(isCrossBundle('just-text'), false);
});

/* ---------- loadBundles tests ---------- */

test('loadBundles: loads and parses bundles.yaml', () => {
  const bundles = loadBundles();

  assert.ok(bundles);
  assert.ok(typeof bundles === 'object');
  // Should have at least one bundle
  assert.ok(Object.keys(bundles).length > 0);
});

/* ---------- validateCrossBundle tests ---------- */

test('validateCrossBundle: returns true for valid bundle:skill', () => {
  const bundles = loadBundles();

  // Find a valid bundle and skill from bundles.yaml
  const bundleName = Object.keys(bundles)[0] as string;
  const bundle = bundles[bundleName];

  if (bundle?.skills && bundle.skills.length > 0) {
    const skillRef = bundle.skills[0];
    const url = `${bundleName}:${skillRef}`;
    assert.strictEqual(validateCrossBundle(url, bundles), true);
  }
});

test('validateCrossBundle: returns false for invalid bundle', () => {
  const bundles = loadBundles();

  assert.strictEqual(validateCrossBundle('non-existent-bundle:skill', bundles), false);
});

test('validateCrossBundle: returns false for invalid skill in valid bundle', () => {
  const bundles = loadBundles();

  const bundleName = Object.keys(bundles)[0] as string;
  assert.strictEqual(validateCrossBundle(`${bundleName}:non-existent-skill`, bundles), false);
});

test('validateCrossBundle: handles agents, knowledge, hooks', () => {
  const bundles = loadBundles();

  // Find a bundle with agents
  for (const [bundleName, bundle] of Object.entries(bundles) as [string, { agents?: string[] }][]) {
    if (bundle.agents && bundle.agents.length > 0) {
      const agentRef = bundle.agents[0];
      const url = `${bundleName}:${agentRef}`;
      assert.strictEqual(validateCrossBundle(url, bundles), true);
      break;
    }
  }
});

/* ---------- getAllMdFiles tests ---------- */

test('getAllMdFiles: finds markdown files in directory', () => {
  const tmp = writeTmp('');
  try {
    // Create a test markdown file
    const testMdPath = path.join(tmp.tmpDir, 'test.md');
    fs.writeFileSync(testMdPath, '# Test');

    // Create a subdirectory with a markdown file
    const subDir = path.join(tmp.tmpDir, 'subdir');
    fs.mkdirSync(subDir);
    const subMdPath = path.join(subDir, 'sub.md');
    fs.writeFileSync(subMdPath, '# Sub');

    // Create a non-markdown file (should be ignored)
    fs.writeFileSync(path.join(tmp.tmpDir, 'ignore.txt'), 'text');

    const files = getAllMdFiles(tmp.tmpDir);

    assert.ok(files.length >= 2);
    assert.ok(files.some((f: string) => f.includes('test.md')));
    assert.ok(files.some((f: string) => f.includes('sub.md')));
  } finally {
    tmp.cleanup();
  }
});

test('getAllMdFiles: skips excluded directories', () => {
  const tmp = writeTmp('');
  try {
    // Create files in excluded directories
    const nodeModulesPath = path.join(tmp.tmpDir, 'node_modules', 'test.md');
    fs.mkdirSync(path.dirname(nodeModulesPath), { recursive: true });
    fs.writeFileSync(nodeModulesPath, '# Test');

    const pluginsPath = path.join(tmp.tmpDir, 'plugins', 'test.md');
    fs.mkdirSync(path.dirname(pluginsPath), { recursive: true });
    fs.writeFileSync(pluginsPath, '# Test');

    const validPath = path.join(tmp.tmpDir, 'valid.md');
    fs.writeFileSync(validPath, '# Valid');

    const files = getAllMdFiles(tmp.tmpDir);

    // Should not include files from excluded directories
    assert.ok(!files.some((f: string) => f.includes('node_modules')));
    assert.ok(!files.some((f: string) => f.includes('plugins')));
    // Should include valid file
    assert.ok(files.some((f: string) => f.includes('valid.md')));
  } finally {
    tmp.cleanup();
  }
});

/* ---------- Edge cases ---------- */

test('extractLinks: handles empty content', () => {
  const links = extractLinks('', 'test.md');
  assert.strictEqual(links.length, 0);
});

test('extractLinks: handles malformed markdown links', () => {
  // These should not crash, just be ignored
  const content = '[missing close paren';
  const links = extractLinks(content, 'test.md');
  assert.ok(Array.isArray(links));
});

test('isRelative: handles edge cases', () => {
  // Empty strings and whitespace are treated as relative (they'll be skipped during validation)
  assert.strictEqual(isRelative(''), true);
  assert.strictEqual(isRelative('   '), true);
  assert.strictEqual(isRelative('://example.com'), false);
});

test('isCrossBundle: handles edge cases', () => {
  assert.strictEqual(isCrossBundle(''), false);
  assert.strictEqual(isCrossBundle('bundle:'), false);
  assert.strictEqual(isCrossBundle(':skill'), false);
  assert.strictEqual(isCrossBundle('bundle:skill:extra'), true);
});

/* ---------- Integration: end-to-end validation ---------- */

test('E2E: validates actual repo links (dry-run mode)', () => {
  // This test verifies the script can run without errors on the actual repo
  const { spawnSync } = require('node:child_process');

  const result = spawnSync('node', [path.join(__dirname, 'validate-links.ts'), '--dry-run'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
  });

  assert.strictEqual(result.status, 0);
  assert.ok(result.stdout.includes('Would check'));
  assert.ok(result.stdout.includes('markdown files'));
});

test('E2E: validates actual repo links (check mode)', () => {
  const { spawnSync } = require('node:child_process');

  const result = spawnSync('node', [path.join(__dirname, 'validate-links.ts'), '--check'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
  });

  // Should exit 0 if all links are valid
  assert.strictEqual(result.status, 0);
  assert.ok(result.stdout.includes('Stats:'));
  assert.ok(result.stdout.includes('All'));
  assert.ok(result.stdout.includes('links are valid'));
});
